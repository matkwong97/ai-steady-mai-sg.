const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const hash=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');
const day=86400000;

const FAMILIES=['Lumi','Ember','Moss','Tide'];
const ENDINGS=['ling','ora','fin','rix'];
const TRAITS=['gentle','playful','serene','bold'];
function formId(p){return (p.path||[p.egg||0]).join('-')}
function species(p){const path=p.path||[p.egg||0];const first=FAMILIES[path[0]%4];const suffix=path.slice(1).map((v,i)=>ENDINGS[(v+i)%4]).join('');return first+(suffix||' Egg')}
function enrich(p){if(!p)return p;if(!Number.isInteger(p.egg))p.egg=Math.abs((p.born||0)%4);if(!Array.isArray(p.path))p.path=[p.egg];if(p.path.length<Math.min(5,(p.stage||0)+1)){while(p.path.length<Math.min(5,(p.stage||0)+1))p.path.push(p.path.length===1?0:(p.egg+p.path.length)%4)}if(!p.discovered||typeof p.discovered!=='object')p.discovered={};if(!p.careTraits)p.careTraits={feed:0,touch:0,groom:0,play:0,rest:0};if(!p.history)p.history=[];if(!p.discovered[formId(p)])p.discovered[formId(p)]={id:formId(p),species:species(p),name:p.name||'',at:p.born||Date.now(),traits:{...p.careTraits}};return p}
function pickPath(p){const t=p.careTraits||{}, vals=[(t.touch||0)+(t.groom||0)*.7,(t.play||0)+(t.rest||0)*.3,(t.groom||0)+(t.rest||0),(t.feed||0)+(t.play||0)*.4];const total=vals.reduce((x,y)=>x+y,0);if(!total)return (p.egg+p.path.length)%4;const ranked=vals.map((v,i)=>({v,i})).sort((x,y)=>y.v-x.v||x.i-y.i);const quality=Math.round((p.hunger+p.happy+p.clean+p.energy+p.health)/5);return quality>=70?ranked[0].i:quality>=40?ranked[1].i:ranked[2].i}
function evolveOne(p){enrich(p);const next=p.path.length===1?0:pickPath(p);p.path.push(next);p.stage=p.path.length-1;p.discovered[formId(p)]={id:formId(p),species:species(p),name:p.name||'',at:Date.now(),traits:{...p.careTraits}};p.history.push({id:formId(p),species:species(p),at:Date.now()});p.events.unshift({at:Date.now(),actor:'Love Pet',action:'evolved into '+species(p)})}

const create=()=>({id:crypto.randomUUID(),name:'',color:'pink',born:Date.now(),updated:Date.now(),hunger:82,happy:85,clean:85,energy:85,health:100,stage:0,dead:false,paused:false,care:0,events:[],lastActor:'',lastAction:'',shared:true,egg:Math.floor(Math.random()*4),path:[],discovered:{},history:[],careTraits:{feed:0,touch:0,groom:0,play:0,rest:0}});
function stage(p){const age=Math.floor((Date.now()-p.born)/day);return p.dead?5:age<1?0:age<3?1:age<7?2:age<14?3:4}
function advance(p){enrich(p);if(p.dead)return p;const elapsed=Math.max(0,Math.min(30*day,Date.now()-(p.updated||Date.now())));p.updated=Date.now();if(p.paused)return p;const h=elapsed/3600000;p.hunger=Math.max(0,p.hunger-h*.75);p.happy=Math.max(0,p.happy-h*.46);p.clean=Math.max(0,p.clean-h*.36);p.energy=Math.max(0,p.energy-h*.28);const low=[p.hunger,p.happy,p.clean,p.energy].filter(x=>x<15).length;p.health=Math.max(0,Math.min(100,p.health+(low?-(low*h*.42):h*.1)));if(p.health<=0){p.dead=true;p.events.unshift({at:Date.now(),actor:'Love Pet',action:'passed away'})}else{const st=stage(p);while(p.stage<st&&st<5)evolveOne(p)}return p}
export async function onRequest({request,env}){
 if(!env.DB)return json({error:'D1 binding DB is missing'},503);
 const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');if(token.length<40)return json({error:'Connect your Couple Room first'},401);
 try{
 const db=env.DB,member=await db.prepare('SELECT m.id,m.room_id,m.display_name,r.active FROM love_members m JOIN love_rooms r ON r.id=m.room_id WHERE m.token_hash=?').bind(await hash(token)).first();
 if(!member||!member.active)return json({error:'Your Couple Room is not active'},401);
 const partner=await db.prepare('SELECT id FROM love_members WHERE room_id=? AND id<>? LIMIT 1').bind(member.room_id,member.id).first();if(!partner)return json({error:'Wait for your partner to join the room'},409);
 const action=new URL(request.url).searchParams.get('action');let data={};if(request.method==='POST'){try{data=await request.json()}catch{return json({error:'Invalid request'},400)}}
 if(!['get','create','care','rename','color','pause','restart','reset','delete'].includes(action))return json({error:'Unknown action'},404);
 if(action==='get'&&request.method!=='GET')return json({error:'Use GET'},405);
 if(action!=='get'&&request.method!=='POST')return json({error:'Use POST'},405);
 const row=await db.prepare('SELECT state_json FROM love_pets WHERE room_id=?').bind(member.room_id).first();let p=row?JSON.parse(row.state_json):null;
 if(action==='create'&&!p){p=create();await db.prepare('INSERT OR IGNORE INTO love_pets(room_id,state_json,updated_at) VALUES(?,?,?)').bind(member.room_id,JSON.stringify(p),Date.now()).run();const latest=await db.prepare('SELECT state_json FROM love_pets WHERE room_id=?').bind(member.room_id).first();return json({pet:JSON.parse(latest.state_json),you:member.display_name})}
 if(action==='get'||action==='create'){if(p){const before=row.state_json;p=advance(p);await db.prepare('UPDATE love_pets SET state_json=?,updated_at=? WHERE room_id=? AND state_json=?').bind(JSON.stringify(p),Date.now(),member.room_id,before).run();const latest=await db.prepare('SELECT state_json FROM love_pets WHERE room_id=?').bind(member.room_id).first();p=latest?JSON.parse(latest.state_json):p}return json({pet:p,you:member.display_name})}
 if(!p)return json({error:'Create your pet first'},404);
 if(action==='delete'){await db.prepare('DELETE FROM love_pets WHERE room_id=?').bind(member.room_id).run();return json({pet:null,you:member.display_name})}
 // Single-row optimistic concurrency control to avoid overwriting simultaneous partner actions.
 for(let attempt=0;attempt<3;attempt++){
 const old=row&&attempt===0?row:await db.prepare('SELECT state_json FROM love_pets WHERE room_id=?').bind(member.room_id).first();if(!old)return json({error:'Pet not found'},404);
 const before=old.state_json;p=advance(JSON.parse(before));
 if(action==='reset'){const old=p;p=create();p.discovered={...(old.discovered||{})};p.history=[...(old.history||[])];enrich(p)}
 else if(action==='restart'){if(!p.dead)return json({error:'A new egg is available after your pet passes away'},409);const old=p;p=create();p.discovered={...(old.discovered||{})};p.history=[...(old.history||[])];enrich(p)}
 else if(action==='pause'){p.paused=!p.paused}
 else if(action==='rename'){const name=String(data.name||'').trim().slice(0,24);if(!name)return json({error:'Enter a pet name'},400);p.name=name;const rec=p.discovered[formId(p)];if(rec)rec.name=name}
 else if(action==='color'){if(!['blue','red','pink','orange','green'].includes(data.color))return json({error:'Choose a valid case colour'},400);p.color=data.color}
 else if(action==='care'){
 if(p.dead||p.paused||stage(p)===0)return json({error:stage(p)===0?'Your egg is incubating. Care actions unlock after hatching.':'The pet cannot receive care right now'},409);
 const effects={feed:['hunger',24,'fed'],touch:['happy',22,'cuddled'],groom:['clean',27,'groomed'],play:['happy',19,'played with'],rest:['energy',28,'rested with']};const effect=effects[data.kind];if(!effect)return json({error:'Unknown care action'},400);
 const [key,amount,verb]=effect;p[key]=Math.min(100,p[key]+amount);if(data.kind==='play')p.energy=Math.max(0,p.energy-9);p.health=Math.min(100,p.health+3);p.care=(p.care||0)+1;p.careTraits[data.kind]=(p.careTraits[data.kind]||0)+1;p.lastActor=member.display_name;p.lastAction=verb;p.events.unshift({at:Date.now(),actor:member.display_name,action:verb});
 }
 p.events=p.events.slice(0,25);p.updated=Date.now();
 const r=await db.prepare('UPDATE love_pets SET state_json=?,updated_at=? WHERE room_id=? AND state_json=?').bind(JSON.stringify(p),Date.now(),member.room_id,before).run();if(r.meta?.changes===1)return json({pet:p,you:member.display_name});
 }
 return json({error:'Your partner updated the pet at the same time. Please try again.'},409);
 }catch(e){return json({error:'Love Pet service unavailable. Confirm the new D1 schema has been applied.'},500)}
}
