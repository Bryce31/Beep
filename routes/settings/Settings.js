import React from 'react';
import { StyleSheet } from 'react-native';
import { Icon, Layout, Button, Card, Text } from '@ui-kitten/components';
import { ThemeContext } from '../../utils/ThemeContext';
import { UserContext } from '../../utils/UserContext.js';
import socket from '../../utils/Socket';
import { LogIcon, ThemeIcon, LogoutIcon, ProfileIcon, PasswordIcon, ForwardIcon, EmailIcon } from '../../utils/Icons.js';
import { config } from "../../utils/config";
import { handleFetchError, handleStatusCodeError } from "../../utils/Errors";
import AsyncStorage from '@react-native-community/async-storage';

export function MainSettingsScreen({ navigation }) {
    const themeContext = React.useContext(ThemeContext);
    const userContext = React.useContext(UserContext);

    async function logout() {
        fetch(config.apiUrl + "/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + userContext.user.token
            },
            body: JSON.stringify({
                "isApp": true
            })
        })
        .then(response => {
            response.json().then(data => {
                //Logout was successfull
                console.log("[Settings.js] [Logout] We have internet connection.");
                //Using AsyncStorage, remove keys on logout.
                //IMPORTANT: we do NOT remove the expo push token beause we need that for any other user that may login
                //We can't remove it because it is only set on App.js when we initialize notifications, we may not re-run that code
                AsyncStorage.multiRemove(['@user', '@tokenid'], (err) => {
                    if (err) { 
                        console.error(err);
                    }
                    console.log("[Settings.js] [Logout] Removed all from storage except our push token.");
                });
                //these two emits tell our socket server that we no longer want the rethinkdb watcher open
                socket.emit('stopGetQueue');
                socket.emit('stopGetRiderStatus');
                socket.emit('stopGetUser');
                //this tells our client to stop listening to updates
                socket.off('updateRiderStatus');
                socket.off('updateQueue');
            });
        })
        .catch((error) => {
            //The fetch encountered an error.
            console.log("[Settings.js] [Logout] We have no internet!", error);
            //Define the keys we will remove from storage
            //IMPORTANT: notice how we did NOT remove the 'tokenid'
            //This is because use is offline, we will remove it upon the next signin or signup
            //Also, we still keep expoPushToken
            AsyncStorage.setItem("@tokenid", userContext.user.tokenid);
            //Remove user from AsyncStorage
            AsyncStorage.removeItem("@user", (error) => {
                console.log("Removed all except tokenid and expoPushToken from storage.", error);
            });
        });

        //Now that we have completed the logout procedue, send them to the Login page.
        navigation.reset({
            index: 0,
            routes: [
                { name: 'Login' },
            ],
            key: null
        });
    }

    function resendEmailVerification() {
        fetch(config.apiUrl + "/account/verify/resend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + userContext.user.token
            }
        })
        .then(response => {
            if (response.status !== 200) {
                return handleStatusCodeError(response);
            }

            response.json().then(data => {
                    console.log("[Settings.js] [API] Get Email Status Responce: ", data);
                    alert(data.message);
            });
        })
        .catch((error) => handleFetchError(error));
    }

    return (
        <Layout style={styles.wrapper}>
            <Layout style={styles.container}>
                <Text onPress={() => navigation.navigate("Profile", { id: userContext.user.id })} category="h1" style={styles.user}>{userContext.user.first + " " + userContext.user.last}</Text>
                {!userContext.user.isEmailVerified &&
                    <Card status="danger" style={{maxWidth: 400, marginBottom: 6}}>
                        <Text category="h6">Your email is not verified!</Text>
                    </Card>
                }
                {!userContext.user.isEmailVerified &&
                <Button
                    onPress={resendEmailVerification}
                    accessoryLeft={EmailIcon}
                    style={styles.button}
                    appearance='ghost'
                >
                    Resend Varification Email
                </Button>
                }
                <Button
                    onPress={themeContext.toggleTheme}
                    accessoryLeft={ThemeIcon}
                    style={styles.button}
                    appearance='ghost'
                >
                    Toggle Theme
                </Button>
                <Button
                    onPress={() => navigation.navigate("EditProfileScreen")}
                    accessoryLeft={ProfileIcon}
                    accessoryRight={ForwardIcon}
                    style={styles.button}
                    appearance='ghost'
                >
                    Edit Profile
                </Button>
                <Button
                    onPress={() => navigation.navigate("ChangePasswordScreen")}
                    accessoryLeft={PasswordIcon}
                    accessoryRight={ForwardIcon}
                    style={styles.button}
                    appearance='ghost'
                >
                    Change Password
                </Button>
                <Button
                    onPress={() => navigation.navigate("RideLogScreen")}
                    accessoryLeft={LogIcon}
                    accessoryRight={ForwardIcon}
                    style={styles.button}
                    appearance='ghost'
                >
                    Ride Log
                </Button>
                <Button
                    onPress={logout}
                    accessoryLeft={LogoutIcon}
                    style={styles.button}
                    appearance='ghost'
                >
                    Logout
                </Button>
            </Layout>
        </Layout>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '35%',
        marginTop: 20 
    },
    container: {
        flex: 1,
        width: '95%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wrapper: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
    },
    button: {
        marginBottom: 10 
    },
    user: {
        marginBottom: 10
    }
});
