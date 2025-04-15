/**
 * ヒーローセクションのドット背景アニメーション
 * マウスの動きに反応して背景のドットパターンがさりげなく変化します
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('ドットアニメーション初期化開始'); // デバッグ用

  const heroSection = document.querySelector('.hero');
  if (!heroSection) {
    console.error('ヒーローセクションが見つかりません');
    return;
  }
  
  // キャンバスの作成と設定
  const canvas = document.createElement('canvas');
  canvas.classList.add('dots-canvas');
  heroSection.prepend(canvas); // 先頭に追加
  
  const ctx = canvas.getContext('2d');
  let width = heroSection.offsetWidth;
  let height = heroSection.offsetHeight;
  
  // キャンバスのサイズを設定
  canvas.width = width;
  canvas.height = height;
  
  // ドットの設定
  const dots = [];
  const dotConfig = {
    size: 3,       // 通常のサイズ
    hoverSize: 6,  // ホバー時のサイズ
    color: '#4285F4',
    opacity: 0.05,  // 通常の透明度
    hoverOpacity: 0.15, // ホバー時の透明度
    gridSize: 20,   // グリッドの大きさ
    radius: 100     // マウスの影響範囲
  };
  
  // グラデーション要素の作成
  const gradientOverlay = document.createElement('div');
  gradientOverlay.classList.add('gradient-overlay');
  heroSection.prepend(gradientOverlay);
  
  // マウス位置と速度
  let mouseX = -1000;
  let mouseY = -1000;
  let mouseSpeed = 0;
  let lastMouseX = -1000;
  let lastMouseY = -1000;
  
  // ドットの生成
  function createDots() {
    const cols = Math.ceil(width / dotConfig.gridSize);
    const rows = Math.ceil(height / dotConfig.gridSize);
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        // 市松模様のように配置
        if ((i + j) % 2 === 0) {
          dots.push({
            x: i * dotConfig.gridSize + 3,
            y: j * dotConfig.gridSize + 3,
            size: dotConfig.size,
            color: dotConfig.color,
            opacity: dotConfig.opacity,
            originalSize: dotConfig.size,
            originalOpacity: dotConfig.opacity
          });
        }
      }
    }
    console.log(`${dots.length}個のドットを生成しました`); // デバッグ用
  }
  
  // マウススピードの計算
  function updateMouseSpeed(x, y) {
    if (lastMouseX > -999 && lastMouseY > -999) {
      const dx = x - lastMouseX;
      const dy = y - lastMouseY;
      mouseSpeed = Math.sqrt(dx * dx + dy * dy);
      mouseSpeed = Math.min(mouseSpeed, 50); // 最大値を制限
    }
    
    lastMouseX = x;
    lastMouseY = y;
  }
  
  // ドットの描画
  function drawDots() {
    ctx.clearRect(0, 0, width, height);
    
    // マウススピードに基づいて半径を調整
    const currentRadius = dotConfig.radius + mouseSpeed * 0.7;
    
    // アクティブなドットの数をカウント（グラデーション効果用）
    let activeDotsCount = 0;
    let maxActiveFactor = 0;
    
    dots.forEach(dot => {
      // マウスとの距離を計算
      const dx = mouseX - dot.x;
      const dy = mouseY - dot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // マウスが近いとサイズと透明度を変更
      if (distance < currentRadius) {
        const factor = 1 - distance / currentRadius;
        dot.size = dot.originalSize + (dotConfig.hoverSize - dot.originalSize) * factor;
        dot.opacity = dot.originalOpacity + (dotConfig.hoverOpacity - dot.originalOpacity) * factor;
        activeDotsCount++;
        
        // 最大の影響度を記録
        if (factor > maxActiveFactor) {
          maxActiveFactor = factor;
        }
      } else {
        dot.size = dot.originalSize;
        dot.opacity = dot.originalOpacity;
      }
      
      // ドットを描画
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
      ctx.fillStyle = dot.color;
      ctx.globalAlpha = dot.opacity;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
    
    // グラデーションの濃さを調整
    updateGradientOpacity(activeDotsCount, maxActiveFactor);
    
    // マウススピードを時間とともに減衰
    mouseSpeed *= 0.95;
  }
  
  // グラデーションの濃さを更新
  function updateGradientOpacity(activeCount, maxFactor) {
    if (activeCount > 0) {
      // ドットの数と最大影響度に基づいて透明度を計算（さりげなく変化）
      const opacityFactor = Math.min(0.2, (activeCount / 100) * 0.1 + maxFactor * 0.1);
      gradientOverlay.style.opacity = opacityFactor.toString();
    } else {
      gradientOverlay.style.opacity = '0';
    }
  }
  
  // アニメーションループ
  function animate() {
    drawDots();
    requestAnimationFrame(animate);
  }
  
  // マウス移動イベント
  heroSection.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    updateMouseSpeed(mouseX, mouseY);
  });
  
  // マウスがエリアから出た時
  heroSection.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
    gradientOverlay.style.opacity = '0';
  });
  
  // リサイズイベント
  window.addEventListener('resize', () => {
    width = heroSection.offsetWidth;
    height = heroSection.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    
    // ドットを再生成
    dots.length = 0;
    createDots();
  });
  
  // 初期化
  createDots();
  animate();
  
  console.log('ドットアニメーション初期化完了'); // デバッグ用
});