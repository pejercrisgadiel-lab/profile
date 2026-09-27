/*
  Circuit-trace background effect.
  Usage:
    1. Add this to your HTML, right after <body>:
         <canvas id="circuit"></canvas>
    2. Add this CSS (already in your stylesheet if you used the index.html I sent):
         #circuit {
             position: fixed;
             inset: 0;
             z-index: 0;
             display: block;
             pointer-events: none;
         }
         .container-fluid { position: relative; z-index: 1; }
    3. Include this script before </body>:
         <script src="circuit.js"></script>
*/
(function () {
    const canvas = document.getElementById('circuit');
    if (!canvas) return; // page has no #circuit canvas, do nothing

    const ctx = canvas.getContext('2d');
    let w, h, nodes;

    const NODE_COUNT = 55;
    const LINK_DIST = 130;
    const MOUSE_RADIUS = 150;
    const RED_NODE_RATIO = 0.12; // small fraction of nodes pulse red, tying back to the UE brand color

    const mouse = { x: -9999, y: -9999 };

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    function initNodes() {
        nodes = Array.from({ length: NODE_COUNT }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.22,
            vy: (Math.random() - 0.5) * 0.22,
            r: Math.random() * 1.4 + 0.8,
            red: Math.random() < RED_NODE_RATIO
        }));
    }

    function step() {
        ctx.clearRect(0, 0, w, h);

        // links first so nodes sit on top
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i], b = nodes[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_DIST) {
                    const opacity = (1 - dist / LINK_DIST) * 0.16;
                    const usesRed = a.red || b.red;
                    ctx.strokeStyle = usesRed
                        ? `rgba(239,68,68,${opacity})`
                        : `rgba(241,245,249,${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        for (const n of nodes) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > w) n.vx *= -1;
            if (n.y < 0 || n.y > h) n.vy *= -1;

            const dx = n.x - mouse.x, dy = n.y - mouse.y;
            const distToMouse = Math.sqrt(dx * dx + dy * dy);
            const lit = distToMouse < MOUSE_RADIUS;

            ctx.beginPath();
            ctx.arc(n.x, n.y, lit ? n.r * 1.8 : n.r, 0, Math.PI * 2);
            if (n.red) {
                ctx.fillStyle = lit ? 'rgba(239,68,68,0.85)' : 'rgba(239,68,68,0.35)';
            } else {
                ctx.fillStyle = lit ? 'rgba(241,245,249,0.75)' : 'rgba(241,245,249,0.25)';
            }
            ctx.fill();
        }

        requestAnimationFrame(step);
    }

    resize();
    initNodes();
    requestAnimationFrame(step);
})();