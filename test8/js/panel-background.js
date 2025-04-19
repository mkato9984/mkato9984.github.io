// 3D空間にパネルを配置するアニメーションを制御するファイル
class PanelBackground {
  constructor(container) {
    this.container = container;
    this.width = container.offsetWidth;
    this.height = container.offsetHeight;
    this.canvas = null;
    this.ctx = null;
    this.panels = [];
    
    // マウス座標
    this.mouse = {
      x: 0,
      y: 0,
      lastX: 0,
      lastY: 0,
      isMoving: false,
      moveX: 0,
      moveY: 0,
    };
    
    // 設定
    this.config = {
      panelCount: 30,           // パネル数を増やす (20 -> 30)
      panelMinSize: 30,         // パネル最小サイズを小さく (40 -> 30)
      panelMaxSize: 120,        // パネル最大サイズ
      minDistance: -1200,       // 奥行きを深く (-1000 -> -1200)
      maxDistance: 500,         // 最大Z位置
      speed: 0.2,              // 基本移動速度を少し遅く (0.3 -> 0.2)
      rotationSpeed: 0.001,     // 回転速度を遅く (0.002 -> 0.001)
      maxTilt: 10,             // 最大傾き角度（度）
      perspective: 800,         // 透視投影の強さ
      colors: [
        'rgba(151, 196, 251, 0.5)',  // 薄い青
        'rgba(37, 117, 252, 0.5)',   // 青
        'rgba(93, 157, 245, 0.5)',   // 明るい青
        'rgba(131, 183, 255, 0.5)',  // 水色
        'rgba(61, 137, 255, 0.5)',   // 濃い青
        'rgba(180, 220, 255, 0.5)',  // 明るい水色
      ],
      iconTypes: [
        'fa-chart-line',
        'fa-chart-pie', 
        'fa-chart-bar',
        'fa-table',
        'fa-list',
        'fa-database',
        'fa-server',
        'fa-network-wired',
        'fa-sitemap',
        'fa-code',
        'fa-cloud',
        'fa-cog',
        'fa-laptop-code',
        'fa-shield-alt',
        'fa-terminal',
        'fa-cube',
        'fa-microchip',
        'fa-project-diagram',
        'fa-wifi',
        'fa-globe',
      ],
      // パネルのタイプ（0: アイコン, 1: グラフ, 2: テキスト）
      panelTypes: [0, 1, 2, 1, 0]  // アイコンとグラフの比率を高くする
    };
    
    // 移動パラメータ
    this.time = 0;            // アニメーションタイマー
    this.tiltAngleX = 0;      // X軸傾き
    this.tiltAngleY = 0;      // Y軸傾き
    this.tiltTargetX = 0;     // 目標X軸傾き
    this.tiltTargetY = 0;     // 目標Y軸傾き
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.setupEventListeners();
    this.generatePanels();
    this.animate();
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.classList.add('panel-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // キャンバスの位置をコンテナの一番最初に挿入
    this.container.prepend(this.canvas);
  }
  
  setupEventListeners() {
    // マウス移動イベントをリッスン
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.lastX = this.mouse.x;
      this.mouse.lastY = this.mouse.y;
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      
      this.mouse.isMoving = true;
      
      // 画面中央からの相対位置（-1から1の範囲）
      const normalizedX = (this.mouse.x / this.width) * 2 - 1;
      const normalizedY = (this.mouse.y / this.height) * 2 - 1;
      
      // 目標傾き角度を更新
      this.tiltTargetX = -normalizedY * this.config.maxTilt;
      this.tiltTargetY = normalizedX * this.config.maxTilt;
      
      // 移動量を計算
      this.mouse.moveX = this.mouse.x - this.mouse.lastX;
      this.mouse.moveY = this.mouse.y - this.mouse.lastY;
    });
    
    // マウス離脱イベント
    this.container.addEventListener('mouseleave', () => {
      this.mouse.isMoving = false;
      this.tiltTargetX = 0;
      this.tiltTargetY = 0;
    });
    
    // リサイズイベント
    window.addEventListener('resize', () => {
      this.resize();
    });
  }
  
  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  
  generatePanels() {
    this.panels = [];
    
    for (let i = 0; i < this.config.panelCount; i++) {
      const panelType = this.config.panelTypes[Math.floor(Math.random() * this.config.panelTypes.length)];
      const size = Math.random() * (this.config.panelMaxSize - this.config.panelMinSize) + this.config.panelMinSize;
      
      const panel = {
        x: Math.random() * this.width * 1.5 - this.width * 0.25,
        y: Math.random() * this.height * 1.5 - this.height * 0.25,
        z: Math.random() * (this.config.maxDistance - this.config.minDistance) + this.config.minDistance,
        rotationX: Math.random() * Math.PI * 2,
        rotationY: Math.random() * Math.PI * 2,
        rotationZ: Math.random() * Math.PI * 2,
        width: size * (1 + Math.random() * 0.5), // 少し横長に
        height: size,
        speedZ: (Math.random() * 0.5 + 0.5) * this.config.speed,
        type: panelType,
        color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
        icon: this.config.iconTypes[Math.floor(Math.random() * this.config.iconTypes.length)],
        opacity: 0.7 + Math.random() * 0.3,
        glowColor: 'rgba(240, 250, 255, 0.3)'
      };
      
      this.panels.push(panel);
    }
  }
  
  update() {
    this.time += 0.01;
    
    // 傾きをイージングで更新
    this.tiltAngleX += (this.tiltTargetX - this.tiltAngleX) * 0.05;
    this.tiltAngleY += (this.tiltTargetY - this.tiltAngleY) * 0.05;
    
    // 各パネルを更新
    for (const panel of this.panels) {
      // Z軸方向に移動
      panel.z += panel.speedZ;
      
      // 画面の外に出たら反対側に配置
      if (panel.z > this.config.maxDistance) {
        panel.z = this.config.minDistance;
        panel.x = Math.random() * this.width * 1.5 - this.width * 0.25;
        panel.y = Math.random() * this.height * 1.5 - this.height * 0.25;
      }
      
      // 少しずつ回転
      panel.rotationX += this.config.rotationSpeed * Math.sin(this.time * 0.3);
      panel.rotationY += this.config.rotationSpeed * Math.cos(this.time * 0.2);
      panel.rotationZ += this.config.rotationSpeed * Math.sin(this.time * 0.4);
      
      // マウスの動きに応じて少し動かす（近いパネルほど強く）
      if (this.mouse.isMoving) {
        const distanceFactor = Math.max(0, 1 - (panel.z - this.config.minDistance) / (this.config.maxDistance - this.config.minDistance));
        panel.x += this.mouse.moveX * 0.02 * distanceFactor;
        panel.y += this.mouse.moveY * 0.02 * distanceFactor;
      }
    }
    
    // マウス移動をリセット
    this.mouse.moveX *= 0.9;
    this.mouse.moveY *= 0.9;
  }
  
  draw() {
    // キャンバスをクリア
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // 深さでパネルをソート（奥から描画）
    const sortedPanels = [...this.panels].sort((a, b) => a.z - b.z);
    
    // シーンの回転に使用する行列を計算
    const cosX = Math.cos(this.tiltAngleX * Math.PI / 180);
    const sinX = Math.sin(this.tiltAngleX * Math.PI / 180);
    const cosY = Math.cos(this.tiltAngleY * Math.PI / 180);
    const sinY = Math.sin(this.tiltAngleY * Math.PI / 180);
    
    for (const panel of sortedPanels) {
      // 3D回転を適用
      const rotatedX = panel.x * cosY - panel.z * sinY;
      const rotatedZ = panel.x * sinY + panel.z * cosY;
      const rotatedY = panel.y * cosX + rotatedZ * sinX;
      const finalZ = -panel.y * sinX + rotatedZ * cosX;
      
      // 透視投影を適用
      const scale = this.config.perspective / (this.config.perspective + finalZ);
      const projectedX = rotatedX * scale + this.width / 2;
      const projectedY = rotatedY * scale + this.height / 2;
      
      const width = panel.width * scale;
      const height = panel.height * scale;
      
      // 画面外のパネルはスキップ
      if (
        projectedX + width / 2 < 0 ||
        projectedX - width / 2 > this.width ||
        projectedY + height / 2 < 0 ||
        projectedY - height / 2 > this.height ||
        scale <= 0
      ) {
        continue;
      }
      
      // 距離に応じた透明度を計算
      const distanceFactor = Math.max(0, Math.min(1, 1 - (finalZ - this.config.minDistance) / (this.config.maxDistance - this.config.minDistance)));
      const alpha = panel.opacity * distanceFactor;
      
      this.ctx.save();
      this.ctx.translate(projectedX, projectedY);
      this.ctx.scale(scale, scale);
      
      // パネル自体の回転
      this.ctx.rotate(panel.rotationZ);
      
      // 発光エフェクト
      this.ctx.shadowColor = panel.glowColor;
      this.ctx.shadowBlur = 10;
      
      // パネルの描画
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = panel.color;
      this.ctx.fillRect(-width/2, -height/2, width, height);
      
      // 枠線
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(-width/2, -height/2, width, height);
      
      // パネルの種類に応じたコンテンツを描画
      switch (panel.type) {
        case 0: // アイコン
          this.drawIcon(panel, width, height);
          break;
        case 1: // グラフ
          this.drawGraph(panel, width, height);
          break;
        case 2: // テキスト
          this.drawText(panel, width, height);
          break;
      }
      
      this.ctx.restore();
    }
  }
  
  drawIcon(panel, width, height) {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.font = `${Math.min(width, height) * 0.4}px "Font Awesome 5 Free"`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Font Awesomeアイコンの表示方法を修正
    // fa-chart-line などのクラス名からアイコンを直接描画するのではなく、
    // シンプルな図形でアイコンを模倣します
    
    switch (panel.icon) {
      case 'fa-chart-line':
        this.drawSimpleLine(width * 0.3, height * 0.3);
        break;
      case 'fa-chart-pie':
        this.drawSimplePie(width * 0.3, height * 0.3);
        break;
      case 'fa-chart-bar':
        this.drawSimpleBar(width * 0.3, height * 0.3);
        break;
      default:
        // デフォルトは四角形を描画
        this.ctx.fillRect(-width * 0.15, -height * 0.15, width * 0.3, height * 0.3);
        break;
    }
  }
  
  // 簡易的な折れ線グラフのアイコン
  drawSimpleLine(width, height) {
    this.ctx.beginPath();
    this.ctx.moveTo(-width/2, height/4);
    this.ctx.lineTo(-width/6, 0);
    this.ctx.lineTo(width/6, -height/4);
    this.ctx.lineTo(width/2, height/3);
    this.ctx.stroke();
    
    // ポイントを追加
    this.ctx.beginPath();
    this.ctx.arc(-width/2, height/4, width/10, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(-width/6, 0, width/10, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(width/6, -height/4, width/10, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(width/2, height/3, width/10, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  // 簡易的な円グラフのアイコン
  drawSimplePie(width, height) {
    const radius = Math.min(width, height) / 2;
    
    // 円を描画
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // 円グラフのスライス
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.arc(0, 0, radius, 0, Math.PI * 0.6);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.arc(0, 0, radius, Math.PI, Math.PI * 1.7);
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  // 簡易的な棒グラフのアイコン
  drawSimpleBar(width, height) {
    const barWidth = width / 4;
    const spacing = width / 10;
    
    this.ctx.fillRect(-width/2 + spacing, -height/3, barWidth, height/3 + height/3);
    this.ctx.fillRect(-width/2 + barWidth + spacing*2, 0, barWidth, height/3);
    this.ctx.fillRect(-width/2 + barWidth*2 + spacing*3, -height/2, barWidth, height/2 + height/3);
    this.ctx.fillRect(-width/2 + barWidth*3 + spacing*4, -height/6, barWidth, height/6 + height/3);
  }
  
  drawGraph(panel, width, height) {
    const graphType = Math.floor(Math.random() * 4); // 0: 折れ線, 1: 棒グラフ, 2: 円グラフ, 3: 波形
    
    // グラフエリアを定義
    const padding = Math.min(width, height) * 0.15;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.lineWidth = 2;
    
    switch (graphType) {
      case 0: // 折れ線グラフ
        this.ctx.beginPath();
        const pointCount = 5 + Math.floor(Math.random() * 5);
        const pointWidth = graphWidth / (pointCount - 1);
        
        for (let i = 0; i < pointCount; i++) {
          const x = -width/2 + padding + i * pointWidth;
          const value = Math.random();
          const y = -height/2 + padding + graphHeight * (1 - value);
          
          if (i === 0) {
            this.ctx.moveTo(x, y);
          } else {
            this.ctx.lineTo(x, y);
          }
        }
        
        this.ctx.stroke();
        break;
        
      case 1: // 棒グラフ
        const barCount = 4 + Math.floor(Math.random() * 3);
        const barWidth = graphWidth / barCount * 0.7;
        const barSpacing = graphWidth / barCount * 0.3;
        
        for (let i = 0; i < barCount; i++) {
          const height = graphHeight * (0.2 + Math.random() * 0.8);
          const x = -width/2 + padding + i * (barWidth + barSpacing);
          const y = -height/2 + padding;
          
          this.ctx.fillRect(x, y + (graphHeight - height), barWidth, height);
        }
        break;
        
      case 2: // 円グラフ
        const centerX = 0;
        const centerY = 0;
        const radius = Math.min(graphWidth, graphHeight) / 2;
        
        let startAngle = 0;
        const segmentCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < segmentCount; i++) {
          const angleSize = (Math.random() * 0.5 + 0.5) * (Math.PI * 2 / segmentCount);
          const endAngle = startAngle + angleSize;
          
          this.ctx.beginPath();
          this.ctx.moveTo(centerX, centerY);
          this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          this.ctx.closePath();
          
          // 円グラフの各セグメントに少し透明度の異なる色を使用
          this.ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + i * 0.1})`;
          this.ctx.fill();
          
          startAngle = endAngle;
        }
        break;
        
      case 3: // 波形グラフ
        this.ctx.beginPath();
        const waveCount = 2 + Math.floor(Math.random() * 3);
        
        for (let x = 0; x <= graphWidth; x += 2) {
          const relX = x / graphWidth;
          const y = Math.sin(relX * Math.PI * 2 * waveCount + panel.rotationX) * (graphHeight * 0.3);
          
          if (x === 0) {
            this.ctx.moveTo(-width/2 + padding + x, y);
          } else {
            this.ctx.lineTo(-width/2 + padding + x, y);
          }
        }
        
        this.ctx.stroke();
        break;
    }
  }
  
  drawText(panel, width, height) {
    const textBlocks = 2 + Math.floor(Math.random() * 3);
    const blockHeight = height / (textBlocks + 1);
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    
    for (let i = 0; i < textBlocks; i++) {
      const blockWidth = width * (0.5 + Math.random() * 0.4);
      const blockX = -width/2 + (width - blockWidth) / 2;
      const blockY = -height/2 + blockHeight * (i + 1);
      
      this.ctx.fillRect(blockX, blockY, blockWidth, blockHeight * 0.3);
    }
  }
  
  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// パネル背景の初期化
window.initPanelBackground = function() {
  console.log('3Dパネル背景アニメーション初期化開始');

  const heroSection = document.querySelector('.hero');
  if (!heroSection) {
    console.error('ヒーローセクションが見つかりません');
    return;
  }
  
  // 既存のキャンバスがあれば削除
  const existingCanvas = heroSection.querySelector('.panel-canvas');
  if (existingCanvas) {
    existingCanvas.remove();
  }
  
  // パネル背景を初期化
  const panelBg = new PanelBackground(heroSection);
  
  console.log('3Dパネル背景アニメーション初期化完了');
};

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded: 3Dパネル背景アニメーション初期化を実行します');
  window.initPanelBackground();
});