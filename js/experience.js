/* EVESEL — background film, curated product colours and scroll motion. */
(() => {
  'use strict';
  const motionOff = matchMedia('(prefers-reduced-motion: reduce)');
  const gallery = document.querySelector('#palette-gallery');
  const hero = document.querySelector('.hero');
  const video = document.querySelector('.hero-video');
  const progress = document.querySelector('.scroll-progress');
  const topLink = document.querySelector('.back-to-top');
  const groups = [
    { name:'블러쉬 & 핑크', en:'BLUSH & PINK', bg:'#f9eeed', ink:'#a86878', items:[5,6,14,25,26,27,28,29,30,32,36,37] },
    { name:'아쿠아 & 민트', en:'AQUA & MINT', bg:'#eaf6f3', ink:'#347c77', items:[17,19,20,22,24,33] },
    { name:'오프화이트 & 크림', en:'WHITE & CREAM', bg:'#f5f1ea', ink:'#877766', items:[10,12,13,15,16,18,21,23,31,34,35,38] },
    { name:'블루 & 코발트', en:'BLUE & COBALT', bg:'#eaf0f9', ink:'#486ca4', items:[1,7,11] },
    { name:'골드 & 다크', en:'GOLD & DARK', bg:'#f4eee7', ink:'#947148', items:[2,3,4,8,9] }
  ];
  const pad = n => String(n).padStart(2,'0');

  if (gallery) {
    const viewport = document.createElement('div');
    viewport.className = 'palette-viewport';
    viewport.tabIndex = 0;
    viewport.setAttribute('role','region');
    viewport.setAttribute('aria-label','컬러별 제품 갤러리');
    const track = document.createElement('div');
    track.className = 'palette-track';
    groups.forEach((group,i) => {
      const card = document.createElement('article');
      card.className = 'palette-group';
      card.style.setProperty('--palette-bg',group.bg);
      card.style.setProperty('--palette-ink',group.ink);
      card.setAttribute('aria-label',group.name + ' 제품 ' + group.items.length + '종');
      card.innerHTML = '<div class="palette-meta"><span>0'+(i+1)+' / 0'+groups.length+'</span><span class="palette-rule"></span><span>'+pad(group.items.length)+' PRODUCTS</span></div>'+
        '<div class="palette-name"><span class="palette-swatch" aria-hidden="true"></span><h3 data-ko="'+group.name+'" data-en="'+group.en+'">'+(document.documentElement.lang === 'en' ? group.en : group.name)+'</h3></div>'+
        '<div class="palette-products"></div><span class="palette-watermark" aria-hidden="true">'+group.en+'</span>';
      const photos = card.querySelector('.palette-products');
      group.items.forEach((id,j) => {
        const img = document.createElement('img');
        img.src = './assets/products/product-' + pad(id) + '.webp';
        img.alt = group.name + ' 제품 ' + (j+1);
        img.width = 140;
        img.height = 190;
        img.loading = i === 0 ? 'eager' : 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', () => {
          if (img.dataset.fallback) return;
          img.dataset.fallback = 'yes';
          img.src = './assets/product-' + pad(((id-1)%12)+1) + '.png';
        });
        photos.appendChild(img);
      });
      track.appendChild(card);
    });
    viewport.appendChild(track);
    gallery.appendChild(viewport);
    const dots = document.querySelector('#palette-dots');
    const counter = document.querySelector('#palette-current');
    const cards = Array.from(track.children);
    const centerOf = card => card.getBoundingClientRect().left - viewport.getBoundingClientRect().left + viewport.scrollLeft + card.clientWidth / 2;
    const current = () => {
      const center = viewport.scrollLeft + viewport.clientWidth/2;
      return cards.reduce((best,card,i) => {
        const diff = Math.abs(centerOf(card)-center);
        return diff < best.diff ? {index:i,diff} : best;
      },{index:0,diff:Infinity}).index;
    };
    const go = i => {
      cards[Math.max(0,Math.min(cards.length-1,i))].scrollIntoView({inline:'center',block:'nearest',behavior:motionOff.matches?'auto':'smooth'});
    };
    if (dots) groups.forEach((group,i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'palette-dot';
      button.setAttribute('aria-label',group.name + ' 제품으로 이동');
      button.addEventListener('click',()=>go(i));
      dots.appendChild(button);
    });
    const sync = () => {
      const index = current();
      if (counter) counter.textContent = pad(index+1) + ' / ' + pad(cards.length);
      dots?.querySelectorAll('button').forEach((el,i) => {
        el.classList.toggle('active',index===i);
        el.setAttribute('aria-current',index===i?'true':'false');
      });
    };
    gallery.querySelectorAll('.palette-step').forEach(button => {
      button.addEventListener('click',()=>go(current()+Number(button.dataset.direction)));
    });
    viewport.addEventListener('keydown',event=>{
      if (event.key!=='ArrowLeft' && event.key!=='ArrowRight') return;
      event.preventDefault();
      go(current()+(event.key==='ArrowRight'?1:-1));
    });
    viewport.addEventListener('scroll',sync,{passive:true});
    addEventListener('resize',sync,{passive:true});
    sync();
  }

  if (hero && video) {
    const constrained = !!navigator.connection?.saveData;
    const showFilm = () => hero.classList.add('has-video');
    video.addEventListener('loadeddata',showFilm);
    video.addEventListener('playing',showFilm);
    video.addEventListener('error',()=>hero.classList.remove('has-video'));
    const playState = () => {
      if (motionOff.matches || constrained || document.hidden || video.dataset.inview==='false') {
        video.pause();
        if (motionOff.matches || constrained) hero.classList.remove('has-video');
        return;
      }
      const play = video.play();
      play?.catch?.(()=>{});
    };
    if ('IntersectionObserver' in window)
      new IntersectionObserver(([entry])=>{
        video.dataset.inview = String(entry.isIntersecting);
        playState();
      },{threshold:.02}).observe(hero);
    document.addEventListener('visibilitychange',playState);
    motionOff.addEventListener?.('change',playState);
    playState();
  }

  const selectors = [
    '.brand-heading','.palette-intro','.portfolio-heading','.portfolio-card',
    '.oem-section .split-copy','.oem-option','.oem-section .split-photo',
    '.manufacturing-inner h2','.manufacturing-card',
    '.research-section .split-copy','.research-section .split-photo',
    '.contact-inner','.footer-company','.footer-nav'
  ];
  const animated = [...new Set(selectors.flatMap(s=>Array.from(document.querySelectorAll(s))))];
  const imageLayers = [...document.querySelectorAll('.split-photo img,.manufacturing-card>img')];
  if ('IntersectionObserver' in window && !motionOff.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }),{threshold:.07,rootMargin:'0px 0px -18px 0px'});
    animated.forEach((el,i)=>{
      el.classList.add('motion-item');
      if (el.matches('.split-photo,.portfolio-card')) el.classList.add('motion-clip');
      el.style.setProperty('--motion-delay',((i%3)*95)+'ms');
      observer.observe(el);
    });
    document.documentElement.classList.add('motion-enabled');
  }
  let requested = false;
  const onFrame = () => {
    requested = false;
    const y = scrollY || 0;
    const max = Math.max(1,document.documentElement.scrollHeight-innerHeight);
    if (progress) progress.style.transform = 'scaleX('+Math.min(1,Math.max(0,y/max))+')';
    topLink?.classList.toggle('visible',y>1100);
    if (!motionOff.matches) {
      if (hero) {
        const shift = Math.min(y,hero.offsetHeight);
        hero.style.setProperty('--hero-shift',(shift*.14).toFixed(1)+'px');
        hero.style.setProperty('--hero-opacity',Math.max(.1,1-shift/(hero.offsetHeight*.85)).toFixed(3));
      }
      for (const img of imageLayers) {
        const b = img.parentElement.getBoundingClientRect();
        if (b.bottom<0 || b.top>innerHeight) continue;
        img.style.setProperty('--media-shift',(((b.top+b.height/2-innerHeight/2)/innerHeight)*-19).toFixed(1)+'px');
      }
    }
  };
  const schedule = () => {
    if (requested) return;
    requested=true;
    requestAnimationFrame(onFrame);
  };
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  schedule();
})();
