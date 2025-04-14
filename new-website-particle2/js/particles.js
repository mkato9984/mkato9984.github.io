/**
 * Three.jsを使用した素粒子アニメーション
 * ヒーローセクションの背景に動的な3D素粒子エフェクトを表示
 */

class ParticleSystem {
  constructor(containerId = 'cyber-grid-bg') {
    // 初期化
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with id '${containerId}' not found.`);
      return;
    }

    // スクリーンサイズの取得
    this.width = window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    
    // シーン、カメラ、レンダラーの設定
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 30;
    
    // レンダラーの設定
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
    
    // マウスの座標
    this.mouse = new THREE.Vector2(0, 0);
    
    // パーティクルの設定
    this.particlesData = {
      count: 1500,           // パーティクルの数
      size: 0.2,             // パーティクルのサイズ
      color: 0xffffff,       // パーティクルの色
      maxDistance: 15,       // パーティクルの最大表示距離
      connectionOpacity: 0.15, // 接続線の透明度
      hoverRadius: 5         // マウスホバーの影響半径
    };
    
    // ダークモード設定
    this.isDarkMode = document.body.classList.contains('dark-mode');
    
    // パーティクルの初期化
    this.particles = null;
    this.particlePositions = null;
    this.lines = null;
    this.linePositions = null;
    this.lineColors = null;
    
    // イベントリスナーの設定
    this.addEventListeners();
    
    // パーティクルの作成
    this.createParticles();
    
    // アニメーションループの開始
    this.animate();
    
    console.log('Particle system initialized');
  }
  
  // イベントリスナーの設定
  addEventListeners() {
    // ウィンドウのリサイズ時
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = this.container.clientHeight || window.innerHeight;
      
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      
      this.renderer.setSize(this.width, this.height);
    });
    
    // マウスの移動時
    document.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / this.width) * 2 - 1;
      this.mouse.y = -(event.clientY / this.height) * 2 + 1;
    });
    
    // テーマの変更時にカラーを更新
    document.addEventListener('themeChanged', () => {
      this.isDarkMode = document.body.classList.contains('dark-mode');
      this.updateParticleColors();
    });
  }
  
  // パーティクルの色を更新
  updateParticleColors() {
    // ダークモードの場合は明るい色、ライトモードの場合は暗い色
    const particleColor = this.isDarkMode ? 0x4eff9e : 0xffffff;
    this.particles.material.color.setHex(particleColor);
  }
  
  // パーティクルの作成
  createParticles() {
    // ジオメトリの作成
    const particleGeometry = new THREE.BufferGeometry();
    
    // 頂点の位置と速度
    this.particlePositions = new Float32Array(this.particlesData.count * 3);
    const particleVelocities = new Float32Array(this.particlesData.count * 3);
    
    // ランダムな位置と速度の設定
    for (let i = 0; i < this.particlesData.count; i++) {
      const i3 = i * 3;
      
      // ランダムな位置 (-25, 25)
      this.particlePositions[i3] = (Math.random() - 0.5) * 50;
      this.particlePositions[i3 + 1] = (Math.random() - 0.5) * 50;
      this.particlePositions[i3 + 2] = (Math.random() - 0.5) * 50;
      
      // ランダムな速度
      particleVelocities[i3] = (Math.random() - 0.5) * 0.05;
      particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.05;
      particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.05;
    }
    
    // ジオメトリに位置を設定
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    
    // マテリアルの作成
    const particleMaterial = new THREE.PointsMaterial({
      color: this.isDarkMode ? 0x4eff9e : 0xffffff,
      size: this.particlesData.size,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true,
      depthWrite: false
    });
    
    // テクスチャの設定 (滑らかな円形のパーティクル)
    const textureLoader = new THREE.TextureLoader();
    const particleTexture = textureLoader.load('data:image/png;base64,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');
    
    if (particleTexture) {
      particleMaterial.map = particleTexture;
      particleMaterial.alphaMap = particleTexture;
      particleMaterial.alphaTest = 0.01;
    }
    
    // パーティクルの作成
    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particles);
    
    // パーティクル間の接続線のジオメトリ
    const linesGeometry = new THREE.BufferGeometry();
    this.linePositions = new Float32Array(this.particlesData.count * 2 * 3);
    this.lineColors = new Float32Array(this.particlesData.count * 2 * 3);
    
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
    linesGeometry.setAttribute('color', new THREE.BufferAttribute(this.lineColors, 3));
    
    // 線のマテリアル
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: this.particlesData.connectionOpacity,
      depthWrite: false
    });
    
    // 線の作成
    this.lines = new THREE.LineSegments(linesGeometry, lineMaterial);
    this.scene.add(this.lines);
    
    // パーティクルのデータを内部に保存
    this.animationData = [];
    for (let i = 0; i < this.particlesData.count; i++) {
      this.animationData.push({
        velocity: new THREE.Vector3(
          particleVelocities[i * 3],
          particleVelocities[i * 3 + 1],
          particleVelocities[i * 3 + 2]
        ),
        numConnections: 0
      });
    }
  }
  
  // アニメーションループ
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    this.updateParticles();
    this.updateLines();
    
    this.renderer.render(this.scene, this.camera);
  }
  
  // パーティクルの更新
  updateParticles() {
    // パーティクルを移動
    for (let i = 0; i < this.particlesData.count; i++) {
      const i3 = i * 3;
      
      // 現在の位置
      const x = this.particlePositions[i3];
      const y = this.particlePositions[i3 + 1];
      const z = this.particlePositions[i3 + 2];
      
      // マウスの位置を3D空間に投影
      const mouseVector = new THREE.Vector3(this.mouse.x * 30, this.mouse.y * 30, 0);
      
      // パーティクルとマウスの距離
      const dist = mouseVector.distanceTo(new THREE.Vector3(x, y, z));
      
      // マウスに近い場合は引き寄せる
      if (dist < this.particlesData.hoverRadius) {
        // マウスからの方向ベクトル
        const direction = new THREE.Vector3(
          mouseVector.x - x,
          mouseVector.y - y,
          mouseVector.z - z
        ).normalize();
        
        // 速度を調整
        this.animationData[i].velocity.x += direction.x * 0.001;
        this.animationData[i].velocity.y += direction.y * 0.001;
        this.animationData[i].velocity.z += direction.z * 0.001;
      }
      
      // 移動量の適用
      this.particlePositions[i3] += this.animationData[i].velocity.x;
      this.particlePositions[i3 + 1] += this.animationData[i].velocity.y;
      this.particlePositions[i3 + 2] += this.animationData[i].velocity.z;
      
      // パーティクルが画面外に出たら反対側に戻す
      if (this.particlePositions[i3] < -25) {
        this.particlePositions[i3] = 25;
      } else if (this.particlePositions[i3] > 25) {
        this.particlePositions[i3] = -25;
      }
      
      if (this.particlePositions[i3 + 1] < -25) {
        this.particlePositions[i3 + 1] = 25;
      } else if (this.particlePositions[i3 + 1] > 25) {
        this.particlePositions[i3 + 1] = -25;
      }
      
      if (this.particlePositions[i3 + 2] < -25) {
        this.particlePositions[i3 + 2] = 25;
      } else if (this.particlePositions[i3 + 2] > 25) {
        this.particlePositions[i3 + 2] = -25;
      }
      
      // 接続数のリセット
      this.animationData[i].numConnections = 0;
    }
    
    // パーティクルの位置を更新
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
  
  // 接続線の更新
  updateLines() {
    let vertexPosition = 0;
    const particleColor = new THREE.Color(this.isDarkMode ? 0x4eff9e : 0xffffff);
    
    // すべてのパーティクル間の距離をチェック
    for (let i = 0; i < this.particlesData.count; i++) {
      const i3 = i * 3;
      this.animationData[i].numConnections = 0;
      
      // パーティクルiの位置
      const px1 = this.particlePositions[i3];
      const py1 = this.particlePositions[i3 + 1];
      const pz1 = this.particlePositions[i3 + 2];
      
      // 他のすべてのパーティクルとの距離をチェック
      for (let j = i + 1; j < this.particlesData.count; j++) {
        const j3 = j * 3;
        
        // パーティクルjの位置
        const px2 = this.particlePositions[j3];
        const py2 = this.particlePositions[j3 + 1];
        const pz2 = this.particlePositions[j3 + 2];
        
        // 2点間の距離を計算
        const dx = px1 - px2;
        const dy = py1 - py2;
        const dz = pz1 - pz2;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // 距離が閾値より小さい場合は線を描画
        if (dist < this.particlesData.maxDistance) {
          // 接続数をカウント
          this.animationData[i].numConnections++;
          this.animationData[j].numConnections++;
          
          // 距離に基づいて不透明度を設定
          const alpha = 1.0 - (dist / this.particlesData.maxDistance);
          
          // 線の始点
          this.linePositions[vertexPosition++] = px1;
          this.linePositions[vertexPosition++] = py1;
          this.linePositions[vertexPosition++] = pz1;
          
          // 線の色（始点）
          this.lineColors[vertexPosition - 3] = particleColor.r;
          this.lineColors[vertexPosition - 2] = particleColor.g;
          this.lineColors[vertexPosition - 1] = particleColor.b;
          
          // 線の終点
          this.linePositions[vertexPosition++] = px2;
          this.linePositions[vertexPosition++] = py2;
          this.linePositions[vertexPosition++] = pz2;
          
          // 線の色（終点）
          this.lineColors[vertexPosition - 3] = particleColor.r;
          this.lineColors[vertexPosition - 2] = particleColor.g;
          this.lineColors[vertexPosition - 1] = particleColor.b;
        }
      }
    }
    
    // 残りの頂点は非表示にする
    for (let i = vertexPosition; i < this.linePositions.length; i++) {
      this.linePositions[i] = 0;
      this.lineColors[i] = 0;
    }
    
    // 頂点データを更新
    this.lines.geometry.attributes.position.needsUpdate = true;
    this.lines.geometry.attributes.color.needsUpdate = true;
  }
}

// パーティクルシステムのインスタンス
let particleSystem;

// DOM読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
  // 既存のThreeJSリソースが読み込まれてから初期化
  const checkThreeJs = () => {
    if (typeof THREE !== 'undefined') {
      // Heroセクションが表示された後に初期化
      const heroSection = document.querySelector('.hero');
      if (heroSection) {
        // キャンバス要素を確認
        const canvas = document.getElementById('cyber-grid-bg');
        if (canvas) {
          // 既存のサイバーグリッドスクリプトが初期化されないように
          canvas.setAttribute('data-particle-initialized', 'true');
          
          // パーティクルシステムを初期化
          particleSystem = new ParticleSystem('cyber-grid-bg');
        }
      }
    } else {
      // Three.jsがまだ読み込まれていない場合は少し待ってから再試行
      setTimeout(checkThreeJs, 100);
    }
  };
  
  checkThreeJs();
});

// テーマ切り替えイベントのディスパッチ
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  // テーマ変更イベントをディスパッチ
  document.dispatchEvent(new CustomEvent('themeChanged'));
});