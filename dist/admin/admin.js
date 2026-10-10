const $=s=>document.querySelector(s);
let page=1,total=0,busy=false,search='',attendance='';
function showLogin(){ $('#login-panel').hidden=false;$('#dashboard').hidden=true;$('#registrations').replaceChildren(); }
async function api(path,options={}){
 const response=await fetch(path,{credentials:'same-origin',cache:'no-store',...options});
 if(response.status===401){showLogin();let data;try{data=await response.json();}catch{}throw new Error(data?.error||'Please sign in.');}
 if(!response.ok){let data;try{data=await response.json();}catch{}throw new Error(data?.error||(response.status===404?'The Admin service has not been deployed. Deploy the latest GitHub commit to the lxg Worker.':'Unable to complete this request.'));}
 return response;
}
async function load(){
 if(busy)return;busy=true;$('#refresh').disabled=true;
 try{
  const query=new URLSearchParams({page,search,attendance});
  const data=await (await api('/api/admin/registrations?'+query)).json();
  $('#login-panel').hidden=true;$('#dashboard').hidden=false;$('#admin-status').textContent='';
  total=data.total;for(const key of ['total','attending','declined'])$('#'+key).textContent=data.stats[key];
  const body=$('#registrations');body.replaceChildren();
  for(const row of data.registrations){const tr=document.createElement('tr');for(const value of [`LXG-${row.id}`,row.name,row.email,row.phone||'—',row.attendance==='yes'?'Attending':'Unable to attend',new Date(row.created_at).toLocaleString()]){const td=document.createElement('td');td.textContent=value;tr.append(td);}const td=document.createElement('td'),details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='View preferences';details.append(summary);const d=row.details||{};
  const labels={both:'Both days',friday:'Friday only',saturday:'Saturday only',jollof:'Jollof rice with grilled chicken',waakye:'Waakye',banku:'Banku with grilled tilapia',fufu:'Fufu with light soup',ampesi:'Ampesi with palava sauce',kenkey:'Kenkey with fish and pepper',vegetarian:'Vegetarian meal',assistance:'Accommodation information requested',own:'Own arrangements',none:'No overnight stay',shared:'Shared transport',boat:'Boat riding','jet-ski':'Jet skiing',golf:'Golf',games:'Group games'};
  for(const [label,value] of [['Days',d.days],['Meal',d.meal],['Accommodation',d.accommodation],['Transport',d.transport],['Travelling from',d.travelFrom],['Activities',(d.activities||[]).map(x=>labels[x]||x).join(', ')],['Dietary requirements',d.dietary],['Other arrangements',d.notes]]){const p=document.createElement('p');p.textContent=label+': '+(labels[value]||value||'Not specified');details.append(p);}td.append(details);tr.append(td);body.append(tr);}
  $('#empty').hidden=data.registrations.length>0;
  $('#results-caption').textContent=`${total} registration${total===1?'':'s'} matching this view`;
  $('#page-label').textContent=`Page ${page} of ${Math.max(1,Math.ceil(total/50))}`;
  $('#previous').disabled=page<=1;$('#next').disabled=page*50>=total;
 }catch(error){$('#admin-status').textContent=error.message;}finally{busy=false;$('#refresh').disabled=false;}
}
$('#login-form').addEventListener('submit',async event=>{
 event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;
 try{await api('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('#admin-password').value})});$('#admin-password').value='';page=1;await load();}catch(error){$('#admin-status').textContent=error.message;}finally{button.disabled=false;}
});
$('#filters').addEventListener('submit',event=>{event.preventDefault();if(busy)return;const data=new FormData(event.target);search=data.get('search');attendance=data.get('attendance');page=1;load();});
$('#refresh').addEventListener('click',()=>load());
$('#previous').addEventListener('click',()=>{if(!busy&&page>1){page--;load();}});
$('#next').addEventListener('click',()=>{if(!busy&&page*50<total){page++;load();}});
$('#logout').addEventListener('click',async()=>{try{await api('/api/admin/logout',{method:'POST'});showLogin();$('#admin-status').textContent='You have signed out.';}catch(error){$('#admin-status').textContent=error.message;}});
$('#export').addEventListener('click',async()=>{const button=$('#export');button.disabled=true;try{const blob=await(await api('/api/admin/export')).blob();const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='lxg-reunion-registrations.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){$('#admin-status').textContent=error.message;}finally{button.disabled=false;}});
load();
