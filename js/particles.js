/**
 * CRYPEX — Custom iGaming Icon Decor
 * Places hand-designed icon PNGs as fixed background elements with CSS glow
 */
(function () {
    'use strict';

    const isMobile = window.innerWidth < 1024;
    const baseSize = isMobile ? '40px' : '100px';

    // Detect if we're in a language subfolder (e.g., /ru/, /es/) and fix image base path
    const scriptEls = document.querySelectorAll('script[src*="particles.js"]');
    const scriptSrc = scriptEls.length ? scriptEls[0].getAttribute('src') : '';
    const basePath = scriptSrc.startsWith('../') ? '../' : '';

    const icons = [
        { src: basePath + 'img/icons/spade.png', hue: 0 },
        { src: basePath + 'img/icons/heart.png', hue: 0 },
        { src: basePath + 'img/icons/dice.png', hue: 0 },
        { src: basePath + 'img/icons/slot.png', hue: 0 },
        { src: basePath + 'img/icons/sevens.png', hue: 0 },
        { src: basePath + 'img/icons/chip1.png', hue: 0 },
        { src: basePath + 'img/icons/crown.png', hue: 0 },
        { src: basePath + 'img/icons/lightning.png', hue: 0 },
    ];

    const NUM = icons.length;
    const cols = 4;
    const rows = Math.ceil(NUM / cols);

    // Container
    const container = document.createElement('div');
    container.id = 'icon-decor';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;overflow:hidden;';
    document.body.prepend(container);

    // Edge-only positions — avoid the center where text lives
    const edgePositions = [
        // Left edge
        { x: 3 + Math.random() * 9, y: 10 + Math.random() * 25 },
        { x: 2 + Math.random() * 10, y: 55 + Math.random() * 25 },
        // Right edge
        { x: 88 + Math.random() * 9, y: 8 + Math.random() * 25 },
        { x: 89 + Math.random() * 8, y: 50 + Math.random() * 30 },
        // Top corners
        { x: 15 + Math.random() * 15, y: 2 + Math.random() * 10 },
        { x: 70 + Math.random() * 15, y: 2 + Math.random() * 10 },
        // Bottom corners
        { x: 5 + Math.random() * 15, y: 82 + Math.random() * 12 },
        { x: 78 + Math.random() * 15, y: 82 + Math.random() * 12 },
    ];

    icons.forEach((icon, i) => {
        const pos = edgePositions[i % edgePositions.length];

        const el = document.createElement('img');
        el.src = icon.src;
        el.alt = '';
        el.draggable = false;

        const x = pos.x;
        const y = pos.y;

        // Random slight rotation
        const rot = (Math.random() - 0.5) * 20;

        // Random animation delay for staggered glow breathing
        const delay = (Math.random() * 8).toFixed(1);

        // Unique slow drift parameters per icon
        const driftX = Math.round((Math.random() - 0.5) * 300); // ±150px
        const driftY = Math.round((Math.random() - 0.5) * 200); // ±100px
        const driftDuration = (20 + Math.random() * 20).toFixed(0); // 20-40s
        const driftName = `iconDrift_${i}`;

        el.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            transform: translate(-50%, -50%) rotate(${rot}deg);
            width: ${baseSize};
            height: ${baseSize};
            object-fit: contain;
            opacity: ${isMobile ? '0.15' : '0.28'};
            filter: drop-shadow(0 0 12px rgba(212, 184, 149, 0.6));
            animation: iconGlow 10s ease-in-out infinite ${delay}s, ${driftName} ${driftDuration}s ease-in-out infinite;
            user-select: none;
        `;

        // Inject unique drift keyframes for this icon
        const driftStyle = document.createElement('style');
        driftStyle.textContent = `
            @keyframes ${driftName} {
                0%, 100% { transform: translate(-50%, -50%) rotate(${rot}deg) translate(0, 0); }
                25% { transform: translate(-50%, -50%) rotate(${rot}deg) translate(${driftX}px, ${-driftY}px); }
                50% { transform: translate(-50%, -50%) rotate(${rot + (Math.random() - 0.5) * 6}deg) translate(${-driftX * 0.7}px, ${driftY}px); }
                75% { transform: translate(-50%, -50%) rotate(${rot}deg) translate(${driftX * 0.5}px, ${driftY * 0.5}px); }
            }
        `;
        document.head.appendChild(driftStyle);

        container.appendChild(el);
    });

    // Inject glow keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes iconGlow {
            0%, 100% {
                opacity: 0.18;
                filter: drop-shadow(0 0 8px rgba(212, 184, 149, 0.3));
            }
            50% {
                opacity: 0.35;
                filter: drop-shadow(0 0 22px rgba(212, 184, 149, 0.7));
            }
        }
    `;
    document.head.appendChild(style);
})();
