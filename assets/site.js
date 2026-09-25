/* DG Design Contracting site script. Mechanics from builda-mechanics.md, restyled. */
if ('scrollRestoration' in history) { history.scrollRestoration = 'auto'; }
(function(){
  var bootHash = window.location.hash;
  if (bootHash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
    var goHash = function(){ var t = null; try { t = document.querySelector(bootHash); } catch (e) {} if (t) t.scrollIntoView({block:'start'}); };
    if (document.readyState === 'complete') goHash(); else window.addEventListener('load', goHash);
  }

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

  /* Sideways rails (reviews, recent jobs): arrow buttons step one card */
  document.querySelectorAll('[data-rail-prev],[data-rail-next]').forEach(function(btn){
    var rail = document.getElementById(btn.getAttribute('data-rail-prev') || btn.getAttribute('data-rail-next'));
    if (!rail) return;
    var dir = btn.hasAttribute('data-rail-prev') ? -1 : 1;
    btn.addEventListener('click', function(){
      var c = rail.firstElementChild;
      var step = c ? c.getBoundingClientRect().width + 16 : 320;
      rail.scrollBy({left: dir * step, behavior:'smooth'});
    });
  });

  /* Open-now line + today's row in every hours table (Lake Mary time) */
  var HRS = {0:[10,17],1:[8,18],2:[8,18],3:[8,18],4:[8,18],5:[8,18],6:[6,18]};
  var fmt = function(h){ return (h % 12 || 12) + (h < 12 ? ' AM' : ' PM'); };
  try {
    var parts = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York', weekday:'short', hour:'numeric', minute:'numeric', hour12:false}).formatToParts(new Date());
    var get = function(t){ var p = parts.filter(function(x){ return x.type === t; })[0]; return p ? p.value : ''; };
    var day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday'));
    var now = (parseInt(get('hour'), 10) % 24) + parseInt(get('minute'), 10) / 60;
    var msg, open = false;
    if (now >= HRS[day][0] && now < HRS[day][1]) { open = true; msg = 'Open now, until ' + fmt(HRS[day][1]); }
    else if (now < HRS[day][0]) { msg = 'Closed now. Opens today at ' + fmt(HRS[day][0]); }
    else { var nd = (day + 1) % 7; msg = 'Closed now. Opens tomorrow at ' + fmt(HRS[nd][0]); }
    document.querySelectorAll('[data-open]').forEach(function(el){ el.textContent = msg; el.classList.add(open ? 'is-open' : 'is-closed'); });
    document.querySelectorAll('.hours tr[data-days]').forEach(function(tr){
      if (tr.getAttribute('data-days').split(',').indexOf(String(day)) > -1) tr.classList.add('today');
    });
  } catch (e) {}

  /* Quick quote: three steps, P&C pattern, posts to FormSubmit */
  var qf = document.getElementById('qqForm');
  if (qf) {
    var steps = [].slice.call(qf.querySelectorAll('.qq-step'));
    var dots = [].slice.call(qf.querySelectorAll('.qq-dots i'));
    var stepNo = qf.querySelector('.qq-stepno b');
    var cur = 0;
    var el = function(n){ return qf.querySelector('[name="' + n + '"]'); };
    var show = function(n, focus){
      cur = n;
      steps.forEach(function(st, i){ st.classList.toggle('on', i === n); });
      dots.forEach(function(d, i){ d.classList.toggle('on', i <= n); });
      if (stepNo) stepNo.textContent = n + 1;
      if (focus) { var f = steps[n].querySelector('input:not([type=radio]), textarea'); if (f) f.focus(); }
    };
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
      r.addEventListener('change', function(){ steps[0].classList.remove('err'); setTimeout(function(){ if (cur === 0) show(1, true); }, 180); });
    });
    qf.querySelectorAll('.qq-next').forEach(function(b){ b.addEventListener('click', function(){ if (cur === 1 && !v2()) return; show(cur + 1, true); }); });
    qf.querySelectorAll('.qq-back').forEach(function(b){ b.addEventListener('click', function(){ show(cur - 1, false); }); });
    qf.querySelectorAll('.qq-field input, .qq-field textarea').forEach(function(inp){
      inp.addEventListener('input', function(){ var f = inp.closest('.qq-field'); if (f) f.classList.remove('err'); });
    });
    qf.addEventListener('submit', function(e){
      e.preventDefault();
      if (cur !== 2) { if (cur === 0 && !v1()) return; if (cur === 1 && !v2()) return; show(cur + 1, true); return; }
      if (!v3()) { var bad = qf.querySelector('.qq-field.err input'); if (bad) bad.focus(); return; }
      var done = document.getElementById('qqDone');
      var btn = qf.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Sending...';
      fetch(qf.getAttribute('action'), { method:'POST', headers:{'Accept':'application/json'}, body:new FormData(qf) })
        .then(function(r){ if (!r.ok) throw new Error('bad'); return r.json(); })
        .then(function(){
          qf.querySelectorAll('.qq-step, .qq-prog').forEach(function(x){ x.style.display = 'none'; });
          done.innerHTML = '<b>Got it. Thank you.</b> We will call you to set up a time to see the job. In a hurry? Call or text <a href="tel:+14076522747">407-652-2747</a>.';
          done.classList.add('show'); done.focus();
        })
        .catch(function(){
          btn.disabled = false; btn.textContent = 'Request my estimate';
          done.innerHTML = 'That did not go through. Please call or text <a href="tel:+14076522747">407-652-2747</a> and we will take it from there.';
          done.classList.add('show', 'fail');
        });
    });
  }
})();
