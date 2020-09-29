import io from 'socket.io-client';
import { config } from './config';

const socket = io(config.baseUrl, { transports: ['websocket'] });

export default socket

export function getUpdatedUser(existingUser, newData) {
    let changed = false;
    for (const key in newData) {
        if ((existingUser[key] != null && newData[key] != null) && (existingUser[key] != newData[key])) {
            existingUser[key] = newData[key];
            changed = true;
        }
    }
    return changed ? existingUser : null;
}