/* AI Steady Mai SG — friend conversations. Chat history is stored locally on this device. */
const friendStages=['Before a relationship','Dating and getting to know each other','Committed relationship','Marriage and married life'];
const friendVoices=[
  'Thoughtful, observant, gently direct. Sometimes cheeky with a light Singaporean lah. Asks good questions, respects boundaries.',
  'Energetic, playful, upbeat and practical; light Singlish like aiyo or bestie occasionally. Suggests creative affordable plans.',
  'Warm, steady, emotionally perceptive. Encourages teamwork, listening and repair after disagreements, not scorekeeping.',
  'Grounded, calm, mature and organised. Talks practical household teamwork, family boundaries, finances and married life.'
];
let friendQuoteBank=null;
fetch('friend-quotes.json').then(r=>r.ok?r.json():null).then(x=>{if(x&&x.length===4){friendQuoteBank=x;const el=document.getElementById('friend-quote');if(el&&page.startsWith('friend')){const i=Number(page.slice(-1));el.textContent='“'+pickFriendQuote(i)+'”';}}}).catch(()=>{});
function pickFriendQuote(i){const bank=friendQuoteBank?.[i]||quotes[i];const last=load('quoteLast'+i,-1);let index=Math.floor(Math.random()*bank.length);if(index===last)index=(index+1)%bank.length;store('quoteLast'+i,index);return bank[index]}
function todayQuote(i){return `<p id="friend-quote" class="quote">“${esc(pickFriendQuote(i))}”</p>${friendOccasion(i)}`}
function friendOccasion(i){const now=new Date(),month=now.getMonth()+1,day=now.getDate(),d=load('milestones',{}),w=load('wedding',{});let occasion='';if(month===2&&day===14)occasion=`Happy Valentine's Day! Whether you're single, dating or married, kindness starts with how you treat yourself and each other. 💝`;
const candidates=[d['Officially together']?.date,d.anniversary,d.date,d.startDate,w.date,load('anniversary','')].filter(Boolean);
if(candidates.some(x=>{const m=String(x).match(/^(\d{4})-(\d{2})-(\d{2})/);return m&&Number(m[2])===month&&Number(m[3])===day}))occasion=`Happy anniversary! 🎉 Take a moment to celebrate what you've learned together, not just the highlight reel.`;
return occasion?`<div class="event-wish" role="note"><strong>${esc(name(i))} says:</strong> ${esc(occasion)}</div>`:''}
function friendChatInvitation(i){return `<div class="card chat-invite"><h2>Something to tell me? 💬</h2><p>Good news, confusing feelings or a tricky situation? I'm here to listen and help you think through the next step.</p><button onclick="go('chat${i}')">Text ${esc(name(i))} →</button><p class="small muted">Works offline without an API key. Guided replies use topic recognition, not generative AI. Avoid sharing sensitive identifying details.</p></div>`}
function chatKey(i){return 'chat_'+(profile.gender==='female'?'female':'male')+'_'+i}
function getChat(i){return load(chatKey(i),[]).filter(x=>['user','assistant'].includes(x.role)&&typeof x.content==='string').slice(-32)}
function putChat(i,items){store(chatKey(i),items.slice(-32))}
function chatPage(i){if(!(i>=0&&i<=3))return '<p>Friend not found.</p>';
 const person=esc(name(i)),photo=`assets/${profile.gender==='female'?'women':'men'}-${i}.jpg`,messages=getChat(i);
 const starter=['Hey! Tell me what’s on your mind. No need to impress anyone here.','Aiyo, what happened? Good news or dating drama, I’m listening!','Hey you. How are things between you two? We can work through it together.','Hello! Married life has its ups and downs. What would you like to talk through?'][i];
 return `<div class="chat-head"><img src="${photo}" alt="${person}'s portrait"><div><strong>${person}</strong><div class="small muted">${esc(friendStages[i])} · Digital friend</div></div></div><div id="chat-log" class="chat-log" aria-live="polite">${messages.length?messages.map(m=>`<div class="bubble ${m.role==='user'?'mine':'theirs'}">${esc(m.content)}</div>`).join(''):`<div class="bubble theirs">${esc(starter)}</div>`}</div><form id="chat-form" class="chat-form" onsubmit="sendFriendMessage(event,${i})"><label for="chat-text" class="hidden">Message ${person}</label><textarea id="chat-text" maxlength="1500" rows="2" placeholder="Text ${person}..." required></textarea><button id="chat-send" type="submit">Send</button></form><p id="chat-status" class="chat-note" role="status" aria-live="polite">Offline guided replies (not generative AI). Responses may miss nuance. Not a counsellor or emergency service.</p><details><summary>Conversation & privacy</summary><p class="small">Messages are saved only in this browser on this device and are not sent to an AI service by this chat feature. Clear the conversation anytime. Anyone with access to this browser may see the history. Avoid sensitive identifying details.</p><button class="secondary" onclick="clearFriendChat(${i})">Clear this conversation</button></details><div class="card"><h3>Useful resources for this stage</h3>${links(i)}</div>`}
function clearFriendChat(i){if(!confirm('Clear this conversation from this device?'))return;store(chatKey(i),[]);render()}

/* Offline conversational guide: rule-based, not a language model.
   All matching, templates and conversation state stay on this device. */
const offlineTopics=[
 {id:'safety',terms:/\b(abuse|abusive|violent|violence|hit|slap|punch|threat|threaten|stalk|stalking|coerc|unsafe|fear for my safety|scared of (him|her|them)|forced sex|sexual assault|controlling me|lock me in|hurt me)\b/i,
 steps:["Your safety matters more than preserving a relationship. If you are in immediate danger in Singapore, call 999; for an ambulance, 995.","If it is safe, move somewhere secure and tell someone you trust what is happening. You do not owe anyone another chance when they are hurting or threatening you.","Consider contacting a Family Service Centre or a specialist support service. Avoid confronting someone who may retaliate."]},
 {id:'crisis',terms:/\b(suicid|kill myself|end my life|self.harm|hurt myself|want to die)\b/i,
 steps:["I'm concerned about your wellbeing. Please reach out to a trusted person right now and tell them clearly you need support.","If you may act on these thoughts or are in immediate danger, call 995 in Singapore or go to the nearest emergency department.","You deserve real human support; a simple app cannot provide crisis care."]},
 {id:'boundaries',terms:/\b(jealous|jealousy|possessive|check my phone|privacy|boundar|control|manipulat|gaslight|isolate|respect)\b/i,
 steps:["Name the behaviour that worries you and how it affects your sense of safety or freedom.","State a specific boundary in plain language, such as 'I need privacy and respectful conversations.'","Watch whether that boundary is respected over time. Repeated intimidation or coercion isn't something you need to tolerate."]},
 {id:'trust',terms:/\b(cheat|cheating|affair|unfaithful|betray|lied|lying|secret|trust|dishonest|ghost)\b/i,
 steps:["Separate what you know from what you're worried might be happening.","Describe the behaviour that affected your trust and ask for a direct, honest conversation.","Decide what changes you would need to see consistently. You can choose not to continue if trust cannot be rebuilt."]},
 {id:'conflict',terms:/\b(argu|fight|fighting|disagree|quarrel|shout|angry|silent treatment|misunderstand|conflict|communication|not listening)\b/i,
 steps:["Pick a calm time and describe one specific moment without labelling your partner as the problem.","Try 'When ___ happened, I felt ___, and I'd appreciate ___.' Then let them explain their perspective.","Agree on one change each and check back after a few days. If anyone becomes threatening, prioritise safety rather than forcing a conversation."]},
 {id:'money',terms:/\b(money|finance|financial|salary|debt|budget|saving|cpf|bto|hdb|house|housing|expensive|afford|spend)\b/i,
 steps:["Write down the actual numbers: income, essential expenses, debts and individual commitments.","Agree on a shared goal and a realistic contribution that doesn't put either person under pressure.","Schedule a short monthly money check-in. For housing or CPF rules, verify details on the official HDB or CPF websites."]},
 {id:'family',terms:/\b(parent|in.law|mother|father|family|relative|siblings|traditional|culture|religion)\b/i,
 steps:["First discuss privately with your partner what each of you needs and why.","Choose one boundary you can present to relatives together, with a respectful but clear explanation.","Give family time to adjust, while remembering that your relationship decisions belong to the two of you."]},
 {id:'future',terms:/\b(marry|marriage|wedding|rom|proposal|engag|commitment|children|baby|kids|fertility|future|divorce)\b/i,
 steps:["Talk about the future you each want, without assuming you both picture the same thing.","Discuss timing, finances, living arrangements, children (if relevant), family expectations and personal boundaries.","List what you agree on and what needs more discussion. Marriage and parenthood should be freely chosen, not pressured."]},
 {id:'dating',terms:/\b(date|dating|crush|first meet|first date|texting|reply|message|attract|ask (him|her|them) out|rejection|single|flirt)\b/i,
 steps:["Notice whether interest and effort are mutual rather than trying to decode every small signal.","Suggest a simple, low-pressure next step and make it easy for the other person to say yes or no.","If their response is unclear, ask once for clarity and respect their answer. You deserve reciprocity too."]},
 {id:'distance',terms:/\b(long.distance|ldr|busy|no time|neglect|lonely|apart|miss (him|her|them)|work hours|quality time)\b/i,
 steps:["Explain what kind of connection you miss, without turning it into a blame contest.","Choose a realistic ritual: a short call, a weekly date, or a check-in that suits both schedules.","Review whether the arrangement feels fair after a couple of weeks and adjust together."]},
 {id:'intimacy',terms:/\b(intimacy|intimate|sex|physical affection|affection|love language|touch|consent)\b/i,
 steps:["Share what helps you feel close and ask what helps your partner feel close.","Discuss comfort, boundaries and consent without assuming either person owes the other affection.","Pick a pressure-free way to connect, such as an intentional evening together or a thoughtful gesture."]},
 {id:'celebration',terms:/\b(happy|great|wonderful|anniversary|excited|good news|proposed|said yes|celebrat|love them|grateful|thankful|fantastic)\b/i,
 steps:["Tell them exactly what you appreciate, not just 'thanks' or 'love you'.","Celebrate in a way that feels right for both of you; meaningful doesn't have to mean expensive.","Save one memory from today, and think of a small ritual you could repeat."]},
 {id:'uncertainty',terms:/\b(confus|unsure|uncertain|overthink|anxious|nervous|worried|insecure|afraid of rejection|not sure|mixed signals)\b/i,
 steps:["Write down the facts you know and the assumptions you're filling in yourself.","Decide what you actually need: clarity, reassurance, space, or a decision.","Ask one clear question or take one small step rather than repeatedly guessing what the other person thinks."]}
];
const offlineOpeners=[
 ["Hmm, let's look at this properly.","Thanks for trusting me with that.","Okay, I hear you.","That sounds worth thinking through.","We can untangle this together.","Let's focus on what you can control."],
 ["Aiyo, dating can be a rollercoaster lah.","Okay bestie, let's make this practical.","Wah, there's a lot going on here.","I got you — let's sort this out.","Alright, no need to overthink every detail.","Come, let's figure out your next move."],
 ["I can see why this matters to you.","That sounds like something you both deserve space to discuss.","Let's approach this as a team problem.","I hear the concern underneath that.","It's okay to want clarity and care.","Let's find a respectful next step."],
 ["Let's look at the bigger picture together.","That's an important part of building a shared life.","Marriage takes teamwork, not mind-reading.","Let's make this manageable.","There may be a practical way forward.","A calm, specific conversation can help here."]
];
const offlineFollowups=[
 ["What would help you feel clearer about this?","What have you actually noticed so far?","Which part matters most to you?","What outcome would feel respectful to everyone involved?"],
 ["What do you want your next step to be?","Has the other person shown the same level of interest?","What would make this feel less stressful?","Would you rather seek clarity or give it some space?"],
 ["Have you told your partner how this affects you?","What is one change you could both agree on?","Does this feel like a one-off issue or a repeated pattern?","What would being on the same team look like here?"],
 ["What practical decision needs to be made first?","Have you both had a chance to share your priorities?","What could you agree to revisit this weekend?","Is there an expectation you haven't discussed openly?"]
];
function offlineChoice(list,seed){return list[((seed%list.length)+list.length)%list.length]}
function offlineHash(s){let h=2166136261;for(let c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function offlineReply(i,msg,history){
 const topic=offlineTopics.find(t=>t.terms.test(msg))||null;
 const previous=history.slice(0,-1).filter(m=>m.role==='user').slice(-3).map(m=>m.content);
 const lastTopic=previous.map(x=>offlineTopics.find(t=>t.terms.test(x))?.id).filter(Boolean).at(-1);
 const chosen=topic||offlineTopics.find(t=>t.id===lastTopic)||null;
 const count=history.filter(m=>m.role==='user').length;
 const seed=offlineHash(msg+'|'+count+'|'+i);
 const opening=offlineChoice(offlineOpeners[i],seed+count);
 const follow=offlineChoice(offlineFollowups[i],seed>>>4);
 const safe=chosen&&['safety','crisis'].includes(chosen.id);
 let steps=chosen?chosen.steps:[
   ["Think about what you want from this connection and what boundaries matter to you.","If another person is involved, communicate directly instead of trying to guess their intentions.","Give yourself room to decide without rushing."][0],
   ["Tell me what happened in one or two sentences.","Consider what you can ask clearly and respectfully.","Choose one small action instead of trying to solve everything at once."][1],
   ["Name the feeling and the situation that triggered it.","Ask your partner for a calm conversation and listen to their perspective.","Agree on one practical change you can both try."][2],
   ["Separate the immediate issue from any recurring pattern.","Discuss the concern without blame and consider both partners' needs.","Make a concrete plan and agree when to revisit it."][2]
 ];
 if(!chosen){const defaults=[
  ["Clarify what you want and what boundaries matter to you.","If someone else is involved, communicate directly rather than guessing.","Choose one small step without rushing the outcome."],
  ["Say what happened and what you're hoping for.","Keep the next step simple and respectful.","Notice whether the other person is meeting you halfway."],
  ["Name the feeling and the situation that triggered it.","Invite your partner into a calm conversation and listen too.","Agree on one change you can both try."],
  ["Separate today's concern from any recurring pattern.","Discuss what each person needs without blame.","Agree on a practical plan and a time to review it."]
 ];steps=defaults[i]}
 const isHappy=chosen?.id==='celebration';
 const heading=safe?'Your safety comes first.':isHappy?'Wah, something to celebrate!':'A few things you can try:';
 const lead=safe?'I’m concerned about what you’ve described. You deserve safety and support.':isHappy?'I’m glad you shared the good news!':opening;
 const bullets=steps.map((x,j)=>`${j+1}. ${x}`).join('\n');
 const tail=safe?'Please consider speaking with a trusted person or qualified support service.':follow;
 return `${lead}\n\n${heading}\n${bullets}\n\n${tail}`;
}
let chatSending=false;
async function sendFriendMessage(event,i){
 event.preventDefault();if(chatSending)return;
 const input=document.getElementById('chat-text'),message=input.value.trim();if(!message)return;
 chatSending=true;const log=document.getElementById('chat-log'),button=document.getElementById('chat-send'),status=document.getElementById('chat-status');
 button.disabled=true;input.value='';
 let items=getChat(i);items.push({role:'user',content:message});putChat(i,items);
 const mine=document.createElement('div');mine.className='bubble mine';mine.textContent=message;log.append(mine);
 const waiting=document.createElement('div');waiting.className='bubble theirs';waiting.textContent='Thinking through this…';log.append(waiting);log.scrollTop=log.scrollHeight;
 try{
  await new Promise(resolve=>setTimeout(resolve,300));
  const reply=offlineReply(i,message,items);
  waiting.textContent=reply;items.push({role:'assistant',content:reply});putChat(i,items);
  status.textContent='Offline guided replies · No AI API · Messages stay in this browser. Advice may miss context.';
 }catch(e){waiting.textContent='Sorry, something went wrong. Please try again.'}
 finally{chatSending=false;button.disabled=false;log.scrollTop=log.scrollHeight;input.focus()}
}
