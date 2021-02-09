import 'react-native-gesture-handler';
import React, { Component, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
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
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { updatePushToken } from "./utils/Notifications";
import socket, { didUserChange, getUpdatedUser } from './utils/Socket';
import AsyncStorage from '@react-native-community/async-storage';
import init from "./utils/Init";
import Sentry from "./utils/Sentry";
import { AuthContext } from './types/Beep';
import { isMobile } from './utils/config';
import ThemedStatusBar from './utils/StatusBar';

const Stack = createStackNavigator();
let initialScreen: string;
init();

interface State {
    user: AuthContext | null;
    theme: string;
}

export default class App extends Component<undefined, State> {

    constructor() {
        super(undefined);
        this.state = {
            user: null,
            theme: "light"
        };
    }

    toggleTheme = (): void => {
        const nextempTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.setState({ theme: nextempTheme });
        AsyncStorage.setItem('@theme', nextempTheme);
    }

    setUser = (user: AuthContext | null): void => {
        this.setState({ user: user });
        Sentry.setUserContext(user);
    }

    async componentDidMount(): Promise<void> {
        socket.on("connect", () => {
            if (this.state.user && !initialScreen) {
                console.log(initialScreen);
                socket.emit('getUser', this.state.user.tokens.token);
            }
        });

        let user;
        let theme = this.state.theme;

        const storageData = await AsyncStorage.multiGet(['@user', '@theme']);

        if (storageData[0][1]) {
            initialScreen = "Main";
            user = JSON.parse(storageData[0][1]);

            if (isMobile && user.tokens.token) {
                updatePushToken(user.tokens.token);
            }

            if (user.tokens.token) {
                socket.emit('getUser', user.tokens.token);
            }

            Sentry.setUserContext(user);
        }
        else {
            initialScreen = "Login";
        }

        if (storageData[1][1]) {
            theme = storageData[1][1];
        }

        this.setState({
            user: user,
            theme: theme
        });

        socket.on('updateUser', (userChanges: unknown) => {
            if (this.state.user?.user) {
                if (didUserChange(this.state.user.user, userChanges)) {
                    const currentState = this.state.user;
                    for (const key in userChanges) {
                        currentState["user"][key] = userChanges[key];
                        console.log(key, "updated");
                    }
                    AsyncStorage.setItem('@user', JSON.stringify(currentState));
                    this.setUser(currentState);
                }
                else {
                    console.log("Socket sent an update but user didnt change");
                }
            }
        });
        
    }

    render(): ReactNode {
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
                            <ThemedStatusBar theme={this.state.theme}/>
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
