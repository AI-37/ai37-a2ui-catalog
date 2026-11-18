import React from 'react';
import {Button, Field, Form, NumberField} from '../primitives';
import type {ConstructionsNextPassportProps} from './constructions-next.types';
import {useA2uiMessages} from '../i18n';

/**
 * Форма паспортного Rпр — тот же паттерн, что у слоя и шапки: локальная копия,
 * явное «Применить», «Применить» без изменений равносильно «Отмене». Каждая
 * правка уходит в превью Rпр карточки, но коммитом не является.
 */
export function ConstructionsNextPassportForm({
  value,
  onCommit,
  onCancel,
  onDraftChange,
}: ConstructionsNextPassportProps) {
  const m = useA2uiMessages();
  const [draft, setDraft] = React.useState<number | undefined>(value);

  const handleApply = () => {
    if (draft === value) {
      onCancel();
      return;
    }
    onCommit(draft);
  };

  return (
    <div style={formStyle}>
      <Form>
        <Field label={m.constructions.passportField}>
          <NumberField
            value={draft ?? null}
            min={0.01}
            step={0.01}
            compact
            onValueChange={next => {
              const parsed = next ?? undefined;
              setDraft(parsed);
              onDraftChange(parsed);
            }}
          />
        </Field>
      </Form>

      <div style={actionsStyle}>
        <Button variant="filled" size="sm" onClick={handleApply}>
          {m.common.apply}
        </Button>
        <Button size="sm" onClick={onCancel}>
          {m.common.cancel}
        </Button>
      </div>
    </div>
  );
}

const formStyle: React.CSSProperties = {display: 'grid', gap: 12};

const actionsStyle: React.CSSProperties = {display: 'flex', flexWrap: 'wrap', gap: 8};
