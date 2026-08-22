/**
 * Reads a fetch Response as Server-Sent Events and invokes `onEvent`
 * for each complete event. Compatible with the LangPal chat stream.
 */
export async function parseSseStream(
  response: Response,
  onEvent: (event: string, data: string) => void
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('This browser could not read the chat stream.');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let eventName = 'message';
  let dataLines: string[] = [];

  function flush(): void {
    if (dataLines.length === 0) {
      eventName = 'message';
      return;
    }
    onEvent(eventName, dataLines.join('\n'));
    eventName = 'message';
    dataLines = [];
  }

  function consumeLine(line: string): void {
    if (line === '') {
      flush();
      return;
    }
    if (line.startsWith(':')) return;
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
      return;
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        buffer += decoder.decode();
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';
      for (const line of lines) consumeLine(line);
    }

    if (buffer) consumeLine(buffer);
    flush();
  } finally {
    reader.releaseLock();
  }
}
