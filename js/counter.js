/* ═══════════════════════════════════════════════════════════
   OMNIKROSS — Dynamic Slot Counter
   localStorage-based countdown with animations
   ═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const MAX_SLOTS = 500;
  const STORAGE_KEY = 'omnikross_slots';

  function getSlots() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return MAX_SLOTS;
    const val = parseInt(stored, 10);
    return isNaN(val) ? MAX_SLOTS : Math.max(0, Math.min(MAX_SLOTS, val));
  }

  function setSlots(value) {
    localStorage.setItem(STORAGE_KEY, Math.max(0, value).toString());
  }

  function updateDisplay() {
    const el = document.getElementById('slotsCount');
    if (!el) return;

    const current = getSlots();
    el.textContent = current;

    // Color urgency
    if (current <= 50) {
      el.style.color = '#FF6B6B';
      el.style.textShadow = '0 0 20px rgba(255, 107, 107, 0.5)';
    } else if (current <= 150) {
      el.style.color = '#FFD93D';
      el.style.textShadow = '0 0 20px rgba(255, 217, 61, 0.5)';
    }
  }

  function decrement() {
    let current = getSlots();
    if (current <= 0) return false;

    current--;
    setSlots(current);
    updateDisplay();

    // Animate tick
    const el = document.getElementById('slotsCount');
    if (el) {
      el.classList.remove('counter-tick');
      void el.offsetWidth; // force reflow
      el.classList.add('counter-tick');
    }

    return true;
  }

  function get() {
    return getSlots();
  }

  function reset() {
    setSlots(MAX_SLOTS);
    updateDisplay();
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();

    // Simulate other users taking slots (FOMO effect)
    // Subtle: every 30-90s, reduce by 1 if > 100
    setInterval(() => {
      const current = getSlots();
      if (current > 100 && Math.random() > 0.6) {
        setSlots(current - 1);
        updateDisplay();
      }
    }, 30000 + Math.random() * 60000);
  });

  // Expose API
  window.OmniCounter = { get, decrement, reset, updateDisplay };
})();
