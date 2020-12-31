import React from 'react';
import { User } from '../types/Beep';

export interface UserContextData {
    user: User;
}

export const UserContext = React.createContext<UserContextData | null>(null);
