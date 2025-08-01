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
    #tsh-chat-btn{position:fixed;bottom:24px;right:24px;border-radius:50%;
      width:56px;height:56px;background:#000;color:#fff;font-size:24px;cursor:pointer;
      font-family:"Inter", Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;}
    #tsh-chat-box{display:none;position:fixed;bottom:96px;right:24px;width:320px;
      height:420px;border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,.15);
      background:#fff;overflow:hidden;font-family:"Inter", Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif}
    /* add more styles … */
    #tsh-chat-box #msgs h1{font-size:18px;margin:8px 0}
    #tsh-chat-box #msgs h2{font-size:16px;margin:8px 0}
    #tsh-chat-box #msgs h3{font-size:14px;margin:8px 0}
    #tsh-chat-box #msgs p{margin:8px 0;line-height:1.4,font-size:12px;}
    #tsh-chat-box #msgs ul,#tsh-chat-box #msgs ol{margin:8px 0 8px 18px}
    #tsh-chat-box #msgs li{margin:4px 0}
    #tsh-chat-box #msgs pre{background:#0f172a; color:#e2e8f0; padding:10px; border-radius:8px; overflow:auto; font-size:12px}
    #tsh-chat-box #msgs code{background:#f3f4f6;padding:2px 4px;border-radius:4px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size:12px}
    #tsh-chat-box #msgs a{color:#6C42E3; text-decoration:underline}
    #tsh-chat-box #msgs blockquote{border-left:3px solid #e5e7eb;margin:8px 0;padding:6px 10px;color:#374151;background:#fafafa;border-radius:6px}
    #tsh-chat-box #msgs table{width:100%;border-collapse:collapse;margin:8px 0;font-size:12px}
    #tsh-chat-box #msgs th,#tsh-chat-box #msgs td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;vertical-align:top}
    #tsh-chat-box #msgs th{background:#f9fafb;font-weight:600}
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

  const btn = Object.assign(document.createElement('button'), {id:'tsh-chat-btn',textContent:'💬'});
  const box = Object.assign(document.createElement('div'), {id:'tsh-chat-box'});
  document.body.append(btn, box);

  let welcomed = false;
  btn.onclick = () => {
    const wasOpen = box.style.display === 'block';
    // toggle
    box.style.display = wasOpen ? '' : 'block';
    // if just opened, show welcome once
    if (!wasOpen && box.style.display === 'block' && !welcomed) {
      append('assistant', "Welcome! I’m your TSH web assistant. Ask me anything about our services, pricing, or your project. (Tip: press Enter to send.)");
      welcomed = true;
    }
  };

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
      if (role === 'assistant') {
        elementRef.innerHTML = renderMarkdown(text);
      } else {
        elementRef.textContent = text;
      }
      msgs.scrollTop = msgs.scrollHeight;
      return elementRef;
    } else {
      const bubble = document.createElement('div');
      bubble.style = `margin-bottom:8px;max-width:80%;padding:8px 12px; border-radius:10px;${role==='user'?'background:#6C42E3;color:#fff;margin-left:auto':'background:#f5f5f5'}`;
      if (role === 'assistant') {
        bubble.innerHTML = renderMarkdown(text);
      } else {
        bubble.textContent = text;
      }
      msgs.append(bubble); msgs.scrollTop = msgs.scrollHeight;
      return bubble;
    }
  }
})();
