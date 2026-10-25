(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  addEventListener('load', function(){ document.body.classList.add('loaded'); });
  setTimeout(function(){ document.body.classList.add('loaded'); }, 300);

  /* Dubai clock */
  var ck = document.getElementById('clock');
  function tick(){ try{ ck.textContent = new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Dubai'}).format(new Date()); }catch(e){} }
  tick(); setInterval(tick, 20000);

  /* band */
  var band = document.getElementById('band'), cls = ['','o','y'], h = '';
  var words = (band.dataset.words || 'List,Sell,Scale').split(',');
  for (var r=0;r<4;r++) words.forEach(function(w,i){ h += '<span class="'+cls[i%3]+'">'+w+'</span><em></em>'; });
  band.innerHTML = h + h;

  /* faces reel */
  var reel = document.getElementById('reel');
  if (reel && reel.dataset.faces){
    var base = reel.dataset.base || 'img/';
    var fh = reel.dataset.faces.split(',').map(function(f){ return '<figure><img src="'+base+f+'.jpg" alt="" loading="lazy"></figure>'; }).join('');
    reel.innerHTML = fh + fh;
  }

  /* reveal */
  var els = [].slice.call(document.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) els.forEach(function(e){ e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){
      if (!en.isIntersecting) return;
      var sib = [].slice.call(en.target.parentNode.children).filter(function(c){ return c.classList.contains('rv'); });
      en.target.style.transitionDelay = Math.min(sib.indexOf(en.target),4)*90 + 'ms';
      en.target.classList.add('in'); io.unobserve(en.target);
      en.target.querySelectorAll('[data-count]').forEach(count);
    }); }, {threshold:.12});
    els.forEach(function(e){ io.observe(e); });
    setTimeout(function(){ els.forEach(function(e){ if(!e.classList.contains('in')){ e.classList.add('in'); e.querySelectorAll('[data-count]').forEach(count);} }); }, 3000);
  }
  function count(el){
    if (el.dataset.done) return; el.dataset.done = 1;
    var end = +el.dataset.count, t0 = null;
    if (reduce){ el.textContent = end; return; }
    function step(t){ if(!t0) t0=t; var p=Math.min((t-t0)/1100,1); el.textContent=Math.round(end*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if (reduce) document.querySelectorAll('[data-count]').forEach(function(el){ el.textContent = el.dataset.count; });

  /* service rows: image follows cursor */
  var peek = document.getElementById('peek') || document.createElement('div'), pimg = peek.querySelector('img') || document.createElement('img'), mx=0,my=0,px=0,py=0,run=false;
  document.querySelectorAll('.row').forEach(function(row){
    row.addEventListener('mouseenter', function(){ pimg.src = row.dataset.img; peek.classList.add('on'); if(!run){run=true;loop();} });
    row.addEventListener('mouseleave', function(){ peek.classList.remove('on'); });
  });
  addEventListener('mousemove', function(e){ mx=e.clientX+150; my=e.clientY; });
  function loop(){ px+=(mx-px)*.16; py+=(my-py)*.16; peek.style.left=px+'px'; peek.style.top=py+'px'; requestAnimationFrame(loop); }

  /* hero parallax */
  if (!reduce){
    var hp = document.querySelector('.h-photo img'), hc = document.querySelector('.h-card');
    addEventListener('scroll', function(){ var y = scrollY; if (y < 1200){ hp.style.objectPosition = '50% ' + (50 + y*0.02) + '%'; hc.style.transform = 'rotate(-3deg) translateY(' + (-y*0.08) + 'px)'; } }, {passive:true});
  }
})();

/* booking drawer: opens Calendly when <html data-cal> holds the event URL; otherwise [data-book] links keep their WhatsApp href */
(function(){
  var cal = document.documentElement.dataset.cal;
  if (!cal) return;
  var wa = 'https://wa.me/971551397867?text=' + encodeURIComponent("Hi Yahia, I'd like to book the free 30-minute audit.");
  var box = document.createElement('div');
  box.className = 'book'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label','Book a free audit');
  box.innerHTML = '<div class="book-bg"><span>Let\'s<br>talk<i>.</i></span></div>' +
    '<div class="book-panel"><div class="book-head"><div><p class="mono" style="color:var(--muted);margin-bottom:6px">Free audit · Qanat</p><h2>Pick a slot</h2>' +
    '<ul><li>30 min</li><li>Video or WhatsApp call</li><li>No slides</li><li>Written plan after</li></ul></div>' +
    '<button class="book-x" type="button" aria-label="Close">×</button></div>' +
    '<div class="book-frame"><div class="wait">Loading calendar…</div></div>' +
    '<div class="book-alt">No slot that works? <a href="' + wa + '" target="_blank" rel="noopener">Message me on WhatsApp</a></div></div>';
  document.body.appendChild(box);
  var frame = box.querySelector('.book-frame'), last = null;
  function open(e){
    e.preventDefault(); last = document.activeElement;
    if (!frame.querySelector('iframe')){
      var q = 'embed_domain=' + location.hostname + '&embed_type=Inline&hide_gdpr_banner=1&background_color=f7f5ef&text_color=0d0d0f&primary_color=f2361d&utm_source=qanatstudio&utm_content=' + encodeURIComponent(location.pathname);
      var f = document.createElement('iframe');
      f.src = cal + (cal.indexOf('?') < 0 ? '?' : '&') + q; f.title = 'Book a free audit';
      f.onload = function(){ var w = frame.querySelector('.wait'); if (w) w.remove(); };
      frame.appendChild(f);
    }
    box.classList.add('on'); document.body.style.overflow = 'hidden';
    box.querySelector('.book-x').focus();
  }
  function close(){ box.classList.remove('on'); document.body.style.overflow = ''; if (last) last.focus(); }
  document.querySelectorAll('[data-book]').forEach(function(a){ a.addEventListener('click', open); });
  box.querySelector('.book-x').addEventListener('click', close);
  box.querySelector('.book-bg').addEventListener('click', close);
  addEventListener('keydown', function(e){ if (e.key === 'Escape' && box.classList.contains('on')) close(); });
})();
