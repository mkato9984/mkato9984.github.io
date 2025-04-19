// 3Dサイバー空間の格子状背景を生成するファイル
const gridConfig = {
  // 色の設定（神秘的な色合いに調整）
  baseColor: '#97C4FB',
  accentColor: '#2575FC',
  dreamColor1: '#5D9DF5',
  dreamColor2: '#83B7FF',
  dreamColor3: '#3D89FF',
  glowColor: 'rgba(240, 250, 255, 0.6)', // 発光を強く
  pulseColor: 'rgba(160, 220, 255, 0.3)', // パルス色を追加
  energyColor: 'rgba(120, 200, 255, 0.8)', // エネルギー色を追加
  
  // 格子の設定
  gridSize: 2000, // より大きなグリッドサイズに
  gridDivisions: 14, // 分割数を増やして細かく
  gridLayers: 4, // 層の数を増加
  lineWidth: 1.5,
  perspective: 900, // パースペクティブを強くして奥行き感を増す
  
  // 点の設定
  pointCount: 0, // 点を完全に無効化
  pointSize: 0,
  pointMinSize: 0,
  pointMaxSize: 0,
  
  // アニメーション設定
  rotationSpeedX: 0, // 停止維持
  rotationSpeedY: 0, // 停止維持
  rotationSpeedZ: 0, // 停止維持
  pulseFrequency: 0.8, // パルスの頻度
  energyWaveSpeed: 0.3, // エネルギー波の速度
  
  // エフェクト設定
  glowStrength: 1.8, // 線の発光をより強く
  lineGlowSize: 2.5, // 線の発光サイズを大きく
  connectionMaxDistance: 0, // 接続線を無効化
  connectionOpacity: 0,
  mouseInfluence: 300, // マウスの影響範囲を拡大
  mouseStrength: 0.18, // マウスの影響の強さ
  
  // ランダム発光の設定（新規追加）
  randomGlowChance: 0.3, // 各フレームでランダム発光する確率
  randomGlowColors: [
    'rgba(255, 255, 255, 0.7)',  // 白
    'rgba(180, 230, 255, 0.6)',  // 薄青
    'rgba(120, 210, 255, 0.5)',  // 青
    'rgba(150, 200, 255, 0.6)',  // 水色
    'rgba(180, 180, 255, 0.5)',  // 薄紫
  ],
  
  // 最適化設定
  fpsLimit: 20, // FPSをさらに低く制限 (25 → 20)
  cullingDistance: 5000, // 描画距離を少し縮小して負荷軽減 (5500 → 5000)
  maxConnections: 60, // 接続数を減らす (80 → 60)
  
  // エフェクト有効/無効
  usePulseEffect: false,
  useGlowEffect: true,
  useFlowEffect: false,
  useMouseEffect: true, // マウスの効果を有効化
  useDataStreamEffect: false, // データストリームも無効化
  useEnergyWaveEffect: false, // エネルギー波効果も無効化
  
  // パフォーマンス設定
  performanceMode: 'balanced',
  
  // 視点設定
  insideCube: true,
  cameraPosition: { x: 0, y: 0, z: 0 },
  
  // ブレンドモード
  blendMode: 'screen',
  
  // 新しいエフェクト設定
  dataPaths: 8, // データパスの数
  dataSpeed: 0.4, // データの移動速度
  energyNodes: 6, // エネルギーノードの数
  gridFlashInterval: 4000, // グリッドがフラッシュする間隔（ミリ秒）
  gridFlashDuration: 500, // フラッシュの持続時間（ミリ秒）
  
  // マウス効果設定
  mouseTiltStrength: 0.12, // 傾きの強さをさらに弱める (0.18 → 0.12)
  mouseTiltDecay: 0.992, // より滑らかに
  mouseTiltMax: 0.12, // 最大傾き角度を抑える (0.14 → 0.12)
  mouseTiltEasing: true, // イージング効果で滑らかに
  
  // 慣性関連の設定をさらに調整
  useInertia: true,        // 慣性効果を有効化
  inertiaStrength: 0.97,   // 慣性を強く長続きさせる (0.95 → 0.97)
  inertiaThreshold: 0.001, // 慣性が働く最小値のしきい値（これより小さい動きは無視）
  
  // マウス処理の最適化
  mouseSamplingInterval: 80, // マウスサンプリング間隔をさらに長く (50ms → 80ms)
  
  // 描画最適化
  simplifyFarEdges: true, // 遠くの線を簡略化
  distanceOptimization: true, // 距離に応じた最適化を有効化
  skipFrames: 1, // 一定の頻度でフレームをスキップ
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
      lastY: 0,
      // 慣性のための追加変数
      velocityX: 0,
      velocityY: 0,
      lastMoveTime: 0
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
      color: this.config.baseColor,
      // ランダム発光のためのタイムスタンプ配列
      glowTimestamps: []
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
            // ランダム発光のためのプロパティを追加
            cube.edges.push({
              from: i,
              to: j,
              color: this.getEdgeColor(v1, v2),
              glowFactor: 0,  // 現在の発光強度（0.0～1.0）
              glowSpeed: 0.02 + Math.random() * 0.08,  // 各エッジが異なる速度で光る
              glowPhase: Math.random() * Math.PI * 2,  // 異なる位相で光る
              randomGlowSeed: Math.random(),  // ランダム性を高めるための値
              // ランダム発光の確率を調整（値が大きいほど頻繁に光る）
              glowProbability: Math.random() * 0.8 + 0.2,
              // 発光パターン（0: なし、1: パルス、2: フラッシュ、3: ウェーブ）
              glowPattern: Math.floor(Math.random() * 4),
              // 発光色（ランダムに選択）
              glowColorIndex: Math.floor(Math.random() * this.config.randomGlowColors.length)
            });
          }
        }
      }
    }
    
    // ランダム発光のタイムスタンプ初期化
    this.initGlowTimestamps(cube);
    
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
        color: this.config.accentColor,
        // 内側キューブにもグロータイムスタンプを追加
        glowTimestamps: []
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
                color: this.getEdgeColor(v1, v2),
                // 内側キューブのエッジにもランダム発光プロパティを追加
                glowFactor: 0,
                glowSpeed: 0.02 + Math.random() * 0.08,
                glowPhase: Math.random() * Math.PI * 2,
                randomGlowSeed: Math.random(),
                glowProbability: Math.random() * 0.8 + 0.2,
                glowPattern: Math.floor(Math.random() * 4),
                glowColorIndex: Math.floor(Math.random() * this.config.randomGlowColors.length)
              });
            }
          }
        }
      }
      
      // 内側キューブのグロータイムスタンプも初期化
      this.initGlowTimestamps(innerCube);
      
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
  
  // ランダム発光のためのタイムスタンプを初期化
  initGlowTimestamps(cube) {
    // 発光のタイミングを管理する配列を初期化
    cube.glowTimestamps = [];
    
    // 各エッジに異なるランダムなタイミングを割り当てる
    for (let i = 0; i < cube.edges.length; i++) {
      // 最初の発光までの遅延をランダムに設定
      const delay = Math.random() * 10000; // 0〜10秒のランダム遅延
      // 発光の持続時間もランダムに設定
      const duration = 300 + Math.random() * 2000; // 0.3〜2.3秒のランダムな持続時間
      
      // 発光イベントをスケジュール
      cube.glowTimestamps.push({
        edgeIndex: i,
        nextGlowTime: Date.now() + delay,
        glowDuration: duration,
        isGlowing: false
      });
    }
  }
  
  // 各フレームでランダム発光を更新
  updateRandomGlows(cube) {
    const now = Date.now();
    
    // すべての発光タイムスタンプを更新
    for (let i = 0; i < cube.glowTimestamps.length; i++) {
      const glowInfo = cube.glowTimestamps[i];
      const edge = cube.edges[glowInfo.edgeIndex];
      
      // 発光状態の更新
      if (!glowInfo.isGlowing && now >= glowInfo.nextGlowTime) {
        // 発光開始
        glowInfo.isGlowing = true;
        glowInfo.glowEndTime = now + glowInfo.glowDuration;
        
        // 発光効果をエッジに適用
        edge.isRandomGlowing = true;
        edge.randomGlowStartTime = now;
        edge.randomGlowDuration = glowInfo.glowDuration;
        
        // 発光パターンをランダムに選択
        // 0: パルス, 1: 一定, 2: フラッシュ, 3: 波形
        edge.currentGlowPattern = Math.floor(Math.random() * 4);
        
        // 発光色もランダムに変更
        edge.glowColorIndex = Math.floor(Math.random() * this.config.randomGlowColors.length);
      } 
      else if (glowInfo.isGlowing && now >= glowInfo.glowEndTime) {
        // 発光終了
        glowInfo.isGlowing = false;
        
        // 次の発光タイミングを設定（ランダムな間隔）
        const nextDelay = 1000 + Math.random() * 10000; // 1〜11秒後
        glowInfo.nextGlowTime = now + nextDelay;
        
        // エッジの発光状態をリセット
        edge.isRandomGlowing = false;
      }
      
      // 発光中の場合、エッジの発光強度を更新
      if (edge.isRandomGlowing) {
        const progress = (now - edge.randomGlowStartTime) / edge.randomGlowDuration;
        
        // 発光パターンに応じた強度の計算
        switch (edge.currentGlowPattern) {
          case 0: // パルス - サイン波で強度が変化
            edge.randomGlowIntensity = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
            break;
          case 1: // 一定 - 強度一定で発光
            edge.randomGlowIntensity = 0.8;
            break;
          case 2: // フラッシュ - 急速に点滅
            edge.randomGlowIntensity = (Math.sin(progress * Math.PI * 8) > 0) ? 0.9 : 0.2;
            break;
          case 3: // 波形 - 徐々に強くなり、徐々に弱くなる
            // イーズイン・イーズアウト効果
            edge.randomGlowIntensity = progress < 0.5 ? 
              2 * progress * progress : 
              1 - Math.pow(-2 * progress + 2, 2) / 2;
            break;
        }
      } else {
        edge.randomGlowIntensity = 0;
      }
    }
  }
  
  // 浮遊する点の初期化
  initPoints() {
    this.points = [];
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
  }
  
  // イベントリスナーの設定をさらに最適化
  setupEventListeners() {
    // マウス移動の処理頻度を制限するための変数
    let lastMouseMoveTime = 0;
    const mouseSamplingInterval = this.config.mouseSamplingInterval || 50; // デフォルト50ms
    
    // マウス移動をdocument全体で検知する - スロットリング処理追加
    document.addEventListener('mousemove', (e) => {
      const now = performance.now();
      
      // 処理間隔を制限してCPU負荷を軽減
      if (now - lastMouseMoveTime < mouseSamplingInterval) {
        return; // 間隔が短すぎる場合は処理をスキップ
      }
      lastMouseMoveTime = now;
      
      // キャンバスの位置を取得
      const rect = this.canvas.getBoundingClientRect();
      
      // マウス座標をキャンバス内の相対位置に変換
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      
      // キャンバス範囲内かチェック
      const isInCanvas = (
        canvasX >= 0 && 
        canvasX <= this.width && 
        canvasY >= 0 && 
        canvasY <= this.height
      );
      
      // 慣性計算用のタイムスタンプ
      const timeDelta = now - this.mouse.lastMoveTime;
      
      // マウス速度の計算（負荷軽減のため計算を簡略化）
      if (this.mouse.active && timeDelta > 0) {
        const dx = canvasX - this.mouse.lastX;
        const dy = canvasY - this.mouse.lastY;
        
        // 瞬間速度を計算（ピクセル/ミリ秒）- 係数を小さくして動きを抑制
        this.mouse.velocityX = dx / timeDelta * 8; // 15から8に軽減
        this.mouse.velocityY = dy / timeDelta * 8;
        
        this.mouse.speed = Math.sqrt(dx*dx + dy*dy) * 0.05; // 0.1から0.05に軽減
      }
      
      // 座標を更新
      this.mouse.lastX = canvasX;
      this.mouse.lastY = canvasY;
      this.mouse.x = canvasX;
      this.mouse.y = canvasY;
      this.mouse.active = isInCanvas;
      this.mouse.lastMoveTime = now;
    });
    
    // マウス離脱
    document.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    });
    
    // リサイズ - 負荷軽減のためデバウンス処理を追加
    let resizeTimeout;
    window.addEventListener('resize', () => {
      // 既存のタイムアウトをクリア
      clearTimeout(resizeTimeout);
      
      // 250ms後に実行（連続した処理を防止）
      resizeTimeout = setTimeout(() => {
        this.resize();
      }, 250);
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
    // 既にRGBA形式の場合
    if (color.startsWith('rgba(')) {
      // RGBA形式から値を抽出
      const rgbaMatch = color.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)/);
      if (rgbaMatch) {
        const [, r, g, b] = rgbaMatch;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return color; // パースできない場合は元の値を返す
    }
    
    // HEX形式の場合（#RRGGBB）
    if (color.startsWith('#')) {
      // HEXカラーからRGBAに変換
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // RGB形式の場合
    if (color.startsWith('rgb(')) {
      // RGB形式から値を抽出
      const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return color; // パースできない場合は元の値を返す
    }
    
    // その他の場合（名前付き色など）はそのまま返す
    return color;
  }
  
  // 更新処理を慣性を適用するように強化
  update(timestamp) {
    // FPS制限
    const elapsed = timestamp - this.lastFrameTime;
    if (elapsed < this.frameInterval) return;
    this.lastFrameTime = timestamp - (elapsed % this.frameInterval);
    
    this.time += 0.005;
    
    // マウスの動きと慣性に基づいて空間を傾ける処理
    if (this.config.useMouseEffect) {
      // マウスアクティブでなくても画面中央を基準に計算
      const mouseX = this.mouse.active ? this.mouse.x : this.width / 2;
      const mouseY = this.mouse.active ? this.mouse.y : this.height / 2;
      
      const mouseXNorm = mouseX / this.width * 2 - 1; // -1から1の範囲
      const mouseYNorm = mouseY / this.height * 2 - 1; // -1から1の範囲
      
      // 慣性を適用した傾き角度の計算
      let targetTiltX = -mouseYNorm * this.config.mouseTiltStrength; // 上下反転
      let targetTiltY = mouseXNorm * this.config.mouseTiltStrength;  // 左右
      
      if (this.config.useInertia) {
        // マウスの動きの方向と速度に応じた慣性効果を追加
        const velocityInfluence = 0.05; // 慣性の影響度合い
        
        // マウスが動いている時は速度から慣性を計算
        if (this.mouse.active) {
          // 速度を角度に変換して傾きに影響を与える
          targetTiltX -= this.mouse.velocityY * velocityInfluence;
          targetTiltY += this.mouse.velocityX * velocityInfluence;
          
          // マウスの速度を徐々に減衰
          this.mouse.velocityX *= 0.95;
          this.mouse.velocityY *= 0.95;
        } else {
          // マウスが動いていないときも慣性を効かせる
          // 慣性の減衰
          this.mouse.velocityX *= this.config.inertiaStrength;
          this.mouse.velocityY *= this.config.inertiaStrength;
          
          // 慣性を傾きに影響させる
          targetTiltX -= this.mouse.velocityY * velocityInfluence;
          targetTiltY += this.mouse.velocityX * velocityInfluence;
          
          // 微小な値になったらゼロにする
          if (Math.abs(this.mouse.velocityX) < 0.01) this.mouse.velocityX = 0;
          if (Math.abs(this.mouse.velocityY) < 0.01) this.mouse.velocityY = 0;
        }
      }
      
      // イージングと慣性の組み合わせ
      const easingFactor = 0.05; // スムージングの強さ
      
      // 現在の回転角度と目標角度の差分を計算し、イージングを適用
      const diffX = targetTiltX - this.rotation.x;
      const diffY = targetTiltY - this.rotation.y;
      
      // イージングを適用
      this.rotation.x += diffX * easingFactor;
      this.rotation.y += diffY * easingFactor;
      
      // 最大傾き角度を制限
      if (Math.abs(this.rotation.x) > this.config.mouseTiltMax) {
        this.rotation.x = Math.sign(this.rotation.x) * this.config.mouseTiltMax;
      }
      
      if (Math.abs(this.rotation.y) > this.config.mouseTiltMax) {
        this.rotation.y = Math.sign(this.rotation.y) * this.config.mouseTiltMax;
      }
    } else if (!this.mouse.active) {
      // マウスエフェクトが無効の場合は、元の位置に戻す
      this.rotation.x *= this.config.mouseTiltDecay;
      this.rotation.y *= this.config.mouseTiltDecay;
    }
    
    // 立方体の更新
    for (const cube of this.cubes) {
      // パルスエフェクト
      if (this.config.usePulseEffect) {
        cube.pulseOffset = Math.sin(this.time * cube.pulseSpeed + cube.pulsePhase) * 5;
      }
      
      // ランダム発光の更新
      this.updateRandomGlows(cube);
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
      gradient.addColorStop(0, 'rgba(150, 200, 255, 0.05)'); // より強く
      gradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.03)');
      gradient.addColorStop(1, 'rgba(50, 100, 255, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      // 神秘的な雰囲気を出すためのかすかな波紋効果
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const radius = Math.min(this.width, this.height) * 0.4;
      const waveRadius = radius + Math.sin(this.time * 0.5) * 30;
      
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(150, 220, 255, 0.1)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // 2つ目の波紋（位相をずらす）
      const waveRadius2 = radius + Math.sin(this.time * 0.5 + Math.PI) * 20;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, waveRadius2, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(100, 180, 255, 0.08)';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
      
      this.ctx.restore();
    }
    
    // スタイリッシュな魔法陣的エフェクト（神秘的な印象を強化）
    this.drawMysticalEffects();
    
    // ブレンドモードをリセット
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  // 神秘的な魔法陣エフェクト（クラスメソッドとして実装）
  drawMysticalEffects() {
    // 魔法陣エフェクトはエネルギー波がアクティブな時のみ表示
    if (!this.config.useEnergyWaveEffect) return;
    
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const baseRadius = Math.min(this.width, this.height) * 0.35;
    const pulse = Math.sin(this.time * 0.2) * 0.5 + 0.5;
    
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    
    // 魔法陣の外側のリング
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = `rgba(150, 220, 255, ${0.08 + pulse * 0.04})`;
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    
    // 内側のパターン
    const patternCount = 6;
    for (let i = 0; i < patternCount; i++) {
      const angle = (i / patternCount) * Math.PI * 2 + this.time * 0.05;
      const radius = baseRadius * 0.7;
      const x = centerX + Math.cos(angle) * radius * 0.2;
      const y = centerY + Math.sin(angle) * radius * 0.2;
      
      // 神秘的なシンボル（小さな円と線）
      this.ctx.beginPath();
      this.ctx.arc(x, y, 5 + pulse * 2, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(180, 230, 255, ${0.1 + pulse * 0.05})`;
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke();
      
      // 中心から放射状の線
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      const endX = centerX + Math.cos(angle) * baseRadius;
      const endY = centerY + Math.sin(angle) * baseRadius;
      this.ctx.lineTo(endX, endY);
      this.ctx.strokeStyle = `rgba(120, 200, 255, ${0.07 + pulse * 0.03})`;
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke();
    }
    
    // 中心のエネルギーコア
    const coreSize = 8 + pulse * 4;
    const coreGradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, coreSize * 2
    );
    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    coreGradient.addColorStop(0.5, 'rgba(150, 220, 255, 0.3)');
    coreGradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
    
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
    this.ctx.fillStyle = coreGradient;
    this.ctx.fill();
    
    this.ctx.restore();
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
  
  // drawCubesメソッドをクラスメソッドとして実装
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
        
        // エネルギー波エフェクト（頂点位置に基づいてパルス効果）
        let energyFactor = 0;
        if (this.config.useEnergyWaveEffect) {
          const distance = Math.sqrt(
            rotated.x * rotated.x + rotated.y * rotated.y + rotated.z * rotated.z
          );
          
          const wave = Math.sin(this.time * this.config.energyWaveSpeed + distance * 0.01);
          energyFactor = Math.max(0, wave * 0.5 + 0.5);
        }
        
        return {
          ...projected,
          originalIndex: index,
          z: rotated.z,
          size: vertex.size * (1 + energyFactor * 0.3), // エネルギー波による大きさ変動
          color: vertex.color,
          glowing: vertex.glowing || energyFactor > 0.7, // エネルギー波による発光
          energyFactor: energyFactor
        };
      }).sort((a, b) => a.z - b.z); // Z座標でソート（奥から描画）
      
      // グリッドのフラッシュ効果
      const now = Date.now();
      const flashTime = Math.floor(now / this.config.gridFlashInterval) * this.config.gridFlashInterval;
      const timeSinceFlash = now - flashTime;
      const isFlashing = timeSinceFlash < this.config.gridFlashDuration;
      
      // まず線(エッジ)を描画 - 光るエフェクト付きで
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
        
        // エッジの色を元の色として使用
        const edgeColor = edge.color;
        
        // フラッシュ効果中は色を変更
        const flashStrength = isFlashing ? (1 - timeSinceFlash / this.config.gridFlashDuration) * 0.5 : 0;
        
        // エネルギー波の計算（エッジの中点での波の影響）
        let edgeEnergyFactor = 0;
        if (this.config.useEnergyWaveEffect) {
          // 両端の頂点のエネルギーの平均を使用
          edgeEnergyFactor = (v1.energyFactor + v2.energyFactor) * 0.5;
        }
        
        // ランダム発光の影響を追加
        const randomGlowIntensity = edge.isRandomGlowing ? edge.randomGlowIntensity || 0 : 0;
        let randomGlowColor = null;
        if (randomGlowIntensity > 0 && edge.glowColorIndex !== undefined) {
          randomGlowColor = this.config.randomGlowColors[edge.glowColorIndex];
        }
        
        // グローエフェクト (広いぼかしを追加)
        if (this.config.useGlowEffect) {
          // 基本グロー
          this.ctx.beginPath();
          this.ctx.moveTo(v1.x, v1.y);
          this.ctx.lineTo(v2.x, v2.y);
          this.ctx.lineCap = 'round';
          
          // ランダム発光が強い場合は線を太くする
          const glowLineWidth = this.config.lineWidth * 2.5 * 
            (1 + edgeEnergyFactor * 0.5 + randomGlowIntensity * 1.5);
          this.ctx.lineWidth = glowLineWidth;
          
          // エネルギーレベルとランダム発光に応じて色を混合
          let glowColor;
          
          if (randomGlowIntensity > 0.5) {
            // ランダム発光の色を優先
            glowColor = randomGlowColor || this.config.glowColor;
          }
          else if (edgeEnergyFactor > 0.7 || flashStrength > 0) {
            // 強いエネルギーか、フラッシュ時はエネルギーカラー
            glowColor = this.config.energyColor;
          } else if (edgeEnergyFactor > 0.3) {
            // 中程度のエネルギーはパルスカラー
            glowColor = this.config.pulseColor;
          } else {
            // 通常の発光
            glowColor = this.config.glowColor;
          }
          
          this.ctx.strokeStyle = glowColor;
          this.ctx.globalAlpha = (0.5 + edgeEnergyFactor * 0.3 + flashStrength + randomGlowIntensity * 0.7) * distanceFactor;
          this.ctx.stroke();
          
          // ランダム発光が強い場合または通常の発光条件で二重グロー効果
          if (randomGlowIntensity > 0.6 || edgeEnergyFactor > 0.5 || flashStrength > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(v1.x, v1.y);
            this.ctx.lineTo(v2.x, v2.y);
            
            // ランダム発光の場合はさらに太く
            const outerGlowWidth = this.config.lineWidth * 4 * 
              (1 + edgeEnergyFactor * 0.5 + randomGlowIntensity * 2);
            this.ctx.lineWidth = outerGlowWidth;
            
            // ランダム発光の場合は色を変える
            if (randomGlowIntensity > 0.6 && randomGlowColor) {
              this.ctx.strokeStyle = randomGlowColor;
              this.ctx.globalAlpha = 0.3 * randomGlowIntensity * distanceFactor;
            } else {
              this.ctx.strokeStyle = 'rgba(150, 230, 255, 0.2)';
              this.ctx.globalAlpha = 0.2 * distanceFactor;
            }
            this.ctx.stroke();
            
            // 非常に強いランダム発光の場合、第三の光輪を追加
            if (randomGlowIntensity > 0.8) {
              this.ctx.beginPath();
              this.ctx.moveTo(v1.x, v1.y);
              this.ctx.lineTo(v2.x, v2.y);
              this.ctx.lineWidth = this.config.lineWidth * 6 * randomGlowIntensity;
              this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
              this.ctx.globalAlpha = 0.15 * randomGlowIntensity * distanceFactor;
              this.ctx.stroke();
            }
          }
        }
        
        // メインの線を描画
        this.ctx.beginPath();
        this.ctx.moveTo(v1.x, v1.y);
        this.ctx.lineTo(v2.x, v2.y);
        this.ctx.lineCap = 'round';
        
        // ランダム発光時は線を太くする
        this.ctx.lineWidth = this.config.lineWidth * 
          (1 + edgeEnergyFactor * 0.3 + randomGlowIntensity * 0.7);
        
        // エネルギーレベルやフラッシュに応じて色を調整
        let lineColor = edgeColor;
        
        // ランダム発光の色を優先
        if (randomGlowIntensity > 0.7 && randomGlowColor) {
          // ランダム発光色をベースに、白色を混ぜて明るく
          lineColor = randomGlowColor.replace('rgba', 'rgb').replace(/,[0-9.]+\)/, ')');
        }
        else if (flashStrength > 0) {
          // フラッシュ中は白っぽく
          lineColor = '#FFFFFF';
        } else if (edgeEnergyFactor > 0.7) {
          // 高エネルギー時は明るめの色
          lineColor = this.config.dreamColor2;
        }
        
        this.ctx.strokeStyle = lineColor;
        this.ctx.globalAlpha = (0.8 + edgeEnergyFactor * 0.2 + flashStrength * 0.3 + randomGlowIntensity * 0.5) * distanceFactor;
        this.ctx.stroke();
      }
      this.ctx.globalAlpha = 1.0;
      
      // 次に頂点を描画
      for (const vertex of projectedVertices) {
        const distanceFactor = Math.max(0, Math.min(1, 
          1 - (Math.abs(vertex.z) / this.config.cullingDistance)
        ));
        
        // フラッシュ効果が頂点に与える影響
        const flashFactor = isFlashing ? (1 - timeSinceFlash / this.config.gridFlashDuration) * 0.7 : 0;
        
        // 発光エフェクト
        const isGlowing = vertex.glowing || flashFactor > 0.3;
        if (isGlowing && this.config.useGlowEffect) {
          // 通常の発光
          const glowSize = vertex.size * (4 + vertex.energyFactor * 2 + flashFactor * 3);
          const glowOpacity = 0.3 + vertex.energyFactor * 0.2 + flashFactor * 0.3;
          
          const gradient = this.ctx.createRadialGradient(
            vertex.x, vertex.y, 0,
            vertex.x, vertex.y, glowSize
          );
          
          // エネルギーレベルやフラッシュに応じて発光色を調整
          let glowColor;
          if (flashFactor > 0.5) {
            glowColor = '#FFFFFF';
          } else if (vertex.energyFactor > 0.7) {
            glowColor = this.config.energyColor;
          } else {
            glowColor = vertex.color;
          }
          
          gradient.addColorStop(0, this.adjustColorOpacity(glowColor, glowOpacity * distanceFactor));
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          this.ctx.beginPath();
          this.ctx.arc(vertex.x, vertex.y, glowSize, 0, Math.PI * 2);
          this.ctx.fillStyle = gradient;
          this.ctx.fill();
          
          // 高エネルギー頂点は二重発光
          if (vertex.energyFactor > 0.8 || flashFactor > 0.6) {
            const innerGlowSize = vertex.size * 2;
            const innerGradient = this.ctx.createRadialGradient(
              vertex.x, vertex.y, 0,
              vertex.x, vertex.y, innerGlowSize
            );
            innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(vertex.x, vertex.y, innerGlowSize, 0, Math.PI * 2);
            this.ctx.fillStyle = innerGradient;
            this.ctx.globalAlpha = 0.4 * distanceFactor;
            this.ctx.fill();
          }
        }
        
        // 頂点自体を描画
        this.ctx.beginPath();
        this.ctx.arc(vertex.x, vertex.y, vertex.size * (1 + flashFactor * 0.5), 0, Math.PI * 2);
        
        // フラッシュ中は色を変更
        let vertexColor = vertex.color;
        if (flashFactor > 0.5) {
          vertexColor = '#FFFFFF';
        } else if (vertex.energyFactor > 0.8) {
          vertexColor = this.config.accentColor;
        }
        
        this.ctx.fillStyle = vertexColor;
        this.ctx.globalAlpha = distanceFactor * (0.85 + flashFactor * 0.15);
        this.ctx.fill();
      }
      this.ctx.globalAlpha = 1.0;
    }
  }
  
  // 流れる点の描画メソッドもクラスメソッドとして実装
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