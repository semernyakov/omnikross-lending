/* ═══════════════════════════════════════════════════════════
   ROI Calculator for OmniKross
   Neuro-minimalism 2035 conversion engine
   ═══════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    function initROICalc() {
        const posts = document.getElementById('posts');
        const plats = document.getElementById('plats');
        const mins = document.getElementById('mins');

        if (!posts || !plats || !mins) return;

        const timeEl = document.getElementById('timeResult');
        const moneyEl = document.getElementById('moneyResult');
        const goSimulatorBtn = document.getElementById('goSimulator');

        // Для RU: 600₽/час, для EN: $25/час
        const HOUR_RATE = document.documentElement.lang === 'ru' ? 600 : 25;
        const CURRENCY = document.documentElement.lang === 'ru' ? '₽' : '$';
        const RATE_TEXT = document.documentElement.lang === 'ru' 
            ? '*при средней ставке SMM 600₽/час' 
            : '*at average SMM rate $25/hour';

        // Обновляем текст в calc-note
        const calcNote = document.querySelector('.calc-note');
        if (calcNote) {
            calcNote.textContent = RATE_TEXT;
        }

        function formatTime(hours) {
            const days = Math.floor(hours / 8);
            const weeks = Math.floor(days / 5);
            if (weeks >= 1) {
                return `${Math.round(hours)} ч (${weeks} нед)`;
            }
            return `${Math.round(hours)} ч`;
        }

        function formatMoney(amount) {
            if (CURRENCY === '₽') {
                return `${Math.round(amount).toLocaleString('ru-RU')}`;
            } else {
                return `${Math.round(amount).toLocaleString('en-US')}`;
            }
        }

        function recalc() {
            const p = +posts.value || 10;
            const pl = +plats.value || 4;
            const m = +mins.value || 20;

            const hoursMonth = (p * 4 * pl * m) / 60;
            const moneyYear = hoursMonth * 12 * HOUR_RATE;

            if (timeEl) {
                timeEl.textContent = formatTime(hoursMonth);
            }
            
            if (moneyEl) {
                moneyEl.textContent = formatMoney(moneyYear);
            }

            // Трекинг события
            trackROIEvent(p, pl, m, hoursMonth, moneyYear);
        }

        function trackROIEvent(posts, platforms, minutes, hours, money) {
            if (typeof window.omniTrack === 'function') {
                window.omniTrack('roi_calculated', {
                    posts_per_week: posts,
                    platforms: platforms,
                    minutes_per_post: minutes,
                    hours_per_month: Math.round(hours),
                    money_per_year: Math.round(money),
                    currency: CURRENCY,
                    lang: document.documentElement.lang
                });
            }
        }

        // Обработчики событий
        [posts, plats, mins].forEach(i => {
            if (i) {
                i.addEventListener('input', recalc);
                i.addEventListener('change', recalc);
            }
        });

        // Обработчик кнопки перехода к симулятору
        if (goSimulatorBtn) {
            goSimulatorBtn.addEventListener('click', () => {
                const simulator = document.getElementById('simulator');
                if (simulator) {
                    // Трекинг клика
                    if (typeof window.omniTrack === 'function') {
                        window.omniTrack('roi_to_simulator_click', {
                            lang: document.documentElement.lang
                        });
                    }
                    
                    simulator.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Анимация кнопки
                    goSimulatorBtn.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        goSimulatorBtn.style.transform = '';
                    }, 200);
                }
            });
        }

        // Инициализация при загрузке
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(recalc, 100);
            
            // Анимация появления калькулятора
            const roiSection = document.getElementById('roi-calc');
            if (roiSection) {
                roiSection.classList.add('reveal');
                setTimeout(() => {
                    roiSection.classList.add('visible');
                }, 300);
            }
        });

        // Экспорт функций для глобального использования
        window.OmniROI = {
            recalc,
            getValues: () => ({
                posts: +posts.value,
                platforms: +plats.value,
                minutes: +mins.value,
                hours: ((+posts.value || 10) * 4 * (+plats.value || 4) * (+mins.value || 20)) / 60
            })
        };
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initROICalc);
    } else {
        initROICalc();
    }
})();