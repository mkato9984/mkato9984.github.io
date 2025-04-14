document.addEventListener('DOMContentLoaded', function() {
    // 最初に行う処理：ページを表示する
    document.documentElement.style.visibility = 'visible';
    document.body.style.visibility = 'visible';
    
    // ダークモード切り替え機能
    initThemeToggle();
    
    // スクロールアニメーション
    initScrollAnimation();
    
    // ナビゲーションメニュー
    initMobileNav();
    
    // ギャラリーフィルタリング
    initGalleryFilter();
    
    // ライトボックス機能
    initLightbox();
    
    // よくある質問のアコーディオン
    initFaqAccordion();
    
    // 現在年の自動設定
    setCurrentYear();
    
    // ページトップへ戻るボタン
    initBackToTop();
    
    // 反復確認ダイアログ
    // initContinueDialog();
});

// ダークモード切り替え機能
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // システムの設定を確認
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // ローカルストレージから設定を取得
    const savedTheme = localStorage.getItem('theme');
    
    // テーマの初期設定
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.setAttribute('aria-label', 'ライトモードに切り替え');
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.setAttribute('aria-label', 'ダークモードに切り替え');
    }
    
    // テーマ切り替えの処理
    themeToggle.addEventListener('click', function() {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggle.setAttribute('aria-label', 'ダークモードに切り替え');
            console.log('ライトモードに切り替えました');
        } else {
            document.body.classList.add('dark-mode');
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.setAttribute('aria-label', 'ライトモードに切り替え');
            console.log('ダークモードに切り替えました');
        }
    });
}

// スクロールアニメーション
function initScrollAnimation() {
    // ユーザーがモーション軽減を設定している場合はアニメーションを無効化
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length === 0) return;
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    fadeElements.forEach(element => {
        fadeInObserver.observe(element);
    });
}

// モバイルナビゲーション
function initMobileNav() {
    const mobileMenuBtn = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.main-nav');
    if (!mobileMenuBtn || !mobileNav) return;
    
    mobileMenuBtn.addEventListener('click', function() {
        this.classList.toggle('open');
        mobileNav.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        document.querySelector('.mobile-menu-overlay').classList.toggle('active');
    });
    
    // ドロップダウンメニューの開閉
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            // モバイルビューの場合のみ通常のリンク動作を防止
            if (window.innerWidth <= 992) {
                e.preventDefault();
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);
            }
        });
    });
    
    // メニューリンクをクリックしたら閉じる
    const mobileLinks = mobileNav.querySelectorAll('a:not(.dropdown-toggle)');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenuBtn.classList.remove('open');
            mobileNav.classList.remove('active');
            document.body.classList.remove('menu-open');
            document.querySelector('.mobile-menu-overlay').classList.remove('active');
        });
    });

    // モバイルメニューオーバーレイをクリックしたときも閉じる
    const overlay = document.querySelector('.mobile-menu-overlay');
    if (overlay) {
        overlay.addEventListener('click', function() {
            mobileMenuBtn.classList.remove('open');
            mobileNav.classList.remove('active');
            document.body.classList.remove('menu-open');
            this.classList.remove('active');
        });
    }
}

// ギャラリーフィルタリング
function initGalleryFilter() {
    const filterButtons = document.querySelectorAll('.filter-button');
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (filterButtons.length === 0 || galleryItems.length === 0) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // アクティブクラスの切り替え
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// ライトボックス機能
function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    if (!lightbox || !lightboxImg || galleryItems.length === 0) return;
    
    let currentIndex = 0;
    let galleryImages = [];
    
    // ギャラリー画像とキャプション情報を収集
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('.gallery-img');
        const title = item.querySelector('.gallery-info h3')?.textContent || '';
        const desc = item.querySelector('.gallery-info p')?.textContent || '';
        
        galleryImages.push({
            src: img.src,
            title: title,
            desc: desc
        });
        
        item.addEventListener('click', function() {
            openLightbox(index);
        });
        
        // アクセシビリティ対応: キーボードでもアクセス可能に
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });
    
    // ライトボックスを開く
    function openLightbox(index) {
        currentIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // ライトボックスを閉じる
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // ライトボックスの内容を更新
    function updateLightboxContent() {
        const image = galleryImages[currentIndex];
        lightboxImg.src = image.src;
        lightboxImg.alt = image.title;
        
        lightboxCaption.innerHTML = `
            <h3>${image.title}</h3>
            <p>${image.desc}</p>
        `;
    }
    
    // 前の画像へ
    function prevImage() {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxContent();
    }
    
    // 次の画像へ
    function nextImage() {
        currentIndex = (currentIndex + 1) % galleryImages.length;
        updateLightboxContent();
    }
    
    // イベントリスナーの設定
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevImage);
    lightboxNext.addEventListener('click', nextImage);
    
    // 背景クリックでも閉じる
    lightbox.addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightbox();
        }
    });
    
    // キーボード操作
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            prevImage();
        } else if (e.key === 'ArrowRight') {
            nextImage();
        }
    });
}

// よくある質問のアコーディオン
function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length === 0) return;
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            // aria-expanded属性の切り替え
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            
            // アンサーセクションの表示/非表示切り替え
            const answer = this.nextElementSibling;
            if (isExpanded) {
                answer.classList.remove('active');
            } else {
                answer.classList.add('active');
            }
        });
    });
}

// 現在年の自動設定
function setCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

// ページトップへ戻るボタン
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 反復確認ダイアログの機能
function initContinueDialog() {
    // 確認ダイアログを表示する関数
    function showContinueDialog() {
        const result = confirm("反復処理を続行しますか?");
        if (result) {
            console.log("ユーザーが反復処理の続行を選択しました");
            // 続行する処理をここに記述
        } else {
            console.log("ユーザーが反復処理の中止を選択しました");
            // 中止する処理をここに記述
        }
    }
    
    // ページ読み込み後、適切なタイミングでダイアログを表示
    // 例: ページ読み込み後3秒後に表示
    setTimeout(showContinueDialog, 3000);
}