/**
 * Строка протокола: лейбл, мета и «Скачать» в правом краю. Раскрытия у неё
 * нет — под строкой ничего не прячется, и шеврона поэтому тоже нет.
 */
export const PROBA_PROTOCOL_CSS = `
.a2ui-kit .a2ui-protocol {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 14px;
}

/* «Скачать» уезжает вправо сам: в середине строки может не быть меты, и
   распорку пришлось бы держать пустым элементом. */
.a2ui-kit .a2ui-protocol__download { margin-left: auto; }
`;
