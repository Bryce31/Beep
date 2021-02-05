import { Manager } from "socket.io-client";
import {User} from "../types/Beep";
import { config } from './config';

const manager = new Manager(config.baseUrl, { transports: ['websocket'] });
const socket = manager.socket("/");

export default socket

export function getUpdatedUser(existingUser: User | null, newData: any): User | null {
    if (!existingUser) return null;
    let changed = false;
    for (const key in newData) {
        if ((existingUser[key] != null && newData[key] != null) && (existingUser[key] != newData[key])) {
            existingUser[key] = newData[key];
            changed = true;
        }
    }
    return changed ? existingUser : null;
}
