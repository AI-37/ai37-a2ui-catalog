/** Тема витрины: ровно то, что понимает атрибут `data-a2ui-theme`. */
export type ProbaTheme = 'light' | 'dark';

export interface ProbaThemeToggleProps {
  theme: ProbaTheme;
  onChange: (next: ProbaTheme) => void;
}
