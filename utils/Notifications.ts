import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { Vibration, Platform } from 'react-native';
import { config } from '../utils/config';

/**
 * Checks for permssion for Notifications, asks expo for push token, sets up notification listeners, returns 
 * push token to be used
 */
export async function getPushToken(): Promise<string | null> {
    const hasPermission = await getNotificationPermission();

    if(!hasPermission) {
        return null;
    }

    const pushToken = await Notifications.getExpoPushTokenAsync();

    setNotificationHandlers();

    return pushToken.data;
}

/**
 * function to get existing or prompt for notification permission
 * @returns boolean true if client has location permissions
 */
async function getNotificationPermission(): Promise<boolean> {
    if (!Constants.isDevice) {
        return false;
    }

    //TODO better fix
    if(Platform.OS == "android") {
        return true;
    }

    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

    let finalStatus = status;

    if (status !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('[App.js] [Push Notifications] Failed to get push token for push notification!');
        return false;
    }
    return true;
}

/**
 * Set listiner function(s)
 */
function setNotificationHandlers() {
    const enteredBeeperQueueActions: Notifications.NotificationAction[] = [
        {
            identifier: "accept",
            buttonTitle: "Accept"
        },
        {
            identifier: "deny",
            buttonTitle: "Deny",
            options: {
                isDestructive: true
            }
        }

    ];
    Notifications.setNotificationCategoryAsync("enteredBeeperQueue", enteredBeeperQueueActions);
    Notifications.addNotificationReceivedListener(handleNotification);
}

/**
 * call getPushToken and send to backend
 * @param token a user's auth token
 */
export async function updatePushToken(token: string): Promise<void> {
    try {
        const result = await fetch(config.apiUrl + "/account/pushtoken", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                expoPushToken: await getPushToken()
            })
        });

        const data = await result.json();

        if (data.status == "error") {
            console.log(data.message);
        }
    }
    catch(error) {
        console.log("[Login.js] [API] Error fetching from the Beep (Login) API: ", error);
    }
}

async function handleNotification(notification: Notifications.Notification) {
    //Vibrate when we recieve a notification
    Vibration.vibrate();
    //Log the entire notification to the console
    console.log("Notification:", notification);
}
