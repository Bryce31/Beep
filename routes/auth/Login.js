import React, { Component } from 'react';
import { Platform, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Layout, Text, Button, Input } from '@ui-kitten/components';
import * as SplashScreen from 'expo-splash-screen';
import { UserContext } from '../../utils/UserContext.js';
import { removeOldToken } from '../../utils/OfflineToken.js';
import { getPushToken } from '../../utils/Notifications.js';
import { config } from '../../utils/config';
import { LoginIcon, SignUpIcon, QuestionIcon, LoadingIndicator } from '../../utils/Icons';
import { parseError, handleStatusCodeError, handleFetchError } from "../../utils/Errors";
import { Icon } from '@ui-kitten/components';
import socket from "../../utils/Socket";

export default class LoginScreen extends Component {
    static contextType = UserContext;

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            username: "",
            password: "",
            secureTextEntry: true
        };
    }

    toggleSecureEntry = () => {
        this.setState({ secureTextEntry: !this.state.secureTextEntry });
    }

    renderIcon = (props) => (
        <TouchableWithoutFeedback onPress={this.toggleSecureEntry}>
            <Icon {...props} name={this.state.secureTextEntry ? 'eye-off' :'eye'}/>
        </TouchableWithoutFeedback>
    );

    componentDidMount() {
        try {
            SplashScreen.hideAsync();
        }
        catch (error) {
            console.log(error);
        }
    }

    async handleLogin() {
        //make button show loading state
        this.setState({ isLoading: true });

        //in the background (asyncronously) tell the app to call the api to 
        //try to remove any old extra token
        removeOldToken();

        let expoPushToken;

        if (Platform.OS == "ios" || Platform.OS == "android") {
            expoPushToken = await getPushToken();
        }

        fetch(config.apiUrl + "/auth/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "username": this.state.username,
                "password": this.state.password,
                "expoPushToken": expoPushToken
            })
        })
        .then(response => {
            if (response.status !== 200) {
                return this.setState({ isLoading: handleStatusCodeError(response) });
            }

            response.json().then(data => {
                if (data.status === "success") {
                    //set user in global context
                    this.context.setUser(data);

                    //also store user in local storage so user can persist
                    AsyncStorage.setItem("@user", JSON.stringify(data));

                    //navigate to the Main screen
                    this.props.navigation.reset({
                        index: 0,
                        routes: [
                            { name: 'Main' },
                        ],
                    });

                    socket.emit('getUser', this.context.user.token);
                }
                else {
                    //stop loading because we got an error and need to retry login
                    this.setState({ isLoading: false });

                    //give user the parsed error
                    alert(parseError(data.message));
                }
            });
        })
        .catch((error) => {
            this.setState({ isLoading: handleFetchError(error) });
        });
    }

    render () {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={!(Platform.OS == "ios" || Platform.OS == "android")} >
                <Layout style={styles.container}>
                    <Text style={styles.title} category='h6'>Login</Text>
                    <Layout style={styles.form}>
                        <Input
                            textContentType="username"
                            placeholder="Username"
                            returnKeyType="next"
                            onChangeText={(text) => this.setState({username: text})}
                            onSubmitEditing={() => this.secondTextInput.focus()}
                            blurOnSubmit={true}
                        />
                        <Input
                            textContentType="password"
                            placeholder="Password"
                            returnKeyType="go"
                            accessoryRight={this.renderIcon}
                            secureTextEntry={this.state.secureTextEntry}
                            onChangeText={(text) => this.setState({password: text})}
                            ref={(input) => this.secondTextInput = input}
                            onSubmitEditing={() => this.handleLogin()}
                            blurOnSubmit={true}
                        />
                        {!this.state.isLoading ?
                            <Button
                                accessoryRight={LoginIcon}
                                onPress={() => this.handleLogin()}
                            >
                            Login
                            </Button>
                            :
                            <Button appearance='outline' accessoryRight={LoadingIndicator}>
                                Loading
                            </Button>
                        }
                    </Layout>
                    <Text style={{marginTop: 30, marginBottom: 10 }}> Don't have an account? </Text>
                    <Button
                        size="small"
                        onPress={() => this.props.navigation.navigate('Register')}
                        appearance="outline"
                        accessoryRight={SignUpIcon}
                    >
                    Sign Up
                    </Button>
                    <Text style={{marginTop: 20, marginBottom: 10}}> Forgot your password? </Text>
                    <Button
                        size="small"
                        onPress={() => this.props.navigation.navigate('ForgotPassword')}
                        appearance="outline"
                        accessoryRight={QuestionIcon}
                    >
                    Forgot Password
                    </Button>
                </Layout>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingTop: 100
    },
    form: {
        justifyContent: "center",
        width: "83%",
        marginTop: 20,
    },
    title: {
        fontSize: 40,
        padding: 15,
    },
});