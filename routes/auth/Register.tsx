import React, { Component } from 'react';
import { Image, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Text, Layout, Button, Input, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { UserContext } from '../../utils/UserContext';
import { removeOldToken } from '../../utils/OfflineToken';
import { config } from "../../utils/config";
import { PhotoIcon, BackIcon, SignUpIcon, LoadingIndicator } from "../../utils/Icons";
import { getPushToken } from "../../utils/Notifications";
import { parseError, handleFetchError, handleStatusCodeError } from "../../utils/Errors";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Linking from 'expo-linking';
import socket from "../../utils/Socket";
import * as ImagePicker from 'expo-image-picker';

let result; 

export default class RegisterScreen extends Component {
    static contextType = UserContext;

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            first: '',
            last: '',
            email: '',
            phone: '',
            venmo: '',
            username: '',
            password: '',
            photo: null
        }
    }

    async handleRegister () {
        //make button show loading state
        this.setState({isLoading: true});

        if (this.state.photo == null) {
            alert("Please choose a profile photo");
            this.setState({isLoading: false});
            return;
        }

        //remove any old tokens they were not able to have been removed
        removeOldToken();

        let expoPushToken;

        if (Platform.OS == "ios" || Platform.OS == "android") {
            expoPushToken = await getPushToken();
        }

        //POST to our signup API
        fetch(config.apiUrl + "/auth/signup", {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "first": this.state.first,
                "last": this.state.last,
                "email": this.state.email,
                "phone": this.state.phone,
                "venmo": this.state.venmo,
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

                    //store user in storage so user can persist untill logout
                    AsyncStorage.setItem("@user", JSON.stringify(data));

                    this.uploadPhoto();

                    //Signup has been completed. We are ready to send user into main app.
                    //Use our Navigation we defined earlier to RESET the navigation stack where Main is the root
                    this.props.navigation.reset({
                        index: 0,
                        routes: [
                            { name: 'Main' },
                        ],
                    })

                    socket.emit('getUser', this.context.user.token);
                }
                else {
                    this.setState({isLoading: false});
                    alert(parseError(data.message));
                }
            })
        })
        .catch((error) => {
            this.setState({ isLoading: handleFetchError(error) });
        });
    }

   async handlePhoto() {
       result = await ImagePicker.launchImageLibraryAsync({
           mediaTypes: ImagePicker.MediaTypeOptions.Images,
           allowsMultipleSelection: false,
           allowsEditing: true,
           aspect: [4, 3],
           base64: false
       });
       this.setState({photo: result.uri});
    }

    async uploadPhoto() {
       let form = new FormData();

       if (Platform.OS !== "ios" && Platform.OS !== "android") {
           console.log("Running as if this is a web device");
           await fetch(result.uri)
               .then(res => res.blob())
               .then(blob => {
                   const fileType = blob.type.split("/")[1];
                   const file = new File([blob], "photo." + fileType);
                   form.append('photo', file)
               });
       }
       else {
           console.log("Runing as mobile device");
           console.log(result);
           const fileType = result.uri.substr(result.uri.lastIndexOf("."), result.uri.length);
           console.log(fileType);
           this.setState({photo: result.uri});

           const photo = {
               uri: result.uri,
               type: 'image/jpeg',
               name: 'photo' + fileType,
           };

           if (!result.cancelled) {
               form.append("photo", photo);
           }
           else {
               this.setState({ isLoading: false });
           }
       }

       fetch(config.apiUrl + "/files/upload", {
           method: "POST",
           headers: {
               //'Content-Type': `multipart/form-data`,
               "Authorization": "Bearer " + this.context.user.token
           },
           body: form
       })
        .then(response => {
            response.json().then(data => {
                //make a copy of the current user
                let tempUser = this.context.user;

                //update the tempUser with the new data
                tempUser.photoUrl = data.url;

                //update the context
                this.context.setUser(tempUser);

                //put the tempUser back into storage
                AsyncStorage.setItem('@user', JSON.stringify(tempUser));
            });
        })
        .catch((error) => {
            console.error(error);
        });
    }

    render () {
        const BackAction = () => (
            <TopNavigationAction icon={BackIcon} onPress={() =>this.props.navigation.goBack()}/>
        );

        return (
            <>
                <TopNavigation title='Sign Up' alignment='center' accessoryLeft={BackAction}/>
                <Layout style={{flex: 1}}>
                <KeyboardAwareScrollView scrollEnabled={false} extraScrollHeight={90}>
                <Layout style={styles.container}>
                    <Layout style={styles.form}>
                        <Input
                            label="First Name"
                            textContentType="givenName"
                            placeholder="Jon"
                            returnKeyType="next"
                            onChangeText={(text) => this.setState({first:text})}
                            onSubmitEditing={()=>this.secondTextInput.focus()} />
                        <Input
                            label="Last Name"
                            textContentType="familyName"
                            placeholder="Doe"
                            returnKeyType="next"
                            onChangeText={(text) => this.setState({last:text})}
                            ref={(input)=>this.secondTextInput = input}
                            onSubmitEditing={()=>this.thirdTextInput.focus()} />
                        <Input
                            label="Email"
                            textContentType="emailAddress"
                            placeholder="example@ridebeep.app"
                            caption="Use your .edu email to be verified as a student"
                            returnKeyType="next"
                            onChangeText={(text) => this.setState({email:text})}
                            ref={(input)=>this.thirdTextInput = input}
                            onSubmitEditing={()=>this.fourthTextInput.focus()} />
                        <Input
                            label="Phone Number"
                            textContentType="telephoneNumber"
                            placeholder="7048414949"
                            returnKeyType="next"
                            style={{marginTop: 5}}
                            onChangeText={(text) => this.setState({phone:text})}
                            ref={(input)=>this.fourthTextInput = input}
                            onSubmitEditing={()=>this.fifthTextInput.focus()} />

                        <Input
                            label="Venmo Username"
                            textContentType="username"
                            placeholder="jondoe"
                            returnKeyType="next"
                            onChangeText={(text) => this.setState({venmo:text})}
                            ref={(input)=>this.fifthTextInput = input}
                            onSubmitEditing={()=>this.sixthTextInput.focus()} />
                        <Input
                            label="Username"
                            textContentType="username"
                            placeholder="jondoe"
                            returnKeyType="next"
                            onChangeText={(text) => this.setState({username:text})}
                            ref={(input)=>this.sixthTextInput = input}
                            onSubmitEditing={()=>this.seventhTextInput.focus()} />
                        <Input
                            label="Password"
                            textContentType="password"
                            placeholder="Password"
                            returnKeyType="go"
                            secureTextEntry={true}
                            ref={(input)=>this.seventhTextInput = input}
                            onChangeText={(text) => this.setState({password:text})}
                            onSubmitEditing={() => this.handleRegister()} />
                        <Layout style={{flex: 1, flexDirection: "row", justifyContent: "center", marginTop: 5, marginBottom: 5}}>
                            {this.state.photo && <Image source={{ uri: this.state.photo }} style={{ width: 50, height: 50, borderRadius: 50/ 2, marginTop: 10, marginBottom: 10, marginRight: 10 }} />}
                            <Button
                                onPress={() => this.handlePhoto()}
                                accessoryRight={PhotoIcon}
                                style={{width: "60%"}}
                                size="small"
                            >
                                Choose Profile Photo
                            </Button>
                        </Layout>
                        {!this.state.isLoading ? 
                            <Button
                                onPress={() => this.handleRegister()}
                                accessoryRight={SignUpIcon}
                            >
                            Sign Up
                            </Button>
                            :
                            <Button appearance='outline' accessoryRight={LoadingIndicator}>
                                Loading
                            </Button>
                        }
                        <Layout style={{marginTop: 10, alignItems: "center"}}>
                            <Text appearance="hint">By signing up, you agree to our </Text>
                            <Layout style={{flex: 1, flexDirection: 'row'}}>
                                <Text onPress={() => Linking.openURL('https://ridebeep.app/privacy')}>Privacy Policy</Text>
                                <Text appearance="hint"> and </Text>
                                <Text onPress={() => Linking.openURL('https://ridebeep.app/terms')}>Terms of Service</Text>
                            </Layout>
                        </Layout>
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
