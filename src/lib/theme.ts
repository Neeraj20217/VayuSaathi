export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "vayusaathi-theme";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "light";

export function parseStoredTheme(value: string | null | undefined): ThemePreference {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return DEFAULT_THEME_PREFERENCE;
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean
): ResolvedTheme {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  return systemPrefersDark ? "dark" : "light";
}

/**
 * Synchronous inline script executed before first paint to prevent theme flash
 * while preserving "light" as the initial default when no preference is stored.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);var t=(s==='light'||s==='dark'||s==='system')?s:'light';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d){r.classList.add('dark');r.dataset.theme='dark';r.style.colorScheme='dark';}else{r.classList.remove('dark');r.dataset.theme='light';r.style.colorScheme='light';}}catch(e){}})();`;
