export function useA2uiBaseStyles() {
  return undefined;
}

export function toDisplayValue(value: unknown) {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

export function mapAlign(value?: 'start' | 'center' | 'end') {
  switch (value) {
    case 'center':
      return 'center';
    case 'end':
      return 'right';
    default:
      return 'left';
  }
}