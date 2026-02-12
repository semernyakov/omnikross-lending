/* ═══════════════════════════════════════════════════════════
   OMNIKROSS — JavaScript для новых блоков
   FAQ Accordion, Calculator, Countdown Timer, Demo
   ═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── FAQ Accordion ───
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      
      question.addEventListener('click', () => {
        // Закрыть другие открытые вопросы
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        
        // Toggle текущий
        item.classList.toggle('active');
      });
    });
  }

  // ─── Calculator ───
  function initCalculator() {
    const calculateButton = document.getElementById('calculateButton');
    const clientsInput = document.getElementById('clients');
    const postsInput = document.getElementById('posts');
    const resultDiv = document.getElementById('calcResult');
    const hoursWastedEl = document.getElementById('hoursWasted');
    
    if (!calculateButton) return;
    
    calculateButton.addEventListener('click', () => {
      const clients = parseInt(clientsInput.value) || 15;
      const posts = parseInt(postsInput.value) || 3;
      
      // Формула: клиенты × посты в неделю × 1.5 часа на адаптацию
      const hoursWasted = Math.round(clients * posts * 1.5);
      
      // Показываем результат
      hoursWastedEl.textContent = hoursWasted;
      resultDiv.style.display = 'block';
      
      // Анимация появления
      resultDiv.style.opacity = '0';
      setTimeout(() => {
        resultDiv.style.transition = 'opacity 0.5s ease';
        resultDiv.style.opacity = '1';
      }, 10);
      
      // Трекинг
      if (typeof window.omniTrack === 'function') {
        window.omniTrack('calculator_used', {
          clients: clients,
          posts: posts,
          hours_wasted: hoursWasted
        });
      }
    });
  }

  // ─── Countdown Timer ───
  function initCountdown() {
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (!hoursEl || !minutesEl || !secondsEl) return;
    
    // Устанавливаем дедлайн (завтра в 23:59:59)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 0);
    
    function updateCountdown() {
      const now = new Date().getTime();
      const distance = tomorrow.getTime() - now;
      
      if (distance < 0) {
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
      }
      
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      hoursEl.textContent = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ─── Demo Simulator ───
  function initDemo() {
    const demoButton = document.getElementById('demoButton');
    const demoText = document.getElementById('demoText');
    const demoResult = document.getElementById('demoResult');
    const demoOriginal = document.getElementById('demoOriginal');
    const demoVK = document.getElementById('demoVK');
    const demoTG = document.getElementById('demoTG');
    const demoDzen = document.getElementById('demoDzen');
    const demoOK = document.getElementById('demoOK');
    
    if (!demoButton) return;
    
    demoButton.addEventListener('click', async () => {
      const originalText = demoText.value.trim();
      
      if (!originalText) {
        alert('Вставьте текст для демо');
        return;
      }
      
      // Показываем загрузку
      demoButton.textContent = 'Адаптируем...';
      demoButton.disabled = true;
      
      // Имитация задержки обработки (в реальности — API запрос)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Симуляция адаптаций
      const adaptations = simulateAdaptations(originalText);
      
      // Показываем результаты
      demoOriginal.textContent = originalText;
      demoVK.textContent = adaptations.vk;
      demoTG.textContent = adaptations.telegram;
      demoDzen.textContent = adaptations.dzen;
      demoOK.textContent = adaptations.ok;
      
      demoResult.style.display = 'block';
      
      // Скролл к результату
      demoResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Возвращаем кнопку
      demoButton.textContent = 'Протестировать снова →';
      demoButton.disabled = false;
      
      // Трекинг
      if (typeof window.omniTrack === 'function') {
        window.omniTrack('demo_used', {
          text_length: originalText.length
        });
      }
    });
  }

  // ─── Симуляция адаптаций (заглушка для демо) ───
  function simulateAdaptations(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      // VK — укорачиваем до ~1200 знаков, добавляем хештеги
      vk: text.length > 1200 
        ? text.substring(0, 1200) + '... #SMM #контент'
        : text + ' #SMM #контент',
      
      // Telegram — сжимаем в ~200 знаков
      telegram: sentences.length > 0
        ? sentences[0].trim() + (sentences.length > 1 ? '...' : '') + ' 👉'
        : text.substring(0, 200),
      
      // Дзен — расширяем до ~3000 знаков с подробностями
      dzen: text + '\n\n' + (text.length < 1000 
        ? 'Важно понимать контекст этого вопроса. В современном мире адаптация контента под различные платформы — это не просто техническая задача, а стратегическое решение...'
        : ''),
      
      // OK — адаптируем под локальную специфику
      ok: text.replace(/VK/gi, 'Одноклассники')
               .replace(/Telegram/gi, 'мессенджеры')
               + ' 👍'
    };
  }

  // ─── Инициализация при загрузке ───
  document.addEventListener('DOMContentLoaded', () => {
    initFAQ();
    initCalculator();
    initCountdown();
    initDemo();
    
    console.log('[OmniKross] Новые блоки инициализированы');
  });

  // ─── Expose для использования в других скриптах ───
  window.OmniInteractive = {
    initFAQ,
    initCalculator,
    initCountdown,
    initDemo
  };

})();
