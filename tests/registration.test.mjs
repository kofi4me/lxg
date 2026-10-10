import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import worker from '../worker/index.mjs';
function fixture(){
 const sqlite=new DatabaseSync(':memory:');
 const wrap=(sql,args=[])=>({bind(...values){return wrap(sql,values);},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){return sqlite.prepare(sql).run(...args);}});
 return {DB:{prepare:sql=>wrap(sql),batch:queries=>Promise.all(queries.map(q=>q.all()))},ADMIN_PASSWORD:'test-only-password-at-least-16',ASSETS:{fetch:()=>new Response('asset')}};
}
function request(path,body,token='',ip='192.0.2.1'){
 return new Request('https://lxg.test'+path,{method:body===undefined?'GET':'POST',headers:{Origin:'https://lxg.test','Content-Type':'application/json','CF-Connecting-IP':ip,...(token?{Cookie:token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
}
const record={name:'Test & Member',email:'member@example.com',phone:'+233 123',attendance:'yes',consent:true};
test('registrations persist, require consent and cannot overwrite existing responses',async()=>{
 const env=fixture();
 let r=await worker.fetch(request('/api/registrations',{...record,consent:false}),env);assert.equal(r.status,400);
 r=await worker.fetch(request('/api/registrations',record),env);assert.equal(r.status,201);assert.equal((await r.json()).reference,'LXG-1');
 r=await worker.fetch(request('/api/registrations',{...record,email:'MEMBER@example.com',attendance:'no'}),env);assert.equal(r.status,409);
 const row=await env.DB.prepare('SELECT * FROM registrations').first();assert.equal(row.attendance,'yes');assert.equal(row.consent_version,'2026-10-10');
});
test('admin data and exports require login, secure session cookie, and logout revokes access',async()=>{
 const env=fixture();await worker.fetch(request('/api/registrations',{...record,name:'=FORMULA'}),env);
 assert.equal((await worker.fetch(request('/api/admin/registrations'),env)).status,401);
 assert.equal((await worker.fetch(request('/api/admin/export'),env)).status,401);
 assert.equal((await worker.fetch(request('/api/admin/login',{password:'wrong'}),env)).status,401);
 const login=await worker.fetch(request('/api/admin/login',{password:env.ADMIN_PASSWORD}),env);assert.equal(login.status,200);
 const cookie=login.headers.get('Set-Cookie');assert.match(cookie,/HttpOnly; Secure; SameSite=Strict/);const token=cookie.split(';')[0];
 const list=await(await worker.fetch(request('/api/admin/registrations',undefined,token),env)).json();assert.equal(list.stats.attending,1);assert.equal(list.registrations[0].email,record.email);
 const filtered=await(await worker.fetch(request('/api/admin/registrations?search=nobody',undefined,token),env)).json();assert.equal(filtered.total,0);
 const csv=await(await worker.fetch(request('/api/admin/export',undefined,token),env)).text();assert(csv.includes("'=FORMULA"));assert(csv.includes("'+233"));
 await worker.fetch(request('/api/admin/logout',{},token),env);assert.equal((await worker.fetch(request('/api/admin/registrations',undefined,token),env)).status,401);
});
test('cross-origin submissions, oversized bodies, missing storage and rate limits are handled',async()=>{
 const env=fixture();const foreign=new Request('https://lxg.test/api/registrations',{method:'POST',headers:{Origin:'https://other.test','Content-Type':'application/json'},body:JSON.stringify(record)});
 assert.equal((await worker.fetch(foreign,env)).status,403);
 assert.equal((await worker.fetch(request('/api/registrations',null),env)).status,400);
 assert.equal((await worker.fetch(request('/api/registrations',{...record,name:'a'.repeat(5000)}),env)).status,400);
 assert.equal((await worker.fetch(request('/api/registrations',record),{ADMIN_PASSWORD:env.ADMIN_PASSWORD})).status,503);
 for(let i=0;i<8;i++)await worker.fetch(request('/api/admin/login',{password:'bad'},'','192.0.2.2'),env);
 assert.equal((await worker.fetch(request('/api/admin/login',{password:'bad'},'','192.0.2.2'),env)).status,429);
 assert.equal(await(await worker.fetch(request('/'),env)).text(),'asset');
});

test('expired sessions and changed passwords revoke access',async()=>{
 const env=fixture();const login=await worker.fetch(request('/api/admin/login',{password:env.ADMIN_PASSWORD}),env);const token=login.headers.get('Set-Cookie').split(';')[0];
 env.ADMIN_PASSWORD='a-different-test-secret-password';assert.equal((await worker.fetch(request('/api/admin/registrations',undefined,token),env)).status,401);
 env.ADMIN_PASSWORD='test-only-password-at-least-16';await env.DB.prepare('UPDATE admin_sessions SET expires_at=0').run();assert.equal((await worker.fetch(request('/api/admin/registrations',undefined,token),env)).status,401);
});
