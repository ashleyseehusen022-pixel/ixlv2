import { Game } from './types';

const GAME_CORE_SCRIPT = `
    <style>
        #mobile-controls {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            display: none;
            justify-content: space-between;
            align-items: flex-end;
            pointer-events: none;
            z-index: 1000;
        }
        .control-group { display: flex; gap: 10px; pointer-events: auto; }
        .v-btn {
            width: 60px;
            height: 60px;
            background: rgba(34, 197, 94, 0.2);
            border: 2px solid #22c55e;
            color: #22c55e;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            border-radius: 12px;
            user-select: none;
            touch-action: none;
        }
        .v-btn:active { background: #22c55e; color: #000; }
        .v-btn.action { background: rgba(234, 179, 8, 0.2); border-color: #eab308; color: #eab308; width: 80px; height: 80px; border-radius: 50%; }
        .v-btn.action:active { background: #eab308; color: #000; }

        /* Universal Save Button */
        #save-uplink {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 2000;
            background: rgba(0,0,0,0.8);
            border: 2px solid #22c55e;
            color: #22c55e;
            padding: 8px 16px;
            font-family: 'Archivo Black', sans-serif;
            font-size: 10px;
            font-weight: 900;
            font-style: italic;
            text-transform: uppercase;
            cursor: pointer;
            skew-x: -15deg;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            box-shadow: 0 0 15px rgba(34, 197, 94, 0.2);
        }
        #save-uplink:hover {
            background: #22c55e;
            color: #000;
            box-shadow: 0 0 25px rgba(34, 197, 94, 0.5);
        }
        #save-uplink:active {
            transform: scale(0.95) skew(-15deg);
        }
        #save-uplink .dot {
            width: 6px;
            height: 6px;
            background: #22c55e;
            border-radius: 50%;
            animation: pulse 1s infinite;
        }
        #save-uplink:hover .dot { background: #000; }

        #save-toast {
            position: fixed;
            top: 60px;
            right: 20px;
            background: #22c55e;
            color: #000;
            padding: 4px 12px;
            font-size: 8px;
            font-weight: 900;
            font-family: 'Archivo Black', sans-serif;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            z-index: 2000;
            text-transform: uppercase;
        }
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }
    </style>
    <div id="save-uplink" onclick="window.triggerSave()">
        <div class="dot"></div>
        <span>SAVE_UPLINK</span>
    </div>
    <div id="save-toast">PROGRESS_SECURED</div>
    <div id="mobile-controls">
        <div class="control-group">
            <div class="v-btn" id="btn-left">←</div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div class="v-btn" id="btn-up">↑</div>
                <div class="v-btn" id="btn-down">↓</div>
            </div>
            <div class="v-btn" id="btn-right">→</div>
        </div>
        <div class="control-group">
            <div class="v-btn action" id="btn-action">ACT</div>
        </div>
    </div>
    <script>
        window.gameSettings = {
            deviceMode: 'pc',
            neonIntensity: 0.6,
            invincible: false,
            gravity: 0.5,
            speed: 5,
            power: 1,
            torque: 1,
            bulletSpeed: 10,
            bulletSize: 1,
            fireRate: 200,
            rainbowMode: false,
            speedHack: 1,
            alwaysScore: false,
            ballSize: 10,
            nitro: 2,
            aiDifficulty: 0.5,
            autoFire: true,
            jumpStrength: 8,
            tripleShot: false,
            driftFactor: 1,
            slowMo: false,
            ballMagnet: false,
            paddleSize: 1,
            bounciness: 0.8,
            floatMode: false,
            ghostMode: false,
            magnetRange: 100,
            gapSize: 150,
            oneHitKill: false,
            infiniteTime: false,
            revealMines: false,
            infiniteLine: false,
            moneyMultiplier: 1,
            hookMagnet: false,
            infiniteMoney: false
        };

        window.triggerSave = () => {
            const toast = document.getElementById('save-toast');
            toast.style.opacity = '1';
            setTimeout(() => { toast.style.opacity = '0'; }, 2000);
            
            // Dispatch a global event for the game to handle
            window.dispatchEvent(new CustomEvent('saveRequest'));
            triggerSFX('score');
        };

        const vKeys = { up: false, down: false, left: false, right: false, action: false };
        window.virtualKeys = vKeys;

        const setupBtn = (id, key) => {
            const el = document.getElementById(id);
            if(!el) return;
            const start = (e) => { e.preventDefault(); vKeys[key] = true; triggerSFX('click'); };
            const end = (e) => { e.preventDefault(); vKeys[key] = false; };
            el.addEventListener('mousedown', start); el.addEventListener('mouseup', end);
            el.addEventListener('touchstart', start); el.addEventListener('touchend', end);
        };
        setupBtn('btn-up', 'up'); setupBtn('btn-down', 'down');
        setupBtn('btn-left', 'left'); setupBtn('btn-right', 'right');
        setupBtn('btn-action', 'action');

        window.addEventListener('message', (event) => {
            const data = event.data;
            if (data.type === 'SETTING_CHANGE') {
                if (data.key === 'deviceMode') {
                    const controls = document.getElementById('mobile-controls');
                    if(controls) controls.style.display = data.value === 'mobile' ? 'flex' : 'none';
                }
                if (data.key === 'neonIntensity') {
                    document.body.style.filter = 'brightness(' + (0.8 + data.value * 0.4) + ') saturate(' + (1.2 + data.value * 0.8) + ')';
                }
                window.gameSettings[data.key] = data.value;
                window.dispatchEvent(new CustomEvent('modChange', { detail: { key: data.key, value: data.value } }));
            }
        });

        const triggerSFX = (type) => {
            window.parent.postMessage({ type: 'SFX_TRIGGER', sound: type }, '*');
        };
    </script>
`;

const TINY_FISHING_CODE = `<!DOCTYPE html><html><head><style>
    body { margin: 0; background: #020617; overflow: hidden; font-family: 'Archivo Black', sans-serif; touch-action: none; color: #fff; } 
    canvas { display: block; width: 100vw; height: 100vh; cursor: crosshair; } 
    .ui { position: fixed; top: 20px; left: 20px; font-weight: 900; font-style: italic; font-size: 28px; color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.5); pointer-events: none; text-transform: uppercase; z-index: 50; }
    .upgrade-bar { position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; gap: 15px; z-index: 100; pointer-events: auto; background: rgba(0,0,0,0.8); padding: 15px; border: 2px solid rgba(34,197,94,0.3); backdrop-filter: blur(10px); skew: -5deg; }
    .upgrade-btn { background: #111; border: 2px solid #22c55e; color: #22c55e; padding: 10px 20px; cursor: pointer; display: flex; flex-direction: column; align-items: center; min-width: 120px; transition: all 0.2s; }
    .upgrade-btn:hover:not(:disabled) { background: #22c55e; color: #000; }
    .upgrade-btn:disabled { opacity: 0.3; border-color: #555; color: #555; cursor: not-allowed; }
    .upgrade-btn span { font-size: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
    .upgrade-btn strong { font-size: 14px; margin: 4px 0; }
    .upgrade-btn em { font-size: 10px; font-style: normal; color: #fbbf24; }
    .hidden { display: none !important; }
</style></head><body>
    <div class="ui" id="score">CASH: $0</div>
    <div id="upgrade-panel" class="upgrade-bar">
        <button id="up-depth" class="upgrade-btn" onclick="upgrade('depth')">
            <span>Length</span>
            <strong id="depth-val">100m</strong>
            <em id="depth-cost">$100</em>
        </button>
        <button id="up-strength" class="upgrade-btn" onclick="upgrade('strength')">
            <span>Strength</span>
            <strong id="strength-val">3 Fish</strong>
            <em id="strength-cost">$150</em>
        </button>
        <button id="up-passive" class="upgrade-btn" onclick="upgrade('passive')">
            <span>Passive</span>
            <strong id="passive-val">$0/min</strong>
            <em id="passive-cost">$200</em>
        </button>
    </div>
    <canvas id="game"></canvas>${GAME_CORE_SCRIPT}<script>
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let width, height;
const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
window.addEventListener('resize', resize);
resize();

// Persistent Progress
let cash = 0;
let levels = { depth: 1, strength: 1, passive: 0 };
let lastPassiveUpdate = Date.now();

// LOAD DATA
const savedData = localStorage.getItem('TINY_FISHING_SAVE');
if (savedData) {
    try {
        const parsed = JSON.parse(savedData);
        cash = parsed.cash || 0;
        levels = parsed.levels || { depth: 1, strength: 1, passive: 0 };
        console.log("SAVE_RESTORED_SUCCESSFULLY");
    } catch (e) { console.error("SAVE_CORRUPTED"); }
}

// SAVE DATA HANDLER
window.addEventListener('saveRequest', () => {
    localStorage.setItem('TINY_FISHING_SAVE', JSON.stringify({ cash, levels }));
});

const getUpgradeCost = (type) => {
    const base = type === 'depth' ? 100 : type === 'strength' ? 150 : 200;
    return Math.floor(base * Math.pow(1.5, levels[type]));
};

const upgrade = (type) => {
    const isInf = window.gameSettings.infiniteMoney;
    const cost = getUpgradeCost(type);
    
    if(isInf || cash >= cost) {
        if (!isInf) cash -= cost;
        levels[type]++;
        triggerSFX('score');
        updateUI();
    } else {
        triggerSFX('error');
    }
};

const updateUI = () => {
    const isInf = window.gameSettings.infiniteMoney;
    const scoreEl = document.getElementById('score');
    
    if (isInf) {
        scoreEl.innerText = 'CASH: $9999999';
        scoreEl.style.color = '#ef4444';
        scoreEl.style.textShadow = '0 0 15px rgba(239, 68, 68, 0.8)';
    } else {
        scoreEl.innerText = 'CASH: $' + Math.floor(cash);
        scoreEl.style.color = '#fbbf24';
        scoreEl.style.textShadow = '0 0 10px rgba(251, 191, 36, 0.5)';
    }

    document.getElementById('depth-val').innerText = (levels.depth * 50 + 100) + 'm';
    document.getElementById('depth-cost').innerText = isInf ? 'FREE' : '$' + getUpgradeCost('depth');
    document.getElementById('strength-val').innerText = (levels.strength + 2) + ' Fish';
    document.getElementById('strength-cost').innerText = isInf ? 'FREE' : '$' + getUpgradeCost('strength');
    document.getElementById('passive-val').innerText = '$' + (levels.passive * 10) + '/min';
    document.getElementById('passive-cost').innerText = isInf ? 'FREE' : '$' + getUpgradeCost('passive');
    
    ['depth', 'strength', 'passive'].forEach(t => {
        const btn = document.getElementById('up-' + t);
        btn.disabled = !isInf && cash < getUpgradeCost(t);
    });
};

window.addEventListener('modChange', (e) => {
    if (e.detail.key === 'infiniteMoney') updateUI();
});

let state = 'waiting';
let hook = { x: width/2, y: 50, depth: 50, spd: 5 };
let fishList = [];
let caughtFish = [];

function createFish(yMin = 200) {
    const depthScale = Math.min(yMin / 5000, 1);
    return {
        x: Math.random() * width,
        y: yMin + Math.random() * 1000,
        type: Math.random() > 0.8 ? 2 : Math.random() > 0.5 ? 1 : 0,
        val: Math.floor((Math.random() * 50 + 10) * (1 + depthScale * 5)),
        spd: (Math.random() - 0.5) * 4 * (1 + depthScale),
        size: 15 + Math.random() * 20
    };
}

for(let i=0; i<60; i++) fishList.push(createFish(Math.random() * 5000));

const tryCast = () => {
    if(state === 'waiting') {
        state = 'dropping';
        hook.depth = 50;
        caughtFish = [];
        document.getElementById('upgrade-panel').classList.add('hidden');
        triggerSFX('click');
    }
};

window.addEventListener('mousedown', (e) => {
    if (e.target.closest('.upgrade-btn') || e.target.closest('#save-uplink')) return;
    tryCast();
});
window.addEventListener('touchstart', (e) => {
    if (e.target.closest('.upgrade-btn') || e.target.closest('#save-uplink')) return;
    if (state === 'waiting') tryCast();
    else if (e.touches && e.touches[0]) window.mouseX = e.touches[0].clientX;
});
window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) window.mouseX = e.touches[0].clientX;
});

function loop() {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0,0,width,height);
    
    const now = Date.now();
    if(state === 'waiting') {
        const diff = (now - lastPassiveUpdate) / 1000;
        const income = (levels.passive * 10 / 60) * diff;
        if(income > 0) {
            cash += income * (window.gameSettings.moneyMultiplier || 1);
            updateUI();
        }
    }
    lastPassiveUpdate = now;
    
    let grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 100, width, height);

    if (window.virtualKeys.action) tryCast();

    if(state === 'dropping') {
        hook.depth += hook.spd * (window.gameSettings.speedHack || 1);
        const maxDepth = window.gameSettings.infiniteLine ? 100000 : (levels.depth * 50 + 100);
        if(hook.depth >= maxDepth) state = 'reeling';
    } else if(state === 'reeling') {
        hook.depth -= hook.spd * 1.5 * (window.gameSettings.speedHack || 1);
        if(hook.depth <= 50) {
            state = 'waiting';
            document.getElementById('upgrade-panel').classList.remove('hidden');
            let totalEarned = 0;
            caughtFish.forEach(f => totalEarned += f.val);
            cash += totalEarned * (window.gameSettings.moneyMultiplier || 1);
            updateUI();
            triggerSFX('score');
        }
    }

    if(state !== 'waiting') {
        if (window.virtualKeys.left) window.mouseX = (window.mouseX || width/2) - 10;
        if (window.virtualKeys.right) window.mouseX = (window.mouseX || width/2) + 10;
        let mx = window.mouseX || width/2;
        hook.x += (mx - hook.x) * 0.1;
    }

    window.onmousemove = e => window.mouseX = e.clientX;

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(hook.x, 0); ctx.lineTo(hook.x, 100); ctx.stroke();

    ctx.save();
    ctx.translate(0, -hook.depth + height/2);

    if(fishList.length < 100) fishList.push(createFish(hook.depth + 1000));

    fishList.forEach((f, i) => {
        f.x += f.spd;
        if(f.x < -100 || f.x > width + 100) f.spd *= -1;
        
        ctx.fillStyle = f.type === 0 ? '#22c55e' : f.type === 1 ? '#3b82f6' : '#fbbf24';
        ctx.beginPath(); ctx.ellipse(f.x, f.y, f.size, f.size/2, 0, 0, Math.PI*2); ctx.fill();

        if(state === 'reeling' && window.gameSettings.hookMagnet) {
            let dist = Math.hypot(f.x - hook.x, f.y - hook.depth);
            if(dist < 200) {
                f.x += (hook.x - f.x) * 0.05; f.y += (hook.depth - f.y) * 0.05;
            }
        }

        const maxFish = levels.strength + 2;
        if(state === 'reeling' && !caughtFish.includes(f) && caughtFish.length < maxFish) {
            let dist = Math.hypot(f.x - hook.x, f.y - hook.depth);
            if(dist < f.size + 15) {
                caughtFish.push(f);
                triggerSFX('click');
            }
        }
    });

    caughtFish.forEach((f, idx) => { f.x = hook.x; f.y = hook.depth + 20 + idx * 15; });

    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(hook.x, hook.depth - 20); ctx.lineTo(hook.x, hook.depth);
    ctx.arc(hook.x - 5, hook.depth, 5, 0, Math.PI); ctx.stroke();

    ctx.restore();

    if(state === 'waiting') {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = 'bold italic 24px Archivo Black';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK TO CAST', width/2, height/2 - 50);
    } else {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '14px Archivo Black';
        ctx.textAlign = 'center';
        ctx.fillText('DEPTH: ' + Math.floor(hook.depth) + 'm', width/2, 50);
    }

    requestAnimationFrame(loop);
}
loop();
updateUI();
</script></body></html>`;

const PHONK_MOTO_CODE = `<!DOCTYPE html><html><head><style>body { margin: 0; background: #020617; overflow: hidden; font-family: sans-serif; touch-action: none; color: #fff; } canvas { display: block; width: 100vw; height: 100vh; }</style></head><body><canvas id="game"></canvas>${GAME_CORE_SCRIPT}<script>const canvas = document.getElementById('game'); const ctx = canvas.getContext('2d'); let width, height; const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }; window.addEventListener('resize', resize); resize(); let bike = { x: 100, y: 300, rot: 0, vx: 0, vy: 0, vrot: 0 }; let keys = {}; window.onkeydown = e => keys[e.key.toLowerCase()] = true; window.onkeyup = e => keys[e.key.toLowerCase()] = false; let terrain = []; for(let i=0; i<500; i++) terrain.push({ x: i*150, y: 600 + Math.sin(i*0.4)*100 }); function loop() { ctx.fillStyle = '#020617'; ctx.fillRect(0,0,width,height); let g = window.gameSettings.floatMode ? 0.05 : (window.gameSettings.gravity || 0.5); if(keys['w'] || window.virtualKeys.up) { bike.vx += Math.cos(bike.rot)*0.5; bike.vy += Math.sin(bike.rot)*0.5; } bike.vy += g; bike.vx *= 0.98; bike.vy *= 0.98; bike.x += bike.vx; bike.y += bike.vy; if(keys['a'] || window.virtualKeys.left) bike.vrot -= 0.01; if(keys['d'] || window.virtualKeys.right) bike.vrot += 0.01; bike.rot += bike.vrot; bike.vrot *= 0.95; ctx.save(); ctx.translate(-bike.x + 200, 0); ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 5; ctx.beginPath(); terrain.forEach((p, i) => { if(i===0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }); ctx.stroke(); ctx.translate(bike.x, bike.y); ctx.rotate(bike.rot); ctx.fillStyle = '#22c55e'; ctx.fillRect(-20,-5,40,10); ctx.restore(); requestAnimationFrame(loop); } loop();</script></body></html>`;

const PHONK_RIVALS_CODE = `<!DOCTYPE html><html><head><style>body { margin: 0; background: #000; overflow: hidden; font-family: sans-serif; cursor: crosshair; } canvas { display: block; width: 100vw; height: 100vh; }</style></head><body><canvas id="game"></canvas>${GAME_CORE_SCRIPT}<script>const canvas = document.getElementById('game'); const ctx = canvas.getContext('2d'); let width, height; const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }; window.addEventListener('resize', resize); resize(); let player = { x: width/2, y: height/2, size: 20 }; let enemies = []; let bullets = []; let keys = {}; window.onkeydown = e => keys[e.key.toLowerCase()] = true; window.onkeyup = e => keys[e.key.toLowerCase()] = false; const shoot = (x, y) => { const angle = Math.atan2(y - player.y, x - player.x); bullets.push({ x: player.x, y: player.y, vx: Math.cos(angle)*10, vy: Math.sin(angle)*10 }); triggerSFX('click'); }; window.onmousedown = e => shoot(e.clientX, e.clientY); function loop() { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0,0,width,height); if(keys['w'] || window.virtualKeys.up) player.y -= 5; if(keys['s'] || window.virtualKeys.down) player.y += 5; if(keys['a'] || window.virtualKeys.left) player.x -= 5; if(keys['d'] || window.virtualKeys.right) player.x += 5; if(window.virtualKeys.action) shoot(player.x, player.y - 100); ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(player.x, player.y, player.size, 0, Math.PI*2); ctx.fill(); bullets = bullets.filter(b => { b.x += b.vx; b.y += b.vy; ctx.fillStyle = '#fbbf24'; ctx.fillRect(b.x-2, b.y-2, 4, 4); return b.x > 0 && b.x < width && b.y > 0 && b.y < height; }); if(Math.random() < 0.05) enemies.push({ x: Math.random()*width, y: -20, speed: 2 }); enemies.forEach((e, i) => { e.y += e.speed; ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(e.x, e.y, 15, 0, Math.PI*2); ctx.fill(); bullets.forEach((b, bi) => { if(Math.hypot(b.x-e.x, b.y-e.y) < 15) { enemies.splice(i, 1); bullets.splice(bi, 1); triggerSFX('score'); } }); }); requestAnimationFrame(loop); } loop();</script></body></html>`;

const PHONK_BOXING_CODE = `<!DOCTYPE html><html><head><style>body { margin: 0; background: #000; overflow: hidden; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; } canvas { border: 2px solid #22c55e; }</style></head><body><canvas id="game"></canvas>${GAME_CORE_SCRIPT}<script>const canvas = document.getElementById('game'); const ctx = canvas.getContext('2d'); canvas.width = 600; canvas.height = 400; let p1 = { x: 100, y: 200, v: 0, punch: 0 }; let ai = { x: 500, y: 200, v: 0, punch: 0 }; window.onkeydown = e => { if(e.key === ' ') p1.punch = 10; }; function loop() { ctx.fillStyle = '#020617'; ctx.fillRect(0,0,600,400); if(window.virtualKeys.action) p1.punch = 10; if(p1.punch > 0) p1.punch--; if(ai.punch > 0) ai.punch--; if(Math.random() < 0.02) ai.punch = 10; ctx.fillStyle = '#22c55e'; ctx.fillRect(p1.x, p1.y, 40, 60); if(p1.punch > 0) ctx.fillRect(p1.x + 40, p1.y + 10, 30, 15); ctx.fillStyle = '#ef4444'; ctx.fillRect(ai.x - 40, ai.y, 40, 60); if(ai.punch > 0) ctx.fillRect(ai.x - 70, ai.y + 10, 30, 15); requestAnimationFrame(loop); } loop();</script></body></html>`;

const NEON_BREAKER_CODE = `<!DOCTYPE html><html><head><style>body { margin: 0; background: #000; overflow: hidden; font-family: sans-serif; }</style></head><body><canvas id="game"></canvas>${GAME_CORE_SCRIPT}<script>const canvas = document.getElementById('game'); const ctx = canvas.getContext('2d'); let width, height; const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }; window.addEventListener('resize', resize); resize(); let pad = { x: width/2, w: 100 }; let ball = { x: width/2, y: height-100, vx: 5, vy: -5, r: 10 }; let bricks = []; for(let i=0; i<8; i++) for(let j=0; j<5; j++) bricks.push({ x: i*width/8 + 10, y: j*40 + 50, w: width/8 - 20, h: 20, alive: true }); window.onmousemove = e => pad.x = e.clientX; function loop() { ctx.fillStyle = '#020617'; ctx.fillRect(0,0,width,height); if(window.virtualKeys.left) pad.x -= 10; if(window.virtualKeys.right) pad.x += 10; ball.x += ball.vx; ball.y += ball.vy; if(ball.x < 0 || ball.x > width) ball.vx *= -1; if(ball.y < 0) ball.vy *= -1; if(ball.y > height - 40 && ball.x > pad.x - pad.w/2 && ball.x < pad.x + pad.w/2) { ball.vy *= -1; triggerSFX('bounce'); } bricks.forEach(b => { if(b.alive && ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) { b.alive = false; ball.vy *= -1; triggerSFX('score'); } if(b.alive) { ctx.fillStyle = '#3b82f6'; ctx.fillRect(b.x, b.y, b.w, b.h); } }); ctx.fillStyle = '#22c55e'; ctx.fillRect(pad.x-pad.w/2, height-30, pad.w, 15); ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill(); requestAnimationFrame(loop); } loop();</script></body></html>`;

const CYBER_BOWL_CODE = `<!DOCTYPE html><html><head><style>body { margin: 0; background: #000; overflow: hidden; font-family: sans-serif; }</style></head><body><canvas id="game"></canvas>${GAME_CORE_SCRIPT}<script>const canvas = document.getElementById('game'); const ctx = canvas.getContext('2d'); let width, height; const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }; window.addEventListener('resize', resize); resize(); let ball = { x: width/2, y: height-100, vx: 0, vy: 0, active: false }; let pins = []; for(let i=0; i<4; i++) for(let j=0; j<=i; j++) pins.push({ x: width/2 - (i*20) + (j*40), y: 150 - (i*30), hit: false }); window.onmousedown = e => { if(!ball.active) { ball.vx = (e.clientX - ball.x)*0.1; ball.vy = (e.clientY - ball.y)*0.1; ball.active = true; } }; function loop() { ctx.fillStyle = '#020617'; ctx.fillRect(0,0,width,height); if(window.virtualKeys.action && !ball.active) { ball.vx = 0; ball.vy = -15; ball.active = true; } if(ball.active) { ball.x += ball.vx; ball.y += ball.vy; ball.vx *= 0.99; ball.vy *= 0.99; pins.forEach(p => { if(!p.hit && Math.hypot(p.x-ball.x, p.y-ball.y) < 25) { p.hit = true; triggerSFX('score'); } }); } ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(ball.x, ball.y, 15, 0, Math.PI*2); ctx.fill(); pins.forEach(p => { if(!p.hit) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill(); } }); requestAnimationFrame(loop); } loop();</script></body></html>`;

const PHONK_TETRIS_CODE = `<!DOCTYPE html><html><head><style>body { margin: 0; background: #000; overflow: hidden; display: flex; justify-content: center; align-items: center; height: 100vh; }</style></head><body><canvas id="game"></canvas>${GAME_CORE_SCRIPT}<script>const canvas = document.getElementById('game'); const ctx = canvas.getContext('2d'); canvas.width = 240; canvas.height = 400; const grid = 20; let arena = Array(20).fill().map(() => Array(12).fill(0)); let player = { pos: {x: 5, y: 0}, matrix: [[1,1],[1,1]] }; function draw() { ctx.fillStyle = '#020617'; ctx.fillRect(0,0,240,400); player.matrix.forEach((row, y) => row.forEach((val, x) => { if(val) { ctx.fillStyle = '#22c55e'; ctx.fillRect((player.pos.x+x)*grid, (player.pos.y+y)*grid, grid-1, grid-1); } })); } function loop() { draw(); if(window.virtualKeys.left) player.pos.x -= 0.1; if(window.virtualKeys.right) player.pos.x += 0.1; player.pos.y += 0.05; if(player.pos.y > 18) player.pos.y = 0; requestAnimationFrame(loop); } loop();</script></body></html>`;

const PHONK_MINES_CODE = `<!DOCTYPE html><html><head><style>body { margin: 0; background: #020617; display: flex; justify-content: center; align-items: center; height: 100vh; color: #fff; font-family: monospace; } .grid { display: grid; grid-template-columns: repeat(10, 30px); gap: 2px; }</style></head><body><div class="grid" id="grid"></div>${GAME_CORE_SCRIPT}<script>const grid = document.getElementById('grid'); let mines = Array(100).fill(0).map(() => Math.random() < 0.15 ? 1 : 0); mines.forEach((m, i) => { const cell = document.createElement('div'); cell.style.width = '30px'; cell.style.height = '30px'; cell.style.background = '#166534'; cell.onclick = () => { if(m) { cell.style.background = 'red'; triggerSFX('error'); } else { cell.style.background = '#22c55e'; triggerSFX('score'); } }; grid.appendChild(cell); });</script></body></html>`;

const DRIFT_KING_CODE = `<!DOCTYPE html><html><head><style>body { margin: 0; background: #000; overflow: hidden; }</style></head><body><canvas id="game"></canvas>${GAME_CORE_SCRIPT}<script>const canvas = document.getElementById('game'); const ctx = canvas.getContext('2d'); let width, height; const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }; window.addEventListener('resize', resize); resize(); let car = { x: width/2, y: height/2, rot: 0, spd: 0 }; let keys = {}; window.onkeydown = e => keys[e.key] = true; window.onkeyup = e => keys[e.key] = false; function loop() { ctx.fillStyle = '#020617'; ctx.fillRect(0,0,width,height); if(keys['w'] || window.virtualKeys.up) car.spd += 0.2; else car.spd *= 0.98; if(keys['a'] || window.virtualKeys.left) car.rot -= 0.05; if(keys['d'] || window.virtualKeys.right) car.rot += 0.05; car.x += Math.cos(car.rot)*car.spd; car.y += Math.sin(car.rot)*car.spd; ctx.save(); ctx.translate(car.x, car.y); ctx.rotate(car.rot); ctx.fillStyle = '#22c55e'; ctx.fillRect(-20,-10,40,20); ctx.restore(); requestAnimationFrame(loop); } loop();</script></body></html>`;

export const MOCK_GAMES: Game[] = [
  { id: 'tiny-fishing', title: 'TINY FISHING', description: 'Catch neon fish in the deep phonk ocean.', thumbnail: 'https://images.unsplash.com/photo-1544551763-47a0159f9234?q=80&w=400', url: '', category: 'Arcade', tags: ['fishing', 'clicker'], isInternal: true, internalCode: TINY_FISHING_CODE },
  { id: 'phonk-rivals', title: 'PHONK RIVALS', description: 'Arena shooter. Dominate the grid.', thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400', url: '', category: 'Action', tags: ['shooter'], isInternal: true, internalCode: PHONK_RIVALS_CODE },
  { id: 'drift-king', title: 'DRIFT KING', description: 'Top-down neon drift simulator.', thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=400', url: '', category: 'Arcade', tags: ['drift'], isInternal: true, internalCode: DRIFT_KING_CODE },
  { id: 'neon-breaker', title: 'NEON BREAKER', description: 'Classic block breaker, neon style.', thumbnail: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=400', url: '', category: 'Arcade', tags: ['classic'], isInternal: true, internalCode: NEON_BREAKER_CODE },
  { id: 'phonk-boxing', title: 'PHONK BOXING', description: '1v1 physics fighting.', thumbnail: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=400', url: '', category: 'Action', tags: ['boxing'], isInternal: true, internalCode: PHONK_BOXING_CODE },
  { id: 'cyber-bowl', title: 'CYBER BOWL', description: 'Neon physics bowling.', thumbnail: 'https://images.unsplash.com/photo-1538510166362-dfb83f5b9743?q=80&w=400', url: '', category: 'Arcade', tags: ['sports'], isInternal: true, internalCode: CYBER_BOWL_CODE },
  { id: 'phonk-tetris', title: 'PHONK TETRIS', description: 'Block stacking madness.', thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400', url: '', category: 'Puzzle', tags: ['puzzle'], isInternal: true, internalCode: PHONK_TETRIS_CODE },
  { id: 'phonk-mines', title: 'PHONK MINES', description: 'Neon minesweeper clone.', thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400', url: '', category: 'Puzzle', tags: ['puzzle'], isInternal: true, internalCode: PHONK_MINES_CODE },
  { id: 'phonk-moto', title: 'PHONK MOTO X', description: 'Physics bike stunts.', thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=400', url: '', category: 'Arcade', tags: ['bike'], isInternal: true, internalCode: PHONK_MOTO_CODE }
];

export const CATEGORIES = ['All', 'Classic', 'Action', 'Puzzle', 'Arcade', 'AI-Gen'];

export const MOD_CONFIGS: Record<string, any[]> = {
  'tiny-fishing': [
    { key: 'deviceMode', label: 'MOBILE_LINK', type: 'select', options: ['pc', 'mobile'] },
    { key: 'infiniteMoney', label: 'DEV_INF_CASH', type: 'toggle', devOnly: true },
    { key: 'infiniteLine', label: 'INFINITY_HOOK', type: 'toggle' },
    { key: 'moneyMultiplier', label: 'CASH_HACK', type: 'range', min: 1, max: 100, step: 5 },
    { key: 'hookMagnet', label: 'HOOK_MAGNET', type: 'toggle' }
  ],
  'phonk-rivals': [
    { key: 'deviceMode', label: 'MOBILE_LINK', type: 'select', options: ['pc', 'mobile'] },
    { key: 'fireRate', label: 'RAPID_FIRE', type: 'range', min: 50, max: 1000, step: 50 },
    { key: 'bulletSize', label: 'CANNON_SIZE', type: 'range', min: 1, max: 10, step: 1 },
    { key: 'invincible', label: 'GOD_MODE', type: 'toggle' }
  ],
  'drift-king': [
    { key: 'deviceMode', label: 'MOBILE_LINK', type: 'select', options: ['pc', 'mobile'] },
    { key: 'nitro', label: 'NITRO_THRUST', type: 'range', min: 1, max: 10, step: 0.5 },
    { key: 'driftFactor', label: 'DRIFT_SLIDE', type: 'range', min: 0.5, max: 5, step: 0.5 }
  ],
  'neon-breaker': [
    { key: 'deviceMode', label: 'MOBILE_LINK', type: 'select', options: ['pc', 'mobile'] },
    { key: 'paddleSize', label: 'EXTEND_PAD', type: 'range', min: 0.5, max: 3, step: 0.1 },
    { key: 'ballSize', label: 'GIANT_BALL', type: 'range', min: 5, max: 50, step: 5 }
  ],
  'phonk-boxing': [
    { key: 'deviceMode', label: 'MOBILE_LINK', type: 'select', options: ['pc', 'mobile'] },
    { key: 'oneHitKill', label: 'INSTA_K_O', type: 'toggle' },
    { key: 'power', label: 'PUNCH_FORCE', type: 'range', min: 1, max: 10, step: 1 }
  ],
  'cyber-bowl': [
    { key: 'deviceMode', label: 'MOBILE_LINK', type: 'select', options: ['pc', 'mobile'] },
    { key: 'ballMagnet', label: 'PIN_MAGNET', type: 'toggle' },
    { key: 'alwaysScore', label: 'STRIKE_HACK', type: 'toggle' }
  ],
  'phonk-tetris': [
    { key: 'deviceMode', label: 'MOBILE_LINK', type: 'select', options: ['pc', 'mobile'] },
    { key: 'speedHack', label: 'TIME_STOP', type: 'range', min: 0.1, max: 2, step: 0.1 }
  ],
  'phonk-mines': [
    { key: 'deviceMode', label: 'MOBILE_LINK', type: 'select', options: ['pc', 'mobile'] },
    { key: 'revealMines', label: 'X_RAY_VISION', type: 'toggle' }
  ],
  'phonk-moto': [
    { key: 'deviceMode', label: 'MOBILE_LINK', type: 'select', options: ['pc', 'mobile'] },
    { key: 'gravity', label: 'GRAVITY_MOD', type: 'range', min: 0.1, max: 2, step: 0.1 }
  ]
};