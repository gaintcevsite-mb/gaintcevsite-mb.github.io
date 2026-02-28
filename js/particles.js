/**
 * Güler & Partners — Premium Animated Background
 * Smooth particle network + elegant font-rendered industry symbols
 */
(function () {
    'use strict';

    if (window.innerWidth < 1024) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:none;';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width, height, particles, glyphs, mouse;

    const GOLD = { r: 212, g: 184, b: 149 };
    const MAX_PARTICLES = 45;
    const CONNECTION_DIST = 200;
    const MOUSE_DIST = 250;
    const NUM_GLYPHS = 14;

    mouse = { x: -1000, y: -1000 };

    // ── Smooth Particle ──
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.25;
            this.vy = (Math.random() - 0.5) * 0.25;
            this.radius = Math.random() * 1.8 + 0.5;
            this.opacity = Math.random() * 0.35 + 0.15;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_DIST && dist > 0) {
                const force = (MOUSE_DIST - dist) / MOUSE_DIST * 0.01;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
            this.vx *= 0.999;
            this.vy *= 0.999;
            if (this.x < -50) this.x = width + 50;
            if (this.x > width + 50) this.x = -50;
            if (this.y < -50) this.y = height + 50;
            if (this.y > height + 50) this.y = -50;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${GOLD.r}, ${GOLD.g}, ${GOLD.b}, ${this.opacity})`;
            ctx.fill();
        }
    }

    // ── Font-rendered Industry Glyphs ──
    const SYMBOLS = ['♠', '♥', '♦', '♣', '♛', '⬡', '₿', '⚡', '$', '€', '♞', '⬢'];

    class Glyph {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.12;
            this.vy = (Math.random() - 0.5) * 0.12;
            this.char = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            this.size = Math.random() * 22 + 18; // 18-40px
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.001; // very slow rotation
            this.opacity = Math.random() * 0.06 + 0.04; // subtle: 4-10%
            // Very slow, smooth breathing — no flicker
            this.breathPhase = Math.random() * Math.PI * 2;
            this.breathSpeed = Math.random() * 0.0003 + 0.0002; // extremely slow
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotSpeed;
            if (this.x < -80) this.x = width + 80;
            if (this.x > width + 80) this.x = -80;
            if (this.y < -80) this.y = height + 80;
            if (this.y > height + 80) this.y = -80;
        }
        draw() {
            // Smooth sine breathing — no flicker, just a gentle swell
            const breath = Math.sin(Date.now() * this.breathSpeed + this.breathPhase);
            const alpha = this.opacity + breath * 0.025;
            if (alpha <= 0.005) return;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = alpha;
            ctx.font = `300 ${this.size}px 'Outfit', sans-serif`;
            ctx.fillStyle = `rgb(${GOLD.r}, ${GOLD.g}, ${GOLD.b})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.char, 0, 0);
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }

    // ── Core ──
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function init() {
        resize();
        particles = [];
        glyphs = [];
        for (let i = 0; i < MAX_PARTICLES; i++) particles.push(new Particle());
        for (let i = 0; i < NUM_GLYPHS; i++) glyphs.push(new Glyph());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    const opacity = (1 - dist / CONNECTION_DIST) * 0.2;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${GOLD.r}, ${GOLD.g}, ${GOLD.b}, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Layer 1: Glyphs (behind everything)
        glyphs.forEach(g => { g.update(); g.draw(); });

        // Layer 2: Connection lines
        drawConnections();

        // Layer 3: Particles on top
        particles.forEach(p => { p.update(); p.draw(); });

        requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    document.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });
    window.addEventListener('resize', resize);

    init();
    animate();
})();
