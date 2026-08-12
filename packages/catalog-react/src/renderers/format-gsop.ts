/** Неразрывный пробел-разделитель разрядов. */
const GROUP_SEPARATOR = '\u00a0';

/**
 * ГСОП с разрядами через неразрывный пробел: «6 380». Своё форматирование, а не
 * `toLocaleString`, — результат не должен зависеть от локали среды (у SSR и у
 * браузера она разная, и разметка разъезжалась бы при гидратации).
 */
export function formatGsop(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR);
}
