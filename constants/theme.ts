import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#111827",
    background: "#F8FAFC",
    card: "#FFFFFF",
    primary: "#2563EB",
    secondary: "#64748B",
    border: "#E5E7EB",
  },
  dark: {
    text: "#F9FAFB",
    background: "#020617",
    card: "#111827",
    primary: "#60A5FA",
    secondary: "#94A3B8",
    border: "#1F2937",
  },
} as const;

export type ThemeMode = keyof typeof Colors;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    mono: "ui-monospace",
  },
  android: {
    sans: "sans-serif",
    mono: "monospace",
  },
  default: {
    sans: "normal",
    mono: "monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};