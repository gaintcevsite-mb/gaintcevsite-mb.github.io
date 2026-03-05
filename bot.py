import telebot
from telebot.types import ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove, InlineKeyboardMarkup, InlineKeyboardButton
import json
import os
import re

TOKEN = '8755781769:AAFcrjRrJy7DC5P9B_RBMbvIp41obawiFxU'
ADMIN_IDS = [8253241623, 7825089214]
CONFIG_FILE = 'bot_config.json'

bot = telebot.TeleBot(TOKEN)

# In-memory storage for User and Admin Flows
user_data = {}
admin_state = {}

# --- Config Persistence ---
def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            cfg = json.load(f)
            if "users" not in cfg:
                cfg["users"] = []
            return cfg
    return {"countries": {}, "users": []}

def save_config(cfg):
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(cfg, f, indent=4, ensure_ascii=False)

bot_config = load_config()

# --- Helpers ---
def create_reply_keyboard(options, row_width=2):
    markup = ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True, row_width=row_width)
    for opt in options:
        markup.add(KeyboardButton(opt))
    return markup

# --- Global Message Handler (State Machine) ---
@bot.message_handler(func=lambda m: True, content_types=['text'])
def global_text_router(message):
    chat_id = message.chat.id
    text = message.text
    
    # 1. Admin Reply Intercept
    if chat_id in ADMIN_IDS and message.reply_to_message is not None:
        return admin_reply_handler(message)
        
    # 2. Start Command Intercept (Resets everything)
    if text.startswith('/start'):
        # Clear any existing state safely
        if chat_id in user_data:
            del user_data[chat_id]
        if chat_id in admin_state:
             del admin_state[chat_id]
             
        args = text.split()
        deep_link_country = None
        if len(args) > 1:
            param = args[1]
            if param.startswith('join_'):
                deep_link_country = param[5:] # e.g., Pakistan
                
        user_data[chat_id] = {'username': message.from_user.username, 'answers': {}, 'state': 'init'}
        
        # Track unique user
        user_exists = any(u.get('chat_id') == chat_id for u in bot_config['users'])
        if not user_exists:
            bot_config['users'].append({
                'chat_id': chat_id,
                'username': message.from_user.username
            })
            save_config(bot_config)
        
        # Smart Country Matching (handle emojis in configured names)
        matched_country = None
        if deep_link_country:
            available_countries = list(bot_config.get('countries', {}).keys())
            search_str = deep_link_country.lower()
            for conf_c in available_countries:
                if search_str in conf_c.lower():
                    matched_country = conf_c
                    break
                    
        if matched_country:
            user_data[chat_id]['country'] = matched_country
            start_country_flow(chat_id, matched_country)
        else:
            available_countries = list(bot_config.get('countries', {}).keys())
            if not available_countries:
                bot.send_message(chat_id, "Welcome to CRYPEX! Applications are currently closed.")
                return
            
            user_data[chat_id]['state'] = 'awaiting_country'
            bot.send_message(
                chat_id,
                "Welcome to CRYPEX!\n\nPlease select your country to apply:",
                reply_markup=create_reply_keyboard(available_countries)
            )
        return

    # 3. Admin Command Intercept
    if text == '/admin':
        if chat_id in ADMIN_IDS:
            # Clear admin text state just in case
            if chat_id in admin_state:
                del admin_state[chat_id]
            show_admin_menu(chat_id)
        return

    # 4. Admin Setup States (Adding things)
    if chat_id in admin_state:
        state_obj = admin_state[chat_id]
        action = state_obj.get('action')
        
        if action == 'add_country':
            process_add_country(message)
            return
        elif action == 'add_q_text':
            process_add_question_text(message)
            return
        elif action == 'add_q_options':
            process_add_question_options(message)
            return
        elif action == 'add_q_cond_ask':
            process_cond_ask(message)
            return
        elif action == 'add_q_cond_select':
            process_cond_select(message)
            return
        elif action == 'add_q_cond_value':
            process_cond_value(message)
            return
        elif action == 'broadcast_msg':
            process_broadcast_msg(message)
            return
        elif action == 'edit_q_text':
            process_edit_q_text(message)
            return
        elif action == 'edit_q_options':
            process_edit_q_options(message)
            return

    # 5. Normal User Questionnaire States
    if chat_id in user_data:
        curr_state = user_data[chat_id].get('state')
        
        if curr_state == 'awaiting_country':
            process_country_selection(message)
            return
        elif curr_state == 'awaiting_name':
            process_name(message)
            return
        elif curr_state == 'awaiting_dynamic_answer':
            process_dynamic_answer(message)
            return


# --- Core User Flow Functions ---

def process_country_selection(message):
    chat_id = message.chat.id
    country = message.text
    if country not in bot_config.get('countries', {}):
        bot.send_message(chat_id, "Please select a valid country from the keyboard.")
        return
        
    user_data[chat_id]['country'] = country
    start_country_flow(chat_id, country)

def start_country_flow(chat_id, country):
    user_data[chat_id]['current_q_index'] = -1
    user_data[chat_id]['state'] = 'awaiting_name'
    
    bot.send_message(
        chat_id, 
        f"You are applying as a partner for {country}.\n\nPlease enter your full name:",
        reply_markup=ReplyKeyboardRemove()
    )

def process_name(message):
    chat_id = message.chat.id
    user_data[chat_id]['name'] = message.text
    ask_next_question(chat_id)

def ask_next_question(chat_id):
    data = user_data.get(chat_id)
    if not data: return
    
    country = data.get('country')
    questions = bot_config.get('countries', {}).get(country, [])
    
    next_index = data['current_q_index'] + 1
    
    while next_index < len(questions):
        q = questions[next_index]
        condition = q.get('condition')
        
        if condition:
            dep_index = condition.get('depends_on_index')
            expected = condition.get('expected_answer')
            actual_answer = data['answers'].get(str(dep_index))
            if actual_answer != expected:
                next_index += 1
                continue 
        break 
        
    if next_index >= len(questions):
        submit_application(chat_id)
        return
    
    data['current_q_index'] = next_index
    data['state'] = 'awaiting_dynamic_answer'
    q = questions[next_index]
    
    if q.get('options'):
        bot.send_message(
            chat_id,
            q['text'],
            reply_markup=create_reply_keyboard(q['options'])
        )
    else:
        bot.send_message(chat_id, q['text'], reply_markup=ReplyKeyboardRemove())

def process_dynamic_answer(message):
    chat_id = message.chat.id
    data = user_data.get(chat_id)
    if not data: return
    
    q_index = data['current_q_index']
    data['answers'][str(q_index)] = message.text
    ask_next_question(chat_id)

def submit_application(chat_id):
    data = user_data.get(chat_id)
    if not data: return
    
    name = data.get('name', 'N/A')
    country = data.get('country', 'N/A')
    username = f"@{data.get('username')}" if data.get('username') else 'N/A'
    
    questions = bot_config.get('countries', {}).get(country, [])
    answers_text = ""
    for i, q in enumerate(questions):
        ans = data['answers'].get(str(i), '⏭ Skipped (condition)')
        if ans != '⏭ Skipped (condition)' or not q.get('condition'):
             answers_text += f"🔹 <b>{q['text']}</b>\n{ans}\n\n"
            
    admin_text = (
        f"🚨 <b>Новая заявка CRYPEX: {country}</b> 🚨\n"
        f"<i>(ID: {chat_id})</i>\n\n"
        f"👤 <b>Имя:</b> {name}\n"
        f"📱 <b>Telegram:</b> {username}\n\n"
        f"📝 <b>Ответы:</b>\n{answers_text}"
        f"\n<i>Ответьте на это сообщение, чтобы написать кандидату.</i>"
    )
    
    try:
        for admin_id in ADMIN_IDS:
            bot.send_message(admin_id, admin_text, parse_mode='HTML')
    except Exception as e:
        print(f"Failed to send admin message: {e}")

    bot.send_message(chat_id, "✅ Your application has been submitted! We will review it and get back to you.", reply_markup=ReplyKeyboardRemove())
    del user_data[chat_id]

def admin_reply_handler(message):
    original = message.reply_to_message.text or ""
    match = re.search(r'\(ID:\s*(\d+)\)', original)
    if not match:
        bot.send_message(message.chat.id, "⚠️ Не удалось найти ID пользователя в исходном сообщении.")
        return
    user_chat_id = int(match.group(1))
    reply_text = f"✉️ <b>Сообщение от Администратора:</b>\n\n{message.text}"
    try:
        bot.send_message(user_chat_id, reply_text, parse_mode='HTML')
        bot.send_message(message.chat.id, "✅ Ответ отправлен.")
    except Exception:
        bot.send_message(message.chat.id, "❌ Ошибка при отправке ответа.")

# --- Admin Panel (Dynamic Constructor) ---

def show_admin_menu(chat_id):
    markup = InlineKeyboardMarkup(row_width=1)
    markup.add(
        InlineKeyboardButton("🌍 Управление странами", callback_data="admin_countries"),
        InlineKeyboardButton("� Статистика", callback_data="admin_stats"),
        InlineKeyboardButton("� Рассылка", callback_data="admin_broadcast"),
    )
    bot.send_message(chat_id, "⚙️ <b>Панель Администратора CRYPEX</b>", reply_markup=markup, parse_mode='HTML')

@bot.callback_query_handler(func=lambda call: call.data.startswith('admin_'))
def handle_admin_callbacks(call):
    if call.message.chat.id not in ADMIN_IDS: return
    
    action = call.data
    
    # --- Countries Management ---
    if action == 'admin_countries':
        show_countries_menu(call.message.chat.id)
    elif action == 'admin_add_country':
        admin_state[call.message.chat.id] = {'action': 'add_country'}
        bot.send_message(call.message.chat.id, "Введите название новой страны (например: Bangladesh 🇧🇩):")
    elif action.startswith('admin_country_'):
        country_name = action.replace('admin_country_', '')
        show_country_editor(call.message.chat.id, country_name)
    elif action.startswith('admin_delcountry_'):
        country_name = action.replace('admin_delcountry_', '')
        if country_name in bot_config['countries']:
            del bot_config['countries'][country_name]
            save_config(bot_config)
        bot.send_message(call.message.chat.id, f"✅ Страна '{country_name}' удалена.")
        show_countries_menu(call.message.chat.id)
    elif action.startswith('admin_addq_'):
        country_name = action.replace('admin_addq_', '')
        admin_state[call.message.chat.id] = {'action': 'add_q_text', 'country': country_name}
        bot.send_message(call.message.chat.id, f"Напишите текст нового вопроса для <b>{country_name}</b>:", parse_mode='HTML')
    
    # --- Question Edit Sub-Menu ---
    elif action.startswith('admin_editq_'):
        parts = action.replace('admin_editq_', '').rsplit('_', 1)
        country_name = parts[0]
        q_index = int(parts[1])
        show_question_edit_menu(call.message.chat.id, country_name, q_index)
    elif action.startswith('admin_editqtext_'):
        parts = action.replace('admin_editqtext_', '').rsplit('_', 1)
        country_name = parts[0]
        q_index = int(parts[1])
        admin_state[call.message.chat.id] = {'action': 'edit_q_text', 'country': country_name, 'q_index': q_index}
        bot.send_message(call.message.chat.id, "Отправьте новый текст для этого вопроса:")
    elif action.startswith('admin_editqopt_'):
        parts = action.replace('admin_editqopt_', '').rsplit('_', 1)
        country_name = parts[0]
        q_index = int(parts[1])
        admin_state[call.message.chat.id] = {'action': 'edit_q_options', 'country': country_name, 'q_index': q_index}
        bot.send_message(call.message.chat.id, "Отправьте новые варианты ответов, разделяя их через /\nНапример: Yes / No / Maybe")
    elif action.startswith('admin_delq_'):
        parts = action.replace('admin_delq_', '').rsplit('_', 1)
        country_name = parts[0]
        q_index = int(parts[1])
        questions = bot_config['countries'].get(country_name, [])
        if 0 <= q_index < len(questions):
            questions.pop(q_index)
            save_config(bot_config)
        bot.send_message(call.message.chat.id, "✅ Вопрос удалён.")
        show_country_editor(call.message.chat.id, country_name)
    
    # --- Stats ---
    elif action == 'admin_stats':
        num_users = len(bot_config.get('users', []))
        num_countries = len(bot_config.get('countries', {}))
        country_list = "\n".join([f"  • {c}" for c in bot_config.get('countries', {}).keys()]) or "  Нет стран"
        stats_text = (
            f"📊 <b>Статистика CRYPEX</b>\n\n"
            f"� Уникальных пользователей: <b>{num_users}</b>\n"
            f"🌍 Стран настроено: <b>{num_countries}</b>\n\n"
            f"<b>Страны:</b>\n{country_list}"
        )
        bot.send_message(call.message.chat.id, stats_text, parse_mode='HTML')
    
    # --- Broadcast ---
    elif action == 'admin_broadcast':
        admin_state[call.message.chat.id] = {'action': 'broadcast_msg'}
        bot.send_message(call.message.chat.id, "📢 Введите текст рассылки. Он будет отправлен всем пользователям бота:")

    bot.answer_callback_query(call.id)

# --- Admin Sub-Functions ---

def show_countries_menu(chat_id):
    markup = InlineKeyboardMarkup(row_width=1)
    for country in bot_config.get('countries', {}):
        markup.add(InlineKeyboardButton(f"📂 {country}", callback_data=f"admin_country_{country}"))
    markup.add(InlineKeyboardButton("➕ Добавить страну", callback_data="admin_add_country"))
    bot.send_message(chat_id, "🌍 <b>Управление странами</b>\nВыберите страну для редактирования:", reply_markup=markup, parse_mode='HTML')

def show_country_editor(chat_id, country_name):
    questions = bot_config['countries'].get(country_name, [])
    markup = InlineKeyboardMarkup(row_width=1)
    for i, q in enumerate(questions):
        label = q['text'][:40] + ('...' if len(q['text']) > 40 else '')
        cond_marker = " 🔗" if q.get('condition') else ""
        markup.add(InlineKeyboardButton(f"⚙️ В{i+1}: {label}{cond_marker}", callback_data=f"admin_editq_{country_name}_{i}"))
    markup.add(
        InlineKeyboardButton("➕ Добавить вопрос", callback_data=f"admin_addq_{country_name}"),
        InlineKeyboardButton("❌ Удалить страну", callback_data=f"admin_delcountry_{country_name}"),
    )
    bot.send_message(chat_id, f"📋 <b>Анкета: {country_name}</b>\n{len(questions)} вопрос(ов):", reply_markup=markup, parse_mode='HTML')

def show_question_edit_menu(chat_id, country_name, q_index):
    questions = bot_config['countries'].get(country_name, [])
    if q_index >= len(questions): return
    q = questions[q_index]
    
    opts_str = " / ".join(q.get('options', [])) if q.get('options') else "Нет кнопок"
    cond_str = ""
    if q.get('condition'):
        cond = q['condition']
        cond_str = f"\n🔗 Условие: если В{cond['depends_on_index']+1} = \"{cond['expected_answer']}\""
    
    text = (
        f"⚙️ <b>Вопрос В{q_index+1}</b>\n\n"
        f"📝 <b>Текст:</b> {q['text']}\n\n"
        f"🔘 <b>Варианты:</b> {opts_str}{cond_str}"
    )
    
    markup = InlineKeyboardMarkup(row_width=1)
    markup.add(
        InlineKeyboardButton("✏️ Изменить текст", callback_data=f"admin_editqtext_{country_name}_{q_index}"),
        InlineKeyboardButton("🔘 Изменить варианты", callback_data=f"admin_editqopt_{country_name}_{q_index}"),
        InlineKeyboardButton("🗑 Удалить вопрос", callback_data=f"admin_delq_{country_name}_{q_index}"),
        InlineKeyboardButton("⬅️ Назад", callback_data=f"admin_country_{country_name}"),
    )
    bot.send_message(chat_id, text, reply_markup=markup, parse_mode='HTML')

def process_add_country(message):
    chat_id = message.chat.id
    country_name = message.text.strip()
    if country_name not in bot_config['countries']:
        bot_config['countries'][country_name] = []
        save_config(bot_config)
    bot.send_message(chat_id, f"✅ Страна '{country_name}' добавлена!")
    if chat_id in admin_state:
        del admin_state[chat_id]
    show_country_editor(chat_id, country_name)

def process_add_question_text(message):
    chat_id = message.chat.id
    state = admin_state.get(chat_id)
    if not state: return
    state['q_text'] = message.text
    state['action'] = 'add_q_options'
    bot.send_message(chat_id, "Теперь введите варианты ответов через /\nНапример: Yes / No / Maybe\n\nИли отправьте 0 чтобы сделать вопрос без кнопок (свободный ввод).")

def process_add_question_options(message):
    chat_id = message.chat.id
    state = admin_state.get(chat_id)
    if not state: return
    
    country = state['country']
    q_text = state['q_text']
    
    if message.text.strip() == '0':
        options = []
    else:
        options = [o.strip() for o in message.text.split('/') if o.strip()]
    
    new_q = {"text": q_text}
    if options:
        new_q["options"] = options
    
    state['new_q'] = new_q
    state['action'] = 'add_q_cond_ask'
    
    bot.send_message(chat_id, "Этот вопрос зависит от ответа на другой?\n(Например, показывать только если на В2 ответили 'Yes')\n\nОтправьте <b>да</b> или <b>нет</b>:", parse_mode='HTML')

def process_cond_ask(message):
    chat_id = message.chat.id
    state = admin_state.get(chat_id)
    if not state: return
    
    if message.text.strip().lower() in ['да', 'yes']:
        country = state['country']
        questions = bot_config['countries'].get(country, [])
        if not questions:
            bot.send_message(chat_id, "В этой стране пока нет вопросов. Условие невозможно добавить.")
            finalize_add_question(chat_id)
            return
        
        q_list_text = "\n".join([f"  В{i+1}: {q['text'][:50]}" for i, q in enumerate(questions)])
        state['action'] = 'add_q_cond_select'
        bot.send_message(chat_id, f"Укажите <b>номер вопроса</b>, от которого зависит этот:\n\n{q_list_text}", parse_mode='HTML')
    else:
        finalize_add_question(chat_id)

def process_cond_select(message):
    chat_id = message.chat.id
    state = admin_state.get(chat_id)
    if not state: return
    
    try:
        dep_idx = int(message.text.strip()) - 1
    except ValueError:
        bot.send_message(chat_id, "Пожалуйста, введите число.")
        return
    
    country = state['country']
    questions = bot_config['countries'].get(country, [])
    if dep_idx < 0 or dep_idx >= len(questions):
        bot.send_message(chat_id, "Некорректный номер вопроса.")
        return
    
    state['cond_depends_on'] = dep_idx
    dep_q = questions[dep_idx]
    
    if dep_q.get('options'):
        opts = " / ".join(dep_q['options'])
        state['action'] = 'add_q_cond_value'
        bot.send_message(chat_id, f"Варианты В{dep_idx + 1}: {opts}\n\nВведите <b>точный ответ</b>, при котором показывать новый вопрос:", parse_mode='HTML')
    else:
        state['action'] = 'add_q_cond_value'
        bot.send_message(chat_id, "Введите <b>точный ответ</b>, при котором показывать новый вопрос:", parse_mode='HTML')

def process_cond_value(message):
    chat_id = message.chat.id
    state = admin_state.get(chat_id)
    if not state: return
    
    state['cond_expected_value'] = message.text.strip()
    
    new_q = state['new_q']
    if 'cond_depends_on' in state and 'cond_expected_value' in state:
        new_q['condition'] = {
            'depends_on_index': state['cond_depends_on'],
            'expected_answer': state['cond_expected_value']
        }
    finalize_add_question(chat_id)

def finalize_add_question(chat_id):
    state = admin_state.get(chat_id)
    if not state: return
    
    country = state['country']
    new_q = state['new_q']
    bot_config['countries'].setdefault(country, []).append(new_q)
    save_config(bot_config)
    
    bot.send_message(chat_id, f"✅ Вопрос добавлен в анкету для {country}!")
    if chat_id in admin_state:
        del admin_state[chat_id]
    show_country_editor(chat_id, country)

def process_edit_q_text(message):
    chat_id = message.chat.id
    state = admin_state.get(chat_id)
    if not state: return
    
    country = state['country']
    q_index = state['q_index']
    questions = bot_config['countries'].get(country, [])
    if q_index < len(questions):
        questions[q_index]['text'] = message.text
        save_config(bot_config)
        bot.send_message(chat_id, "✅ Текст вопроса обновлён!")
    if chat_id in admin_state:
        del admin_state[chat_id]
    show_question_edit_menu(chat_id, country, q_index)

def process_edit_q_options(message):
    chat_id = message.chat.id
    state = admin_state.get(chat_id)
    if not state: return
    
    country = state['country']
    q_index = state['q_index']
    questions = bot_config['countries'].get(country, [])
    
    new_options = [o.strip() for o in message.text.split('/') if o.strip()]
    if q_index < len(questions):
        questions[q_index]['options'] = new_options
        save_config(bot_config)
        bot.send_message(chat_id, "✅ Варианты ответов обновлены!")
    if chat_id in admin_state:
        del admin_state[chat_id]
    show_question_edit_menu(chat_id, country, q_index)

def process_broadcast_msg(message):
    chat_id = message.chat.id
    text = message.text
    users = bot_config.get('users', [])
    sent = 0
    failed = 0
    for u in users:
        try:
            bot.send_message(u['chat_id'], f"📢 {text}")
            sent += 1
        except:
            failed += 1
    
    bot.send_message(chat_id, f"📢 Рассылка завершена!\n✅ Доставлено: {sent}\n❌ Ошибок: {failed}")
    if chat_id in admin_state:
        del admin_state[chat_id]
    show_admin_menu(chat_id)

if __name__ == '__main__':
    print("CRYPEX Bot is running...")
    bot.infinity_polling(skip_pending=True)
