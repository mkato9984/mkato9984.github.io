/**
 * Three.js 3Dバックグラウンドアニメーション
 * 洗練された立体的なグラデーションアニメーションの実装
 * 素粒子物理学の視覚的表現を追加
 * ユーザー操作による反復処理制御機能を追加
 */

document.addEventListener('DOMContentLoaded', () => {
    // 3D背景用キャンバスを作成
    const canvas = document.createElement('canvas');
    canvas.id = 'background-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    
    // ヒーローセクションに追加
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        heroSection.insertBefore(canvas, heroSection.firstChild);
        
        // Three.jsセットアップ
        const width = heroSection.offsetWidth;
        const height = heroSection.offsetHeight;
        
        // シーン、カメラ、レンダラーの設定
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // 素粒子の種類を表現する色（標準模型に基づく色）
        const particleColors = {
            // フェルミオン（物質粒子）
            quarks: [
                new THREE.Color('#FF5733'), // アップクォーク（赤）
                new THREE.Color('#33A8FF'), // ダウンクォーク（青）
                new THREE.Color('#FFBD33'), // チャームクォーク（黄色）
                new THREE.Color('#33FF57'), // ストレンジクォーク（緑）
                new THREE.Color('#FF33A8'), // トップクォーク（マゼンタ）
                new THREE.Color('#A833FF')  // ボトムクォーク（紫）
            ],
            leptons: [
                new THREE.Color('#FFFFFF'), // 電子（白）
                new THREE.Color('#CCCCCC'), // ミューオン（薄灰色）
                new THREE.Color('#999999'), // タウ粒子（濃灰色）
                new THREE.Color('#DDFFDD'), // 電子ニュートリノ（薄緑）
                new THREE.Color('#DDDDFF'), // ミューニュートリノ（薄青）
                new THREE.Color('#FFDDDD')  // タウニュートリノ（薄赤）
            ],
            // ボソン（力を媒介する粒子）
            bosons: [
                new THREE.Color('#FFFF00'), // 光子（黄色）
                new THREE.Color('#00FFFF'), // Wボソン（シアン）
                new THREE.Color('#FF00FF'), // Zボソン（マゼンタ）
                new THREE.Color('#FF0000')  // グルーオン（赤）
            ],
            // ヒッグス粒子
            higgs: new THREE.Color('#00FF00') // ヒッグス粒子（鮮やかな緑）
        };
        
        // グラデーション背景に使用する色
        const bgColors = [
            new THREE.Color('#4285F4'), // メインブルー
            new THREE.Color('#34A853'), // メイングリーン
        ];
        
        // 素粒子関連の変数
        const particlesGroups = [];
        const interactionLines = []; // 粒子間相互作用を表す線
        
        // フェルミオン（電子やクォークなど）パーティクルの生成
        const createFermions = (type, count) => {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const velocities = new Float32Array(count * 3); // 動きを保存
            const sizes = new Float32Array(count);
            const colors = new Float32Array(count * 3);
            const spins = new Float32Array(count); // スピン値（フェルミオンは半整数スピン）
            
            const colorArray = type === 'electrons' ? particleColors.electrons : 
                              (type === 'quarks' ? particleColors.quarks : particleColors.fermions);
            
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                // 位置設定
                positions[i3] = (Math.random() - 0.5) * width;
                positions[i3 + 1] = (Math.random() - 0.5) * height;
                positions[i3 + 2] = (Math.random() - 0.5) * 400;
                
                // 速度設定
                velocities[i3] = (Math.random() - 0.5) * 0.4;
                velocities[i3 + 1] = (Math.random() - 0.5) * 0.4;
                velocities[i3 + 2] = (Math.random() - 0.5) * 0.4;
                
                // サイズ設定
                sizes[i] = Math.random() * 5 + 2;
                
                // 色設定
                const colorIndex = Math.floor(Math.random() * colorArray.length);
                const color = colorArray[colorIndex];
                colors[i3] = color.r;
                colors[i3 + 1] = color.g;
                colors[i3 + 2] = color.b;
                
                // スピン - フェルミオンは半整数スピン（0.5, -0.5）
                spins[i] = Math.random() > 0.5 ? 0.5 : -0.5;
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            // フェルミオン用のシェーダーマテリアル
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    pixelRatio: { value: window.devicePixelRatio }
                },
                vertexShader: `
                    attribute float size;
                    attribute vec3 color;
                    uniform float time;
                    uniform float pixelRatio;
                    varying vec3 vColor;
                    varying float vTime;
                    
                    void main() {
                        vColor = color;
                        vTime = time;
                        
                        // フェルミオン特有の動き
                        vec3 pos = position;
                        
                        // スピン回転運動（半整数スピンの表現）
                        float spinFreq = 1.5;
                        float vertexOffset = float(gl_VertexID) * 0.01;
                        
                        // パウリの排他原理を表現（他の粒子との反発）
                        vec3 repulsion = vec3(
                            sin(time * 0.7 + pos.z * 0.2) * 3.0,
                            cos(time * 0.8 + pos.x * 0.2) * 3.0,
                            sin(time * 0.9 + pos.y * 0.2) * 3.0
                        );
                        
                        // 量子トンネル効果（壁を透過する現象）
                        if (abs(pos.x) > width * 0.4) pos.x *= -0.98;
                        if (abs(pos.y) > height * 0.4) pos.y *= -0.98;
                        if (abs(pos.z) > 350.0) pos.z *= -0.98;
                        
                        // 電子特有の軌道運動（原子核周りの電子殻のような）
                        if (type == 'electrons') {
                            float orbitRadius = 20.0 + vertexOffset * 100.0;
                            float orbitSpeed = time * 0.5 + vertexOffset * 10.0;
                            
                            // 量子化された軌道
                            int orbitLevel = int(mod(float(gl_VertexID), 4.0));
                            orbitRadius = 10.0 + float(orbitLevel) * 15.0;
                            
                            // 電子雲の表現（確率的な分布）
                            float cloudFactor = sin(time * 2.0 + vertexOffset * 50.0) * 0.5 + 0.5;
                            orbitRadius *= 0.8 + cloudFactor * 0.4;
                            
                            // 楕円軌道
                            pos.x += sin(orbitSpeed) * orbitRadius * 1.2;
                            pos.y += cos(orbitSpeed) * orbitRadius * 0.8;
                            pos.z += sin(orbitSpeed * 0.7) * (orbitRadius * 0.3);
                        }
                        
                        // 量子揺らぎ（不確定性原理の表現）
                        float uncertainty = sin(time * 3.0 + vertexOffset * 20.0) * 2.0;
                        pos += vec3(
                            sin(time * 2.0 + pos.y * 0.1) * uncertainty,
                            cos(time * 2.2 + pos.z * 0.1) * uncertainty,
                            sin(time * 2.4 + pos.x * 0.1) * uncertainty
                        );
                        
                        // 波動関数的な振る舞い
                        pos += repulsion * (sin(time * spinFreq + vertexOffset * 10.0) * 0.5 + 0.5);
                        
                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        
                        // 粒子サイズの脈動（量子状態の変化を表現）
                        float pulseFactor = 1.0 + 0.4 * sin(time * 2.0 + vertexOffset * 5.0);
                        gl_PointSize = size * pulseFactor * pixelRatio * (400.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    varying vec3 vColor;
                    varying float vTime;
                    
                    void main() {
                        // 基本的な円形パーティクル
                        vec2 center = vec2(0.5, 0.5);
                        float dist = length(gl_PointCoord - center);
                        if (dist > 0.5) discard; // 円形にカット
                        
                        // フェルミオンのグロー効果（より柔らかな光）
                        float glow = exp(-dist * 5.0) * 1.5;
                        
                        // 量子確率波（内部の波紋パターン）
                        float waves = 0.0;
                        for (int i = 0; i < 3; i++) {
                            float waveRadius = 0.1 + float(i) * 0.12;
                            float waveWidth = 0.03;
                            float waveTime = vTime * (1.0 + float(i) * 0.5);
                            
                            // 動的な波紋
                            float wavePulse = sin(waveTime + dist * 10.0) * 0.5 + 0.5;
                            
                            waves += smoothstep(waveRadius + waveWidth, waveRadius, dist) * 
                                    smoothstep(waveRadius - waveWidth, waveRadius, dist) * 
                                    0.4 * wavePulse;
                        }
                        
                        // 中心コア（明るい中心部）
                        float core = smoothstep(0.2, 0.0, dist) * 2.0;
                        
                        // 量子力学的な干渉効果
                        float interference = sin(gl_PointCoord.x * 30.0 + gl_PointCoord.y * 30.0 + vTime * 2.0) * 0.1;
                        
                        // 電子雲の密度分布（確率分布）
                        float electronCloud = (1.0 - dist * 2.0);
                        electronCloud = pow(electronCloud, 2.0) * 1.5;
                        
                        // 放射状の光線（より柔らかいもの）
                        float rays = 0.0;
                        int rayCount = 6;
                        for (int i = 0; i < rayCount; i++) {
                            float angle = 6.28318 * float(i) / float(rayCount);
                            angle += vTime * 0.5; // 回転する光線
                            vec2 rayDir = vec2(cos(angle), sin(angle));
                            float rayMask = pow(abs(dot(normalize(gl_PointCoord - center), rayDir)), 16.0);
                            rays += rayMask * 0.15;
                        }
                        
                        // 内側から外側へのグラデーション
                        float gradient = smoothstep(0.5, 0.0, dist);
                        gradient = pow(gradient, 1.5);
                        
                        // 光の脈動効果
                        float pulse = 0.85 + 0.3 * sin(vTime * 3.0 + dist * 15.0);
                        
                        // フェルミオンの色彩効果合成
                        vec3 finalColor = vColor * (gradient * 2.0 + core);
                        finalColor += vColor * electronCloud * pulse;
                        finalColor += vColor * waves * 3.0; // 量子波を強化
                        finalColor += vColor * rays * 2.0;  // 柔らかい放射光線
                        finalColor += vColor * interference; // 量子干渉効果
                        finalColor += vColor * glow * 0.5; // 柔らかいグロー
                        
                        // 全体の明るさ調整
                        finalColor *= 2.5;
                        
                        // 光の強度に基づく透明度
                        float intensity = 1.0 - pow(dist * 2.0, 1.8);
                        float alpha = intensity * pulse * 0.9;
                        alpha = mix(alpha, 1.0, core * 0.6); // コア部分はより不透明に
                        
                        gl_FragColor = vec4(finalColor, alpha);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            
            const particles = new THREE.Points(geometry, material);
            scene.add(particles);
            
            return {
                particles,
                geometry,
                velocities,
                spins,
                type
            };
        };
        
        // ボソン（光子やグルーオンなど）パーティクルの生成
        const createBosons = (type, count) => {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const velocities = new Float32Array(count * 3); // 動きを保存
            const sizes = new Float32Array(count);
            const colors = new Float32Array(count * 3);
            const spins = new Float32Array(count); // スピン値（ボソンは整数スピン）
            
            const colorArray = type === 'photons' ? particleColors.photons : particleColors.bosons;
            
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                // 位置設定
                positions[i3] = (Math.random() - 0.5) * width;
                positions[i3 + 1] = (Math.random() - 0.5) * height;
                positions[i3 + 2] = (Math.random() - 0.5) * 400;
                
                // 速度設定（光速に近い）
                velocities[i3] = (Math.random() - 0.5) * 0.6;
                velocities[i3 + 1] = (Math.random() - 0.5) * 0.6;
                velocities[i3 + 2] = (Math.random() - 0.5) * 0.6;
                
                // サイズ設定（光子はやや大きく、より目立つように）
                sizes[i] = type === 'photons' ? Math.random() * 7 + 4 : Math.random() * 5 + 3;
                
                // 色設定
                const colorIndex = Math.floor(Math.random() * colorArray.length);
                const color = colorArray[colorIndex];
                colors[i3] = color.r;
                colors[i3 + 1] = color.g;
                colors[i3 + 2] = color.b;
                
                // スピン - ボソンは整数スピン（1, 0, -1）
                spins[i] = Math.floor(Math.random() * 3) - 1;
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            // ボソン用のシェーダーマテリアル
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    pixelRatio: { value: window.devicePixelRatio }
                },
                vertexShader: `
                    attribute float size;
                    attribute vec3 color;
                    uniform float time;
                    uniform float pixelRatio;
                    varying vec3 vColor;
                    varying float vTime;
                    
                    void main() {
                        vColor = color;
                        vTime = time;
                        
                        // 量子揺らぎを表現する動き
                        vec3 pos = position;
                        
                        // 波動的な動き
                        float waveFreq = 2.0;
                        float waveAmp = 2.0;
                        float wave = sin(time * waveFreq + length(pos) * 0.2) * waveAmp;
                        
                        // 円形軌道の強化
                        float orbitSpeed = time * 0.8 + float(gl_VertexID) * 0.01;
                        float radius = 5.0 + sin(time * 0.2) * 2.0;
                        
                        // ボソン特有の円形軌道
                        if (length(pos) > 10.0) {
                            pos.x += sin(orbitSpeed) * radius;
                            pos.y += cos(orbitSpeed) * radius;
                            pos.z += sin(orbitSpeed * 0.7) * (radius * 0.5);
                        }
                        
                        // 量子効果による位置の揺らぎ
                        pos.x += sin(time * 1.2 + pos.z * 0.3) * 2.0;
                        pos.y += cos(time * 1.5 + pos.x * 0.3) * 2.0;
                        pos.z += sin(time * 1.0 + pos.y * 0.3) * 2.0;
                        
                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        
                        // サイズの変動
                        float pulseFactor = 1.0 + 0.5 * sin(time * 3.0 + float(gl_VertexID) * 0.05);
                        gl_PointSize = size * pulseFactor * pixelRatio * (400.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    varying vec3 vColor;
                    varying float vTime;
                    
                    void main() {
                        // 円形のパーティクルを作成（重要）
                        vec2 uv = gl_PointCoord.xy - 0.5;
                        float dist = length(uv);
                        
                        // 円形マスク - 0.5より大きい距離の場合は描画しない
                        if (dist > 0.5) discard;
                        
                        // 基本的な光の強度
                        float intensity = 1.0 - pow(dist * 2.0, 1.5);
                        
                        // 多重グロー効果
                        float glow = exp(-dist * 3.0) * 3.0;
                        float outerGlow = exp(-dist * 2.0) * 1.5;
                        
                        // 時間に応じた脈動する光の効果
                        float pulse = 0.8 + 0.4 * sin(vTime * 5.0 + dist * 20.0);
                        float advancedPulse = 0.7 + 0.3 * sin(vTime * 2.3) * sin(vTime * 3.7 + dist * 15.0);
                        
                        // 輝く中心コア
                        float core = smoothstep(0.25, 0.0, dist);
                        core = pow(core, 0.8) * 3.0;
                        
                        // 同心円状に広がる波紋
                        float rings = 0.0;
                        for (int i = 0; i < 4; i++) {
                            float ringRadius = 0.1 + float(i) * 0.1;
                            float ringWidth = 0.02 + float(i) * 0.01;
                            float ringPhase = vTime * (1.2 - float(i) * 0.2);
                            float ringPulse = sin(ringPhase) * 0.5 + 0.5;
                            float rPos = ringRadius + ringPulse * 0.05;
                            
                            float ring = smoothstep(rPos + ringWidth, rPos, dist) * 
                                       smoothstep(rPos - ringWidth, rPos, dist);
                            
                            rings += ring * (0.8 - float(i) * 0.15);
                        }
                        
                        // 放射状の光線効果
                        float rays = 0.0;
                        int rayCount = 8;
                        for (int i = 0; i < rayCount; i++) {
                            float rayAngle = 6.28318 * float(i) / float(rayCount);
                            rayAngle += vTime * 0.2;
                            
                            vec2 rayDir = vec2(cos(rayAngle), sin(rayAngle));
                            float rayDot = dot(normalize(uv), rayDir);
                            
                            float rayMask = pow(max(0.0, rayDot), 8.0) * 0.5;
                            float rayFalloff = 1.0 - smoothstep(0.0, 0.5, dist);
                            rays += rayMask * rayFalloff * 0.4;
                        }
                        
                        // 最終カラー合成
                        vec3 finalColor = vColor * intensity;
                        finalColor += vColor * core * 3.0;
                        finalColor += vColor * glow * pulse;
                        finalColor += vColor * outerGlow * advancedPulse * 0.5;
                        finalColor += vColor * rings * 1.5;
                        finalColor += vColor * rays * 1.5;
                        
                        // 明るさの調整
                        finalColor *= 1.5;
                        
                        // アルファ値（中心ほど不透明に）
                        float alpha = intensity * 0.8;
                        
                        gl_FragColor = vec4(finalColor, alpha);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            
            const particles = new THREE.Points(geometry, material);
            scene.add(particles);
            
            return {
                particles,
                geometry,
                velocities,
                spins,
                type
            };
        };
        
        // ヒッグス粒子（特別な粒子）の生成
        const createHiggsBoson = () => {
            const geometry = new THREE.SphereGeometry(10, 32, 32);
            const specialHiggsMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    pixelRatio: { value: window.devicePixelRatio }
                },
                vertexShader: `
                    attribute float size;
                    attribute vec3 color;
                    uniform float time;
                    uniform float pixelRatio;
                    varying vec3 vColor;
                    varying float vTime;
                    
                    void main() {
                        vColor = color;
                        vTime = time;
                        
                        // ヒッグス場の特性を表現（空間全体に存在する場）
                        vec3 pos = position;
                        
                        // ヒッグス場の揺らぎ（より複雑な物理現象を表現）
                        float fieldStrength = 2.0 + sin(time * 0.5) * 0.5;
                        
                        // 場の変形（重力のような効果）
                        float spacetimeWarp = sin(time * 0.2 + length(pos) * 0.05) * 2.0;
                        
                        // 質量付与の効果を視覚化（物質と相互作用する様子）
                        float massEffect = sin(time * 0.3 + pos.x * 0.1 + pos.y * 0.1 + pos.z * 0.1);
                        
                        // より有機的で複雑な動き
                        pos.x += sin(time * 0.5 + pos.z * 0.1) * fieldStrength + cos(time * 0.3) * spacetimeWarp;
                        pos.y += cos(time * 0.4 + pos.x * 0.1) * fieldStrength + sin(time * 0.25) * spacetimeWarp;
                        pos.z += sin(time * 0.3 + pos.y * 0.1) * fieldStrength * 0.5;
                        
                        // 量子場の揺らぎの表現
                        pos += vec3(
                            sin(time * 1.1 + pos.y * 0.2) * massEffect,
                            cos(time * 0.9 + pos.z * 0.2) * massEffect,
                            sin(time * 1.3 + pos.x * 0.2) * massEffect
                        ) * 1.5;
                        
                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        
                        // ヒッグス粒子は特別な存在（サイズも脈動する）
                        float sizeVariation = 1.0 + 0.7 * sin(time * 0.8 + length(pos) * 0.1);
                        gl_PointSize = size * sizeVariation * pixelRatio * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    varying vec3 vColor;
                    varying float vTime;
                    
                    // 複雑なノイズ関数（フラクタル的な見た目）
                    float noise(vec2 st) {
                        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                    }
                    
                    void main() {
                        // 中心からの距離
                        float distToCenter = length(gl_PointCoord - vec2(0.5));
                        if (distToCenter > 0.5) discard;
                        
                        // 基本的な光沢効果
                        float glow = 1.0 - distToCenter * 2.0;
                        glow = pow(glow, 2.0);
                        
                        // ヒッグス場の表現（より複雑なパターン）
                        float field = 0.0;
                        
                        // 同心円を複数重ねる（場の層状構造）
                        for (int i = 0; i < 5; i++) {
                            float ringSize = 0.1 + float(i) * 0.08;
                            float ringStrength = 1.0 - float(i) * 0.15;
                            field += smoothstep(ringSize + 0.02, ringSize, distToCenter) * 
                                    smoothstep(ringSize - 0.08, ringSize - 0.02, distToCenter) * 
                                    ringStrength;
                        }
                        
                        // 流れるエネルギーの表現
                        float energyFlow = sin(distToCenter * 30.0 - vTime * 3.0) * 0.5 + 0.5;
                        
                        // ヒッグス場の揺らぎ（時間経過で変化）
                        float fieldFluctuation = sin(vTime * 1.0) * 0.5 + 0.5;
                        
                        // フラクタル的なノイズパターン（量子場の複雑さ）
                        float noisePattern = 0.0;
                        for (int i = 0; i < 3; i++) {
                            float scale = pow(2.0, float(i));
                            vec2 noiseCoord = gl_PointCoord * scale + vec2(vTime * 0.1 * float(i));
                            noisePattern += noise(noiseCoord) / scale;
                        }
                        
                        // 特殊効果（重力場のような収束するエネルギー）
                        float gravitationalEffect = pow(1.0 - distToCenter, 3.0) * sin(vTime * 0.5) * 0.5 + 0.5;
                        
                        // 最終的な色の計算
                        vec3 finalColor = vColor.rgb * 0.5; // ベース色
                        
                        // ヒッグス粒子特有の金色の輝き
                        vec3 goldenGlow = vec3(1.0, 0.8, 0.3) * 1.5;
                        
                        // 神秘的な光彩効果（オーラ）
                        vec3 mysticalAura = vec3(0.4, 0.3, 0.8) * 2.0;
                        
                        // 色の層を重ねる
                        finalColor += vColor * glow * 2.0; // 基本的な光沢
                        finalColor += goldenGlow * field * fieldFluctuation * 3.0; // 金色の場
                        finalColor += vColor * energyFlow * 1.2; // エネルギーの流れ
                        finalColor += mysticalAura * noisePattern * 1.5; // 神秘的なノイズパターン
                        finalColor += goldenGlow * gravitationalEffect * 2.0; // 重力場効果
                        
                        // ヒッグス粒子特有の脈動（宇宙を満たす場のような）
                        float pulse = (sin(vTime * 1.5) * 0.5 + 0.5) * 0.7 + 0.3;
                        finalColor *= 2.8; // 全体の輝きを強化
                        
                        // 質量付与の効果を表す輝き
                        float massGlow = sin(distToCenter * 25.0 - vTime * 2.0) * 0.5 + 0.5;
                        finalColor += goldenGlow * massGlow * (1.0 - distToCenter) * 2.0;
                        
                        // 透明度（中心が最も濃く、外側に行くほど透明に）
                        float alpha = pow(1.0 - distToCenter * 2.0, 1.5) * pulse;
                        
                        gl_FragColor = vec4(finalColor, alpha);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            
            const higgs = new THREE.Mesh(geometry, specialHiggsMaterial);
            scene.add(higgs);
            
            return {
                particles: higgs,
                material: specialHiggsMaterial,
                type: 'higgs'
            };
        };
        
        // 粒子間相互作用ラインの作成
        const createInteractionLines = () => {
            const lineGeometry = new THREE.BufferGeometry();
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.2,
                blending: THREE.AdditiveBlending
            });
            
            const linePositions = new Float32Array(100 * 6); // 最大50本の線（各線は2点=6座標）
            lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
            
            const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
            scene.add(lines);
            
            return {
                lines,
                geometry: lineGeometry,
                positions: linePositions,
                activeCount: 0
            };
        };
        
        // 量子場を表現するシェーダー背景
        const createQuantumField = () => {
            const planeGeometry = new THREE.PlaneGeometry(width * 2, height * 2);
            const planeMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    u_time: { value: 0 },
                    u_resolution: { value: new THREE.Vector2(width, height) },
                    u_color1: { value: bgColors[0] },
                    u_color2: { value: bgColors[1] }
                },
                vertexShader: `
                    varying vec2 vUv;
                    
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float u_time;
                    uniform vec2 u_resolution;
                    uniform vec3 u_color1;
                    uniform vec3 u_color2;
                    varying vec2 vUv;
                    
                    // 量子場のノイズ関数
                    float noise(vec2 st) {
                        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                    }
                    
                    void main() {
                        vec2 st = vUv;
                        
                        // 量子場の基本グラデーション
                        float t = sin(u_time * 0.2) * 0.5 + 0.5;
                        vec3 color = mix(u_color1, u_color2, st.y + t * 0.2);
                        
                        // 量子揺らぎの表現
                        float noiseValue = noise(st * 10.0 + u_time * 0.1);
                        
                        // 場の揺らぎ効果（波紋）
                        for (int i = 1; i < 5; i++) {
                            float fi = float(i);
                            float t = u_time * (0.1 + 0.05 * fi);
                            vec2 center = vec2(
                                0.5 + 0.3 * sin(t * 0.8 + fi * 1.2),
                                0.5 + 0.3 * cos(t * 1.2 + fi * 0.8)
                            );
                            float dist = distance(st, center);
                            float wave = sin(dist * 50.0 - u_time * 2.0) * 0.5 + 0.5;
                            float waveMask = smoothstep(0.3, 0.0, dist) * 0.05;
                            
                            color += wave * waveMask * vec3(0.1, 0.2, 0.3);
                        }
                        
                        // 量子泡効果
                        color += noiseValue * 0.05;
                        
                        gl_FragColor = vec4(color, 0.85);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.position.z = -100;
            scene.add(plane);
            
            return {
                mesh: plane,
                material: planeMaterial
            };
        };
        
        // 素粒子の生成
        const quarks = createFermions('quarks', 60);
        const leptons = createFermions('leptons', 40);
        const bosons = createBosons('bosons', 30);
        const higgs = createHiggsBoson();
        const interactions = createInteractionLines();
        const quantumField = createQuantumField();
        
        particlesGroups.push(quarks, leptons, bosons);
        
        // カメラポジション
        camera.position.z = 150;
        
        // 粒子間の相互作用を更新
        const updateInteractions = () => {
            let lineIndex = 0;
            
            // 相互作用が発生する距離の閾値
            const interactionThreshold = 50;
            
            // クォークとボソン間の相互作用
            const quarkPositions = quarks.geometry.attributes.position.array;
            const bosonPositions = bosons.geometry.attributes.position.array;
            
            for (let q = 0; q < quarkPositions.length / 3 && lineIndex < 49; q += 3) {
                for (let b = 0; b < bosonPositions.length / 3; b += 3) {
                    const quarkX = quarkPositions[q];
                    const quarkY = quarkPositions[q + 1];
                    const quarkZ = quarkPositions[q + 2];
                    
                    const bosonX = bosonPositions[b];
                    const bosonY = bosonPositions[b + 1];
                    const bosonZ = bosonPositions[b + 2];
                    
                    // 距離計算
                    const dx = quarkX - bosonX;
                    const dy = quarkY - bosonY;
                    const dz = quarkZ - bosonZ;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    
                    // 一定確率で相互作用が発生（量子効果の確率的表現）
                    if (distance < interactionThreshold && Math.random() < 0.03) {
                        const i6 = lineIndex * 6;
                        interactions.positions[i6] = quarkX;
                        interactions.positions[i6 + 1] = quarkY;
                        interactions.positions[i6 + 2] = quarkZ;
                        interactions.positions[i6 + 3] = bosonX;
                        interactions.positions[i6 + 4] = bosonY;
                        interactions.positions[i6 + 5] = bosonZ;
                        
                        lineIndex++;
                    }
                }
            }
            
            // 相互作用ラインが何本アクティブか更新
            interactions.activeCount = lineIndex;
            
            // バッファ更新
            interactions.geometry.attributes.position.needsUpdate = true;
            interactions.geometry.setDrawRange(0, interactions.activeCount * 2);
        };
        
        // アニメーション制御変数
        let isAnimating = true;
        let time = 0;
        let animationFrameId = null;
        
        // ユーザー確認プロンプトを作成
        const createConfirmationPrompt = () => {
            const promptContainer = document.createElement('div');
            promptContainer.id = 'animation-prompt';
            promptContainer.style.position = 'absolute';
            promptContainer.style.bottom = '20px';
            promptContainer.style.left = '50%';
            promptContainer.style.transform = 'translateX(-50%)';
            promptContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            promptContainer.style.color = 'white';
            promptContainer.style.padding = '10px 20px';
            promptContainer.style.borderRadius = '5px';
            promptContainer.style.display = 'flex';
            promptContainer.style.alignItems = 'center';
            promptContainer.style.gap = '10px';
            promptContainer.style.zIndex = '10';
            promptContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
            
            const promptText = document.createElement('span');
            promptText.textContent = '反復処理を続行しますか?';
            promptText.style.fontWeight = 'bold';
            
            const continueButton = document.createElement('button');
            continueButton.textContent = '続行';
            continueButton.style.padding = '5px 15px';
            continueButton.style.border = 'none';
            continueButton.style.borderRadius = '3px';
            continueButton.style.backgroundColor = '#34A853';
            continueButton.style.color = 'white';
            continueButton.style.cursor = 'pointer';
            
            const pauseButton = document.createElement('button');
            pauseButton.textContent = '停止';
            pauseButton.style.padding = '5px 15px';
            pauseButton.style.border = 'none';
            pauseButton.style.borderRadius = '3px';
            pauseButton.style.backgroundColor = '#EA4335';
            pauseButton.style.color = 'white';
            pauseButton.style.cursor = 'pointer';
            
            promptContainer.appendChild(promptText);
            promptContainer.appendChild(continueButton);
            promptContainer.appendChild(pauseButton);
            
            heroSection.appendChild(promptContainer);
            
            // ボタンクリックイベント
            continueButton.addEventListener('click', () => {
                isAnimating = true;
                promptContainer.style.display = 'none';
                if (!animationFrameId) {
                    animate();
                }
            });
            
            pauseButton.addEventListener('click', () => {
                isAnimating = false;
                promptContainer.style.display = 'none';
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            });
            
            return promptContainer;
        };
        
        // プロンプトを作成
        const confirmPrompt = createConfirmationPrompt();
        
        // 定期的にプロンプトを表示する
        const showPromptPeriodically = () => {
            setTimeout(() => {
                if (document.getElementById('animation-prompt')) {
                    confirmPrompt.style.display = 'flex';
                }
                if (isAnimating) {
                    showPromptPeriodically();
                }
            }, 30000); // 30秒ごとに表示
        };
        
        // アニメーション
        const animate = () => {
            if (!isAnimating) return;
            
            animationFrameId = requestAnimationFrame(animate);
            
            time += 0.01;
            
            // 量子場アニメーション
            quantumField.material.uniforms.u_time.value = time;
            
            // 素粒子グループの更新
            particlesGroups.forEach(group => {
                if (group.type === 'bosons') {
                    // ボソンの動きを更新
                    group.material.uniforms.time.value = time;
                    
                    // ボソンは高速に動く（力を媒介）
                    group.particles.rotation.x += 0.003;
                    group.particles.rotation.y += 0.004;
                    group.particles.rotation.z += 0.002;
                } else if (group.type === 'quarks' || group.type === 'leptons') {
                    // フェルミオンの動きを更新
                    group.material.uniforms.time.value = time;
                    
                    // フェルミオンはより複雑な動き
                    group.particles.rotation.x += 0.001;
                    group.particles.rotation.y += 0.002;
                    group.particles.rotation.z += 0.0005;
                }
            });
            
            // ヒッグス粒子の更新
            higgs.material.uniforms.time.value = time;
            higgs.particles.position.x = Math.sin(time * 0.2) * 50;
            higgs.particles.position.y = Math.cos(time * 0.3) * 30;
            higgs.particles.rotation.x += 0.001;
            higgs.particles.rotation.y += 0.002;
            
            // 粒子間相互作用の更新
            updateInteractions();
            
            // レンダリング
            renderer.render(scene, camera);
        };
        
        // アニメーション開始
        animate();
        showPromptPeriodically();
        
        // ウィンドウリサイズ対応
        window.addEventListener('resize', () => {
            const newWidth = heroSection.offsetWidth;
            const newHeight = heroSection.offsetHeight;
            
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            
            renderer.setSize(newWidth, newHeight);
        });
    }
});

// メインのJavaScriptファイル
// アニメーション関連の機能
document.addEventListener('DOMContentLoaded', () => {
    // スクロールアニメーション
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // 子要素のアニメーション
                const animatedChildren = entry.target.querySelectorAll('.animate-child');
                animatedChildren.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('child-visible');
                    }, index * 100);
                });
            }
        });
    }, {
        threshold: 0.1
    });
    
    // アニメーション要素の監視
    document.querySelectorAll('.fade-in, .slide-up, .scale-in').forEach(elem => {
        observer.observe(elem);
    });
    
    // カウントアップアニメーション
    document.querySelectorAll('.counter').forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        const duration = 2000; // 2秒間
        const step = (target / duration) * 10;
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                setTimeout(updateCounter, 10);
            } else {
                counter.textContent = target;
            }
        };
        
        const counterObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                updateCounter();
                counterObserver.disconnect();
            }
        });
        
        counterObserver.observe(counter);
    });
    
    // パララックス効果
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 0.1;
            const offset = scrollPosition * speed;
            element.style.transform = `translateY(${offset}px)`;
        });
    });
    
    // ヘッダーのスクロール処理
    const header = document.querySelector('.header');
    let lastScrollPosition = 0;
    
    window.addEventListener('scroll', () => {
        const currentScrollPosition = window.pageYOffset;
        
        // スクロール方向の判定
        if (currentScrollPosition > lastScrollPosition) {
            // 下にスクロール
            if (currentScrollPosition > 100) {
                header.classList.add('header--hidden');
            }
        } else {
            // 上にスクロール
            header.classList.remove('header--hidden');
        }
        
        // ヘッダーの背景色変更
        if (currentScrollPosition > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollPosition = currentScrollPosition;
    });
    
    // スムーススクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // モバイルメニュー
    const menuBtn = document.querySelector('.header__menu-btn');
    const nav = document.querySelector('.header__nav');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // モバイルメニューのリンクをクリックしたらメニューを閉じる
        document.querySelectorAll('.header__nav a').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
});