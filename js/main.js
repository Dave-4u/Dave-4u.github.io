(function () {
  var year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.querySelector(".nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("active");
      navToggle.classList.toggle("active", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    navMenu.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("active");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  var navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", function () {
    if (!navbar) return;
    if (window.scrollY > 100) {
      navbar.style.background = "rgba(10, 10, 10, 0.98)";
    } else {
      navbar.style.background = "rgba(10, 10, 10, 0.95)";
    }
  });

  var skillsObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll(".skill-progress").forEach(function (bar) {
          var width = bar.getAttribute("data-width");
          setTimeout(function () {
            bar.style.width = width;
          }, 150);
        });
        skillsObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.35, rootMargin: "0px 0px -80px 0px" }
  );

  var skillsSection = document.querySelector(".skills");
  if (skillsSection) {
    skillsObserver.observe(skillsSection);
  }

  var animationObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.animation = "fadeInUp 0.6s ease forwards";
        animationObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  document
    .querySelectorAll(".service-card, .cert-card, .project-card, .stat")
    .forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      animationObserver.observe(el);
    });

  function updateActiveNavItem() {
    var sections = document.querySelectorAll("section[id]");
    var navLinks = document.querySelectorAll(".nav-link");
    var current = "";

    sections.forEach(function (section) {
      if (window.scrollY >= section.offsetTop - 200) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  }

  window.addEventListener("scroll", updateActiveNavItem);
  updateActiveNavItem();

  var backToTop = document.createElement("button");
  backToTop.type = "button";
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(backToTop);

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  });

  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("contact-name").value.trim();
      var email = document.getElementById("contact-email").value.trim();
      var subject = document.getElementById("contact-subject").value.trim();
      var message = document.getElementById("contact-message").value.trim();

      var body =
        "Name: " +
        name +
        "\nEmail: " +
        email +
        "\n\n" +
        message;

      var mailto =
        "mailto:adegborodamilaredavid@gmail.com" +
        "?subject=" +
        encodeURIComponent(subject || "Portfolio contact") +
        "&body=" +
        encodeURIComponent(body);

      window.location.href = mailto;
    });
  }
})();
