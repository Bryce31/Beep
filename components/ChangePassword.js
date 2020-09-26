import React, { Component } from 'react';
import { StyleSheet, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { Layout, Button, Input, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { UserContext } from '../utils/UserContext.js';
import { config } from "../utils/config";
import { EditIcon, LoadingIndicator, BackIcon } from "../utils/Icons";
import { parseError, handleStatusCodeError, handleFetchError } from "../utils/errors";

export class ChangePasswordScreen extends Component {
    static contextType = UserContext;

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            password: "",
            password2: ""
        }
    }

    async handleChangePassword () {
        this.setState({ isLoading: true });

        if (this.state.password !== this.state.password2) {
            this.setState({ isLoading: false });
            return alert("Your passwords do not match");
        }

        //POST to our edit profile API
        fetch(config.apiUrl + "/account/password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.context.user.token
            },
            body: JSON.stringify({
                "password": this.state.password
            })
        })
        .then(response => {
            if (response.status !== 200) {
                return this.setState({ isLoading: handleStatusCodeError(response) });
            }

            response.json().then(data => {
                if (data.status === "success") {
                    this.props.navigation.goBack();
                }
                else {
                    this.setState({ isLoading: false });
                    alert(parseError(data.message));
                }
            });
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
                <TopNavigation title='Change Password' alignment='center' accessoryLeft={BackAction}/>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={!(Platform.OS == "ios" || Platform.OS == "android")} >
                <Layout style={styles.container}>
                    <Layout style={styles.form}>
                        <Input
                            secureTextEntry={true}
                            label="New Password"
                            textContentType="password"
                            placeholder="New Password"
                            onChangeText={(text) => this.setState({password: text})}
                            onSubmitEditing={()=>this.secondTextInput.focus()} />
                        <Input
                            secureTextEntry={true}
                            label="Repeat New Password"
                            textContentType="password"
                            placeholder="New Password"
                            returnKeyType="go"
                            onChangeText={(text) => this.setState({password2: text})}
                            ref={(input)=>this.secondTextInput = input}
                            onSubmitEditing={() => this.handleChangePassword()} />
                        {!this.state.isLoading ? 
                            <Button
                                onPress={() => this.handleChangePassword()}
                                accessoryRight={EditIcon}
                            >
                                Change Password
                            </Button>
                            :
                            <Button
                                appearance="outline"
                                accessoryRight={LoadingIndicator}
                            >
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
