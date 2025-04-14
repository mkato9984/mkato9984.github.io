/**
 * Three.jsを使用した球状渦巻きパーティクルアニメーション
 * ヒーローセクションの背景に3D空間で球状に渦巻く粒子エフェクトを表示
 */

// パーティクルシステムのインスタンス
let particleSystem;

// DOM読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
  // すでに存在するかもしれないパーティクルシステムをクリーンアップ
  if (particleSystem) {
    particleSystem.cleanup();
  }
  
  // 新しいパーティクルシステムを作成
  particleSystem = new ParticleSystem('cyber-grid-bg');
});

class ParticleSystem {
  constructor(containerId = 'cyber-grid-bg') {
    // 初期化
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with id '${containerId}' not found.`);
      return;
    }
    
    console.log('Initializing Spiral Particle System...');
    
    // スクリーンサイズの取得
    this.width = window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    
    // パーティクルのパラメータ設定
    this.params = {
      count: 2500,          // パーティクル数
      size: {
        min: 0.05,
        max: 0.5
      },
      color: 0xffffff,      // パーティクルの色
      sphereRadius: 25,     // 球の半径
      maxDistance: 15,      // 接続線の最大距離
      connectionOpacity: 0.12, // 接続線の透明度
      rotationSpeed: 0.05,  // 回転速度
      mouseInfluence: 8,    // マウスの影響半径
      cameraDistance: 35    // カメラの距離
    };
    
    // 時間追跡
    this.clock = new THREE.Clock();
    this.elapsedTime = 0;
    
    // マウス位置
    this.mouse = new THREE.Vector2(0, 0);
    
    // テーマ設定
    this.isDarkMode = document.body.classList.contains('dark-mode');
    
    // シーン、カメラ、レンダラーのセットアップ
    this.setupScene();
    
    // パーティクルの作成
    this.createParticles();
    
    // イベントリスナーの設定
    this.addEventListeners();
    
    // アニメーションループの開始
    this.animate();
    
    console.log('Particle system initialized successfully');
  }
  
  // シーン、カメラ、レンダラーのセットアップ
  setupScene() {
    // シーンの作成
    this.scene = new THREE.Scene();
    
    // カメラの作成
    this.camera = new THREE.PerspectiveCamera(
      75,                             // 視野角
      this.width / this.height,       // アスペクト比
      0.1,                            // 最小描画距離
      1000                            // 最大描画距離
    );
    this.camera.position.z = this.params.cameraDistance;
    
    // レンダラーの作成
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      alpha: true,
      antialias: true
    });
    
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
    this.renderer.setClearColor(0x000000, 0); // 透明な背景
    
    // ポストプロセッシング設定（あれば）
    if (typeof THREE.EffectComposer !== 'undefined') {
      this.composer = new THREE.EffectComposer(this.renderer);
      const renderPass = new THREE.RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);
      
      // ブルームエフェクトの追加
      if (typeof THREE.UnrealBloomPass !== 'undefined') {
        const bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(this.width, this.height),
          0.3,   // 強度
          0.4,   // 半径
          0.85   // しきい値
        );
        this.composer.addPass(bloomPass);
      }
    }
  }
  
  // パーティクルテクスチャの作成
  createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2
    );
    
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(240,240,240,0.8)');
    gradient.addColorStop(0.4, 'rgba(200,200,200,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }
  
  // パーティクルの作成
  createParticles() {
    // ジオメトリの作成
    const geometry = new THREE.BufferGeometry();
    
    // 位置データとサイズデータ
    this.positions = new Float32Array(this.params.count * 3);
    this.velocities = [];
    this.sizes = new Float32Array(this.params.count);
    
    // 球面上にパーティクルを均等に配置
    for (let i = 0; i < this.params.count; i++) {
      const i3 = i * 3;
      
      // フィボナッチ分布を使用して球面上に均等に点を配置
      const phi = Math.acos(-1 + (2 * i) / this.params.count);
      const theta = Math.sqrt(this.params.count * Math.PI) * phi;
      
      // 半径はランダムに僅かに異なる値を設定（すべて完全に同じ半径だと自然さが失われる）
      const radius = this.params.sphereRadius * (0.75 + Math.random() * 0.35);
      
      // 球面座標を直交座標に変換
      this.positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      this.positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      this.positions[i3 + 2] = radius * Math.cos(phi);
      
      // 接線方向の初期速度
      const pos = new THREE.Vector3(
        this.positions[i3],
        this.positions[i3 + 1],
        this.positions[i3 + 2]
      );
      
      // 位置を正規化して方向ベクトルを得る
      const normalizedPos = pos.clone().normalize();
      
      // 上ベクトルを少しランダムにしてより自然な動きに
      const upVector = new THREE.Vector3(
        Math.random() - 0.5,
        1 + (Math.random() - 0.5) * 0.3,
        Math.random() - 0.5
      ).normalize();
      
      // 接線ベクトルを計算（位置ベクトルと上ベクトルの外積）
      const tangent = new THREE.Vector3().crossVectors(normalizedPos, upVector).normalize();
      
      // 接線方向の速度（回転に使用）
      const tangentSpeed = 0.03 + Math.random() * 0.04;
      
      // 速度を保存
      this.velocities.push({
        velocity: new THREE.Vector3(
          tangent.x * tangentSpeed,
          tangent.y * tangentSpeed,
          tangent.z * tangentSpeed
        ),
        acceleration: new THREE.Vector3(0, 0, 0)
      });
      
      // サイズをランダムに設定
      this.sizes[i] = this.params.size.min + Math.random() * (this.params.size.max - this.params.size.min);
    }
    
    // ジオメトリに位置とサイズを設定
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    
    // シェーダーマテリアルの作成
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(this.isDarkMode ? 0x4eff9e : 0xffffff) },
        pointTexture: { value: this.createParticleTexture() }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = vec3(1.0, 1.0, 1.0);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(color * vColor, 1.0);
          gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
          if (gl_FragColor.a < 0.1) discard;
        }
      `,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    
    // パーティクルシステムの作成
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
    
    // 接続線用のジオメトリとマテリアル
    const linesGeometry = new THREE.BufferGeometry();
    this.linePositions = new Float32Array(this.params.count * 2 * 3);
    this.lineColors = new Float32Array(this.params.count * 2 * 3);
    
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
    linesGeometry.setAttribute('color', new THREE.BufferAttribute(this.lineColors, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: this.params.connectionOpacity,
      depthWrite: false
    });
    
    // 接続線の作成
    this.lines = new THREE.LineSegments(linesGeometry, lineMaterial);
    this.scene.add(this.lines);
  }
  
  // イベントリスナーの追加
  addEventListeners() {
    // ウィンドウのリサイズ
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = this.container.clientHeight || window.innerHeight;
      
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      
      this.renderer.setSize(this.width, this.height);
      
      if (this.composer) {
        this.composer.setSize(this.width, this.height);
      }
    });
    
    // マウスの移動
    document.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / this.width) * 2 - 1;
      this.mouse.y = -(event.clientY / this.height) * 2 + 1;
    });
    
    // テーマ変更イベント
    document.addEventListener('themeChanged', () => {
      this.isDarkMode = document.body.classList.contains('dark-mode');
      
      // パーティクルの色を更新
      const color = this.isDarkMode ? 0x4eff9e : 0xffffff;
      this.particles.material.uniforms.color.value.setHex(color);
    });
  }
  
  // アニメーションループ
  animate() {
    // アニメーションフレームの登録
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // 時間の更新
    const delta = this.clock.getDelta();
    this.elapsedTime += delta;
    
    // パーティクルと接続線の更新
    this.updateParticles(delta);
    this.updateLines();
    
    // カメラの軽微な回転でより立体感を出す
    this.camera.position.x = Math.sin(this.elapsedTime * 0.1) * 3;
    this.camera.position.y = Math.sin(this.elapsedTime * 0.08) * 2;
    this.camera.lookAt(0, 0, 0);
    
    // シーンのレンダリング
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  // パーティクルの更新
  updateParticles(delta) {
    for (let i = 0; i < this.params.count; i++) {
      const i3 = i * 3;
      
      // 現在の位置
      const x = this.positions[i3];
      const y = this.positions[i3 + 1];
      const z = this.positions[i3 + 2];
      
      const position = new THREE.Vector3(x, y, z);
      
      // 中心からの距離を計算
      const distanceFromCenter = position.length();
      
      // 位置を正規化して方向ベクトルを取得
      const direction = position.clone().normalize();
      
      // 球面に引き戻す力（球形を維持するため）
      const targetRadius = this.params.sphereRadius;
      const sphericalForce = (targetRadius - distanceFromCenter) * 0.01;
      
      // 方向に沿って球面に戻る力を適用
      this.velocities[i].velocity.x += direction.x * sphericalForce;
      this.velocities[i].velocity.y += direction.y * sphericalForce;
      this.velocities[i].velocity.z += direction.z * sphericalForce;
      
      // 球面上での回転力を計算
      // 回転軸をランダム化して複雑な渦を作る
      const rotationAxis = new THREE.Vector3(
        Math.sin(this.elapsedTime * 0.1) * 0.2 + 0.1,
        1.0,
        Math.cos(this.elapsedTime * 0.15) * 0.2
      ).normalize();
      
      // 方向ベクトルと回転軸の外積で接線方向を得る
      const tangent = new THREE.Vector3().crossVectors(direction, rotationAxis).normalize();
      
      // 中心に近いほど速く回転
      const rotationStrength = this.params.rotationSpeed * (0.5 + 0.5 * Math.min(1, 1 - distanceFromCenter / targetRadius));
      
      // 接線方向に力を加える（渦巻きの回転力）
      this.velocities[i].velocity.x += tangent.x * rotationStrength;
      this.velocities[i].velocity.y += tangent.y * rotationStrength;
      this.velocities[i].velocity.z += tangent.z * rotationStrength;
      
      // 副次的な渦の力（より複雑な動きを作るため）
      const secondaryAxis = new THREE.Vector3(
        Math.sin(this.elapsedTime * 0.3 + i * 0.01),
        Math.cos(this.elapsedTime * 0.2 + i * 0.01),
        Math.sin(this.elapsedTime * 0.25 + i * 0.02)
      ).normalize();
      
      const secondaryTangent = new THREE.Vector3().crossVectors(direction, secondaryAxis).normalize();
      const secondaryStrength = rotationStrength * 0.3;
      
      this.velocities[i].velocity.x += secondaryTangent.x * secondaryStrength;
      this.velocities[i].velocity.y += secondaryTangent.y * secondaryStrength;
      this.velocities[i].velocity.z += secondaryTangent.z * secondaryStrength;
      
      // マウスの影響
      const mouseVector = new THREE.Vector3(
        this.mouse.x * this.params.sphereRadius,
        this.mouse.y * this.params.sphereRadius,
        this.params.sphereRadius * 0.5
      );
      
      const distToMouse = position.distanceTo(mouseVector);
      
      if (distToMouse < this.params.mouseInfluence) {
        const mouseDirection = new THREE.Vector3(
          mouseVector.x - x,
          mouseVector.y - y,
          mouseVector.z - z
        ).normalize();
        
        const strength = (1 - distToMouse / this.params.mouseInfluence) * 0.05;
        
        this.velocities[i].velocity.x += mouseDirection.x * strength;
        this.velocities[i].velocity.y += mouseDirection.y * strength;
        this.velocities[i].velocity.z += mouseDirection.z * strength;
      }
      
      // 全体的な波動効果
      const waveStrength = 0.01;
      this.velocities[i].velocity.x += Math.sin(this.elapsedTime * 0.5 + i * 0.1) * waveStrength;
      this.velocities[i].velocity.y += Math.cos(this.elapsedTime * 0.4 + i * 0.1) * waveStrength;
      this.velocities[i].velocity.z += Math.sin(this.elapsedTime * 0.3 + i * 0.1) * waveStrength;
      
      // 速度の制限
      const maxSpeed = 0.2;
      const speed = this.velocities[i].velocity.length();
      if (speed > maxSpeed) {
        this.velocities[i].velocity.multiplyScalar(maxSpeed / speed);
      }
      
      // 摩擦（減衰）を適用
      this.velocities[i].velocity.multiplyScalar(0.98);
      
      // 位置の更新
      this.positions[i3] += this.velocities[i].velocity.x;
      this.positions[i3 + 1] += this.velocities[i].velocity.y;
      this.positions[i3 + 2] += this.velocities[i].velocity.z;
      
      // 極端に遠くに行ったパーティクルを球面上に戻す
      if (distanceFromCenter > this.params.sphereRadius * 2) {
        // 新しい球面上の位置を計算
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        const r = this.params.sphereRadius * (0.8 + Math.random() * 0.3);
        
        // 座標の更新
        this.positions[i3] = r * Math.sin(theta) * Math.cos(phi);
        this.positions[i3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        this.positions[i3 + 2] = r * Math.cos(theta);
        
        // 速度のリセット
        this.velocities[i].velocity.set(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        );
      }
    }
    
    // ジオメトリの更新
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
  
  // 接続線の更新
  updateLines() {
    let vertexPos = 0;
    const color = new THREE.Color(this.isDarkMode ? 0x4eff9e : 0xffffff);
    
    // パーティクル間の接続
    for (let i = 0; i < this.params.count; i++) {
      const i3 = i * 3;
      
      const pos1 = new THREE.Vector3(
        this.positions[i3],
        this.positions[i3 + 1],
        this.positions[i3 + 2]
      );
      
      // 近いパーティクルとのみ接続
      for (let j = i + 1; j < this.params.count; j++) {
        const j3 = j * 3;
        
        const pos2 = new THREE.Vector3(
          this.positions[j3],
          this.positions[j3 + 1],
          this.positions[j3 + 2]
        );
        
        // 距離の計算
        const distance = pos1.distanceTo(pos2);
        
        // 最大距離内の場合のみ線を描画
        if (distance < this.params.maxDistance) {
          // 距離に応じた透明度の設定
          const alpha = 1.0 - distance / this.params.maxDistance;
          
          // 線の始点
          this.linePositions[vertexPos] = pos1.x;
          this.linePositions[vertexPos + 1] = pos1.y;
          this.linePositions[vertexPos + 2] = pos1.z;
          
          // 始点の色
          this.lineColors[vertexPos] = color.r * alpha;
          this.lineColors[vertexPos + 1] = color.g * alpha;
          this.lineColors[vertexPos + 2] = color.b * alpha;
          
          // 次の頂点位置に進む
          vertexPos += 3;
          
          // 線の終点
          this.linePositions[vertexPos] = pos2.x;
          this.linePositions[vertexPos + 1] = pos2.y;
          this.linePositions[vertexPos + 2] = pos2.z;
          
          // 終点の色
          this.lineColors[vertexPos] = color.r * alpha;
          this.lineColors[vertexPos + 1] = color.g * alpha;
          this.lineColors[vertexPos + 2] = color.b * alpha;
          
          // 次の頂点位置に進む
          vertexPos += 3;
        }
      }
    }
    
    // 使用されていない線を非表示に
    for (let i = vertexPos; i < this.linePositions.length; i++) {
      this.linePositions[i] = 0;
      this.lineColors[i] = 0;
    }
    
    // 線のジオメトリ更新
    this.lines.geometry.attributes.position.needsUpdate = true;
    this.lines.geometry.attributes.color.needsUpdate = true;
  }
  
  // リソースのクリーンアップ
  cleanup() {
    // アニメーションループの停止
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // イベントリスナーの削除
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('mousemove', this.onMouseMove);
    
    // シーンからオブジェクトを削除
    if (this.scene) {
      if (this.particles) {
        this.scene.remove(this.particles);
        this.particles.geometry.dispose();
        this.particles.material.dispose();
      }
      
      if (this.lines) {
        this.scene.remove(this.lines);
        this.lines.geometry.dispose();
        this.lines.material.dispose();
      }
    }
    
    // レンダラーの破棄
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    console.log('Particle system cleaned up');
  }
}

// テーマ切り替えイベントのディスパッチ
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  document.dispatchEvent(new CustomEvent('themeChanged'));
});