(function() {
    'use strict';

    window.__app = window.__app || {};

    function debounce(func, wait) {
        var timeout;
        return function executedFunction() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    function initBurgerMenu() {
        if (window.__app.burger) return;
        window.__app.burger = true;

        var toggle = document.querySelector('.navbar-toggler');
        var collapse = document.querySelector('.navbar-collapse');
        var body = document.body;

        if (!toggle || !collapse) return;

        collapse.style.height = 'calc(100vh - var(--header-h))';

        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            var isOpen = collapse.classList.contains('show');
            
            if (isOpen) {
                collapse.classList.remove('show');
                toggle.setAttribute('aria-expanded', 'false');
                body.classList.remove('u-no-scroll');
            } else {
                collapse.classList.add('show');
                toggle.setAttribute('aria-expanded', 'true');
                body.classList.add('u-no-scroll');
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && collapse.classList.contains('show')) {
                collapse.classList.remove('show');
                toggle.setAttribute('aria-expanded', 'false');
                body.classList.remove('u-no-scroll');
            }
        });

        var navLinks = document.querySelectorAll('.navbar-collapse .nav-link');
        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', function() {
                if (window.innerWidth < 768) {
                    collapse.classList.remove('show');
                    toggle.setAttribute('aria-expanded', 'false');
                    body.classList.remove('u-no-scroll');
                }
            });
        }

        var resizeHandler = debounce(function() {
            if (window.innerWidth >= 768 && collapse.classList.contains('show')) {
                collapse.classList.remove('show');
                toggle.setAttribute('aria-expanded', 'false');
                body.classList.remove('u-no-scroll');
            }
        }, 250);

        window.addEventListener('resize', resizeHandler, { passive: true });
    }

    function initSmoothScroll() {
        if (window.__app.smoothScroll) return;
        window.__app.smoothScroll = true;

        var isHomepage = location.pathname === '/' || location.pathname === '/index.html';
        var anchors = document.querySelectorAll('a[href^="#"]');

        for (var i = 0; i < anchors.length; i++) {
            var anchor = anchors[i];
            var href = anchor.getAttribute('href');
            
            if (href === '#' || href === '#!') continue;

            if (!isHomepage && href.indexOf('#') === 0) {
                anchor.setAttribute('href', '/' + href);
                continue;
            }

            if (isHomepage) {
                anchor.addEventListener('click', function(e) {
                    var targetHref = this.getAttribute('href');
                    if (targetHref.indexOf('#') === 0) {
                        var targetId = targetHref.substring(1);
                        var targetElement = document.getElementById(targetId);
                        
                        if (targetElement) {
                            e.preventDefault();
                            var header = document.querySelector('.l-header');
                            var offset = header ? header.offsetHeight : 80;
                            var targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                            
                            window.scrollTo({
                                top: Math.max(0, targetTop),
                                behavior: 'smooth'
                            });
                        }
                    }
                });
            }
        }
    }

    function initScrollSpy() {
        if (window.__app.scrollSpy) return;
        window.__app.scrollSpy = true;

        var sections = document.querySelectorAll('section[id], main[id], div[id]');
        var navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        if (sections.length === 0 || navLinks.length === 0) return;

        var scrollHandler = throttle(function() {
            var scrollPos = window.pageYOffset || document.documentElement.scrollTop;
            var header = document.querySelector('.l-header');
            var offset = header ? header.offsetHeight + 100 : 180;

            for (var i = sections.length - 1; i >= 0; i--) {
                var section = sections[i];
                var sectionTop = section.offsetTop - offset;
                var sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    var sectionId = section.getAttribute('id');
                    
                    for (var j = 0; j < navLinks.length; j++) {
                        var link = navLinks[j];
                        var linkHref = link.getAttribute('href');
                        
                        link.classList.remove('active');
                        link.removeAttribute('aria-current');
                        
                        if (linkHref === '#' + sectionId) {
                            link.classList.add('active');
                            link.setAttribute('aria-current', 'page');
                        }
                    }
                    break;
                }
            }
        }, 100);

        window.addEventListener('scroll', scrollHandler, { passive: true });
        scrollHandler();
    }

    function initIntersectionObserver() {
        if (window.__app.intersectionObserver) return;
        window.__app.intersectionObserver = true;

        if (!('IntersectionObserver' in window)) return;

        var observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -10% 0px'
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        var elements = document.querySelectorAll('.card, .c-card, img:not(.c-logo img), .c-button, .btn, section > .container > *');
        
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            observer.observe(el);
        }
    }

    function initRippleEffect() {
        if (window.__app.ripple) return;
        window.__app.ripple = true;

        var buttons = document.querySelectorAll('.btn, .c-button, .nav-link, .card');

        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function(e) {
                var rect = this.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;

                var ripple = document.createElement('span');
                ripple.style.position = 'absolute';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.width = '0';
                ripple.style.height = '0';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255, 255, 255, 0.6)';
                ripple.style.transform = 'translate(-50%, -50%)';
                ripple.style.pointerEvents = 'none';
                ripple.style.transition = 'width 0.6s ease-out, height 0.6s ease-out, opacity 0.6s ease-out';
                ripple.style.opacity = '1';

                var rippleContainer = this;
                var currentPosition = window.getComputedStyle(rippleContainer).position;
                if (currentPosition === 'static') {
                    rippleContainer.style.position = 'relative';
                }
                rippleContainer.style.overflow = 'hidden';

                rippleContainer.appendChild(ripple);

                setTimeout(function() {
                    ripple.style.width = '300px';
                    ripple.style.height = '300px';
                    ripple.style.opacity = '0';
                }, 10);

                setTimeout(function() {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 600);
            });
        }
    }

    function initCountUp() {
        if (window.__app.countUp) return;
        window.__app.countUp = true;

        var stats = document.querySelectorAll('[data-count]');
        if (stats.length === 0) return;

        if (!('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    var target = parseInt(entry.target.getAttribute('data-count'), 10);
                    var duration = 2000;
                    var start = 0;
                    var startTime = null;

                    function animate(currentTime) {
                        if (!startTime) startTime = currentTime;
                        var progress = Math.min((currentTime - startTime) / duration, 1);
                        var easeOutQuad = progress * (2 - progress);
                        var current = Math.floor(easeOutQuad * target);
                        entry.target.textContent = current.toLocaleString();

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            entry.target.textContent = target.toLocaleString();
                        }
                    }

                    requestAnimationFrame(animate);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        for (var i = 0; i < stats.length; i++) {
            observer.observe(stats[i]);
        }
    }

    function initFormValidation() {
        if (window.__app.formValidation) return;
        window.__app.formValidation = true;

        var forms = document.querySelectorAll('form');

        var patterns = {
            firstName: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
            lastName: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[\d\s\+\-\(\)]{10,20}$/,
            message: /^.{10,}$/
        };

        var errorMessages = {
            firstName: 'Voornaam moet 2-50 letters bevatten',
            lastName: 'Achternaam moet 2-50 letters bevatten',
            email: 'Voer een geldig e-mailadres in',
            phone: 'Voer een geldig telefoonnummer in (10-20 cijfers)',
            message: 'Bericht moet minimaal 10 tekens bevatten',
            service: 'Selecteer een dienst',
            privacy: 'U moet akkoord gaan met het privacybeleid'
        };

        function sanitizeInput(input) {
            var temp = document.createElement('div');
            temp.textContent = input;
            return temp.innerHTML;
        }

        function showError(field, message) {
            var parent = field.closest('.mb-3, .form-group, .col-12, .col-md-6');
            if (!parent) parent = field.parentElement;

            var existingError = parent.querySelector('.c-form__error');
            if (existingError) {
                existingError.remove();
            }

            field.classList.add('is-invalid');
            parent.classList.add('is-error');

            var errorDiv = document.createElement('div');
            errorDiv.className = 'c-form__error';
            errorDiv.textContent = message;
            errorDiv.setAttribute('role', 'alert');

            field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }

        function clearError(field) {
            var parent = field.closest('.mb-3, .form-group, .col-12, .col-md-6');
            if (!parent) parent = field.parentElement;

            field.classList.remove('is-invalid');
            parent.classList.remove('is-error');

            var existingError = parent.querySelector('.c-form__error');
            if (existingError) {
                existingError.remove();
            }
        }

        function validateField(field) {
            var fieldId = field.getAttribute('id');
            var fieldValue = field.value.trim();
            var fieldType = field.getAttribute('type');

            clearError(field);

            if (field.hasAttribute('required') && !fieldValue) {
                showError(field, errorMessages[fieldId] || 'Dit veld is verplicht');
                return false;
            }

            if (fieldType === 'checkbox' && field.hasAttribute('required') && !field.checked) {
                showError(field, errorMessages[fieldId] || 'Dit veld is verplicht');
                return false;
            }

            if (patterns[fieldId] && fieldValue) {
                if (!patterns[fieldId].test(fieldValue)) {
                    showError(field, errorMessages[fieldId]);
                    return false;
                }
            }

            if (fieldId === 'service' && field.tagName === 'SELECT' && (!fieldValue || fieldValue === '')) {
                showError(field, errorMessages.service);
                return false;
            }

            return true;
        }

        for (var i = 0; i < forms.length; i++) {
            var form = forms[i];

            var formFields = form.querySelectorAll('input, select, textarea');
            for (var j = 0; j < formFields.length; j++) {
                formFields[j].addEventListener('blur', function() {
                    validateField(this);
                });

                formFields[j].addEventListener('input', function() {
                    if (this.classList.contains('is-invalid')) {
                        validateField(this);
                    }
                });
            }

            form.addEventListener('submit', function(e) {
                e.preventDefault();

                var allFields = this.querySelectorAll('input, select, textarea');
                var isValid = true;

                for (var k = 0; k < allFields.length; k++) {
                    if (!validateField(allFields[k])) {
                        isValid = false;
                    }
                }

                if (!isValid) {
                    var firstError = this.querySelector('.is-invalid');
                    if (firstError) {
                        firstError.focus();
                        var headerHeight = document.querySelector('.l-header') ? document.querySelector('.l-header').offsetHeight : 80;
                        var elementPosition = firstError.getBoundingClientRect().top + window.pageYOffset;
                        window.scrollTo({
                            top: elementPosition - headerHeight - 20,
                            behavior: 'smooth'
                        });
                    }
                    return;
                }

                var submitBtn = this.querySelector('button[type="submit"]');
                var originalText = submitBtn ? submitBtn.textContent : '';

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verzenden...';
                }

                var formData = {};
                for (var m = 0; m < allFields.length; m++) {
                    var field = allFields[m];
                    var fieldName = field.getAttribute('name') || field.getAttribute('id');
                    
                    if (field.type === 'checkbox') {
                        formData[fieldName] = field.checked;
                    } else {
                        formData[fieldName] = sanitizeInput(field.value);
                    }
                }

                setTimeout(function() {
                    window.location.href = 'thank_you.html';
                }, 1000);
            });
        }
    }

    function initScrollToTop() {
        if (window.__app.scrollToTop) return;
        window.__app.scrollToTop = true;

        var scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Scroll naar boven');
        scrollBtn.innerHTML = '↑';
        scrollBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:50px;height:50px;border-radius:50%;background:var(--color-primary);color:white;border:none;font-size:24px;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s.ease;z-index:999;box-shadow:var(--shadow-lg);';

        document.body.appendChild(scrollBtn);

        var scrollHandler = throttle(function() {
            if (window.pageYOffset > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.visibility = 'visible';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
            }
        }, 100);

        window.addEventListener('scroll', scrollHandler, { passive: true });

        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    function initImages() {
        if (window.__app.images) return;
        window.__app.images = true;

        var images = document.querySelectorAll('img');
        
        for (var i = 0; i < images.length; i++) {
            var img = images[i];
            
            var isLogo = img.classList.contains('c-logo__img') || img.closest('.c-logo');
            var isCritical = img.hasAttribute('data-critical');
            
            if (!img.hasAttribute('loading') && !isLogo && !isCritical) {
                img.setAttribute('loading', 'lazy');
            }
        }
    }

    function initCardHoverEffects() {
        if (window.__app.cardHover) return;
        window.__app.cardHover = true;

        var cards = document.querySelectorAll('.card, .c-card');

        for (var i = 0; i < cards.length; i++) {
            cards[i].addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s ease-out';
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.boxShadow = 'var(--shadow-xl)';
            });

            cards[i].addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = 'var(--shadow-sm)';
            });
        }
    }

    function initPrivacyModal() {
        if (window.__app.privacyModal) return;
        window.__app.privacyModal = true;

        var privacyLinks = document.querySelectorAll('a[href*="privacy"]');
        
        for (var i = 0; i < privacyLinks.length; i++) {
            var link = privacyLinks[i];
            var href = link.getAttribute('href');
            
            if (href && href.indexOf('#') === -1 && href.indexOf('privacy') !== -1) {
                continue;
            }
        }
    }

    window.__app.init = function() {
        if (window.__app.initialized) return;
        window.__app.initialized = true;

        initBurgerMenu();
        initSmoothScroll();
        initScrollSpy();
        initIntersectionObserver();
        initRippleEffect();
        initCountUp();
        initFormValidation();
        initScrollToTop();
        initImages();
        initCardHoverEffects();
        initPrivacyModal();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.__app.init);
    } else {
        window.__app.init();
    }

})();