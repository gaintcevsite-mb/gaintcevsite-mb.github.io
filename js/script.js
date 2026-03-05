/**
 * CRYPEX - Global JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.style = ''; // Clear any inline styles
            navLinks.classList.toggle('nav-active');
            if (navLinks.classList.contains('nav-active')) {
                mobileMenuBtn.innerHTML = '✕';
                document.body.style.overflow = 'hidden';
            } else {
                mobileMenuBtn.innerHTML = '☰';
                document.body.style.overflow = '';
            }
        });
    }

    // Scroll Animation Observer (Fade In Up)
    const observerOptions = {
        root: null,
        rootMargin: '150px', // Trigger animation before it fully enters viewport
        threshold: 0
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Run once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // Fallback: auto-show everything after a short delay so user doesn't have to scroll
    setTimeout(() => {
        fadeElements.forEach(el => {
            el.classList.add('visible');
            observer.unobserve(el);
        });
    }, 500);

    // Add small delay for staggered load of hero elements if they exist
    const heroElements = document.querySelectorAll('.hero .fade-in-up');
    heroElements.forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.1}s`;
    });
});


// Global Partner Modal Logic
const partnerCtas = document.querySelectorAll('.partner-cta');
if (partnerCtas.length > 0) {
    const countries = [
        ["🇵🇰", "Pakistan"], ["🇧🇩", "Bangladesh"], ["🇹🇳", "Tunisia"], ["🇪🇹", "Ethiopia"],
        ["🇪🇬", "Egypt"], ["🇧🇹", "Bhutan"], ["🇨🇷", "Costa-Rica"], ["🇦🇷", "Argentina"],
        ["🇪🇨", "Ecuador"], ["🇩🇴", "Dominican Republic"], ["🇭🇳", "Honduras"], ["🇸🇻", "El Salvador"],
        ["🇵🇦", "Panama"], ["🇵🇾", "Paraguay"], ["🇺🇾", "Uruguay"], ["🇯🇲", "Jamaica"],
        ["🇳🇵", "Nepal"], ["🇬🇹", "Guatemala"], ["🇰🇭", "Cambodia"], ["🇮🇳", "India"],
        ["🇩🇿", "Algeria"], ["🇸🇳", "Senegal"], ["🇲🇱", "Mali"], ["🇬🇳", "Guinea"],
        ["🇧🇳", "Brunei"], ["🇵🇬", "Papua New Guinea"], ["🇰🇪", "Kenya"], ["🇱🇰", "Sri Lanka"],
        ["🇧🇭", "Bahrain"], ["🇳🇮", "Nicaragua"], ["🇱🇦", "Laos"], ["🇲🇲", "Myanmar"]
    ];

    let optionsHtml = '';
    countries.forEach(c => {
        optionsHtml += `<div data-value="${c[0]} ${c[1]}">${c[0]} ${c[1]}</div>`;
    });

    const modalHtml = `
        <div class="modal-overlay" id="globalPartnerModal">
            <div class="modal-content">
                <button class="modal-close" id="globalModalClose">×</button>
                <p class="mono" style="color: var(--accent-gold); margin-bottom: 1rem;">Partnership Application</p>
                <h3 style="font-size: 2rem; margin-bottom: 1.5rem;">Select Region</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2.5rem; font-size: 1.1rem;">
                    Select your operational region to proceed to the Telegram application process.
                </p>
                
                <div class="form-group" style="margin-bottom: 2rem;">
                    <div class="custom-select" id="customCountrySelect">
                        <div class="select-selected">Select your target market...</div>
                        <div class="select-items select-hide">
                            ${optionsHtml}
                        </div>
                    </div>
                </div>
                
                <a href="https://t.me/crypexlead_bot" target="_blank" class="btn btn-primary" style="width: 100%; padding: 1.2rem; font-size: 1rem;" id="globalModalBtn">Apply via Telegram</a>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const globalModal = document.getElementById('globalPartnerModal');
    const closeBtn = document.getElementById('globalModalClose');

    // Custom Select Logic
    const customSelect = document.getElementById('customCountrySelect');
    const selected = customSelect.querySelector('.select-selected');
    const itemsContainer = customSelect.querySelector('.select-items');
    const items = itemsContainer.querySelectorAll('div');
    const telegramBtn = document.getElementById('globalModalBtn');

    selected.addEventListener('click', function (e) {
        e.stopPropagation();
        itemsContainer.classList.toggle('select-hide');
        this.classList.toggle('select-arrow-active');
    });

    items.forEach(item => {
        item.addEventListener('click', function (e) {
            selected.innerHTML = this.innerHTML;
            selected.classList.add('has-selection');
            selected.classList.remove('select-arrow-active');
            itemsContainer.classList.add('select-hide');

            // Generate a targeted message string to the bot
            const val = this.getAttribute('data-value');
            const encodedStartParam = encodeURIComponent('join_' + val.replace(/[^A-Za-z0-9]/g, ''));
            telegramBtn.href = `https://t.me/crypexlead_bot?start=${encodedStartParam}`;
        });
    });

    // Close dropdown passing click outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.custom-select')) {
            selected.classList.remove('select-arrow-active');
            itemsContainer.classList.add('select-hide');
        }
    });

    closeBtn.addEventListener('click', () => {
        globalModal.classList.remove('active');
        itemsContainer.classList.add('select-hide');
        selected.classList.remove('select-arrow-active');
    });

    globalModal.addEventListener('click', (e) => {
        if (e.target === globalModal) {
            globalModal.classList.remove('active');
            itemsContainer.classList.add('select-hide');
            selected.classList.remove('select-arrow-active');
        }
    });

    partnerCtas.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            globalModal.classList.add('active');
        });
    });
}


// Global Contact Modal Logic
const contactCtas = document.querySelectorAll('.contact-cta');
if (contactCtas.length > 0) {
    const contactModalHtml = `
        <div class="modal-overlay" id="globalContactModal">
            <div class="modal-content" style="text-align: center; max-width: 420px; padding: 3.5rem 2.5rem;">
                <button class="modal-close" id="globalContactClose">×</button>
                <p class="mono" style="color: var(--accent-gold); margin-bottom: 1rem; letter-spacing: 0.2em;">Direct Line</p>
                <h3 style="font-size: 2rem; margin-bottom: 0.5rem;">Get in Touch</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2.5rem; font-size: 1rem;">
                    Connect with our team directly via secure messenger.
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <a href="https://t.me/AydinKylich91" target="_blank" class="btn btn-secondary" style="width: 100%; justify-content: center; gap: 0.75rem; padding: 1.1rem 2rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.178c.1 0 .321.039.465.178a.636.636 0 0 1 .2.436c.011.108.026.313.015.497-.138 1.846-.735 6.322-1.039 8.389-.128.874-.381 1.167-.625 1.196-.533.062-1.012-.342-1.47-.711-1.105-.675-1.728-1.096-2.801-1.754-.627-.438-.375-.683.262-1.075.18-.165 3.302-3.027 3.362-3.286.008-.032.014-.152-.057-.216s-.174-.042-.249-.025c-.106.024-1.793 1.14-5.061 3.345-.479.329-.913.489-1.302.481-.429-.009-1.253-.242-1.865-.442-.751-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635z"/></svg>
                        Telegram
                    </a>
                    <a href="#" class="btn btn-secondary" style="width: 100%; justify-content: center; gap: 0.75rem; padding: 1.1rem 2rem; opacity: 0.4; cursor: not-allowed;" onclick="event.preventDefault();">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        WhatsApp <span style="font-size: 0.65rem; opacity: 0.7;">(soon)</span>
                    </a>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', contactModalHtml);

    const contactModal = document.getElementById('globalContactModal');
    const closeContactBtn = document.getElementById('globalContactClose');

    closeContactBtn.addEventListener('click', () => {
        contactModal.classList.remove('active');
    });

    contactModal.addEventListener('click', (e) => {
        if (e.target === contactModal) contactModal.classList.remove('active');
    });

    contactCtas.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            contactModal.classList.add('active');
        });
    });
}
