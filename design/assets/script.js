const mobileViewport = window.matchMedia("(max-width: 768px)");

window.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initNews();
});

// ── スクロール時のヘッダー背景 ──
const initHeaderScroll = () => {
  const header = document.querySelector("header");
  const backgroundThreshold = 48;

  function updateHeaderBackground() {
    const hasScrolled = window.scrollY > backgroundThreshold;
    header.classList.toggle("is-scrolled", hasScrolled);
  }

  window.addEventListener("scroll", updateHeaderBackground, { passive: true });
  window.addEventListener("pageshow", updateHeaderBackground);

  updateHeaderBackground();
}

// ── スマートフォンのメニュー開閉 ──
const initMobileMenu = () => {
  const header = document.querySelector("header");
  const menuButton = header.querySelector(".menu-toggle");
  const navigation = header.querySelector(".header-nav");

  function setMenuOpen(isOpen) {
    header.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "メニューを閉じる" : "メニューを開く",
    );
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  menuButton.addEventListener("click", () => {
    const isOpen = header.classList.contains("menu-open");
    setMenuOpen(!isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  // Escapeで閉じた場合は、操作していたボタンへフォーカスを戻す。
  document.addEventListener("keydown", (event) => {
    const isOpen = header.classList.contains("menu-open");

    if (event.key === "Escape" && isOpen) {
      closeMenu();
      menuButton.focus();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!header.contains(event.target)) {
      closeMenu();
    }
  });

  header.addEventListener("focusout", (event) => {
    if (!header.contains(event.relatedTarget)) {
      closeMenu();
    }
  });

  mobileViewport.addEventListener("change", closeMenu);
  header.classList.add("menu-ready");
}

// ── お知らせ：PCは自動切り替え、スマートフォンは全件表示 ──
const initNews = () => {
  const newsSection = document.querySelector("#news");
  const newsItems = [...newsSection.querySelectorAll(".news-item")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const autoSwitchInterval = 5000;

  let currentNewsIndex = 0;
  let isMouseOverNews = false;
  let autoSwitchTimerId;

  function updateVisibleNews() {
    newsItems.forEach((newsItem, index) => {
      const isCurrentNews = index === currentNewsIndex;
      newsItem.hidden = !mobileViewport.matches && !isCurrentNews;
    });
  }

  function showNextNews() {
    currentNewsIndex = (currentNewsIndex + 1) % newsItems.length;
    updateVisibleNews();
  }

  function updateAutoSwitch() {
    clearInterval(autoSwitchTimerId);

    const hasFocusInside = newsSection.contains(document.activeElement);
    const shouldPause =
      mobileViewport.matches ||
      reducedMotion.matches ||
      isMouseOverNews ||
      hasFocusInside ||
      document.hidden ||
      newsItems.length < 2;

    if (shouldPause) {
      return;
    }

    autoSwitchTimerId = setInterval(showNextNews, autoSwitchInterval);
  }

  function updateNewsLayout() {
    if (mobileViewport.matches) {
      newsSection.removeAttribute("aria-roledescription");
    } else {
      newsSection.setAttribute("aria-roledescription", "カルーセル");
    }

    updateVisibleNews();
    updateAutoSwitch();
  }

  newsSection.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") {
      isMouseOverNews = true;
      updateAutoSwitch();
    }
  });

  newsSection.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") {
      isMouseOverNews = false;
      updateAutoSwitch();
    }
  });

  newsSection.addEventListener("focusin", updateAutoSwitch);
  newsSection.addEventListener("focusout", () => {
    // フォーカスの移動先が確定してから、自動切り替えを再判定する。
    setTimeout(updateAutoSwitch, 0);
  });

  document.addEventListener("visibilitychange", updateAutoSwitch);
  reducedMotion.addEventListener("change", updateAutoSwitch);
  mobileViewport.addEventListener("change", updateNewsLayout);

  updateNewsLayout();
}
