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
  var H = [
    ['Emergency Dentistry', 'Same day emergency care', 'We reserve time in our daily schedule for dental emergencies and will accommodate both existing patients and those that are unable to see their regular dentist promptly.'],
    ['Dental Implants & Dentures', 'Replace missing teeth', 'Missing one or more teeth? Dental Implant’s function and look like natural teeth; it’s tough to tell them apart. Dentures are an excellent, affordable removable tooth replacement option.'],
    ['Root Canals', 'Relief for sore teeth', 'Suffering pain? You may need a Root Canal. Let our team take care of you and make you feel comfortable.'],
    ['Dentures', 'Our onsite Denturist can help', 'Dentures are an excellent, affordable removable tooth replacement option. Our onsite Denturist, Franco Disciglio, can help.'],
    ['Cosmetic Dentistry & Invisalign®', 'An awesome new smile', 'Let our NE Calgary Dentists fix or give you an awesome new smile. Ask for a cosmetic consultation today, or request a complimentary Invisalign® Consultation.'],
    ['Cosmetic Injectables', 'Therapeutic and cosmetic options', 'Headaches? Jaw Pain? Crow’s Feet? Facial Lines? Our dentists offer both therapeutic and cosmetic injectable options.'],
    ['Children’s Dentistry', 'Kids are always welcome', 'Yes, our dental team welcomes children of all ages. We love having them around. We do our best to keep our office as child-friendly as possible.'],
    ['Dental Hygiene & Teeth Cleaning', 'No one’s judging you', 'Even if it’s been years since you last visited a dentist in Calgary, no one’s judging you. Rest assured that you’ll receive complete attention from our friendly, welcoming Monterey Dentists.']
  ];
  var out = $('.helper-out'), tag = $('[data-ho-tag]'), ttl = $('[data-ho-title]'), txt = $('[data-ho-text]');
  var tabs = $$('.helper-list button');
  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      tag.textContent = H[i][0]; ttl.textContent = H[i][1]; txt.textContent = H[i][2];
      out.classList.remove('swap'); void out.offsetWidth; out.classList.add('swap');
    });
    b.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
      if (k) { e.preventDefault(); var n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); n.click(); }
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
