import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, StatusBar, Platform, AppState } from 'react-native';
import RegisterScreen from './routes/auth/Register';
import LoginScreen from './routes/auth/Login';
import ForgotPassword from './routes/auth/ForgotPassword';
import { MainTabs } from './navigators/MainTabs';
import { ProfileScreen } from './routes/global/Profile';
import { ReportScreen } from './routes/global/Report';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry, Layout } from '@ui-kitten/components';
import { default as beepTheme } from './utils/theme.json';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { ThemeContext } from './utils/ThemeContext';
import { UserContext } from './utils/UserContext';
import * as SplashScreen from 'expo-splash-screen';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { updatePushToken } from "./utils/Notifications";
import socket, { getUpdatedUser } from './utils/Socket';
import AsyncStorage from '@react-native-community/async-storage';
import * as Updates from 'expo-updates';
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: 'https://9bea69e2067f4e2a96e6c26627f97732@sentry.nussman.us/4',
  enableInExpoDevelopment: true,
  debug: true, // Sentry will try to print out useful debugging information if something goes wrong with sending an event. Set this to `false` in production.
  enableAutoSessionTracking: true
});

const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync()
  .then(result => console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`))
  .catch(console.warn); // it's good to explicitly catch and inspect any error

let initialScreen: string;

interface User {
    token?: string;
    isBeeping?: boolean;
}

interface Props {
    
}

interface State {
    user: User;
    theme: string;
}

export default class App extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            user: {},
            theme: "light"
        };
    }

    toggleTheme = () => {
        const nextempTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.setState({ theme: nextempTheme });
        AsyncStorage.setItem('@theme', nextempTheme);
    }

    setUser = (user: User): void => {
        Sentry.Native.setUser({ ...user });
        this.setState({ user: user });
    }

    handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === "active" && !socket.connected && this.state.user) {
            socket.emit('getUser', this.state.user.token);
        }
    }

    async handleUpdateCheck() {
        if (!__DEV__) {
            const result = await Updates.checkForUpdateAsync();
            console.log(result);
            if (result.isAvailable) {
                console.log("running Expo OTA update");
                Updates.reloadAsync();
            }
        }
    }
    
    async componentDidMount() {
        this.handleUpdateCheck();
        //listen for App State chnages ;)
        AppState.addEventListener("change", this.handleAppStateChange);

        //When App loads initially, get token from AsyncStorage
        AsyncStorage.multiGet(['@user', '@theme']).then((result) => {
            let tempUser = null;
            let sTheme = this.state.theme;

            //if a user is defined
            if(result[0][1]) {
                //Because user is logged in, send them to Main initially
                initialScreen = "Main";
                //Take user from AsyncStorage and put it in our context
                tempUser = JSON.parse(result[0][1]);
                //If user is on a mobile device and user object has a token, sub them to notifications
                if ((Platform.OS == "ios" || Platform.OS == "android") && tempUser.token) {
                    updatePushToken(tempUser.token);
                }

                //if user has a token, subscribe them to user updates
                if (tempUser.token) {
                    socket.emit('getUser', tempUser.token);
                }

                Sentry.Native.setUser({ ...tempUser });
            }
            else {
                //This mean no one is logged in, send them to login page initally
                initialScreen = "Login";
            }

            if(result[1][1]) {
                //re-render may happen, if a re-render happens, this code will not run agian because
                //initialScreen has been defined. 
                sTheme = result[1][1];
            }
            
            //finaly setState once we know what data we have to minimize renders
            this.setState({
                user: tempUser,
                theme: sTheme
            });
          }, (error) => {
            //AsyncStorage could not get data from storage
            console.log("[App.js] [AsyncStorage] ", error);
        });

        socket.on('updateUser', (data: unknown) => {
            const updatedUser = getUpdatedUser(this.state.user, data);
            if (updatedUser != null) {
                console.log("[~] Updating Context!");
                AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
                this.setState({ user: updatedUser });
            }
        });
    }

    render () {
        if (!initialScreen) {
            return null;
        }

        const user = this.state.user;
        const setUser = this.setUser;
        const theme = this.state.theme;
        const toggleTheme = this.toggleTheme;

        return (
            <UserContext.Provider value={{user, setUser}}>
                <ThemeContext.Provider value={{theme, toggleTheme}}>
                    <IconRegistry icons={EvaIconsPack} />
                    <ApplicationProvider {...eva} theme={{ ...eva[this.state.theme], ...beepTheme }}>
                        <Layout style={styles.statusbar}>
                            {Platform.OS == "ios" ?
                                <StatusBar barStyle={(this.state.theme === 'light' ? 'dark' : 'light') + "-content"} />
                                :
                                <StatusBar translucent barStyle={(this.state.theme === 'light' ? 'dark' : 'light') + "-content"} backgroundColor={(this.state.theme === "dark") ? "#222b45" : "#ffffff"} />
                            }
                        </Layout>
                        <NavigationContainer>
                            <Stack.Navigator initialRouteName={initialScreen} screenOptions={{ headerShown: false }} >
                                <Stack.Screen name="Login" component={LoginScreen} />
                                <Stack.Screen name="Register" component={RegisterScreen} />
                                <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                                <Stack.Screen name="Main" component={MainTabs} />
                                <Stack.Screen name='Profile' component={ProfileScreen} />
                                <Stack.Screen name='Report' component={ReportScreen} />
                            </Stack.Navigator>
                        </NavigationContainer>
                    </ApplicationProvider>
                </ThemeContext.Provider>
            </UserContext.Provider>
        );
    }
}

const styles = StyleSheet.create({
    statusbar: {
        paddingTop: getStatusBarHeight()
    }
});
