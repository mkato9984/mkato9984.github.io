document.addEventListener('DOMContentLoaded', function() {
    // モバイルメニュートグル
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.main-nav');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const body = document.body;

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            body.classList.toggle('menu-open');
            const isOpen = body.classList.contains('menu-open');
            menuToggle.setAttribute('aria-expanded', isOpen);
        });
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function() {
            body.classList.remove('menu-open');
            menuToggle.setAttribute('aria-expanded', false);
        });
    }

    // ドロップダウンメニューのアクセシビリティ対応
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
        });
    }

    // モバイルでのドロップダウン
    const dropdowns = document.querySelectorAll('.nav-list .dropdown');
    dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        
        if (dropdownToggle && window.innerWidth <= 1024) {
            dropdownToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 他のすべてのドロップダウンを閉じる
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.querySelector('.dropdown-menu').style.display = 'none';
                    }
                });
                
                // このドロップダウンを開く/閉じる
                if (dropdownMenu.style.display === 'block') {
                    dropdownMenu.style.display = 'none';
                } else {
                    dropdownMenu.style.display = 'block';
                }
            });
        }
    });

    // ページ内リンクスムーススクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // ドロップダウントグルでなければスムーススクロールを実行
            if (!this.classList.contains('dropdown-toggle')) {
                const target = document.querySelector(this.getAttribute('href'));
                
                if (target) {
                    e.preventDefault();
                    
                    // モバイルメニューが開いていたら閉じる
                    body.classList.remove('menu-open');
                    if (menuToggle) {
                        menuToggle.setAttribute('aria-expanded', false);
                    }
                    
                    // ヘッダーの高さを考慮したスクロール位置の計算
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // よくある質問のアコーディオン
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // すべての質問を閉じる
            faqQuestions.forEach(q => {
                if (q !== this) {
                    q.setAttribute('aria-expanded', 'false');
                    q.nextElementSibling.classList.remove('active');
                }
            });
            
            // このFAQを開く/閉じる
            this.setAttribute('aria-expanded', !isExpanded);
            answer.classList.toggle('active');
        });
    });

    // ページトップへ戻るボタン
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ヒーローセクションのアニメーション効果
    const animateHero = () => {
        const heroElements = document.querySelectorAll('.hero-content > *');
        heroElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animated');
            }, index * 200);
        });
    };

    // ページ読み込み時にヒーローアニメーションを実行
    animateHero();

    // お問い合わせフォームのバリデーション
    const inquiryForm = document.getElementById('inquiryForm');
    
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 実際の送信処理はここに実装
            // FormDataを使用してフォームデータを取得し、APIに送信するなど
            
            // 送信成功時の処理例
            alert('お問い合わせを受け付けました。担当者からの返信をお待ちください。');
            inquiryForm.reset();
        });
    }
});