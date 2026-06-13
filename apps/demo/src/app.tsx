import {useMemo} from 'react';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog} from '@ai37-a2ui/catalog-react';
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

export function App() {
  const previewSurfaces = useMemo(() => {
    return Object.fromEntries(
      examples.map(example => {
        const processor = new MessageProcessor([ai37Catalog]);
        processor.processMessages(example.messages);
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

                  return <AssistantBubble surface={previewSurface} />;
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

function AssistantBubble({surface}: {surface?: unknown}) {
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
          <div className="message-preview-card">
            <A2uiSurface surface={surface as any} />
          </div>
        ) : null}
      </div>
    </MessagePrimitive.Root>
  );
}
