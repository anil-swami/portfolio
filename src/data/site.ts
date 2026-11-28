// Every word and link on the site lives here. Edit this file to change the content; components only lay it out.
// Written from Ani's notes (Nov 2026). Tech work only: no marketing, design or video services.

export type Tint = 'indigo' | 'teal' | 'amber' | 'pink' | 'sky' | 'violet' | 'green' | 'coral';

export const site = {
  name: 'Anil Swami',
  initials: 'AS',
  url: 'https://trybrix.site',
  title: 'Anil Swami · Web developer for business websites',
  description:
    'Anil Swami builds fast, good-looking business websites, sets them up to be found on Google, and uses AI to deliver faster. Based in Gurugram, India, working with clients anywhere.',
  location: 'Gurugram, India',
  email: 'anilswami5388@gmail.com',
  // Leave the number empty to hide every WhatsApp button. Format: country code + number, digits only (e.g. 919812345678).
  whatsapp: { number: '', message: 'Hi Anil, I saw your website and would like a quote for a website.' },
  links: {
    linkedin: 'https://www.linkedin.com/in/anil-swami-5044bb176/',
    github: 'https://github.com/anil-swami',
    youtube: 'https://www.youtube.com/@Technly-990/',
  },
  // The resume PDF (/anil-swami-resume.pdf) is still served but not linked: it is a marketing CV with a personal
  // phone number. Link a tech-only CV here when there is one.
  // Tech-only CV, generated from scripts/cv.html by `npm run cv`.
  cv: '/anil-swami-cv.pdf',
  // The 3D portfolio, kept as its own site.
  play: { label: "Let's play", href: 'https://3d.trybrix.site/', title: 'My 3D driving-game portfolio' },
  nav: [
    { label: 'Work', href: '/#work' },
    { label: 'Services', href: '/#services' },
    { label: 'AI corner', href: '/#ai' },
    { label: 'About', href: '/#about' },
    { label: 'Contact', href: '/#contact' },
  ],

  // Headings, intros and button labels for each section of the home page.
  sections: {
    work: { eyebrow: 'Selected work', title: 'Real websites,', highlight: 'live on the internet', intro: 'Built in-house for businesses I work with. Open them, click around, check the speed on your phone.', moreTitle: "More I've built", siteLink: 'Visit the live site' },
    services: { eyebrow: 'Services', title: 'What I can', highlight: 'build for you', intro: 'One developer, start to finish: you always talk to the person who writes the code.', cta: 'Get a quote' },
    process: { eyebrow: 'How it works', title: 'From first call to', highlight: 'live website' },
    why: { eyebrow: 'Why work with me', title: 'A website that works as hard as', highlight: 'you do', intro: 'Most small-business sites are slow, hard to find on Google and impossible to update. Mine are built the other way round.', cta: 'Get a quote' },
    ai: { eyebrow: 'AI corner', title: 'I explain AI, and', highlight: 'build with it', intro: "For people who follow my AI content: the channel, and the tools I've made with AI coding assistants.", builtTitle: "Things I've built with AI", subscribe: 'Subscribe on YouTube', watch: 'Watch Shorts' },
    about: { eyebrow: 'About', stackTitle: 'What I build with', cta: 'Work with me', cvLabel: 'CV (PDF)' },
    faq: { eyebrow: 'FAQ', title: 'Questions business owners', highlight: 'ask me', intro: 'Something else on your mind? Send me an email, I usually reply the same day.', cta: 'Email me' },
    contact: { title: "Let's build your", highlight: 'website', text: "Tell me about your business. I'll reply with a clear plan and a fixed quote.", cta: 'Email me for a quote', subject: 'Website quote' },
    notFound: { eyebrow: 'Error 404', title: 'Page not', highlight: 'found', text: "This page doesn't exist, or it moved when the site was rebuilt. Here are some ways back.", home: 'Back to home', work: 'See my work', contact: 'Contact me', playHint: 'Looking for my 3D driving-game portfolio?' },
    footer: { blurb: 'Business websites, built fast and built to be found. Based in Gurugram, India, working with clients anywhere.', explore: 'Explore', contact: 'Get in touch', follow: 'Follow', credit: 'Designed and built by me, with Astro.' },
  },

  hero: {
    ctaPrimary: 'Get a quote',
    ctaSecondary: 'See my work',
    // The two floating chips beside the monogram.
    visualChips: ['Loads in a blink', 'Found on Google'],
    eyebrow: 'Web developer · Gurugram, India',
    title: 'Fast, good-looking websites that',
    highlight: 'bring you customers',
    text: "I'm Anil. I design and build modern business websites, set them up to be found on Google, and use AI to deliver faster, with every line checked by me.",
    chips: ['Mobile-first', 'Built to rank', 'You own everything'],
  },

  // Factual numbers only. Ani confirms these before launch.
  stats: [
    { n: 5, suffix: '+', label: 'Years building for the web', icon: 'Clock', tint: 'coral' as Tint },
    { n: 2, suffix: '', label: 'Live business websites', icon: 'Globe', tint: 'indigo' as Tint },
    { n: 10, suffix: '+', label: 'Web apps and tools built', icon: 'Wrench', tint: 'teal' as Tint },
    { n: 24, suffix: '', label: 'AI explainer videos', icon: 'MonitorPlay', tint: 'pink' as Tint },
  ],

  work: [
    {
      slug: 'salsteel',
      name: 'SAL Steel',
      url: 'https://salsteel.co.in',
      domain: 'salsteel.co.in',
      kind: 'Company website · built in-house',
      tint: 'indigo' as Tint,
      summary: 'A new, fast website for an integrated steel plant in Gujarat, launched with analytics and Google Search Console from day one.',
      did: ['Designed and built the site in Node.js', 'Deployed on GoDaddy straight from GitHub', 'Connected GA4 and Google Search Console', 'Wrote owner, developer and launch guides'],
      tech: ['Node.js', 'GitHub', 'GoDaddy', 'GA4', 'Search Console'],
    },
    {
      slug: 'mysaanchi',
      name: 'Saanchi',
      url: 'https://mysaanchi.com',
      domain: 'mysaanchi.com',
      kind: 'CSR website · built in-house',
      tint: 'coral' as Tint,
      summary: "Moved a women's-training charity site and its email off a hacked server to clean, secure hosting, then set up a blog of 58 articles.",
      did: ['Moved the website and email off a hacked host', 'Fixed DNS so site and email point to the new host', 'Made the contact form send through the host\'s mail gateway', 'Published 58 articles on health and education'],
      tech: ['Node.js', 'GoDaddy', 'DNS', 'Email', 'GitHub'],
    },
  ],
  more: [
    { name: 'Desktop Pet "Pip"', text: 'A tiny cartoon pet for the Windows desktop that walks, naps, sits on icons and reacts to the mouse. Open source.', tech: ['Electron', 'JavaScript'], url: 'https://github.com/anil-swami', link: 'View on GitHub', icon: 'Cat', tint: 'violet' as Tint },
    { name: 'More on GitHub', text: 'Dashboards, small tools and experiments I build to turn repeated tasks into one click.', tech: ['Node.js', 'React', 'Astro'], url: 'https://github.com/anil-swami', link: 'Open my GitHub', icon: 'GitBranch', tint: 'teal' as Tint },
  ],

  services: [
    { title: 'New business website', text: 'A fast, mobile-first site with your services, contact buttons and Google set-up, ready in a few weeks.', icon: 'MonitorSmartphone', tint: 'indigo' as Tint },
    { title: 'Website redesign', text: 'Turn an old, slow or hacked website into a modern one, without losing your Google rankings.', icon: 'RefreshCcw', tint: 'coral' as Tint },
    { title: 'SEO & Google set-up', text: 'Search Console, Analytics and Business Profile, plus page titles and speed fixes so customers find you.', icon: 'Search', tint: 'teal' as Tint },
    { title: 'Care plan', text: 'Updates, backups, small edits and a monthly report, so your site stays fast and safe.', icon: 'ShieldCheck', tint: 'amber' as Tint },
  ],

  steps: [
    { title: 'Free call', text: 'Tell me about your business and what the website should do.', icon: 'PhoneCall', tint: 'sky' as Tint },
    { title: 'Plan & quote', text: 'You get the page list, timeline and a fixed price. No surprises later.', icon: 'ClipboardList', tint: 'violet' as Tint },
    { title: 'Build & review', text: 'I build it and share a live preview link. You comment, I adjust.', icon: 'Code', tint: 'coral' as Tint },
    { title: 'Launch & support', text: 'I put it live on your domain, connect Google, and stay on call.', icon: 'Rocket', tint: 'green' as Tint },
  ],

  why: [
    { title: 'Fast on every phone', text: 'Light, modern code instead of heavy page builders, so pages open in a blink.', icon: 'Zap', tint: 'amber' as Tint },
    { title: 'Built to be found', text: 'Clean structure, page titles and Google tools set up from the first day.', icon: 'TrendingUp', tint: 'teal' as Tint },
    { title: 'You own everything', text: 'Your domain, hosting and code stay in your name. No lock-in.', icon: 'KeyRound', tint: 'indigo' as Tint },
    { title: 'AI-assisted, human-checked', text: 'I use AI to work faster and check every line myself, so you get more for less time.', icon: 'Sparkles', tint: 'pink' as Tint },
  ],

  ai: {
    channel: {
      name: 'Technly',
      tagline: 'AI explained simply',
      text: 'My YouTube channel: short, clear explainers on AI tools and ideas, with Indian examples. New Shorts every week.',
      url: 'https://www.youtube.com/@Technly-990/',
      shortsUrl: 'https://www.youtube.com/@Technly-990/shorts',
    },
    // Top Shorts by views (Nov 2026). They open the channel's Shorts page.
    shorts: [
      { title: 'Claude Code folder structure', views: '1.6K views', tint: 'indigo' as Tint },
      { title: 'Chatbot vs AI agent', views: '960 views', tint: 'coral' as Tint },
      { title: 'Why AI needed MCP', views: '930 views', tint: 'teal' as Tint },
    ],
    built: [
      { name: 'Grain-particle hero', text: 'The "AS" at the top of this page: thousands of particles that react to your mouse and drift away as you scroll.', icon: 'Sparkle', tint: 'coral' as Tint },
      { name: 'Idea HQ dashboard', text: 'My own project dashboard: ideas, to-dos, design kits and progress, saved to one file and run on my laptop.', icon: 'LayoutDashboard', tint: 'indigo' as Tint },
      { name: 'Hand-drawn video pipeline', text: 'Type a topic, get a whiteboard explainer video: script, voice, drawing-hand animation and thumbnail.', icon: 'Clapperboard', tint: 'amber' as Tint },
      { name: 'VoiceStudio', text: 'An offline voice-over studio that turns scripts into natural voice-overs on my own computer.', icon: 'AudioLines', tint: 'teal' as Tint },
    ],
  },

  about: {
    title: 'Hi, I\'m Anil',
    paragraphs: [
      'I\'m an electrical engineer who moved into web development. For about five years I\'ve built websites, web apps and dashboards in-house, from the first sketch to going live.',
      'Whenever a task repeats, I turn it into a simple tool. Today I build with modern frameworks and AI coding tools, and I check every line before it goes live.',
    ],
    stack: [
      { group: 'Front end', items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Astro'] },
      { group: 'Back end', items: ['Node.js', 'Express', 'Next.js'] },
      { group: 'Data', items: ['PostgreSQL', 'MongoDB', 'SQLite', 'Prisma'] },
      { group: 'Hosting & tools', items: ['Git', 'GitHub', 'GoDaddy', 'cPanel', 'DNS'] },
      { group: 'Google', items: ['Search Console', 'GA4', 'Tag Manager'] },
      { group: 'AI', items: ['Claude Code', 'Claude', 'ChatGPT'] },
    ],
    education: 'B.Tech, Electrical Engineering (2019) · Front-end Web Development (2020)',
  },

  faqs: [
    { q: 'How much does a website cost?', a: 'It depends on the number of pages and features. Tell me what you need and I\'ll send a fixed quote within a day or two, so you know the full price before we start.' },
    { q: 'How long does it take?', a: 'A typical small-business website takes two to four weeks, depending on how quickly the content and feedback come in.' },
    { q: 'What do I need to give you?', a: 'Your logo, rough notes about your services, and photos if you have them. I can help write the text. If you already have a domain or hosting, share the login and I\'ll handle the rest.' },
    { q: 'Can I update the website myself?', a: 'Yes. I can add a simple editor for your blog or news, and small text changes are included in the care plan.' },
    { q: 'Do I own the website and domain?', a: 'Yes. The domain, hosting and code are in your name. I set things up so you\'re never locked in to me.' },
  ],
};

/** WhatsApp chat link, or null while no number is set (buttons then hide themselves). */
export const whatsappLink = (message = site.whatsapp.message): string | null =>
  site.whatsapp.number ? `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}` : null;
