import 'react-native-gesture-handler';
import React, { Component, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppState, StyleSheet } from 'react-native';
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
import AsyncStorage from '@react-native-community/async-storage';
import init from "./utils/Init";
import Sentry from "./utils/Sentry";
import { AuthContext } from './types/Beep';
import { isMobile } from './utils/config';
import ThemedStatusBar from './utils/StatusBar';
import { ApolloClient, ApolloProvider, createHttpLink, DefaultOptions, gql, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import {getMainDefinition} from '@apollo/client/utilities';

let sub;
const Stack = createStackNavigator();
let initialScreen: string;
init();

const httpLink = createHttpLink({
    uri: 'http://192.168.1.57:3001',
});

const wsLink = new WebSocketLink({
  uri: 'ws://192.168.1.57:3001/subscriptions',
  options: {
      reconnect: true,
      connectionParams: async () => {
          const tit = await AsyncStorage.getItem('auth');

          if (!tit) return;

          const auth = JSON.parse(tit);
          return {
              token: auth.tokens.id
          }
      }
  }
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
        //fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
    },
    query: {
        //fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
};

const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
                definition.operation === 'subscription'
        );
    },
    wsLink,
    httpLink,
);

export const client = new ApolloClient({
    link: authLink.concat(splitLink),
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions
});

interface State {
    user: AuthContext | null;
    theme: string;
}

const UserSubscription = gql`
    subscription UserSubscription($topic: String!) {
        getUserUpdates(topic: $topic) {
            id
            first
            last
            email
            phone
            venmo
            isBeeping
            isEmailVerified
            isStudent
            groupRate
            singlesRate
        }
    }
`;
const GetUser = gql`
    query GetUser($id: String!) {
        getUser(id: $id) {
            id
            first
            last
            email
            phone
            venmo
            isBeeping
            isEmailVerified
            isStudent
            groupRate
            singlesRate
        }
    }
`;

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

    async subscribeToUser(id: string): Promise<void> {
        const a = client.subscribe({ query: UserSubscription, variables: { topic: id }});

        sub = a.subscribe(({ data }) => {

            const existingUser = this.state.user;
            const updatedUser = data.getUserUpdates;
            let changed = false;

            for (const key in updatedUser) {
                if (existingUser['user'][key] != updatedUser[key]) {
                    existingUser['user'][key] = updatedUser[key];
                    console.log("Updating these values of user data:", key);
                    changed = true;
                }
            }
            if (changed) {
                this.setUser(existingUser);
                AsyncStorage.setItem('auth', JSON.stringify(existingUser));
            }
        });
    }

    handleAppStateChange = async (nextAppState: string) => {
        if(nextAppState === "active") {
            console.log("APP STATE CHANGE REFERCH");
            const result = await client.query({
                query: GetUser,
                variables: {
                    id: this.state.user?.user.id
                }
            });

            const existingUser = this.state.user;
            const updatedUser = result.data.getUser;

            let changed = false;

            for (const key in updatedUser) {
                if (existingUser['user'][key] != updatedUser[key]) {
                    existingUser['user'][key] = updatedUser[key];
                    console.log("Updating these values of user data:", key);
                    changed = true;
                }
            }
            if (changed) {
                this.setUser(existingUser);
                AsyncStorage.setItem('auth', JSON.stringify(existingUser));
            }
        }
    }

    async componentDidMount(): Promise<void> {
        AppState.addEventListener("change", this.handleAppStateChange);

        let user;
        let theme = this.state.theme;

        const storageData = await AsyncStorage.multiGet(['auth', '@theme']);

        if (storageData[0][1]) {
            initialScreen = "Main";
            user = JSON.parse(storageData[0][1]);

            if (isMobile && user.tokens.id) {
                updatePushToken();
            }

            Sentry.setUserContext(user);
            this.subscribeToUser(user.user.id);
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
        this.handleAppStateChange("active");
    }

    render(): ReactNode {
        if (!initialScreen) {
            return null;
        }

        const user = this.state.user;
        const setUser = this.setUser;
        const subscribeToUser = this.subscribeToUser;
        const unsubscribe = sub.unsubscribe();
        const theme = this.state.theme;
        const toggleTheme = this.toggleTheme;

        return (
            <ApolloProvider client={client}>
                <UserContext.Provider value={{user, setUser, subscribeToUser, unsubscribe}}>
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
