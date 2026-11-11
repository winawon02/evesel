/* EVESEL — cinematic motion, triggered near the central viewport band.
   No entry animation on the header/footer. Category photos use an actual curtain.
   Category images remain visible without JavaScript / on reduced-motion devices. */
(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const video = document.querySelector('.hero-video');
  const manufacturing = document.querySelector('.manufacturing-section');
  const marquee = document.querySelector('.product-marquee');
  const topLink = document.querySelector('.back-to-top');
  const motionAllowed = !reducedMotion.matches;
  const hasObserver = 'IntersectionObserver' in window;

  if (marquee && hasObserver) {
    new IntersectionObserver(([entry]) => {
      marquee.classList.toggle('marquee-paused', !entry.isIntersecting);
    }, { threshold: .01 }).observe(marquee);
  }

  if (hero && video) {
    const constrained = Boolean(navigator.connection?.saveData);
    const showVideo = () => hero.classList.add('has-video');
    video.addEventListener('loadeddata', showVideo);
    video.addEventListener('playing', showVideo);
    video.addEventListener('error', () => hero.classList.remove('has-video'));
    const playState = () => {
      if (reducedMotion.matches || constrained || document.hidden || video.dataset.inview === 'false') {
        video.pause();
        if (reducedMotion.matches || constrained) hero.classList.remove('has-video');
        return;
      }
      video.play()?.catch?.(() => {});
    };
    if (hasObserver) {
      new IntersectionObserver(([entry]) => {
        video.dataset.inview = String(entry.isIntersecting);
        playState();
      }, {threshold:.02}).observe(hero);
    }
    document.addEventListener('visibilitychange',playState);
    reducedMotion.addEventListener?.('change',playState);
    playState();
  }

  // Central 40% viewport band. Effects begin after content actually reaches the viewer,
  // never as soon as the element merely peeks into the viewport.
  const revealSelectors = [
    '.brand-heading h2', '.brand-heading p', '.product-marquee',
    '.portfolio-heading h2',
    '.oem-section .split-photo', '.oem-section .split-copy', '.oem-option',
    '.manufacturing-inner h2', '.manufacturing-card',
    '.research-section .split-photo', '.research-section .split-copy',
    '.contact-inner'
  ];
  const reveals = [...new Set(revealSelectors.flatMap(selector =>
    Array.from(document.querySelectorAll(selector))))];
  const categories = Array.from(document.querySelectorAll('.portfolio-card'));
  const imageLayers = Array.from(document.querySelectorAll('.split-photo img, .manufacturing-card > img'));

  if (motionAllowed && hasObserver) {
    reveals.forEach((element,i) => {
      element.classList.add('motion-item');
      if (element.matches('.split-photo')) element.classList.add('motion-clip');
      element.style.setProperty('--motion-delay', (element.matches('.brand-heading p') ? 165 : (i % 3) * 85) + 'ms');
    });
    categories.forEach((card,i) => card.style.setProperty('--curtain-delay', (i * 135) + 'ms'));
    document.documentElement.classList.add('motion-enabled');

    const observerOptions={root:null,rootMargin:'-30% 0px -30% 0px',threshold:0.01};
    const entranceObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        entranceObserver.unobserve(entry.target);
      }
    }, observerOptions);
    for (const element of [...reveals,...categories]) entranceObserver.observe(element);
  }

  let framePending=false;
  const revealAtCenter = element => {
    if (element.classList.contains('is-visible')) return;
    const box=element.getBoundingClientRect();
    // Fallback for missed IntersectionObserver events after direct anchor navigation.
    if (box.top <= innerHeight * .62 && box.bottom >= innerHeight * .36) {
      element.classList.add('is-visible');
    }
  };
  const onFrame=()=>{
    framePending=false;
    const y=scrollY||0;
    topLink?.classList.toggle('visible', y > 1100);
    if (!reducedMotion.matches) {
      if (motionAllowed && hasObserver) [...reveals,...categories].forEach(revealAtCenter);
      if (manufacturing) {
        const box=manufacturing.getBoundingClientRect();
        if (box.bottom>0 && box.top<innerHeight) {
          const progress=(innerHeight-box.top)/(innerHeight+box.height);
          manufacturing.style.setProperty('--manufacturing-shift',((progress-.5)*85).toFixed(1)+'px');
        }
      }
      if (hero) {
        const shift=Math.min(y,hero.offsetHeight);
        hero.style.setProperty('--hero-shift',(shift*.14).toFixed(1)+'px');
        hero.style.setProperty('--hero-opacity',Math.max(.1,1-shift/(hero.offsetHeight*.85)).toFixed(3));
      }
      for (const image of imageLayers) {
        const box=image.parentElement.getBoundingClientRect();
        if (box.bottom<0 || box.top>innerHeight) continue;
        image.style.setProperty('--media-shift',
          (((box.top+box.height/2-innerHeight/2)/innerHeight)*-19).toFixed(1)+'px');
      }
    }
  };
  const schedule=()=>{
    if(framePending) return;
    framePending=true;
    requestAnimationFrame(onFrame);
  };
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',()=>{
    marquee?.classList.toggle('marquee-paused',document.hidden);
    schedule();
  });
  schedule();
})();
