/* ═══════════════════════════════════════════════════════════
   OMNIKROSS — AI Preview Simulator
   Generates platform-adapted content previews
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const MAX_CHARS = 280;

  // Platform adaptation templates
  const TEMPLATES = {
    // Russian platforms
    vk: {
      name: "VK",
      icon: "fa-vk",
      transform(text) {
        const lines = text
          .split(/[.!?]+/)
          .filter(Boolean)
          .map((s) => s.trim());
        let result = lines.join("\n\n");
        result += "\n\n👥 Подписывайтесь на наш паблик!";
        result += "\n🔔 Ставьте лайк и делитесь с друзьями!";
        const tags = extractTags(text, "ru");
        if (tags.length) result += "\n\n" + tags.join(" ");
        return result;
      },
    },
    telegram: {
      name: "Telegram",
      icon: "fa-telegram",
      transform(text) {
        let result = "📢 " + text.charAt(0).toUpperCase() + text.slice(1);
        result = result.replace(/\n/g, "\n\n");
        result += "\n\n💬 Обсуждение в комментариях ↓";
        const tags = extractTags(text, "ru");
        if (tags.length) result += "\n" + tags.join(" ");
        return result;
      },
    },
    dzen: {
      name: "Дзен",
      icon: "fa-yandex",
      transform(text) {
        const title = text.length > 60 ? text.substring(0, 57) + "..." : text;
        let result = "📝 " + title.toUpperCase() + "\n\n";
        result += text + "\n\n";
        result += "⭐ Поставьте лайк, если было полезно!\n";
        result += "📖 Читайте другие статьи на канале";
        return result;
      },
    },
    ok: {
      name: "OK",
      icon: "fa-odnoklassniki",
      transform(text) {
        let result = "🌟 " + text + "\n\n";
        result += "💐 Поделитесь с друзьями!\n";
        result += "❤️ Поставьте «Класс!» если понравилось";
        const tags = extractTags(text, "ru");
        if (tags.length) result += "\n\n" + tags.join(" ");
        return result;
      },
    },
    // International platforms
    twitter: {
      name: "Twitter/X",
      icon: "fa-x-twitter",
      transform(text) {
        let result = text;
        if (result.length > 240) result = result.substring(0, 237) + "...";
        const tags = extractTags(text, "en");
        if (tags.length) result += "\n\n" + tags.slice(0, 3).join(" ");
        result += "\n\n🧵 Thread ↓";
        return result;
      },
    },
    instagram: {
      name: "Instagram",
      icon: "fa-instagram",
      transform(text) {
        const emojis = ["✨", "🚀", "💡", "🔥", "⚡", "🎯", "💪", "🌟"];
        let result = emojis[Math.floor(Math.random() * emojis.length)] + " ";
        const sentences = text
          .split(/[.!?]+/)
          .filter(Boolean)
          .map((s) => s.trim());
        result += sentences
          .map((s, i) => {
            const e = emojis[(i + 1) % emojis.length];
            return s + " " + e;
          })
          .join("\n\n");
        result += "\n\n・・・\n";
        result += "📌 Save this post for later!\n";
        result += "👉 Link in bio\n\n";
        const tags = extractTags(text, "en");
        result += tags.length
          ? tags.join(" ")
          : "#ai #content #crossposting #omnikross";
        return result;
      },
    },
    linkedin: {
      name: "LinkedIn",
      icon: "fa-linkedin",
      transform(text) {
        let result = "🎯 " + text + "\n\n";
        result += "Key takeaways:\n";
        const points = text
          .split(/[.!?]+/)
          .filter(Boolean)
          .map((s) => s.trim())
          .slice(0, 3);
        points.forEach((p) => {
          result += "→ " + p + "\n";
        });
        result += "\n💭 What do you think? Share your thoughts below.\n";
        result += "\n#AI #ContentStrategy #CrossPosting #Omnikross";
        return result;
      },
    },
    tiktok: {
      name: "TikTok",
      icon: "fa-tiktok",
      transform(text) {
        let result = text.length > 150 ? text.substring(0, 147) + "..." : text;
        result += " 🤯🔥\n\n";
        result += "Follow for more! ➡️\n\n";
        result += "#fyp #viral #ai #omnikross #contentcreator";
        return result;
      },
    },
  };

  // Extract relevant hashtags from text
  function extractTags(text, lang) {
    const words = text
      .toLowerCase()
      .replace(/[^\wа-яёa-z\s]/gi, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const unique = [...new Set(words)].slice(0, 5);
    return unique.map((w) => "#" + w);
  }

  // Initialize simulator
  function initSimulator() {
    const textarea = document.getElementById("simInput");
    const charCounter = document.getElementById("charCounter");
    const generateBtn = document.getElementById("generateBtn");
    const previewGrid = document.getElementById("previewGrid");
    const platformBtns = document.querySelectorAll(".platform-btn");

    if (!textarea || !generateBtn) return;

    const selectedPlatforms = new Set();

    // Set default platforms
    ["vk", "telegram", "dzen", "ok"].forEach((p) => {
      selectedPlatforms.add(p);
      document
        .querySelector(`.platform-btn[data-platform="${p}"]`)
        ?.classList.add("active");
    });

    // Character counter
    textarea.addEventListener("input", () => {
      const len = textarea.value.length;
      charCounter.textContent = len + "/" + MAX_CHARS;
      charCounter.classList.toggle("warn", len > MAX_CHARS * 0.85);
      if (len > MAX_CHARS) {
        textarea.value = textarea.value.substring(0, MAX_CHARS);
        charCounter.textContent = MAX_CHARS + "/" + MAX_CHARS;
      }
      updateGenerateBtn();
    });

    // Platform selection
    platformBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const platform = btn.dataset.platform;
        if (selectedPlatforms.has(platform)) {
          selectedPlatforms.delete(platform);
          btn.classList.remove("active");
        } else {
          selectedPlatforms.add(platform);
          btn.classList.add("active");
        }
        updateGenerateBtn();
      });
    });

    function updateGenerateBtn() {
      generateBtn.disabled =
        !textarea.value.trim() || selectedPlatforms.size === 0;
    }

    // Generate previews
    generateBtn.addEventListener("click", () => {
      const text = textarea.value.trim();
      if (!text || selectedPlatforms.size === 0) return;

      // Track event
      trackEvent("simulator_generate", {
        platforms: [...selectedPlatforms].join(","),
        text_length: text.length,
      });

      previewGrid.innerHTML = "";
      previewGrid.style.opacity = "0";

      // Simulate AI processing delay
      generateBtn.disabled = true;
      generateBtn.textContent =
        generateBtn.dataset.loading || "⚡ Generating...";

      setTimeout(
        () => {
          selectedPlatforms.forEach((platform) => {
            const tmpl = TEMPLATES[platform];
            if (!tmpl) return;

            const card = document.createElement("div");
            card.className = "preview-card fade-in-scale";

            const adapted = tmpl.transform(text);

            card.innerHTML = `
            <div class="preview-card-header">
              <i class="fa-brands ${tmpl.icon}"></i>
              <span>${tmpl.name}</span>
            </div>
            <div class="preview-card-body">${escapeHtml(adapted).replace(/\n/g, "<br>")}</div>
          `;

            previewGrid.appendChild(card);
          });

          // После генерации превью
          previewGrid.style.opacity = "1";
          generateBtn.disabled = false;
          generateBtn.textContent =
            generateBtn.dataset.default || "⚡ Generate Preview";

          // Интеллектуальный скролл (только если пользователь не скроллил дальше)
          const currentScroll = window.scrollY;
          const simulatorTop = document.getElementById("simulator").offsetTop;
          const signupTop =
            document.getElementById("signupForm")?.offsetTop ||
            document.getElementById("hero")?.offsetTop;

          if (currentScroll < signupTop - 300) {
            // Если пользователь еще не долистал до формы
            setTimeout(() => {
              const signupForm = document.getElementById("signupForm");
              if (signupForm) {
                signupForm.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });

                // Микро-анимация CTA
                const ctaButton = document.getElementById("ctaButton");
                if (ctaButton) {
                  ctaButton.style.animation = "pulse 2s ease 2";
                  setTimeout(() => {
                    ctaButton.style.animation = "";
                  }, 4000);

                  // Добавляем микро-всплывающую подсказку
                  if (!document.querySelector(".cta-micro-tip")) {
                    const tip = document.createElement("div");
                    tip.className = "cta-micro-tip";
                    tip.innerHTML =
                      '<i class="fa-solid fa-bolt"></i> Верните время, которое только что сэкономили';
                    tip.style.cssText = `
                      position: fixed;
                      bottom: 100px;
                      right: 20px;
                      background: var(--gradient-main);
                      color: var(--bg-main);
                      padding: 12px 20px;
                      border-radius: 12px;
                      font-size: 14px;
                      font-weight: 600;
                      z-index: 9999;
                      animation: fadeInUp 0.5s ease;
                      box-shadow: var(--shadow-deep);
                      max-width: 300px;
                    `;
                    document.body.appendChild(tip);

                    setTimeout(() => {
                      tip.remove();
                    }, 5000);
                  }
                }
              }
            }, 800);
          }
        },
        800 + Math.random() * 600,
      );
    });
  }

  // HTML escape
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Event tracking (mock)
  function trackEvent(name, data) {
    if (typeof window.omniTrack === "function") {
      window.omniTrack(name, data);
    }
    console.log("[Omnikross Track]", name, data);
  }

  // Auto-init
  document.addEventListener("DOMContentLoaded", initSimulator);

  // Expose for external use
  window.OmniSimulator = { init: initSimulator, TEMPLATES };
})();

// ROI Calculator
(function initROICalc() {
  const posts = document.getElementById("posts");
  const plats = document.getElementById("plats");
  const mins = document.getElementById("mins");

  if (!posts || !plats || !mins) return;

  const timeEl = document.getElementById("timeResult");
  const moneyEl = document.getElementById("moneyResult");

  const HOUR_RATE = 600; // ₽ / час

  function recalc() {
    const p = +posts.value;
    const pl = +plats.value;
    const m = +mins.value;

    const hoursMonth = (p * 4 * pl * m) / 60;
    const moneyYear = hoursMonth * 12 * HOUR_RATE;

    timeEl.textContent = `${Math.round(hoursMonth)} ч / месяц`;
    moneyEl.textContent = `${Math.round(moneyYear).toLocaleString()} ₽ / год`;
  }

  [posts, plats, mins].forEach((i) => i.addEventListener("input", recalc));
  recalc();

  document.getElementById("goSimulator")?.addEventListener("click", () => {
    document
      .getElementById("simulator")
      ?.scrollIntoView({ behavior: "smooth" });
  });
})();
