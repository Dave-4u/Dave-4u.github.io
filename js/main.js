(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Local time in Port Harcourt (WAT) */
  var clock = $("#local-time");
  function tick() {
    if (!clock) return;
    try {
      clock.textContent = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
    } catch (e) { clock.parentNode.style.display = "none"; }
  }
  tick(); setInterval(tick, 30000);

  /* Toast */
  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* Theme */
  var root = document.documentElement;
  var themeBtn = $("#theme-toggle");
  function syncThemeBtn() {
    var dark = root.getAttribute("data-theme") === "dark";
    if (!themeBtn) return;
    themeBtn.innerHTML = dark ? '<i class="fas fa-sun" aria-hidden="true"></i>' : '<i class="fas fa-moon" aria-hidden="true"></i>';
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#161a17" : "#f5efe4");
  }
  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("dave-theme", next); } catch (e) {}
    syncThemeBtn();
    toast(next === "dark" ? "Lights off. Easier on the eyes." : "Lights on.");
  }
  syncThemeBtn();
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  /* Mobile nav */
  var navToggle = $(".nav-toggle"), navMenu = $(".nav-menu");
  function closeMenu() {
    if (!navMenu) return;
    navMenu.classList.remove("active");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("active");
      navToggle.classList.toggle("active", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$(".nav-link", navMenu).forEach(function (l) { l.addEventListener("click", closeMenu); });
  }

  /* Scroll: nav border, progress bar, active link, back-to-top */
  var navbar = $(".navbar"), bar = $(".read-progress span");
  var sections = $$("main section[id]"), links = $$(".nav-link");
  var backToTop = document.createElement("button");
  backToTop.type = "button";
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
  document.body.appendChild(backToTop);
  backToTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (navbar) navbar.classList.toggle("scrolled", y > 10);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    backToTop.classList.toggle("visible", y > 400);
    var current = "";
    sections.forEach(function (s) { if (y >= s.offsetTop - 160) current = s.id; });
    links.forEach(function (l) {
      var on = l.getAttribute("href") === "#" + current;
      l.classList.toggle("active", on);
      if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* Reveal on scroll */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".service, .skill-category, .timeline-item, .project-row, .stat, .contact-form").forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 3) * 70 + "ms";
      io.observe(el);
    });
  }

  /* Project filter */
  var chips = $$(".chip"), rows = $$(".project-row");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      rows.forEach(function (r) {
        var show = f === "all" || r.getAttribute("data-kind") === f;
        r.classList.toggle("is-hidden", !show);
        if (show) { r.classList.add("in"); }
      });
    });
  });

  /* Copy buttons */
  function copy(text, btn) {
    var done = function () {
      toast("Copied " + text);
      if (btn) {
        btn.classList.add("done"); btn.textContent = "Copied";
        setTimeout(function () { btn.classList.remove("done"); btn.textContent = "Copy"; }, 1600);
      }
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { toast("Couldn't copy, but it's right there to select."); });
    } else {
      var t = document.createElement("textarea");
      t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Couldn't copy, but it's right there to select."); }
      document.body.removeChild(t);
    }
  }
  $$(".copy-btn").forEach(function (b) { b.addEventListener("click", function () { copy(b.getAttribute("data-copy"), b); }); });

  /* Contact form → mailto with friendly validation */
  var form = $("#contact-form"), err = $("#form-error"), msg = $("#contact-message"), count = $("#char-count");
  if (msg && count) {
    msg.addEventListener("input", function () {
      var n = msg.value.trim().length;
      count.textContent = n ? n + " chars" : "";
    });
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = [
        ["contact-name", "your name"],
        ["contact-email", "your email"],
        ["contact-subject", "a subject"],
        ["contact-message", "a short message"]
      ];
      var missing = [];
      fields.forEach(function (f) {
        var el = document.getElementById(f[0]);
        var bad = !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value.trim()));
        el.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad) missing.push(f);
      });
      if (missing.length) {
        err.textContent = "Almost there. Please add " + missing.map(function (m) { return m[1]; }).join(", ") + ".";
        document.getElementById(missing[0][0]).focus();
        return;
      }
      err.textContent = "";
      var name = $("#contact-name").value.trim();
      var email = $("#contact-email").value.trim();
      var subject = $("#contact-subject").value.trim();
      var body = "Name: " + name + "\nEmail: " + email + "\n\n" + msg.value.trim();
      toast("Opening your email app…");
      window.location.href = "mailto:adegborodamilaredavid@gmail.com?subject=" +
        encodeURIComponent(subject || "Portfolio contact") + "&body=" + encodeURIComponent(body);
    });
    $$("input, textarea", form).forEach(function (el) {
      el.addEventListener("input", function () { if (el.value.trim()) el.setAttribute("aria-invalid", "false"); });
    });
  }

  /* Keyboard shortcuts */
  var dialog = $("#kbd-dialog");
  function openDialog() { if (dialog && dialog.showModal && !dialog.open) dialog.showModal(); }
  var kbdOpen = $("#kbd-open");
  if (kbdOpen) kbdOpen.addEventListener("click", openDialog);
  var order = ["about", "services", "skills", "experience", "projects", "contact"];
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
    if (e.key === "?") { e.preventDefault(); openDialog(); return; }
    if (e.key === "t" || e.key === "T") { toggleTheme(); return; }
    if (e.key === "c" || e.key === "C") { copy("adegborodamilaredavid@gmail.com"); return; }
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= 6) {
      var target = document.getElementById(order[n - 1]);
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  });
})();
