import React from 'react';
import {Collapsible} from '@base-ui/react/collapsible';
import {Card, CardBody, CardHeader, ReportProtocolCard} from '../primitives';
import {ReportNextDownload} from './report-next-download';
import {ReportNextFoldTrigger} from './report-next-fold-trigger';
import {renderProtocolMarkdown} from './protocol-markdown';
import type {ReportNextProtocol} from './report-next.types';
import {useA2uiMessages} from '../i18n';

/**
 * «Протокол расчёта». Без полного текста в props — одна строка: лейбл, мета и
 * «Скачать ⌄»; краткий вывод `content` на экран не выводится, простыня живёт
 * на ручке агента (чат spai-ui).
 *
 * С `downloadContent` (внешний хост MCP App: полки и ручки агента там нет,
 * протокол едет текстом) строка раскрывается, как «Исходные данные»: под ней
 * весь расчёт — заголовки, таблицы и формулы. Иначе в Claude и ChatGPT формулы
 * было бы не посмотреть вовсе: скачивание там зависит от хоста.
 */
export function ReportNextProtocolCard({protocol}: {protocol: ReportNextProtocol | undefined}) {
  const m = useA2uiMessages();
  if (protocol === undefined) {
    return null;
  }

  const action = <ReportNextDownload protocol={protocol} />;
  if (protocol.downloadContent === undefined) {
    return <ReportProtocolCard label={m.report.protocol} meta={protocol.meta} action={action} />;
  }
  return (
    <ReportNextProtocolFold
      label={m.report.protocol}
      meta={protocol.meta}
      source={protocol.downloadContent}
      action={action}
    />
  );
}

/**
 * Раскрываемый протокол. Свёрнут по умолчанию; HTML собирается только при
 * первом раскрытии — KaTeX на сотню формул заметен, а большинство отчётов
 * протокол не открывает.
 */
function ReportNextProtocolFold({
  label,
  meta,
  source,
  action,
}: {
  label: string;
  meta: string | undefined;
  source: string;
  action: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const panelId = `${React.useId()}-protocol`;
  const html = React.useMemo(() => (open ? renderProtocolMarkdown(source) : ''), [open, source]);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Card>
        <CardHeader
          title={<ReportNextFoldTrigger panelId={panelId} label={label} summary={meta ?? ''} open={open} />}
          action={action}
        />
        <Collapsible.Panel keepMounted id={panelId} className="a2ui-card__panel">
          <CardBody>
            <div className="a2ui-protocol-doc" dangerouslySetInnerHTML={{__html: html}} />
          </CardBody>
        </Collapsible.Panel>
      </Card>
    </Collapsible.Root>
  );
}
