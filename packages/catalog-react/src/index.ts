export * from './catalog';
export * from './renderers/tokens';
export * from './renderers/simple-table';
export * from './renderers/flex-table';
export * from './renderers/latex-formula';
export * from './renderers/choice-card';
export * from './renderers/form-card';
export * from './renderers/constructions-editor';
export * from './renderers/constructions-editor-next';
// Окно дебаунса автодрафта условий: экспортируется, чтобы тесты и хосты
// мотали таймеры тем же значением, а не магическим числом.
export * from './renderers/conditions-draft-debounce-ms';
export * from './renderers/lift-editor';
export * from './renderers/lift-editor-next';
// Окно дебаунса live-черновика LiftEditor: экспортируется, чтобы тесты и хосты
// мотали таймеры тем же значением, а не магическим числом.
export * from './renderers/lift-draft-debounce-ms';
// Live-расчёт Rпр редактора: экспортируется для сверки клиент/сервер
// (λ-дефолт обязан совпадать с resolve-layer-lambda агента teplo-calc).
export * from './renderers/resolve-layer-lambda';
export * from './renderers/compute-live-rpr';
export * from './renderers/thermal-report';
export * from './renderers/thermal-report-next';
// Экран отчёта без a2ui-хоста: песочница ставит его на страницу и подменяет
// dispatchAction консолью — второй экземпляр экрана разошёлся бы с рендерером.
export * from './renderers/thermal-report-next-screen';
export * from './renderers/keo-editor';
export * from './renderers/keo-editor-next';
// Экран КЕО без a2ui-хоста: песочница ставит его на страницу и подменяет
// dispatchAction консолью — второй экземпляр экрана разошёлся бы с рендерером.
export * from './renderers/keo-next-screen';
export * from './renderers/keo-report';
export * from './renderers/keo-report-next';
export * from './renderers/keo-report-next-screen';
// Блок чертежей Данилюка без отчёта: витрина ревизии ставит его на страницу с
// живой формой параметров. Компонентом КАТАЛОГА он при этом не становится —
// в catalog.ts не зарегистрирован (Non-goals change'а keo-report-drawings).
export {KeoDrawingsSection} from './renderers/keo-drawing';
export * from './renderers/insolation-editor';
export * from './renderers/insolation-report';
export * from './renderers/lift-report';
export * from './renderers/lift-report-next';
export * from './renderers/lift-report-next-screen';
