import React, { Component } from 'react';
import { config } from "../utils/config";
import { Layout, Button, Input, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { StyleSheet, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";
import { BackIcon, EmailIcon } from "../utils/Icons";
import { parseError, handleStatusCodeError, handleFetchError } from "../utils/errors";

export class ForgotPassword extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            status: {},
            email: ""
        }
    }

    handleForgotPassword () {
        //make button show loading state
        this.setState({isLoading: true});

        fetch(config.apiUrl + "/auth/password/forgot", {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "email": this.state.email })
        })
        .then(response => {
            if (response.status !== 200) {
                return this.setState({ isLoading: handleStatusCodeError(response) });
            }

            response.json().then(data => {
                this.setState({
                    isLoading: false
                });

                if (data.status == "success") {
                    alert(data.message);
                    this.props.navigation.goBack();
                } 
                else {
                    alert(parseError(data.message));
                }

            })
        })
        .catch((error) => {
            this.setState({ isLoading: handleFetchError(error) });
        });
    }

    render () {
        const BackAction = () => (
            <TopNavigationAction icon={BackIcon} onPress={() =>this.props.navigation.goBack()}/>
        );

        return (
            <>
                <TopNavigation title='Forgot Password' alignment='center' accessoryLeft={BackAction}/>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={!(Platform.OS == "ios" || Platform.OS == "android")} >
                <Layout style={styles.container}>
                    <Layout style={styles.form}>
                        <Input
                            textContentType="emailAddress"
                            placeholder="example@ridebeep.app"
                            returnKeyType="go"
                            onChangeText={(text) => this.setState({email:text})}
                            onSubmitEditing={() => this.handleForgotPassword()} />
                    {!this.state.isLoading ? 
                        <Button onPress={() => this.handleForgotPassword()} accessoryRight={EmailIcon}>
                            Send Password Reset Email
                        </Button>
                        :
                        <Button appearance='outline'>
                            Loading
                        </Button>
                    }
                    </Layout>
                </Layout>
                </TouchableWithoutFeedback>
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    form: {
        justifyContent: "center",
        width: "83%",
        marginTop: 20,
    }
});
