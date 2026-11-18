import React from 'react';
import {Collapsible} from '@base-ui/react/collapsible';
import {ReportNote} from '../primitives';
import {ReportNextFoldTrigger} from './report-next-fold-trigger';
import {renderLabelSubscripts} from '../primitives/render-label-subscripts';
import {formatPlural, useA2uiI18n} from '../i18n';

/**
 * Допущения расчёта — фолдом, свёрнутым по умолчанию (change
 * `next-report-folds`): на живом наполнении агента КЕО это одна заметка на
 * ~800 символов в семь предложений, самый длинный блок карточки, и стоял он
 * между результатом и исходными данными.
 *
 * Свёрнутый вид говорит число, а не молчит; раскрытый — та же заметка, что
 * была. Допущений нет — нет и фолда: пустого экспандера на экране быть не
 * должно.
 */
export function ReportNextAssumptions({assumptions}: {assumptions: string[] | undefined}) {
  const {locale, messages} = useA2uiI18n();
  const [open, setOpen] = React.useState(false);
  const panelId = `${React.useId()}-assumptions`;

  if (assumptions === undefined) {
    return null;
  }

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div style={open ? openHeadStyle : headStyle}>
        <ReportNextFoldTrigger
          panelId={panelId}
          label={messages.report.assumptions}
          summary={formatPlural(locale, messages.report.assumptionsCount, assumptions.length)}
          open={open}
        />
      </div>
      <Collapsible.Panel keepMounted id={panelId} className="a2ui-card__panel">
        <ReportNote>{renderLabelSubscripts(assumptions.join(' · '))}</ReportNote>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

/* Заметка живёт в теле карточки, а не в своей: шапки у неё нет, поэтому ряд
   «шеврон + подпись + сводка» выкладывается здесь. */
const headStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  flexWrap: 'wrap',
  gap: 10,
};

/* Отступ до заметки — только когда она есть на экране: у свёрнутого блока он
   давал бы пустую полосу под подписью. */
const openHeadStyle: React.CSSProperties = {...headStyle, marginBottom: 8};
