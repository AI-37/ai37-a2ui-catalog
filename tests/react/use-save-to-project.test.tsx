import {act, renderHook} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {useSaveToProject} from '../../packages/catalog-react/src/renderers/use-save-to-project';

/**
 * Состояние «Сохранить в проект» привязано к артефакту: компонент на месте получает новый
 * протокол (пересчёт) — «В проекте» прошлого артефакта сбрасывается, поздний ответ хоста по
 * прошлому артефакту новое состояние не трогает.
 */
describe('useSaveToProject: смена artifactId', () => {
  it('после пересчёта «В проекте» сбрасывается, новый протокол можно сохранить', async () => {
    const onSave = vi.fn(async () => undefined);
    const {result, rerender} = renderHook(({id}) => useSaveToProject(id, onSave), {
      initialProps: {id: 'a1'},
    });
    await act(async () => {
      result.current.save();
    });
    expect(result.current.state).toBe('saved');

    rerender({id: 'a2'});
    expect(result.current.state).toBe('idle');
    await act(async () => {
      result.current.save();
    });
    expect(onSave).toHaveBeenLastCalledWith('a2');
    expect(result.current.state).toBe('saved');
  });

  it('ответ по прошлому артефакту, пришедший после смены, состояние нового не меняет', async () => {
    let resolveOld: () => void = () => undefined;
    const onSave = vi.fn(
      (id: string) =>
        new Promise<void>(r => {
          if (id === 'a1') resolveOld = r;
          else r();
        }),
    );
    const {result, rerender} = renderHook(({id}) => useSaveToProject(id, onSave), {
      initialProps: {id: 'a1'},
    });
    act(() => {
      result.current.save();
    });
    expect(result.current.state).toBe('saving');

    rerender({id: 'a2'});
    expect(result.current.state).toBe('idle');
    await act(async () => {
      resolveOld();
    });
    expect(result.current.state).toBe('idle');
  });
});
