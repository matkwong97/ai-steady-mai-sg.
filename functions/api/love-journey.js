const reply=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}});
const hash=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
export async function onRequest({request,env}){
 if(!env.DB)return reply({error:'D1 binding DB is missing.'},503);
 const action=new URL(request.url).searchParams.get('action'),auth=request.headers.get('authorization')||'';
 if(!auth.startsWith('Bearer ')||auth.length>300)return reply({error:'Connect your Couple Room first.'},401);
 try{
 const db=env.DB,me=await db.prepare('SELECT m.id,m.room_id,r.active FROM love_members m JOIN love_rooms r ON r.id=m.room_id WHERE m.token_hash=?').bind(await hash(auth.slice(7))).first();
 if(!me||!me.active)return reply({error:'Your Couple Room access is no longer valid.'},401);
 const partner=await db.prepare('SELECT id FROM love_members WHERE room_id=? AND id<>?').bind(me.room_id,me.id).first();
 if(!partner)return reply({error:'Your partner must join the Couple Room before sharing challenges.'},409);
 if(action==='list'&&request.method==='GET'){
 const a=await db.prepare(`SELECT s.challenge_id, COALESCE(p.done,0) AS my_done, COALESCE(q.done,0) AS partner_done
 FROM love_journey_shared s
 LEFT JOIN love_journey_progress p ON p.room_id=s.room_id AND p.challenge_id=s.challenge_id AND p.member_id=?
 LEFT JOIN love_journey_progress q ON q.room_id=s.room_id AND q.challenge_id=s.challenge_id AND q.member_id=?
 WHERE s.room_id=? ORDER BY s.created_at DESC LIMIT 72`).bind(me.id,partner.id,me.room_id).all();
 return reply({items:(a.results||[]).map(x=>({challenge_id:x.challenge_id,my_status:x.my_done?'done':'pending',partner_status:x.partner_done?'done':'pending'}))});
 }
 if(request.method!=='POST')return reply({error:'Unknown action.'},404);
 if(Number(request.headers.get('content-length')||0)>2048)return reply({error:'Request too large.'},413);
 const b=await request.json(),id=String(b.challenge_id||'');
 if(!/^LJ(0[0-6][0-9]|07[0-2])$/.test(id)||id==='LJ000')return reply({error:'Invalid challenge.'},400);
 if(action==='share'){
 await db.prepare('INSERT OR IGNORE INTO love_journey_shared(room_id,challenge_id,shared_by,created_at) VALUES(?,?,?,?)').bind(me.room_id,id,me.id,Date.now()).run();
 return reply({ok:true});
 }
 if(action==='progress'){
 const exists=await db.prepare('SELECT 1 AS yes FROM love_journey_shared WHERE room_id=? AND challenge_id=?').bind(me.room_id,id).first();
 if(!exists)return reply({error:'Share this challenge with your partner first.'},404);
 await db.prepare(`INSERT INTO love_journey_progress(room_id,challenge_id,member_id,done,updated_at) VALUES(?,?,?,?,?)
 ON CONFLICT(room_id,challenge_id,member_id) DO UPDATE SET done=excluded.done,updated_at=excluded.updated_at`).bind(me.room_id,id,me.id,b.done===true?1:0,Date.now()).run();
 return reply({ok:true});
 }
 return reply({error:'Unknown action.'},404);
 }catch(e){return reply({error:'Love Journey database request failed. Check love-journey-schema.sql was executed in D1.'},500)}
}
