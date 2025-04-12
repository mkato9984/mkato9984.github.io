document.addEventListener('DOMContentLoaded', function() {
    // モバイルメニューの制御
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const body = document.body;
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            body.classList.toggle('menu-open');
            const isOpen = body.classList.contains('menu-open');
            menuToggle.setAttribute('aria-expanded', isOpen);
        });
    }
    
    // オーバーレイクリックでメニューを閉じる
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function() {
            body.classList.remove('menu-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    }
    
    // モバイル表示時のドロップダウンメニュー
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    if (window.innerWidth <= 1024) {
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    const dropdownMenu = this.nextElementSibling;
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';
                    
                    this.setAttribute('aria-expanded', !isExpanded);
                    dropdownMenu.style.display = isExpanded ? 'none' : 'block';
                }
            });
        });
    }
    
    // スムーズスクロール
    const navLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // モバイルメニューを閉じる
            if (body.classList.contains('menu-open')) {
                body.classList.remove('menu-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // よくある質問のアコーディオン機能
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // 現在開いている質問を閉じる
            faqQuestions.forEach(q => {
                if (q !== this && q.getAttribute('aria-expanded') === 'true') {
                    q.setAttribute('aria-expanded', 'false');
                    q.nextElementSibling.classList.remove('active');
                }
            });
            
            this.setAttribute('aria-expanded', !isExpanded);
            answer.classList.toggle('active');
        });
    });
    
    // ページトップに戻るボタン
    const backToTopButton = document.createElement('a');
    backToTopButton.className = 'back-to-top';
    backToTopButton.setAttribute('aria-label', 'トップに戻る');
    backToTopButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
    document.body.appendChild(backToTopButton);
    
    // スクロールに応じてボタンの表示/非表示
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // ボタンクリック時のスクロール
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // お問い合わせフォームのバリデーション
    const contactForm = document.getElementById('inquiryForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 入力確認
            let isValid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const message = document.getElementById('message');
            
            if (!name.value.trim()) {
                isValid = false;
                name.style.borderColor = '#e74c3c';
            } else {
                name.style.borderColor = '#ddd';
            }
            
            if (!email.value.trim() || !isValidEmail(email.value)) {
                isValid = false;
                email.style.borderColor = '#e74c3c';
            } else {
                email.style.borderColor = '#ddd';
            }
            
            if (!message.value.trim()) {
                isValid = false;
                message.style.borderColor = '#e74c3c';
            } else {
                message.style.borderColor = '#ddd';
            }
            
            if (isValid) {
                // フォーム送信処理
                alert('お問い合わせありがとうございます。メッセージが送信されました。');
                contactForm.reset();
            } else {
                alert('必須項目を入力してください。');
            }
        });
    }
    
    // メールアドレスのバリデーション
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // アニメーション効果
    const animatedElements = document.querySelectorAll('.feature-card, .course-card, .testimonial-card, .support-card, .pricing-card, .process-step');
    
    // スクロール時のアニメーション
    function checkScroll() {
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight * 0.9) {
                element.classList.add('animated');
            }
        });
    }
    
    // 初回読み込み時とスクロール時にチェック
    window.addEventListener('load', checkScroll);
    window.addEventListener('scroll', checkScroll);
    
    // ウィンドウリサイズ時の対応
    window.addEventListener('resize', function() {
        // モバイルメニューのリセット
        if (window.innerWidth > 1024 && body.classList.contains('menu-open')) {
            body.classList.remove('menu-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
});