import schema from './schema.mjs';
const initialized = new WeakMap();
async function initialize(db) {
 if (!initialized.has(db)) initialized.set(db, (async()=>{
  await db.batch(schema.map(sql=>db.prepare(sql)));
  const columns=await db.prepare('PRAGMA table_info(registrations)').all();
  if(!columns.results.some(column=>column.name==='details_json')){
   try {await db.prepare("ALTER TABLE registrations ADD COLUMN details_json TEXT NOT NULL DEFAULT '{}'").run();}
   catch(error){const check=await db.prepare('PRAGMA table_info(registrations)').all();if(!check.results.some(column=>column.name==='details_json'))throw error;}
  }
 })().catch(error=>{initialized.delete(db);throw error;}));
 await initialized.get(db);
}
function preferences(body){
 const d=body.details??{};
 if(typeof d!=='object'||Array.isArray(d))throw new Error('Invalid preferences');
 const result={};
 const choices={days:['','both','friday','saturday'],meal:['','jollof','waakye','banku','fufu','ampesi','kenkey','vegetarian'],accommodation:['','assistance','own','none'],transport:['','own','shared']};
 for(const [key,options] of Object.entries(choices)){const value=d[key]??'';if(!options.includes(value))throw new Error('Invalid preference');result[key]=value;}
 for(const [key,max] of Object.entries({travelFrom:80,dietary:200,notes:300})){const value=d[key]??'';if(typeof value!=='string'||value.length>max)throw new Error('Invalid preference');result[key]=value.trim();}
 const activities=d.activities??[];if(!Array.isArray(activities)||activities.length>4||activities.some(x=>!['boat','jet-ski','golf','games'].includes(x)))throw new Error('Invalid activities');
 result.activities=[...new Set(activities)];return body.attendance==='no'?{}:result;
}
function withDetails(row){let details={};try{details=JSON.parse(row.details_json||'{}');}catch{}const {details_json,...rest}=row;return {...rest,details};}
const EVENT = 'lxg-reunion-2026';
const COOKIE = '__Host-lxg_admin';
const encoder = new TextEncoder();
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const hash = async value => [...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');
const cookie = (value, age) => `${COOKIE}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${age}`;
async function safeEqual(a,b) {
 const x=await hash(a),y=await hash(b);let diff=0;for(let i=0;i<x.length;i++)diff|=x.charCodeAt(i)^y.charCodeAt(i);return diff===0;
}
async function session(request,env) {
 const token=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 if(!token||token.length>100)return null;
 const key=await hash(env.ADMIN_PASSWORD+':'+token);
 const row=await env.DB.prepare('SELECT token_hash FROM admin_sessions WHERE token_hash=? AND expires_at>?').bind(key,Date.now()).first();
 return row?key:null;
}
async function limited(request,env,kind,max,seconds) {
 // Hash the IP with the admin secret; never store raw visitor IP addresses.
 const bucket=Math.floor(Date.now()/(seconds*1000));
 const key=await hash(`${env.ADMIN_PASSWORD}:${kind}:${request.headers.get('CF-Connecting-IP')||'local'}:${bucket}`);
 const row=await env.DB.prepare('INSERT INTO request_limits(key,hits,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1 RETURNING hits').bind(key,(bucket+1)*seconds*1000).first();
 await env.DB.batch([env.DB.prepare('DELETE FROM request_limits WHERE expires_at<?').bind(Date.now()),env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<?').bind(Date.now())]);
 return row.hits>max;
}
async function readBody(request) {
 if(!request.headers.get('Content-Type')?.includes('application/json'))throw new Error('invalid');
 if(Number(request.headers.get('Content-Length')||0)>4096)throw new Error('invalid');
 const reader=request.body?.getReader();if(!reader)throw new Error('invalid');
 let size=0;const chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();throw new Error('invalid');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 return JSON.parse(new TextDecoder().decode(bytes));
}
function csvCell(value){let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export default {async fetch(request,env) {
 const url=new URL(request.url),path=url.pathname;
 if(!path.startsWith('/api/'))return env.ASSETS.fetch(request);
 if(path==='/api/health'&&request.method==='GET')return json({release:'2026-10-10-menu',registrationReady:!!env.DB&&!!env.ADMIN_PASSWORD&&env.ADMIN_PASSWORD.length>=16});
 if(!env.DB||!env.ADMIN_PASSWORD||env.ADMIN_PASSWORD.length<16)return json({error:'Registration service is being configured. Please contact the organiser.'},503);
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)return json({error:'Request not permitted.'},403);
 try {
  await initialize(env.DB);
  if(path==='/api/registrations'&&request.method==='POST'){
   if(await limited(request,env,'registration',10,60))return json({error:'Too many attempts. Please wait a minute and try again.'},429);
   let body;try{body=await readBody(request);}catch{return json({error:'Please check your registration details.'},400);}
   if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Please check your registration details.'},400);
   if(body.website)return json({error:'Unable to accept this registration.'},400);
   const name=typeof body.name==='string'?body.name.trim():'';
   const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
   const phone=typeof body.phone==='string'?body.phone.trim():'';
   if(!name||name.length>120||/[\x00-\x1f]/.test(name)||email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||phone.length>40||!['yes','no'].includes(body.attendance)||body.consent!==true)return json({error:'Enter your name, a valid email, attendance response and consent.'},400);
   let details;try{details=preferences(body);}catch{return json({error:'Please check the meal and visit preferences.'},400);}
   const row=await env.DB.prepare('INSERT INTO registrations(event_id,name,email,phone,attendance,consent_version,details_json) VALUES(?,?,?,?,?,?,?) ON CONFLICT(event_id,email) DO NOTHING RETURNING id').bind(EVENT,name,email,phone,body.attendance,'2026-10-10',JSON.stringify(details)).first();
   if(!row)return json({error:'This email already has a registration. Contact gr8owusu222@gmail.com to request changes.'},409);
   return json({ok:true,reference:`LXG-${row.id}`},201);
  }
  if(path==='/api/admin/login'&&request.method==='POST'){
   if(await limited(request,env,'login',8,900))return json({error:'Too many login attempts. Try again in 15 minutes.'},429);
   let body;try{body=await readBody(request);}catch{return json({error:'Invalid login request.'},400);}
   if(!body||typeof body.password!=='string'||!await safeEqual(body.password,env.ADMIN_PASSWORD))return json({error:'Incorrect password.'},401);
   const token=crypto.randomUUID()+crypto.randomUUID();
   await env.DB.prepare('INSERT INTO admin_sessions(token_hash,expires_at) VALUES(?,?)').bind(await hash(env.ADMIN_PASSWORD+':'+token),Date.now()+8*3600000).run();
   return json({ok:true},200,{'Set-Cookie':cookie(token,8*3600)});
  }
  if(path.startsWith('/api/admin/')){
   const key=await session(request,env);if(!key)return json({error:'Please sign in.'},401);
   if(path==='/api/admin/logout'&&request.method==='POST'){
    await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(key).run();
    return json({ok:true},200,{'Set-Cookie':cookie('',0)});
   }
   if(path==='/api/admin/registrations'&&request.method==='GET'){
    const page=Math.max(1,Math.min(10000,parseInt(url.searchParams.get('page'),10)||1));
    const search=(url.searchParams.get('search')||'').slice(0,120);
    const attendance=['yes','no'].includes(url.searchParams.get('attendance'))?url.searchParams.get('attendance'):'';
    const where="event_id=? AND (?='' OR instr(lower(name),lower(?))>0 OR instr(lower(email),lower(?))>0) AND (?='' OR attendance=?)";
    const args=[EVENT,search,search,search,attendance,attendance];
    const [rows,count,stats]=await env.DB.batch([
     env.DB.prepare(`SELECT id,name,email,phone,attendance,created_at,details_json FROM registrations WHERE ${where} ORDER BY id DESC LIMIT 50 OFFSET ?`).bind(...args,(page-1)*50),
     env.DB.prepare(`SELECT count(*) AS total FROM registrations WHERE ${where}`).bind(...args),
     env.DB.prepare("SELECT count(*) AS total,coalesce(sum(attendance='yes'),0) AS attending,coalesce(sum(attendance='no'),0) AS declined FROM registrations WHERE event_id=?").bind(EVENT)
    ]);
    return json({registrations:rows.results.map(withDetails),total:count.results[0].total,stats:stats.results[0],page,pageSize:50});
   }
   if(path==='/api/admin/export'&&request.method==='GET'){
    const {results}=await env.DB.prepare('SELECT id,name,email,phone,attendance,created_at,details_json FROM registrations WHERE event_id=? ORDER BY id LIMIT 10001').bind(EVENT).all();
    if(results.length>10000)return json({error:'Export exceeds 10,000 records. Please export from Cloudflare D1.'},413);
    const csv=[['Reference','Name','Email','Phone','Attendance','Submitted (UTC)','Days','Meal preference','Accommodation','Transport','Travelling from','Activities','Dietary requirements','Other arrangements'],...results.map(withDetails).map(r=>[`LXG-${r.id}`,r.name,r.email,r.phone,r.attendance==='yes'?'Attending':'Unable to attend',r.created_at,r.details.days,r.details.meal,r.details.accommodation,r.details.transport,r.details.travelFrom,(r.details.activities||[]).join('; '),r.details.dietary,r.details.notes])].map(r=>r.map(csvCell).join(',')).join('\r\n');
    return new Response('\uFEFF'+csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="lxg-reunion-registrations.csv"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
   }
  }
  return json({error:'Not found.'},404);
 } catch {return json({error:'The registration service is temporarily unavailable. Please try again later.'},503);}
}};
