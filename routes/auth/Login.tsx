import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Layout, Text, Button, Input } from '@ui-kitten/components';
import * as SplashScreen from 'expo-splash-screen';
import { UserContext } from '../../utils/UserContext';
import { removeOldToken } from '../../utils/OfflineToken';
import { getPushToken } from '../../utils/Notifications';
import { config, isMobile } from '../../utils/config';
import { LoginIcon, SignUpIcon, QuestionIcon, LoadingIndicator } from '../../utils/Icons';
import { handleFetchError } from "../../utils/Errors";
import { Icon } from '@ui-kitten/components';
import socket from "../../utils/Socket";
import { Formik } from 'formik';
import { gql, useMutation } from '@apollo/client';
import { LoginMutation, LoginMutationVariables } from '../../generated/graphql';

interface Props {
    navigation: any;
}

const Login = gql`
    mutation Login($username: String!, $password: String!) {
        login(input: {username: $username, password: $password}) {
            user {
                id
                first
                last
                username
            }
            tokens {
                id
                tokenid
            }
        }
    }
`;

function LoginScreen(props: Props) {
    const userContext: any = React.useContext(UserContext);
    const [login, { loading: loading, error: error }] = useMutation<LoginMutation>(Login);
    const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);

    const renderIcon = (props: unknown) => (
        <TouchableWithoutFeedback onPress={() => setSecureTextEntry(!secureTextEntry)}>
            <Icon {...props} name={secureTextEntry ? 'eye-off' :'eye'}/>
        </TouchableWithoutFeedback>
    );
    
    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    async function doLogin(values: LoginMutationVariables) {

        const r = await login({ variables: values });

        AsyncStorage.setItem("auth", JSON.stringify(r.data?.login));

        userContext.setUser(r.data?.login);
            
        socket.emit('getUser', r.data?.login.tokens.id);

        props.navigation.reset({
            index: 0,
            routes: [
                { name: 'Main' },
            ],
        });
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={!isMobile} >
            <Layout style={styles.container}>
                <Text style={styles.title} category='h6'>Login</Text>
                <Formik
                    initialValues={{ username: '', password: '' }}
                    onSubmit={(values, { setSubmitting }) => {
                        doLogin(values);
                        setSubmitting(false);
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="username"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.username}
                            />
                            {errors.username && touched.username && errors.username}
                            <input
                                type="password"
                                name="password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.password}
                            />
                            {errors.password && touched.password && errors.password}
                            <button type="submit" disabled={isSubmitting}>
                                Submit
                            </button>
                        </form>
                    )}
                </Formik>
                {loading && <Text>Loading</Text>}
                <Text style={{marginTop: 30, marginBottom: 10 }}> Don't have an account? </Text>
                <Button
                    size="small"
                    onPress={() => props.navigation.navigate('Register')}
                    appearance="outline"
                    accessoryRight={SignUpIcon}
                >
                    Sign Up
                </Button>
                <Text style={{marginTop: 20, marginBottom: 10}}> Forgot your password? </Text>
                <Button
                    size="small"
                    onPress={() => props.navigation.navigate('ForgotPassword')}
                    appearance="outline"
                    accessoryRight={QuestionIcon}
                >
                    Forgot Password
                </Button>
            </Layout>
        </TouchableWithoutFeedback>
    );
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

export default LoginScreen;
