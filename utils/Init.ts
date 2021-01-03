import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from 'sentry-expo';

export default function init(): void {
    Sentry.init({
        dsn: 'https://9bea69e2067f4e2a96e6c26627f97732@sentry.nussman.us/4',
        enableInExpoDevelopment: true,
        debug: true, // Sentry will try to print out useful debugging information if something goes wrong with sending an event. Set this to `false` in production.
        enableAutoSessionTracking: true
    });

    SplashScreen.preventAutoHideAsync()
        .then(result => console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`))
        .catch(console.warn);
}
