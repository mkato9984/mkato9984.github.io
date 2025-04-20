/**
 * レイヤー修正用のJavaScript
 * サイバーグリッドとマトリックスレインの影響でUIが隠れる問題を修正します
 */

// ページ読み込み完了時に実行
document.addEventListener('DOMContentLoaded', function() {
  console.log('レイヤー修正スクリプト開始');
  fixLayerOrdering();
  
  // ページ完全ロード時にも実行（画像など全てのリソースがロードされた後）
  window.addEventListener('load', function() {
    // 100ms遅延させて確実に適用
    setTimeout(fixLayerOrdering, 100);
    // さらに500ms後にも再適用（アニメーションなどの初期化後）
    setTimeout(fixLayerOrdering, 500);
    // 最後に1秒後にも実行して確実に適用
    setTimeout(fixLayerOrdering, 1000);
  });
});

/**
 * レイヤー順序を強制的に修正する関数
 */
function fixLayerOrdering() {
  console.log('レイヤー順序の修正を実行中...');
  
  // サイバーグリッド（最背面 z-index: 1）- 明るさを上げる
  const dotsCanvas = document.querySelector('.dots-canvas');
  if (dotsCanvas) {
    dotsCanvas.style.position = 'absolute';
    dotsCanvas.style.zIndex = '1';
    dotsCanvas.style.opacity = '0.85'; // 透明度を上げる (0.6 → 0.85)
    // コントラストとブレンドモードを追加して視認性を向上
    dotsCanvas.style.mixBlendMode = 'screen';
    dotsCanvas.style.filter = 'brightness(1.2) contrast(1.1)'; // 明るさとコントラストを上げる
  }
  
  // グラデーションオーバーレイ（背面 z-index: 1）
  const gradientOverlay = document.querySelector('.gradient-overlay');
  if (gradientOverlay) {
    gradientOverlay.style.position = 'absolute';
    gradientOverlay.style.zIndex = '1';
    gradientOverlay.style.opacity = '0.3'; // 少し透明度を上げる
  }
  
  // マトリックスレイン（中間レイヤー z-index: 2）- 明るさを上げる
  const matrixCanvas = document.getElementById('matrix-rain');
  if (matrixCanvas) {
    matrixCanvas.style.position = 'absolute';
    matrixCanvas.style.zIndex = '2';
    matrixCanvas.style.opacity = '0.85'; // 透明度を上げる (0.65 → 0.85)
    // 明るさとコントラストを上げる
    matrixCanvas.style.filter = 'brightness(1.3) contrast(1.2)';
    // ブレンドモードを変更して発光効果を高める
    matrixCanvas.style.mixBlendMode = 'screen';
  }
  
  // ヒーローセクション自体の設定
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.style.position = 'relative';
    heroSection.style.overflow = 'hidden';
  }
  
  // ヒーロー内部コンテンツ（前面 z-index: 10）
  const heroInner = document.querySelector('.hero__inner');
  if (heroInner) {
    heroInner.style.position = 'relative';
    heroInner.style.zIndex = '10'; // 高いz-indexで確実に前面表示
    heroInner.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // 背景色を少し透明に (0.75 → 0.7)
    heroInner.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.8), 0 0 50px rgba(0, 0, 0, 0.5)'; // 強いシャドウで浮き出させる
    heroInner.style.border = '1px solid rgba(0, 255, 255, 0.5)'; // 境界線を明確に
    heroInner.style.transform = 'translateZ(0)'; // GPUアクセラレーションを有効化
    heroInner.style.padding = '3rem'; // パディングを増やす
  }
  
  // 各UI要素のスタイル強化
  enhanceUIElements();
}

/**
 * UI要素のスタイルを強化する関数
 */
function enhanceUIElements() {
  // タイトル
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    heroTitle.style.position = 'relative';
    heroTitle.style.zIndex = '11';
    heroTitle.style.color = '#FFFFFF'; // 明るい白色に
    heroTitle.style.textShadow = 
      '0 0 10px rgba(0, 0, 0, 0.9), ' +
      '0 0 20px rgba(0, 0, 0, 0.8), ' +
      '0 0 5px rgba(255, 255, 255, 0.7)'; // 強いシャドウで視認性向上
    heroTitle.style.marginBottom = '1.5rem'; // 下部マージン増加
  }
  
  // サブタイトル
  const heroSubtitle = document.querySelector('.hero__subtitle');
  if (heroSubtitle) {
    heroSubtitle.style.position = 'relative';
    heroSubtitle.style.zIndex = '11';
    heroSubtitle.style.color = 'rgba(255, 255, 255, 0.95)'; // 明るく
    heroSubtitle.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // 背景色を濃く
    heroSubtitle.style.borderLeft = '3px solid rgba(0, 255, 255, 0.8)'; // 左枠線を強調
    heroSubtitle.style.padding = '1rem 1.25rem'; // パディング増加
    heroSubtitle.style.margin = '2rem 0'; // マージン調整
    heroSubtitle.style.textShadow = '0 0 8px rgba(0, 0, 0, 0.9)'; // 文字シャドウ
    heroSubtitle.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.5)'; // ボックスシャドウ
  }
  
  // サイバーテックテキスト
  const condensedText = document.querySelector('.condensed-text');
  if (condensedText) {
    condensedText.style.position = 'relative';
    condensedText.style.zIndex = '12'; // 最も前面に
    condensedText.style.color = '#00FFAA'; // より明るい色に
    condensedText.style.fontWeight = '900'; // より太く
    condensedText.style.textShadow = 
      '0 0 5px rgba(0, 0, 0, 0.95), ' + 
      '0 0 10px rgba(0, 0, 0, 0.8), ' + 
      '0 0 5px rgba(0, 255, 170, 0.9), ' + 
      '0 0 10px rgba(0, 255, 170, 0.8), ' +  
      '0 0 15px rgba(0, 255, 170, 0.6)'; // 強い発光効果
    condensedText.style.display = 'inline-block'; // ブロック要素化
    condensedText.style.padding = '0.15em 0.3em'; // パディング追加
    condensedText.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'; // 背景色追加
    condensedText.style.borderRadius = '4px'; // 角丸に
  }
  
  // ボタンコンテナ
  const heroButtons = document.querySelector('.hero__buttons');
  if (heroButtons) {
    heroButtons.style.position = 'relative';
    heroButtons.style.zIndex = '11';
    heroButtons.style.marginTop = '2.5rem'; // 上部マージン大幅増加
    heroButtons.style.display = 'flex';
    heroButtons.style.justifyContent = 'center';
    heroButtons.style.gap = '1.5rem'; // ボタン間のギャップを増やす
  }
  
  // プライマリボタン - 青緑のグラデーションに変更（スクリーンショットに合わせる）
  const primaryBtn = document.querySelector('.btn--primary');
  if (primaryBtn) {
    primaryBtn.style.position = 'relative';
    primaryBtn.style.zIndex = '12';
    
    // グラデーション背景に変更（青から緑へのグラデーション）
    primaryBtn.style.background = 'linear-gradient(90deg, #00AAFF, #00FFAA)';
    
    primaryBtn.style.color = '#FFFFFF'; // 白テキスト
    primaryBtn.style.border = 'none'; // 境界線なし
    primaryBtn.style.boxShadow = 
      '0 0 10px rgba(0, 170, 255, 0.6), ' + 
      '0 0 20px rgba(0, 255, 170, 0.4)'; // 青緑のグロー効果
    primaryBtn.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.8)'; // テキストシャドウ
    primaryBtn.style.fontWeight = 'bold';
    primaryBtn.style.fontSize = '1.1rem'; // 文字サイズ大きく
    primaryBtn.style.padding = '12px 24px'; // パディング増加
    primaryBtn.style.transform = 'translateZ(0)'; // GPU加速
    primaryBtn.style.borderRadius = '50px'; // より丸みを持たせる
    
    // ホバー時のエフェクト
    primaryBtn.addEventListener('mouseenter', function() {
      this.style.background = 'linear-gradient(90deg, #00FFAA, #00AAFF)'; // グラデーション反転
      this.style.boxShadow = 
        '0 0 15px rgba(0, 170, 255, 0.7), ' + 
        '0 0 25px rgba(0, 255, 170, 0.5)'; // グロー強化
    });
    
    primaryBtn.addEventListener('mouseleave', function() {
      this.style.background = 'linear-gradient(90deg, #00AAFF, #00FFAA)'; // 元のグラデーション
      this.style.boxShadow = 
        '0 0 10px rgba(0, 170, 255, 0.6), ' + 
        '0 0 20px rgba(0, 255, 170, 0.4)'; // 元のグロー
    });
  }
  
  // セカンダリボタン
  const secondaryBtn = document.querySelector('.btn--secondary');
  if (secondaryBtn) {
    secondaryBtn.style.position = 'relative';
    secondaryBtn.style.zIndex = '12';
    secondaryBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.85)'; // 背景色濃く
    secondaryBtn.style.color = '#00FFAA'; // テキスト色を明るく
    secondaryBtn.style.border = '2px solid #00FFAA'; // 境界線を太く、明るく
    secondaryBtn.style.boxShadow = '0 0 15px rgba(0, 255, 170, 0.5)'; // グロー効果
    secondaryBtn.style.textShadow = '0 0 8px rgba(0, 255, 170, 0.6)'; // テキストシャドウ
    secondaryBtn.style.fontWeight = 'bold';
    secondaryBtn.style.fontSize = '1.1rem'; // 文字サイズ大きく
    secondaryBtn.style.padding = '12px 24px'; // パディング増加
    secondaryBtn.style.transform = 'translateZ(0)'; // GPU加速
  }
  
  // コーナー装飾
  const cyberCorners = document.querySelectorAll('.cyber-corner');
  cyberCorners.forEach(corner => {
    corner.style.position = 'absolute';
    corner.style.zIndex = '11';
    corner.style.borderColor = 'rgba(0, 255, 170, 0.8)'; // より明るい色に
    corner.style.borderWidth = '2px'; // 太く
  });
  
  // スクロールインジケーター
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.style.position = 'absolute';
    scrollIndicator.style.bottom = '40px'; // 下部から40pxの位置に固定
    scrollIndicator.style.left = '50%';
    scrollIndicator.style.transform = 'translateX(-50%)';
    scrollIndicator.style.zIndex = '11';
    scrollIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    scrollIndicator.style.border = '1px solid rgba(0, 255, 170, 0.7)';
    scrollIndicator.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.6)';
    scrollIndicator.style.padding = '0.8rem 1.5rem';
    scrollIndicator.style.borderRadius = '30px';
  }
  
  console.log('UI要素のスタイル強化完了');
}

// ページロード中であればすぐに実行、ロード済みなら遅延実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixLayerOrdering);
} else {
  // ページがすでにロードされている場合は即時実行
  setTimeout(fixLayerOrdering, 0);
}