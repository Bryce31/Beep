import * as Sentry from 'sentry-expo';
import { Platform } from 'react-native';
import { User } from '../types/Beep';

export const isMobile: boolean = (Platform.OS == "ios") || (Platform.OS == "android");

export function setSentryUserContext(user: User): void {
    if (isMobile) {
        Sentry.Native.setUser({ ...user });
    }
    else {
        Sentry.Browser.setUser({ ...user });
    }
}
