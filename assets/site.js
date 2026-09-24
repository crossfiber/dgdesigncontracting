/* DG Design Contracting site script. Mechanics from builda-mechanics.md, restyled. */
if ('scrollRestoration' in history) { history.scrollRestoration = 'auto'; }
(function(){
  if (window.location.hash) { history.replaceState(null, '', window.location.pathname + window.location.search); }

  /* Drawer */
  var hamburger = document.getElementById('hamburger');
  var drawer = document.getElementById('navDrawer');
  var overlay = document.getElementById('navOverlay');
  var drawerClose = document.getElementById('drawerClose');
  function openDrawer(){
    drawer.classList.add('open'); overlay.classList.add('open');
    document.body.classList.add('drawer-open');
    drawer.setAttribute('aria-hidden','false'); hamburger.setAttribute('aria-expanded','true');
    drawerClose.focus();
  }
  function closeDrawer(){
    drawer.classList.remove('open'); overlay.classList.remove('open');
    document.body.classList.remove('drawer-open');
    drawer.setAttribute('aria-hidden','true'); hamburger.setAttribute('aria-expanded','false');
  }
  if (hamburger && drawer) {
    hamburger.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeDrawer); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer(); });
  }

  /* In-page anchors: smooth scroll, no hash left behind */
  document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach(function(link){
    link.addEventListener('click', function(e){
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
      history.replaceState(null, '', window.location.pathname + window.location.search);
    });
  });

  /* Accordion */
  document.querySelectorAll('.acc-head').forEach(function(btn){
    btn.addEventListener('click', function(){
      var item = btn.parentElement;
      var isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.acc-item').forEach(function(i){
        i.classList.remove('open');
        i.querySelector('.acc-head').setAttribute('aria-expanded','false');
        i.querySelector('.acc-body').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded','true');
        var body = item.querySelector('.acc-body');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
  var rsz;
  window.addEventListener('resize', function(){
    clearTimeout(rsz);
    rsz = setTimeout(function(){
      document.querySelectorAll('.acc-item.open .acc-body').forEach(function(b){ b.style.maxHeight = b.scrollHeight + 'px'; });
    }, 120);
  });

  /* Review slider: one at a time, n / N */
  var slides = document.querySelectorAll('.slide');
  if (slides.length) {
    var cur = 0, count = document.getElementById('slideCount');
    var show = function(n){
      cur = (n + slides.length) % slides.length;
      slides.forEach(function(s, i){ s.classList.toggle('on', i === cur); s.setAttribute('aria-hidden', i === cur ? 'false' : 'true'); });
      if (count) count.textContent = (cur + 1) + ' / ' + slides.length;
    };
    document.getElementById('revPrev').addEventListener('click', function(){ show(cur - 1); });
    document.getElementById('revNext').addEventListener('click', function(){ show(cur + 1); });
    show(0);
  }

  /* Work rail arrows */
  var rail = document.getElementById('rail');
  var prev = document.getElementById('railPrev');
  var next = document.getElementById('railNext');
  if (rail && prev && next) {
    var step = function(){ var c = rail.querySelector('.rail-card'); return c ? c.getBoundingClientRect().width + 16 : 316; };
    prev.addEventListener('click', function(){ rail.scrollBy({left: -step(), behavior:'smooth'}); });
    next.addEventListener('click', function(){ rail.scrollBy({left: step(), behavior:'smooth'}); });
  }

  /* Lightbox (work page) */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb-bar p'), lbClose = lb.querySelector('button'), lastBtn = null;
    var closeLb = function(){ lb.classList.remove('open'); document.body.classList.remove('lb-open'); if (lastBtn) lastBtn.focus(); };
    document.querySelectorAll('[data-full]').forEach(function(b){
      b.addEventListener('click', function(){
        lastBtn = b;
        lbImg.src = b.getAttribute('data-full'); lbImg.alt = b.querySelector('img').alt;
        lbCap.textContent = b.getAttribute('data-cap');
        lb.classList.add('open'); document.body.classList.add('lb-open'); lbClose.focus();
      });
    });
    lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', function(e){ if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });
  }

  /* Estimate form: novalidate, branded errors, clears on input */
  var form = document.getElementById('estimateForm');
  if (form) {
    form.querySelectorAll('input, select, textarea').forEach(function(el){
      ['input','change'].forEach(function(ev){
        el.addEventListener(ev, function(){ var f = el.closest('.field'); if (f) f.classList.remove('err'); });
      });
    });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var bad = [];
      var name = form.querySelector('#f-name'), phone = form.querySelector('#f-phone'), email = form.querySelector('#f-email'), proj = form.querySelector('#f-project');
      if (!name.value.trim()) bad.push(name);
      var digits = phone.value.replace(/\D/g, '');
      if (digits.length < 10) bad.push(phone);
      if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) bad.push(email);
      if (!proj.value) bad.push(proj);
      bad.forEach(function(el){ el.closest('.field').classList.add('err'); });
      if (bad.length) { bad[0].focus(); return; }
      var btn = form.querySelector('button[type=submit]');
      var fail = form.querySelector('.form-fail');
      btn.disabled = true; btn.textContent = 'Sending...';
      fail.classList.remove('show');
      fetch(form.getAttribute('action'), { method:'POST', headers:{'Accept':'application/json'}, body:new FormData(form) })
        .then(function(r){ if (!r.ok) throw new Error('bad'); return r.json(); })
        .then(function(){
          form.querySelector('.fields').style.display = 'none';
          form.querySelector('.form-actions').style.display = 'none';
          var done = form.querySelector('.form-done'); done.classList.add('show'); done.focus();
        })
        .catch(function(){
          btn.disabled = false; btn.textContent = 'Request my free estimate';
          fail.classList.add('show');
        });
    });
  }
})();
