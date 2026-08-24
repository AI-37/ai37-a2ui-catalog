/**
 * Сверка эха ручки с отправленным query. Щадящая по двум причинам:
 *
 * — числа сравниваются числами: нормализация на сервере («17» → 17,
 *   «1,6» → 1.6) иначе объявила бы свежий ответ протухшим;
 * — ключи, которых в query не было, игнорируются: ручка вправе эхнуть
 *   собственные умолчания.
 *
 * Основной судья актуальности — ключ запроса; эхо только страхует.
 */
export function isRecommendEchoStale(
  echo: Record<string, string | number> | undefined,
  sent: URLSearchParams,
): boolean {
  if (echo === undefined) {
    return false;
  }

  for (const [name, value] of Object.entries(echo)) {
    const expected = sent.get(name);
    if (expected === null) {
      continue;
    }

    const asNumbers = Number(expected);
    const echoed = Number(value);
    if (!Number.isNaN(asNumbers) && !Number.isNaN(echoed) && expected.trim() !== '') {
      if (asNumbers !== echoed) {
        return true;
      }
      continue;
    }

    if (String(value) !== expected) {
      return true;
    }
  }

  return false;
}
