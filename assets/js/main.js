(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Header shadow
  var hdr = $('#hdr');
  function onScroll() { hdr.classList.toggle('is-stuck', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mobile menu
  var burger = $('.burger'), drawer = $('#drawer');
  function setMenu(open) { burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); drawer.hidden = !open; }
  burger.addEventListener('click', function () { setMenu(drawer.hidden); });
  drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1080) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) { setMenu(false); burger.focus(); } });

  // Inner pages are not built yet
  document.addEventListener('click', function (e) { if (e.target.closest('[data-nolink]')) e.preventDefault(); });

  // Hero video
  var vid = $('.hero-video video'), vb = $('.vid-btn');
  function setPaused(p) { if (p) vid.pause(); else vid.play(); vb.setAttribute('aria-pressed', String(p)); vb.setAttribute('aria-label', p ? 'Play video' : 'Pause video'); }
  if (reduce) { vid.removeAttribute('autoplay'); setPaused(true); }
  vb.addEventListener('click', function () { setPaused(!vid.paused); });

  // Hero numbers count up on load and each time they come back into view
  var cnts = $$('.cnt');
  function runCount() {
    cnts.forEach(function (el) {
      var to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0);
      if (reduce) { el.textContent = to.toFixed(dec); return; }
      var t0 = null;
      (function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1800, 1), v = to * (1 - Math.pow(1 - p, 3));
        el.textContent = v.toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }
  var proof = $('.hero-proof');
  if (proof && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setTimeout(runCount, 300); }); }, { threshold: .4 }).observe(proof);
  } else { runCount(); }

  // Symptom helper: each prompt points to a service described on montereydental.ca
  var panel = $('.hx-panel'), tag = $('[data-ho-tag]'), ttl = $('[data-ho-title]'), txt = $('[data-ho-text]'), pic = $('[data-hx-img]'), cta = $('[data-ho-cta]');
  var tabs = $$('.hx-tile');
  function pick(b) {
    tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
    tag.innerHTML = b.dataset.tag; ttl.textContent = b.dataset.title; txt.textContent = b.dataset.text; pic.src = b.dataset.img;
    if (b.dataset.cta === 'tel') { cta.href = 'tel:+14032937818'; cta.textContent = 'Call (403) 293-7818'; }
    else { cta.href = '#book'; cta.textContent = 'Book this visit'; }
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    if (window.innerWidth <= 1080) panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }
  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () { pick(b); });
    b.addEventListener('keydown', function (e) {
      var k = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
      if (k) { e.preventDefault(); var n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); pick(n); }
    });
  });

  // Reveal on scroll
  var rs = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) { rs.forEach(function (r) { r.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    rs.forEach(function (r) { io.observe(r); });
  }

  // FAQ: one open at a time
  $$('.faq-list details').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) $$('.faq-list details').forEach(function (o) { if (o !== d) o.open = false; }); });
  });

  // Contact form
  var form = $('.ct-form'), note = $('.form-note', form);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['name', 'email', 'phone'].forEach(function (n) {
      var f = form.elements[n];
      var bad = !f.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.closest('.fld').classList.toggle('bad', bad); if (bad) ok = false;
    });
    if (!ok) { note.textContent = 'Please fill in your name, email and phone number.'; return; }
    var body = 'Name: ' + form.elements.name.value + '\nEmail: ' + form.elements.email.value + '\nPhone: ' + form.elements.phone.value + '\n\n' + form.elements.message.value;
    window.location.href = 'mailto:info@montereydental.ca?subject=' + encodeURIComponent('Contact request from the website') + '&body=' + encodeURIComponent(body);
    note.textContent = 'Opening your email app. You can also call (403) 293-7818.';
  });

  var y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
