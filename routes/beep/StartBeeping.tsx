import React, { Component, ReactNode, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { StyleSheet, Linking, Platform, AppState, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { Card, Layout, Text, Button, Input, List, CheckBox } from '@ui-kitten/components';
import socket from '../../utils/Socket';
import { UserContext } from '../../utils/UserContext';
import { config, isAndroid } from "../../utils/config";
import * as Notifications from 'expo-notifications';
import ActionButton from "../../components/ActionButton";
import AcceptDenyButton from "../../components/AcceptDenyButton";
import { handleFetchError } from "../../utils/Errors";
import AsyncStorage from '@react-native-community/async-storage';
import { PhoneIcon, TextIcon, VenmoIcon, MapsIcon, DollarIcon } from '../../utils/Icons';
import ProfilePicture from '../../components/ProfilePicture';
import Toggle from "./components/Toggle";
import * as Permissions from 'expo-permissions';
import Logger from '../../utils/Logger';
import { gql, useMutation, useQuery } from '@apollo/client';
import { GetQueueQuery, UpdateBeepSettingsMutation } from '../../generated/graphql';

interface Props {
    navigation: any;
}

const GetQueue = gql`
    query GetQueue {
        getQueue {
            id
            isAccepted
            groupSize
            origin
            destination
            state
            rider {
                id
                name
                first
                last
                venmo
                phone
            }
        }
    }
`;

const UpdateBeepSettings = gql`
    mutation UpdateBeepSettings {
        setBeeperStatus(
        input : {
            singlesRate: 1
            groupRate: 1
            capacity: 9
            isBeeping: false
            masksRequired: true
        }
        ) {
            queue {
                id
            }
        }
    }
`;

const LOCATION_TRACKING = 'location-tracking';

export function StartBeepingScreen(props: Props) {
    const userContext: any = React.useContext(UserContext);
    const [isBeeping, setIsBeeping] = useState<boolean>(userContext.user.user.isBeeping);
    const { loading, error, data } = useQuery<GetQueueQuery>(GetQueue);
    const [updateBeepSettings, { loading: loadingBeepSettings, error: beepSettingsError }] = useMutation<UpdateBeepSettingsMutation>(UpdateBeepSettings);

    async function startLocationTracking(): Promise<void> {
        if (!__DEV__) {
            await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
                accuracy: Location.Accuracy.Highest,
                timeInterval: (15 * 1000),
                distanceInterval: 6,
                foregroundService: {
                    notificationTitle: "Ride Beep App",
                    notificationBody: "You are currently beeping!",
                    notificationColor: "#e8c848"
                }
            });
            const hasStarted = await Location.hasStartedLocationUpdatesAsync(
                LOCATION_TRACKING
            );
            console.log(hasStarted);
        }
    }

    async function stopLocationTracking(): Promise<void> {
        if (!__DEV__) {
            Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
        }
    }

    useEffect(() => {
    }, []);


    function enableGetQueue(): void {
        socket.emit('getQueue', "");
    }

    function disableGetQueue(): void {
        socket.emit('stopGetQueue');
    }


    function handleDirections(origin: string, dest: string): void {
        if (Platform.OS == 'ios') {
            Linking.openURL('http://maps.apple.com/?saddr=' + origin + '&daddr=' + dest);
        }
        else {
            Linking.openURL('https://www.google.com/maps/dir/' + origin + '/' + dest + '/');
        }
    }

    function handleVenmo(groupSize: string | number, venmo: string): void {
        if (groupSize > 1) {
            Linking.openURL('venmo://paycharge?txn=pay&recipients='+ venmo + '&amount=' + userContext.user.user.groupRate + '&note=Beep');
        }
        else {
            Linking.openURL('venmo://paycharge?txn=pay&recipients='+ venmo + '&amount=' + userContext.user.user.singlesRate + '&note=Beep');
        }
    }

    if(!isBeeping) {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={!(Platform.OS == "ios" || Platform.OS == "android")} >
                <Layout style={styles.container}>
                    <Toggle isBeepingState={isBeeping} onToggle={(value) => {}}/>
                    <Layout style={{marginTop: 6, width: "85%"}}>
                        <Input
                            label='Max Capacity'
                            caption='The maximum number of people you can fit in your vehicle not including yourself.'
                            placeholder='Max Capcity'
                            keyboardType='numeric'
                            style={styles.inputs}
                            value={""}
                            onChangeText={(value) => {}}
                        />
                        <Input
                            label='Singles Rate'
                            caption='Riders who need a ride alone will pay this price.'
                            placeholder='Singles Rate'
                            keyboardType='numeric'
                            style={styles.inputs}
                            accessoryLeft={DollarIcon}
                            value={""}
                            onChangeText={(value) => {}}
                        />
                        <Input
                            label='Group Rate'
                            caption='Riders who ride in a group will each pay this price.'
                            placeholder='Group Rate'
                            keyboardType='numeric'
                            style={styles.inputs}
                            accessoryLeft={DollarIcon}
                            value={""}
                            onChangeText={(value) => {}}
                        />
                        <CheckBox
                            checked={false}
                            onChange={(value) => {}}
                            style={{marginTop: 5}}
                        >
                            Require riders to have a mask 😷
                        </CheckBox>
                    </Layout>
                </Layout>
            </TouchableWithoutFeedback>
        );
    }
    else {
        if (data?.getQueue && data.getQueue.length > 0) {
            return (
                <Layout style={styles.container}>
                    <Toggle isBeepingState={isBeeping} onToggle={async (value) => {}}/>
                    <List
                        style={styles.list}
                        data={data?.getQueue}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({item, index}) =>
                            item.isAccepted ?

                                <Card
                                    style={styles.cards}
                                    status={(0 == index) ? "primary" : "basic"} 
                                    onPress={() => props.navigation.navigate("Profile", { id: item.rider.id, beep: item.id })}
                                >
                                    <Layout
                                        style={{flex: 1, flexDirection: "row", alignItems: 'center'}}
                                    >
                                        {item.rider.photoUrl &&
                                        <ProfilePicture
                                            size={50}
                                            url={item.rider.photoUrl}
                                        />
                                        }
                                        <Text category="h6" style={styles.rowText}>{item.rider.first} {item.rider.last}</Text>
                                        {item.rider.isStudent && <Text>🎓</Text>}
                                    </Layout>
                                    <Layout style={styles.row}>
                                        <Text category='h6'>Group Size</Text>
                                        <Text style={styles.rowText}>{item.groupSize}</Text>
                                    </Layout>
                                    <Layout style={styles.row}>
                                        <Text category='h6'>Pick Up </Text>
                                        <Text style={{ width: '80%' }}>{item.origin}</Text>
                                    </Layout>
                                    <Layout style={styles.row}>
                                        <Text category='h6'>Drop Off </Text>
                                        <Text style={styles.rowText}>{item.destination}</Text>
                                    </Layout>
                                    <Layout style={styles.row}>
                                        <Layout style={styles.layout}>
                                            <Button
                                                size="small"
                                                style={styles.rowButton}
                                                status='basic'
                                                accessoryLeft={PhoneIcon}
                                                onPress={() =>{ Linking.openURL('tel:' + item.rider.phone); } }
                                            >
                                                Call Rider
                                            </Button>
                                        </Layout>
                                        <Layout style={styles.layout}>
                                            <Button
                                                size="small"
                                                status='basic'
                                                accessoryLeft={TextIcon}
                                                onPress={() =>{ Linking.openURL('sms:' + item.rider.phone); } }
                                            >
                                                Text Rider
                                            </Button>
                                        </Layout>
                                    </Layout>
                                    <Button
                                        size="small"
                                        style={styles.paddingUnder}
                                        status='info'
                                        accessoryLeft={VenmoIcon}
                                        onPress={() => handleVenmo(item.groupSize, item.rider.venmo)}
                                    >
                                        Request Money from Rider with Venmo
                                    </Button>
                                    {item.state <= 1 ?
                                        <Button
                                            size="small"
                                            style={styles.paddingUnder}
                                            status='success'
                                            accessoryLeft={MapsIcon}
                                            onPress={() => handleDirections("Current+Location", item.origin) }
                                        >
                                            Get Directions to Rider
                                        </Button>
                                        :
                                        <Button
                                            size="small"
                                            style={styles.paddingUnder}
                                            status='success'
                                            accessoryLeft={MapsIcon}
                                            onPress={() => handleDirections(item.origin, item.destination) }
                                        >
                                            Get Directions for Beep
                                        </Button>
                                    }
                                    <ActionButton ref={
                                        //@ts-ignore
                                        this.actionButtonElement
                                        } item={item}/>
                                </Card>

                                :

                                <Card
                                    style={styles.cards}
                                    onPress={() => props.navigation.navigate("Profile", { id: item.rider.id, beep: item.id })}
                                >
                                    <Layout style={{flex: 1, flexDirection: "row", alignItems: 'center'}}>
                                        {item.rider.photoUrl &&
                                        <ProfilePicture
                                            size={50}
                                            url={item.rider.photoUrl}
                                        />
                                        }
                                        <Text category="h6" style={styles.rowText}>{item.rider.first} {item.rider.last}</Text>
                                        {item.rider.isStudent && <Text>🎓</Text>}
                                    </Layout>
                                    <Layout style={styles.row}>
                                        <Text category='h6'>Entered Queue</Text>
                                        <Text style={styles.rowText}>{new Date(item.timeEnteredQueue).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</Text>
                                    </Layout>
                                    <Layout style={styles.row}>
                                        <Text category='h6'>Group Size</Text>
                                        <Text style={styles.rowText}>{item.groupSize}</Text>
                                    </Layout>
                                    <Layout style={styles.row}>
                                        <Layout style={styles.layout}>
                                            <AcceptDenyButton type="accept" item={item}/>
                                        </Layout>
                                        <Layout style={styles.layout}>
                                            <AcceptDenyButton type="deny" item={item}/>
                                        </Layout>
                                    </Layout>
                                </Card>
                        }
                    />
                </Layout>
            );
        }
        else {
            return (
                <Layout style={styles.container}>
                    <Toggle isBeepingState={isBeeping} onToggle={async (value) => {}}/>
                    <Layout style={styles.empty}>
                        <Text category='h5'>Your queue is empty</Text>
                        <Text appearance='hint'>If someone wants you to beep them, it will appear here. If your app is closed, you will recieve a push notification.</Text>
                    </Layout>
                </Layout>
            );
        }
    }
}

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
    if (error) {
        return Logger.error(error);
    }

    if (data) {
        console.log(data);
        const { locations } = data;
        const lat = locations[0].coords.latitude;
        const long = locations[0].coords.longitude;
        const altitude = locations[0].coords.altitude;
        const accuracy = locations[0].coords.accuracy;
        const altitudeAccuracy = locations[0].coords.altitudeAccuracy;
        const heading = locations[0].coords.heading;
        const speed = locations[0].coords.speed;

        const auth = await AsyncStorage.getItem('@user')

        if (!auth) return;

        const authToken = JSON.parse(auth).tokens.token;

        socket.emit('updateUsersLocation', authToken, lat, long, altitude, accuracy, altitudeAccuracy, heading, speed);
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingTop: 15,
    },
    paddingUnder: {
        marginBottom:5,
    },
    list: {
        width: "90%",
        backgroundColor: 'transparent'
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        marginBottom:5,
    },
    layout: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    toggle: {
        marginBottom: 7
    },
    inputs: {
        marginBottom: 6
    },
    empty : {
        height: '80%',
        width: '80%',
        alignItems: "center",
        justifyContent: 'center',
    },
    emptyConatiner: {
        width: '85%'
    },
    cards: {
        marginBottom: 10 
    },
    rowText: {
        marginTop: 2,
        marginLeft: 5
    },
    rowButton: {
        width: "98%"
    }
});
