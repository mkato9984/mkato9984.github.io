/**
 * チーム シャイニー - メインJavaScriptファイル
 * サイトの動的機能を実装します
 */

document.addEventListener('DOMContentLoaded', function() {
    // ヘッダーの挙動を設定
    setupHeader();
    
    // タブ切り替え機能の設定
    setupTabs();
    
    // お客様の声スライダーの設定
    setupTestimonialSlider();
    
    // よくある質問のアコーディオン設定
    setupFAQAccordion();
    
    // お問い合わせフォーム送信処理
    setupContactForm();
    
    // トップに戻るボタンの設定
    setupBackToTop();
});

/**
 * ヘッダーのスクロール挙動とモバイルメニュー
 */
function setupHeader() {
    const header = document.querySelector('.header');
    const menuBtn = document.querySelector('.header__menu-btn');
    const nav = document.querySelector('.header__nav');
    
    // スクロール時のヘッダー挙動
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // スクロール位置が100px以上の場合、ヘッダーに背景色を付ける
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // 下にスクロール時はヘッダーを隠す、上にスクロール時は表示
        if (scrollTop > lastScrollTop && scrollTop > 300) {
            header.classList.add('header--hidden');
        } else {
            header.classList.remove('header--hidden');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // モバイルメニューの開閉
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            menuBtn.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }
    
    // ナビゲーションリンクをクリックした時にモバイルメニューを閉じる
    const navLinks = document.querySelectorAll('.header__nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuBtn.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

/**
 * サービス内容のタブ切り替え機能
 */
function setupTabs() {
    const tabs = document.querySelectorAll('.course__tab');
    const contents = document.querySelectorAll('.course__content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // タブのアクティブ状態を切り替え
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // コンテンツのアクティブ状態を切り替え
            const tabId = tab.getAttribute('data-tab');
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

/**
 * お客様の声スライダー
 */
function setupTestimonialSlider() {
    const slides = document.querySelectorAll('.voice__slide');
    const prevBtn = document.querySelector('.voice__slider-btn--prev');
    const nextBtn = document.querySelector('.voice__slider-btn--next');
    const dots = document.querySelectorAll('.voice__dot');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    // スライドを表示
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }
    
    // 次のスライドへ
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }
    
    // 前のスライドへ
    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }
    
    // 次へボタン
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    // 前へボタン
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    // ドットでのスライド切り替え
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });
    
    // 自動スライド（5秒ごと）
    setInterval(nextSlide, 5000);
}

/**
 * よくある質問のアコーディオン
 */
function setupFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq__item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq__question');
        
        if (question) {
            question.addEventListener('click', () => {
                // クリックした項目が既にアクティブならアクティブ解除、そうでなければ全て非アクティブにしてこの項目だけアクティブに
                if (item.classList.contains('active')) {
                    item.classList.remove('active');
                } else {
                    faqItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                }
            });
        }
    });
}

/**
 * お問い合わせフォーム送信処理
 */
function setupContactForm() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // フォームデータの取得
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                message: document.getElementById('message').value
            };
            
            // 実際の送信処理はここに実装（現在はモックアップ）
            console.log('送信されたデータ:', formData);
            
            // 送信成功時の処理
            alert('お問い合わせありがとうございます。48時間以内にご返信いたします。');
            form.reset();
        });
    }
}

/**
 * トップに戻るボタンの機能
 */
function setupBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (!backToTopButton) return;
    
    // スクロール位置が100px以上になったらボタンを表示
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // ボタンクリック時のスムーズスクロール
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}