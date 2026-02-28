import telebot
from telebot.types import ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove

TOKEN = '8617195820:AAHIqbHhfQpstsswgfrfK_lJTNCAt2F5C1g'
ADMIN_ID = 8253241623

bot = telebot.TeleBot(TOKEN)

# Dictionary to store user application data temporarily
user_data = {}

def create_keyboard(options):
    markup = ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    for option in options:
        markup.add(KeyboardButton(option))
    return markup

@bot.message_handler(commands=['start'])
def send_welcome(message):
    args = message.text.split()
    country = "Unknown"
    if len(args) > 1:
        param = args[1]
        if param.startswith('join_'):
            country = param[5:] # e.g., Pakistan
    
    chat_id = message.chat.id
    user_data[chat_id] = {'country': country, 'username': message.from_user.username}
    
    # Only Pakistan is fully supported right now
    if country.lower() == 'pakistan':
        msg = bot.send_message(
            chat_id, 
            f"Welcome! You are applying as a partner for 🇵🇰 Pakistan.\n\nPlease enter your full name:",
            reply_markup=ReplyKeyboardRemove()
        )
        bot.register_next_step_handler(msg, process_name_step)
    else:
        msg = bot.send_message(
            chat_id, 
            f"Welcome! You are applying as a partner for {country}.\n\nPlease enter your full name:",
            reply_markup=ReplyKeyboardRemove()
        )
        # Default global fallback, just collect name for now
        bot.register_next_step_handler(msg, process_name_step_global)

def process_name_step_global(message):
    chat_id = message.chat.id
    name = message.text
    user_data[chat_id]['name'] = name
    finish_application(chat_id)

def process_name_step(message):
    chat_id = message.chat.id
    name = message.text
    user_data[chat_id]['name'] = name
    
    msg = bot.send_message(
        chat_id, 
        "Do you have a PVT LTD in Pakistan?",
        reply_markup=create_keyboard(["Yes", "No"])
    )
    bot.register_next_step_handler(msg, process_pvt_ltd_step)

def process_pvt_ltd_step(message):
    chat_id = message.chat.id
    user_data[chat_id]['pvt_ltd'] = message.text
    
    msg = bot.send_message(
        chat_id, 
        "Do you have an API wallet? (JazzCash/EasyPaisa/Alfallah/Meezan)",
        reply_markup=create_keyboard(["Yes", "No"])
    )
    bot.register_next_step_handler(msg, process_api_wallet_step)

def process_api_wallet_step(message):
    chat_id = message.chat.id
    answer = message.text
    user_data[chat_id]['api_wallet'] = answer
    
    if answer.lower() == 'yes':
        msg = bot.send_message(
            chat_id, 
            "Which specific wallet do you have?",
            reply_markup=create_keyboard(["JazzCash", "EasyPaisa", "Alfallah", "Meezan"])
        )
        bot.register_next_step_handler(msg, process_wallet_type_step)
    else:
        user_data[chat_id]['wallet_type'] = "None"
        ask_experience(chat_id)

def process_wallet_type_step(message):
    chat_id = message.chat.id
    user_data[chat_id]['wallet_type'] = message.text
    ask_experience(chat_id)

def ask_experience(chat_id):
    msg = bot.send_message(
        chat_id, 
        "Have you had experience in similar work before?",
        reply_markup=create_keyboard(["Yes", "No"])
    )
    bot.register_next_step_handler(msg, process_exp_step)

def process_exp_step(message):
    chat_id = message.chat.id
    user_data[chat_id]['experience'] = message.text
    
    msg = bot.send_message(
        chat_id, 
        "How much time per day are you ready to dedicate to work?",
        reply_markup=create_keyboard(["1-2 hours", "2-4 hours", "4-6 hours"])
    )
    bot.register_next_step_handler(msg, process_time_step)

def process_time_step(message):
    chat_id = message.chat.id
    user_data[chat_id]['time'] = message.text
    finish_application(chat_id)

def finish_application(chat_id):
    data = user_data.get(chat_id, {})
    
    # Notify User
    bot.send_message(
        chat_id, 
        "Thank you! Your application has been submitted successfully. Our team will contact you soon.",
        reply_markup=ReplyKeyboardRemove()
    )
    
    # Notify Admin
    username = f"@{data.get('username')}" if data.get('username') else "No username"
    country = data.get('country', 'Unknown')
    
    if country.lower() == 'pakistan':
        admin_text = (
            f"🚨 <b>New Lead: {country}</b> 🚨\n\n"
            f"👤 <b>Name:</b> {data.get('name')}\n"
            f"📱 <b>Telegram:</b> {username}\n"
            f"🏢 <b>PVT LTD:</b> {data.get('pvt_ltd')}\n"
            f"💼 <b>API Wallet:</b> {data.get('api_wallet')} ({data.get('wallet_type')})\n"
            f"⭐️ <b>Experience:</b> {data.get('experience')}\n"
            f"⏱ <b>Time per day:</b> {data.get('time')}\n"
        )
    else:
        admin_text = (
            f"🚨 <b>New Lead: {country}</b> 🚨\n\n"
            f"👤 <b>Name:</b> {data.get('name')}\n"
            f"📱 <b>Telegram:</b> {username}\n"
        )
        
    try:
        bot.send_message(ADMIN_ID, admin_text, parse_mode='HTML')
    except Exception as e:
        print(f"Failed to send admin message: {e}")

if __name__ == '__main__':
    print("Bot is running...")
    bot.infinity_polling()
