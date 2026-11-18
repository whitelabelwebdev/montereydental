(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var hdr = $('#hdr');
  function onScroll() { hdr.classList.toggle('is-stuck', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Cards that lead to the form pre-fill the reason
  var form = $('.lp-form');
  $$('[data-reason]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = form.elements.reason;
      $$('option', sel).forEach(function (o) { if (o.textContent === a.dataset.reason) sel.value = o.value || o.textContent; });
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

  // Form
  var note = $('.form-note', form);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['name', 'phone', 'reason'].forEach(function (n) {
      var f = form.elements[n];
      var bad = !f.value.trim() || (n === 'phone' && f.value.replace(/\D/g, '').length < 10);
      f.closest('.fld').classList.toggle('bad', bad); if (bad) ok = false;
    });
    if (!ok) { note.textContent = 'Please add your name, a phone number and the reason for your visit.'; return; }
    var body = 'Name: ' + form.elements.name.value + '\nPhone: ' + form.elements.phone.value + '\nReason: ' + form.elements.reason.value + '\nPreferred day: ' + (form.elements.day.value || 'Any day');
    window.location.href = 'mailto:info@montereydental.ca?subject=' + encodeURIComponent('Appointment request') + '&body=' + encodeURIComponent(body);
    note.textContent = 'Thanks! Opening your email app to send the request.';
  });

  var y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
