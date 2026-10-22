const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const hash=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');
const day=86400000;
const create=()=>({id:crypto.randomUUID(),name:'',color:'pink',born:Date.now(),updated:Date.now(),hunger:82,happy:85,clean:85,energy:85,health:100,stage:0,dead:false,paused:false,care:0,events:[],lastActor:'',lastAction:'',shared:true});
function stage(p){const age=Math.floor((Date.now()-p.born)/day);return p.dead?4:age<1?0:age<3?1:age<7?2:3}
function advance(p){if(p.dead)return p;const elapsed=Math.max(0,Math.min(30*day,Date.now()-(p.updated||Date.now())));p.updated=Date.now();if(p.paused)return p;const h=elapsed/3600000;p.hunger=Math.max(0,p.hunger-h*.75);p.happy=Math.max(0,p.happy-h*.46);p.clean=Math.max(0,p.clean-h*.36);p.energy=Math.max(0,p.energy-h*.28);const low=[p.hunger,p.happy,p.clean,p.energy].filter(x=>x<15).length;p.health=Math.max(0,Math.min(100,p.health+(low?-(low*h*.42):h*.1)));if(p.health<=0){p.dead=true;p.events.unshift({at:Date.now(),actor:'Love Pet',action:'passed away'})}else{const st=stage(p);if(st>p.stage){p.stage=st;p.events.unshift({at:Date.now(),actor:'Love Pet',action:st===1?'hatched':'evolved'})}}return p}
export async function onRequest({request,env}){
 if(!env.DB)return json({error:'D1 binding DB is missing'},503);
 const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');if(token.length<40)return json({error:'Connect your Couple Room first'},401);
 try{
 const db=env.DB,member=await db.prepare('SELECT m.id,m.room_id,m.display_name,r.active FROM love_members m JOIN love_rooms r ON r.id=m.room_id WHERE m.token_hash=?').bind(await hash(token)).first();
 if(!member||!member.active)return json({error:'Your Couple Room is not active'},401);
 const partner=await db.prepare('SELECT id FROM love_members WHERE room_id=? AND id<>? LIMIT 1').bind(member.room_id,member.id).first();if(!partner)return json({error:'Wait for your partner to join the room'},409);
 const action=new URL(request.url).searchParams.get('action');let data={};if(request.method==='POST'){try{data=await request.json()}catch{return json({error:'Invalid request'},400)}}
 if(!['get','create','care','rename','color','pause','restart'].includes(action))return json({error:'Unknown action'},404);
 if(action==='get'&&request.method!=='GET')return json({error:'Use GET'},405);
 if(action!=='get'&&request.method!=='POST')return json({error:'Use POST'},405);
 const row=await db.prepare('SELECT state_json FROM love_pets WHERE room_id=?').bind(member.room_id).first();let p=row?JSON.parse(row.state_json):null;
 if(action==='create'&&!p){p=create();await db.prepare('INSERT OR IGNORE INTO love_pets(room_id,state_json,updated_at) VALUES(?,?,?)').bind(member.room_id,JSON.stringify(p),Date.now()).run();const latest=await db.prepare('SELECT state_json FROM love_pets WHERE room_id=?').bind(member.room_id).first();return json({pet:JSON.parse(latest.state_json),you:member.display_name})}
 if(action==='get'||action==='create')return json({pet:p?advance(p):null,you:member.display_name});
 if(!p)return json({error:'Create your pet first'},404);
 // Single-row optimistic concurrency control to avoid overwriting simultaneous partner actions.
 for(let attempt=0;attempt<3;attempt++){
 const old=row&&attempt===0?row:await db.prepare('SELECT state_json FROM love_pets WHERE room_id=?').bind(member.room_id).first();if(!old)return json({error:'Pet not found'},404);
 const before=old.state_json;p=advance(JSON.parse(before));
 if(action==='restart'){if(!p.dead)return json({error:'A new egg is available after your pet passes away'},409);p=create()}
 else if(action==='pause'){p.paused=!p.paused}
 else if(action==='rename'){const name=String(data.name||'').trim().slice(0,24);if(!name)return json({error:'Enter a pet name'},400);p.name=name}
 else if(action==='color'){if(!['blue','red','pink','orange','green'].includes(data.color))return json({error:'Choose a valid case colour'},400);p.color=data.color}
 else if(action==='care'){
 if(p.dead||p.paused)return json({error:'The pet cannot receive care right now'},409);
 const effects={feed:['hunger',24,'fed'],touch:['happy',22,'cuddled'],groom:['clean',27,'groomed'],play:['happy',19,'played with'],rest:['energy',28,'rested with']};const effect=effects[data.kind];if(!effect)return json({error:'Unknown care action'},400);
 const [key,amount,verb]=effect;p[key]=Math.min(100,p[key]+amount);if(data.kind==='play')p.energy=Math.max(0,p.energy-9);p.health=Math.min(100,p.health+3);p.care=(p.care||0)+1;p.lastActor=member.display_name;p.lastAction=verb;p.events.unshift({at:Date.now(),actor:member.display_name,action:verb});
 }
 p.events=p.events.slice(0,25);p.updated=Date.now();
 const r=await db.prepare('UPDATE love_pets SET state_json=?,updated_at=? WHERE room_id=? AND state_json=?').bind(JSON.stringify(p),Date.now(),member.room_id,before).run();if(r.meta?.changes===1)return json({pet:p,you:member.display_name});
 }
 return json({error:'Your partner updated the pet at the same time. Please try again.'},409);
 }catch(e){return json({error:'Love Pet service unavailable. Confirm the new D1 schema has been applied.'},500)}
}
