import { createContext, useContext, useState } from "react";

type ThemeContextType = {
  isDark: boolean;
  toggleDark: () => void;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    subtext: string;
    border: string;
    header: string;
    input: string;
  };
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleDark: () => {},
  colors: {
    primary: "#5B2EEA",
    background: "#F7F4FF",
    card: "#FFFFFF",
    text: "#1D1828",
    subtext: "#7A7288",
    border: "#F1EEFA",
    header: "#5B2EEA",
    input: "#FBFAFF",
  },
});
export const lightColors = {
  primary: "#5B2EEA",
  background: "#F7F4FF",
  card: "#FFFFFF",
  text: "#1D1828",
  subtext: "#7A7288",
  border: "#F1EEFA",
  header: "#5B2EEA",
  input: "#FBFAFF",
};
export const darkColors = {
  primary: "#3D1FA8",
  background: "#0F0D1A",
  card: "#1C1830",
  text: "#F0EDFF",
  subtext: "#9A94A6",
  border: "#2A2540",
  header: "#3D1FA8",
  input: "#251F3D",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleDark = () => setIsDark((prev) => !prev);

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
