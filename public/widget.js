(() => {
  // Load Inter font
  const fontPreconnect1 = document.createElement('link');
  fontPreconnect1.rel = 'preconnect';
  fontPreconnect1.href = 'https://fonts.googleapis.com';

  const fontPreconnect2 = document.createElement('link');
  fontPreconnect2.rel = 'preconnect';
  fontPreconnect2.href = 'https://fonts.gstatic.com';
  fontPreconnect2.crossOrigin = '';

  const fontCss = document.createElement('link');
  fontCss.rel = 'stylesheet';
  fontCss.href = 'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&display=swap';

  document.head.append(fontPreconnect1, fontPreconnect2, fontCss);
  const CHAT_ENDPOINT = 'https://tsh-web-assistant.netlify.app/.netlify/functions/chat';
  const style = `
    #tsh-chat-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-width: 64px;
      height: 64px;
      padding: 0 22px;
      border: 0;
      border-radius: 22px;
      background: linear-gradient(135deg, #6C42E3 0%, #4F46E5 100%);
      color: #fff;
      font-family: "Inter", Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.01em;
      cursor: pointer;
      box-shadow: 0 20px 40px rgba(108, 66, 227, 0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-radius 0.2s ease;
      z-index: 2147483640;
    }
    #tsh-chat-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 24px 45px rgba(108, 66, 227, 0.4);
    }
    #tsh-chat-btn:focus-visible {
      outline: 3px solid rgba(108, 66, 227, 0.4);
      outline-offset: 4px;
    }
    #tsh-chat-btn.is-open {
      border-radius: 18px;
    }
    #tsh-chat-btn .tsh-btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      line-height: 1;
    }
    #tsh-chat-btn .tsh-btn-label {
      white-space: nowrap;
    }
    @media (max-width: 640px) {
      #tsh-chat-btn {
        min-width: 56px;
        height: 56px;
        border-radius: 50%;
        padding: 0;
      }
      #tsh-chat-btn .tsh-btn-label {
        display: none;
      }
    }

    #tsh-chat-box {
      position: fixed;
      bottom: 112px;
      right: 24px;
      width: 360px;
      max-width: calc(100vw - 32px);
      max-height: 560px;
      display: flex;
      flex-direction: column;
      border-radius: 22px;
      background: linear-gradient(140deg, #ffffff 0%, #f7f5ff 60%, #f1f5ff 100%);
      box-shadow: 0 28px 60px rgba(15, 23, 42, 0.18);
      border: 1px solid rgba(99, 102, 241, 0.14);
      overflow: hidden;
      font-family: "Inter", Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      opacity: 0;
      transform: translateY(16px) scale(0.96);
      pointer-events: none;
      transition: opacity 0.24s ease, transform 0.24s ease;
      z-index: 2147483641;
    }
    #tsh-chat-box.is-open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    @media (max-width: 480px) {
      #tsh-chat-box {
        right: 16px;
        bottom: 96px;
        width: calc(100vw - 32px);
        max-height: 75vh;
      }
      #tsh-chat-btn {
        bottom: 16px;
        right: 16px;
      }
    }

    .tsh-chat-shell {
      display: flex;
      flex-direction: column;
      height: 100%;
      backdrop-filter: blur(18px);
    }
    .tsh-chat-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 22px 16px;
      background: rgba(255, 255, 255, 0.88);
      border-bottom: 1px solid rgba(148, 163, 184, 0.14);
    }
    .tsh-chat-avatar {
      width: 38px;
      height: 38px;
      border-radius: 14px;
      background: linear-gradient(135deg, #6C42E3 0%, #4338CA 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 21px;
      color: #fff;
      box-shadow: 0 14px 30px rgba(108, 66, 227, 0.3);
    }
    .tsh-chat-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tsh-chat-title {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    }
    .tsh-chat-subtitle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #64748b;
    }
    .tsh-status-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.14);
    }
    .tsh-header-close {
      margin-left: auto;
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(148, 163, 184, 0.12);
      color: #475569;
      cursor: pointer;
      transition: background 0.18s ease, color 0.18s ease;
    }
    .tsh-header-close:hover {
      background: rgba(79, 70, 229, 0.14);
      color: #4338ca;
    }
    .tsh-header-close:focus-visible {
      outline: 3px solid rgba(108, 66, 227, 0.4);
      outline-offset: 3px;
    }

    #msgs.tsh-chat-content {
      flex: 1;
      overflow: auto;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: radial-gradient(circle at top, rgba(255, 255, 255, 0.98), #f5f7ff 70%);
    }
    #msgs.tsh-chat-content::-webkit-scrollbar {
      width: 8px;
    }
    #msgs.tsh-chat-content::-webkit-scrollbar-thumb {
      background: rgba(100, 116, 139, 0.35);
      border-radius: 8px;
    }

    .tsh-message {
      max-width: 85%;
      padding: 12px 15px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.55;
      box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
      background: #ffffff;
      color: #0f172a;
    }
    .tsh-message.assistant {
      align-self: flex-start;
    }
    .tsh-message.user {
      align-self: flex-end;
      background: linear-gradient(135deg, #6C42E3 0%, #4F46E5 100%);
      color: #fff;
      box-shadow: 0 18px 34px rgba(79, 70, 229, 0.32);
    }
    .tsh-message.user code {
      background: rgba(255, 255, 255, 0.24);
      color: #fff;
    }
    .tsh-message.user pre {
      background: rgba(17, 24, 39, 0.7);
      color: #f8fafc;
      box-shadow: none;
    }
    .tsh-message.typing {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(148, 163, 184, 0.16);
      color: #475569;
      box-shadow: none;
    }
    .tsh-typing-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: rgba(79, 70, 229, 0.7);
      animation: tsh-typing 1.2s infinite ease-in-out;
    }
    .tsh-typing-dot:nth-child(2) {
      animation-delay: 0.15s;
    }
    .tsh-typing-dot:nth-child(3) {
      animation-delay: 0.3s;
    }
    @keyframes tsh-typing {
      0%, 80%, 100% {
        transform: scale(0.6);
        opacity: 0.45;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .tsh-message p {
      margin: 0 0 10px;
    }
    .tsh-message p:last-child,
    .tsh-message ul:last-child,
    .tsh-message ol:last-child,
    .tsh-message pre:last-child,
    .tsh-message table:last-child,
    .tsh-message blockquote:last-child {
      margin-bottom: 0;
    }
    .tsh-message strong {
      color: #1e1b4b;
    }
    .tsh-message code {
      background: #ede9fe;
      padding: 2px 4px;
      border-radius: 6px;
      font-family: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 13px;
    }
    .tsh-message pre {
      background: #0f172a;
      color: #e2e8f0;
      border-radius: 14px;
      padding: 14px;
      font-size: 13px;
      overflow: auto;
      box-shadow: none;
    }
    .tsh-message ul,
    .tsh-message ol {
      padding-left: 18px;
      margin: 0 0 10px;
    }
    .tsh-message blockquote {
      margin: 0 0 10px;
      padding: 10px 14px;
      border-left: 4px solid rgba(79, 70, 229, 0.22);
      background: rgba(79, 70, 229, 0.08);
      border-radius: 12px;
      color: #312e81;
    }
    .tsh-message table {
      border-collapse: separate;
      border-spacing: 0;
      width: 100%;
      font-size: 13px;
      overflow: hidden;
      border-radius: 12px;
      box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
    }
    .tsh-message th,
    .tsh-message td {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.16);
    }
    .tsh-message th {
      background: rgba(79, 70, 229, 0.08);
      font-weight: 600;
      color: #312e81;
    }

    .tsh-input-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 22px 20px;
      background: rgba(255, 255, 255, 0.9);
      border-top: 1px solid rgba(148, 163, 184, 0.14);
      backdrop-filter: blur(18px);
    }
    .tsh-input-bar input {
      flex: 1;
      border: 0;
      background: rgba(148, 163, 184, 0.12);
      border-radius: 14px;
      padding: 14px 16px;
      font-size: 14px;
      font-family: inherit;
      color: #0f172a;
      transition: background 0.2s ease, box-shadow 0.2s ease;
    }
    .tsh-input-bar input::placeholder {
      color: rgba(100, 116, 139, 0.8);
    }
    .tsh-input-bar input:focus {
      outline: none;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(108, 66, 227, 0.15);
    }
    .tsh-input-bar button {
      border: 0;
      border-radius: 14px;
      padding: 12px 18px;
      font-size: 14px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #6C42E3 0%, #4F46E5 100%);
      color: #fff;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .tsh-input-bar button:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px rgba(79, 70, 229, 0.28);
    }
    .tsh-input-bar button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .tsh-send-icon {
      font-size: 16px;
    }

    .tsh-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
      white-space: nowrap;
    }
  `;
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  function renderMarkdown(md) {
    if (!md) return '';

    // Normalize newlines
    md = md.replace(/\r\n?/g, '\n');

    // Extract fenced code blocks first to protect content
    const fences = [];
    md = md.replace(/```([\w+-]*)\n([\s\S]*?)```/g, (m, lang, code) => {
      const idx = fences.push({ lang, code }) - 1;
      return `@@FENCE${idx}@@`;
    });

    // Escape HTML to avoid XSS, we'll unescape code blocks later
    md = escapeHtml(md);

    // Headings
    md = md.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
           .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
           .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');

    // Bold, italic, inline code
    md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
           .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
           .replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links [text](url)
    md = md.replace(/\[([^\]]+)\]\((https?:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Blockquotes: group consecutive ">" lines
    {
      const linesBQ = md.split('\n');
      const outBQ = [];
      let inBQ = false;
      for (const ln of linesBQ) {
        const m = ln.match(/^\s*>\s?(.*)$/);
        if (m) {
          if (!inBQ) { outBQ.push('<blockquote>'); inBQ = true; }
          outBQ.push(m[1]);
        } else {
          if (inBQ) { outBQ.push('</blockquote>'); inBQ = false; }
          outBQ.push(ln);
        }
      }
      if (inBQ) outBQ.push('</blockquote>');
      md = outBQ.join('\n');
    }

    // Lists (unordered and ordered)
    // Convert consecutive list lines into <ul>/<ol>
    const lines = md.split('\n');
    const out = [];
    let inUL = false, inOL = false;
    const closeLists = () => {
      if (inUL) { out.push('</ul>'); inUL = false; }
      if (inOL) { out.push('</ol>'); inOL = false; }
    };
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*[-*+]\s+/.test(line)) {
        if (!inUL) { closeLists(); out.push('<ul>'); inUL = true; }
        out.push('<li>' + line.replace(/^\s*[-*+]\s+/, '') + '</li>');
      } else if (/^\s*\d+\.\s+/.test(line)) {
        if (!inOL) { closeLists(); out.push('<ol>'); inOL = true; }
        out.push('<li>' + line.replace(/^\s*\d+\.\s+/, '') + '</li>');
      } else if (line.trim() === '') {
        closeLists();
        out.push('');
      } else {
        closeLists();
        out.push(line);
      }
    }
    closeLists();
    md = out.join('\n');

    // Tables (header | separator | rows)
    md = md.split(/\n{2,}/).map(block => {
      const linesT = block.trim().split('\n');
      if (linesT.length >= 2 && /\|/.test(linesT[0]) && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(linesT[1])) {
        const parseRow = (row) => {
          let cells = row.split('|');
          if (cells.length && cells[0].trim() === '') cells.shift();
          if (cells.length && cells[cells.length-1].trim() === '') cells.pop();
          return cells.map(c => c.trim());
        };
        const headers = parseRow(linesT[0]);
        const aligns = parseRow(linesT[1]).map(a => a.includes(':') && a.trim().endsWith(':') && a.trim().startsWith(':') ? 'center' : (a.trim().endsWith(':') ? 'right' : 'left'));
        const bodyRows = linesT.slice(2).filter(r => r.trim().length).map(parseRow);
        let html = '<table><thead><tr>';
        headers.forEach((h,i)=>{ html += `<th style="text-align:${aligns[i]||'left'}">${h}</th>`; });
        html += '</tr></thead><tbody>';
        bodyRows.forEach(r => {
          html += '<tr>';
          r.forEach((c,i)=>{ html += `<td style="text-align:${aligns[i]||'left'}">${c}</td>`; });
          html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
      }
      return block;
    }).join('\n\n');

    // Paragraphs: wrap non-HTML-block lines separated by blank lines
    const blocks = md.split(/\n{2,}/).map(b => {
      if (/^\s*<\/?(h1|h2|h3|ul|ol|li|pre|blockquote|table|thead|tbody|tr|th|td)/i.test(b)) return b;
      return '<p>' + b.replace(/\n/g, '<br/>') + '</p>';
    });
    md = blocks.join('\n');

    // Restore fenced code blocks
    md = md.replace(/@@FENCE(\d+)@@/g, (m, i) => {
      const { lang, code } = fences[Number(i)];
      return `<pre><code${lang ? ` data-lang="${lang}"` : ''}>${escapeHtml(code)}</code></pre>`;
    });

    return md;
  }
  const css = document.createElement('style'); css.textContent = style; document.head.append(css);

  const CHAT_ICON = '<span class="tsh-btn-icon" aria-hidden="true">&#128172;</span><span class="tsh-btn-label">Chat</span>';
  const CLOSE_ICON = '<span class="tsh-btn-icon" aria-hidden="true">&times;</span><span class="tsh-btn-label">Close</span>';

  const btn = Object.assign(document.createElement('button'), { id: 'tsh-chat-btn', type: 'button' });
  btn.innerHTML = CHAT_ICON;
  btn.setAttribute('aria-label', 'Open TSH assistant');
  btn.setAttribute('aria-expanded', 'false');

  const box = Object.assign(document.createElement('div'), { id: 'tsh-chat-box' });
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'false');
  box.innerHTML = `
    <div class="tsh-chat-shell" role="group" aria-label="TSH assistant chat">
      <header class="tsh-chat-header">
        <div class="tsh-chat-avatar" aria-hidden="true">&#129302;</div>
        <div class="tsh-chat-meta">
          <span class="tsh-chat-title">TSH Assistant</span>
          <span class="tsh-chat-subtitle"><span class="tsh-status-dot" aria-hidden="true"></span>Online</span>
        </div>
        <button class="tsh-header-close" type="button" aria-label="Close chat"><span aria-hidden="true">&times;</span></button>
      </header>
      <div id="msgs" class="tsh-chat-content" role="log" aria-live="polite" aria-relevant="additions text"></div>
      <form id="f" class="tsh-input-bar" autocomplete="off">
        <label class="tsh-sr-only" for="q">Ask the TSH assistant</label>
        <input id="q" name="q" placeholder="Ask the TSH assistant..." autocomplete="off" />
        <button type="submit">
          <span class="tsh-send-label">Send</span>
          <span class="tsh-send-icon" aria-hidden="true">&#8599;</span>
        </button>
      </form>
      <span class="tsh-sr-only tsh-sr-status" role="status" aria-live="polite"></span>
    </div>
  `;
  document.body.append(btn, box);

  const msgs = box.querySelector('#msgs');
  const form = box.querySelector('#f');
  const q = box.querySelector('#q');
  const sendBtn = form.querySelector('button');
  const closeBtn = box.querySelector('.tsh-header-close');
  const srStatus = box.querySelector('.tsh-sr-status');

  let welcomed = false;

  function setChatOpen(open) {
    box.classList.toggle('is-open', open);
    btn.classList.toggle('is-open', open);
    btn.innerHTML = open ? CLOSE_ICON : CHAT_ICON;
    btn.setAttribute('aria-label', open ? 'Close TSH assistant' : 'Open TSH assistant');
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      srStatus.textContent = 'Assistant ready to help';
      setTimeout(() => q.focus(), 120);
      if (!welcomed) {
        append('assistant', "Welcome! I'm your TSH web assistant. Ask me anything about our services, pricing, or your project. (Tip: press Enter to send.)");
        welcomed = true;
      }
    } else {
      srStatus.textContent = '';
      q.blur();
    }
  }

  btn.addEventListener('click', () => {
    setChatOpen(!box.classList.contains('is-open'));
  });

  closeBtn.addEventListener('click', () => {
    setChatOpen(false);
    btn.focus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && box.classList.contains('is-open')) {
      setChatOpen(false);
      btn.focus();
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const txt = q.value.trim();
    if (!txt) return;

    append('user', txt);
    q.value = '';

    sendBtn.disabled = true;
    q.disabled = true;
    srStatus.textContent = 'Assistant is responding';

    let bubble = append('assistant', '...');
    let aiTxt = '';

    try {
      const resp = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({prompt: txt})
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${text}`);
      }

      if (!resp.body || !resp.body.getReader) {
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
        buffer = frames.pop();

        for (const frame of frames) {
          const lines = frame.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data) continue;
            if (data === '[DONE]') {
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
              console.warn('Non-JSON SSE line skipped:', data);
            }
          }
        }

        const ndjsonParts = buffer.split('\n');
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
    } finally {
      sendBtn.disabled = false;
      q.disabled = false;
      q.focus();
      srStatus.textContent = aiTxt ? 'Assistant response received' : '';
      if (srStatus.textContent) {
        setTimeout(() => { srStatus.textContent = ''; }, 1500);
      }
    }
  });

  function append(role, text, elementRef = null) {
    if (elementRef) {
      elementRef.classList.remove('typing');
      if (role === 'assistant') {
        elementRef.innerHTML = renderMarkdown(text);
      } else {
        elementRef.textContent = text;
      }
      msgs.scrollTop = msgs.scrollHeight;
      return elementRef;
    }

    const bubble = document.createElement('div');
    bubble.className = `tsh-message ${role === 'assistant' ? 'assistant' : 'user'}`;

    if (role === 'assistant' && text === '...') {
      bubble.classList.add('typing');
      bubble.innerHTML = '<span class="tsh-typing-dot"></span><span class="tsh-typing-dot"></span><span class="tsh-typing-dot"></span>';
    } else if (role === 'assistant') {
      bubble.innerHTML = renderMarkdown(text);
    } else {
      bubble.textContent = text;
    }

    msgs.append(bubble);
    msgs.scrollTop = msgs.scrollHeight;
    return bubble;
  }
})();
