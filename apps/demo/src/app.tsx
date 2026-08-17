import {useMemo, useState, type ReactNode} from 'react';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog} from '@ai37/a2ui-catalog-react';
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePartPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  type ChatModelAdapter,
  type ThreadMessageLike,
  useLocalRuntime,
} from '@assistant-ui/react';
import simpleTableMessages from '../../../fixtures/messages/simple-table-surface.json';
import flexTableMessages from '../../../fixtures/messages/flex-table-surface.json';
import latexMessages from '../../../fixtures/messages/latex-formula-surface.json';
import choiceCardMessages from '../../../fixtures/messages/choice-card-surface.json';
import formCardMessages from '../../../fixtures/messages/form-card-surface.json';
import formCardLookupFetchMessages from '../../../fixtures/messages/form-card-lookup-fetch-surface.json';
import constructionsEditorMessages from '../../../fixtures/messages/constructions-editor-surface.json';
import constructionsConditionsMessages from '../../../fixtures/messages/constructions-editor-conditions-surface.json';
import liftEditorMessages from '../../../fixtures/messages/lift-editor-surface.json';
import liftEditorGroupFixture from '../../../fixtures/valid/lift-editor-group.json';
import thermalReportSingleFixture from '../../../fixtures/valid/thermal-report-single.json';
import thermalReportMultiFixture from '../../../fixtures/valid/thermal-report-multi.json';
import keoEditorFixture from '../../../fixtures/valid/keo-editor.json';
import keoReportFailFixture from '../../../fixtures/valid/keo-report-fail.json';
import keoReportPassFixture from '../../../fixtures/valid/keo-report-pass.json';
import insolationEditorFixture from '../../../fixtures/valid/insolation-editor.json';
import insolationReportPassFixture from '../../../fixtures/valid/insolation-report-pass.json';
import insolationReportFailFixture from '../../../fixtures/valid/insolation-report-fail.json';
import {attachDemoLookupHost} from './demo-lookup-host';
import {attachDemoActionLogger} from './attach-demo-action-logger';
import {attachDemoDraftLogger} from './attach-demo-draft-logger';
import {createLiftEditorMessages} from './create-lift-editor-messages';
import {createThermalReportMessages} from './create-thermal-report-messages';
import {createSurfaceMessages} from './create-surface-messages';
import {DEMO_DRAFT_ACTION, withConstructionsDraftAction} from './with-constructions-draft-action';
import {withStatusChipsPreview} from './with-status-chips-preview';
import {DEMO_LIFT_DRAFT_ACTION, withLiftDraftAction} from './with-lift-draft-action';

const examples = [
  {
    key: 'simple-preview',
    title: 'Simple Table',
    description: 'Одноуровневая таблица для лаконичных выборок и перечней.',
    messages: simpleTableMessages as A2uiMessage[],
  },
  {
    key: 'flex-preview',
    title: 'Flex Table',
    description: 'Многоуровневые заголовки для сравнительных отчетов и матриц.',
    messages: flexTableMessages as A2uiMessage[],
  },
  {
    key: 'latex-preview',
    title: 'LaTeX Formula',
    description: 'Математические формулы для объяснений и аналитических выводов.',
    messages: latexMessages as A2uiMessage[],
  },
  {
    key: 'choice-preview',
    title: 'Choice Card',
    description: 'Интерактивный выбор варианта для уточняющих HITL-вопросов агента.',
    messages: choiceCardMessages as A2uiMessage[],
  },
  {
    key: 'form-preview',
    title: 'Form Card',
    description: 'Форма типизированных полей для сбора параметров у пользователя.',
    messages: formCardMessages as A2uiMessage[],
  },
  {
    key: 'form-fetch-preview',
    title: 'Form Card — lookup fetch',
    description: 'Lookup-поле с подсказками через same-origin fetch (dev-middleware, только dev-сервер).',
    messages: formCardLookupFetchMessages as A2uiMessage[],
  },
  {
    key: 'constructions-preview',
    title: 'Constructions Editor',
    description:
      'Экран одним сообщением: блок «Условия» в шапке (город из справочника подставляет климат) и конструкции сразу под ним — слои-сводки с формой слоя и явным «Применить», lookup материалов (dev-middleware) и live Rпр; автосейв черновика по коммитам формы слоя (в консоли), подсветка невалидных конструкций и один submit без клиентской блокировки.',
    messages: withConstructionsDraftAction(constructionsEditorMessages as A2uiMessage[]),
  },
  {
    key: 'constructions-status-preview',
    title: 'Constructions Editor — статусы и «Далее»',
    description:
      'Статусные чипы и двухрежимная кнопка: tв пуст — чипов нет, «Далее» раскрывает условия; после ввода tв карточки получают «подтвердите» / «подтвердите паспорт» / «2 слоя без λ», «Далее» ведёт по проблемным карточкам (раскрытие полной гасит статус в «готова», правка слоя — тоже), чистый список возвращает «Рассчитать» с прежним submit.',
    messages: withStatusChipsPreview(
      withConstructionsDraftAction(constructionsEditorMessages as A2uiMessage[]),
    ),
  },
  {
    key: 'constructions-conditions-preview',
    title: 'Constructions Editor — условия и provenance',
    description:
      'Тот же экран с шапкой карточки, свёрнутым блоком условий (строка-сводка собрана из значений) и источниками значений: «из проекта» заливкой, «предложено агентом» акцентной рамкой с обоснованием, «по умолчанию» маркером. ГСОП приходит от агента и стоит рядом с регионом; правка поля снимает с него подпись источника, правка климата прячет протухший ГСОП. Ширину карточки задаёт контейнер — сузьте окно, и сетка условий схлопнется в одну колонку.',
    messages: constructionsConditionsMessages as A2uiMessage[],
  },
  {
    key: 'lift-preview',
    title: 'Lift Editor — методика с лифтами',
    description:
      'Подбор лифтов одним экраном (ГОСТ Р 52941-2008): секция «Здание» и секции «Лифт 1…N» со строками-сводками из живых значений, методика — переключателем в шапке карточки («ГОСТ · жилое здание»), сводка принятых значений в свёрнутых «Параметрах по умолчанию», подписи источников («из вашего вопроса», «предложено по классу здания» — снимаются правкой). Кнопка двухрежимная: «Далее» проводит по секциям, потом «Рассчитать». В консоли видно live-черновик: правка поля уезжает debounce\'ом 500 мс, add/remove лифта, смена методики и «Далее» — сразу. Сузьте окно — сетка полей схлопнется в одну колонку.',
    messages: withLiftDraftAction(liftEditorMessages as A2uiMessage[]),
  },
  {
    key: 'lift-group-preview',
    title: 'Lift Editor — лифтовая группа',
    description:
      'Та же схема с активной методикой ГОСТ 34758-2021: одна секция лифтовой группы без add/remove, тип здания из секции «Здание» живёт в тексте шапки и переключает ряды Прил. Е у ширины двери и скорости, tОст считается по трём источникам, Pk — по Q. Переключатель методики в шапке перестраивает форму без раунд-трипа: наружу уезжает только черновик новой ветки, ответа компонент не ждёт.',
    messages: createLiftEditorMessages({
      ...(liftEditorGroupFixture.props as Record<string, unknown>),
      draftAction: DEMO_LIFT_DRAFT_ACTION,
    }),
  },
  {
    key: 'thermal-report-single-preview',
    title: 'Thermal Report — одна конструкция',
    description:
      'Результат теплотехнического расчёта карточками вместо markdown-простыни: вердикт с бейджем и крупным R₀, проверки со статусами (kоб — справочной строкой без кнопки), таблица слоёв с итоговой строкой, исходные данные чипами по источнику («принято системой» — пунктиром с заметкой), протокол расчёта под катом. Клик «Изменить и пересчитать» диспатчит действие — видно в консоли.',
    messages: createThermalReportMessages(
      thermalReportSingleFixture.props as Record<string, unknown>,
    ),
  },
  {
    key: 'thermal-report-multi-preview',
    title: 'Thermal Report — 7 конструкций',
    description:
      'Тот же компонент в наполнении списка: вердикт «Соответствуют 2 из 7», конструкции с чипами отклонения по знаку (−53,9 % красным, +0,6 % зелёным) и «Подобрать» только у непроходящих, строка исключённых с «Вернуть в расчёт», допущения жёлтой заметкой. Все кнопки диспатчат действия с payload (constructionId) — смотрите консоль.',
    messages: createThermalReportMessages(
      thermalReportMultiFixture.props as Record<string, unknown>,
    ),
  },
  {
    key: 'keo-editor-preview',
    title: 'Keo Editor — исходные данные КЕО',
    description:
      'Сбор данных расчёта КЕО одним экраном: readonly-условия (Тюмень, группа светового климата 1, e_н 0,5 %), помещения вкладками с «+ Добавить помещение», вычисляемая подпись плоскости и точки расчёта (пол Г-0,0 по СП 52 прил. Л, а не УРП 0,8 — смените назначение на «Кухня», подпись пересчитается локально), ветка затенения по схеме N1 раскрывается полем «Противостоящее здание» (переключите на «Нет» — появится предупреждение о допущении), метки источника у каждого поля со счётчиком в футере (правка переводит метку в «изменено вами»), свёрнутый блок принятых коэффициентов со сводкой. Введите глубину 8 м — поля подсветятся пометкой «! проверить» (d_п/h₀₁ ≤ 2,5), но «Рассчитать» останется активным. Наружу уходит РОВНО один submit с полным документом — смотрите консоль.',
    messages: createSurfaceMessages(
      'KeoEditor',
      keoEditorFixture.props as Record<string, unknown>,
    ),
  },
  {
    key: 'keo-report-fail-preview',
    title: 'Keo Report — не проходит',
    description:
      'Результат расчёта КЕО карточками: вердикт «0,42 % при норме 0,50 %», секция «Что изменить» карточками вариантов (зелёная рамка с кнопкой пересчёта, нейтральный вариант, отвергнутый — detail красным без кнопки), допущения заметкой, исходные данные чипами по источнику («принято системой» — пунктиром) и протокол одной строкой со «Скачать» (клиентский Blob). Кнопки диспатчат действия с payload — смотрите консоль.',
    messages: createSurfaceMessages(
      'KeoReport',
      keoReportFailFixture.props as Record<string, unknown>,
    ),
  },
  {
    key: 'keo-report-pass-preview',
    title: 'Keo Report — два помещения проходят',
    description:
      'То же наполнение в мультипомещенном режиме: сводный вердикт «Соответствуют 2 помещения из 2», результаты по помещениям со статусными значениями против нормы и кнопкой пересчёта только там, где агент её задал. Без downloadFileName протокол остаётся строкой без «Скачать».',
    messages: createSurfaceMessages(
      'KeoReport',
      keoReportPassFixture.props as Record<string, unknown>,
    ),
  },
  {
    key: 'insolation-editor-preview',
    title: 'Insolation Editor — исходные данные инсоляции',
    description:
      'Сбор данных расчёта инсоляции: условия с широтной зоной и нормативом (строки от агента, в фикстуре помечены TODO-сверкой с СанПиН), расчётные точки вкладками, затеняющая застройка компактными строками с «+ Добавить здание» и удалением, плашки об упрощённой модели прямоугольных экранов. Отметка центра окна и дата проверки пришли с меткой «рассчитано» — правьте, метка станет «изменено вами», и НИЧЕГО не пересчитается (пересчёт по этажу — знание агента). Один submit с документом `{conditions, points, buildings}` — смотрите консоль.',
    messages: createSurfaceMessages(
      'InsolationEditor',
      insolationEditorFixture.props as Record<string, unknown>,
    ),
  },
  {
    key: 'insolation-report-pass-preview',
    title: 'Insolation Report — прерывистая инсоляция',
    description:
      'Результат расчёта инсоляции: вердикт «2 ч 40 мин суммарно», суточный таймлайн 8:00–16:00 с пропорциональными сегментами солнце/тень (подпись тени вынесена под ось), проверки по СанПиН со статусными точками и справочной строкой «По квартире» с переходом «Посчитать по проекту», плашки допущений, исходные данные чипами и протокол со «Скачать».',
    messages: createSurfaceMessages(
      'InsolationReport',
      insolationReportPassFixture.props as Record<string, unknown>,
    ),
  },
  {
    key: 'insolation-report-fail-preview',
    title: 'Insolation Report — не проходит',
    description:
      'Тот же компонент в fail-наполнении: 1 ч 50 мин непрерывно при норме 2 ч 30 мин, один солнечный сегмент и длинная тень здания на таймлайне, две проверки с danger-статусом. Протокол без downloadFileName — строка без кнопки «Скачать».',
    messages: createSurfaceMessages(
      'InsolationReport',
      insolationReportFailFixture.props as Record<string, unknown>,
    ),
  },
] as const;

const seedMessages: ThreadMessageLike[] = [
  {
    id: 'intro-user',
    role: 'user',
    content: [{type: 'text', text: 'Покажи, как кастомные AI37 A2UI компоненты выглядят в реальном chat UI.'}],
  },
  {
    id: 'intro-assistant',
    role: 'assistant',
    content: [
      {
        type: 'text',
        text: 'Ниже тот же каталог, но уже не в витрине компонентов, а внутри chat-thread. Каждый preview отрисован как assistant message с теми же схемами и React renderer-ами.',
      },
    ],
  },
  ...examples.map(example => ({
    id: example.key,
    role: 'assistant' as const,
    content: [
      {
        type: 'text' as const,
        text: `${example.title}: ${example.description}`,
      },
    ],
  })),
];

const demoChatModel: ChatModelAdapter = {
  async run({messages}) {
    const lastUserMessage = [...messages].reverse().find(message => message.role === 'user');
    const userText = lastUserMessage?.content
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join(' ')
      .trim();

    return {
      content: [
        {
          type: 'text',
          text: userText
            ? `Demo не ходит в backend: это локальный runtime на assistant-ui. Но chat shell, composer и сами A2UI previews уже работают вместе. Последний запрос: “${userText}”.`
            : 'Demo не ходит в backend: это локальный runtime на assistant-ui с локально встроенными previews каталога.',
        },
      ],
    };
  },
};

type CatalogTheme = 'light' | 'dark';

export function App() {
  const [theme, setTheme] = useState<CatalogTheme>('light');

  const previewSurfaces = useMemo(() => {
    return Object.fromEntries(
      examples.map(example => {
        const processor = new MessageProcessor([ai37Catalog]);
        processor.processMessages(example.messages);
        if (example.key === 'form-preview') {
          attachDemoLookupHost(processor, 'demo-surface');
        }
        if (example.key === 'constructions-preview') {
          attachDemoDraftLogger(processor, 'demo-surface', DEMO_DRAFT_ACTION);
        }
        if (
          example.key === 'lift-preview' ||
          example.key === 'lift-group-preview' ||
          example.key === 'thermal-report-single-preview' ||
          example.key === 'thermal-report-multi-preview' ||
          example.key === 'keo-editor-preview' ||
          example.key === 'keo-report-fail-preview' ||
          example.key === 'keo-report-pass-preview' ||
          example.key === 'insolation-editor-preview' ||
          example.key === 'insolation-report-pass-preview' ||
          example.key === 'insolation-report-fail-preview'
        ) {
          attachDemoActionLogger(processor, 'demo-surface', example.key);
        }
        return [example.key, processor.model.getSurface('demo-surface')];
      }),
    ) as Record<(typeof examples)[number]['key'], unknown>;
  }, []);

  const runtime = useLocalRuntime(demoChatModel, {
    initialMessages: seedMessages,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <main className="demo-shell">
        <section className="demo-hero">
          <div>
            <span className="demo-eyebrow">AI37 A2UI Catalog</span>
            <h1>Custom components inside a real chat thread</h1>
            <p>
              Эта версия demo показывает те же `SimpleTable`, `FlexTable` и `LatexFormula`, но уже в формате
              assistant conversation. Так проще проверить, как компоненты будут выглядеть в агентном интерфейсе,
              а не в изолированной витрине.
            </p>
          </div>
          <div className="demo-hero-note">
            <strong>Local runtime</strong>
            <span>assistant-ui отвечает за thread/composer UX, а A2UI surface по-прежнему рендерит сам контент.</span>
            <strong>Тема каталога</strong>
            <span>Переключатель меняет только токены `--a2ui-*` у превью — сами рендереры не трогаем.</span>
            <div className="demo-theme-toggle" role="group" aria-label="Тема каталога">
              <button type="button" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
                Светлая
              </button>
              <button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
                Тёмная
              </button>
            </div>
          </div>
        </section>

        <ThreadPrimitive.Root className="chat-shell">
          <ThreadPrimitive.Viewport className="chat-viewport">
            <div className="chat-messages">
              <ThreadPrimitive.Messages>
                {({message}) => {
                  if (message.role === 'user') {
                    return <UserBubble />;
                  }

                  const previewSurface = message.id
                    ? previewSurfaces[message.id as keyof typeof previewSurfaces]
                    : undefined;

                  return <AssistantBubble surface={previewSurface} theme={theme} />;
                }}
              </ThreadPrimitive.Messages>
            </div>

            <ThreadPrimitive.ViewportFooter className="chat-footer">
              <ComposerPrimitive.Root className="chat-composer">
                <ComposerPrimitive.Input
                  className="chat-composer-input"
                  placeholder="Напишите сообщение, чтобы проверить shell и composer..."
                  rows={1}
                />
                <ComposerPrimitive.Send className="chat-composer-send">Send</ComposerPrimitive.Send>
              </ComposerPrimitive.Root>
            </ThreadPrimitive.ViewportFooter>
          </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>
      </main>
    </AssistantRuntimeProvider>
  );
}

function UserBubble() {
  return (
    <MessagePrimitive.Root className="message-row message-row-user">
      <div className="message-bubble message-bubble-user">
        <MessagePrimitive.Parts>
          {({part}) => {
            if (part.type !== 'text') return null;
            return (
              <p className="message-text">
                <MessagePartPrimitive.Text />
              </p>
            );
          }}
        </MessagePrimitive.Parts>
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantBubble({
  surface,
  theme,
  children,
}: {
  surface?: unknown;
  theme: CatalogTheme;
  children?: ReactNode;
}) {
  const previewClassName =
    theme === 'dark' ? 'message-preview-card a2ui-theme-dark' : 'message-preview-card';

  return (
    <MessagePrimitive.Root className="message-row message-row-assistant">
      <div className="message-avatar">AI37</div>
      <div className="message-bubble message-bubble-assistant">
        <MessagePrimitive.Parts>
          {({part}) => {
            if (part.type !== 'text') return null;
            return (
              <p className="message-text message-text-assistant">
                <MessagePartPrimitive.Text />
              </p>
            );
          }}
        </MessagePrimitive.Parts>
        {surface ? (
          <div className={previewClassName}>
            <A2uiSurface surface={surface as any} />
          </div>
        ) : null}
        {children ? <div className={previewClassName}>{children}</div> : null}
      </div>
    </MessagePrimitive.Root>
  );
}
