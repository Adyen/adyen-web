import { h, toChildArray, createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { ThemeGenerator } from 'adyen-component-theming';
import type { ComponentChildren } from 'preact';

type ThemeMode = 'light' | 'dark';

const THEMES = {
    light: { primary: '#00d16a', background: '#ffffff', neutral: '#f6f6f6', label: '#00112c', outline: '#d8dbe0', dark: false },
    dark: { primary: '#00d16a', background: '#192239', neutral: '#161b26', label: '#f5f7fa', outline: '#2b3040', dark: true }
};

const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

const themeGenerator = new ThemeGenerator('--adyen-sdk-');

function getPreferredMode(): ThemeMode {
    return window.matchMedia(DARK_MODE_QUERY).matches ? 'dark' : 'light';
}

interface ThemeProviderProps {
    children: ComponentChildren;
}

type ContextValue = {
    mode: ThemeMode;
};

const ThemeContext = createContext<ContextValue | undefined>(undefined);

const ThemeProvider = ({ children }: Readonly<ThemeProviderProps>) => {
    const [mode, setMode] = useState<ThemeMode>(getPreferredMode);

    useEffect(() => {
        const mediaQuery = window.matchMedia(DARK_MODE_QUERY);
        const handleChange = (event: MediaQueryListEvent) => {
            setMode(event.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    useEffect(() => {
        themeGenerator.create(THEMES['dark']);
    }, [mode]);

    return <ThemeContext.Provider value={{ mode }}>{toChildArray(children)}</ThemeContext.Provider>;
};

const useThemeContext = (): ContextValue => {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error('"useThemeContext" must be used within a ThemeProvider');
    }

    return context;
};

export { ThemeProvider, useThemeContext };
