import React, { useState } from 'react';
import { Image, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Text, Layout, Button, Input, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { UserContext } from '../../utils/UserContext';
import { removeOldToken } from '../../utils/OfflineToken';
import { config } from "../../utils/config";
import { PhotoIcon, BackIcon, SignUpIcon, LoadingIndicator } from "../../utils/Icons";
import { getPushToken } from "../../utils/Notifications";
import { handleFetchError } from "../../utils/Errors";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Linking from 'expo-linking';
import socket from "../../utils/Socket";
import * as ImagePicker from 'expo-image-picker';

interface Props {
    navigation: any;
}

function RegisterScreen(props: Props) {
    const [first, setFirst] = useState<string>();
    const [last, setLast] = useState<string>();
    const [email, setEmail] = useState<string>();
    const [phone, setPhone] = useState<string>();
    const [venmo, setVenmo] = useState<string>();
    const [username, setUsername] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [photo, setPhoto] = useState<string>();

    const BackAction = () => (
        <TopNavigationAction icon={BackIcon} onPress={() => props.navigation.goBack()}/>
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
                            onChangeText={(text) => setFirst(text)}
                            onSubmitEditing={()=>this.secondTextInput.focus()}
                        />
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
                                Profile Photo
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

export default RegisterScreen;
