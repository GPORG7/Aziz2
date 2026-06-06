// Language translations

const translations = {
  uz: {
    'nav.home': 'Bosh sahifa',
    'nav.about': 'Men haqimda',
    'nav.experience': 'Tajriba',
    'nav.projects': 'Loyihalar',
    'nav.skills': 'Ko\'nikmalar',
    'nav.services': 'Xizmatlar',
    'nav.contact': 'Aloqa'
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.experience': 'Experience',
    'nav.projects': 'Projects',
    'nav.skills': 'Skills',
    'nav.services': 'Services',
    'nav.contact': 'Contact'
  }
};

function setLanguage(lang) {
  localStorage.setItem('language', lang);
  document.querySelectorAll('[data-text-key]').forEach(el => {
    const key = el.getAttribute('data-text-key');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.getAttribute('data-lang');
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setLanguage(lang);
  });
});

const savedLang = localStorage.getItem('language') || 'uz';
setLanguage(savedLang);
document.querySelector(`[data-lang="${savedLang}"]`)?.classList.add('active');
