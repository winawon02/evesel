/* EVESEL motion engine: reusable CSS types / delay classes only.
   One trigger rule for every element: its TOP reaches the viewport center.
   OEM/ODM is triggered once as a group, so the CTA never waits independently. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const video = hero?.querySelector('.hero-video');
  const marquee = document.querySelector('.product-marquee');
  const topLink = document.querySelector('.back-to-top');
  const manufacturing = document.querySelector('.manufacturing-section');
  const imageLayers = [...document.querySelectorAll('.split-photo img,.manufacturing-card>img')];

  if (marquee && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      marquee.classList.toggle('marquee-paused', !entry.isIntersecting);
    }, {threshold:0.01}).observe(marquee);
  }
  if (hero && video) {
    const saveData = Boolean(navigator.connection?.saveData);
    const updatePlayback = () => {
      if (reduce.matches || saveData || document.hidden || video.dataset.inview === 'false') {
        video.pause();
        if (reduce.matches || saveData) hero.classList.remove('has-video');
        return;
      }
      video.play()?.catch?.(() => {});
    };
    video.addEventListener('loadeddata', () => hero.classList.add('has-video'));
    video.addEventListener('playing', () => hero.classList.add('has-video'));
    video.addEventListener('error', () => hero.classList.remove('has-video'));
    if ('IntersectionObserver' in window)
      new IntersectionObserver(([entry]) => {
        video.dataset.inview = String(entry.isIntersecting);
        updatePlayback();
      }, {threshold:.02}).observe(hero);
    document.addEventListener('visibilitychange',updatePlayback);
    reduce.addEventListener?.('change',updatePlayback);
    updatePlayback();
  }

  const targets = [...document.querySelectorAll(
    '.motion--fade-up,.motion--media,.motion--curtain,.motion--group'
  )];
  const motionEnabled = !reduce.matches && targets.length > 0;
  if (motionEnabled) document.documentElement.classList.add('motion-ready');

  // A consistent rule: the TOP of an element crosses 50% viewport height.
  // Never wait for the center of a tall card or for the last button itself.
  const revealAtCenter = () => {
    if (!motionEnabled) return;
    const center = innerHeight * .5;
    for (const element of targets) {
      if (element.classList.contains('is-visible')) continue;
      if (element.getBoundingClientRect().top <= center) element.classList.add('is-visible');
    }
  };

  let frameRequested = false;
  const onFrame = () => {
    frameRequested = false;
    const y = scrollY || 0;
    topLink?.classList.toggle('visible', y>1100);
    revealAtCenter();
    if (reduce.matches) return;
    if (hero) {
      const shift=Math.min(y,hero.offsetHeight);
      hero.style.setProperty('--hero-shift',(shift*.14).toFixed(1)+'px');
      hero.style.setProperty('--hero-opacity',Math.max(.1,1-shift/(hero.offsetHeight*.85)).toFixed(3));
    }
    if (manufacturing) {
      const box=manufacturing.getBoundingClientRect();
      if (box.bottom>0 && box.top<innerHeight) {
        const p=(innerHeight-box.top)/(innerHeight+box.height);
        manufacturing.style.setProperty('--manufacturing-shift',((p-.5)*85).toFixed(1)+'px');
      }
    }
    for (const image of imageLayers) {
      const rect=image.parentElement.getBoundingClientRect();
      if (rect.bottom<0 || rect.top>innerHeight) continue;
      image.style.setProperty('--media-shift',
        (((rect.top+rect.height/2-innerHeight/2)/innerHeight)*-19).toFixed(1)+'px');
    }
  };
  const schedule=()=>{
    if (frameRequested) return;
    frameRequested=true;
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
