import {declareTokens} from './declare-tokens';

/** Слой токенов на корне набора: всё остальное читает только эти имена. */
export const KIT_TOKENS_CSS = `
.a2ui-kit {
${declareTokens()}

  /* Корень набора — он же контейнер раскладки: ширину меряем один раз и по
     нему, а не по каждой форме в отдельности. Форма живёт внутри отступов
     карточки и её тела, это на ~60px уже корня, и пороги, замеренные по ней,
     разъезжались бы с порогами остальных сеток набора. */
  container-type: inline-size;
  container-name: a2ui-kit;
  /* width обязателен: inline-size включает size containment, и во флекс-хосте
     корень схлопнулся бы в ноль. */
  width: 100%;
  min-width: 0;

  font-family: var(--a2ui-font);
  color: var(--a2ui-text-color);
}
`;
