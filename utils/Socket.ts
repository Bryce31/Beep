import { Manager } from "socket.io-client";
import { config } from './config';
import Logger from "./Logger";

const manager = new Manager(config.baseUrl, { transports: ['websocket'], forceNew: true });
const socket = manager.socket("/");

socket.on("connect_error", (reason) => {
   Logger.info("Connection Error: " + reason);
});

socket.on("disconnect", (reason) => {
   Logger.info("Disconnected: " + reason);
});

socket.on("reconnect_failed", (reason) => {
   Logger.info("Reconnect Failed: " + reason);
});

socket.on("reconnect_error", (reason) => {
   Logger.info("Reconnect Error: " + reason);
});

export default socket;

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
