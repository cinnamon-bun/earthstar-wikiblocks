import { createContext } from 'react'

// lib
import {
    Theme,
    defaultTheme,
    allThemes
} from '../lib/theme';

interface ThemeContextType {
    theme: Theme,
    allThemes: Theme[],
    setTheme: (theme: Theme) => void,
    isDark: boolean,
    setIsDark: (x: boolean) => void,
}
export const ThemeContext = createContext<ThemeContextType>({
    theme: defaultTheme,
    allThemes: allThemes,
    setTheme: (theme: Theme) => {},
    isDark: true,
    setIsDark: (x: boolean) => {}
});
