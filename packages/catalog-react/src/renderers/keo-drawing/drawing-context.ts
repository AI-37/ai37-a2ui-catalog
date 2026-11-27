import {createContext} from 'react';
import type {DrawingView} from './drawing-view.types';

/** Мировая система координат листа; провайдер — `DrawingSheet`. */
export const DrawingContext = createContext<DrawingView | null>(null);
