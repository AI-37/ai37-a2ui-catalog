import {useContext} from 'react';
import {DrawingContext} from './drawing-context';
import type {DrawingView} from './drawing-view.types';

/** Доступ к преобразованию мир → экран из примитивов листа. */
export function useDrawingView(): DrawingView {
  const view = useContext(DrawingContext);

  if (view === null) {
    throw new Error('useDrawingView: примитив чертежа должен стоять внутри <DrawingSheet>');
  }

  return view;
}
