import React from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Button, Card, Text } from '@ui-kitten/components';
import { ThemeContext } from '../../utils/ThemeContext';
import { UserContext } from '../../utils/UserContext';
import socket from '../../utils/Socket';
import { PhotoIcon, LogIcon, ThemeIcon, LogoutIcon, ProfileIcon, PasswordIcon, ForwardIcon } from '../../utils/Icons';
import { config } from "../../utils/config";
import AsyncStorage from '@react-native-community/async-storage';
import ProfilePicture from '../../components/ProfilePicture';
import ResendButton from './ResendButton';

export function MainSettingsScreen({ navigation }: any) {
    const themeContext: any = React.useContext(ThemeContext);
    const userContext: any = React.useContext(UserContext);

    async function logout() {
        try {
            fetch(config.apiUrl + "/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + userContext.user.token
                },
                body: JSON.stringify({
                    "isApp": true
                })
            });

            AsyncStorage.multiRemove(['@user', '@tokenid'], (err) => {
                if (err) { 
                    console.error(err);
                }
            });

            socket.emit('stopGetQueue');
            socket.emit('stopGetRiderStatus');
            socket.emit('stopGetUser');
            socket.off('updateRiderStatus');
            socket.off('updateQueue');
        }
        catch (error) {
            //Probably no internet. Save tokenid so we can call the token revoker upon the next signin or signup
            AsyncStorage.setItem("@tokenid", userContext.user.tokenid);
            AsyncStorage.removeItem("@user", (error) => {
                console.log("Removed all except tokenid and expoPushToken from storage.", error);
            });
        }

        //Reset the navigation state and as a callback, remove the user from context
        await navigation.reset({
            index: 0,
            routes: [
                { name: 'Login' },
            ],
            key: null
        }, () => userContext.setUser(null));
    }

    function UserHeader(props: any) {
        return <Layout style={{flexDirection: 'row', marginHorizontal: -16}}>
            {userContext.user.photoUrl &&
            <ProfilePicture
                style={{marginHorizontal: 8}}
                size={50}
                url={userContext.user.photoUrl}
            />
            }
            <Layout>
                <Text category='h4'>
                    {props.user.first + " " + props.user.last}
                </Text>
                <Text
                    appearance='hint'
                    category='s1'>
                    {props.user.venmo}
                </Text>
            </Layout>
        </Layout>
    }

    return (
        <Layout style={styles.wrapper}>
            <Layout style={styles.container}>
                <Card style={{width: "80%", marginBottom: 20}} onPress={() => navigation.navigate("Profile", { id: userContext.user.id })} >
                    <UserHeader user={userContext.user} />
                </Card>
                {!userContext.user.isEmailVerified &&
                    <Card status="danger" style={{maxWidth: 400, marginBottom: 6}}>
                        <Text category="h6">Your email is not verified!</Text>
                    </Card>
                }
                {!userContext.user.isEmailVerified && <ResendButton />}
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
                    onPress={() => navigation.navigate("ProfilePhotoScreen")}
                    accessoryLeft={PhotoIcon}
                    accessoryRight={ForwardIcon}
                    style={styles.button}
                    appearance='ghost'
                >
                    Profile Photo
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
});
