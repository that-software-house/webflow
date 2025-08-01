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
    let bubble = append('assistant', '…'); // placeholder bubble

    const resp = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({prompt: txt})
    });

    let aiTxt = '';

    // If the server streams as Server-Sent Events (SSE) with lines like: "data: {json}\n\n",
    // this parser will handle it. It also tolerates NDJSON (one JSON object per line).
    try {
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${text}`);
      }

      if (!resp.body || !resp.body.getReader) {
        // Non-streaming fallback: expect a full JSON response
        const full = await resp.json();
        const content = full?.choices?.[0]?.message?.content || full?.message?.content || '';
        if (content) {
          aiTxt += content;
          bubble = append('assistant', aiTxt, bubble);
        }
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Try splitting as SSE frames first (\n\n delimited)
        let frames = buffer.split('\n\n');
        buffer = frames.pop(); // keep the trailing partial frame

        for (const frame of frames) {
          // Each SSE frame may contain multiple lines; only lines starting with "data:" are payloads
          const lines = frame.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data) continue;
            if (data === '[DONE]') {
              // graceful end signal used by some backends
              return;
            }
            try {
              const obj = JSON.parse(data);
              const delta = obj?.choices?.[0]?.delta?.content
                ?? obj?.delta?.content
                ?? obj?.message?.content
                ?? '';
              if (delta) {
                aiTxt += delta;
                bubble = append('assistant', aiTxt, bubble);
              }
            } catch (err) {
              // If the line isn't JSON (e.g., commentary), skip it
              console.warn('Non-JSON SSE line skipped:', data);
            }
          }
        }

        // If nothing was parsed as SSE, also try NDJSON within the same chunk
        // (objects separated by newlines). This is a no-op when SSE already consumed content.
        const ndjsonParts = buffer.split('\n');
        // Keep only the last partial line in buffer
        buffer = ndjsonParts.pop();
        for (const part of ndjsonParts) {
          const jsonStr = part.trim();
          if (!jsonStr) continue;
          try {
            const obj = JSON.parse(jsonStr);
            const delta = obj?.choices?.[0]?.delta?.content
              ?? obj?.delta?.content
              ?? obj?.message?.content
              ?? '';
            if (delta) {
              aiTxt += delta;
              bubble = append('assistant', aiTxt, bubble);
            }
          } catch (err) {
            console.warn('NDJSON parse skipped:', jsonStr);
          }
        }
      }

      // Flush any final non-empty buffered JSON (rare)
      const tail = buffer.trim();
      if (tail && tail !== '[DONE]') {
        try {
          const obj = JSON.parse(tail);
          const delta = obj?.choices?.[0]?.delta?.content
            ?? obj?.delta?.content
            ?? obj?.message?.content
            ?? '';
          if (delta) {
            aiTxt += delta;
            bubble = append('assistant', aiTxt, bubble);
          }
        } catch {}
      }
    } catch (err) {
      console.error('Stream handling error:', err);
      bubble = append('assistant', `Sorry, something went wrong: ${err.message}`, bubble);
    }
  });

  function append(role, text, elementRef=null) {
    if (elementRef) {
      elementRef.textContent = text;
      msgs.scrollTop = msgs.scrollHeight;
      return elementRef;
    } else {
      const bubble = document.createElement('div');
      bubble.textContent = text;
      bubble.style = `margin-bottom:8px;max-width:80%;padding:8px 12px;
        border-radius:10px;${role==='user'?'background:#6C42E3;color:#fff;margin-left:auto':'background:#f5f5f5'}`;
      msgs.append(bubble); msgs.scrollTop = msgs.scrollHeight;
      return bubble;
    }
  }
})();
