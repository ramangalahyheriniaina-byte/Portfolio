/*
   PORTFOLIO — Navigation par sections indépendantes
    */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  var header = document.getElementById('site-header');
  var progress = document.getElementById('progress-bar');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('main-nav');

  var navLinks = Array.from(
    document.querySelectorAll('.nav-list a')
  );

  var sections = Array.from(
    document.querySelectorAll('main section[id]')
  );

  var footer = document.querySelector('.site-footer');
  var activeSection = null;

  /* Année automatique */
  var year = document.getElementById('year');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* Placer le footer dans Contact */
  var contact = document.getElementById('contact');

  if (footer && contact && !contact.contains(footer)) {
    contact.appendChild(footer);
  }

  /* Menu mobile */
  function setMenu(open) {
    if (!nav || !burger) return;

    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);

    burger.setAttribute(
      'aria-expanded',
      open ? 'true' : 'false'
    );

    burger.setAttribute(
      'aria-label',
      open ? 'Fermer le menu' : 'Ouvrir le menu'
    );
  }

  /* Mise à jour du menu actif */
  function updateNavigation(id) {
    navLinks.forEach(function (link) {
      var active =
        link.getAttribute('href') === '#' + id;

      link.classList.toggle('is-active', active);

      if (active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  /* Barre de progression de la section */
  function updateProgress() {
    if (!progress || !activeSection) return;

    var max =
      activeSection.scrollHeight -
      activeSection.clientHeight;

    var ratio = max > 0
      ? activeSection.scrollTop / max
      : 0;

    progress.style.transform =
      'scaleX(' + ratio + ')';
  }

  /* Changer de section */
  function activateSection(id, updateHash) {
    var next = document.getElementById(id);

    if (!next || !sections.includes(next)) return;

    sections.forEach(function (section) {
      var isActive = section === next;

      section.classList.toggle('is-active', isActive);

      section.setAttribute(
        'aria-hidden',
        isActive ? 'false' : 'true'
      );

      if ('inert' in section) {
        section.inert = !isActive;
      }
    });

    activeSection = next;

    /* Chaque nouvelle section commence en haut */
    activeSection.scrollTop = 0;

    updateNavigation(id);
    updateProgress();

    if (header) {
      header.classList.toggle(
        'is-scrolled',
        id !== 'accueil'
      );
    }

    /* Actualiser l'URL */
    if (updateHash &&
        window.location.hash !== '#' + id) {
      history.pushState(
        { section: id },
        '',
        '#' + id
      );
    }

    setMenu(false);
  }

  /* Navigation par clic sur tous les liens internes */
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');

    if (!link) return;

    var id = link.getAttribute('href').substring(1);

    if (!id) return;

    var target = sections.find(function (section) {
      return section.id === id;
    });

    if (!target) return;

    event.preventDefault();

    activateSection(id, true);
  });

  /* Bouton menu mobile */
  if (burger && nav) {

    burger.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });

    document.addEventListener('keydown', function (event) {
      if (
        event.key === 'Escape' &&
        nav.classList.contains('is-open')
      ) {
        setMenu(false);
        burger.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;

      if (
        nav.contains(event.target) ||
        burger.contains(event.target)
      ) {
        return;
      }

      setMenu(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) {
        setMenu(false);
      }
    });
  }

  /* Défilement indépendant de chaque section */
  sections.forEach(function (section) {
    section.addEventListener(
      'scroll',
      updateProgress,
      { passive: true }
    );
  });

  /* Boutons précédent/suivant du navigateur */
  window.addEventListener('popstate', function () {
    var id = window.location.hash.substring(1);

    var valid = sections.some(function (section) {
      return section.id === id;
    });

    activateSection(
      valid ? id : 'accueil',
      false
    );
  });

  /* Animations d'apparition */
  function initReveals() {

    if (
      reduceMotion ||
      !('IntersectionObserver' in window)
    ) {
      return;
    }

    var groups = [
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
      { selector: '.contact-orbit', step: 0 },
      { selector: '.contact-grid', step: 200 }
    ];

    var targets = [];

    groups.forEach(function (group) {
      document.querySelectorAll(group.selector).forEach(
        function (element, index) {
          element.classList.add('reveal');

          element.style.setProperty(
            '--delay',
            (index * group.step) + 'ms'
          );

          targets.push(element);
        }
      );
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -4% 0px'
      }
    );

    targets.forEach(function (target) {
      observer.observe(target);
    });
  }

  /* Effet lumineux des projets */
  var finePointer = window.matchMedia(
    '(hover: hover) and (pointer: fine)'
  ).matches;

  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-spotlight]').forEach(
      function (card) {
        card.addEventListener('pointermove', function (event) {
          var rect = card.getBoundingClientRect();

          card.style.setProperty(
            '--mx',
            (event.clientX - rect.left) + 'px'
          );

          card.style.setProperty(
            '--my',
            (event.clientY - rect.top) + 'px'
          );
        });
      }
    );
  }

  /* Orbite d'outils (section Contact) */
  function initOrbit() {
    var orbit = document.getElementById('orbit');
    var tabs = document.getElementById('orbit-tabs');
    if (!orbit || !tabs) return;

    var RINGS = {
      1: { name: 'Réseaux et systèmes', desc: 'La base : faire tourner et sécuriser l’infra.' },
      2: { name: 'DevOps et supervision', desc: 'Automatiser, déployer, surveiller.' },
      3: { name: 'Applications et données', desc: 'Du code qui tourne sur cette infra.' }
    };

    var TOOLS = [
      [1, 'Linux', 'Administration serveurs, shell, services'],
      [1, 'VLAN', 'Segmentation et routage réseau'],
      [1, 'FortiGate', 'Pare-feu et politiques de sécurité'],
      [1, 'Nginx', 'Reverse proxy et serveur web'],
      [2, 'Git', 'Versionnement et collaboration'],
      [2, 'Docker', 'Conteneurs et environnements reproductibles'],
      [2, 'Ansible', 'Automatisation de configuration'],
      [2, 'Jenkins', 'Pipelines CI/CD'],
      [2, 'Prometheus', 'Collecte de métriques'],
      [2, 'Grafana', 'Tableaux de bord et alertes'],
      [3, 'Python', 'Scripts et automatisation'],
      [3, 'Flask', 'API et petites applications web'],
      [3, 'Symfony', 'Applications PHP structurées'],
      [3, 'React', 'Interfaces web'],
      [3, 'PostgreSQL', 'Base de données relationnelle']
    ];

    var ICONS = window.ORBIT_ICONS || {};

    function iconFor(name) {
      var icon = ICONS[name];
      if (!icon) return '';
      var inner = icon.p ? '<path d="' + icon.p + '"/>' : icon.s;
      return '<svg viewBox="0 0 24 24" fill="' + (icon.p ? icon.c : 'none') + '" style="color:' + icon.c +
        '" aria-hidden="true" focusable="false">' + inner + '</svg>';
    }

    var html = '<div class="orbit-sweep" aria-hidden="true"></div>';

    [1, 2, 3].forEach(function (r) {
      var list = TOOLS.filter(function (t) { return t[0] === r; });
      html += '<div class="orbit-ring" data-ring="' + r + '">';
      list.forEach(function (t, i) {
        var angle = Math.round((360 / list.length) * i + r * 17);
        html += '<div class="orbit-node" style="--a:' + angle + 'deg">' +
          '<div class="orbit-counter">' +
          '<div class="orbit-chip" tabindex="0" data-r="' + r + '" data-n="' + t[1] + '" data-d="' + t[2] + '">' +
          iconFor(t[1]) + t[1] + '</div></div></div>';
      });
      html += '</div>';
    });

    html += '<div class="orbit-core" id="orbit-core" aria-live="polite"></div>';
    orbit.innerHTML = html;

    var core = document.getElementById('orbit-core');
    var focus = 0;

    function show(tag, title, desc) {
      core.innerHTML = '<span class="tag">' + tag + '</span><b>' + title + '</b><small>' + desc + '</small>';
    }

    function reset() {
      if (focus) {
        show('Étape ' + focus, RINGS[focus].name, RINGS[focus].desc);
      } else {
        show('Parcours', 'Heriniaina', 'Survolez un outil pour le découvrir.');
      }
    }

    orbit.querySelectorAll('.orbit-chip').forEach(function (chip) {
      function on() {
        show(RINGS[chip.dataset.r].name, chip.dataset.n, chip.dataset.d);
      }
      chip.addEventListener('mouseenter', on);
      chip.addEventListener('focus', on);
      chip.addEventListener('mouseleave', reset);
      chip.addEventListener('blur', reset);
    });

    tabs.innerHTML = [1, 2, 3].map(function (r) {
      return '<button type="button" class="orbit-tab" aria-pressed="false" data-r="' + r + '">' +
        r + '. ' + RINGS[r].name + '</button>';
    }).join('');

    tabs.addEventListener('click', function (event) {
      var button = event.target.closest('.orbit-tab');
      if (!button) return;

      var r = Number(button.dataset.r);
      focus = focus === r ? 0 : r;
      orbit.dataset.focus = focus;

      tabs.querySelectorAll('.orbit-tab').forEach(function (tab) {
        tab.setAttribute('aria-pressed', String(Number(tab.dataset.r) === focus));
      });

      reset();
    });

    reset();
  }

  /* Initialisation */
  initReveals();
  initOrbit();

  var initialId = window.location.hash.substring(1);

  var validInitial = sections.some(function (section) {
    return section.id === initialId;
  });

  activateSection(
    validInitial ? initialId : 'accueil',
    false
  );

})();