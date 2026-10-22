const reply=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const hash=async x=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(x)))].map(n=>n.toString(16).padStart(2,'0')).join('');
export async function onRequest({request,env}){
if(!env.DB)return reply({error:'D1 DB binding missing'},503);
const db=env.DB,action=new URL(request.url).searchParams.get('action'),auth=request.headers.get('authorization')||'';
if(!auth.startsWith('Bearer '))return reply({error:'Connect your Couple Room first'},401);
try{
const me=await db.prepare('SELECT m.id,m.room_id,r.active FROM love_members m JOIN love_rooms r ON r.id=m.room_id WHERE m.token_hash=?').bind(await hash(auth.slice(7))).first();
if(!me||!me.active)return reply({error:'Room access is no longer valid'},401);
const other=await db.prepare('SELECT id FROM love_members WHERE room_id=? AND id<>?').bind(me.room_id,me.id).first();
if(!other)return reply({error:'Wait for your partner to join the room'},409);
let body={};if(request.method==='POST'){if(Number(request.headers.get('content-length')||0)>180000)return reply({error:'Upload too large'},413);body=await request.json()}
if(action==='list'&&request.method==='GET'){
const a=await db.prepare('SELECT id,name,created_at FROM shared_albums WHERE room_id=? ORDER BY created_at DESC LIMIT 25').bind(me.room_id).all();
const m=await db.prepare('SELECT s.id,s.album_id,s.title,s.memory_date,s.caption,s.photo_data,s.created_at,u.display_name AS author,s.author_id FROM shared_memories s JOIN love_members u ON u.id=s.author_id WHERE s.room_id=? ORDER BY s.created_at DESC LIMIT 100').bind(me.room_id).all();
return reply({albums:a.results||[],memories:(m.results||[]).map(x=>({...x,mine:x.author_id===me.id,author_id:undefined}))});}
if(action==='album'&&request.method==='POST'){
const name=String(body.name||'').trim().slice(0,60);if(!name)return reply({error:'Enter an album name'},400);
const n=await db.prepare('SELECT count(*) n FROM shared_albums WHERE room_id=?').bind(me.room_id).first();if(n.n>=25)return reply({error:'Limit of 25 albums reached'},429);
await db.prepare('INSERT INTO shared_albums VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),me.room_id,name,me.id,Date.now()).run();return reply({ok:true});}
if(action==='add'&&request.method==='POST'){
const album=await db.prepare('SELECT id FROM shared_albums WHERE id=? AND room_id=?').bind(String(body.album_id||''),me.room_id).first();if(!album)return reply({error:'Choose a shared album'},400);
const title=String(body.title||'').trim().slice(0,90),date=String(body.memory_date||''),caption=String(body.caption||'').slice(0,700),photo=body.photo_data||null;
if(!title||!/^\d{4}-\d{2}-\d{2}$/.test(date))return reply({error:'Enter a title and valid date'},400);
if(photo&&(typeof photo!=='string'||photo.length>130000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo)))return reply({error:'Photo must be a compressed JPEG under 100 KB'},413);
const n=await db.prepare('SELECT count(*) n FROM shared_memories WHERE room_id=?').bind(me.room_id).first();if(n.n>=100)return reply({error:'100-memory pilot limit reached'},429);
await db.prepare('INSERT INTO shared_memories VALUES(?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),me.room_id,album.id,me.id,title,date,caption,photo,Date.now()).run();return reply({ok:true});}
if(action==='delete'&&request.method==='POST'){
const r=await db.prepare('DELETE FROM shared_memories WHERE id=? AND room_id=? AND author_id=? RETURNING id').bind(String(body.id||''),me.room_id,me.id).first();return r?reply({ok:true}):reply({error:'Only the author can delete their memory'},403)}
return reply({error:'Unknown action'},404)
}catch(e){return reply({error:'Shared scrapbook database error. Run shared-scrapbook-schema.sql in D1.'},500)}
}
