(() => {
  const CHAT_ENDPOINT = 'https://tsh-web-assistant.netlify.app/.netlify/functions/chat';
  const style = `
    #tsh-chat-btn{position:fixed;bottom:24px;right:24px;border-radius:50%;
      width:56px;height:56px;background:#6C42E3;color:#fff;font-size:24px;cursor:pointer}
    #tsh-chat-box{display:none;position:fixed;bottom:96px;right:24px;width:320px;
      height:420px;border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,.15);
      background:#fff;overflow:hidden;font-family:Inter, sans-serif}
    /* add more styles … */
  `;
  const css = document.createElement('style'); css.textContent = style; document.head.append(css);

  const btn = Object.assign(document.createElement('button'), {id:'tsh-chat-btn',textContent:'💬'});
  const box = Object.assign(document.createElement('div'), {id:'tsh-chat-box'});
  document.body.append(btn, box);

  btn.onclick = () => box.style.display = box.style.display ? '' : 'block';

  // minimal UI
  box.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div id="msgs" style="flex:1;overflow:auto;padding:12px"></div>
      <form id="f" style="display:flex;border-top:1px solid #eee">
        <input id="q" style="flex:1;border:0;padding:12px" placeholder="Ask me anything…" />
      </form>
    </div>`;
  const msgs = box.querySelector('#msgs');
  const form = box.querySelector('#f');
  const q = box.querySelector('#q');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const txt = q.value.trim(); if (!txt) return;
    append('user', txt); q.value = '';

    const resp = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({prompt: txt})
    });

    const reader = resp.body.getReader();
    let aiTxt = '';
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      aiTxt += new TextDecoder().decode(value);
      append('assistant', aiTxt, true);
    }
  });

  function append(role, text, replace=false) {
    if (replace) msgs.lastChild.textContent = text;
    else {
      const bubble = document.createElement('div');
      bubble.textContent = text;
      bubble.style = `margin-bottom:8px;max-width:80%;padding:8px 12px;
        border-radius:10px;${role==='user'?'background:#6C42E3;color:#fff;margin-left:auto':'background:#f5f5f5'}`;
      msgs.append(bubble); msgs.scrollTop = msgs.scrollHeight;
    }
  }
})();
