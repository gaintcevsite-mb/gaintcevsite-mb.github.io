/**
 * Guler Partners - Global JavaScript
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
        rootMargin: '0px',
        threshold: 0.15
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
                
                <a href="https://t.me/GulerPartners_bot" target="_blank" class="btn btn-primary" style="width: 100%; padding: 1.2rem; font-size: 1rem;" id="globalModalBtn">Apply via Telegram</a>
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
    
    selected.addEventListener('click', function(e) {
        e.stopPropagation();
        itemsContainer.classList.toggle('select-hide');
        this.classList.toggle('select-arrow-active');
    });
    
    items.forEach(item => {
        item.addEventListener('click', function(e) {
            selected.innerHTML = this.innerHTML;
            selected.classList.add('has-selection');
            selected.classList.remove('select-arrow-active');
            itemsContainer.classList.add('select-hide');
            
            // Generate a targeted message string to the bot
            const val = this.getAttribute('data-value');
            const encodedStartParam = encodeURIComponent('join_' + val.replace(/[^A-Za-z0-9]/g, ''));
            telegramBtn.href = `https://t.me/GulerPartners_bot?start=${encodedStartParam}`;
        });
    });
    
    // Close dropdown passing click outside
    document.addEventListener('click', function(e) {
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
        if(e.target === globalModal) {
            globalModal.classList.remove('active');
            itemsContainer.classList.add('select-hide');
            selected.classList.remove('select-arrow-active');
        }
    });

    partnerCtas.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (window.innerWidth > 1024) {
                e.preventDefault();
                globalModal.classList.add('active');
            }
        });
    });
}


// Global Contact Modal Logic
const contactCtas = document.querySelectorAll('.contact-cta');
if (contactCtas.length > 0) {
    const contactModalHtml = `
        <div class="modal-overlay" id="globalContactModal">
            <div class="modal-content" style="text-align: center; max-width: 400px; padding: 4rem 2rem;">
                <button class="modal-close" id="globalContactClose">×</button>
                <p class="mono" style="color: var(--accent-gold); margin-bottom: 1rem;">Direct Line</p>
                <h3 style="font-size: 2rem; margin-bottom: 0.5rem;">Get in Touch</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2.5rem; font-size: 1rem;">
                    Connect with our underwriting team directly via secure messenger.
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <a href="https://t.me/adam_guler" target="_blank" class="btn btn-secondary" style="width: 100%; justify-content: center; gap: 1rem;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0C5.371 0 0 5.371 0 12C0 18.629 5.371 24 12 24C18.629 24 24 18.629 24 12C24 5.371 18.629 0 12 0ZM18.337 7.734L15.356 21.802C15.132 22.809 14.536 23.057 13.693 22.583L9.103 19.202L6.892 21.332C6.647 21.577 6.442 21.782 5.968 21.782L6.297 17.113L14.793 9.434C15.163 9.105 14.713 8.921 14.221 9.25L3.719 15.865L-0.81 14.447C-1.796 14.139 -1.815 13.46 0.203 12.671L17.203 6.124C17.992 5.835 18.687 6.305 18.337 7.734Z" fill="var(--text-primary)"/>
                        </svg>
                        Telegram
                    </a>
                    <a href="#" class="btn btn-secondary" style="width: 100%; justify-content: center; gap: 1rem; opacity: 0.5; cursor: not-allowed;" onclick="event.preventDefault();">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--text-primary)" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.964 24h.024C18.618 24 24 18.622 24 11.996S18.618 0 11.988 0C5.362 0 0 5.378 0 12.004c0 2.112.553 4.195 1.594 6.012L.15 23.336l5.474-1.432C7.388 22.87 9.444 23.407 11.58 23.407h.024v.593Zm-6.521-5.698l-.443-.703a9.929 9.929 0 0 1-1.52-5.595C3.48 7.398 7.29 3.58 11.996 3.58c2.251 0 4.364.877 5.955 2.47a8.438 8.438 0 0 1 2.473 5.955c0 4.606-3.81 8.423-8.517 8.423h-.015c-1.895 0-3.766-.503-5.4-1.472l-.4-.236-4.004 1.05 1.064-3.903l-.009-.001Zm9.522-6.588c-.523-.261-3.097-1.532-3.575-1.706-.479-.176-.826-.261-1.173.261-.349.521-1.348 1.705-1.652 2.053-.305.348-.61.391-1.132.132-.522-.261-2.209-.815-4.212-2.603-1.558-1.39-2.61-3.107-2.915-3.629-.306-.522-.034-.805.228-1.065.234-.233.522-.609.782-.913.261-.305.348-.521.522-.87.174-.347.087-.652-.043-.912-.132-.262-1.176-2.831-1.611-3.877-.424-1.02-.853-.884-1.175-.901-.304-.015-.653-.015Sh1.002-.015c-.347 0-.913.13-1.39.652C1.652 4.14 0 5.706 0 8.841c0 3.136 1.871 6.16 2.133 6.508.261.348 4.439 6.776 10.748 9.502 1.503.649 2.678 1.037 3.593 1.328 1.512.482 2.889.414 3.974.252 1.222-.183 3.765-1.538 4.288-3.023.522-1.485.522-2.756.368-3.023-.153-.263-.52-.42-1.042-.682Z"/>
                        </svg>
                        WhatsApp
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
        if(e.target === contactModal) contactModal.classList.remove('active');
    });

    contactCtas.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            contactModal.classList.add('active');
        });
    });
}
