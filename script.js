const chat=document.getElementById('chat'),input=document.getElementById('input');let memory=JSON.parse(localStorage.getItem('ksiMemory')||'{"name":"","favorite":"","notes":[]}');
function save(){localStorage.setItem('ksiMemory',JSON.stringify(memory))}function add(t,c){let row=document.createElement('div');row.className='msg-row '+c;if(c==='bot'){let img=document.createElement('img');img.className='chat-avatar';img.src='ksi_avatar.jpg';img.alt='크시';row.appendChild(img)}let d=document.createElement('div');d.className='msg';d.textContent=t;row.appendChild(d);chat.appendChild(row);chat.scrollTop=chat.scrollHeight}function mem(){return `[크시의 기억]\n이름: ${memory.name||'아직 몰라요'}\n좋아하는 것: ${memory.favorite||'아직 몰라요'}\n메모:\n${memory.notes.length?memory.notes.map(x=>'• '+x).join('\n'):'• 저장된 메모가 없어요.'}`}
let customScripts = JSON.parse(localStorage.getItem('ksiScripts') || '{}');
function saveScriptsToStorage(){localStorage.setItem('ksiScripts',JSON.stringify(customScripts));}
function applyVariables(text){return text.replaceAll('{이름}', memory.name || '친구');}
function customReply(command,arg){
  if(!customScripts[command]) return null;
  let value=customScripts[command];
  if(Array.isArray(value)) value=value[Math.floor(Math.random()*value.length)];
  return applyVariables(value.replaceAll('{내용}',arg||''));
}
function openScriptEditor(){
  document.getElementById('scriptPanel').classList.remove('hidden');
  const lines=Object.entries(customScripts).map(([cmd,res])=>`${cmd} => ${Array.isArray(res)?res.join(' | '):res}`);
  document.getElementById('scriptInput').value=lines.join('\n');
  document.getElementById('scriptStatus').textContent='';
}
function closeScriptEditor(){document.getElementById('scriptPanel').classList.add('hidden');}
function clearScriptEditor(){document.getElementById('scriptInput').value='';document.getElementById('scriptStatus').textContent='';}
function loadExampleScript(){document.getElementById('scriptInput').value='/춤 => 크시가 신나게 춤을 춰요! 💜\n/칭찬 => 고마워요! 크시가 기분이 좋아졌어요! 😸\n/인사 => 안녕하세요, {이름}님! 🐱\n/말해 => 크시: {내용}';}
function saveScripts(){
  const text=document.getElementById('scriptInput').value;
  const next={}; let count=0; const errors=[];
  text.split('\n').forEach((line,i)=>{
    const s=line.trim(); if(!s || s.startsWith('#')) return;
    const m=s.match(/^(\/\S+)\s*=>\s*(.+)$/);
    if(!m){errors.push(i+1);return;}
    const cmd=m[1].toLowerCase(), raw=m[2].trim();
    if(!raw){errors.push(i+1);return;}
    const choices=raw.split('|').map(x=>x.trim()).filter(Boolean);
    next[cmd]=choices.length>1?choices:choices[0]; count++;
  });
  if(errors.length){document.getElementById('scriptStatus').textContent=`⚠️ ${errors.join(', ')}번째 줄 형식이 잘못됐어요.  /명령어 => 대답  형식으로 써주세요.`;return;}
  customScripts=next;saveScriptsToStorage();
  document.getElementById('scriptStatus').textContent=`✅ ${count}개의 사용자 명령어를 저장했어요! 이제 채팅창에서 바로 사용할 수 있어요.`;
  setTimeout(closeScriptEditor,900);
}
function localXsiReply(raw){
  let t=raw.trim(), l=t.toLowerCase();
  if(!t) return 'ㅇㅉ';

  // 사용자가 만든 크시의 대화 규칙
  if(t === '뒤질레?') return 'ㅠㅠ';
  if(t === '어쩌리고' || t === 'ㅇㅉ') return '뒤질레?';

  // 욕설 감지
  const badWords=['씨발','시발','ㅅㅂ','병신','븅신','개새끼','새끼','지랄','ㅈㄹ','미친놈','미친년','좆','닥쳐'];
  if(badWords.some(w=>t.includes(w))) return '뒤질레?';

  // 인사
  if(['안녕','안녕하세요','하이','hello','hi','ㅎㅇ'].includes(l)) return 'ㅎㅇ';

  // 이름을 물어보면
  if(l.includes('이름')) return '나는크시임';

  // 추가 대화 규칙
  if(t === '잘자') return 'ㅂㅂ';
  if(t === '뭐해') return '너랑 대화중';
  if(t === '웃어') return 'ㅋㅋㅋㅋ';
  if(t === '야') return 'ㅙ';
  if(t === '67') return '뭔...';
  if(t === '너도 67이라고 해봐') return '67,67,67,스키비디토일렛 퉁퉁퉁사후루!@@!@@!!@@!!';
  if(t === '맞을레?') return '미안.';

  // AI가 실제로 할 수 없는 일을 묻는 경우
  const cannotDoPatterns=['밥 먹었어','밥먹었어','뭐 먹었어','뭐먹었어','먹었어?','직접 해','직접해','가져와','만져봐','보여줘'];
  if(cannotDoPatterns.some(w=>t.includes(w))) return '난 AI라 그런거 못해';

  // 사용자 스크립트 명령어
  if(t.startsWith('/')){
    let a=t.split(' '),cmd=a.shift().toLowerCase(),arg=a.join(' ').trim();
    let custom=customReply(cmd,arg);
    if(custom!==null) return custom;
    if(cmd=='/도움말'||cmd=='/help')return '/도움말 - 명령어 보기\n/기억 - 기억 보기\n/기억해 내용 - 내용 저장\n/잊어버려 - 기억 삭제\n/이름 이름 - 이름 기억\n/좋아해 내용 - 좋아하는 것 저장\n/시간 - 현재 시간\n/농담 - 농담\n/내 스크립트 - 사용자 명령어 편집';
    if(cmd=='/기억'||cmd=='/memory')return mem();
    if(cmd=='/기억해'||cmd=='/remember'){if(!arg)return '기억할 내용을 적어주세요.';memory.notes.push(arg);save();return `“${arg}”을(를) 기억해둘게요! 🧠`}
    if(cmd=='/잊어버려'||cmd=='/forget'){memory={name:'',favorite:'',notes:[]};save();return '기억을 모두 지웠어요.'}
    if(cmd=='/이름'||cmd=='/name'){if(!arg)return '예: /이름 민수';memory.name=arg;save();return `${arg}님, 기억했어요! 😊`}
    if(cmd=='/좋아해'||cmd=='/favorite'){if(!arg)return '예: /좋아해 게임';memory.favorite=arg;save();return `${arg}을(를) 좋아하는군요! 기억할게요. 👍`}
    if(cmd=='/시간'||cmd=='/time')return '현재 시간은 '+new Date().toLocaleString('ko-KR')+'이에요.';
    if(cmd=='/내'||cmd=='/스크립트'){openScriptEditor();return '스크립트 편집기를 열었어요! 🧩'}
    if(cmd=='/농담'||cmd=='/joke')return ['컴퓨터가 감기에 걸리면? 바이러스 때문이죠! 🤖','프로그래머가 좋아하는 음료는? 자바! ☕','크시는 AI지만 가끔 아이디어가 번쩍! ⚡'][Math.floor(Math.random()*3)];
    return 'ㅇㅉ';
  }

  // 명령어에 없는 일반 단어/문장
  return 'ㅇㅉ';
}
function send(v){if(v===undefined){v=input.value}if(!v.trim())return;add(v,'user');input.value='';setTimeout(()=>add(reply(v),'bot'),150)}function showMemory(){add(mem(),'bot')}function resetMemory(){if(confirm('저장된 기억을 모두 삭제할까요?')){memory={name:'',favorite:'',notes:[]};save();add('기억을 모두 지웠어요.','bot')}}function clearChat(){chat.innerHTML='';welcome()}function welcome(){add('나는 크시야!','bot')}input.addEventListener('keydown',e=>{if(e.key==='Enter')send()});welcome();


// ===== Xsi 온라인 멀티플레이어 모드 =====
(function(){
  const onlineScript = document.createElement('script');
  onlineScript.src = '/socket.io/socket.io.js';
  onlineScript.onload = setupXsiOnline;
  document.head.appendChild(onlineScript);

  function setupXsiOnline(){
    const socket = io();
    const originalChat = document.getElementById('chat');
    const input = document.getElementById('input');
    const form = document.getElementById('form');

    if(!originalChat || !input || !form) return;

    // 기존 초기 환영 메시지를 정리하고 온라인 모드 UI를 준비
    originalChat.innerHTML = '';

    const name = (localStorage.getItem('xsi_online_name') || '').trim();
    let myName = name || prompt('친구들과 함께 사용할 이름을 입력하세요.') || '익명';
    myName = myName.trim().slice(0,20) || '익명';
    localStorage.setItem('xsi_online_name', myName);
    socket.emit('set_name', myName);

    function addOnline(text, type, who){
      const row = document.createElement('div');
      row.className = 'msg-row ' + (type === 'me' ? 'user' : 'bot');
      if(type !== 'me'){
        const img = document.createElement('img');
        img.className = 'chat-avatar';
        img.src = 'ksi_avatar.jpg';
        img.alt = '크시';
        row.appendChild(img);
      }
      const d = document.createElement('div');
      d.className = 'msg';
      d.textContent = who ? `${who}: ${text}` : text;
      row.appendChild(d);
      originalChat.appendChild(row);
      originalChat.scrollTop = originalChat.scrollHeight;
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      const text = input.value.trim();
      if(!text) return;
      input.value = '';
      socket.emit('chat_message', text);
    }, true);

    socket.on('chat_message', (m)=>{
      const isMe = m.id === socket.id;
      addOnline(m.text, isMe ? 'me' : 'other', isMe ? null : m.name);
      // 기존 Xsi 명령어에 해당하는 경우 Xsi 답변도 같은 방에 공유
      const answer = localXsiReply(m.text);
      if(answer && answer !== 'ㅇㅉ'){
        setTimeout(()=>socket.emit('chat_message', `[크시] ${answer}`), 250);
      }
    });

    socket.on('system_message', (m)=>{
      addOnline(m.text, 'other', null);
    });

    const header = document.querySelector('h2');
    if(header) header.textContent = '크시 (Xsi) 온라인 대화';
  }
})();
