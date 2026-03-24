const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function createSession(): Promise<string> {
  const res = await fetch(`${API_URL}/api/chat/sessions`, { method: 'POST' });
  const data = await res.json();
  return data.session_id;
}

export async function fetchWin5Data(sessionId: string, message: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message }),
  });

  const reader = res.body?.getReader();
  if (!reader) return null;

  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') break;
      try {
        const event = JSON.parse(data);
        if (event.type === 'text') result = event.content;
      } catch {}
    }
  }
  return result;
}
