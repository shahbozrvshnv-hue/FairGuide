/* ============================================================
   FairGuide — main.js
   i18n engine · navigation · reveals · scanner demo
   ============================================================ */
(function () {
  "use strict";

  var LANGS = [
    { code: "en", name: "English" },
    { code: "uz", name: "Oʻzbekcha" },
    { code: "ru", name: "Русский" },
    { code: "tr", name: "Türkçe" },
    { code: "zh", name: "中文" }
  ];

  var state = {
    lang: null,
    dict: {},
    cache: {}
  };

  /* ---------------- i18n ---------------- */

  function detectLang() {
    var url = new URLSearchParams(location.search).get("lang");
    if (url && LANGS.some(function (l) { return l.code === url; })) return url;
    var saved = null;
    try { saved = localStorage.getItem("fg-lang"); } catch (e) {}
    if (saved && LANGS.some(function (l) { return l.code === saved; })) return saved;
    return "en";
  }

  function loadDict(lang) {
    if (state.cache[lang]) return Promise.resolve(state.cache[lang]);
    return fetch("assets/i18n/" + lang + ".json", { credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok) throw new Error("i18n " + lang + ": HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        state.cache[lang] = json;
        return json;
      });
  }

  function t(key) {
    var d = state.dict;
    if (d && Object.prototype.hasOwnProperty.call(d, key)) return d[key];
    var en = state.cache.en || {};
    if (Object.prototype.hasOwnProperty.call(en, key)) return en[key];
    return null;
  }

  function applyDict() {
    var d = state.dict;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"));
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-html"));
      if (v != null) el.innerHTML = v; /* trusted strings authored in i18n files */
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-alt"));
      if (v != null) el.setAttribute("alt", v);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-aria"));
      if (v != null) el.setAttribute("aria-label", v);
    });
    var title = t("meta.title");
    if (title) document.title = title;
    var desc = document.querySelector('meta[name="description"]');
    var mdesc = t("meta.desc");
    if (desc && mdesc) desc.setAttribute("content", mdesc);
    var ogT = document.querySelector('meta[property="og:title"]');
    var ogD = document.querySelector('meta[property="og:description"]');
    if (ogT && title) ogT.setAttribute("content", title);
    if (ogD && mdesc) ogD.setAttribute("content", mdesc);
  }

  function renderLangUI() {
    var menu = document.getElementById("langMenu");
    var mobile = document.getElementById("langMobile");
    var active = state.lang;
    if (menu) {
      menu.innerHTML = "";
      LANGS.forEach(function (l) {
        var b = document.createElement("button");
        b.setAttribute("role", "option");
        b.setAttribute("aria-checked", l.code === active ? "true" : "false");
        b.setAttribute("lang", l.code);
        b.innerHTML = "<span>" + l.name + '</span><span style="display:flex;align-items:center;gap:8px"><span class="code">' +
          l.code.toUpperCase() + '</span><svg class="check" aria-hidden="true"><use href="#i-check"/></svg></span>';
        b.addEventListener("click", function () { setLang(l.code); closeLangMenu(); });
        menu.appendChild(b);
      });
    }
    if (mobile) {
      mobile.innerHTML = "";
      LANGS.forEach(function (l) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("lang", l.code);
        b.className = l.code === active ? "active" : "";
        b.textContent = l.name;
        b.addEventListener("click", function () { setLang(l.code); });
        mobile.appendChild(b);
      });
    }
    var code = document.getElementById("langCode");
    if (code) code.textContent = active.toUpperCase();
  }

  function setLang(lang, silent) {
    if (!LANGS.some(function (l) { return l.code === lang; })) return;
    loadDict(lang).then(function (json) {
      state.lang = lang;
      state.dict = json;
      document.documentElement.setAttribute("lang", lang);
      try { localStorage.setItem("fg-lang", lang); } catch (e) {}
      var u = new URL(location.href);
      u.searchParams.set("lang", lang);
      try { history.replaceState(null, "", u); } catch (e) {}
      applyDict();
      renderLangUI();
      if (!silent) document.dispatchEvent(new CustomEvent("fg:lang", { detail: { lang: lang } }));
    }).catch(function (err) {
      console.error(err);
    });
  }

  /* Language dropdown */
  var langWrap = document.getElementById("langDesktop");
  var langBtn = document.getElementById("langBtn");
  function closeLangMenu() {
    if (!langWrap) return;
    langWrap.classList.remove("open");
    if (langBtn) langBtn.setAttribute("aria-expanded", "false");
  }
  if (langBtn && langWrap) {
    langBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = langWrap.classList.toggle("open");
      langBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!langWrap.contains(e.target)) closeLangMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLangMenu();
    });
  }

  /* ---------------- Header ---------------- */
  var header = document.getElementById("siteHeader");
  var toTop = document.getElementById("toTop");

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("scrolled", y > 30);
    if (toTop) toTop.classList.toggle("show", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- Mobile menu ---------------- */
  var menuBtn = document.getElementById("menuBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  function closeMenu() {
    document.body.classList.remove("menu-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    setTimeout(function () {
      if (mobileMenu && !document.body.classList.contains("menu-open")) mobileMenu.hidden = true;
    }, 280);
  }
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var willOpen = !document.body.classList.contains("menu-open");
      if (willOpen) {
        mobileMenu.hidden = false;
        requestAnimationFrame(function () { document.body.classList.add("menu-open"); });
        menuBtn.setAttribute("aria-expanded", "true");
      } else {
        closeMenu();
      }
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) closeMenu();
    });
  }

  /* ---------------- Active nav highlighting ---------------- */
  var navLinks = {};
  document.querySelectorAll(".nav-desktop a[data-nav]").forEach(function (a) {
    navLinks[a.getAttribute("data-nav")] = a;
  });
  var sectionMap = [
    ["home", "home"], ["how", "how"], ["tourists", "tourists"], ["guides", "guides"],
    ["volunteer", "volunteer"], ["host", "host"], ["about", "about"]
  ];
  if ("IntersectionObserver" in window && Object.keys(navLinks).length) {
    var sections = sectionMap.map(function (p) { return document.getElementById(p[1]); }).filter(Boolean);
    var activeId = null;
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) activeId = en.target.id;
      });
      sectionMap.forEach(function (p) {
        var link = navLinks[p[0]];
        if (link) link.classList.toggle("active", p[1] === activeId);
      });
    }, { rootMargin: "-38% 0px -52% 0px", threshold: 0 });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var reduceMotion = typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal, .reveal-l, .reveal-r, [data-stagger]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          revealObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------- Scanner demo ---------------- */
  var modeBtns = document.querySelectorAll(".scan-modes button");
  var scanStatus = document.getElementById("scanStatus");
  var resultCard = document.getElementById("resultCard");
  var scanline = document.getElementById("scanline");
  var scanPlayed = false;
  var scanTimers = [];

  function statusKeys(mode) {
    var base = {
      barcode: "scanner.statusBarcode",
      product: "scanner.statusProduct",
      tag: "scanner.statusTag",
      photo: "scanner.statusPhoto"
    };
    return base[mode] || base.tag;
  }

  function clearTimers() {
    scanTimers.forEach(clearTimeout);
    scanTimers = [];
  }

  function runScan(mode) {
    if (!resultCard || !scanStatus || !scanline) return;
    clearTimers();
    resultCard.classList.remove("show");
    scanline.style.display = "block";
    var key = statusKeys(mode);
    function setS() { if (state.dict && state.dict[key]) scanStatus.textContent = state.dict[key]; }
    setS();
    scanTimers.push(setTimeout(setS, 60));
    scanTimers.push(setTimeout(function () {
      scanline.style.display = "none";
      resultCard.classList.add("show");
      var done = state.dict && state.dict["scanner.statusDone"];
      if (done) scanStatus.textContent = done;
    }, 1500));
  }

  modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      modeBtns.forEach(function (b) {
        b.classList.remove("on");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("on");
      btn.setAttribute("aria-pressed", "true");
      runScan(btn.getAttribute("data-mode"));
    });
  });

  if ("IntersectionObserver" in window) {
    var scanObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !scanPlayed) {
          scanPlayed = true;
          setTimeout(function () { runScan(document.querySelector(".scan-modes button.on").getAttribute("data-mode")); }, 600);
          scanObserver.disconnect();
        }
      });
    }, { threshold: 0.35 });
    var scannerSection = document.getElementById("scanner");
    if (scannerSection) scanObserver.observe(scannerSection);
  }

  /* ---------------- Boot ---------------- */
  var initial = detectLang();
  setLang(initial, true);
})();
