/* ==========================================================================
   ALLOY — portfolio behaviour
   --------------------------------------------------------------------------
   Vanilla JS, no dependencies. Everything here is an enhancement: the page
   is complete and readable without it.

     1. Helpers
     2. Scroll reveals
     3. Header: active nav link
     4. Alloy mixer (composition table): the signature interaction
     5. Footer year
   ========================================================================== */

(() => {
  'use strict';

  /* 1. Helpers
     ------------------------------------------------------------------------ */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const hasIO = 'IntersectionObserver' in window;


  /* 2. Scroll reveals
     Elements marked [data-reveal] get .is-visible once they enter the viewport.
     CSS decides what that looks like (fade-up, the heat-number "pour",
     or a figure playing its small animation once).
     ------------------------------------------------------------------------ */
  function initReveals() {
    const items = $$('[data-reveal]');
    if (!hasIO) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

    items.forEach(el => io.observe(el));
  }


  /* 3. Header: underline the nav link for the section in the middle of the viewport
     ------------------------------------------------------------------------ */
  function initHeader() {
    if (!hasIO) return;
    const links = $$('.site-nav a');
    const sections = links
      .map(link => document.getElementById(link.getAttribute('href').slice(1)))
      .filter(Boolean);

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = links.find(a => a.getAttribute('href') === `#${entry.target.id}`);
        if (link) link.classList.toggle('is-active', entry.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(section => io.observe(section));
  }


  /* 4. Alloy mixer
     Element column headers are toggle buttons. Selecting elements "mixes"
     them: heats containing every selected element light up (in the table and
     in the case studies below), the rest fade back, and the readout names
     the result.
     ------------------------------------------------------------------------ */
  const ELEMENT_ORDER = ['Op', 'Ai', 'Wd', 'Sm', 'Vd', 'Gd'];

  // Named results for mixes that show up in the work. Keys follow ELEMENT_ORDER.
  const REACTIONS = {
    'Op+Sm':       'CSR stories told from the plant floor',
    'Op+Ai':       'tools shaped by someone who reads the reports',
    'Ai+Wd':       'reports that answer back',
    'Op+Ai+Wd':    'reports that answer back',
    'Wd+Gd':       'a corporate site, designed and built by one pair of hands',
    'Sm+Vd':       'short-form video that actually ships, week after week',
    'Ai+Vd':       'video at newsroom speed on a volunteer budget',
    'Ai+Sm+Vd':    'a new cause, finding its voice',
    'Sm+Gd':       'campaign graphics built for the feed',
    'Op+Sm+Vd+Gd': 'where the plant floor meets the public feed',
  };

  function initMixer() {
    const mix = $('#mix');
    if (!mix) return;

    const buttons  = $$('.el-btn', mix);
    const rows     = $$('.mix__row', mix);
    const cells    = $$('th[data-el], td[data-el]', mix);
    const heats    = $$('article.heat');
    const chips    = $$('.heat .chip');
    const readout  = $('[data-readout]', mix);
    const clearBtn = $('[data-clear]', mix);
    const defaultText = readout.textContent;
    const selected = new Set();

    const elementsOf = node => (node.dataset.elements || '').split(/\s+/).filter(Boolean);
    const containsMix = node => {
      const own = elementsOf(node);
      return [...selected].every(el => own.includes(el));
    };

    function renderReadout(matchIds) {
      if (!selected.size) {
        readout.textContent = defaultText;
        return;
      }

      const symbols = ELEMENT_ORDER.filter(el => selected.has(el));
      const reaction = REACTIONS[symbols.join('+')];

      const mixName = document.createElement('strong');
      mixName.textContent = symbols.join(' + ');
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = ' → ';

      readout.replaceChildren(mixName, arrow);

      if (!matchIds.length) {
        readout.append('no single heat uses that exact mix yet. Remove an element to widen it.');
        return;
      }

      if (reaction) {
        const em = document.createElement('em');
        em.textContent = reaction;
        readout.append(em, '. ');
      }

      readout.append(`Found in ${matchIds.length} of ${rows.length}: `);
      matchIds.forEach((id, i) => {
        const link = document.createElement('a');
        link.href = `#heat-${id}`;
        link.textContent = `Heat ${id}`;
        readout.append(i ? ', ' : '', link);
      });
    }

    function update() {
      const active = selected.size > 0;
      const matchIds = [];

      buttons.forEach(btn => btn.setAttribute('aria-pressed', String(selected.has(btn.dataset.el))));
      cells.forEach(cell => cell.classList.toggle('is-hot', selected.has(cell.dataset.el)));
      chips.forEach(chip => chip.classList.toggle('is-hot', selected.has(chip.dataset.el)));

      rows.forEach(row => {
        const match = active && containsMix(row);
        row.classList.toggle('is-match', match);
        row.classList.toggle('is-dim', active && !match);
        if (match) matchIds.push(row.dataset.heat);
      });

      heats.forEach(heat => {
        const match = active && containsMix(heat);
        heat.classList.toggle('is-match', match);
        heat.classList.toggle('is-dim', active && !match);
      });

      clearBtn.hidden = !active;
      renderReadout(matchIds);
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const el = btn.dataset.el;
        if (selected.has(el)) selected.delete(el);
        else selected.add(el);
        update();
      });
    });

    clearBtn.addEventListener('click', () => {
      selected.clear();
      update();
      buttons[0].focus();   // the clear button hides itself, so move focus somewhere sensible
    });
  }


  /* 5. Footer year
     ------------------------------------------------------------------------ */
  function initYear() {
    const year = String(new Date().getFullYear());
    $$('[data-year]').forEach(el => { el.textContent = year; });
  }


  /* Boot (the script is deferred, so the DOM is ready) */
  initYear();
  initReveals();
  initHeader();
  initMixer();
})();
