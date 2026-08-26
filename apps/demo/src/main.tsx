import React from 'react';
import ReactDOM from 'react-dom/client';
import 'katex/dist/katex.min.css';
import {App} from './app';
import {AssemblyPage} from './proba/assembly-page';
import {LiftAssemblyPage} from './proba/lift-assembly-page';
import {LookupPage} from './proba/lookup-page';
import {ReportAssemblyPage} from './proba/report-assembly-page';
import {RevisionPage} from './proba/revision-page';
import {SystemPage} from './proba/system-page';
import './styles.css';

/**
 * Роутер демо — один `pathname` без библиотеки: страниц немного, а разделы
 * ревизии нужны отдельными адресами, чтобы их можно было открыть ссылкой и
 * сравнивать в двух вкладках. Dev-сервер Vite отдаёт `index.html` на любой
 * путь (appType: 'spa').
 *
 * Хвостовой слэш срезаем: браузер дописывает его сам (`/proba/`), и строгое
 * сравнение молча роняло на главную вместо 404.
 */
const route = window.location.pathname.replace(/\/+$/, '') || '/';

/** `/proba` без раздела ведёт на готовое: ревизия — это справка к нему. */
const PAGES: Record<string, React.ReactNode> = {
  '/proba': <SystemPage />,
  '/proba/system': <SystemPage />,
  '/proba/assembly': <AssemblyPage />,
  '/proba/lift-assembly': <LiftAssemblyPage />,
  '/proba/report-assembly': <ReportAssemblyPage />,
  '/proba/lookup': <LookupPage />,
  '/proba/revision': <RevisionPage />,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{PAGES[route] ?? <App />}</React.StrictMode>,
);
