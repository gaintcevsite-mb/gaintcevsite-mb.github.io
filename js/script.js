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
