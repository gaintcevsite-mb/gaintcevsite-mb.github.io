// js/lang.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Google Translate Element
    const gtContainer = document.createElement('div');
    gtContainer.id = 'google_translate_element';
    gtContainer.style.position = 'absolute';
    gtContainer.style.left = '-9999px';
    gtContainer.style.top = '-9999px';
    gtContainer.style.zIndex = '-1';
    document.body.appendChild(gtContainer);

    // 2. Define the Init Callback BEFORE loading script
    window.googleTranslateElementInit = function () {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,ru,ur,bn,es',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
    };

    // 3. Load Google Translate Script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    // 4. Bind our custom UI to the Google Translate widget
    const customSwitcher = document.getElementById('lang-switcher');
    if (!customSwitcher) return;

    // Retrieve saved language
    const savedLang = localStorage.getItem('guler_lang') || 'en';
    if (savedLang !== 'en') {
        customSwitcher.value = savedLang;
        // Wait for GT to load
        setTimeout(() => triggerTranslation(savedLang), 1500);
    }

    customSwitcher.addEventListener('change', (e) => {
        const lang = e.target.value;
        localStorage.setItem('guler_lang', lang);
        triggerTranslation(lang);
    });

    function triggerTranslation(lang) {
        const gtIframe = document.querySelector('iframe.goog-te-menu-frame') || document.querySelector('iframe.goog-te-banner-frame');
        const gtSelect = document.querySelector('select.goog-te-combo');
        if (gtSelect) {
            gtSelect.value = lang;
            gtSelect.dispatchEvent(new Event('change'));
            console.log(`Translate language swapped to ${lang}`);
        } else {
            // Retry if not yet loaded
            setTimeout(() => triggerTranslation(lang), 500);
        }
    }
});
