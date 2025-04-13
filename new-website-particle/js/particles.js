/**
 * パーティクルアニメーション
 * 立体的に動く素粒子エフェクト - パフォーマンス最適化版
 */
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseMoving = false;
        this.mouseTimer = null;
        this.centerX = 0;
        this.centerY = 0;
        this.depth = 2000; // 3D空間の奥行き
        this.fov = 500; // 視野角（Field of View）
        this.time = 0; // アニメーション時間
        
        // 前回のアニメーションタイムスタンプ
        this.lastTime = 0;
        this.FPS = 60; // 目標FPS
        this.frameInterval = 1000 / this.FPS; // フレーム間隔（ミリ秒）
        
        // デバイスのパフォーマンスに基づいて粒子数を調整
        this.devicePerformanceRatio = this.checkDevicePerformance();
        
        // ほんのり黄色いカラーパレット
        this.colorPalette = {
            light: [
                'rgba(255, 240, 180, 0.7)', 
                'rgba(255, 245, 200, 0.7)',
                'rgba(255, 250, 210, 0.7)',
                'rgba(255, 253, 225, 0.7)'
            ],
            dark: [
                'rgba(255, 230, 150, 0.7)', 
                'rgba(255, 235, 170, 0.7)',
                'rgba(255, 240, 190, 0.7)',
                'rgba(255, 245, 210, 0.7)'
            ]
        };
        
        this.init();
    }
    
    // デバイスのパフォーマンスをチェック（単純な推定）
    checkDevicePerformance() {
        // モバイルデバイスを検出
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 画面サイズから判断（小さい画面＝モバイル＝低性能の可能性）
        const isSmallScreen = window.innerWidth < 768;
        
        if (isMobile || isSmallScreen) {
            return 0.5; // モバイルは粒子数を半分に
        }
        
        return 1.0; // デスクトップは通常の粒子数
    }
    
    init() {
        // キャンバスをウィンドウサイズに合わせる
        this.resizeCanvas();
        
        // ウィンドウリサイズ時のイベントリスナー
        window.addEventListener('resize', () => {
            // リサイズ時にスロットリングを適用（パフォーマンス対策）
            if (!this.resizeTimeout) {
                this.resizeTimeout = setTimeout(() => {
                    this.resizeTimeout = null;
                    this.resizeCanvas();
                }, 200);
            }
        });
        
        // マウス移動のイベントリスナー
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            this.isMouseMoving = true;
            
            clearTimeout(this.mouseTimer);
            this.mouseTimer = setTimeout(() => {
                this.isMouseMoving = false;
            }, 2000);
        });
        
        // パーティクルの初期化
        this.createParticles();
        
        // アニメーションの開始
        this.lastTime = performance.now();
        this.animate(this.lastTime);
    }
    
    resizeCanvas() {
        // デバイスピクセル比を活用して高解像度ディスプレイに対応
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = this.canvas.parentElement.offsetHeight * dpr;
        
        // CSSサイズは変更せず、内部解像度だけを上げる
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = this.canvas.parentElement.offsetHeight + 'px';
        
        // コンテキストのスケーリング
        this.ctx.scale(dpr, dpr);
        
        this.centerX = window.innerWidth / 2;
        this.centerY = this.canvas.parentElement.offsetHeight / 2;
        
        // リサイズ時にパーティクルを再作成
        this.createParticles();
    }
    
    createParticles() {
        // パーティクルをクリア
        this.particles = [];
        
        // パーティクルの数（画面サイズに応じて調整＆デバイス性能に応じて調整）
        const baseCount = Math.min(Math.floor((this.canvas.width * this.canvas.height) / (18000 / this.devicePerformanceRatio)), 80);
        const particleCount = Math.floor(baseCount * this.devicePerformanceRatio);
        
        // 現在のテーマを取得
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const colors = isDarkMode ? this.colorPalette.dark : this.colorPalette.light;
        
        for (let i = 0; i < particleCount; i++) {
            // 3D空間での位置（球体の中にランダムに配置）
            const radius = Math.random() * Math.min(this.centerX, this.centerY) * 0.45;
            const theta = Math.random() * Math.PI * 2; // 水平方向の角度
            const phi = Math.random() * Math.PI; // 垂直方向の角度
            
            // 極座標から直交座標への変換
            const x3d = radius * Math.sin(phi) * Math.cos(theta);
            const y3d = radius * Math.sin(phi) * Math.sin(theta);
            const z3d = radius * Math.cos(phi);
            
            // パーティクルのプロパティ
            // 大きな粒子は少なく、小さな粒子は多く
            const sizeRandom = Math.random();
            const size = sizeRandom * sizeRandom * 5 + 1.5; // 二乗すると小さい値が多くなる
            
            // 色はランダムに選択（白系）
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // 各軸の運動方向と速度
            const speed = (Math.random() * 0.3 + 0.1) * (sizeRandom < 0.3 ? 1.5 : 1);
            const angle = Math.random() * Math.PI * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const vz = (Math.random() * 2 - 1) * speed * 0.5;
            
            // パーティクルの形状（シンプルにして処理負荷を下げる）
            const shape = sizeRandom < 0.7 ? 'circle' : 'rect';
            
            this.particles.push({
                x3d, y3d, z3d,
                vx, vy, vz,
                x: 0, y: 0,
                size, color,
                alpha: Math.random() * 0.4 + 0.6,
                phase: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                shape,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() * 0.02 - 0.01),
                // 軌跡は大きな粒子だけに（処理負荷を下げる）
                hasTrail: size > 4,
                trail: [],
                trailLength: Math.floor(Math.random() * 5) + 3
            });
        }
    }
    
    // 3D座標を2D画面に投影する
    project(x3d, y3d, z3d) {
        const scale = this.fov / (this.fov + z3d);
        const x2d = this.centerX + x3d * scale;
        const y2d = this.centerY + y3d * scale;
        
        return { x: x2d, y: y2d, scale };
    }
    
    animate(currentTime) {
        // FPSに基づくフレーム制御
        const elapsedTime = currentTime - this.lastTime;
        
        requestAnimationFrame(timestamp => this.animate(timestamp));
        
        // 指定FPSより早すぎる場合はスキップ
        if (elapsedTime < this.frameInterval) {
            return;
        }
        
        // タイムスタンプの更新と時間の増分
        this.lastTime = currentTime - (elapsedTime % this.frameInterval);
        this.time += 0.01;
        
        // キャンバスをクリア
        this.ctx.clearRect(0, 0, this.centerX * 2, this.centerY * 2);
        
        // 中心点の更新（マウス移動中の場合）
        if (this.isMouseMoving) {
            this.centerX += (this.mouseX - this.centerX) * 0.03;
            this.centerY += (this.mouseY - this.centerY) * 0.03;
        } else {
            this.centerX += (window.innerWidth / 2 - this.centerX) * 0.01;
            this.centerY += (this.canvas.parentElement.offsetHeight / 2 - this.centerY) * 0.01;
        }
        
        // 全体の淡いグロー効果を追加（低負荷版）
        this.addSimpleGlowEffect();
        
        // パーティクルを一時的に格納する配列
        let visibleParticles = [];
        
        // パーティクルの位置更新と投影
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // 透明度の変動（脈動効果）- 負荷を下げるために単純化
            p.alpha = 0.6 + 0.4 * Math.sin(this.time * p.pulseSpeed * 5 + p.phase);
            
            // 回転角度の更新（大きな粒子のみ）
            if (p.size > 3) {
                p.rotation += p.rotationSpeed;
            }
            
            // 3D空間での位置更新
            p.x3d += p.vx;
            p.y3d += p.vy;
            p.z3d += p.vz;
            
            // 球体の境界を超えたらバウンドさせる（シンプル化）
            const maxRadius = Math.min(this.centerX, this.centerY) * 0.45;
            const distanceFromCenter = Math.sqrt(p.x3d * p.x3d + p.y3d * p.y3d + p.z3d * p.z3d);
            
            if (distanceFromCenter > maxRadius) {
                // バウンス効果をシンプルに
                p.vx *= -1;
                p.vy *= -1;
                p.vz *= -1;
                
                // 境界上に戻す
                const ratio = maxRadius / distanceFromCenter;
                p.x3d *= ratio;
                p.y3d *= ratio;
                p.z3d *= ratio;
            }
            
            // 3D座標から2D画面への投影
            const projected = this.project(p.x3d, p.y3d, p.z3d);
            p.x = projected.x;
            p.y = projected.y;
            p.size2d = p.size * projected.scale;
            
            // 画面外のパーティクルは処理しない
            if (p.x < -50 || p.x > this.centerX * 2 + 50 ||
                p.y < -50 || p.y > this.centerY * 2 + 50 ||
                p.size2d < 0.5) { // 極端に小さいものも表示しない（パフォーマンス向上）
                continue;
            }
            
            // 軌跡データの更新（大きい粒子のみ）
            if (p.hasTrail) {
                p.trail.unshift({ x: p.x, y: p.y, size: p.size2d, alpha: p.alpha });
                if (p.trail.length > p.trailLength) {
                    p.trail.pop();
                }
            }
            
            // 表示対象のパーティクルを配列に追加
            visibleParticles.push({
                ...p,
                z3d: p.z3d,
                size2d: p.size2d,
                projectedScale: projected.scale
            });
        }
        
        // Z座標に基づいてソート（奥のものから描画）
        visibleParticles.sort((a, b) => a.z3d - b.z3d);
        
        // パーティクル間の接続線を描画（数を制限）
        // 高負荷なので、パーティクル数の1/4だけで実行
        const maxLinesToDraw = Math.min(15, Math.floor(visibleParticles.length / 4));
        const sortedBySize = [...visibleParticles].sort((a, b) => b.size2d - a.size2d);
        const topParticles = sortedBySize.slice(0, maxLinesToDraw);
        
        // 接続線を描画（負荷軽減のため単純化）
        this.drawConnectionLines(topParticles);
        
        // パーティクルの描画
        for (let i = 0; i < visibleParticles.length; i++) {
            const p = visibleParticles[i];
            
            // 軌跡の描画（大きな粒子のみ）
            if (p.hasTrail && p.trail.length > 1) {
                this.drawTrail(p);
            }
            
            // 粒子の描画
            this.drawParticle(p);
        }
    }
    
    // 接続線の描画（別関数に分離してコードを整理）
    drawConnectionLines(particles) {
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            // 各粒子に対して接続する最大数を制限
            const maxConnections = 2;
            let connectionsCount = 0;
            
            for (let j = i + 1; j < particles.length && connectionsCount < maxConnections; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const maxDistance = 200;
                if (distance < maxDistance) {
                    connectionsCount++;
                    
                    // 距離に応じて線の透明度を調整
                    const opacity = (1 - distance / maxDistance) * 0.12 * p1.alpha * p2.alpha;
                    
                    // 線の色を黄色系に変更
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(255, 250, 200, ${opacity})`;
                    this.ctx.lineWidth = 0.5 * Math.min(p1.projectedScale, p2.projectedScale);
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    // 軌跡の描画
    drawTrail(particle) {
        for (let t = 1; t < particle.trail.length; t++) {
            const point = particle.trail[t];
            const prevPoint = particle.trail[t-1];
            
            // 軌跡のフェードアウト効果（簡略化）- 黄色系に変更
            const trailOpacity = (1 - t / particle.trail.length) * 0.2 * particle.alpha;
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(255, 250, 200, ${trailOpacity})`;
            this.ctx.lineWidth = point.size * 0.3 * (1 - t / particle.trail.length);
            this.ctx.moveTo(prevPoint.x, prevPoint.y);
            this.ctx.lineTo(point.x, point.y);
            this.ctx.stroke();
        }
    }
    
    // パーティクルの描画
    drawParticle(p) {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        
        // 回転は処理が重いので大きい粒子だけに適用
        if (p.size2d > 3) {
            this.ctx.rotate(p.rotation);
        }
        
        if (p.shape === 'circle') {
            // 円形粒子
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size2d, 0, Math.PI * 2);
            
            // グラデーションも処理が重いのでサイズが大きい粒子だけに適用
            if (p.size2d > 3.5) {
                const gradient = this.ctx.createRadialGradient(
                    0, 0, 0,
                    0, 0, p.size2d
                );
                
                const colorWithAlpha = p.color.replace(/[\d.]+\)$/g, p.alpha + ')');
                gradient.addColorStop(0, colorWithAlpha);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.fillStyle = gradient;
            } else {
                // 小さい粒子はシンプルに描画
                this.ctx.fillStyle = p.color.replace(/[\d.]+\)$/g, p.alpha + ')');
            }
            
            this.ctx.fill();
            
        } else if (p.shape === 'rect') {
            // 長方形粒子
            const width = p.size2d * 1.2;
            const height = p.size2d * 0.8;
            
            this.ctx.beginPath();
            this.ctx.rect(-width/2, -height/2, width, height);
            this.ctx.fillStyle = p.color.replace(/[\d.]+\)$/g, p.alpha + ')');
            this.ctx.fill();
        }
        
        // 光の反射効果は大きな円形粒子だけに限定
        if (p.size2d > 4 && p.shape === 'circle') {
            this.ctx.beginPath();
            const reflectSize = p.size2d * 0.15;
            const offsetX = p.size2d * 0.3;
            const offsetY = p.size2d * 0.3;
            this.ctx.arc(-offsetX, -offsetY, reflectSize, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.9})`;
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    // 軽量版のグローエフェクト
    addSimpleGlowEffect() {
        // 負荷を軽減するためにシンプルな実装に変更
        const centerX = this.centerX;
        const centerY = this.centerY;
        const radius = Math.min(this.centerX, this.centerY) * 0.6;
        
        const glowIntensity = 0.04 + 0.02 * Math.sin(this.time * 0.5);
        
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        
        // グローエフェクトを黄色系に変更
        gradient.addColorStop(0, `rgba(255, 240, 180, ${glowIntensity})`);
        gradient.addColorStop(1, 'rgba(255, 245, 150, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
}

// DOMの読み込み完了後に実行
document.addEventListener('DOMContentLoaded', () => {
    // ヒーローセクションにキャンバスを追加
    const heroSection = document.querySelector('.hero');
    
    if (heroSection) {
        // 既存のパターン要素を取得
        const patternElement = heroSection.querySelector('.hero-pattern');
        
        // キャンバス要素の作成と設定
        const canvas = document.createElement('canvas');
        canvas.id = 'particles-canvas';
        canvas.classList.add('particles-canvas');
        
        // パターン要素がある場合は置き換え、なければ追加
        if (patternElement) {
            heroSection.replaceChild(canvas, patternElement);
        } else {
            // ヒーローセクションの最初の子要素として追加
            heroSection.insertBefore(canvas, heroSection.firstChild);
        }
        
        // パーティクルシステムの初期化
        new ParticleSystem('particles-canvas');
    }
});