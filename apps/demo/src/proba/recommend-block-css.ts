/**
 * Блок подбора: сетка карточек и приглушение устаревшего списка.
 *
 * Карточки меряются по корню набора (`@container a2ui-kit`), а не по окну:
 * блок живёт внутри карточки сообщения, и в чате она узкая независимо от
 * ширины экрана. Порог 500 — тот же, на котором форма набора переходит во
 * вторую колонку: два соседних блока не должны ломаться в разных местах.
 */
export const PROBA_RECOMMEND_CSS = `
.a2ui-kit .a2ui-recommend { display: grid; gap: 10px; }

.a2ui-kit .a2ui-recommend__cards { display: grid; gap: 8px; }

@container a2ui-kit (min-width: 500px) {
  .a2ui-kit .a2ui-recommend__cards { grid-template-columns: 1fr 1fr; }
}

/* Устаревший список приглушён, а не снят: блок не должен прыгать, пока едет
   новый ответ. Клик по нему при этом остаётся живым — вариант ещё валиден. */
.a2ui-kit .a2ui-recommend--stale { opacity: 0.55; }

.a2ui-kit .a2ui-recommend__card { display: grid; gap: 8px; padding: 12px 14px; }

/* Кнопка держит свою ширину: растянутая на всю карточку, она читается
   пустым полем ввода, а не действием. */
.a2ui-kit .a2ui-recommend__card .a2ui-btn { justify-self: start; }

.a2ui-kit .a2ui-recommend__notes { display: flex; flex-wrap: wrap; gap: 6px; }

/* Строка «ещё варианты»: селект тянется, кнопка держит свою ширину. */
.a2ui-kit .a2ui-recommend__more {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.a2ui-kit .a2ui-recommend__more-field { flex: 1 1 220px; min-width: 0; }
`;
