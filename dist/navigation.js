// Show one section at a time while preserving existing shared event links.
'use strict';
const pages = Array.from(document.querySelectorAll('main > section'));
const menuLinks = Array.from(document.querySelectorAll('nav a'));
const pageNames = {home:'Home',story:'About LXG',purpose:'Vision & mission',members:'Members',achievements:'Achievements',events:'Events'};
function navigatePage(moveFocus = false) {
 let id;
 try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { id = 'home'; }
 if (id === 'main') return;
 const target = document.getElementById(id);
 const page = pages.find(section => section === target || section.contains(target)) || pages.find(section => section.id === 'home');
 for (const section of pages) section.hidden = section !== page;
 for (const link of menuLinks) {
  if (link.hash === '#' + page.id) link.setAttribute('aria-current','page');
  else link.removeAttribute('aria-current');
 }
 document.title = pageNames[page.id] + ' | LXG — League of Extraordinary Gentlemen';
 if (moveFocus || (target && target !== page)) {
  requestAnimationFrame(() => {
   const destination = target && target !== page ? target : page.querySelector('h1,h2');
   destination.setAttribute('tabindex','-1');
   destination.focus({preventScroll:true});
   if (target && target !== page) destination.scrollIntoView({block:'start'});
   else window.scrollTo({top:0,behavior:'instant'});
  });
 }
}
window.addEventListener('hashchange', () => navigatePage(true));
document.addEventListener('click', event => {
 const link = event.target.closest('a[href^="#"]');
 if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
 if (link.hash === window.location.hash && link.hash !== '#main') {
  event.preventDefault();
  navigatePage(true);
 }
});
navigatePage();
