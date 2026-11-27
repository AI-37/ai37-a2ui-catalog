import React from 'react';
import type {ReactComponentImplementation} from '@a2ui/react/v0_9';

/**
 * Режим «только чтение» для прошлой поверхности в ленте хоста.
 *
 * Хост держит редактируемой одну, последнюю поверхность, а прежние показывает
 * историей. Раньше он глушил прошлую поверхность целиком (`inert` на контейнере),
 * и в старом отчёте переставали работать «Скачать», «Сохранить в проект» и
 * ссылки. Режим делит интерактив по смыслу:
 * - ввод, который меняет диалог (поля и кнопки форм, редакторы, кнопки действий
 *   отчёта, уходящие агенту), блокируется;
 * - скачивание, «Сохранить в проект» (вызов хоста, не агенту), ссылки,
 *   раскрытие и сворачивание остаются рабочими.
 *
 * Без провайдера каталог рендерится как раньше, байт в байт: обёртки нет.
 */
const SurfaceReadOnlyContext = React.createContext<boolean | undefined>(undefined);

export function SurfaceReadOnlyProvider({
  readOnly,
  children,
}: {
  readOnly: boolean;
  children?: React.ReactNode;
}) {
  return (
    <SurfaceReadOnlyContext.Provider value={readOnly}>{children}</SurfaceReadOnlyContext.Provider>
  );
}

/** Прошлая ли это поверхность. Без провайдера — нет. */
export function useSurfaceReadOnly(): boolean {
  return React.useContext(SurfaceReadOnlyContext) === true;
}

/**
 * Оборачивает компонент ввода: в режиме чтения его поддерево становится `inert` —
 * ни клика, ни фокуса, ни клавиатуры.
 *
 * Обёртка `display: contents` стоит под провайдером ВСЕГДА, а меняется только
 * атрибут. Иначе при переходе «живая → прошлая» сменилось бы дерево, форма
 * перемонтировалась бы и потеряла введённое. Коробки у обёртки нет, раскладку
 * родителя (flex, grid) она не трогает. `data-a2ui-read-only` — крючок для
 * стилей хоста (приглушить прошлые поля).
 */
export function withReadOnlyGate(impl: ReactComponentImplementation): ReactComponentImplementation {
  const Render = impl.render;
  const Gated: ReactComponentImplementation['render'] = props => {
    const readOnly = React.useContext(SurfaceReadOnlyContext);
    if (readOnly === undefined) {
      return <Render {...props} />;
    }
    return (
      <div
        data-a2ui-read-only={readOnly ? '' : undefined}
        inert={readOnly}
        style={{display: 'contents'}}
      >
        <Render {...props} />
      </div>
    );
  };
  Gated.displayName = `ReadOnlyGate(${impl.name})`;
  return {...impl, render: Gated};
}
