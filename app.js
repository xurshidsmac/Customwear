const burger = document.getElementById('burgerBtn');
const mnav   = document.getElementById('mnav');
const backdrop = mnav?.querySelector('.mnav__backdrop');
const closeBtns = mnav?.querySelectorAll('[data-close]');
let lastFocused = null;

function getFocusable(container){
  return [...container.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  )];
}

function openMenu(){
  if (!burger || !mnav) return;
  lastFocused = document.activeElement;
  burger.setAttribute('aria-expanded', 'true');
  mnav.hidden = false;
  // async to allow CSS to catch open class transition
  requestAnimationFrame(() => mnav.classList.add('open'));
  document.body.classList.add('no-scroll');

  // focus trap
  const focusables = getFocusable(mnav);
  if (focusables.length) focusables[0].focus();

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('focus', trapFocus, true);
}

function closeMenu(){
  if (!burger || !mnav) return;
  burger.setAttribute('aria-expanded', 'false');
  mnav.classList.remove('open');
  document.body.classList.remove('no-scroll');

  // after animation hide
  const hide = () => {
    mnav.hidden = true;
    mnav.removeEventListener('transitionend', hide);
  };
  mnav.addEventListener('transitionend', hide);

  document.removeEventListener('keydown', onKeydown);
  document.removeEventListener('focus', trapFocus, true);

  if (lastFocused) lastFocused.focus();
}

function toggleMenu(){
  const expanded = burger.getAttribute('aria-expanded') === 'true';
  expanded ? closeMenu() : openMenu();
}

function onKeydown(e){
  if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }

  if (e.key === 'Tab'){
    // trap tab within panel
    const focusables = getFocusable(mnav);
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last){ e.preventDefault(); first.focus(); }
  }
}

function trapFocus(e){
  if (!mnav.classList.contains('open')) return;
  if (!mnav.contains(e.target)){
    const focusables = getFocusable(mnav);
    if (focusables.length) focusables[0].focus();
  }
}

// Events
if (burger && mnav){
  burger.addEventListener('click', toggleMenu);

  // close by clicking backdrop or close button
  backdrop?.addEventListener('click', closeMenu);
  closeBtns?.forEach(btn => btn.addEventListener('click', closeMenu));

  // close when clicking a link
  mnav.addEventListener('click', (e) => {
    if (e.target.closest('.mnav__link, .mnav__cta')) closeMenu();
  });
}


// ===== REVEAL ON SCROLL =====
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal,[data-reveal-children]').forEach(el => el.classList.add('is-inview'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      el.classList.add('is-inview');

      // Если это контейнер — даём стеггер детям
      if (el.hasAttribute('data-reveal-children')) {
        const kids = Array.from(el.children);
        kids.forEach((child, i) => {
          child.style.setProperty('--reveal-delay', `${i * 90}ms`);
        });
      }

      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

  document.querySelectorAll('.reveal,[data-reveal-children]').forEach(el => io.observe(el));
})();
// ===== FOOTER helpers =====
(() => {
  // Текущий год
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Простая обработка подписки (без бэкенда)
  const form = document.getElementById('fnews');
  const input = document.getElementById('fnews-email');
  const hint = document.getElementById('fnews-hint');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!input?.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      hint.textContent = 'Проверьте email.';
      hint.style.color = '#b00020';
      input?.focus();
      return;
    }
    hint.textContent = 'Спасибо! Мы написали вам письмо-подтверждение.';
    hint.style.color = 'var(--muted)';
    form.reset();
  });
})();
