import React from 'react';
import type {ComponentContext} from '@a2ui/web_core/v0_9';

/**
 * Реактивное чтение значения dataModel surface'а по точному пути.
 *
 * DataModel ключует Preact-сигналы точной строкой пути (ведущий слэш
 * значим), поэтому `path` должен посимвольно совпадать с тем, что пишет
 * `updateDataModel`. `subscribe` уведомляет только о последующих
 * изменениях, снапшот читается синхронно из сигнала.
 */
export function useDataModelValue<T>(context: ComponentContext, path: string): T | undefined {
  const {dataModel} = context.dataContext;

  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const subscription = dataModel.subscribe(path, onStoreChange);
      return () => subscription.unsubscribe();
    },
    [dataModel, path],
  );

  const getSnapshot = React.useCallback(() => dataModel.getSignal<T>(path).value, [dataModel, path]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
