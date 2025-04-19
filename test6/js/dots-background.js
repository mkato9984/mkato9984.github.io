// グローバル設定
const dotConfig = {
  dotsCount: 100,
  maxParticles: 60,
  gridSize: 30,
  size: 3,
  opacity: 0.5,
  maxOpacity: 0.8,
  radius: 150,
  baseColor: '#97C4FB',
  rippleColor: '#2575FC',
  accentColor: '#79A9F5',
  dreamColor1: '#5D9DF5',
  dreamColor2: '#83B7FF',
  dreamColor3: '#3D89FF',
  fluidFactor: 0.1,
  glowEffect: true,
  glowColor: 'rgba(240, 250, 255, 0.5)', // より透明感のある発光色
  naturalRippleInterval: 5000,
  mouseRippleInterval: 300,
  trailRippleInterval: 300,
  trailLength: 10,
  maxRipples: 15,
  minRipples: 5, 
  maxRippleRadius: 120,
  rippleFadeSpeed: 0.01,
  harmonics: true,
  particleInteraction: true,
  colorCycleSpeed: 0.001,
  blendMode: 'screen', // lighterからscreenに変更してより透明感のある表現に
  useGlowEffect: true,
  useInterference: true,
  useParticles: true
};

// ランダムカラー生成関数
function getRandomColor() {
  const colors = [
    dotConfig.baseColor,
    dotConfig.rippleColor,
    dotConfig.accentColor,
    dotConfig.dreamColor1,
    dotConfig.dreamColor2,
    dotConfig.dreamColor3
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 粒子フローエフェクトのクラス
class ParticleFlow {
  constructor(x, y, angle, color) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.angle = angle || Math.random() * Math.PI * 2;
    // より穏やかな動きになるよう速度を下げる
    this.speed = 0.3 + Math.random() * 0.8;
    this.lifespan = 80 + Math.random() * 60;
    this.age = 0;
    this.baseColor = color || getRandomColor();
    this.active = true;
    this.canvasWidth = 0; // キャンバスの幅を保持するプロパティ
    this.canvasHeight = 0; // キャンバスの高さを保持するプロパティ
    this.createParticles();
  }

  createParticles() {
    const particleCount = 5 + Math.floor(Math.random() * dotConfig.maxParticles / 3);
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: this.x,
        y: this.y,
        size: 0.5 + Math.random() * 2,
        speed: this.speed * (0.8 + Math.random() * 0.4),
        angle: this.angle + (Math.random() - 0.5) * 0.5,
        alpha: 0.3 + Math.random() * 0.7,
        age: i * 3, // 粒子のスタート時間をずらす
        lifespan: 50 + Math.random() * 100,
        color: shiftHue(this.baseColor, (Math.random() - 0.5) * 30)
      });
    }
  }

  update() {
    this.age++;
    if (this.age > this.lifespan) {
      this.active = false;
      return;
    }

    // 粒子の更新
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age++;
      
      if (p.age > p.lifespan) {
        this.particles.splice(i, 1);
        continue;
      }
      
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      
      // 画面の端に達した場合は消える
      // キャンバスのサイズをthisから参照する
      if (p.x < 0 || p.x > this.canvasWidth || p.y < 0 || p.y > this.canvasHeight) {
        this.particles.splice(i, 1);
      }
    }
    
    // すべての粒子が消えたらフローを非アクティブに
    if (this.particles.length === 0) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;
    
    ctx.save();
    if (dotConfig.blendMode) {
      ctx.globalCompositeOperation = dotConfig.blendMode;
    }
    
    for (const p of this.particles) {
      // 粒子の寿命に応じて透明度を変化
      const lifeRatio = 1 - (p.age / p.lifespan);
      const alpha = p.alpha * lifeRatio;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      
      // グラデーションで発光効果を表現
      if (dotConfig.useGlowEffect) {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        const color = p.color || this.baseColor;
        gradient.addColorStop(0, `${color}FF`);
        gradient.addColorStop(0.5, `${color}80`);
        gradient.addColorStop(1, `${color}00`);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = p.color || this.baseColor;
      }
      
      ctx.globalAlpha = alpha;
      ctx.fill();
    }
    
    ctx.restore();
  }
}

// 波紋エフェクトのクラス
class Ripple {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = 100 + Math.random() * 150;
    this.speed = 1 + Math.random() * 2;
    this.alpha = 0.8;
    this.color = color || getRandomColor();
    this.lineWidth = 1 + Math.random() * 2;
    this.active = true;
  }

  update() {
    this.radius += this.speed;
    this.alpha = 0.8 * (1 - this.radius / this.maxRadius);
    
    if (this.radius > this.maxRadius) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;
    
    ctx.save();
    if (dotConfig.blendMode) {
      ctx.globalCompositeOperation = dotConfig.blendMode;
    }
    
    // 半径が負の値にならないように保証
    const safeRadius = Math.max(0.1, this.radius);
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, safeRadius, 0, Math.PI * 2);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.globalAlpha = this.alpha;
    ctx.stroke();
    
    ctx.restore();
  }
}

// 波紋と粒子フローの相互作用を強化する関数
function enhanceRippleParticleInteraction(ripple, dots, particleFlows) {
  // 波紋が特定の大きさに達したときに粒子フローを生成
  if (ripple.radius > ripple.maxRadius * 0.3 && ripple.radius < ripple.maxRadius * 0.35) {
    // 波紋の周囲に粒子フローを生成
    const flowCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < flowCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = ripple.radius * 0.8;
      const x = ripple.x + Math.cos(angle) * distance;
      const y = ripple.y + Math.sin(angle) * distance;
      
      // 波紋の色に基づいて粒子フローの色を決定
      const flowColor = shiftHue(ripple.color, (Math.random() - 0.5) * 60);
      
      particleFlows.push(new ParticleFlow(x, y, angle, flowColor));
    }
  }
  
  // 波紋内の粒子に影響を与える
  for (const dot of dots) {
    const dx = dot.x - ripple.x;
    const dy = dot.y - ripple.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 波紋のエッジ付近の粒子に影響
    if (Math.abs(distance - ripple.radius) < ripple.lineWidth * 2) {
      // 粒子の色を一時的に変更
      dot.tempColor = ripple.color;
      dot.tempColorDuration = 20 + Math.random() * 30;
      
      // 粒子を波紋の方向に少し動かす
      const angle = Math.atan2(dy, dx);
      dot.vx += Math.cos(angle) * 0.2;
      dot.vy += Math.sin(angle) * 0.2;
      
      // 粒子のサイズを一時的に大きくする
      dot.tempSize = dot.baseSize * (1.5 + Math.random());
    }
  }
}

// 光の干渉パターンを生成する関数
function createInterferencePattern(ctx, width, height, time) {
  if (!dotConfig.useInterference) return;
  
  const pattern = ctx.createImageData(width, height);
  const data = pattern.data;
  
  const frequency = 0.05 + Math.sin(time * 0.001) * 0.02;
  const phase1 = time * 0.0003;
  const phase2 = time * 0.0005;
  
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const value1 = Math.sin(x * frequency + phase1) * Math.cos(y * frequency + phase2);
      const value2 = Math.sin((x + y) * frequency + phase1) * Math.cos((x - y) * frequency + phase2);
      const value = (value1 + value2) * 0.5;
      
      const index = (y * width + x) * 4;
      const intensity = Math.floor((value + 1) * 30); // 0-60の範囲
      
      // RGBAのアルファ値のみを設定して半透明効果を作成
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
      data[index + 3] = intensity;
      
      // 隣接ピクセルも同じ値に設定（パフォーマンス向上のため）
      if (x + 1 < width) {
        data[index + 4] = 255;
        data[index + 5] = 255;
        data[index + 6] = 255;
        data[index + 7] = intensity;
      }
      
      if (y + 1 < height) {
        const nextRowIndex = ((y + 1) * width + x) * 4;
        data[nextRowIndex] = 255;
        data[nextRowIndex + 1] = 255;
        data[nextRowIndex + 2] = 255;
        data[nextRowIndex + 3] = intensity;
        
        if (x + 1 < width) {
          data[nextRowIndex + 4] = 255;
          data[nextRowIndex + 5] = 255;
          data[nextRowIndex + 6] = 255;
          data[nextRowIndex + 7] = intensity;
        }
      }
    }
  }
  
  ctx.putImageData(pattern, 0, 0);
}

// ユーティリティ関数 - 色相のシフト
function shiftHue(hexColor, amount) {
  // 色がないか、または無効な形式の場合はランダムな色を返す
  if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
    // RGB形式の色の場合の処理
    if (typeof hexColor === 'string' && hexColor.startsWith('rgb')) {
      const rgbValues = hexColor.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        const r = parseInt(rgbValues[0]) / 255;
        const g = parseInt(rgbValues[1]) / 255;
        const b = parseInt(rgbValues[2]) / 255;
        
        // 以下のHSL変換処理を続行
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
          h = s = 0;
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          
          h /= 6;
        }
        
        // 色相をシフト
        h = (h + amount / 360) % 1;
        if (h < 0) h += 1;
        
        // HSLからRGBに戻す
        let r1, g1, b1;
        
        if (s === 0) {
          r1 = g1 = b1 = l;
        } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          
          r1 = hueToRgb(p, q, h + 1/3);
          g1 = hueToRgb(p, q, h);
          b1 = hueToRgb(p, q, h - 1/3);
        }
        
        // RGBからHEXに変換して返す
        return '#' + 
          Math.round(r1 * 255).toString(16).padStart(2, '0') +
          Math.round(g1 * 255).toString(16).padStart(2, '0') +
          Math.round(b1 * 255).toString(16).padStart(2, '0');
      }
    }
    
    // 変換できない場合はデフォルトの色を返す
    return dotConfig.baseColor;
  }

  // HEXからRGBに変換
  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  
  // RGBからHSLに変換
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // 彩度がない場合は色相も0
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  // 色相をシフト
  h = (h + amount / 360) % 1;
  if (h < 0) h += 1;
  
  // HSLからRGBに戻す
  let r1, g1, b1;
  
  if (s === 0) {
    r1 = g1 = b1 = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r1 = hueToRgb(p, q, h + 1/3);
    g1 = hueToRgb(p, q, h);
    b1 = hueToRgb(p, q, h - 1/3);
  }
  
  // RGBからHEXに変換して返す
  return '#' + 
    Math.round(r1 * 255).toString(16).padStart(2, '0') +
    Math.round(g1 * 255).toString(16).padStart(2, '0') +
    Math.round(b1 * 255).toString(16).padStart(2, '0');
}

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

window.initDotRippleBackground = function() {
  console.log('幻想的なドット波紋アニメーション初期化開始');

  const heroSection = document.querySelector('.hero');
  if (!heroSection) {
    console.error('ヒーローセクションが見つかりません');
    return;
  }
  
  let canvas = heroSection.querySelector('.dots-canvas');
  if (canvas) {
    console.log('キャンバスは既に存在します。再初期化します。');
    canvas.remove();
  }
  
  let gradientOverlay = heroSection.querySelector('.gradient-overlay');
  if (gradientOverlay) {
    gradientOverlay.remove();
  }
  
  canvas = document.createElement('canvas');
  canvas.classList.add('dots-canvas');
  heroSection.prepend(canvas);
  
  const ctx = canvas.getContext('2d');
  let width = heroSection.offsetWidth;
  let height = heroSection.offsetHeight;
  
  canvas.width = width;
  canvas.height = height;
  
  const dots = [];
  
  let ripples = [];    // 波紋エフェクト用の配列
  let particleFlows = []; // 粒子流れ効果用の配列

  gradientOverlay = document.createElement('div');
  gradientOverlay.classList.add('gradient-overlay');
  heroSection.prepend(gradientOverlay);
  
  let mouseX = -1000;
  let mouseY = -1000;
  let prevMouseX = -1000;
  let prevMouseY = -1000;
  let mouseSpeed = 0;
  let lastMouseX = -1000;
  let lastMouseY = -1000;
  let lastMouseMoveTime = 0;
  let lastNaturalRippleTime = 0;
  let lastMouseRippleTime = 0;
  let lastTrailRippleTime = 0;
  let mouseActive = false;
  let mouseMoving = false;
  let mouseTrail = [];
  let colorCycle = 0;
  
  function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }
  
  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }
  
  function easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
  
  function lerpColor(color1, color2, factor) {
    const parseColor = (color) => {
      if (typeof color === 'string' && color.startsWith('rgb')) {
        const values = color.match(/\d+/g).map(Number);
        return values;
      } else if (typeof color === 'string' && color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return [r, g, b];
      }
      return [0, 0, 0];
    };
    
    const [r1, g1, b1] = parseColor(color1);
    const [r2, g2, b2] = parseColor(color2);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  
  function getCyclicColor(base, cycle, intensity) {
    const hue = (base + cycle) % 1;
    const [r, g, b] = hslToRgb(hue, 0.8, 0.6);
    return `rgb(${r}, ${g}, ${b}, ${intensity})`;
  }
  
  // createRipple関数をここに移動
  function createRipple(x, y, strength, isNatural = false, colorType = 'normal') {
    const now = performance.now();
    const maxRadius = dotConfig.maxRippleRadius * (0.5 + strength * 0.5);
    const harmonics = dotConfig.harmonics && Math.random() > 0.6;
    
    // 全ての色タイプに対して、より透明感のある色を使用
    let rippleBaseColor, rippleTargetColor;
    switch (colorType) {
      case 'accent':
      case 'dream1':
      case 'dream2':
      case 'dream3':
      case 'cyclic':
      default:
        // 透明感のあるホワイト系の色に統一
        rippleBaseColor = 'rgba(240, 250, 255, 0.4)';
        rippleTargetColor = 'rgba(255, 255, 255, 0.4)';
    }
    
    const pattern = Math.floor(Math.random() * 5);
    
    ripples.push({
      x: x,
      y: y,
      radius: 0,
      maxRadius: maxRadius,
      strength: Math.min(1.0, strength * 2),
      opacity: 1.0,
      growing: true,
      createdAt: now,
      speedVariation: Math.random() * 0.3 + 0.9,
      isNatural: isNatural,
      amplitude: isNatural ? 0.2 + Math.random() * 0.2 : 0.5,
      frequency: 0.05 + Math.random() * 0.02,
      baseColor: rippleBaseColor,
      targetColor: rippleTargetColor,
      colorIntensity: Math.min(1.0, strength * 2.5),
      pattern: pattern,
      harmonics: harmonics,
      harmonic1: Math.random() * 0.02 + 0.01,
      harmonic2: Math.random() * 0.05 + 0.02,
      phase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.002,
      distortion: Math.random() * 0.3,
      glowIntensity: dotConfig.glowEffect ? (Math.random() * 0.5 + 0.5) : 0
    });
    
    if (!isNatural && Math.random() > 0.6) {
      const flowCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < flowCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 30 + 20;
        
        particleFlows.push({
          startX: x,
          startY: y,
          x: x,
          y: y,
          targetX: x + Math.cos(angle) * distance,
          targetY: y + Math.sin(angle) * distance,
          progress: 0,
          duration: Math.random() * 1000 + 1000,
          startTime: now,
          color: rippleTargetColor,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.3 + 0.7
        });
      }
    }
    
    if (ripples.length > dotConfig.maxRipples) {
      const naturalRipples = ripples.filter(r => r.isNatural);
      if (naturalRipples.length > dotConfig.minRipples) {
        const oldestNaturalIndex = ripples.findIndex(r => r.isNatural);
        if (oldestNaturalIndex >= 0) {
          ripples.splice(oldestNaturalIndex, 1);
          return;
        }
      }
      
      ripples.shift();
    }
  }
  
  function createMouseTrailRipples() {
    const now = performance.now();
    
    if (!mouseActive) return;
    
    if (now - lastMouseRippleTime > dotConfig.mouseRippleInterval) {
      lastMouseRippleTime = now;
      
      const strength = Math.min(1.0, mouseSpeed / 8 + 0.3);
      
      const colorTypes = ['normal', 'accent', 'dream1', 'dream2', 'dream3', 'cyclic'];
      const colorTypeIndex = Math.floor(Math.pow(mouseSpeed / 10, 0.5) * colorTypes.length);
      const selectedColorType = colorTypes[Math.min(colorTypeIndex, colorTypes.length - 1)];
      
      createRipple(mouseX, mouseY, strength, false, selectedColorType);
    }
  }
  
  function createNaturalRipple() {
    const now = performance.now();
    if (now - lastNaturalRippleTime > dotConfig.naturalRippleInterval) {
      lastNaturalRippleTime = now;
      
      const x = Math.random() * width;
      const y = Math.random() * height;
      const strength = Math.random() * 0.3 + 0.2;
      
      const colorTypes = ['normal', 'accent', 'dream1', 'dream2', 'dream3', 'cyclic'];
      const selectedColorType = colorTypes[Math.floor(Math.random() * colorTypes.length)];
      
      createRipple(x, y, strength, true, selectedColorType);
    }
  }
  
  function createDots() {
    const cols = Math.ceil(width / dotConfig.gridSize);
    const rows = Math.ceil(height / dotConfig.gridSize);
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if ((i + j) % 2 === 0 && Math.random() > 0.05) {
          const jitterX = (Math.random() - 0.5) * 4;
          const jitterY = (Math.random() - 0.5) * 4;
          
          dots.push({
            x: i * dotConfig.gridSize + jitterX,
            y: j * dotConfig.gridSize + jitterY,
            originalX: i * dotConfig.gridSize + jitterX,
            originalY: j * dotConfig.gridSize + jitterY,
            size: dotConfig.size * (Math.random() * 0.4 + 0.8),
            baseColor: dotConfig.baseColor,
            currentColor: dotConfig.baseColor,
            targetColor: dotConfig.baseColor,
            opacity: dotConfig.opacity,
            originalOpacity: dotConfig.opacity,
            targetOpacity: dotConfig.opacity,
            transitionSpeed: dotConfig.fluidFactor,
            colorTransitionSpeed: dotConfig.fluidFactor * 0.8,
            lastInfluence: 0,
            colorInfluence: 0,
            flowX: 0,
            flowY: 0,
            flowForce: 0,
            interactionFactor: Math.random() * 0.8 + 0.2,
            glowFactor: 0
          });
        }
      }
    }
    console.log(`${dots.length}個のドットを生成しました`);
  }
  
  function updateMouseSpeed(x, y) {
    const now = performance.now();
    
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    
    mouseX = x;
    mouseY = y;
    
    mouseTrail.push({ x, y, time: now });
    
    if (mouseTrail.length > dotConfig.trailLength) {
      mouseTrail.shift();
    }
    
    const dx = x - lastMouseX;
    const dy = y - lastMouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 1) {
      mouseMoving = true;
      resetMouseStopTimer();
    }
    
    if (lastMouseX > -999 && lastMouseY > -999) {
      const timeDiff = now - lastMouseMoveTime;
      
      if (timeDiff < 100 && timeDiff > 0) {
        // マウススピードを計算するが、より穏やかな効果になるよう調整
        mouseSpeed = Math.min(distance / Math.max(1, timeDiff * 0.05), 5);
      }
    }
    
    lastMouseX = x;
    lastMouseY = y;
    lastMouseMoveTime = now;
    
    // マウスの動きに応じてより自然な波紋を生成
    if (mouseSpeed > 0.8 && Math.random() > 0.7) {
      const strength = Math.min(0.6, mouseSpeed / 10 + 0.2);
      const colorTypes = ['normal', 'accent', 'dream1'];
      const selectedColorType = colorTypes[Math.floor(Math.random() * colorTypes.length)];
      
      createRipple(x, y, strength, false, selectedColorType);
    }
  }
  
  function createTrailRipples() {
    const now = performance.now();
    
    if (!mouseActive || !mouseMoving || mouseTrail.length < 2) return;
    
    if (now - lastTrailRippleTime < dotConfig.trailRippleInterval) return;
    
    lastTrailRippleTime = now;
    
    const trailIndex = Math.floor(Math.pow(Math.random(), 1.2) * mouseTrail.length);
    const trailPoint = mouseTrail[trailIndex];
    
    if (!trailPoint) return;
    
    const trailAge = now - trailPoint.time;
    const ageStrength = Math.max(0.1, 1 - (trailAge / 1200));
    const strength = Math.min(0.7, mouseSpeed / 10 + 0.2) * ageStrength;
    
    const colorTypes = ['normal', 'accent', 'dream1', 'dream2', 'dream3', 'cyclic'];
    const selectedColorType = colorTypes[Math.floor(Math.random() * colorTypes.length)];
    
    const jitterX = trailPoint.x + (Math.random() - 0.5) * 8;
    const jitterY = trailPoint.y + (Math.random() - 0.5) * 8;
    
    createRipple(jitterX, jitterY, strength, false, selectedColorType);
  }
  
  function updateParticleFlows() {
    const now = performance.now();
    
    for (let i = particleFlows.length - 1; i >= 0; i--) {
      const flow = particleFlows[i];
      const elapsedTime = now - flow.startTime;
      
      if (elapsedTime >= flow.duration) {
        particleFlows.splice(i, 1);
        continue;
      }
      
      flow.progress = elapsedTime / flow.duration;
      
      const easedProgress = easeOutQuint(flow.progress);
      
      flow.x = flow.startX + (flow.targetX - flow.startX) * easedProgress;
      flow.y = flow.startY + (flow.targetY - flow.startY) * easedProgress;
      
      flow.opacity = 1 - easedProgress;
    }
  }
  
  function updateRipples() {
    const now = performance.now();
    
    createNaturalRipple();
    
    if (mouseActive && mouseMoving) {
      createMouseTrailRipples();
      createTrailRipples();
    }
    
    colorCycle += dotConfig.colorCycleSpeed;
    if (colorCycle > 1) colorCycle -= 1;
    
    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i];
      const age = now - ripple.createdAt;
      
      ripple.rotation += ripple.rotationSpeed;
      
      if (ripple.growing) {
        const growthDuration = 1500 * (ripple.maxRadius / dotConfig.maxRippleRadius);
        const growthProgress = Math.min(1, age / growthDuration);
        
        const easedProgress = ripple.harmonics ? 
                            easeOutElastic(growthProgress) : 
                            easeOutQuint(growthProgress);
        
        ripple.radius = ripple.maxRadius * easedProgress;
        
        if (growthProgress >= 0.98) {
          ripple.growing = false;
        }
      } else {
        const fadeSpeed = dotConfig.rippleFadeSpeed * 
                         (ripple.isNatural ? 0.6 : 
                          (mouseActive && mouseMoving ? 0.85 : 1.0));
        
        ripple.opacity -= fadeSpeed;
        
        if (ripple.glowIntensity > 0) {
          ripple.glowIntensity -= fadeSpeed * 0.7;
        }
        
        if (ripple.opacity <= 0) {
          ripples.splice(i, 1);
          continue;
        }
      }

      enhanceRippleParticleInteraction(ripple, dots, particleFlows);
    }
    
    updateParticleFlows();
  }
  
  function drawDots() {
    ctx.clearRect(0, 0, width, height);
    
    // 幻想的な干渉パターンを描画
    if (dotConfig.useInterference) {
      ctx.save();
      ctx.globalCompositeOperation = dotConfig.blendMode;
      
      ripples.forEach(ripple => {
        if (ripple.opacity <= 0.1) return;
        
        // 半径が負の値や0になるのを防ぐ
        const safeRadius = Math.max(0.1, ripple.radius);
        
        const waveGradient = ctx.createRadialGradient(
          ripple.x, ripple.y, 0,
          ripple.x, ripple.y, safeRadius
        );
        
        // より無色透明に近い色に変更
        waveGradient.addColorStop(0, `rgba(245, 250, 255, ${ripple.opacity * 0.06})`);
        waveGradient.addColorStop(0.4, `rgba(240, 245, 255, ${ripple.opacity * 0.03})`);
        waveGradient.addColorStop(0.7, `rgba(230, 240, 255, ${ripple.opacity * 0.015})`);
        waveGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = waveGradient;
        ctx.beginPath();
        // 半径が負の値にならないよう安全な値を使用
        ctx.arc(ripple.x, ripple.y, safeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 干渉パターンを描画
        if (ripple.pattern === 2 || ripple.pattern === 3) {
          // より透明感のある線で描画
          ctx.strokeStyle = `rgba(240, 250, 255, ${ripple.opacity * 0.1})`;
          ctx.lineWidth = 0.7;
          
          const segments = 8 + Math.floor(ripple.radius / 15);
          const angleStep = (Math.PI * 2) / segments;
          
          ctx.beginPath();
          for (let i = 0; i < segments; i++) {
            const angle = i * angleStep + ripple.rotation;
            const innerRadius = ripple.radius * 0.7;
            const outerRadius = ripple.radius;
            
            const waveAmplitude = ripple.radius * 0.1 * ripple.opacity;
            const innerWave = Math.sin(angle * 6 + ripple.phase) * waveAmplitude;
            const outerWave = Math.sin(angle * 8 + ripple.phase * 2) * waveAmplitude;
            
            const x1 = ripple.x + Math.cos(angle) * (innerRadius + innerWave);
            const y1 = ripple.y + Math.sin(angle) * (innerRadius + innerWave);
            const x2 = ripple.x + Math.cos(angle) * (outerRadius + outerWave);
            const y2 = ripple.y + Math.sin(angle) * (outerRadius + outerWave);
            
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
          ctx.stroke();
        }
      });
      
      ctx.restore();
    }
    
    // 発光エフェクトを描画
    if (dotConfig.useGlowEffect) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      
      ripples.forEach(ripple => {
        if (ripple.glowIntensity <= 0) return;
        
        // 半径が負の値にならないようにチェック
        const radius = Math.max(0.1, ripple.radius * 1.2);
        
        const gradient = ctx.createRadialGradient(
          ripple.x, ripple.y, 0,
          ripple.x, ripple.y, radius
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${ripple.glowIntensity * 0.3 * ripple.opacity})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${ripple.glowIntensity * 0.1 * ripple.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.restore();
    }
    
    // 幻想的な粒子エフェクトを描画
    if (dotConfig.useParticles) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      
      // 特殊な発光粒子を生成
      if (mouseActive && Math.random() > 0.97) {
        const particleCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < particleCount; i++) {
          const distance = Math.random() * 30;
          const angle = Math.random() * Math.PI * 2;
          
          const x = mouseX + Math.cos(angle) * distance;
          const y = mouseY + Math.sin(angle) * distance;
          
          const particleFlow = new ParticleFlow(
            x, y, 
            Math.random() * Math.PI * 2,
            getCyclicColor(Math.random(), colorCycle, 1.0)
          );
          particleFlow.canvasWidth = width; // キャンバスの幅を設定
          particleFlow.canvasHeight = height; // キャンバスの高さを設定
          particleFlows.push(particleFlow);
        }
      }
      
      // 粒子フローの描画
      particleFlows.forEach(flow => {
        if (flow instanceof ParticleFlow) {
          flow.update();
          flow.draw(ctx);
        } else {
          // 旧フォーマットの粒子フロー対応
          const opacity = flow.opacity * (1 - flow.progress);
          if (opacity <= 0.05) return;
          
          const size = flow.size * (1 - flow.progress * 0.5);
          
          // グラデーション発光効果 - より透明感のある表現に
          const safeSize = Math.max(0.1, size * 3);
          const gradient = ctx.createRadialGradient(
            flow.x, flow.y, 0,
            flow.x, flow.y, safeSize
          );
          
          // より透明感のある発光効果
          gradient.addColorStop(0, `rgba(230, 245, 255, ${opacity * 0.6})`);
          
          // 色情報を抽出
          let r = 100, g = 200, b = 255;
          if (typeof flow.color === 'string') {
            const match = flow.color.match(/\d+/g);
            if (match && match.length >= 3) {
              [r, g, b] = match.map(Number);
            }
          }
          
          gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${opacity * 0.3})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(flow.x, flow.y, size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      ctx.restore();
    }
    
    // 通常のドットを描画
    const currentRadius = dotConfig.radius + mouseSpeed * 15;
    
    let activeDotsCount = 0;
    let maxActiveFactor = 0;
    
    if (dotConfig.particleInteraction) {
      dots.forEach(dot => {
        dot.flowX *= 0.9;
        dot.flowY *= 0.9;
        dot.flowForce *= 0.9;
        
        ripples.forEach(ripple => {
          const rdx = ripple.x - dot.x;
          const rdy = ripple.y - dot.y;
          const rippleDist = Math.sqrt(rdx * rdx + rdy * rdy);
          
          const rippleWidth = ripple.maxRadius * 0.15;
          const rippleCenter = ripple.radius;
          const distFromRippleCenter = Math.abs(rippleDist - rippleCenter);
          
          if (distFromRippleCenter < rippleWidth) {
            const normalizedDist = distFromRippleCenter / rippleWidth;
            const forceFactor = Math.exp(-4 * normalizedDist * normalizedDist) * 
                              ripple.strength * ripple.opacity * 0.5;
            
            const forceX = (dot.x - ripple.x) / Math.max(1, rippleDist) * forceFactor;
            const forceY = (dot.y - ripple.y) / Math.max(1, rippleDist) * forceFactor;
            
            dot.flowX += forceX * dot.interactionFactor;
            dot.flowY += forceY * dot.interactionFactor;
            dot.flowForce = Math.max(dot.flowForce, forceFactor);
          }
        });
      });
    }
    
    dots.forEach(dot => {
      if (dotConfig.particleInteraction && dot.flowForce > 0.01) {
        dot.x += dot.flowX;
        dot.y += dot.flowY;
        
        dot.x += (dot.originalX - dot.x) * 0.05;
        dot.y += (dot.originalY - dot.y) * 0.05;
      }
      
      const dx = mouseX - dot.x;
      const dy = mouseY - dot.y;
      
      const mouseDistance = Math.sqrt(dx * dx + dy * dy);
      
      let maxFactor = 0;
      let colorFactor = 0;
      let targetRippleColor = dotConfig.rippleColor;
      let glowFactor = 0;
      
      if (mouseDistance < currentRadius) {
        const factor = 1 - mouseDistance / currentRadius;
        maxFactor = Math.max(maxFactor, factor);
        colorFactor = Math.max(colorFactor, factor);
      }
      
      ripples.forEach(ripple => {
        const rdx = ripple.x - dot.x;
        const rdy = ripple.y - dot.y;
        const rippleDistance = Math.sqrt(rdx * rdx + rdy * rdy);
        
        let rippleWidth = ripple.maxRadius * 0.15;
        let rippleCenter = ripple.radius;
        
        if (ripple.pattern === 1) {
          const rings = 3;
          for (let r = 0; r < rings; r++) {
            const ringCenter = ripple.radius * (0.4 + r * 0.3);
            const ringWidth = ripple.maxRadius * 0.05;
            const distFromRingCenter = Math.abs(rippleDistance - ringCenter);
            
            if (distFromRingCenter < ringWidth) {
              const normalizedDist = distFromRingCenter / ringWidth;
              const ringFactor = Math.exp(-6 * normalizedDist * normalizedDist) * 
                               ripple.strength * ripple.opacity;
              
              maxFactor = Math.max(maxFactor, ringFactor);
              
              if (ringFactor > colorFactor) {
                colorFactor = ringFactor;
                targetRippleColor = ripple.targetColor;
                glowFactor = ringFactor * ripple.glowIntensity;
              }
            }
          }
        } else if (ripple.pattern === 2) {
          const angle = Math.atan2(rdy, rdx) + ripple.rotation;
          const distortion = Math.sin(angle * 6 + ripple.phase) * ripple.distortion;
          
          rippleWidth *= (1 + distortion);
          rippleCenter *= (1 + distortion * 0.5);
          
          const distFromRippleCenter = Math.abs(rippleDistance - rippleCenter);
          
          if (distFromRippleCenter < rippleWidth) {
            const normalizedDist = distFromRippleCenter / rippleWidth;
            const rippleFactor = Math.exp(-6 * normalizedDist * normalizedDist) * 
                               ripple.strength * ripple.opacity;
            
            maxFactor = Math.max(maxFactor, rippleFactor);
            
            if (rippleFactor > colorFactor) {
              colorFactor = rippleFactor;
              targetRippleColor = ripple.targetColor;
              glowFactor = rippleFactor * ripple.glowIntensity;
            }
          }
        } else if (ripple.pattern === 3) {
          const angle = Math.atan2(rdy, rdx) + ripple.rotation;
          const harmonic = Math.sin(angle * 8) * Math.cos(angle * 3) * ripple.harmonic1;
          
          if (rippleDistance > ripple.radius * 0.8 && 
              rippleDistance < ripple.radius * 1.2) {
            
            const distFactor = 1 - Math.abs(rippleDistance - ripple.radius) / (ripple.radius * 0.2);
            const waveFactor = (1 + harmonic) * distFactor * ripple.strength * ripple.opacity;
            
            maxFactor = Math.max(maxFactor, waveFactor);
            
            if (waveFactor > colorFactor) {
              colorFactor = waveFactor;
              targetRippleColor = ripple.targetColor;
              glowFactor = waveFactor * ripple.glowIntensity;
            }
          }
        } else {
          const distFromRippleCenter = Math.abs(rippleDistance - rippleCenter);
          
          if (distFromRippleCenter < rippleWidth) {
            const normalizedDist = distFromRippleCenter / rippleWidth;
            const rippleFactor = Math.exp(-6 * normalizedDist * normalizedDist) * 
                               ripple.strength * ripple.opacity;
            
            maxFactor = Math.max(maxFactor, rippleFactor);
            
            if (rippleFactor > colorFactor) {
              colorFactor = rippleFactor;
              targetRippleColor = ripple.targetColor;
              glowFactor = rippleFactor * ripple.glowIntensity;
            }
          }
        }
      });
      
      maxFactor = dot.lastInfluence * 0.2 + maxFactor * 0.8;
      dot.lastInfluence = maxFactor;
      
      colorFactor = dot.colorInfluence * 0.1 + colorFactor * 0.9;
      dot.colorInfluence = colorFactor;
      
      dot.glowFactor = dot.glowFactor * 0.8 + glowFactor * 0.2;
      
      if (maxFactor > 0) {
        dot.targetOpacity = dot.originalOpacity + 
                          (dotConfig.maxOpacity - dot.originalOpacity) * Math.pow(maxFactor, 0.8);
        activeDotsCount++;
        
        if (maxFactor > maxActiveFactor) {
          maxActiveFactor = maxFactor;
        }
        
        if (colorFactor > 0.05) {
          dot.targetColor = lerpColor(dot.baseColor, targetRippleColor, Math.min(1, colorFactor * 1.5));
        } else {
          dot.targetColor = dot.baseColor;
        }
      } else {
        dot.targetOpacity = dot.originalOpacity;
        dot.targetColor = dot.baseColor;
      }
      
      dot.opacity += (dot.targetOpacity - dot.opacity) * dot.transitionSpeed;
      
      if (dot.currentColor !== dot.targetColor) {
        dot.currentColor = lerpColor(
          dot.currentColor, 
          dot.targetColor, 
          dot.colorTransitionSpeed
        );
      }
      
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size * (1 + dot.flowForce * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = dot.currentColor;
      ctx.globalAlpha = dot.opacity;
      ctx.fill();
      
      if (dot.glowFactor > 0.1 && dotConfig.glowEffect) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size * (1 + dot.glowFactor), 0, Math.PI * 2);
        ctx.fillStyle = dotConfig.glowColor;
        ctx.globalAlpha = dot.glowFactor * 0.5;
        ctx.fill();
        
        ctx.restore();
      }
      
      ctx.globalAlpha = 1.0;
    });
    
    updateGradientOpacity(activeDotsCount, maxActiveFactor);
    
    mouseSpeed *= 0.95;
  }
  
  function updateGradientOpacity(activeCount, maxFactor) {
    if (activeCount > 0) {
      const opacityFactor = Math.min(0.25, (activeCount / 100) * 0.15 + maxFactor * 0.1);
      gradientOverlay.style.opacity = opacityFactor.toString();
      
      const hue = (performance.now() * 0.0001) % 360;
      gradientOverlay.style.background = 
        `radial-gradient(circle at center, 
         rgba(255, 255, 255, ${opacityFactor * 0.6}) 0%, 
         hsla(${hue}, 70%, 60%, ${opacityFactor * 0.3}) 40%, 
         hsla(${hue + 60}, 80%, 40%, ${opacityFactor * 0.2}) 70%, 
         transparent 100%)`;
    } else {
      gradientOverlay.style.opacity = '0';
    }
  }
  
  function animate() {
    updateRipples();
    drawDots();
    requestAnimationFrame(animate);
  }
  
  heroSection.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - mouseX;
    const dy = y - mouseY;
    const moveDist = Math.sqrt(dx * dx + dy * dy);
    
    if (moveDist > 0.5) {
      mouseActive = true;
      mouseMoving = true;
      updateMouseSpeed(x, y);
    }
  });
  
  let mouseStopTimer;
  function resetMouseStopTimer() {
    clearTimeout(mouseStopTimer);
    mouseStopTimer = setTimeout(() => {
      mouseMoving = false;
      if (mouseActive) {
        createRipple(mouseX, mouseY, 0.7, false, 'dream2');
        
        setTimeout(() => {
          for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30 + 10;
            createRipple(
              mouseX + Math.cos(angle) * distance, 
              mouseY + Math.sin(angle) * distance, 
              0.3, 
              false, 
              'cyclic'
            );
          }
        }, 200);
      }
    }, 120);
  }
  
  heroSection.addEventListener('mouseenter', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseActive = true;
    
    createRipple(mouseX, mouseY, 0.5, false, 'dream1');
    
    setTimeout(() => {
      createRipple(mouseX, mouseY, 0.3, false, 'cyclic');
    }, 150);
  });
  
  heroSection.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
    mouseActive = false;
    mouseMoving = false;
    clearTimeout(mouseStopTimer);
    
    gradientOverlay.style.opacity = '0';
  });
  
  heroSection.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    createRipple(x, y, 1.0, false, 'dream3');
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const angle = (i / 5) * Math.PI * 2;
        const distance = i * 8;
        createRipple(
          x + Math.cos(angle) * distance, 
          y + Math.sin(angle) * distance, 
          0.7 - i * 0.1, 
          false, 
          i % 2 === 0 ? 'dream1' : 'dream2'
        );
      }, i * 70);
    }
    
    setTimeout(() => {
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 40 + 20;
        setTimeout(() => {
          createRipple(
            x + Math.cos(angle) * distance, 
            y + Math.sin(angle) * distance, 
            0.4, 
            false, 
            'cyclic'
          );
        }, Math.random() * 300);
      }
    }, 200);
  });
  
  window.addEventListener('resize', () => {
    width = heroSection.offsetWidth;
    height = heroSection.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    
    dots.length = 0;
    createDots();
  });
  
  createDots();
  
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const colorTypes = ['normal', 'accent', 'dream1', 'dream2', 'dream3'];
    const colorType = colorTypes[i % colorTypes.length];
    createRipple(x, y, Math.random() * 0.3 + 0.2, true, colorType);
  }
  
  setTimeout(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    createRipple(centerX, centerY, 0.8, true, 'cyclic');
    
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const distance = 80;
        createRipple(
          centerX + Math.cos(angle) * distance, 
          centerY + Math.sin(angle) * distance, 
          0.5, 
          true, 
          'dream' + ((i % 3) + 1)
        );
      }
    }, 600);
  }, 300);
  
  animate();
  
  console.log('幻想的な波紋アニメーション初期化完了');
};

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded: 幻想的なドット波紋アニメーション初期化を実行します');
  window.initDotRippleBackground();
});