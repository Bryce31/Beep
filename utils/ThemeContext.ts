import React from 'react';

interface ThemeContextData {
    theme: string;
    toggleTheme: () => void;
}

export const ThemeContext = React.createContext<ThemeContextData | null>(null);
