/* ==========================================================================
   PORTFOLIO — Heriniaina Tiavina Ramangalahy
   Interactions : apparitions au défilement, en-tête, progression,
   navigation active, menu mobile et halo des cartes projets.
   Aucune dépendance externe.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.getElementById('site-header');
  var progress = document.getElementById('progress-bar');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('main-nav');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-list a'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

  /* ------------------------------------------------------------------------
     Année du pied de page
     ------------------------------------------------------------------------ */

  var year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------------
     Apparitions au défilement
     Les éléments sont marqués en JS : sans JavaScript, la page reste lisible.
     ------------------------------------------------------------------------ */

  var revealGroups = [
    { selector: '.section-head', step: 0 },
    { selector: '.projects > .project', step: 90 },
    { selector: '.about-media', step: 0 },
    { selector: '.about-body .section-head', step: 0 },
    { selector: '.about-text > p', step: 70 },
    { selector: '.timeline > li', step: 70 },
    { selector: '.skills > .skill-group', step: 50 },
    { selector: '.contact-title', step: 0 },
    { selector: '.contact-lead', step: 80 },
    { selector: '.contact-actions', step: 140 },
    { selector: '.contact-grid', step: 200 }
  ];

  function initReveals() {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      return;
    }

    var targets = [];

    revealGroups.forEach(function (group) {
      Array.prototype.forEach.call(document.querySelectorAll(group.selector), function (element, index) {
        element.classList.add('reveal');
        element.style.setProperty('--delay', index * group.step + 'ms');
        targets.push(element);
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -6% 0px'
    });

    targets.forEach(function (target) {
      observer.observe(target);
    });
  }

  /* ------------------------------------------------------------------------
     En-tête, barre de progression et section active
     ------------------------------------------------------------------------ */

  var ticking = false;

  function updateOnScroll() {
    var y = window.scrollY || window.pageYOffset;
    var height = document.documentElement.scrollHeight - window.innerHeight;

    if (header) {
      header.classList.toggle('is-scrolled', y > 12);
    }

    if (progress) {
      var ratio = height > 0 ? Math.min(y / height, 1) : 0;
      progress.style.transform = 'scaleX(' + ratio + ')';
    }

    if (sections.length) {
      var marker = y + (header ? header.offsetHeight : 0) + 96;
      var current = null;

      sections.forEach(function (section) {
        if (section.offsetTop <= marker) {
          current = section.id;
        }
      });

      navLinks.forEach(function (link) {
        var active = link.getAttribute('href') === '#' + current;
        link.classList.toggle('is-active', active);

        if (active) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    ticking = false;
  }

  function requestScrollUpdate() {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(updateOnScroll);
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);

  /* ------------------------------------------------------------------------
     Menu mobile
     ------------------------------------------------------------------------ */

  function setMenu(open) {
    if (!nav || !burger) {
      return;
    }

    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        setMenu(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        burger.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) {
        return;
      }
      if (nav.contains(event.target) || burger.contains(event.target)) {
        return;
      }
      setMenu(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960 && nav.classList.contains('is-open')) {
        setMenu(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     Halo lumineux des cartes projets (souris uniquement)
     ------------------------------------------------------------------------ */

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-spotlight]').forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (event.clientY - rect.top) + 'px');
      });
    });
  }

  /* ------------------------------------------------------------------------
     Démarrage
     ------------------------------------------------------------------------ */

  initReveals();
  updateOnScroll();
})();
