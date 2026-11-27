import React from 'react';
import type {KeoDocument} from './keo-next.types';

/**
 * СПАЙК keo-draft-rest-channel: отправка черновика КЕО REST-каналом — POST
 * `draftUrl` (цепочка `/api/agent-resource`, same-origin, auth на сессии
 * хоста — как fetch-канал lookup) вместо диалогового `dispatchAction`. Пауза
 * ввода перестаёт быть run'ом AG-UI, и индикатор выполнения не мелькает.
 *
 * Ответ агента несёт пересчитанные следствия черновика — `notes` по имени
 * условия (подпись светового климата города). Они применяются локально
 * оверрайдом поверх `props.conditions[].note`: эха формы в этом канале нет.
 * `AbortController` отменяет предыдущий in-flight запрос — виден ответ только
 * на последний черновик; unmount отменяет активный. Сбой канала — тихий
 * fallback (канон lookup): черновик не критичен, форма остаётся живой.
 *
 * Новый снапшот агента (смена `resetKey`) сбрасывает оверрайды: свежие props
 * уже несут пересчитанную подпись, и держать поверх них старую нельзя.
 */
export function useKeoDraftPost(
  draftUrl: string | undefined,
  resetKey: string,
): {
  postDraft: ((document: KeoDocument) => void) | undefined;
  noteOverrides: Readonly<Record<string, string>>;
  draftSeed: KeoDocument | undefined;
} {
  const [noteOverrides, setNoteOverrides] = React.useState<Readonly<Record<string, string>>>({});
  const [draftSeed, setDraftSeed] = React.useState<KeoDocument | undefined>(undefined);
  const abortRef = React.useRef<AbortController | null>(null);
  // GET посева держит СВОЙ контроллер: его отменяют и unmount, и смена
  // снапшота, а контроллер POST'а живёт своим циклом «новый ввод отменяет
  // предыдущий».
  const seedAbortRef = React.useRef<AbortController | null>(null);
  // Пользователь уже отправлял черновик из ЭТОГО состояния экрана — поздний
  // ответ GET'а посева не должен затирать живой ввод.
  const activeRef = React.useRef(false);

  React.useEffect(() => () => abortRef.current?.abort(), []);

  // Посев при монтировании: REST-канал не перезаписывает артефакты истории
  // треда, поэтому после перезагрузки реплей отдаёт форму БЕЗ черновика —
  // клиент добирает его GET'ом того же ресурса. Ошибки тихие (канон lookup):
  // нет черновика или канала — форма живёт значениями из props.
  React.useEffect(() => {
    if (draftUrl === undefined) return undefined;

    const controller = new AbortController();
    seedAbortRef.current = controller;
    void (async () => {
      try {
        const response = await fetch(draftUrl, {signal: controller.signal});
        if (!response.ok) return;

        const body: unknown = await response.json();
        // Ответ мог доехать ДО abort'а (смена снапшота), а примениться —
        // после: устаревший посев поверх нового сообщения агента запрещён.
        if (controller.signal.aborted) return;

        const draft = (body as {draft?: unknown} | null)?.draft;
        if (
          !activeRef.current &&
          typeof draft === 'object' &&
          draft !== null &&
          Array.isArray((draft as KeoDocument).rooms) &&
          (draft as KeoDocument).rooms.length > 0
        ) {
          setDraftSeed(draft as KeoDocument);
        }
      } catch {
        // Отменённый (unmount/смена снапшота) или упавший GET — тихо: посев
        // не критичен.
      }
    })();

    return () => controller.abort();
    // Ровно раз на жизнь экрана: пересев по ходу ввода затирал бы живое.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Сброс на новом снапшоте — паттерном «состояние во время рендера» (канон
  // `baseKey` в use-keo-editor-next), а не эффектом: оверрайды старой подписи
  // и посев черновика не должны пережить даже один кадр поверх нового
  // сообщения агента (оно само несёт актуальные значения и подписи).
  const [baseKey, setBaseKey] = React.useState(resetKey);
  if (resetKey !== baseKey) {
    setBaseKey(resetKey);
    setNoteOverrides({});
    setDraftSeed(undefined);
    // In-flight запросы старого снапшота отменяются тут же: поздний POST
    // принёс бы notes прежнего документа, поздний GET посева — прежний
    // черновик, и оба перетёрли бы свежие props нового сообщения.
    abortRef.current?.abort();
    seedAbortRef.current?.abort();
  }

  if (draftUrl === undefined) {
    return {postDraft: undefined, noteOverrides, draftSeed};
  }

  const postDraft = (document: KeoDocument) => {
    activeRef.current = true;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    void (async () => {
      try {
        const response = await fetch(draftUrl, {
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify(document),
          signal: controller.signal,
        });
        if (!response.ok) return;

        const body: unknown = await response.json();
        // Ответ мог доехать ДО abort'а, а примениться — после: сверяемся с
        // сигналом ещё раз, чтобы устаревшие notes не пережили смену снапшота.
        if (controller.signal.aborted) return;

        const notes = (body as {notes?: unknown} | null)?.notes;
        if (typeof notes !== 'object' || notes === null) return;

        const parsed = Object.fromEntries(
          Object.entries(notes).filter((entry): entry is [string, string] => {
            return typeof entry[1] === 'string';
          }),
        );
        setNoteOverrides(prev => ({...prev, ...parsed}));
      } catch {
        // Отменённый запрос (новый черновик/unmount) и сбой канала — тихо:
        // черновик не критичен, следующая пауза ввода отправит свежий.
      }
    })();
  };

  return {postDraft, noteOverrides, draftSeed};
}
