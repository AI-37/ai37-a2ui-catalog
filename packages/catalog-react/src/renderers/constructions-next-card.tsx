import React from 'react';
import {Accordion} from '@base-ui/react/accordion';
import {
  CardHeader,
  CardTriggerLabel,
  Menu,
  MoreIcon,
  buttonClassName,
  cardClassName,
} from '../primitives';
import {applyRprPreview} from './apply-rpr-preview';
import {computeLiveRpr} from './compute-live-rpr';
import {ConstructionsNextBody} from './constructions-next-body';
import {ConstructionsNextRprChip} from './constructions-next-rpr-chip';
import {ConstructionsNextStatus} from './constructions-next-status';
import type {ConstructionsNextCardProps, ConstructionsNextPreview} from './constructions-next.types';
import {findInvalidLayers} from './find-invalid-layers';

/**
 * Карточка конструкции — элемент аккордеона: карточкой её делает класс
 * примитива, раскрытием, `aria-expanded` и клавиатурой владеет библиотека.
 * Переключается только тело — подложка, шапка и шеврон общие для обоих
 * состояний.
 *
 * Единственное исключение из «до коммита ничего не меняется» — чип Rпр: он
 * пересчитывается по черновику открытой формы, не трогая state редактора.
 * Смена `editingTarget` (открытие, отмена, переключение, коммит) сбрасывает
 * черновик прямо в рендере — чип ни кадра не живёт черновиком чужой формы.
 *
 * `aria-controls` объявляем сами: библиотека снимает его со свёрнутого
 * триггера, а спека требует его в обоих состояниях.
 *
 * Удаление живёт в меню, а не голым «✕»: необратимое действие не должно
 * попадаться под палец так же легко, как раскрытие, а меню приносит
 * клавиатуру и роли даром.
 */
export function ConstructionsNextCard({
  entry,
  typeConfigs,
  condition,
  materialsReferenceId,
  minChars,
  showRnorm,
  showStatusChips,
  statusDismissed,
  editingTarget,
  onEditingChange,
  onChange,
  onRemove,
  entryRef,
}: ConstructionsNextCardProps) {
  const panelId = `${React.useId()}-construction`;
  const config = typeConfigs.find(candidate => candidate.type === entry.type);

  const [preview, setPreview] = React.useState<ConstructionsNextPreview | null>(null);
  const [previewTarget, setPreviewTarget] = React.useState(editingTarget);
  if (previewTarget !== editingTarget) {
    setPreviewTarget(editingTarget);
    setPreview(null);
  }

  const rpr = computeLiveRpr(applyRprPreview(entry, editingTarget, preview), config, condition);
  const invalidity = findInvalidLayers(entry, config);
  const title = entry.name?.trim() ? entry.name : (config?.label ?? entry.type);

  return (
    <Accordion.Item
      ref={entryRef}
      value={entry.id}
      className={cardClassName({invalid: invalidity.invalid && showStatusChips})}
    >
      <CardHeader
        title={
          <Accordion.Header className="a2ui-card__heading">
            <Accordion.Trigger
              className={buttonClassName({variant: 'link', className: 'a2ui-card__title'})}
              aria-controls={panelId}
            >
              <CardTriggerLabel title={title} />
            </Accordion.Trigger>
          </Accordion.Header>
        }
        status={
          <ConstructionsNextStatus
            show={showStatusChips}
            invalidity={invalidity}
            status={statusDismissed ? undefined : entry.status}
          />
        }
        badge={<ConstructionsNextRprChip rpr={rpr} rnorm={showRnorm ? config?.rnorm : undefined} />}
        action={
          <Menu
            icon={<MoreIcon />}
            ariaLabel={`Действия: ${title}`}
            items={[{label: 'Удалить', tone: 'danger', onSelect: onRemove}]}
          />
        }
      />
      <Accordion.Panel keepMounted id={panelId} className="a2ui-card__panel">
        <ConstructionsNextBody
          entry={entry}
          typeConfigs={typeConfigs}
          config={config}
          condition={condition}
          materialsReferenceId={materialsReferenceId}
          minChars={minChars}
          editingTarget={editingTarget}
          onEditingChange={onEditingChange}
          onChange={onChange}
          onPreviewChange={setPreview}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
}
