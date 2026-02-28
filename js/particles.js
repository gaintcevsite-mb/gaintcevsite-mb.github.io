/**
 * Güler & Partners — Premium Particle Network Background
 * Renders a subtle, animated constellation of nodes connected by thin lines
 */
(function () {
    'use strict';

    // Don't run on mobile
    if (window.innerWidth < 1024) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:none;opacity:0.6;';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width, height, particles, mouse;

    const GOLD = { r: 212, g: 184, b: 149 };
    const MAX_PARTICLES = 50;
    const CONNECTION_DIST = 180;
    const MOUSE_DIST = 250;

    mouse = { x: -1000, y: -1000 };

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = Math.random() * 1.5 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            // Some particles are "bright" nodes
            this.isBright = Math.random() > 0.85;
            if (this.isBright) {
                this.radius = Math.random() * 2 + 1.5;
                this.opacity = Math.random() * 0.4 + 0.3;
                this.pulseSpeed = Math.random() * 0.02 + 0.01;
                this.pulsePhase = Math.random() * Math.PI * 2;
            }
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Gentle mouse repulsion
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_DIST && dist > 0) {
                const force = (MOUSE_DIST - dist) / MOUSE_DIST * 0.015;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }

            // Damping
            this.vx *= 0.999;
            this.vy *= 0.999;

            // Wrap around edges
            if (this.x < -50) this.x = width + 50;
            if (this.x > width + 50) this.x = -50;
            if (this.y < -50) this.y = height + 50;
            if (this.y > height + 50) this.y = -50;
        }

        draw() {
            let r = this.radius;
            let o = this.opacity;

            if (this.isBright) {
                // Pulsing glow for bright nodes
                const pulse = Math.sin(Date.now() * this.pulseSpeed + this.pulsePhase);
                r += pulse * 0.5;
                o += pulse * 0.15;

                // Glow ring
                ctx.beginPath();
                ctx.arc(this.x, this.y, r * 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${GOLD.r}, ${GOLD.g}, ${GOLD.b}, ${o * 0.08})`;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${GOLD.r}, ${GOLD.g}, ${GOLD.b}, ${o})`;
            ctx.fill();
        }
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < MAX_PARTICLES; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DIST) {
                    const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
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

        drawConnections();

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    window.addEventListener('resize', resize);

    init();
    animate();
})();
