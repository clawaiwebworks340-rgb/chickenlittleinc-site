/* ============================================
   CHICKEN LITTLE INC. — Site Script
   ============================================ */
(() => {
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* ---------- LOADER ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => {
      $('#loader')?.classList.add('hidden');
      $('.hero-title')?.classList.add('in');
    }, 700);
  });

  /* ---------- YEAR ---------- */
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- NAV SCROLL STATE ---------- */
  const nav = $('#nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- MOBILE MENU ---------- */
  const navToggle = $('#navToggle');
  const mobileMenu = $('#mobileMenu');
  navToggle?.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  $$('#mobileMenu a').forEach(a =>
    a.addEventListener('click', () => {
      navToggle.classList.remove('open');
      mobileMenu.classList.remove('open');
    })
  );

  /* ---------- HERO SLIDESHOW ---------- */
  const slides = $$('.hero-slide');
  if (slides.length > 1) {
    let idx = 0;
    setInterval(() => {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }, 6000);
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- SERVICE CARD GLOW (mouse pos) ---------- */
  $$('.svc-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });

  /* ---------- SHOWCASE TABS ---------- */
  $$('.show-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      $$('.show-tab').forEach(b => b.classList.toggle('active', b === btn));
      $$('.ba-wrap').forEach(p => p.classList.toggle('active', p.dataset.pane === tab));
    });
  });

  /* ---------- BEFORE / AFTER SLIDERS ---------- */
  $$('[data-ba]').forEach(ba => {
    const before = ba.querySelector('.ba-img.before');
    const handle = ba.querySelector('.ba-handle');
    let dragging = false;

    const setPos = (clientX) => {
      const r = ba.getBoundingClientRect();
      let pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      before.style.setProperty('--clip', pct + '%');
      handle.style.setProperty('--pos', pct + '%');
    };

    const start = (e) => {
      dragging = true;
      setPos(e.touches ? e.touches[0].clientX : e.clientX);
      e.preventDefault();
    };
    const move = (e) => {
      if (!dragging) return;
      setPos(e.touches ? e.touches[0].clientX : e.clientX);
    };
    const end = () => { dragging = false; };

    ba.addEventListener('mousedown', start);
    ba.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);

    ba.addEventListener('mousemove', e => {
      if (!dragging) setPos(e.clientX);
    });
  });

  /* ---------- TESTIMONIAL CAROUSEL ---------- */
  const ttTrack = $('#ttTrack');
  if (ttTrack) {
    $$('[data-tt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = parseInt(btn.dataset.tt, 10);
        const card = ttTrack.querySelector('.tt-card');
        const step = card ? card.getBoundingClientRect().width + 24 : 400;
        ttTrack.scrollBy({ left: dir * step, behavior: 'smooth' });
      });
    });

    let auto = setInterval(() => {
      const max = ttTrack.scrollWidth - ttTrack.clientWidth - 4;
      if (ttTrack.scrollLeft >= max) ttTrack.scrollTo({ left: 0, behavior: 'smooth' });
      else ttTrack.scrollBy({ left: 480, behavior: 'smooth' });
    }, 6000);
    ttTrack.addEventListener('mouseenter', () => clearInterval(auto));
  }

  /* ---------- LIGHTBOX ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const galleryImgs = $$('.gx').map(b => b.dataset.img);
  let lbIdx = 0;
  const openLB = (i) => {
    lbIdx = (i + galleryImgs.length) % galleryImgs.length;
    lbImg.src = galleryImgs[lbIdx];
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeLB = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  $$('.gx').forEach((btn, i) => btn.addEventListener('click', () => openLB(i)));
  $('#lbClose')?.addEventListener('click', closeLB);
  $('#lbPrev')?.addEventListener('click', () => openLB(lbIdx - 1));
  $('#lbNext')?.addEventListener('click', () => openLB(lbIdx + 1));
  lb?.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  window.addEventListener('keydown', e => {
    if (!lb?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') openLB(lbIdx - 1);
    if (e.key === 'ArrowRight') openLB(lbIdx + 1);
  });

  /* ---------- COUNTER (hero meta) ---------- */
  const animateCount = (el, target) => {
    const isPlus = el.textContent.includes('+');
    const dur = 1400;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * ease) + (isPlus ? '+' : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const heroMeta = $('.hero-meta');
  if (heroMeta) {
    const obs = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          const strong = heroMeta.querySelector('strong');
          if (strong && /^\d+/.test(strong.textContent)) {
            animateCount(strong, 500);
          }
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    obs.observe(heroMeta);
  }

  /* ---------- FILE UPLOAD UX ---------- */
  const wireUpload = (inputId, countId) => {
    const input = document.getElementById(inputId);
    const out = document.getElementById(countId);
    const wrap = input?.closest('.upload')?.querySelector('.upload-cta');
    if (!input || !wrap) return;
    input.addEventListener('change', () => {
      const n = input.files?.length || 0;
      if (out) out.textContent = n ? `${n} file${n > 1 ? 's' : ''} selected` : 'No files selected';
    });
    ['dragenter', 'dragover'].forEach(ev =>
      wrap.addEventListener(ev, e => { e.preventDefault(); wrap.classList.add('drag'); })
    );
    ['dragleave', 'drop'].forEach(ev =>
      wrap.addEventListener(ev, e => { e.preventDefault(); wrap.classList.remove('drag'); })
    );
    wrap.addEventListener('drop', e => {
      if (e.dataTransfer?.files) {
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      }
    });
  };
  wireUpload('estPhotos', 'estPhotosCount');
  wireUpload('contactPhotos', 'contactPhotosCount');
  wireUpload('resumeFile', 'resumeFileCount');

  /* ---------- FORM SUBMITS (emails the business) ---------- */
  // Delivered via FormSubmit.co — works on static hosting (GitHub Pages), no backend needed.
  const QUOTE_EMAIL = 'info@chickenlittleservices.company';
  const MAX_UPLOAD = 10 * 1024 * 1024; // FormSubmit caps total attachments at 10MB

  const wireForm = (formId, msg, subject) => {
    const f = document.getElementById(formId);
    if (!f) return;
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = f.querySelector('button[type="submit"]');
      const orig = btn.textContent;

      let totalBytes = 0;
      $$('input[type="file"]', f).forEach(inp =>
        Array.from(inp.files || []).forEach(file => { totalBytes += file.size; })
      );
      if (totalBytes > MAX_UPLOAD) {
        btn.textContent = 'Files too big — 10MB max';
        setTimeout(() => { btn.textContent = orig; }, 3600);
        return;
      }

      btn.textContent = 'Sending…';
      btn.disabled = true;

      try {
        const res = await fetch(`https://formsubmit.co/ajax/${QUOTE_EMAIL}`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(f)
        });
        if (!res.ok) throw new Error('bad status');
        btn.textContent = msg;
        btn.style.background = 'var(--gold-soft)';
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; f.reset(); }, 3600);
      } catch (err) {
        // Fallback: open the visitor's email client pre-filled to the business
        const lines = [];
        new FormData(f).forEach((v, k) => {
          if (!(v instanceof File) && !k.startsWith('_')) lines.push(`${k}: ${v}`);
        });
        window.location.href =
          `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
        btn.textContent = orig; btn.disabled = false;
      }
    });
  };
  wireForm('estForm', 'Estimate Received', 'New Estimate Request - Chicken Little Inc.');
  wireForm('contactForm', 'Message Sent', 'New Contact Message - Chicken Little Inc.');
  wireForm('careersForm', 'Application Submitted', 'New Job Application - Chicken Little Inc.');

  /* ---------- SMOOTH ANCHOR SCROLL OFFSET ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - 60;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ---------- AI CHAT ASSISTANT ---------- */
  const chatFab = $('#chatFab');
  const chatPanel = $('#chatPanel');
  const chatBody = $('#chatBody');
  const chatChips = $('#chatChips');
  const chatInput = $('#chatInput');
  const chatSend = $('#chatSend');
  const chatClose = $('#chatClose');

  if (chatFab && chatPanel) {
    let greeted = false;

    const KB = {
      greeting: "Hi! 👋 I'm the Chicken Little Inc. assistant. I can help with our services, price ranges, estimates, and the areas we cover across Southern California. What can I help you with?",
      services: "We handle five main areas: 💧 <b>Restoration</b> (water damage, leak detection, structural drying), 🪵 <b>Flooring</b> (LVP, laminate, hardwood, carpet), 🧱 <b>Interior</b> (drywall, texture, painting), ✨ <b>Epoxy &amp; Coatings</b> (garage, warehouse), and 🏢 <b>Property Maintenance</b> (apartment turns, facility work). Which one are you interested in?",
      areas: "We cover all of Southern California — <b>Los Angeles County</b> (including South LA, Long Beach, the Valley), <b>Orange County</b>, <b>Riverside County</b>, and <b>San Bernardino County</b>. Tell me your city and I'll confirm we're out there.",
      estimate: "Free estimates are easy: tell us about the project on our <a href='#estimate'>Free Estimate form</a> (you can even upload photos) and a project manager replies within one business day — same-day for emergencies. Want me to take you there?",
      emergency: "🚨 For water damage and emergencies we dispatch crews 24/7, with a 60-minute average response across SoCal. Call the emergency line right away — or use the Free Estimate form and mark it urgent.",
      contact: "You can reach a real project manager (not a bot 😉) through our <a href='#contact'>Contact section</a>, or request a <a href='#estimate'>Free Estimate</a>. We reply fast.",
      thanks: "Anytime! Is there anything else I can help you with — services, pricing, or your service area?",
      fallback: "Great question. For specifics like that, the fastest path is a free estimate — drop your details on the <a href='#estimate'>Free Estimate form</a> and a project manager will get right back to you. Want me to scroll you there?"
    };
    const PRICE = {
      water: "💧 <b>Water damage</b> is quoted per job because it depends on how much water, how long it sat, and the area affected. Emergency extraction + drying is the first step, then we estimate any flooring/drywall repairs. Send photos on the <a href='#estimate'>Free Estimate form</a> for a real number.",
      floor: "🪵 <b>Flooring</b> is priced by square footage, material (LVP, laminate, hardwood, carpet), and prep needed. Share the room size on the <a href='#estimate'>Free Estimate form</a> and we'll quote it.",
      drywall: "🧱 <b>Drywall &amp; paint</b> is quoted by the size of the repair and finish/texture match needed. Quick patches differ a lot from full rooms — describe it on the <a href='#estimate'>Free Estimate form</a> for a price.",
      epoxy: "✨ <b>Epoxy floors</b> are priced per square foot by system (flake, polyaspartic, commercial). A 2-car garage differs from a warehouse. Give us the sqft on the <a href='#estimate'>Free Estimate form</a>.",
      turn: "🏢 <b>Apartment turns</b> are quoted per unit by scope (paint, flooring, cleaning, repairs). We run scheduled turn programs for property managers — details on the <a href='#estimate'>Free Estimate form</a>.",
      general: "Every project is a little different, so we give real estimates instead of guesses — and they're free. Tell us the scope on the <a href='#estimate'>Free Estimate form</a> (photos help!) and a project manager responds within a business day."
    };

    const scrollDown = () => { chatBody.scrollTop = chatBody.scrollHeight; };
    const addMsg = (html, who) => {
      const d = document.createElement('div');
      d.className = 'chat-msg ' + who;
      d.innerHTML = html;
      chatBody.appendChild(d);
      scrollDown();
    };
    const setChips = (arr) => {
      chatChips.innerHTML = '';
      arr.forEach(t => {
        const b = document.createElement('button');
        b.textContent = t;
        b.addEventListener('click', () => handle(t));
        chatChips.appendChild(b);
      });
    };
    const typing = () => {
      const d = document.createElement('div');
      d.className = 'chat-typing';
      d.innerHTML = '<span></span><span></span><span></span>';
      chatBody.appendChild(d);
      scrollDown();
      return d;
    };

    const reply = (q) => {
      const t = q.toLowerCase();
      if (/(price|cost|how much|rate|charge|quote|estimate|pricing)/.test(t)) {
        if (/water|flood|leak|restor|dry/.test(t)) return PRICE.water;
        if (/floor|lvp|vinyl|laminate|hardwood|carpet/.test(t)) return PRICE.floor;
        if (/drywall|paint|texture|wall|ceiling/.test(t)) return PRICE.drywall;
        if (/epoxy|coating|garage|warehouse/.test(t)) return PRICE.epoxy;
        if (/turn|apartment|unit|make.?ready/.test(t)) return PRICE.turn;
        if (/estimate|free/.test(t)) return KB.estimate;
        return PRICE.general;
      }
      if (/water|flood|leak|restor/.test(t)) return PRICE.water;
      if (/floor|lvp|vinyl|laminate|hardwood|carpet/.test(t)) return PRICE.floor;
      if (/drywall|paint|texture/.test(t)) return PRICE.drywall;
      if (/epoxy|coating|garage|warehouse/.test(t)) return PRICE.epoxy;
      if (/turn|apartment|make.?ready|maintenance|facility/.test(t)) return PRICE.turn;
      if (/service|what do you (do|offer)|help with|do you/.test(t)) return KB.services;
      if (/area|where|location|cover|county|south la|orange|riverside|bernardino|los angeles|city|near/.test(t)) return KB.areas;
      if (/emergency|urgent|asap|flooding|24.?7|right now/.test(t)) return KB.emergency;
      if (/estimate|free|appointment|book|schedule|visit/.test(t)) return KB.estimate;
      if (/contact|call|phone|reach|talk|email|number/.test(t)) return KB.contact;
      if (/thank|thanks|appreciate|awesome/.test(t)) return KB.thanks;
      if (/^(hi|hey|hello|yo|sup|hola)\b/.test(t)) return KB.greeting;
      return KB.fallback;
    };

    const DEFAULT_CHIPS = ['Services', 'Pricing', 'Areas covered', 'Free estimate'];
    const handle = (q) => {
      addMsg(q, 'me');
      const dots = typing();
      setTimeout(() => {
        dots.remove();
        addMsg(reply(q), 'bot');
        setChips(['Water damage', 'Flooring', 'Epoxy', 'Apartment turns', 'Free estimate']);
      }, 650);
    };

    const openChat = () => {
      chatPanel.classList.add('open');
      chatPanel.setAttribute('aria-hidden', 'false');
      chatFab.classList.add('hidden');
      if (!greeted) {
        greeted = true;
        const dots = typing();
        setTimeout(() => { dots.remove(); addMsg(KB.greeting, 'bot'); setChips(DEFAULT_CHIPS); }, 500);
      }
      setTimeout(() => chatInput.focus(), 320);
    };
    const closeChat = () => {
      chatPanel.classList.remove('open');
      chatPanel.setAttribute('aria-hidden', 'true');
      chatFab.classList.remove('hidden');
    };

    chatFab.addEventListener('click', openChat);
    chatClose.addEventListener('click', closeChat);
    chatSend.addEventListener('click', () => {
      const v = chatInput.value.trim();
      if (v) { handle(v); chatInput.value = ''; }
    });
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); chatSend.click(); }
    });
    chatBody.addEventListener('click', e => { if (e.target.tagName === 'A') closeChat(); });
    chatChips.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON' && /estimate/i.test(e.target.textContent)) {
        setTimeout(closeChat, 700);
      }
    });
  }
})();
