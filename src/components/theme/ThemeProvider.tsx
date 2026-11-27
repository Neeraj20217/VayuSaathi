"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME_PREFERENCE,
  parseStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  mounted: boolean;
  setTheme: (next: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME_PREFERENCE,
  resolvedTheme: "light",
  mounted: false,
  setTheme: () => {},
});

const SERVER_SNAPSHOT = `${DEFAULT_THEME_PREFERENCE}:light:0`;
let sessionPreference: ThemePreference | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function readStoredPreference(): ThemePreference {
  if (sessionPreference !== null) return sessionPreference;
  try {
    return parseStoredTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
}

function readSystemDark(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function applyThemeToDocument(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

function getClientSnapshot(): string {
  const pref = readStoredPreference();
  const resolved = resolveTheme(pref, readSystemDark());
  return `${pref}:${resolved}:1`;
}

function getServerSnapshot(): string {
  return SERVER_SNAPSHOT;
}

function subscribeThemeStore(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window === "undefined") {
    return () => listeners.delete(listener);
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    const pref = readStoredPreference();
    applyThemeToDocument(resolveTheme(pref, media.matches));
    notifyListeners();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      sessionPreference = null;
      onChange();
    }
  };

  media.addEventListener("change", onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeThemeStore,
    getClientSnapshot,
    getServerSnapshot
  );

  const [prefRaw, resolvedRaw, mountedRaw] = snapshot.split(":");
  const theme = parseStoredTheme(prefRaw);
  const resolvedTheme: ResolvedTheme = resolvedRaw === "dark" ? "dark" : "light";
  const mounted = mountedRaw === "1";

  useEffect(() => {
    if (!mounted) return;
    applyThemeToDocument(resolvedTheme);
  }, [mounted, resolvedTheme]);

  const setTheme = useCallback((next: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      sessionPreference = null;
    } catch {
      sessionPreference = next;
    }
    applyThemeToDocument(resolveTheme(next, readSystemDark()));
    notifyListeners();
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, mounted, setTheme }),
    [theme, resolvedTheme, mounted, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
