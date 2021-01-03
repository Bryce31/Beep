import React, { useState } from 'react';
import { UserContext } from './UserContext';
import { ThemeContext } from './ThemeContext';

export default function ContextProviders(props: Props) {
    const [user, setUser] = useState({});
    const [theme, setTheme] = useState("light");
    
    function toggleTheme(): void {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }

    return (
        <UserContext.Provider value={{user, setUser}}>
            <ThemeContext.Provider value={{theme, toggleTheme}}>
                {props.children}
            </ThemeContext.Provider>
        </UserContext.Provider>
    );
}
