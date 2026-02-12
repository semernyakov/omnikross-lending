/* ═══════════════════════════════════════════════════════════
   ROI Calculator for OmniKross
   Neuro-minimalism 2035 conversion engine
   ═══════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    function initROICalc() {
        const posts = document.getElementById('posts');
        const plats = document.getElementById('plats');
        const avgTime = document.getElementById('avgTime');
        const clients = document.getElementById('clients');

        if (!posts || !plats || !avgTime) return;

        const form = document.getElementById('roiForm');
        const resultDiv = document.getElementById('calcResult');
        const totalHoursEl = document.getElementById('totalHours');
        const lostMoneyEl = document.getElementById('lostMoney');
        const savedHoursEl = document.getElementById('savedHours');
        const savedMoneyEl = document.getElementById('savedMoney');

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

        function calculate() {
            const p = +posts.value || 10;
            const pl = +plats.value || 4;
            const cl = +clients.value || (document.documentElement.lang === 'ru' ? 15 : 8);
            const m = +avgTime.value || 20;

            // Calculate weekly hours: posts * platforms * minutes * clients / 60
            const hoursWeek = (p * pl * m * cl) / 60;
            const moneyWeek = hoursWeek * HOUR_RATE;
            
            // Calculate savings (90% time reduction)
            const savedHoursWeek = hoursWeek * 0.9;
            const savedMoneyWeek = savedHoursWeek * HOUR_RATE;

            if (totalHoursEl) {
                totalHoursEl.textContent = Math.round(hoursWeek);
            }
            
            if (lostMoneyEl) {
                lostMoneyEl.textContent = formatMoney(moneyWeek);
            }

            if (savedHoursEl) {
                savedHoursEl.textContent = Math.round(savedHoursWeek);
            }

            if (savedMoneyEl) {
                savedMoneyEl.textContent = formatMoney(savedMoneyWeek);
            }

            // Show result
            if (resultDiv) {
                resultDiv.style.display = 'block';
            }

            // Трекинг события
            trackROIEvent(p, pl, cl, m, hoursWeek, moneyWeek, savedHoursWeek, savedMoneyWeek);
        }

        function trackROIEvent(posts, platforms, clients, minutes, hours, money, savedHours, savedMoney) {
            if (typeof window.omniTrack === 'function') {
                window.omniTrack('roi_calculated', {
                    posts_per_week: posts,
                    platforms: platforms,
                    clients: clients,
                    minutes_per_post: minutes,
                    hours_per_week: Math.round(hours),
                    money_per_week: Math.round(money),
                    saved_hours_per_week: Math.round(savedHours),
                    saved_money_per_week: Math.round(savedMoney),
                    currency: CURRENCY,
                    lang: document.documentElement.lang
                });
            }
        }

        // Обработчики событий
        [posts, plats, avgTime, clients].forEach(i => {
            if (i) {
                i.addEventListener('input', calculate);
                i.addEventListener('change', calculate);
            }
        });

        // Обработчик формы
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                calculate();
                
                // Scroll to results
                if (resultDiv) {
                    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }

        // Инициализация при загрузке
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(calculate, 100);
            
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
            calculate,
            getValues: () => ({
                posts: +posts.value,
                platforms: +plats.value,
                clients: +clients.value,
                minutes: +avgTime.value,
                hours: ((+posts.value || 10) * 4 * (+plats.value || 4) * (+avgTime.value || 20) * (+clients.value || (document.documentElement.lang === 'ru' ? 15 : 8))) / 60
            })
        };
    }

    // Инициализация калькулятора
    initROICalc();

})();