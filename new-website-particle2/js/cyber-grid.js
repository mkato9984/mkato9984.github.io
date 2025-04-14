/**
 * サイバーグリッドエフェクト
 * 電気信号の粒子が直線状に尾を引きながら高速で動くエフェクト
 */

// 簡易的なノイズ関数の定義（パーリンノイズの代替）
function noise(x, y, z) {
    // シンプルな代替ノイズ関数（実際のパーリンノイズではありませんが、類似の効果を得られます）
    return Math.sin(x * 10 + y * 10 + z * 10) * 0.5 + 0.5;
}

// マウス位置の追跡用オブジェクト
const mousePos = { x: null, y: null };

// マウス位置の追跡
document.addEventListener('mousemove', function(event) {
    mousePos.x = event.clientX;
    mousePos.y = event.clientY;
});

document.addEventListener('DOMContentLoaded', function() {
    // キャンバス要素の取得
    const canvas = document.getElementById('cyber-grid-bg');
    if (!canvas) {
        console.error('Canvas element (cyber-grid-bg) not found');
        return;
    }
    
    // 2Dコンテキストの取得
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context');
        return;
    }
    
    console.log('Cyber grid effect initialized');
    
    // キャンバスのサイズをウィンドウに合わせる
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // 初期サイズの設定
    resizeCanvas();
    
    // ウィンドウのリサイズ時にキャンバスのサイズも変更
    window.addEventListener('resize', () => {
        resizeCanvas();
        initGrid();
        initParticles();
    });
    
    // カラーテーマの設定
    const colors = {
        light: {
            primary: '#2ecc71',     // 緑色のベース
            secondary: '#16a085',   // 青緑のアクセント
            highlight: '#ffffff',   // ハイライト（白）
            // particle: '#4eff9e',    // 粒子の色
            // particleTail: '#2ecc71' // 粒子の尾の色
            particle: '#ffffff',    // 粒子の色
            particleTail: '#ffffff'
        },
        dark: {
            primary: '#155d38',     // 暗めの緑
            secondary: '#0d3a2e',   // 暗めの青緑
            highlight: '#aaffaa',   // 明るい緑
            particle: '#2fff83',    // 粒子の色（ダークモード）
            particleTail: '#155d38' // 粒子の尾の色（ダークモード）
        }
    };
    
    // 現在のテーマカラー
    let currentColors = colors.light;
    
    // グリッドの設定
    const grid = {
        rows: 10,        // グリッド行数
        cols: 10,        // グリッド列数
        lineWidth: 0.1,    // グリッド線の太さ
        points: [],      // グリッドの交点
        lines: [],       // グリッド線
        nodes: []        // グリッドノード（粒子の経路として使用）
    };
    
    // 粒子の設定
    const particleSettings = {
        count: 5,         // 粒子の数
        sizeMin: 0.5,      // 最小サイズ（小さくする：1.5 → 0.8）
        sizeMax: 1.0,      // 最大サイズ（小さくする：3.5 → 2.0）
        speedMin: 10.0,     // 最小速度（直線的な動きにしたため速度を上げる）
        speedMax: 30.0,     // 最大速度（直線的な動きにしたため速度を上げる）
        tailLength: 300,    // 尾の長さを長くして電気信号の流れを表現
        glowIntensity: 100  // 発光エフェクトの強度
    };
    
    // 粒子の配列
    let particles = [];
    
    // 粒子クラス
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            // 水平または垂直のどちらかの方向を選択
            this.direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
            
            if (this.direction === 'horizontal') {
                // 水平方向の場合は左右どちらかのエッジから開始
                this.y = Math.random() * canvas.height;
                this.x = Math.random() > 0.5 ? 0 : canvas.width;
                // 移動方向
                this.vx = this.x === 0 ? (Math.random() * (particleSettings.speedMax - particleSettings.speedMin) + particleSettings.speedMin) : 
                                        -(Math.random() * (particleSettings.speedMax - particleSettings.speedMin) + particleSettings.speedMin);
                this.vy = 0;
            } else {
                // 垂直方向の場合は上下どちらかのエッジから開始
                this.x = Math.random() * canvas.width;
                this.y = Math.random() > 0.5 ? 0 : canvas.height;
                // 移動方向
                this.vy = this.y === 0 ? (Math.random() * (particleSettings.speedMax - particleSettings.speedMin) + particleSettings.speedMin) : 
                                        -(Math.random() * (particleSettings.speedMax - particleSettings.speedMin) + particleSettings.speedMin);
                this.vx = 0;
            }
            
            this.size = Math.random() * (particleSettings.sizeMax - particleSettings.sizeMin) + particleSettings.sizeMin;
            this.baseSize = this.size; // ベースサイズを保存
            
            // 粒子のID（時間ベースのアニメーション用）
            this.id = Math.random() * 1000;
            
            // 尾の座標履歴（軌跡）
            this.tail = [];
            for (let i = 0; i < particleSettings.tailLength; i++) {
                this.tail.push({ x: this.x, y: this.y });
            }
            
            // 色の明るさをわずかにランダム化
            this.brightness = 0.8 + Math.random() * 0.2;
            this.baseBrightness = this.brightness; // 基本の明るさを保存
            
            // スピード変化のタイマー
            this.speedChangeTimer = 0;
            this.speedChangeDuration = Math.random() * 100 + 50;
        }
        
        update() {
            // 尾の履歴を更新
            this.tail.unshift({ x: this.x, y: this.y });
            if (this.tail.length > particleSettings.tailLength) {
                this.tail.pop();
            }
            
            // 位置を更新（直線的な移動）
            this.x += this.vx;
            this.y += this.vy;
            
            // 画面外に出たら反対側から再開
            if (this.x < -50 || this.x > canvas.width + 50 || 
                this.y < -50 || this.y > canvas.height + 50) {
                this.reset();
            }
            
            // サイズとガンマを時間とともにわずかに変化させる（脈動効果）
            const pulse = Math.sin(Date.now() * 0.002 + this.id * 0.1);
            this.size = this.baseSize * (1 + pulse * 0.2);
            
            // グリッド線との交差点を通過する際に明るく光らせる効果
            const gridCellWidth = canvas.width / (grid.cols - 1);
            const gridCellHeight = canvas.height / (grid.rows - 1);
            
            // 最も近いグリッド線までの距離を計算
            const nearestColDist = this.x % gridCellWidth;
            const nearestRowDist = this.y % gridCellHeight;
            
            const distToGridLine = Math.min(
                Math.min(nearestColDist, gridCellWidth - nearestColDist),
                Math.min(nearestRowDist, gridCellHeight - nearestRowDist)
            );
            
            // グリッド線に近いときに明るくする
            if (distToGridLine < 5) {
                this.brightness = Math.min(1, this.baseBrightness + (1 - distToGridLine / 5) * 0.5);
            } else {
                // 通常の明るさに戻る
                this.brightness = Math.max(this.baseBrightness, this.brightness - 0.05);
            }
        }
        
        draw() {
            // グローエフェクト（発光）
            ctx.beginPath();
            const pulseEffect = Math.sin(Date.now() * 0.003) * 0.5 + 1; // よりゆっくりとした脈動効果
            const glowSize = this.size * (3 + pulseEffect);
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0, 
                this.x, this.y, glowSize
            );
            
            const particleColor = currentColors.particle;
            gradient.addColorStop(0, `${particleColor}FF`); // 完全不透明
            gradient.addColorStop(0.5, `${particleColor}80`); // 半透明
            gradient.addColorStop(1, `${particleColor}00`); // 完全透明
            
            ctx.fillStyle = gradient;
            ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
            ctx.fill();
            
            // 尾のグラデーション描画（より繊細な表現）
            if (this.tail.length > 1) {
                // 尾の先端から根元までの曲線描画
                ctx.beginPath();
                ctx.moveTo(this.tail[0].x, this.tail[0].y);
                
                // ベジェ曲線を使って滑らかな尾を描画
                for (let i = 0; i < this.tail.length - 2; i++) {
                    const xc = (this.tail[i].x + this.tail[i + 1].x) / 2;
                    const yc = (this.tail[i].y + this.tail[i + 1].y) / 2;
                    ctx.quadraticCurveTo(this.tail[i].x, this.tail[i].y, xc, yc);
                }
                
                // 最後の点へのカーブ
                ctx.quadraticCurveTo(
                    this.tail[this.tail.length - 2].x,
                    this.tail[this.tail.length - 2].y,
                    this.tail[this.tail.length - 1].x,
                    this.tail[this.tail.length - 1].y
                );
                
                // グラデーションを設定
                const tailGradient = ctx.createLinearGradient(
                    this.tail[0].x, this.tail[0].y, 
                    this.tail[this.tail.length - 1].x, this.tail[this.tail.length - 1].y
                );
                
                tailGradient.addColorStop(0, `${currentColors.particleTail}00`); // 尾の先端は透明
                tailGradient.addColorStop(0.5, `${currentColors.particleTail}40`); // 中間部分
                tailGradient.addColorStop(1, `${currentColors.particle}FF`); // 尾の根元は不透明
                
                ctx.strokeStyle = tailGradient;
                ctx.lineWidth = this.size * 0.6 * pulseEffect; // サイズを脈動させる
                ctx.lineCap = 'round'; // 線の端を丸く
                ctx.lineJoin = 'round'; // 線の接続部分を丸く
                ctx.stroke();
                
                // 尾に沿って小さな光の粒を追加（きらめき効果）
                if (Math.random() > 0.8) { // 20%の確率で光の粒を描画
                    const sparkIndex = Math.floor(Math.random() * (this.tail.length - 1)) + 1;
                    const sparkX = this.tail[sparkIndex].x;
                    const sparkY = this.tail[sparkIndex].y;
                    
                    ctx.beginPath();
                    ctx.fillStyle = '#ffffff';
                    ctx.arc(sparkX, sparkY, this.size * 0.3 * Math.random(), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // 粒子本体（複数の層でより立体的に）
            ctx.beginPath();
            ctx.fillStyle = currentColors.particle;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // 粒子の中心に明るい点を追加
            ctx.beginPath();
            ctx.fillStyle = '#ffffff';
            ctx.arc(this.x, this.y, this.size * 0.4 * pulseEffect, 0, Math.PI * 2);
            ctx.fill();
            
            // 反射光のハイライト（より立体感を出す）
            const highlightSize = this.size * 0.2;
            const highlightOffsetX = this.size * 0.3;
            const highlightOffsetY = this.size * 0.3;
            
            ctx.beginPath();
            ctx.fillStyle = '#ffffff';
            ctx.arc(
                this.x - highlightOffsetX, 
                this.y - highlightOffsetY, 
                highlightSize, 
                0, Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    // グリッドの初期化
    function initGrid() {
        grid.points = [];
        grid.lines = [];
        grid.nodes = [];
        
        const cellWidth = canvas.width / (grid.cols - 1);
        const cellHeight = canvas.height / (grid.rows - 1);
        
        // グリッドポイントの生成
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                const x = col * cellWidth;
                const y = row * cellHeight;
                
                // グリッドノードとして追加
                grid.nodes.push({
                    x: x,
                    y: y,
                    row: row,
                    col: col
                });
                
                // グリッドのポイントとして追加
                grid.points.push({ x, y });
            }
        }
        
        // グリッド線の生成
        // 水平線
        for (let row = 0; row < grid.rows; row++) {
            const linePoints = [];
            for (let col = 0; col < grid.cols; col++) {
                const index = row * grid.cols + col;
                linePoints.push(grid.points[index]);
            }
            grid.lines.push({
                points: linePoints,
                type: 'horizontal',
                intensity: Math.random() * 0.7 + 0.3 // ランダムな明るさ（0.3〜1.0）
            });
        }
        
        // 垂直線
        for (let col = 0; col < grid.cols; col++) {
            const linePoints = [];
            for (let row = 0; row < grid.rows; row++) {
                const index = row * grid.cols + col;
                linePoints.push(grid.points[index]);
            }
            grid.lines.push({
                points: linePoints,
                type: 'vertical',
                intensity: Math.random() * 0.7 + 0.3 // ランダムな明るさ（0.3〜1.0）
            });
        }
    }
    
    // 粒子の初期化
    function initParticles() {
        particles = [];
        for (let i = 0; i < particleSettings.count; i++) {
            particles.push(new Particle());
        }
    }
    
    // グリッドの描画
    function drawGrid() {
        ctx.lineWidth = grid.lineWidth;
        
        // グリッド線の描画
        grid.lines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line.points[0].x, line.points[0].y);
            
            for (let i = 1; i < line.points.length; i++) {
                ctx.lineTo(line.points[i].x, line.points[i].y);
            }
            
            // 線の色に透明度を適用
            ctx.strokeStyle = `${currentColors.primary}${Math.floor(line.intensity * 80).toString(16).padStart(2, '0')}`;
            ctx.stroke();
        });
        
        // グリッドの交点を描画
        grid.nodes.forEach(node => {
            // ノードの描画（小さな点）
            ctx.beginPath();
            ctx.fillStyle = `${currentColors.secondary}40`; // 透明度25%
            ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // 粒子の更新と描画
    function updateAndDrawParticles() {
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
    }
    
    // アニメーションループ
    function animate() {
        // キャンバスのクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // グリッドの描画
        drawGrid();
        
        // 粒子の更新と描画
        updateAndDrawParticles();
        
        // 次のフレームの要求
        requestAnimationFrame(animate);
    }
    
    // グリッドと粒子の初期化
    initGrid();
    initParticles();
    
    // テーマの切り替え機能（オプション）
    function toggleTheme() {
        currentColors = (currentColors === colors.light) ? colors.dark : colors.light;
    }
    
    // ダークモード検出（オプション）
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
        currentColors = colors.dark;
    }
    
    // アニメーションの開始
    animate();
});