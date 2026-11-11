/* EVESEL: cinematic scroll motion inspired by the supplied site recording.
   Original Penpot single-row product marquee lives in HTML and is cloned by main.js.
   Product sequence is grouped by colour only; no colour cards or controls. */
(() => {
  'use strict';
  const motionOff = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const video = document.querySelector('.hero-video');
  const progress = document.querySelector('.scroll-progress');
  const topLink = document.querySelector('.back-to-top');
  const manufacturing = document.querySelector('.manufacturing-section');
  const marquee = document.querySelector('.product-marquee');

  // Pause the original seamless Penpot product row when it is off-screen.
  if (marquee && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      marquee.classList.toggle('marquee-paused', !entry.isIntersecting);
    }, {threshold:0.01}).observe(marquee);
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
    '.brand-heading','.product-marquee','.portfolio-heading','.portfolio-card',
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
      // Gentle background scrub like the recording's large factory / product panels.
      if (manufacturing) {
        const b = manufacturing.getBoundingClientRect();
        if (b.bottom>0 && b.top<innerHeight) {
          const phase=(innerHeight-b.top)/(innerHeight+b.height);
          manufacturing.style.setProperty('--manufacturing-shift', ((phase-.5)*85).toFixed(1)+'px');
        }
      }
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
  document.addEventListener('visibilitychange',()=>{marquee?.classList.toggle('marquee-paused',document.hidden);schedule();});
  schedule();
})();
