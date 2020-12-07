import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Button, Input, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { config } from "../../utils/config";
import { EditIcon, LoadingIndicator } from "../../utils/Icons";
import { handleFetchError } from "../../utils/Errors";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { BackIcon } from '../../utils/Icons';
import AsyncStorage from '@react-native-community/async-storage';
import { view } from '@risingstack/react-easy-state';
import userStore from '../../utils/stores';

interface Props {
    navigation: any;
}

interface State {
    isLoading: boolean;
    username: string;
    first: string;
    last: string;
    email: string;
    phone: string;
    venmo: string;
}

class EditProfileScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: false,
            username: userStore.user.username,
            first: userStore.user.first,
            last: userStore.user.last,
            email: userStore.user.email,
            phone: userStore.user.phone,
            venmo: userStore.user.venmo
        };
    }

    handleUpdate () {
        //send button into loading state
        this.setState({ isLoading: true });

        //POST to our edit profile API
        fetch(config.apiUrl + "/account/edit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + userStore.user.token
            },
            body: JSON.stringify({
                "first": this.state.first,
                "last": this.state.last,
                "email": this.state.email,
                "phone": this.state.phone,
                "venmo": this.state.venmo
            })
        })
        .then(response => {
            response.json().then(data => {
                if (data.status === "success") {
                    //make a copy of the current user
                    let tempUser = userStore.user;

                    //update the tempUser with the new data
                    tempUser.first = this.state.first;
                    tempUser.last = this.state.last;
                    tempUser.email = this.state.email;
                    tempUser.phone = this.state.phone;
                    tempUser.venmo = this.state.venmo;

                    if (this.state.email !== userStore.user.email) {
                        //email has changed for sure, set to not verified on client side
                        tempUser.isEmailVerified = false;
                        tempUser.isStudent = false;
                    }

                    //update the context
                    userStore.user = tempUser;

                    //put the tempUser back into storage
                    AsyncStorage.setItem('@user', JSON.stringify(tempUser));

                    //on success, go back to settings page
                    this.props.navigation.goBack();
                }
                else {
                    this.setState({
                        isLoading: false,
                        username: userStore.user.username,
                        first: userStore.user.first,
                        last: userStore.user.last,
                        email: userStore.user.email,
                        phone: userStore.user.phone,
                        venmo: userStore.user.venmo
                    });
                    this.setState({ isLoading: handleFetchError(data.message) });
                }
            });
        })
        .catch((error) => {
            this.setState({ isLoading: handleFetchError(error) });
        });
    }

    UNSAFE_componentWillReceiveProps() {
        if (this.state.first != userStore.user.first) {
            this.setState({ first: userStore.user.first });
        }
        if (this.state.last != userStore.user.last) {
            this.setState({ last: userStore.user.last });
        }
        if (this.state.email != userStore.user.email) {
            this.setState({ email: userStore.user.email });
        }
        if (this.state.phone != userStore.user.phone) {
            this.setState({ phone: userStore.user.phone });
        }
        if (this.state.venmo != userStore.user.venmo) {
            this.setState({ venmo: userStore.user.venmo });
        }
    }

    render () {
        const BackAction = () => (
            <TopNavigationAction icon={BackIcon} onPress={() => this.props.navigation.goBack()}/>
        );

        return (
            <>
                <TopNavigation title='Edit Profile' alignment='center' accessoryLeft={BackAction}/>
                <Layout style={{flex: 1}}>
                <KeyboardAwareScrollView scrollEnabled={false} extraScrollHeight={70}>
                <Layout style={styles.container}>
                    <Layout style={styles.form}>
                        <Input
                            label="Username"
                            value={this.state.username}
                            textContentType="username"
                            placeholder="Username"
                            disabled={true} />
                        <Input
                            label="First Name"
                            value={this.state.first}
                            textContentType="givenName"
                            placeholder="First Name"
                            returnKeyType="next"
                            onChangeText={(text) => this.setState({first:text})}
                            onSubmitEditing={() => this.secondTextInput.focus()} />
                        <Input
                            label="Last Name"
                            value={this.state.last}
                            textContentType="familyName"
                            placeholder="Last Name"
                            returnKeyType="next"
                            onChangeText={(text) => this.setState({last:text})}
                            ref={(input)=>this.secondTextInput = input}
                            onSubmitEditing={() => this.thirdTextInput.focus()} />
                        <Input
                            label="Email"
                            value={this.state.email}
                            textContentType="emailAddress"
                            placeholder="Email"
                            caption={userStore.user.isEmailVerified ? (userStore.user.isStudent) ? "Your email is verified and you are a student": "Your email is verified" : "Your email is not verified"}
                            returnKeyType="next"
                            onChangeText={(text) => this.setState({email:text})}
                            ref={(input) => this.thirdTextInput = input}
                            onSubmitEditing={() => this.fourthTextInput.focus()} />
                        <Input
                            label="Phone Number"
                            value={this.state.phone}
                            textContentType="telephoneNumber"
                            placeholder="Phone Number"
                            returnKeyType="next"
                            style={{marginTop: 5}}
                            onChangeText={(text) => this.setState({phone:text})}
                            ref={(input)=>this.fourthTextInput = input}
                            onSubmitEditing={()=>this.fifthTextInput.focus()} />
                        <Input
                            label="Venmo Username"
                            value={this.state.venmo}
                            textContentType="username"
                            placeholder="Venmo Username"
                            returnKeyType="go"
                            onChangeText={(text) => this.setState({venmo:text})}
                            ref={(input)=>this.fifthTextInput = input}
                            onSubmitEditing={() => this.handleUpdate()} />
                        {!this.state.isLoading ?
                            <Button
                                onPress={() => this.handleUpdate()}
                                accessoryRight={EditIcon}
                            >
                                Update Profile
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
                </KeyboardAwareScrollView>
                </Layout>
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

export default view(EditProfileScreen);
