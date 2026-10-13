const canvas=document.getElementById("webgl");
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,100);
camera.position.set(0,0,7.8);
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;

const root=new THREE.Group();scene.add(root);
const ambient=new THREE.Group();root.add(ambient);

// Deep-space particle field
const particleGeo=new THREE.BufferGeometry(), n=1500, arr=new Float32Array(n*3);
for(let i=0;i<n;i++){
  const r=3.5+Math.random()*11;
  const a=Math.random()*Math.PI*2;
  arr[i*3]=Math.cos(a)*r;
  arr[i*3+1]=(Math.random()-.5)*9;
  arr[i*3+2]=Math.sin(a)*r;
}
particleGeo.setAttribute("position",new THREE.BufferAttribute(arr,3));
const particles=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:0x9aa7ff,size:.014,transparent:true,opacity:.55,depthWrite:false}));
ambient.add(particles);

// Hero wire geometry: kept subtle so the portrait remains the focal point.
const torus=new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.55,.045,160,12,2,3),
  new THREE.MeshBasicMaterial({color:0x8a57ff,wireframe:true,transparent:true,opacity:.30,depthWrite:false})
);
torus.position.set(2.75,.12,-1.2);ambient.add(torus);

const ico=new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.4,2),
  new THREE.MeshBasicMaterial({color:0x59618c,wireframe:true,transparent:true,opacity:.16,depthWrite:false})
);
ico.position.set(-2.9,-.65,-2.3);ambient.add(ico);

const halo=new THREE.Mesh(
  new THREE.RingGeometry(1.55,1.59,96),
  new THREE.MeshBasicMaterial({color:0x9b6cff,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false})
);
halo.rotation.x=Math.PI/2;halo.position.set(2.35,-.18,-1.4);ambient.add(halo);

let tx=0,ty=0,scrollTarget=0,scrollCurrent=0;
const glow=document.querySelector(".cursor-glow");
addEventListener("pointermove",e=>{
  tx=(e.clientX/innerWidth-.5)*2;
  ty=(e.clientY/innerHeight-.5)*2;
  if(glow){glow.style.left=e.clientX+"px";glow.style.top=e.clientY+"px";}
  document.documentElement.style.setProperty("--mx",tx.toFixed(3));
  document.documentElement.style.setProperty("--my",ty.toFixed(3));
});
addEventListener("scroll",()=>{scrollTarget=Math.min(scrollY/900,1);},{passive:true});
addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

function animate(t){
  requestAnimationFrame(animate);
  const time=t*.001;
  scrollCurrent+=(scrollTarget-scrollCurrent)*.035;
  root.rotation.y+=(tx*.12-root.rotation.y)*.025;
  root.rotation.x+=(-ty*.055-root.rotation.x)*.025;
  root.position.y+=(scrollCurrent*.18-root.position.y)*.025;
  particles.rotation.y=time*.012;
  particles.rotation.x=Math.sin(time*.08)*.02;
  torus.rotation.x=time*.16;
  torus.rotation.y=time*.23;
  torus.rotation.z=time*.07;
  ico.rotation.x=time*.10;
  ico.rotation.y=time*.14;
  halo.rotation.z=time*.08;
  renderer.render(scene,camera);
}
animate(0);

// Lightweight reveal system for real content sections.
const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){
    entry.target.style.opacity="1";
    entry.target.style.transform="translateY(0)";
    reveal.unobserve(entry.target);
  }
}),{threshold:.12});
document.querySelectorAll(".case,.timeline article,.service-list article,.stats div").forEach(el=>{
  el.style.transition="opacity .8s ease,transform .8s ease";
  el.style.opacity="0";
  el.style.transform="translateY(18px)";
  reveal.observe(el);
});

/* ===== V10 PREMIUM WEBGL LAYER ===== */
(() => {
  if (!window.THREE || !renderer || !scene) return;

  const isLowPower = matchMedia('(max-width: 700px)').matches ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  // Secondary particle layer: smaller, slower particles create depth without stealing focus.
  const depthCount = isLowPower ? 260 : 620;
  const depthGeo = new THREE.BufferGeometry();
  const depthArr = new Float32Array(depthCount * 3);
  const depthSize = new Float32Array(depthCount);
  for (let i = 0; i < depthCount; i++) {
    const r = 2.5 + Math.random() * 9;
    const a = Math.random() * Math.PI * 2;
    depthArr[i * 3] = Math.cos(a) * r;
    depthArr[i * 3 + 1] = (Math.random() - .5) * 7;
    depthArr[i * 3 + 2] = Math.sin(a) * r - 2;
    depthSize[i] = .4 + Math.random() * 1.2;
  }
  depthGeo.setAttribute('position', new THREE.BufferAttribute(depthArr, 3));
  const depthMat = new THREE.PointsMaterial({
    color: 0xc2b7ff,
    size: isLowPower ? .018 : .024,
    transparent: true,
    opacity: isLowPower ? .28 : .38,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const depthParticles = new THREE.Points(depthGeo, depthMat);
  depthParticles.position.z = -1.8;
  ambient.add(depthParticles);

  // Three thin orbital curves add a more intentional sci-fi ring system.
  const orbitGroup = new THREE.Group();
  orbitGroup.position.set(2.05, .10, -1.5);
  orbitGroup.rotation.set(.28, -.18, -.25);
  ambient.add(orbitGroup);
  const orbitMats = [
    new THREE.LineBasicMaterial({color:0x9a6cff,transparent:true,opacity:.18}),
    new THREE.LineBasicMaterial({color:0x6d8cff,transparent:true,opacity:.12}),
    new THREE.LineBasicMaterial({color:0xc4b6ff,transparent:true,opacity:.08})
  ];
  [1.72,2.02,2.34].forEach((r, i) => {
    const pts=[];
    for(let j=0;j<=160;j++){
      const a=j/160*Math.PI*2;
      pts.push(new THREE.Vector3(Math.cos(a)*r, Math.sin(a)*r*.28, Math.sin(a)*.18));
    }
    const geo=new THREE.BufferGeometry().setFromPoints(pts);
    orbitGroup.add(new THREE.Line(geo,orbitMats[i]));
  });

  // A subtle moving light streak gives the background a sense of forward motion.
  const streakCount = isLowPower ? 18 : 34;
  const streakGeo = new THREE.BufferGeometry();
  const streakArr = new Float32Array(streakCount * 6);
  for(let i=0;i<streakCount;i++){
    const x=(Math.random()-.5)*14;
    const y=(Math.random()-.5)*7;
    const z=-1-Math.random()*8;
    const len=.08+Math.random()*.32;
    streakArr.set([x,y,z,x+len,y,z],i*6);
  }
  streakGeo.setAttribute('position',new THREE.BufferAttribute(streakArr,3));
  const streaks=new THREE.LineSegments(streakGeo,new THREE.LineBasicMaterial({color:0x8b7dff,transparent:true,opacity:.16,depthWrite:false}));
  ambient.add(streaks);

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let v10Time=0;
  function premiumTick(){
    if(prefersReduced) return;
    v10Time += .008;
    depthParticles.rotation.y = v10Time * .18;
    depthParticles.rotation.x = Math.sin(v10Time * .7) * .025;
    orbitGroup.rotation.z += .0009;
    orbitGroup.rotation.y = -.18 + Math.sin(v10Time * .45) * .035;
    streaks.rotation.y += .00055;
    streaks.position.x = Math.sin(v10Time * .55) * .08;
    requestAnimationFrame(premiumTick);
  }
  premiumTick();
})();

/* ===== V11 INTERACTION REFINEMENT ===== */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;
  const cards = document.querySelectorAll('.case,.service-list article,.timeline article');

  if (!reduced && finePointer) {
    cards.forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-y*2.2).toFixed(2)}deg) rotateY(${(x*2.2).toFixed(2)}deg) translateY(-5px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform=''; });
    });
  }

  // Keep renderer quality adaptive after resize without making mobile needlessly heavy.
  const resizeQuality = () => {
    if (!renderer) return;
    const mobile = innerWidth <= 700;
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.7));
  };
  addEventListener('resize', resizeQuality, {passive:true});
  resizeQuality();
})();


/* ===== V24 REAL PROJECT + WEBGL DEPTH POLISH ===== */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const depthEl = document.createElement('div');
  depthEl.className = 'webgl-depth-v24';
  document.body.appendChild(depthEl);

  // A restrained mouse/scroll depth layer: no new heavy geometry.
  let sx = 0, sy = 0, ss = 0;
  addEventListener('pointermove', e => {
    if (!fine || reduced) return;
    sx = (e.clientX / innerWidth - .5);
    sy = (e.clientY / innerHeight - .5);
    depthEl.style.transform = `translate3d(${(sx*8).toFixed(2)}px,${(sy*6).toFixed(2)}px,0)`;
  }, {passive:true});
  addEventListener('scroll', () => {
    if (reduced) return;
    ss = Math.min(scrollY / Math.max(innerHeight,1), 2);
    depthEl.style.opacity = String(Math.max(.45, 1 - ss*.12));
  }, {passive:true});

  // Keep premium layers synchronized with the main renderer without another RAF loop.
  const baseRender = renderer.render.bind(renderer);
  renderer.render = function(sceneArg, cameraArg){
    if (!reduced) {
      orbitGroupSafe();
    }
    return baseRender(sceneArg, cameraArg);
  };
  function orbitGroupSafe(){
    // Intentional no-op hook: keeps this layer lightweight and avoids a second animation loop.
  }
})();

// V17 expertise filter
(function(){
  const filters=document.querySelectorAll('.expertise-filter button');
  const cards=document.querySelectorAll('.expertise-grid article[data-skill]');
  if(!filters.length||!cards.length)return;
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    const filter=btn.dataset.filter;
    filters.forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-selected',b===btn?'true':'false')});
    cards.forEach(card=>card.classList.toggle('is-hidden',filter!=='all'&&card.dataset.skill!==filter));
  }));
})();


/* ===== V19 FINAL UI POLISH ===== */
(() => {
  const progress = document.querySelector('.scroll-progress span');
  const nav = document.querySelector('.nav');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateScrollUI = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const pct = Math.min(100, Math.max(0, (scrollY / max) * 100));
    if (progress) progress.style.width = pct + '%';
    if (nav) nav.classList.toggle('is-scrolled', scrollY > 28);
  };

  addEventListener('scroll', updateScrollUI, {passive:true});
  addEventListener('resize', updateScrollUI, {passive:true});
  updateScrollUI();

  // Subtle pointer parallax on the hero only; disabled for touch/reduced motion.
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    const hero = document.querySelector('.hero');
    const copy = document.querySelector('.hero-copy');
    const portrait = document.querySelector('.portrait-stage');

    if (hero && copy && portrait) {
      let raf = 0;
      hero.addEventListener('pointermove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = hero.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - .5;
          const y = (e.clientY - r.top) / r.height - .5;
          copy.style.setProperty('--hero-px', (x * -3).toFixed(2) + 'px');
          copy.style.setProperty('--hero-py', (y * -2).toFixed(2) + 'px');
          portrait.style.setProperty('--hero-px', (x * 6).toFixed(2) + 'px');
          portrait.style.setProperty('--hero-py', (y * 4).toFixed(2) + 'px');
          raf = 0;
        });
      }, {passive:true});

      hero.addEventListener('pointerleave', () => {
        copy.style.setProperty('--hero-px','0px');
        copy.style.setProperty('--hero-py','0px');
        portrait.style.setProperty('--hero-px','0px');
        portrait.style.setProperty('--hero-py','0px');
      }, {passive:true});
    }
  }
})();

/* Keep V19 hero parallax additive rather than replacing the existing transforms. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    @media (min-width:901px) and (pointer:fine) and (prefers-reduced-motion:no-preference){
      .hero-copy{translate:var(--hero-px,0) var(--hero-py,0)}
      .portrait-stage{translate:var(--hero-px,0) var(--hero-py,0)}
    }
  `;
  document.head.appendChild(style);
})();


/* ===== V22 FINAL QA ===== */
(() => {
  const navLinks = [...document.querySelectorAll('.nav nav a[href^="#"]')];
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && navLinks.length && sections.length) {
    const linkMap = new Map(
      navLinks.map(a => [a.getAttribute('href').slice(1), a])
    );

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => a.classList.remove('is-current'));
        const active = linkMap.get(entry.target.id);
        if (active) active.classList.add('is-current');
      });
    }, {rootMargin:'-25% 0px -65% 0px', threshold:0});

    sections.forEach(section => observer.observe(section));
  }

  // Keyboard support for the expertise tabs.
  const tabs = [...document.querySelectorAll('.expertise-filter button[role="tab"]')];
  tabs.forEach((tab, index) => {
    tab.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = e.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : (index - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });
})();


/* ===== V23 PREMIUM MICRO-INTERACTION + PERFORMANCE PASS ===== */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;

  // Stop expensive WebGL work when the tab is backgrounded.
  let pageVisible = !document.hidden;
  document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; });

  // Keep the existing renderer loop lightweight when the page is not visible.
  const originalRender = renderer.render.bind(renderer);
  renderer.render = (...args) => {
    if (pageVisible) originalRender(...args);
  };

  // Refined magnetic hover for primary CTAs; touch and reduced-motion stay untouched.
  if (!reduced && finePointer) {
    document.querySelectorAll('.primary, .mini-contact, .text-link, .underline-link').forEach(el => {
      let raf = 0;
      el.addEventListener('pointermove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - .5;
          const y = (e.clientY - r.top) / r.height - .5;
          el.style.setProperty('--mag-x', `${(x * 5).toFixed(2)}px`);
          el.style.setProperty('--mag-y', `${(y * 4).toFixed(2)}px`);
          raf = 0;
        });
      }, {passive:true});
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--mag-x','0px');
        el.style.setProperty('--mag-y','0px');
      }, {passive:true});
    });
  }

  // Stronger keyboard visibility without changing the visual system.
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab') document.documentElement.classList.add('keyboard-nav');
  });
  document.addEventListener('pointerdown', () => document.documentElement.classList.remove('keyboard-nav'), {passive:true});
})();

/* ===== V28 NON-HERO SECTION REVEAL ===== */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.about-layout > div, .stats div, .expertise-grid article, .case, .timeline article, .contact-buttons .primary, .socials a');
  if (reduced || !('IntersectionObserver' in window)) return;
  targets.forEach((el, i) => { el.classList.add('reveal-ready'); el.style.transitionDelay = `${Math.min(i % 5, 4) * 45}ms`; });
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      io.unobserve(entry.target);
    });
  }, {threshold:0.12, rootMargin:'0px 0px -7% 0px'});
  targets.forEach(el => io.observe(el));
})();

/* ===== V36 NAVIGATION POLISH ===== */
(() => {
  const progress = document.querySelector('.scroll-progress span');
  const back = document.querySelector('.back-top');
  const links = [...document.querySelectorAll('.nav nav a[href^="#"]')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const update = () => {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - innerHeight);
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, scrollY / max * 100))}%`;
    if (back) back.classList.toggle('visible', scrollY > innerHeight * .65);
    const y = scrollY + innerHeight * .28;
    let current = sections[0];
    sections.forEach(sec => { if (sec.offsetTop <= y) current = sec; });
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${current.id}`));
  };
  addEventListener('scroll', update, {passive:true});
  addEventListener('resize', update, {passive:true});
  back?.addEventListener('click', () => scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
  update();
})();


/* ===== V37 CINEMATIC STORM LIGHTNING CUE ===== */
(() => {
  const storm = document.querySelector('.storm-ocean-v37');
  if (!storm || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let timer;
  const flash = () => {
    if (document.hidden) { timer = setTimeout(flash, 1800 + Math.random()*3200); return; }
    storm.classList.remove('lightning-flash'); void storm.offsetWidth; storm.classList.add('lightning-flash');
    timer = setTimeout(flash, 5200 + Math.random()*7600);
  };
  timer = setTimeout(flash, 2200 + Math.random()*2800);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { clearTimeout(timer); timer = setTimeout(flash, 1600 + Math.random()*2600); } });
})();
