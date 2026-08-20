/**
 * URL конверт-сервиса chat-backend из download-URL ресурса агента (план
 * report-download-thread-attachments, ред. 2): `/api/agent-resource?…` →
 * `/api/agent-resource/convert?format=<fmt>&…`. Другая форма URL (абсолютный
 * хост, иной путь) — не наш транспорт: возвращаем undefined, пункт формата
 * в меню просто не появится.
 */
export function agentResourceConvertUrl(downloadUrl: string, format: string): string | undefined {
  const marker = '/api/agent-resource?';
  const at = downloadUrl.indexOf(marker);
  if (at === -1) return undefined;
  const query = downloadUrl.slice(at + marker.length);
  return `${downloadUrl.slice(0, at)}/api/agent-resource/convert?format=${encodeURIComponent(format)}&${query}`;
}
