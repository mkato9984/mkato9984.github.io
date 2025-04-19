// 3Dサイバー空間の格子状背景を生成するファイル
const gridConfig = {
  // 色の設定（既存の色を維持）
  baseColor: '#97C4FB',
  accentColor: '#2575FC',
  dreamColor1: '#5D9DF5',
  dreamColor2: '#83B7FF',
  dreamColor3: '#3D89FF',
  glowColor: 'rgba(240, 250, 255, 0.5)',
  
  // 格子の設定
  gridSize: 1500, // さらに巨大なキューブサイズ（画面から大きくはみ出すサイズに増加）
  gridDivisions: 10, // 分割数を増加させてより詳細な格子に
  gridLayers: 2, // 層の数
  lineWidth: 1.6, // 線の太さを少し増加
  perspective: 1200, // パースペクティブをさらに調整
  
  // 点の設定
  pointCount: 200, // 点の数を増加
  pointSize: 2.5, // 点のサイズを大きく
  pointMinSize: 1.0, // 点の最小サイズ
  pointMaxSize: 3.0, // 点の最大サイズ
  
  // アニメーション設定（よりゆったりした動き）- 速度をさらに75%減少
  rotationSpeedX: 0.000004, // X軸回転速度を減少
  rotationSpeedY: 0.000005, // Y軸回転速度を減少
  rotationSpeedZ: 0.0000025, // Z軸回転速度を減少
  pulseSpeed: 0.0000375, // パルスの速度を減少
  flowSpeed: 0.015, // 点の流れる速度を減少
  
  // エフェクト設定
  glowStrength: 0.8, // 発光の強さを少し増加
  connectionMaxDistance: 120, // 接続線の最大距離を増加
  connectionOpacity: 0.28, // 接続線の不透明度を少し増加
  mouseInfluence: 250, // マウスの影響範囲を拡大
  mouseStrength: 0.15, // マウスの影響の強さ
  
  // 最適化設定
  fpsLimit: 30, // FPS制限
  cullingDistance: 5000, // 描画距離の制限（より遠くまで）
  maxConnections: 70, // 最大接続数を増加
  
  // エフェクト有効/無効
  usePulseEffect: true,
  useGlowEffect: true,
  useFlowEffect: true,
  useMouseEffect: true,
  
  // パフォーマンス設定
  performanceMode: 'balanced',
  
  // 視点設定（キューブの中にいる感覚を強める）
  insideCube: true, // キューブの内部視点を有効に
  cameraPosition: { x: 0, y: 0, z: 0 }, // カメラは中心に
  
  // ブレンドモード
  blendMode: 'screen'
};

// パフォーマンスモードに基づいてパラメータを調整
(function adjustPerformance() {
  const mode = gridConfig.performanceMode;
  if (mode === 'high') {
    gridConfig.pointCount = 200;
    gridConfig.maxConnections = 80;
  } else if (mode === 'low') {
    gridConfig.pointCount = 100;
    gridConfig.maxConnections = 30;
    gridConfig.useGlowEffect = false;
  }
})();

// サイバーグリッドクラス
class CyberGrid {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.config = config;
    
    // 基本設定
    this.time = 0;
    this.rotation = { x: 0, y: 0, z: 0 };
    this.lastFrameTime = 0;
    this.frameInterval = 1000 / this.config.fpsLimit;
    
    // マウス状態
    this.mouse = {
      x: this.width / 2,
      y: this.height / 2,
      active: false,
      speed: 0,
      lastX: 0,
      lastY: 0
    };
    
    // 3D要素
    this.cubes = [];     // 立方体構造
    this.points = [];    // 浮遊する点
    this.connections = []; // 接続線
    this.flowPoints = []; // 流れる点
    
    // 初期化
    this.initCubes();
    this.initPoints();
    this.initFlowPoints();
    this.setupEventListeners();
  }
  
  // 立方体構造の初期化
  initCubes() {
    const { gridSize, gridDivisions, gridLayers, insideCube } = this.config;
    this.cubes = [];
    
    // 大きな立方体を生成（内側にいる感覚のための単一の立方体）
    const cube = {
      size: gridSize,
      vertices: [],
      edges: [],
      pulseOffset: 0,
      pulseSpeed: 0.0005,
      pulsePhase: 0,
      color: this.config.baseColor
    };
    
    // 立方体の頂点
    const halfSize = gridSize / 2;
    const divisions = gridDivisions;
    const step = gridSize / divisions;
    
    // グリッドの各交点を頂点として追加
    for (let x = 0; x <= divisions; x++) {
      for (let y = 0; y <= divisions; y++) {
        for (let z = 0; z <= divisions; z++) {
          // 立方体の表面（外側）の頂点のみ追加
          if (x === 0 || x === divisions || 
              y === 0 || y === divisions || 
              z === 0 || z === divisions) {
              
            // 内側にいる感覚を強めるために座標を反転（内側から見るように）
            const vertexX = insideCube ? -(-halfSize + x * step) : -halfSize + x * step;
            const vertexY = insideCube ? -(-halfSize + y * step) : -halfSize + y * step;
            const vertexZ = insideCube ? -(-halfSize + z * step) : -halfSize + z * step;
            
            cube.vertices.push({
              x: vertexX,
              y: vertexY,
              z: vertexZ,
              size: 1.2, // やや大きめの頂点
              color: this.getVertexColor(x, y, z, divisions),
              glowing: (x + y + z) % 4 === 0 // 一部の頂点だけ発光
            });
          }
        }
      }
    }
    
    // 立方体の辺（頂点同士の接続）
    const tolerance = 0.001;
    for (let i = 0; i < cube.vertices.length; i++) {
      const v1 = cube.vertices[i];
      
      for (let j = i + 1; j < cube.vertices.length; j++) {
        const v2 = cube.vertices[j];
        
        // 同一軸上にあるエッジを接続
        const sameX = Math.abs(v1.x - v2.x) < tolerance;
        const sameY = Math.abs(v1.y - v2.y) < tolerance;
        const sameZ = Math.abs(v1.z - v2.z) < tolerance;
        
        // X, Y, Zのうち2つが同じなら接続
        const diffCount = (sameX ? 0 : 1) + (sameY ? 0 : 1) + (sameZ ? 0 : 1);
        if (diffCount === 1) {
          // 距離をチェックして近い点のみ接続
          const dx = v1.x - v2.x;
          const dy = v1.y - v2.y;
          const dz = v1.z - v2.z;
          const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
          
          if (distance < step * 1.01) { // 誤差を考慮
            cube.edges.push({
              from: i,
              to: j,
              color: this.getEdgeColor(v1, v2)
            });
          }
        }
      }
    }
    
    this.cubes.push(cube);
    
    // 内側にもう一つ小さな立方体を追加（二重構造に）
    if (gridLayers > 1) {
      const innerCube = {
        size: gridSize * 0.6,
        vertices: [],
        edges: [],
        pulseOffset: 0,
        pulseSpeed: 0.0007,
        pulsePhase: Math.PI / 2,
        color: this.config.accentColor
      };
      
      const innerHalfSize = innerCube.size / 2;
      const innerDivisions = gridDivisions - 2;
      const innerStep = innerCube.size / innerDivisions;
      
      // 内側の立方体の頂点
      for (let x = 0; x <= innerDivisions; x++) {
        for (let y = 0; y <= innerDivisions; y++) {
          for (let z = 0; z <= innerDivisions; z++) {
            // 立方体の表面のみ
            if (x === 0 || x === innerDivisions || 
                y === 0 || y === innerDivisions || 
                z === 0 || z === innerDivisions) {
                
              // 内側から見るための座標反転
              const vertexX = insideCube ? -(-innerHalfSize + x * innerStep) : -innerHalfSize + x * innerStep;
              const vertexY = insideCube ? -(-innerHalfSize + y * innerStep) : -innerHalfSize + y * innerStep;
              const vertexZ = insideCube ? -(-innerHalfSize + z * innerStep) : -innerHalfSize + z * innerStep;
              
              innerCube.vertices.push({
                x: vertexX,
                y: vertexY,
                z: vertexZ,
                size: 1.0,
                color: this.getInnerVertexColor(x, y, z, innerDivisions),
                glowing: (x + y + z) % 3 === 0 // 内側はより多くの点が発光
              });
            }
          }
        }
      }
      
      // 内側の立方体の辺
      for (let i = 0; i < innerCube.vertices.length; i++) {
        const v1 = innerCube.vertices[i];
        
        for (let j = i + 1; j < innerCube.vertices.length; j++) {
          const v2 = innerCube.vertices[j];
          
          const sameX = Math.abs(v1.x - v2.x) < tolerance;
          const sameY = Math.abs(v1.y - v2.y) < tolerance;
          const sameZ = Math.abs(v1.z - v2.z) < tolerance;
          
          const diffCount = (sameX ? 0 : 1) + (sameY ? 0 : 1) + (sameZ ? 0 : 1);
          if (diffCount === 1) {
            const dx = v1.x - v2.x;
            const dy = v1.y - v2.y;
            const dz = v1.z - v2.z;
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            if (distance < innerStep * 1.01) {
              innerCube.edges.push({
                from: i,
                to: j,
                color: this.getEdgeColor(v1, v2)
              });
            }
          }
        }
      }
      
      this.cubes.push(innerCube);
    }
  }
  
  // 頂点の色を決定するヘルパー
  getVertexColor(x, y, z, divisions) {
    // 特定のパターンで頂点に色を割り当て
    if (x === 0 && y === 0 || x === divisions && y === divisions) {
      return this.config.accentColor;
    } else if (z === 0 && (x + y) % 2 === 0) {
      return this.config.dreamColor1;
    } else if (z === divisions && (x + y) % 2 === 0) {
      return this.config.dreamColor2;
    } else if ((x === 0 || x === divisions) && (y === 0 || y === divisions)) {
      return this.config.dreamColor3;
    }
    return this.config.baseColor;
  }
  
  // 内側立方体の頂点色を決定するヘルパー
  getInnerVertexColor(x, y, z, divisions) {
    // 内側の立方体は異なる色パターン
    if (x === 0 && y === 0 || x === divisions && y === divisions) {
      return this.config.dreamColor2;
    } else if (z === 0 && (x + y) % 2 === 0) {
      return this.config.dreamColor3;
    } else if (z === divisions && (x + y) % 2 === 0) {
      return this.config.accentColor;
    }
    return this.config.dreamColor1;
  }
  
  // エッジの色を決定するヘルパー
  getEdgeColor(v1, v2) {
    // 頂点の色からエッジの色を決定
    return v1.color || v2.color || this.config.baseColor;
  }
  
  // 浮遊する点の初期化
  initPoints() {
    const { pointCount } = this.config;
    this.points = [];
    
    // キューブの内部に点を配置（「中にいる」感覚を強化）
    const areaSize = this.config.gridSize * 0.8; // 立方体よりやや小さい範囲に
    
    for (let i = 0; i < pointCount; i++) {
      // 立方体の内部に均一に点を配置
      const x = (Math.random() - 0.5) * areaSize;
      const y = (Math.random() - 0.5) * areaSize;
      const z = (Math.random() - 0.5) * areaSize;
      
      const point = {
        x: x,
        y: y,
        z: z,
        originalX: x,
        originalY: y,
        originalZ: z,
        size: Math.random() * (this.config.pointMaxSize - this.config.pointMinSize) + this.config.pointMinSize,
        color: this.getRandomColor(),
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.001 + 0.0005, // よりゆっくりした脈動
        pulseAmount: Math.random() * 0.3 + 0.7,
        flowOffset: Math.random() * Math.PI * 2,
        flowSpeed: Math.random() * 0.003 + 0.001, // よりゆっくりした流れ
        connections: []
      };
      
      this.points.push(point);
    }
    
    // 点同士の接続を計算
    this.updateConnections();
  }
  
  // 流れる点の初期化
  initFlowPoints() {
    if (!this.config.useFlowEffect) return;
    
    this.flowPoints = [];
    const count = Math.floor(this.config.pointCount / 6); // より少なく
    
    for (let i = 0; i < count; i++) {
      this.createFlowPoint();
    }
  }
  
  // 新しい流れる点を作成
  createFlowPoint() {
    const areaSize = this.config.gridSize * 0.7;
    
    // 内部から外側に向かって流れる点を作成
    // 球状に分布
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = areaSize * 0.2 * Math.random(); // 中心付近から発生
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    this.flowPoints.push({
      x: x,
      y: y,
      z: z,
      direction: { // 流れる方向（外側へ）
        x: x,
        y: y,
        z: z
      },
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * this.config.flowSpeed * 0.3 + 0.1, // よりゆっくり
      color: this.getRandomColor(),
      trail: [],
      maxTrail: Math.floor(Math.random() * 5) + 3 // 軌跡の長さ
    });
  }
  
  // 点同士の接続を更新
  updateConnections() {
    this.connections = [];
    
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      point.connections = [];
      
      // 近い点を探す
      const maxDist = this.config.connectionMaxDistance;
      
      for (let j = i + 1; j < this.points.length; j++) {
        const other = this.points[j];
        const dx = point.x - other.x;
        const dy = point.y - other.y;
        const dz = point.z - other.z;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (distance < maxDist) {
          // 接続を追加
          const connection = {
            from: i,
            to: j,
            distance: distance,
            opacity: Math.max(0.1, 1 - (distance / maxDist)) * this.config.connectionOpacity
          };
          
          this.connections.push(connection);
          
          // 最大接続数を超えたら終了
          if (this.connections.length >= this.config.maxConnections) {
            return;
          }
        }
      }
    }
  }
  
  // イベントリスナーの設定
  setupEventListeners() {
    // マウス移動
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // マウス速度の計算
      if (this.mouse.active) {
        const dx = x - this.mouse.lastX;
        const dy = y - this.mouse.lastY;
        this.mouse.speed = Math.sqrt(dx*dx + dy*dy) * 0.1;
      }
      
      this.mouse.lastX = x;
      this.mouse.lastY = y;
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.active = true;
    });
    
    // マウス離脱
    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    });
    
    // クリック
    this.canvas.addEventListener('click', () => {
      this.createExplosion(this.mouse.x, this.mouse.y);
    });
    
    // リサイズ
    window.addEventListener('resize', () => {
      this.resize();
    });
  }
  
  // クリック時の爆発エフェクト
  createExplosion(x, y) {
    const worldX = (x / this.width * 2 - 1) * this.config.gridSize * 0.3;
    const worldY = (y / this.height * 2 - 1) * this.config.gridSize * 0.3;
    
    // 爆発の中心から放射状に点を生成
    const explosionPoints = 12; // 少なめに
    for (let i = 0; i < explosionPoints; i++) {
      const angle = (i / explosionPoints) * Math.PI * 2;
      const speed = Math.random() * 1.5 + 1; // よりゆっくり
      const size = Math.random() * 2 + 1;
      
      this.flowPoints.push({
        x: worldX,
        y: worldY,
        z: -50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: (Math.random() - 0.5) * speed,
        size: size,
        speed: 0,
        lifespan: 150, // 長寿命化
        age: 0,
        color: this.getRandomColor(),
        trail: [],
        maxTrail: Math.floor(Math.random() * 6) + 5
      });
    }
    
    // 接続の更新
    setTimeout(() => this.updateConnections(), 100);
  }
  
  // キャンバスのリサイズ
  resize() {
    const heroSection = this.canvas.parentElement;
    this.width = heroSection.offsetWidth;
    this.height = heroSection.offsetHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // 再初期化
    this.initCubes();
    this.updateConnections();
  }
  
  // ランダムな色を取得
  getRandomColor() {
    const colors = [
      this.config.baseColor,
      this.config.accentColor,
      this.config.dreamColor1,
      this.config.dreamColor2,
      this.config.dreamColor3
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // 色の透明度を調整
  adjustColorOpacity(color, opacity) {
    // HEXカラーからRGBAに変換
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // 更新処理
  update(timestamp) {
    // FPS制限
    const elapsed = timestamp - this.lastFrameTime;
    if (elapsed < this.frameInterval) return;
    this.lastFrameTime = timestamp - (elapsed % this.frameInterval);
    
    this.time += 0.005; // よりゆっくりした時間経過
    
    // 回転角度の更新（非常にゆっくり）
    this.rotation.x += this.config.rotationSpeedX * elapsed;
    this.rotation.y += this.config.rotationSpeedY * elapsed;
    this.rotation.z += this.config.rotationSpeedZ * elapsed;
    
    // マウスの動きを回転角度に反映（より柔らかい反応に）
    if (this.config.useMouseEffect && this.mouse.active) {
      const mouseXNorm = this.mouse.x / this.width * 2 - 1;
      const mouseYNorm = this.mouse.y / this.height * 2 - 1;
      
      // マウスの位置に応じて回転を調整（より穏やかに）
      this.rotation.x += mouseYNorm * 0.0001 * elapsed;
      this.rotation.y += mouseXNorm * 0.0001 * elapsed;
    }
    
    // 立方体の更新
    for (const cube of this.cubes) {
      // パルスエフェクト
      if (this.config.usePulseEffect) {
        cube.pulseOffset = Math.sin(this.time * cube.pulseSpeed + cube.pulsePhase) * 5;
      }
    }
    
    // 点の更新
    for (const point of this.points) {
      // パルスエフェクト
      if (this.config.usePulseEffect) {
        point.pulse = Math.sin(this.time * point.pulseSpeed + point.pulsePhase) * 0.2 + 0.8;
      } else {
        point.pulse = 1;
      }
      
      // フローエフェクト（より小さな動き）
      if (this.config.useFlowEffect) {
        const flowX = Math.sin(this.time * point.flowSpeed + point.flowOffset);
        const flowY = Math.cos(this.time * point.flowSpeed * 0.7 + point.flowOffset);
        const flowZ = Math.sin(this.time * point.flowSpeed * 0.5 + point.flowOffset + Math.PI/4);
        
        point.x = point.originalX + flowX * 5;
        point.y = point.originalY + flowY * 5;
        point.z = point.originalZ + flowZ * 5;
      }
      
      // マウス効果（より穏やかな反応） 
      if (this.config.useMouseEffect && this.mouse.active) {
        const mouseX = (this.mouse.x / this.width * 2 - 1) * this.config.gridSize * 0.2;
        const mouseY = (this.mouse.y / this.height * 2 - 1) * this.config.gridSize * 0.2;
        
        // 2D空間でのマウスを3D空間に変換
        const mouseVector = this.unproject(this.mouse.x, this.mouse.y, 0);
        
        // 回転を考慮した点の座標
        const rotated = this.rotate3D(point.x, point.y, point.z);
        
        // 点とマウスの距離
        const dx = rotated.x - mouseVector.x;
        const dy = rotated.y - mouseVector.y;
        const dz = rotated.z;
        
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // 近い点はマウスに引き寄せられる
        if (dist < this.config.mouseInfluence) {
          const factor = (1 - dist / this.config.mouseInfluence) * this.config.mouseStrength;
          point.mouseOffsetX = dx * factor * -0.5;
          point.mouseOffsetY = dy * factor * -0.5;
          point.mouseOffsetZ = dz * factor * -0.2;
        } else {
          point.mouseOffsetX = 0;
          point.mouseOffsetY = 0;
          point.mouseOffsetZ = 0;
        }
      }
    }
    
    // 接続の定期的な更新（より少ない頻度で）
    if (this.time % 5 < 0.01) {
      this.updateConnections();
    }
    
    // 流れる点の更新
    if (this.config.useFlowEffect) {
      for (let i = this.flowPoints.length - 1; i >= 0; i--) {
        const point = this.flowPoints[i];
        
        // 通常の流れる点
        if (!point.vx) {
          // 方向に沿って動く
          if (point.direction) {
            const length = Math.sqrt(
              point.direction.x * point.direction.x + 
              point.direction.y * point.direction.y + 
              point.direction.z * point.direction.z
            );
            
            if (length > 0) {
              const dx = point.direction.x / length;
              const dy = point.direction.y / length;
              const dz = point.direction.z / length;
              
              point.x += dx * point.speed;
              point.y += dy * point.speed;
              point.z += dz * point.speed;
            }
          }
          
          // 軌跡の保存
          if (point.trail.length > (point.maxTrail || 5)) {
            point.trail.shift();
          }
          point.trail.push({x: point.x, y: point.y, z: point.z});
          
          // 範囲外に出たら再配置
          const maxDist = this.config.gridSize * 0.6;
          if (Math.abs(point.x) > maxDist || 
              Math.abs(point.y) > maxDist || 
              Math.abs(point.z) > maxDist) {
            this.flowPoints.splice(i, 1);
            this.createFlowPoint();
          }
        } 
        // 爆発エフェクトの点
        else {
          point.x += point.vx * 0.5; // 速度を半減
          point.y += point.vy * 0.5;
          point.z += point.vz * 0.5;
          point.age++;
          
          // 速度減衰
          point.vx *= 0.98;
          point.vy *= 0.98;
          point.vz *= 0.98;
          
          // 軌跡の保存
          if (point.trail.length > (point.maxTrail || 7)) {
            point.trail.shift();
          }
          point.trail.push({x: point.x, y: point.y, z: point.z});
          
          // 寿命が来たら削除
          if (point.age > point.lifespan) {
            this.flowPoints.splice(i, 1);
          }
        }
      }
      
      // 定期的に新しい点を追加（より少ない頻度で）
      if (Math.random() < 0.01) {
        this.createFlowPoint();
      }
    }
  }
  
  // 描画処理
  draw() {
    const { blendMode, useGlowEffect } = this.config;
    
    // キャンバスをクリア
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    if (blendMode) {
      this.ctx.globalCompositeOperation = blendMode;
    }
    
    // 立方体を描画
    this.drawCubes();
    
    // 点と接続を描画
    this.drawPointsAndConnections();
    
    // 流れる点を描画
    if (this.config.useFlowEffect) {
      this.drawFlowPoints();
    }
    
    // 全体的なグロー効果
    if (useGlowEffect) {
      this.ctx.save();
      this.ctx.globalCompositeOperation = 'lighter';
      
      // 中心に薄いグローエフェクト
      const gradient = this.ctx.createRadialGradient(
        this.width/2, this.height/2, 0,
        this.width/2, this.height/2, this.width/2
      );
      gradient.addColorStop(0, 'rgba(150, 200, 255, 0.04)');
      gradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.02)');
      gradient.addColorStop(1, 'rgba(50, 100, 255, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.restore();
    }
    
    // ブレンドモードをリセット
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  // 立方体の描画
  drawCubes() {
    for (const cube of this.cubes) {
      // 頂点の計算（回転とパルスを適用）
      const adjustedSize = cube.size + (cube.pulseOffset || 0);
      
      // 頂点を描画用にソート（Z座標でソート）
      const projectedVertices = cube.vertices.map((vertex, index) => {
        // スケール調整
        const x = vertex.x * (adjustedSize / cube.size);
        const y = vertex.y * (adjustedSize / cube.size);
        const z = vertex.z * (adjustedSize / cube.size);
        
        // 回転を適用
        const rotated = this.rotate3D(x, y, z);
        
        // 投影
        const projected = this.project(rotated.x, rotated.y, rotated.z);
        
        return {
          ...projected,
          originalIndex: index,
          z: rotated.z,
          size: vertex.size,
          color: vertex.color,
          glowing: vertex.glowing
        };
      }).sort((a, b) => a.z - b.z); // Z座標でソート（奥から描画）
      
      // 奥の頂点から描画
      for (const vertex of projectedVertices) {
        const distanceFactor = Math.max(0, Math.min(1, 
          1 - (Math.abs(vertex.z) / this.config.cullingDistance)
        ));
        
        // 発光エフェクト
        if (vertex.glowing && this.config.useGlowEffect) {
          const glowSize = vertex.size * 4;
          const gradient = this.ctx.createRadialGradient(
            vertex.x, vertex.y, 0,
            vertex.x, vertex.y, glowSize
          );
          gradient.addColorStop(0, this.adjustColorOpacity(vertex.color, 0.3 * distanceFactor));
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          this.ctx.beginPath();
          this.ctx.arc(vertex.x, vertex.y, glowSize, 0, Math.PI * 2);
          this.ctx.fillStyle = gradient;
          this.ctx.fill();
        }
        
        // 頂点自体を描画
        this.ctx.beginPath();
        this.ctx.arc(vertex.x, vertex.y, vertex.size, 0, Math.PI * 2);
        this.ctx.fillStyle = vertex.color;
        this.ctx.globalAlpha = distanceFactor * 0.85;
        this.ctx.fill();
      }
      this.ctx.globalAlpha = 1.0;
      
      // エッジを描画
      for (const edge of cube.edges) {
        const v1 = projectedVertices.find(v => v.originalIndex === edge.from);
        const v2 = projectedVertices.find(v => v.originalIndex === edge.to);
        
        if (!v1 || !v2) continue;
        
        // カリング（遠すぎるエッジは描画しない）
        const avgZ = (v1.z + v2.z) / 2;
        if (Math.abs(avgZ) > this.config.cullingDistance) continue;
        
        // 距離に応じた透明度
        const distanceFactor = Math.max(0, Math.min(1, 
          1 - (Math.abs(avgZ) / this.config.cullingDistance)
        ));
        
        // パルスに合わせて線を薄くしたり濃くしたり
        const pulseOpacity = 0.2 + (Math.sin(this.time) * 0.05 + 0.05);
        
        // 線のグラデーション
        const gradient = this.ctx.createLinearGradient(v1.x, v1.y, v2.x, v2.y);
        gradient.addColorStop(0, this.adjustColorOpacity(edge.color, pulseOpacity * distanceFactor));
        gradient.addColorStop(1, this.adjustColorOpacity(edge.color, pulseOpacity * distanceFactor));
        
        this.ctx.beginPath();
        this.ctx.moveTo(v1.x, v1.y);
        this.ctx.lineTo(v2.x, v2.y);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = this.config.lineWidth * distanceFactor;
        this.ctx.stroke();
      }
    }
  }
  
  // 点と接続線の描画
  drawPointsAndConnections() {
    // 全点を回転して投影
    const projectedPoints = this.points.map((point, index) => {
      const x = point.x + (point.mouseOffsetX || 0);
      const y = point.y + (point.mouseOffsetY || 0);
      const z = point.z + (point.mouseOffsetZ || 0);
      
      const rotated = this.rotate3D(x, y, z);
      const projected = this.project(rotated.x, rotated.y, rotated.z);
      
      return {
        ...projected,
        originalIndex: index,
        rotatedZ: rotated.z,
        size: point.size * (point.pulse || 1),
        color: point.color
      };
    });
    
    // Z軸でソート（奥から描画）
    projectedPoints.sort((a, b) => a.rotatedZ - b.rotatedZ);
    
    // 接続線を描画
    for (const connection of this.connections) {
      const p1 = projectedPoints.find(p => p.originalIndex === connection.from);
      const p2 = projectedPoints.find(p => p.originalIndex === connection.to);
      
      if (!p1 || !p2) continue;
      
      // カリング
      const avgZ = (p1.rotatedZ + p2.rotatedZ) / 2;
      if (Math.abs(avgZ) > this.config.cullingDistance) continue;
      
      // 距離に応じた透明度
      const distanceFactor = Math.max(0, Math.min(1, 
        1 - (Math.abs(avgZ) / this.config.cullingDistance)
      ));
      
      // 線のグラデーション
      const gradient = this.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      
      const point1 = this.points[connection.from];
      const point2 = this.points[connection.to];
      
      gradient.addColorStop(0, this.adjustColorOpacity(point1.color, connection.opacity * distanceFactor));
      gradient.addColorStop(1, this.adjustColorOpacity(point2.color, connection.opacity * distanceFactor));
      
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke();
    }
    
    // 点を描画
    for (const proj of projectedPoints) {
      // カリング
      if (Math.abs(proj.rotatedZ) > this.config.cullingDistance) continue;
      
      // 距離に応じた不透明度
      const distanceFactor = Math.max(0, Math.min(1, 
        1 - (Math.abs(proj.rotatedZ) / this.config.cullingDistance)
      ));
      
      // 発光効果
      if (this.config.useGlowEffect) {
        const glowSize = proj.size * 2;
        const gradient = this.ctx.createRadialGradient(
          proj.x, proj.y, 0,
          proj.x, proj.y, glowSize
        );
        gradient.addColorStop(0, this.adjustColorOpacity(proj.color, 0.4 * distanceFactor));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(proj.x, proj.y, glowSize, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
      }
      
      // 点自体
      this.ctx.beginPath();
      this.ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
      this.ctx.fillStyle = proj.color;
      this.ctx.globalAlpha = distanceFactor * 0.8;
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1.0;
  }
  
  // 流れる点の描画
  drawFlowPoints() {
    for (const point of this.flowPoints) {
      const rotated = this.rotate3D(point.x, point.y, point.z);
      const projected = this.project(rotated.x, rotated.y, rotated.z);
      
      // カリング
      if (Math.abs(rotated.z) > this.config.cullingDistance) continue;
      
      const distanceFactor = Math.max(0, Math.min(1, 
        1 - (Math.abs(rotated.z) / this.config.cullingDistance)
      ));
      
      // 爆発エフェクトの場合、年齢に応じて透明度を調整
      const ageFactor = point.age ? 1 - (point.age / point.lifespan) : 1;
      const opacity = distanceFactor * 0.6 * ageFactor;
      
      // 軌跡を描画
      if (point.trail && point.trail.length > 1) {
        this.ctx.beginPath();
        
        let firstPoint = true;
        for (let i = 0; i < point.trail.length; i++) {
          const t = point.trail[i];
          const tRotated = this.rotate3D(t.x, t.y, t.z);
          const tProjected = this.project(tRotated.x, tRotated.y, tRotated.z);
          
          if (firstPoint) {
            this.ctx.moveTo(tProjected.x, tProjected.y);
            firstPoint = false;
          } else {
            this.ctx.lineTo(tProjected.x, tProjected.y);
          }
        }
        
        // 現在位置まで線を描画
        this.ctx.lineTo(projected.x, projected.y);
        
        // グラデーション
        const gradient = this.ctx.createLinearGradient(
          projected.x, projected.y,
          point.trail[0].x, point.trail[0].y
        );
        gradient.addColorStop(0, this.adjustColorOpacity(point.color, opacity));
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = point.size * 0.5 * distanceFactor;
        this.ctx.globalAlpha = opacity;
        this.ctx.stroke();
      }
      
      // 点自体を描画
      this.ctx.beginPath();
      this.ctx.arc(projected.x, projected.y, point.size * distanceFactor, 0, Math.PI * 2);
      this.ctx.fillStyle = point.color;
      this.ctx.globalAlpha = opacity;
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1.0;
  }
  
  // 3D回転
  rotate3D(x, y, z) {
    // X軸周りの回転
    let cosX = Math.cos(this.rotation.x);
    let sinX = Math.sin(this.rotation.x);
    let y1 = y * cosX - z * sinX;
    let z1 = y * sinX + z * cosX;
    
    // Y軸周りの回転
    let cosY = Math.cos(this.rotation.y);
    let sinY = Math.sin(this.rotation.y);
    let x1 = x * cosY + z1 * sinY;
    let z2 = -x * sinY + z1 * cosY;
    
    // Z軸周りの回転
    let cosZ = Math.cos(this.rotation.z);
    let sinZ = Math.sin(this.rotation.z);
    let x2 = x1 * cosZ - y1 * sinZ;
    let y2 = x1 * sinZ + y1 * cosZ;
    
    return { x: x2, y: y2, z: z2 };
  }
  
  // 3D→2D投影
  project(x, y, z) {
    const { perspective } = this.config;
    const scale = perspective / (perspective + z);
    return {
      x: x * scale + this.width / 2,
      y: y * scale + this.height / 2,
      scale: scale
    };
  }
  
  // 2D→3D逆投影（マウス位置を3D空間に）
  unproject(x, y, z) {
    const { perspective } = this.config;
    const normX = (x / this.width) * 2 - 1;
    const normY = (y / this.height) * 2 - 1;
    
    const worldX = normX * this.config.gridSize * 0.2; // マウスの影響範囲を限定
    const worldY = normY * this.config.gridSize * 0.2;
    const worldZ = z;
    
    return { x: worldX, y: worldY, z: worldZ };
  }
  
  // アニメーションループ
  animate(timestamp) {
    this.update(timestamp);
    this.draw();
    requestAnimationFrame((ts) => this.animate(ts));
  }
}

// サイバーグリッド背景の初期化関数
window.initCyberGridBackground = function() {
  console.log('3Dサイバー空間アニメーション初期化開始');

  const heroSection = document.querySelector('.hero');
  if (!heroSection) {
    console.error('ヒーローセクションが見つかりません');
    return;
  }
  
  // 既存のキャンバスがあれば削除
  let canvas = heroSection.querySelector('.dots-canvas');
  if (canvas) {
    console.log('キャンバスは既に存在します。再初期化します。');
    canvas.remove();
  }
  
  // 既存のグラデーントオーバーレイがあれば削除
  let gradientOverlay = heroSection.querySelector('.gradient-overlay');
  if (gradientOverlay) {
    gradientOverlay.remove();
  }
  
  // キャンバスを作成
  canvas = document.createElement('canvas');
  canvas.classList.add('dots-canvas');
  canvas.width = heroSection.offsetWidth;
  canvas.height = heroSection.offsetHeight;
  heroSection.prepend(canvas);
  
  // グラデーントオーバーレイを作成（より大きなグラデーション）
  gradientOverlay = document.createElement('div');
  gradientOverlay.classList.add('gradient-overlay');
  gradientOverlay.style.background = 'radial-gradient(circle at center, rgba(150, 200, 255, 0.06) 0%, rgba(100, 150, 255, 0.04) 40%, rgba(50, 100, 255, 0.02) 70%, transparent 100%)';
  heroSection.prepend(gradientOverlay);
  
  // サイバーグリッドを初期化
  const cyberGrid = new CyberGrid(canvas, gridConfig);
  
  // アニメーションを開始
  cyberGrid.animate(performance.now());
  
  console.log('3Dサイバー空間アニメーション初期化完了');
};

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded: 3Dサイバー空間アニメーション初期化を実行します');
  window.initCyberGridBackground();
});