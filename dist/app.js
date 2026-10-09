'use strict';
const records = window.LXG_MEMBERS || [];
const members = Array.from({length:25},(_,i)=>records.find(m=>m.id===i+1)||{id:i+1});
const grid=document.querySelector('#member-grid');
const dialog=document.querySelector('#profile-dialog');
let lastTrigger;
const element=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el;};
function portrait(member,cls){
 const box=element('span',cls);
 if(member.photo){const image=element('img');image.src=member.photo;image.alt=`${member.name} — professional photograph`;image.loading='lazy';image.addEventListener('error',()=>{image.remove();box.append(element('strong','',member.name.split(' ').map(n=>n[0]).join('')),element('small','','Photograph unavailable'));},{once:true});box.append(image);}
 else{box.append(element('strong','',member.name?member.name.split(' ').map(n=>n[0]).join(''):'LXG'),element('small','','Photograph pending'));}
 return box;
}
function externalLink(title,url){const a=element('a','',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function showProfile(member,button){
 lastTrigger=button;
 const name=member.name||`Member ${String(member.id).padStart(2,'0')}`;
 dialog.querySelector('#profile-title').textContent=name;
 dialog.querySelector('.dialog-photo').replaceWith(portrait(member,'dialog-photo'));
 dialog.querySelector('#profile-status').textContent=member.role?[member.role,member.organization].filter(Boolean).join(' · '):member.organization||'Profile information pending';
 const list=dialog.querySelector('dl');list.replaceChildren();
 function row(label,value){const div=element('div');div.append(element('dt','',label));const dd=element('dd');if(typeof value==='string')dd.textContent=value;else dd.append(value);div.append(dd);list.append(div);}
 row('Professional discipline',member.discipline||'To be provided');row('Location',member.location||'To be provided');row('Biography',member.bio||'Biography pending.');row('Selected professional activities',member.highlights||'Details pending.');
 if(member.linkedin)row('Professional profile',externalLink('View LinkedIn profile',member.linkedin));
 if(member.socials){const links=element('div','source-links');member.socials.forEach(link=>links.append(externalLink(link.label,link.url)));row('Business profile',links);}
 if(member.sources){const links=element('div','source-links');member.sources.forEach(s=>links.append(externalLink(s.title,s.url)));if(member.photoSource)links.append(externalLink('Photograph source',member.photoSource));row('Sources',links);}
 if(member.note)row('Profile record',member.note+' Record reviewed '+(member.reviewed||'8 October 2026')+'.');
 dialog.showModal();
}
for(const member of members){
 const name=member.name||`Member ${String(member.id).padStart(2,'0')}`;
 const card=element('article','member-card');const button=element('button');button.type='button';button.setAttribute('aria-label',`View ${name} profile`);
 button.append(portrait(member,'photo'),element('span','member-name',name),element('span','member-role',member.role||'Profile information pending'));
 if(member.organization)button.append(element('span','member-status',member.organization));
 button.addEventListener('click',()=>showProfile(member,button));card.append(button);
 if(member.linkedin)card.append(externalLink('LinkedIn',member.linkedin));
 if(member.socials)member.socials.forEach(link=>card.append(externalLink(link.label,link.url)));
 grid.append(card);
}
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();});
dialog.addEventListener('close',()=>lastTrigger?.focus());
