// マトリックス風のデジタルレイン効果をシンプルに実装
class MatrixRain {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId) || this.createCanvas();
    this.ctx = this.canvas.getContext('2d');
    
    // オプション設定
    this.options = {
      fontSize: options.fontSize || 14,
      color: options.color || '#00FF33', // より明るいネオングリーン（マトリックス色）
      backgroundColor: options.backgroundColor || 'rgba(0, 0, 0, 0.03)', // 非常に薄い背景
      speed: options.speed || 1.2,
      density: options.density || 0.3, // 文字列の密度を低めに
      characterSet: options.characterSet || '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
      glitchRate: options.glitchRate || 0.02,
      fadeSpeed: options.fadeSpeed || 0.97,
      brightTextProbability: options.brightTextProbability || 0.2 // 明るい文字の確率を上げる
    };
    
    // キャンバスの幅と高さを設定
    this.resize();
    
    // 文字の列を格納する配列
    this.rainColumns = [];
    
    // リサイズイベントのバインド
    window.addEventListener('resize', () => this.resize());
    
    // 初期化
    this.init();
  }
  
  // キャンバス要素を作成
  createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-rain';
    document.querySelector('.hero').appendChild(canvas);
    
    // スタイルの設定
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '2'; // z-indexを2に設定（サイバーグリッドが1、UIコンポーネントは3以上）
    canvas.style.opacity = '0.8'; // 透明度を0.8に維持
    
    return canvas;
  }
  
  // キャンバスのサイズをウィンドウに合わせて調整
  resize() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    const { width, height } = heroSection.getBoundingClientRect();
    this.canvas.width = width;
    this.canvas.height = height;
    
    // リサイズ後に再初期化
    this.init();
  }
  
  // 初期化
  init() {
    // コンテキスト設定
    this.ctx.font = `${this.options.fontSize}px monospace`;
    this.ctx.textAlign = 'center';
    
    // 列の数を計算
    const columnCount = Math.floor(this.canvas.width / (this.options.fontSize * 0.7));
    
    // 雨の列をリセット
    this.rainColumns = [];
    
    // 列ごとに設定
    for (let i = 0; i < columnCount; i++) {
      // ランダムな開始位置
      const x = i * this.options.fontSize * 0.7;
      const startingY = Math.random() * this.canvas.height * 2 - this.canvas.height;
      
      // ランダムな速度変異
      const speedVariation = Math.random() * 0.6 + 0.7;
      
      // この列が実際に表示されるかどうか（密度に基づく）
      const isActive = Math.random() < this.options.density;
      
      // 文字のスタックを初期化
      const characters = [];
      const length = Math.floor(Math.random() * 30) + 5; // 5〜35文字
      
      // 深度効果（奥行き感）- 薄い列と濃い列を分ける
      const depth = Math.random();
      const alpha = 0.4 + depth * 0.6; // 0.4〜1.0の透明度
      
      this.rainColumns.push({
        x,
        y: startingY,
        speed: this.options.speed * speedVariation,
        characters: isActive ? this.generateCharacters(length) : [],
        isActive,
        length,
        lastUpdate: 0,
        updateInterval: Math.floor(Math.random() * 3) + 2, // 2〜4フレームごとに更新
        hasBrightHead: Math.random() < this.options.brightTextProbability,
        alpha // 列ごとの透明度
      });
    }
    
    // アニメーション開始
    this.animate();
  }
  
  // ランダムな文字列を生成
  generateCharacters(length) {
    const chars = [];
    for (let i = 0; i < length; i++) {
      const char = this.getRandomCharacter();
      // 透明度は上から順に減少（先頭の文字が最も明るい）
      const alpha = i === 0 ? 1 : Math.max(0.1, 1 - (i / length * 1.2));
      chars.push({ char, alpha });
    }
    return chars;
  }
  
  // ランダムな文字を取得
  getRandomCharacter() {
    const charSet = this.options.characterSet;
    return charSet.charAt(Math.floor(Math.random() * charSet.length));
  }
  
  // 文字を更新
  updateCharacters(column) {
    // 一定の確率でグリッチ効果（ランダムな文字に変更）
    if (Math.random() < this.options.glitchRate) {
      const glitchIndex = Math.floor(Math.random() * column.characters.length);
      if (column.characters[glitchIndex]) {
        column.characters[glitchIndex].char = this.getRandomCharacter();
      }
    }
    
    // 先頭に新しい文字を追加
    const newChar = this.getRandomCharacter();
    column.characters.unshift({ char: newChar, alpha: 1 });
    
    // 不要な文字を削除（画面外に出た文字）
    if (column.characters.length > column.length) {
      column.characters.pop();
    }
    
    // 残りの文字の透明度を徐々に下げる
    for (let i = 1; i < column.characters.length; i++) {
      column.characters[i].alpha *= this.options.fadeSpeed;
    }
  }
  
  // アニメーションフレームを描画
  draw() {
    // キャンバスをクリア（透明に）
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 薄い背景を描画（残像効果）
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // フレームカウント
    this.frameCount = this.frameCount || 0;
    this.frameCount++;
    
    // 各列の描画
    for (let i = 0; i < this.rainColumns.length; i++) {
      const column = this.rainColumns[i];
      
      // 列が非アクティブならスキップ
      if (!column.isActive) continue;
      
      // 位置の更新
      column.y += column.speed;
      
      // 画面下端に到達したら上に戻す
      if (column.y > this.canvas.height) {
        column.y = -column.length * this.options.fontSize;
        column.speed = this.options.speed * (Math.random() * 0.6 + 0.7);
        column.length = Math.floor(Math.random() * 30) + 5;
        column.hasBrightHead = Math.random() < this.options.brightTextProbability;
      }
      
      // 一定間隔で文字を更新
      if (this.frameCount % column.updateInterval === 0) {
        this.updateCharacters(column);
      }
      
      // 各文字の描画
      for (let j = 0; j < column.characters.length; j++) {
        const charObj = column.characters[j];
        const y = column.y - j * this.options.fontSize;
        
        // 画面内の文字のみ描画（パフォーマンス最適化）
        if (y > -this.options.fontSize && y < this.canvas.height + this.options.fontSize) {
          // 先頭の文字（最も明るい文字）
          if (j === 0 && column.hasBrightHead) {
            this.ctx.fillStyle = `rgba(230, 255, 230, ${0.95 * column.alpha})`; // より明るい白色に近い色
            this.ctx.shadowColor = '#00FF33'; // ネオングリーン
            this.ctx.shadowBlur = 8; // 光の広がりを強化 (5 → 8)
            this.ctx.fillText(charObj.char, column.x, y);
            this.ctx.shadowBlur = 0;
          } else {
            // 残りの文字は徐々に薄くなる
            const finalAlpha = charObj.alpha * column.alpha * 0.9; // 全体的に少し薄く
            
            // より明るいグリーンを使用
            this.ctx.fillStyle = `rgba(0, 255, 60, ${finalAlpha})`;
            this.ctx.fillText(charObj.char, column.x, y);
          }
        }
      }
    }
  }
  
  // アニメーションループ
  animate() {
    // 描画
    this.draw();
    
    // 次のアニメーションフレームをリクエスト
    requestAnimationFrame(() => this.animate());
  }
}

// ページ読み込み時にデジタルレイン効果を初期化
document.addEventListener('DOMContentLoaded', () => {
  // 既存のキャンバスがあるか確認
  let matrixCanvas = document.getElementById('matrix-rain');
  if (!matrixCanvas) {
    matrixCanvas = document.createElement('canvas');
    matrixCanvas.id = 'matrix-rain';
    document.querySelector('.hero').appendChild(matrixCanvas);
  }
  
  // マトリックスレイン効果を初期化
  const options = {
    fontSize: 20,              // 文字サイズを大きく（18 → 20）
    color: '#00FF33',          // より明るいネオングリーン
    speed: 1.5,                // 落下速度
    density: 0.5,              // 文字列の密度を上げる（0.4 → 0.5）
    fadeSpeed: 0.95,           // 文字が薄くなる速度
    brightTextProbability: 0.35 // 明るい先頭文字を増やす（0.3 → 0.35）
  };
  
  const matrixRain = new MatrixRain('matrix-rain', options);
  
  // ヒーローセクション内のテキストの視認性を改善
  const heroInner = document.querySelector('.hero__inner');
  if (heroInner) {
    // 背景を少し暗く透過させてテキストが読みやすくなるようにする
    heroInner.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // より暗く（0.5 → 0.7）
    // 枠線の色をグリーン系に変更して目立たせる
    heroInner.style.borderColor = 'rgba(0, 255, 0, 0.5)'; // より明るく（0.3 → 0.5）
    // Z-indexを設定して必ず前面に表示されるようにする
    heroInner.style.position = 'relative';
    heroInner.style.zIndex = '3';
  }
  
  // ヒーローエリア内のテキスト要素の視認性を向上
  const heroTitle = document.querySelector('.hero__title');
  const heroSubtitle = document.querySelector('.hero__subtitle');
  const condensedText = document.querySelector('.condensed-text');
  
  if (heroTitle) {
    heroTitle.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.8)';
    heroTitle.style.color = '#FFFFFF';
    heroTitle.style.position = 'relative'; // 位置指定を明示
    heroTitle.style.zIndex = '5'; // 高いz-indexで前面表示
  }
  
  if (heroSubtitle) {
    heroSubtitle.style.textShadow = '0 0 8px rgba(0, 0, 0, 0.9), 0 0 15px rgba(0, 0, 0, 0.8)';
    heroSubtitle.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'; // より暗く（0.4 → 0.6）
    heroSubtitle.style.borderLeft = '2px solid rgba(0, 255, 0, 0.7)';
    heroSubtitle.style.padding = '12px 15px'; // パディングを増やして視認性向上
    heroSubtitle.style.position = 'relative';
    heroSubtitle.style.zIndex = '5';
  }
  
  if (condensedText) {
    // サイバーテックの文字の色をグリーン系に変更し、輝きを強化
    condensedText.style.color = '#00FF66';
    condensedText.style.textShadow = 
      '0 0 5px rgba(0, 0, 0, 0.8), ' +
      '0 0 10px rgba(0, 0, 0, 0.7), ' +
      '0 0 5px rgba(0, 255, 102, 0.9), ' +
      '0 0 10px rgba(0, 255, 102, 0.7), ' +
      '0 0 15px rgba(0, 255, 102, 0.5)'; // 輝きを追加
    condensedText.style.position = 'relative';
    condensedText.style.zIndex = '5';
  }
  
  // ボタンのスタイルもグリーン系に統一し、前面に表示
  const heroButtons = document.querySelector('.hero__buttons');
  const primaryBtn = document.querySelector('.btn--primary');
  const secondaryBtn = document.querySelector('.btn--secondary');
  
  if (heroButtons) {
    heroButtons.style.position = 'relative';
    heroButtons.style.zIndex = '5';
    heroButtons.style.marginTop = '25px'; // マージンを増やして位置を調整
  }
  
  if (primaryBtn) {
    primaryBtn.style.backgroundColor = 'rgba(0, 180, 0, 0.8)';
    primaryBtn.style.borderColor = '#00FF00';
    primaryBtn.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.5)'; // 発光を強化（0.4 → 0.5）
    primaryBtn.style.color = '#FFFFFF';
    primaryBtn.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.7)';
    primaryBtn.style.fontWeight = 'bold';
    primaryBtn.style.padding = '10px 20px'; // サイズを大きく
  }
  
  if (secondaryBtn) {
    secondaryBtn.style.color = '#00FF66';
    secondaryBtn.style.borderColor = '#00FF66';
    secondaryBtn.style.boxShadow = '0 0 10px rgba(0, 255, 102, 0.4)'; // 発光を強化（0.3 → 0.4）
    secondaryBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'; // 背景を暗く
    secondaryBtn.style.textShadow = '0 0 5px rgba(0, 255, 102, 0.5)';
    secondaryBtn.style.fontWeight = 'bold';
    secondaryBtn.style.padding = '10px 20px'; // サイズを大きく
  }
  
  // サイバーコーナーもグリーン系に変更して明るく
  const cyberCorners = document.querySelectorAll('.cyber-corner');
  cyberCorners.forEach(corner => {
    corner.style.borderColor = 'rgba(0, 255, 0, 0.7)'; // より明るく（0.5 → 0.7）
    corner.style.zIndex = '4';
  });
  
  // スクロールインジケーターの表示を確保
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.style.position = 'relative';
    scrollIndicator.style.zIndex = '5';
    scrollIndicator.style.marginTop = '30px';
    scrollIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    scrollIndicator.style.borderColor = 'rgba(0, 255, 0, 0.5)';
  }
  
  // グローバル変数にセット（デバッグ用）
  window.matrixRain = matrixRain;
  
  // レイヤーの優先順位を調整するための関数
  function fixLayerOrdering() {
    // サイバーグリッドとマトリックスレインのレイヤー順序を調整
    const dotsCanvas = document.querySelector('.dots-canvas');
    const gradientOverlay = document.querySelector('.gradient-overlay');
    const matrixCanvas = document.getElementById('matrix-rain');
    const heroInner = document.querySelector('.hero__inner');
    
    // サイバーグリッド（一番背面）
    if (dotsCanvas) {
      dotsCanvas.style.zIndex = '1';
      dotsCanvas.style.position = 'absolute';
    }
    
    if (gradientOverlay) {
      gradientOverlay.style.zIndex = '1';
      gradientOverlay.style.position = 'absolute';
    }
    
    // マトリックスレイン（中間レイヤー）
    if (matrixCanvas) {
      matrixCanvas.style.zIndex = '2';
    }
    
    // ヒーロー内部のUI要素（最前面）
    if (heroInner) {
      heroInner.style.position = 'relative';
      heroInner.style.zIndex = '10'; // 高いz-indexで確実に前面に表示
      heroInner.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      heroInner.style.borderColor = 'rgba(0, 255, 0, 0.5)';
      
      // ボックスシャドウを追加して、より強調
      heroInner.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    }
    
    // 個別のUI要素にも高いz-indexを設定
    const uiElements = [
      '.hero__title', 
      '.hero__subtitle', 
      '.condensed-text', 
      '.hero__buttons', 
      '.btn--primary', 
      '.btn--secondary', 
      '.cyber-corner',
      '.scroll-indicator'
    ];
    
    uiElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.position = 'relative';
        el.style.zIndex = '11';
        
        // テキスト要素の視認性を強化
        if (selector === '.hero__title' || selector === '.hero__subtitle' || selector === '.condensed-text') {
          el.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.8)';
        }
      });
    });
    
    // サイバーテックの文字のスタイルを強調
    const condensedText = document.querySelector('.condensed-text');
    if (condensedText) {
      condensedText.style.color = '#00FF66';
      condensedText.style.textShadow = 
        '0 0 5px rgba(0, 0, 0, 0.9), ' +
        '0 0 10px rgba(0, 0, 0, 0.8), ' +
        '0 0 5px rgba(0, 255, 102, 0.9), ' +
        '0 0 10px rgba(0, 255, 102, 0.7), ' +
        '0 0 15px rgba(0, 255, 102, 0.5)';
    }
    
    // ボタンのスタイルもグリーン系に統一し、明確に表示
    const primaryBtn = document.querySelector('.btn--primary');
    if (primaryBtn) {
      primaryBtn.style.backgroundColor = 'rgba(0, 180, 0, 0.8)';
      primaryBtn.style.borderColor = '#00FF00';
      primaryBtn.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.5)';
      primaryBtn.style.color = '#FFFFFF';
      primaryBtn.style.fontWeight = 'bold';
      primaryBtn.style.padding = '10px 20px';
    }
    
    const secondaryBtn = document.querySelector('.btn--secondary');
    if (secondaryBtn) {
      secondaryBtn.style.color = '#00FF66';
      secondaryBtn.style.borderColor = '#00FF66';
      secondaryBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      secondaryBtn.style.boxShadow = '0 0 15px rgba(0, 255, 102, 0.4)';
      secondaryBtn.style.fontWeight = 'bold';
      secondaryBtn.style.padding = '10px 20px';
    }
  }
  
  // DOMが完全にロードされた後にレイヤー順序を修正
  fixLayerOrdering();
  
  // ページのロード完了後に再度実行（確実に適用させるため）
  window.addEventListener('load', function() {
    // 少し遅延を入れてDOM要素が完全に描画された後に実行
    setTimeout(fixLayerOrdering, 100);
  });
});