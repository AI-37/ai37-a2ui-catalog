import {KIT_TOKENS} from './kit-tokens';

/**
 * CSS-объявления слоя токенов. Без имён — весь слой; с именами — подмножество
 * (набор попапа). Значения берутся из одного и того же массива, поэтому
 * попап и общий слой разойтись не могут.
 */
export function declareTokens(names?: readonly string[]): string {
  const wanted = names ? KIT_TOKENS.filter(([name]) => names.includes(name)) : KIT_TOKENS;

  return wanted.map(([name, value]) => `  ${name}: ${value};`).join('\n');
}
