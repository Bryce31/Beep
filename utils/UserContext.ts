import React from 'react';
import { User } from '../types/Beep';

export interface UserContextData {
    user: any;
    setUser: (user: User) => void;
}

export const UserContext = React.createContext<UserContextData | null>(null);
