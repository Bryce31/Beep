import 'react-native-gesture-handler';
import React, { Component, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import RegisterScreen from './routes/auth/Register';
import LoginScreen from './routes/auth/Login';
import { ForgotPasswordScreen } from './routes/auth/ForgotPassword';
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
import socket, { didUserChange } from './utils/Socket';
import AsyncStorage from '@react-native-community/async-storage';
import init from "./utils/Init";
import Sentry from "./utils/Sentry";
import { AuthContext } from './types/Beep';
import { isMobile } from './utils/config';
import ThemedStatusBar from './utils/StatusBar';
import { ApolloClient, ApolloProvider, createHttpLink, DefaultOptions, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const Stack = createStackNavigator();
let initialScreen: string;
init();

const httpLink = createHttpLink({
    uri: 'http://192.168.1.57:3001',
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const tit = await AsyncStorage.getItem('auth');

  if (!tit) return;

  const auth = JSON.parse(tit);
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: auth.tokens.id ? `Bearer ${auth.tokens.id}` : "",
    }
  }
});

const defaultOptions: DefaultOptions = {
    watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
    },
    query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
};

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions
});

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
                socket.emit('getUser', this.state.user.tokens.id);
            }
        });

        let user;
        let theme = this.state.theme;

        const storageData = await AsyncStorage.multiGet(['auth', '@theme']);

        if (storageData[0][1]) {
            initialScreen = "Main";
            user = JSON.parse(storageData[0][1]);

            if (isMobile && user.tokens.id) {
                updatePushToken(user.tokens.id);
            }

            if (user.tokens.id) {
                socket.emit('getUser', user.tokens.id);
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
                    AsyncStorage.setItem('auth', JSON.stringify(currentState));
                    if (!(userChanges.queueSize >= 0 && (Object.keys(userChanges).length == 1))) {
                        console.log("Context Update Caused Re-Render");
                        this.setUser(currentState);
                    }
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
            <ApolloProvider client={client}>
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
                                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                                    <Stack.Screen name="Main" component={MainTabs} />
                                    <Stack.Screen name='Profile' component={ProfileScreen} />
                                    <Stack.Screen name='Report' component={ReportScreen} />
                                </Stack.Navigator>
                            </NavigationContainer>
                        </ApplicationProvider>
                    </ThemeContext.Provider>
                </UserContext.Provider>
            </ApolloProvider>
        );
    }
}

const styles = StyleSheet.create({
    statusbar: {
        paddingTop: getStatusBarHeight()
    }
});
