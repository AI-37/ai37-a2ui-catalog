import React from 'react';

/** Приглушённая строка под заголовком или под слотом файла; без текста — ничего. */
export function AttachmentChoiceCardNote({text}: {text: string | undefined}) {
  if (text === undefined) return null;

  return (
    <p className="a2ui-t--sub a2ui-t--muted" style={paragraphStyle}>
      {text}
    </p>
  );
}

const paragraphStyle: React.CSSProperties = {margin: 0};
