document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     AMBIENT FLOATING HEARTS + SPARKLES
  ========================================================= */
  const ambientLayer = document.getElementById('ambientLayer');
  const heartSVG = `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 21s-6.7-4.3-9.3-8.2C.6 9.6 1.6 5.8 5 4.6c2.1-.7 4.1.2 5.3 2 .3.4.9.4 1.2 0 1.2-1.8 3.2-2.7 5.3-2 3.4 1.2 4.4 5 2.3 8.2C18.7 16.7 12 21 12 21z" fill="#ff8fab"/></svg>`;

  function spawnFloaty(){
    if (reduceMotion) return;
    const isHeart = Math.random() > 0.35;
    const el = document.createElement('div');
    el.className = 'floaty ' + (isHeart ? 'heart' : 'sparkle');
    const size = isHeart ? (10 + Math.random() * 20) : (4 + Math.random()*4);
    if (isHeart){
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.innerHTML = heartSVG;
    }
    el.style.left = Math.random() * 100 + 'vw';
    const duration = 9 + Math.random() * 9;
    el.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
    el.style.setProperty('--rot', (Math.random() * 60 - 30) + 'deg');
    el.style.setProperty('--s', (0.7 + Math.random()*0.8).toFixed(2));
    el.style.animationDuration = duration + 's';
    ambientLayer.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000 + 500);
  }

  if (!reduceMotion){
    for (let i = 0; i < 6; i++) setTimeout(spawnFloaty, i * 900);
    setInterval(spawnFloaty, 1400);
  }

  /* =========================================================
     MUSIC TOGGLE
  ========================================================= */
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bgMusic');
  let musicPlaying = false;

  musicToggle.addEventListener('click', () => {
    if (!musicPlaying){
      bgMusic.volume = 0.5;
      bgMusic.play().then(() => {
        musicPlaying = true;
        musicToggle.classList.add('playing');
      }).catch(() => {
        // file missing or blocked — fail silently, no broken UI
        musicToggle.classList.remove('playing');
      });
    } else {
      bgMusic.pause();
      musicPlaying = false;
      musicToggle.classList.remove('playing');
    }
  });

  /* =========================================================
     HERO REVEAL SEQUENCE
  ========================================================= */
  const heroLines = document.querySelectorAll('.hero-line');
  const heroBtn = document.getElementById('openHeartBtn');
  heroLines.forEach((line, i) => {
    setTimeout(() => line.classList.add('visible'), 500 + i * 1300);
  });
  setTimeout(() => heroBtn.classList.add('visible'), 500 + heroLines.length * 1300);

  heroBtn.addEventListener('click', () => {
    document.getElementById('sorry').scrollIntoView({ behavior: 'smooth' });
  });

  /* =========================================================
     SCROLL REVEAL (generic)
  ========================================================= */
  const revealTargets = document.querySelectorAll('.reveal-on-scroll, .reveal-up, .letter-line, .letter-signoff');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.25 });
  revealTargets.forEach(el => revealObserver.observe(el));

  // stagger the confession / reason / promise lines within their group
  function staggerGroup(selector, gap = 180){
    document.querySelectorAll(selector).forEach(group => {
      let delay = 0;
      group.style.transitionDelay = '0ms';
    });
  }
  [ '.confession-list', '.reasons-list', '.promise-list' ].forEach(groupSel => {
    const group = document.querySelector(groupSel);
    if (!group) return;
    const items = group.children;
    Array.from(items).forEach((item, i) => {
      item.style.transitionDelay = (i * 160) + 'ms';
    });
  });

  // stagger letter lines slightly for a "written for you" feel
  document.querySelectorAll('.letter-line, .letter-signoff').forEach((line, i) => {
    line.style.transitionDelay = (i * 140) + 'ms';
  });

  /* =========================================================
     TYPEWRITER PARAGRAPH (Sorry section)
  ========================================================= */
  const sorryPara = document.getElementById('sorryPara');
  const sorrySection = document.getElementById('sorry');
  let sorryTyped = false;

  function typeParagraph(el, text, speed = 22){
    let i = 0;
    el.textContent = '';
    (function step(){
      if (i <= text.length){
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else {
        el.classList.add('done');
      }
    })();
  }

  const sorryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !sorryTyped){
        sorryTyped = true;
        if (reduceMotion){
          sorryPara.textContent = sorryPara.dataset.full;
          sorryPara.classList.add('done');
        } else {
          typeParagraph(sorryPara, sorryPara.dataset.full, 18);
        }
      }
    });
  }, { threshold: 0.4 });
  sorryObserver.observe(sorrySection);

  /* =========================================================
     GALLERY + LIGHTBOX
  ========================================================= */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  galleryItems.forEach(item => {
    const img = item.querySelector('img');
    // graceful fallback if a real photo hasn't been added yet
    img.addEventListener('error', () => {
      item.classList.add('missing-photo');
      img.style.display = 'none';
      item.style.background = 'linear-gradient(135deg, var(--blush), var(--rose))';
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'center';
      if (!item.querySelector('.fallback-heart')){
        const fh = document.createElement('div');
        fh.className = 'fallback-heart';
        fh.style.color = '#fff';
        fh.style.opacity = '.85';
        fh.innerHTML = `<svg viewBox="0 0 24 24" width="34" height="34"><path fill="currentColor" d="M12 21s-6.7-4.3-9.3-8.2C.6 9.6 1.6 5.8 5 4.6c2.1-.7 4.1.2 5.3 2 .3.4.9.4 1.2 0 1.2-1.8 3.2-2.7 5.3-2 3.4 1.2 4.4 5 2.3 8.2C18.7 16.7 12 21 12 21z"/></svg>`;
        item.appendChild(fh);
      }
    }, { once: true });

    item.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = item.dataset.caption || '';
      lightbox.classList.add('open');
    });
  });

  function closeLightbox(){ lightbox.classList.remove('open'); }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* =========================================================
     ONE LAST THING
  ========================================================= */
  const lastThingBtn = document.getElementById('lastThingBtn');
  const lastMessage = document.getElementById('lastMessage');
  const beatingHeart = document.getElementById('beatingHeart');

  lastThingBtn.addEventListener('click', () => {
    lastMessage.classList.add('open');
    lastThingBtn.style.opacity = '0';
    lastThingBtn.style.pointerEvents = 'none';
    beatingHeart.style.animationDuration = '0.8s';
  });

  /* =========================================================
     FORGIVE SECTION — YES / NO BUTTONS
  ========================================================= */
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const buttonRow = document.getElementById('buttonRow');
  const forgiveContent = document.getElementById('forgiveContent');
  const celebration = document.getElementById('celebration');
  const finalMessage = document.getElementById('finalMessage');
  const forgiveSection = document.getElementById('forgive');

  let noEscapes = 0;

  function moveNoButton(fromEvent){
    const rect = forgiveSection.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    if (!noBtn.classList.contains('runaway')){
      noBtn.classList.add('runaway');
      noBtn.style.left = btnRect.left + 'px';
      noBtn.style.top = btnRect.top + 'px';
    }

    const margin = 20;
    const maxX = window.innerWidth - btnRect.width - margin;
    const maxY = window.innerHeight - btnRect.height - margin;
    let newX = Math.random() * (maxX - margin) + margin;
    let newY = Math.random() * (maxY - margin) + margin;

    noBtn.style.left = newX + 'px';
    noBtn.style.top = newY + 'px';

    noEscapes++;
    // the longer she chases it, the smaller (and cheekier) it gets, down to a floor
    const scale = Math.max(0.55, 1 - noEscapes * 0.045);
    noBtn.style.transform = `scale(${scale})`;

    const teases = ['Try again?','Nope.','Not happening.','Nice try!','Catch me!','Nuh-uh.','Almost!','Missed me!'];
    noBtn.textContent = noEscapes > 2 ? teases[noEscapes % teases.length] : 'NO';
  }

  noBtn.addEventListener('mouseenter', moveNoButton);
  noBtn.addEventListener('click', (e) => { e.preventDefault(); moveNoButton(e); });
  noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(e); }, { passive:false });

  function launchConfetti(){
    const colors = ['#ff8fab', '#e85d84', '#ffd3e0', '#e8b872', '#ffffff'];
    const count = reduceMotion ? 0 : 60;
    for (let i = 0; i < count; i++){
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const isHeart = Math.random() > 0.5;
      const size = 8 + Math.random() * 10;
      piece.style.left = Math.random() * 100 + '%';
      piece.style.width = size + 'px';
      piece.style.height = (isHeart ? size : size * 0.4) + 'px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      if (isHeart){
        piece.style.clipPath = 'path("M12 21s-6.7-4.3-9.3-8.2C.6 9.6 1.6 5.8 5 4.6c2.1-.7 4.1.2 5.3 2 .3.4.9.4 1.2 0 1.2-1.8 3.2-2.7 5.3-2 3.4 1.2 4.4 5 2.3 8.2C18.7 16.7 12 21 12 21z")';
        piece.style.transform = 'scale(0.9)';
      }
      piece.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      const duration = 3 + Math.random() * 2.5;
      piece.style.animationDuration = duration + 's';
      piece.style.animationDelay = (Math.random() * 0.6) + 's';
      celebration.appendChild(piece);
      setTimeout(() => piece.remove(), (duration + 1) * 1000);
    }
  }

  yesBtn.addEventListener('click', () => {
    // stop the no button from moving further
    noBtn.style.pointerEvents = 'none';

    launchConfetti();
    forgiveContent.classList.add('hidden');

    setTimeout(() => {
      finalMessage.classList.add('show');
    }, 500);

    // keep a gentle stream of hearts for a bit
    if (!reduceMotion){
      let bursts = 0;
      const burstInterval = setInterval(() => {
        launchConfetti();
        bursts++;
        if (bursts > 3) clearInterval(burstInterval);
      }, 1200);
    }
  });

  /* =========================================================
     SIDE RAIL NAV — active state + click to scroll
  ========================================================= */
  const railDots = document.querySelectorAll('.rail-dot');
  const sections = Array.from(document.querySelectorAll('.section'));

  railDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.id;
        railDots.forEach(d => d.classList.toggle('active', d.dataset.target === id));
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => sectionObserver.observe(s));

});