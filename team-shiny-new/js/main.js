/**
 * チームシャイニー メインJavaScript
 * 作成日: 2025年4月12日
 * 最終更新日: 2025年4月12日
 */

// DOMコンテンツがロードされたときに実行される関数
document.addEventListener('DOMContentLoaded', function() {
    // ページの読み込み完了後にローダーを非表示
    hideLoader();
    
    // AOSアニメーションライブラリの初期化
    initAOS();
    
    // モバイルメニューの制御
    initMobileMenu();
    
    // よくある質問のアコーディオン機能
    initFaqAccordion();
    
    // スムーズスクロール
    initSmoothScroll();
    
    // お問い合わせフォームの送信制御
    initContactForm();
    
    // 構造化データ（JSON-LD）の追加
    addStructuredData();
    
    // ヒーローセクションのパララックス効果
    initParallaxEffect();
    
    // カウントアップアニメーション
    initCounterAnimation();
    
    // ダークモード切り替え
    initThemeToggle();
    
    // テキストサイズ変更機能
    initTextSizeAdjustment();
    
    // アクセシビリティ機能の初期化
    initAccessibility();
});

/**
 * ページ読み込み完了時のローダー非表示
 */
function hideLoader() {
    const loader = document.querySelector('.loader-wrapper');
    if (loader) {
        // ローダーアニメーションの表示時間を少し確保
        setTimeout(() => {
            loader.classList.add('loader-hidden');
            // アニメーション完了後にDOM削除
            loader.addEventListener('transitionend', () => {
                loader.remove();
            });
        }, 500);
    }
}

/**
 * ダークモード切り替え機能
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const preferedColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    // ローカルストレージからテーマ設定を取得するか、システム設定に基づく初期値を設定
    const savedTheme = localStorage.getItem('theme') || preferedColorScheme;
    document.body.setAttribute('data-theme', savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // 現在のテーマを取得
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            // テーマを切り替え
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            // 新しいテーマをbody属性とローカルストレージに設定
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // アナウンス用のライブリージョンを追加（スクリーンリーダー対応）
            announceThemeChange(newTheme);
        });
    }
}

/**
 * テーマ変更のアナウンス（スクリーンリーダー対応）
 */
function announceThemeChange(theme) {
    let announcement = document.getElementById('theme-announcement');
    
    if (!announcement) {
        announcement = document.createElement('div');
        announcement.id = 'theme-announcement';
        announcement.setAttribute('aria-live', 'polite');
        announcement.classList.add('sr-only');
        document.body.appendChild(announcement);
    }
    
    const message = theme === 'dark' ? 'ダークモードに切り替えました' : 'ライトモードに切り替えました';
    announcement.textContent = message;
}

/**
 * テキストサイズ変更機能
 */
function initTextSizeAdjustment() {
    const decreaseBtn = document.getElementById('text-decrease');
    const resetBtn = document.getElementById('text-reset');
    const increaseBtn = document.getElementById('text-increase');
    
    // ローカルストレージからフォントサイズを取得
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        document.body.style.fontSize = savedFontSize;
    }
    
    if (decreaseBtn && resetBtn && increaseBtn) {
        // 文字サイズを小さくする
        decreaseBtn.addEventListener('click', () => {
            const currentSize = parseFloat(window.getComputedStyle(document.body).fontSize);
            if (currentSize > 14) { // 最小サイズを制限
                const newSize = `${currentSize - 1}px`;
                document.body.style.fontSize = newSize;
                localStorage.setItem('fontSize', newSize);
                announceTextSizeChange('小さく');
            }
        });
        
        // 文字サイズをリセット
        resetBtn.addEventListener('click', () => {
            document.body.style.fontSize = '';
            localStorage.removeItem('fontSize');
            announceTextSizeChange('リセット');
        });
        
        // 文字サイズを大きくする
        increaseBtn.addEventListener('click', () => {
            const currentSize = parseFloat(window.getComputedStyle(document.body).fontSize);
            if (currentSize < 24) { // 最大サイズを制限
                const newSize = `${currentSize + 1}px`;
                document.body.style.fontSize = newSize;
                localStorage.setItem('fontSize', newSize);
                announceTextSizeChange('大きく');
            }
        });
    }
}

/**
 * テキストサイズ変更のアナウンス（スクリーンリーダー対応）
 */
function announceTextSizeChange(direction) {
    let announcement = document.getElementById('text-size-announcement');
    
    if (!announcement) {
        announcement = document.createElement('div');
        announcement.id = 'text-size-announcement';
        announcement.setAttribute('aria-live', 'polite');
        announcement.classList.add('sr-only');
        document.body.appendChild(announcement);
    }
    
    let message;
    switch (direction) {
        case '小さく':
            message = 'テキストサイズを小さくしました';
            break;
        case '大きく':
            message = 'テキストサイズを大きくしました';
            break;
        default:
            message = 'テキストサイズをリセットしました';
    }
    
    announcement.textContent = message;
}

/**
 * アクセシビリティ機能の初期化
 */
function initAccessibility() {
    // フォーカス可能な要素へのキーボード操作対応
    improveKeyboardAccessibility();
    
    // フォーム入力の即時バリデーション
    initFormValidationFeedback();
}

/**
 * キーボード操作のアクセシビリティ向上
 */
function improveKeyboardAccessibility() {
    // 矢印キーでドロップダウンメニューを操作できるようにする
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.nav-link');
        const menu = dropdown.querySelector('.dropdown-menu');
        const items = menu.querySelectorAll('.dropdown-item');
        
        // トリガーをクリックでメニュー表示切り替え
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', !expanded);
            
            if (!expanded) {
                // メニューを表示し、最初の項目にフォーカス
                menu.style.opacity = '1';
                menu.style.visibility = 'visible';
                menu.style.transform = 'translateY(0)';
                if (items.length > 0) {
                    items[0].focus();
                }
            } else {
                // メニューを非表示
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
                menu.style.transform = 'translateY(10px)';
            }
        });
        
        // Escキーでメニューを閉じる
        menu.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                trigger.setAttribute('aria-expanded', 'false');
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
                menu.style.transform = 'translateY(10px)';
                trigger.focus();
            }
        });
        
        // ドロップダウン項目間を矢印キーで移動
        items.forEach((item, index) => {
            item.addEventListener('keydown', function(e) {
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        if (index < items.length - 1) {
                            items[index + 1].focus();
                        }
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        if (index > 0) {
                            items[index - 1].focus();
                        } else {
                            trigger.focus();
                        }
                        break;
                    case 'Tab':
                        if (!e.shiftKey && index === items.length - 1) {
                            trigger.setAttribute('aria-expanded', 'false');
                            menu.style.opacity = '0';
                            menu.style.visibility = 'hidden';
                            menu.style.transform = 'translateY(10px)';
                        }
                        break;
                }
            });
        });
    });
}

/**
 * フォーム入力の即時バリデーション
 */
function initFormValidationFeedback() {
    const form = document.getElementById('inquiryForm');
    
    if (form) {
        const inputs = form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            // 入力フィールドからフォーカスが外れたときにバリデーション
            input.addEventListener('blur', function() {
                validateInput(input);
            });
            
            // 入力中のバリデーション（オプション：パフォーマンスに注意）
            input.addEventListener('input', function() {
                // すでにエラーが表示されている場合、リアルタイムで検証
                if (input.classList.contains('invalid')) {
                    validateInput(input);
                }
            });
        });
    }
}

/**
 * 入力要素のバリデーション
 */
function validateInput(input) {
    // 必須項目のチェック
    if (input.hasAttribute('required') && !input.value.trim()) {
        setInvalidState(input, '入力必須項目です');
        return false;
    }
    
    // Eメールのバリデーション
    if (input.type === 'email' && input.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(input.value.trim())) {
            setInvalidState(input, '有効なメールアドレスを入力してください');
            return false;
        }
    }
    
    // 電話番号のバリデーション（任意項目なので値がある場合のみ）
    if (input.type === 'tel' && input.value.trim()) {
        const telPattern = /^[0-9\-+\s()]{6,20}$/;
        if (!telPattern.test(input.value.trim())) {
            setInvalidState(input, '有効な電話番号を入力してください');
            return false;
        }
    }
    
    // バリデーション成功
    clearInvalidState(input);
    return true;
}

/**
 * 入力エラー状態の設定
 */
function setInvalidState(input, message) {
    input.classList.add('invalid');
    
    // エラーメッセージ要素の取得または作成
    let errorElement = input.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        input.insertAdjacentElement('afterend', errorElement);
    }
    
    errorElement.textContent = message;
    
    // アクセシビリティのための属性設定
    input.setAttribute('aria-invalid', 'true');
    const errorId = `error-${input.id}`;
    errorElement.id = errorId;
    input.setAttribute('aria-describedby', errorId);
}

/**
 * 入力エラー状態のクリア
 */
function clearInvalidState(input) {
    input.classList.remove('invalid');
    
    // エラーメッセージ要素の削除
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
    
    // アクセシビリティ属性のリセット
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
}

/**
 * AOSアニメーションライブラリの初期化
 */
function initAOS() {
    // AOSライブラリが読み込まれている場合に初期化
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false,
            anchorPlacement: 'top-bottom',
            disable: 'mobile'
        });
    } else {
        // AOSライブラリの動的読み込み
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/aos@next/dist/aos.js';
        script.onload = function() {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                mirror: false,
                anchorPlacement: 'top-bottom',
                disable: 'mobile'
            });
        };
        document.body.appendChild(script);
    }
}

/**
 * モバイルメニューの初期化
 */
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    const body = document.body;
    
    // モバイルメニュートグルボタンのクリックイベント
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            
            // ARIAアクセシビリティ属性の更新
            const expanded = this.classList.contains('active');
            this.setAttribute('aria-expanded', expanded);
            
            // メニュー開閉時にbodyスクロールを制御
            if (expanded) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });
    }
    
    // オーバーレイクリックでメニューを閉じる
    if (menuOverlay) {
        menuOverlay.addEventListener('click', function() {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
        });
    }
    
    // モバイルメニュー内のリンククリックでメニューを閉じる
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 1024) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                menuOverlay.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            }
        });
    });
    
    // ウィンドウリサイズ時の処理
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024) {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
        }
    });
}

/**
 * よくある質問アコーディオンの初期化
 */
function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            // 現在の状態を取得
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // すべての質問を閉じる（オプション：一つだけ開きたい場合）
            faqQuestions.forEach(q => {
                q.setAttribute('aria-expanded', 'false');
            });
            
            // クリックされた質問の状態を切り替え
            this.setAttribute('aria-expanded', !isExpanded);
        });
    });
}

/**
 * スムーズスクロールの初期化
 */
function initSmoothScroll() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // # だけのリンクは処理しない
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // ヘッダーの高さを考慮したスクロール位置の計算
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * お問い合わせフォームの初期化
 */
function initContactForm() {
    const contactForm = document.getElementById('inquiryForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // フォームの検証
            if (validateForm(this)) {
                // 実際の送信処理（ここではダミー処理）
                alert('お問い合わせありがとうございます。内容を確認し、折り返しご連絡いたします。');
                this.reset();
            }
        });
    }
}

/**
 * フォームバリデーション
 */
function validateForm(form) {
    let isValid = true;
    
    // 名前の検証
    const nameInput = form.querySelector('#name');
    if (!nameInput.value.trim()) {
        alert('お名前を入力してください');
        nameInput.focus();
        return false;
    }
    
    // メールアドレスの検証
    const emailInput = form.querySelector('#email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
        alert('有効なメールアドレスを入力してください');
        emailInput.focus();
        return false;
    }
    
    // メッセージの検証
    const messageInput = form.querySelector('#message');
    if (!messageInput.value.trim()) {
        alert('お問い合わせ内容を入力してください');
        messageInput.focus();
        return false;
    }
    
    return isValid;
}

/**
 * ページスクロール時のヘッダー表示制御
 */
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // スクロール方向を判定
    if (scrollTop > lastScrollTop) {
        // 下スクロール時
        if (scrollTop > 100) {
            header.classList.add('header-hidden');
        }
    } else {
        // 上スクロール時
        header.classList.remove('header-hidden');
    }
    
    lastScrollTop = scrollTop;
});

/**
 * ヒーローセクションのパララックス効果
 */
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    
    if (hero) {
        window.addEventListener('scroll', function() {
            // スクロール量に応じてヒーローセクションの背景位置を変更
            const scrollPosition = window.pageYOffset;
            hero.style.backgroundPosition = `center ${scrollPosition * 0.5}px`;
        });
    }
}

/**
 * カウントアップアニメーション
 */
function initCounterAnimation() {
    // スクロール時にカウントアップするエレメントを設定
    const counterElements = document.querySelectorAll('.counter');
    
    if (counterElements.length > 0) {
        const options = {
            threshold: 0.5
        };
        
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const countTo = parseInt(target.getAttribute('data-count'));
                    let count = 0;
                    const duration = 2000; // アニメーション時間（ms）
                    const interval = Math.max(Math.floor(duration / countTo), 10);
                    
                    const timer = setInterval(() => {
                        count += 1;
                        target.textContent = count;
                        
                        if (count >= countTo) {
                            clearInterval(timer);
                        }
                    }, interval);
                    
                    // 一度だけ実行するようにする
                    observer.unobserve(target);
                }
            });
        }, options);
        
        counterElements.forEach(el => {
            observer.observe(el);
        });
    }
}

/**
 * 構造化データ（JSON-LD）の追加
 */
function addStructuredData() {
    // Webサイトの構造化データ
    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'チームシャイニー',
        'url': 'https://team-shiny.com/',
        'description': '発達障害を持つ方々のためのデータサイエンス・AI・Webマーケティング教育サービス',
        'potentialAction': {
            '@type': 'SearchAction',
            'target': 'https://team-shiny.com/search?q={search_term_string}',
            'query-input': 'required name=search_term_string'
        }
    };
    
    // 組織の構造化データ
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        'name': 'チームシャイニー',
        'url': 'https://team-shiny.com/',
        'logo': 'https://team-shiny.com/images/logo.png',
        'description': '発達障害を持つ方々のためのデータサイエンス・AI・Webマーケティング教育サービス',
        'address': {
            '@type': 'PostalAddress',
            'addressLocality': '東京都千代田区',
            'postalCode': 'XXX-XXXX',
            'addressCountry': 'JP'
        },
        'contactPoint': {
            '@type': 'ContactPoint',
            'telephone': '+81-3-XXXX-XXXX',
            'contactType': 'customer service'
        },
        'sameAs': [
            'https://twitter.com/teamshiny',
            'https://facebook.com/teamshiny',
            'https://instagram.com/teamshiny'
        ]
    };
    
    // コースの構造化データ
    const coursesSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'item': {
                    '@type': 'Course',
                    'name': 'データサイエンスコース',
                    'description': '企業のデータ活用を学び、データ分析のプロを目指す。SQL、Python、Tableauなどを習得。',
                    'provider': {
                        '@type': 'Organization',
                        'name': 'チームシャイニー',
                        'sameAs': 'https://team-shiny.com/'
                    }
                }
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'item': {
                    '@type': 'Course',
                    'name': '生成AIコース',
                    'description': '画像生成、文章作成、業務効率化など、AIの最先端技術を習得。ChatGPT、Midjourneyなどを活用。',
                    'provider': {
                        '@type': 'Organization',
                        'name': 'チームシャイニー',
                        'sameAs': 'https://team-shiny.com/'
                    }
                }
            },
            {
                '@type': 'ListItem',
                'position': 3,
                'item': {
                    '@type': 'Course',
                    'name': 'Webマーケティングコース',
                    'description': 'Webサイトへの集客、顧客との関係構築、売上向上を目指す。SEO、SNS、広告運用などを網羅的に学習。',
                    'provider': {
                        '@type': 'Organization',
                        'name': 'チームシャイニー',
                        'sameAs': 'https://team-shiny.com/'
                    }
                }
            }
        ]
    };
    
    // FAQの構造化データ
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': '発達障害があるのですが、参加できますか？',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'はい、もちろん参加できます。ADHD、ASD、LDなど、様々な発達の特性に合わせた学習方法や個別サポートを提供しています。一人ひとりの特性を理解し、最適な学習環境を整えています。'
                }
            },
            {
                '@type': 'Question',
                'name': 'プログラミングの経験がなくても大丈夫ですか？',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'はい、プログラミング未経験の方でも安心して参加できます。基礎から丁寧に指導し、一人ひとりの理解度に合わせて進めていきます。現役エンジニアが親身にサポートしますので、ご安心ください。'
                }
            },
            {
                '@type': 'Question',
                'name': '学習期間はどのくらいかかりますか？',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'コースによって異なりますが、データサイエンスコースは12〜20週間、生成AIコースは8〜16週間、Webマーケティングコースは10〜18週間を目安としています。ただし、一人ひとりの学習ペースに合わせて調整可能です。'
                }
            },
            {
                '@type': 'Question',
                'name': '就職支援はどのように行われますか？',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': '履歴書・職務経歴書の添削、面接対策、企業紹介など、就職活動をトータルでサポートします。また、発達障害への理解のある企業とのマッチングにも力を入れています。就職後も職場定着支援を行い、長期的なキャリア形成を支援します。'
                }
            },
            {
                '@type': 'Question',
                'name': '費用はどのくらいかかりますか？',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': '95%以上の方が無料で利用されています。コース受講料、教材費、就職支援、個別サポートなど、すべて無料で提供しています。経済的な負担を心配することなく、スキルアップに集中できる環境を整えています。'
                }
            }
        ]
    };
    
    // 構造化データをHTMLに挿入
    const schemas = [websiteSchema, organizationSchema, coursesSchema, faqSchema];
    
    schemas.forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    });
}