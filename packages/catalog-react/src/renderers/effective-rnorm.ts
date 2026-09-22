/**
 * Нормируемое сопротивление конструкции с учётом поправки nt (5.3):
 * `Rнорм = Rтр · nt`. Базовое `rnorm` per-type конфига — значение при nt = 1
 * (тип, а не конструкция), поправку по конструкции накладывает клиент; канон
 * по-прежнему считает сервер. Без поправки значение не меняется.
 */
export function effectiveRnorm(
  rnorm: number | undefined,
  nt: number | null,
): number | undefined {
  if (rnorm === undefined) {
    return undefined;
  }

  return nt === null ? rnorm : rnorm * nt;
}
