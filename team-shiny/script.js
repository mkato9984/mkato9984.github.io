// スクロールアニメーション
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.feature-card, .course-card, .support-card, .testimonial-card, .news-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animateElements.forEach(element => {
        observer.observe(element);
    });
});

// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ヘッダーのスクロール制御
let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop) {
        // 下スクロール
        header.style.transform = 'translateY(-100%)';
    } else {
        // 上スクロール
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});

// アニメーション要素の表示制御
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// アニメーション対象の要素を監視
document.querySelectorAll('.feature-card, .course-card').forEach(element => {
    element.classList.add('fade-in');
    observer.observe(element);
});

// モバイルメニューの制御
const menuButton = document.createElement('button');
menuButton.classList.add('menu-button');
menuButton.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector('.header-container').appendChild(menuButton);

menuButton.addEventListener('click', () => {
    const nav = document.querySelector('.main-nav');
    nav.classList.toggle('active');
});

// ヘッダーナビゲーションのアクティブ表示
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-nav a');

    function updateActiveLink() {
        const scrollPosition = window.scrollY + 100; // ヘッダーの高さ分を考慮

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    window.addEventListener('load', updateActiveLink);
});

// よくある質問のアコーディオン
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('i:last-child');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // 他のすべてのアイテムを閉じる
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    otherAnswer.style.maxHeight = '0';
                }
            });

            // クリックされたアイテムの状態を切り替え
            item.classList.toggle('active');
            answer.style.maxHeight = isActive ? '0' : answer.scrollHeight + 'px';
            
            // アイコンの切り替え
            icon.className = isActive ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        });
    });
});

// FAQのアコーディオン
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        const icon = button.querySelector('.fa-chevron-down');
        
        answer.style.maxHeight = answer.style.maxHeight ? null : answer.scrollHeight + 'px';
        icon.style.transform = answer.style.maxHeight ? 'rotate(0deg)' : 'rotate(180deg)';
    });
}); 