import * as SplashScreen from 'expo-splash-screen';
import Sentry from "./Sentry";
import { handleUpdateCheck } from './Updates';

export default function init(): void {
    handleUpdateCheck();

    SplashScreen.preventAutoHideAsync()
        .then(result => console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`))
        .catch(console.warn);
}
