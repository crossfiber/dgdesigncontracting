/* DG Design Contracting site script. Mechanics from builda-mechanics.md, restyled.
   Language engine from barberia-estrellas and rose-art-decor: data-en / data-es on every text unit. */
if ('scrollRestoration' in history) { history.scrollRestoration = 'auto'; }
(function(){
  var bootHash = window.location.hash;
  if (bootHash) {
    history.replaceState(null, '', window.location.pathname + window.location.search.replace(/[?&]lang=\w+/, ''));
    var goHash = function(){ var t = null; try { t = document.querySelector(bootHash); } catch (e) {} if (t) t.scrollIntoView({block:'start'}); };
    if (document.readyState === 'complete') goHash(); else window.addEventListener('load', goHash);
  }

  var root = document.documentElement;
  var LANG = 'en';
  var listeners = [];
  var T = function(en, es){ return LANG === 'es' ? es : en; };

  /* ---- language ---- */
  function applyLang(l){
    LANG = (l === 'es') ? 'es' : 'en';
    root.setAttribute('lang', LANG);
    document.querySelectorAll('[data-en]').forEach(function(el){
      var v = el.getAttribute('data-' + LANG); if (v !== null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-en-ph]').forEach(function(el){ el.setAttribute('placeholder', el.getAttribute('data-' + LANG + '-ph')); });
    document.querySelectorAll('[data-en-aria]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-' + LANG + '-aria')); });
    var t = root.getAttribute('data-title-' + LANG); if (t) document.title = t;
    var d = root.getAttribute('data-desc-' + LANG), m = document.querySelector('meta[name="description"]');
    if (d && m) m.setAttribute('content', d);
    document.querySelectorAll('.lang button').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === LANG)); });
    document.querySelectorAll('.acc-item.open .acc-body').forEach(function(b){ b.style.maxHeight = b.scrollHeight + 'px'; });
    try { localStorage.setItem('dg-lang', LANG); } catch (e) {}
    listeners.forEach(function(fn){ fn(); });
  }
  document.querySelectorAll('.lang button').forEach(function(b){
    b.addEventListener('click', function(){ applyLang(b.getAttribute('data-lang')); });
  });

  /* ---- drawer ---- */
  var hamburger = document.getElementById('hamburger');
  var drawer = document.getElementById('navDrawer');
  var overlay = document.getElementById('navOverlay');
  var drawerClose = document.getElementById('drawerClose');
  var shell = document.querySelector('.drawer-shell');
  function openDrawer(){
    drawer.classList.add('open'); overlay.classList.add('open');
    document.body.classList.add('drawer-open');
    drawer.setAttribute('aria-hidden','false'); hamburger.setAttribute('aria-expanded','true');
    /* focus without scrolling: focusing inside the clipped wrapper mid-slide scrolled it sideways on iOS */
    shell.scrollLeft = 0;
    setTimeout(function(){ try { drawerClose.focus({preventScroll:true}); } catch (e) { drawerClose.focus(); } shell.scrollLeft = 0; }, 320);
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

  /* ---- in-page anchors: smooth scroll, no hash left behind ---- */
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

  /* ---- accordion ---- */
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

  /* ---- lightbox (work page) ---- */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb-bar p'), lbClose = lb.querySelector('button'), lastBtn = null;
    var closeLb = function(){ lb.classList.remove('open'); document.body.classList.remove('lb-open'); if (lastBtn) lastBtn.focus(); };
    document.querySelectorAll('[data-full]').forEach(function(b){
      b.addEventListener('click', function(){
        lastBtn = b;
        lbImg.src = b.getAttribute('data-full'); lbImg.alt = b.querySelector('img').alt;
        var cap = b.closest('figure').querySelector('figcaption');
        lbCap.textContent = cap ? cap.textContent : '';
        lb.classList.add('open'); document.body.classList.add('lb-open'); lbClose.focus();
      });
    });
    lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', function(e){ if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });
  }

  /* ---- sideways rails: arrows step one card, disable at the ends, count on phones ---- */
  document.querySelectorAll('.rail').forEach(function(rail){
    if (!rail.id) return;
    var prev = document.querySelectorAll('[data-rail-prev="' + rail.id + '"]');
    var next = document.querySelectorAll('[data-rail-next="' + rail.id + '"]');
    var count = document.querySelector('[data-count="' + rail.id + '"]');
    var cards = [].slice.call(rail.children);
    var step = function(){ var c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 20) : 320; };
    var update = function(){
      var max = rail.scrollWidth - rail.clientWidth - 2;
      prev.forEach(function(b){ b.disabled = rail.scrollLeft <= 2; });
      next.forEach(function(b){ b.disabled = rail.scrollLeft >= max; });
      if (count) { var i = Math.round(rail.scrollLeft / step()); count.textContent = Math.min(i + 1, cards.length) + ' / ' + cards.length; }
    };
    prev.forEach(function(b){ b.addEventListener('click', function(){ rail.scrollBy({left: -step(), behavior:'smooth'}); }); });
    next.forEach(function(b){ b.addEventListener('click', function(){ rail.scrollBy({left: step(), behavior:'smooth'}); }); });
    var t; rail.addEventListener('scroll', function(){ clearTimeout(t); t = setTimeout(update, 60); }, {passive:true});
    window.addEventListener('resize', update);
    update();
  });

  /* ---- open-now line + today's row in every hours table (Lake Mary time) ---- */
  var HRS = {0:[10,17],1:[8,18],2:[8,18],3:[8,18],4:[8,18],5:[8,18],6:[6,18]};
  var fmt = function(h){ return (h % 12 || 12) + (h < 12 ? ' AM' : ' PM'); };
  var day = -1, now = 0;
  try {
    var parts = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York', weekday:'short', hour:'numeric', minute:'numeric', hour12:false}).formatToParts(new Date());
    var get = function(t){ var p = parts.filter(function(x){ return x.type === t; })[0]; return p ? p.value : ''; };
    day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday'));
    now = (parseInt(get('hour'), 10) % 24) + parseInt(get('minute'), 10) / 60;
    document.querySelectorAll('.hours tr[data-days]').forEach(function(tr){
      if (tr.getAttribute('data-days').split(',').indexOf(String(day)) > -1) tr.classList.add('today');
    });
  } catch (e) {}
  function renderOpen(){
    if (day < 0) return;
    var msg, open = false;
    if (now >= HRS[day][0] && now < HRS[day][1]) { open = true; msg = T('Open now, until ', 'Abierto ahora, hasta las ') + fmt(HRS[day][1]); }
    else if (now < HRS[day][0]) { msg = T('Closed now. Opens today at ', 'Cerrado. Abre hoy a las ') + fmt(HRS[day][0]); }
    else { msg = T('Closed now. Opens tomorrow at ', 'Cerrado. Abre mañana a las ') + fmt(HRS[(day + 1) % 7][0]); }
    document.querySelectorAll('[data-open]').forEach(function(el){ el.textContent = msg; el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open); });
  }
  listeners.push(renderOpen);

  /* ---- quick quote: three steps, P&C pattern, posts to FormSubmit ---- */
  var qf = document.getElementById('qqForm');
  if (qf) {
    var card = qf.closest('.qq-card');
    var steps = [].slice.call(qf.querySelectorAll('.qq-step'));
    var dots = [].slice.call(card.querySelectorAll('.qq-dots i'));
    var stepNo = card.querySelector('.qq-stepno');
    var picked = qf.querySelector('.qq-picked');
    var cur = Math.max(0, steps.findIndex(function(st){ return st.classList.contains('on'); }));
    var el = function(n){ return qf.querySelector('[name="' + n + '"]'); };
    var escH = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
    var paint = function(){
      if (stepNo) stepNo.textContent = T('Step ', 'Paso ') + (cur + 1) + T(' of 3', ' de 3');
      var c = qf.querySelector('input[name="project"]:checked');
      if (picked) picked.textContent = c ? c.parentElement.querySelector('b').textContent : '';
      el('language').value = LANG === 'es' ? 'Spanish' : 'English';
    };
    var show = function(n, focus){
      cur = n;
      steps.forEach(function(st, i){ st.classList.toggle('on', i === n); });
      dots.forEach(function(d, i){ d.classList.toggle('on', i <= n); });
      paint();
      if (focus) { var f = steps[n].querySelector('input:not([type=radio]), textarea'); if (f) f.focus(); }
    };
    listeners.push(paint);
    var flag = function(id, bad){ var f = document.getElementById(id); if (f) f.classList.toggle('err', bad); return !bad; };
    var v1 = function(){ var ok = !!qf.querySelector('input[name="project"]:checked'); steps[0].classList.toggle('err', !ok); return ok; };
    var v2 = function(){ return flag('qqf-loc', !el('location').value.trim()); };
    var v3 = function(){
      var ok = true;
      if (!flag('qqf-name', !el('name').value.trim())) ok = false;
      if (!flag('qqf-phone', el('phone').value.replace(/\D/g, '').length < 10)) ok = false;
      var em = el('email').value.trim();
      if (!flag('qqf-email', em !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))) ok = false;
      return ok;
    };
    qf.querySelectorAll('input[name="project"]').forEach(function(r){
      r.addEventListener('change', function(){ steps[0].classList.remove('err'); paint(); setTimeout(function(){ if (cur === 0) show(1, true); }, 180); });
    });
    qf.querySelectorAll('.qq-next').forEach(function(b){ b.addEventListener('click', function(){ if (cur === 1 && !v2()) return; show(cur + 1, true); }); });
    qf.querySelectorAll('.qq-back').forEach(function(b){ b.addEventListener('click', function(){ show(cur - 1, false); }); });
    qf.querySelectorAll('.qq-change').forEach(function(b){ b.addEventListener('click', function(){ show(0, false); var c = qf.querySelector('input[name="project"]:checked'); if (c) c.focus(); }); });
    qf.querySelectorAll('.qq-field input, .qq-field textarea').forEach(function(inp){
      inp.addEventListener('input', function(){ var f = inp.closest('.qq-field'); if (f) f.classList.remove('err'); });
    });
    var CALL = '<a href="tel:+14076522747">407-652-2747</a>';
    qf.addEventListener('submit', function(e){
      e.preventDefault();
      if (cur !== 2) { if (cur === 0 && !v1()) return; if (cur === 1 && !v2()) return; show(cur + 1, true); return; }
      if (!v3()) { var bad = qf.querySelector('.qq-field.err input'); if (bad) bad.focus(); return; }
      var done = document.getElementById('qqDone');
      var btn = qf.querySelector('.qq-send');
      var label = btn.innerHTML;
      btn.disabled = true; btn.textContent = T('Sending...', 'Enviando...');
      var first = escH(el('name').value.trim().split(/\s+/)[0]);
      var ph = escH(el('phone').value.trim());
      fetch(qf.getAttribute('action'), { method:'POST', headers:{'Accept':'application/json'}, body:new FormData(qf) })
        .then(function(r){ if (!r.ok) throw new Error('bad'); return r.json(); })
        .then(function(){
          qf.querySelectorAll('.qq-step').forEach(function(x){ x.style.display = 'none'; });
          var pr = card.querySelector('.qq-prog'); if (pr) pr.style.display = 'none';
          done.classList.remove('fail');
          done.innerHTML = T('<b>Thanks, ' + first + '.</b> We will call ' + ph + ' to set up a time to see the job. In a hurry? Call or text ' + CALL + '.',
                             '<b>Gracias, ' + first + '.</b> Lo llamamos al ' + ph + ' para fijar una hora y ver el trabajo. ¿Tiene prisa? Llame o escriba al ' + CALL + '.');
          done.classList.add('show'); done.focus();
        })
        .catch(function(){
          btn.disabled = false; btn.innerHTML = btn.getAttribute('data-' + LANG) || label;
          done.innerHTML = T('That did not go through. Please call or text ' + CALL + ' and we will take it from there.',
                             'No se pudo enviar. Llame o escriba al ' + CALL + ' y seguimos desde ahí.');
          done.classList.add('show', 'fail');
        });
    });
    paint();
  }

  /* ---- first language: ?lang=, then the saved choice, then the browser ---- */
  var pick = null;
  var q = /[?&]lang=(en|es)\b/.exec(window.location.search); if (q) pick = q[1];
  if (!pick) { try { pick = localStorage.getItem('dg-lang'); } catch (e) {} }
  if (!pick) { var nl = (navigator.languages && navigator.languages[0]) || navigator.language || 'en'; pick = /^es/i.test(nl) ? 'es' : 'en'; }
  if (pick === 'es') applyLang('es'); else { LANG = 'en'; listeners.forEach(function(fn){ fn(); }); }
})();
