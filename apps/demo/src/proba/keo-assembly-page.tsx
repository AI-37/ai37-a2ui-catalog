import React from 'react';
import {KeoNextScreen} from '../../../../packages/catalog-react/src/renderers/keo-next-screen';
import {KEO_FIRST_MOVE_PROPS, KEO_PROPS} from './keo-assembly-fixture';
import {ProbaShell} from './proba-shell';

/**
 * `/proba/keo-assembly` — тот самый экран КЕО из пакета, а не его копия. Части
 * экрана переехали в `packages/catalog-react` вместе с рендерером
 * (change `keo-editor-next`) — держать здесь второй экземпляр значило бы
 * разойтись с ним первой же правкой.
 *
 * Самый большой опросник каталога: 23 поля в четырёх секциях, два помещения,
 * четыре вида провенанса в наполнении и три правила предупреждающей валидации.
 *
 * Наружу вместо `dispatchAction` — консоль: a2ui-контекста на странице нет, а
 * приёмка по служебному трафику идёт в devtools, а не на экране.
 */
export function KeoAssemblyPage() {
  return (
    <ProbaShell
      route="/proba/keo-assembly"
      eyebrow="AI37 A2UI CATALOG"
      title="КЕО"
      lead="Экран KeoEditor из готовых примитивов: условия и помещения — секции-раскрывашки, вкладок нет, счётчик источников считает весь документ."
    >
      {/* Первый ход агента стоит ПЕРВЫМ: правило `keo-condition-unfilled`
          видно только на пустом наполнении — раскрыты «Условия», а не
          «Помещение 1», и у них пометка «заполните». На заполненной фикстуре
          ниже обе секции ведут себя одинаково, и проверить правило нечем. */}
      <KeoNextScreen
        props={KEO_FIRST_MOVE_PROPS}
        sink={{
          onSubmit: document =>
            console.info('[proba/keo-assembly] first-move', KEO_FIRST_MOVE_PROPS.submit.name, document),
        }}
      />

      <KeoNextScreen
        props={KEO_PROPS}
        sink={{onSubmit: document => console.info('[proba/keo-assembly]', KEO_PROPS.submit.name, document)}}
      />
      {/* Подпись под экраном: ступени текста объявлены под корнем набора,
          поэтому она стоит в своём `a2ui-kit`, а не в голом span. */}
      <div className="a2ui-kit">
        <span className="a2ui-t--sub a2ui-t--muted">
          submit — в консоли, служебного трафика на экране нет
        </span>
      </div>
    </ProbaShell>
  );
}
