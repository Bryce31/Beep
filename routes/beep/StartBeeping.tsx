import React, { Component } from 'react';
import * as Location from 'expo-location';
import { StyleSheet, Linking, Platform, AppState, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Card, Layout, Text, Button, Input, List, CheckBox } from '@ui-kitten/components';
import socket from '../../utils/Socket';
import { config } from "../../utils/config";
import * as Notifications from 'expo-notifications';
import ActionButton from "../../components/ActionButton";
import AcceptDenyButton from "../../components/AcceptDenyButton";
import { handleFetchError } from "../../utils/Errors";
import AsyncStorage from '@react-native-community/async-storage';
import { PhoneIcon, TextIcon, VenmoIcon, MapsIcon, DollarIcon } from '../../utils/Icons';
import ProfilePicture from '../../components/ProfilePicture';
import Toggle from "./components/Toggle";
import { view } from '@risingstack/react-easy-state';
import userStore from '../../utils/stores';

interface Props {
    navigation: any;
}

interface State {
    //isBeeping: boolean; 
    masksRequired: boolean;
    capacity: undefined | string;
    singlesRate: undefined | string;
    groupRate: undefined | string;
    queue: any[];
    currentIndex: number;
}

class StartBeepingScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            currentIndex: 0,
            //isBeeping: userStore.user.isBeeping,
            masksRequired: userStore.user.masksRequired,
            capacity: String(userStore.user.capacity),
            singlesRate: String(userStore.user.singlesRate),
            groupRate: String(userStore.user.groupRate),
            queue: []
        };
    }

    async retrieveData() {
        try {
            const result = await fetch(config.apiUrl + '/user/' + userStore.user.id);

            const data = await result.json();

            if (data.status == "success") {
                if (userStore.user.isBeeping !== data.user.isBeeping) {
                    userStore.user.isBeeping = data.isBeeping;
                }

                if(data.user.isBeeping) {
                    this.getQueue();
                    this.enableGetQueue();

                    let { status } = await Location.requestPermissionsAsync();

                    if (status !== 'granted') {
                        //if we have no location access, dont let the user beep
                        //TODO we only disable beeping client side, should we push false to server also?
                        userStore.user.isBeeping = false;
                        this.disableGetQueue();
                        //TODO better error handling
                        alert("You must allow location to beep!");
                    }
                }
            }
            else {
                handleFetchError(data.message);
            }
        }
        catch (error) {
            handleFetchError(error);
        }
    }

    componentDidMount () {
        this.retrieveData();

        AppState.addEventListener("change", this.handleAppStateChange);

        socket.on("updateQueue", () => {
            console.log("[StartBeeping.js] [Socket.io] Socktio.io told us to update queue!");
            this.getQueue();
        });
    }

    /*
    async componentDidUpdate() {
        console.log("checking to resub");
        if (this.state.isBeeping != userStore.user.isBeeping) {
            if (userStore.user.isBeeping) {
                //if we are turning on isBeeping, ensure we have location permission
                let { status } = await Location.requestPermissionsAsync();

                if (status !== 'granted') {
                    this.setState({ isBeeping: false });
                    return alert("You must allow location to beep!");
                }

                //if user turns 'isBeeping' on (to true), subscribe to rethinkdb changes
                this.enableGetQueue();
            }
            else {
                //if user turns 'isBeeping' off (to false), unsubscribe to rethinkdb changes
                this.disableGetQueue();
            }
            this.setState({ isBeeping: userStore.user.isBeeping });
        }
    }
     */

    componentWillUnmount() {
        AppState.removeEventListener("change", this.handleAppStateChange);
    }

    handleAppStateChange(nextAppState: string) {
        if (nextAppState === "active" && !socket.connected && userStore.user.isBeeping) {
            console.log("socket is not connected but user is beeping! We need to resubscribe and get our queue.");
            this.enableGetQueue();
            this.getQueue();
        }
    }

    async getQueue() {
        try {
            const result = await fetch(config.apiUrl + "/beeper/queue", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + userStore.user.token
                }
            });

            const data = await result.json();
            
            if (data.status === "success") {
                //this is cool and it works with web somehow, iOS or web
                //badge count will be your queue size!!
                //TODO revisit this
                Notifications.setBadgeCountAsync(data.queue.length);

                //We sucessfuly updated beeper status in database
                //This will calculate the array index of your current beep
                //TODO revisit this, I think the index will always be zero?
                let currentIndex = 0;
                for(let i = 0;  i < data.queue.length; i++) {
                    if (data.queue[i].isAccepted) {
                        currentIndex = i;
                        break;
                    }
                }

                //TODO is this a bad way to compare arrays
                if (JSON.stringify(this.state.queue) !== JSON.stringify(data.queue)) {
                    console.log("queue is not same, set state");
                    console.log(this.state.queue);
                    console.log(data.queue);
                    this.setState({ queue: data.queue, currentIndex: currentIndex });
                }
            }
            else {
                handleFetchError(data.message);
            }
        }
        catch (error) {
            handleFetchError(error);
        }
    }

    async toggleSwitch (value: boolean) {
        //Update the toggle switch's value into a isBeeping state
        userStore.user.isBeeping = value;

        if (value) {
            //if we are turning on isBeeping, ensure we have location permission
            let { status } = await Location.requestPermissionsAsync();

            if (status !== 'granted') {
                userStore.user.isBeeping = false;
                return alert("You must allow location to beep!");
            }
            //if user turns 'isBeeping' on (to true), subscribe to rethinkdb changes
            this.enableGetQueue();
        }
        else {
            //if user turns 'isBeeping' off (to false), unsubscribe to rethinkdb changes
            this.disableGetQueue();
        }
        
        try {
            const result = await fetch(config.apiUrl + "/beeper/status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + userStore.user.token
                },
                body: JSON.stringify({
                    "isBeeping": value,
                    "singlesRate": this.state.singlesRate,
                    "groupRate": this.state.groupRate,
                    "capacity": this.state.capacity,
                    "masksRequired": this.state.masksRequired
                })
            });

            const data = await result.json();

            if (data.status === "success") {
                //We sucessfuly updated beeper status in database
                if (value) {
                    this.getQueue();
                }

                userStore.user.isBeeping = value;

                let tempUser = userStore.user;
                tempUser.isBeeping = value;
                AsyncStorage.setItem('@user', JSON.stringify(tempUser));

                //TODO: better way to update context
            }
            else {
                //Use native popup to tell user why they could not change their status
                //Unupdate the toggle switch because something failed
                //We redo our actions so the client does not have to wait on server to update the switch
                userStore.user.isBeeping = !userStore.user.isBeeping;
                //we also need to resubscribe to the socket
                if (userStore.user.isBeeping) {
                    this.enableGetQueue();
                }
                else {
                    this.disableGetQueue();
                }

                handleFetchError(data.message);
            }
        }
        catch (error) {
            handleFetchError(error);
        }
    }

    enableGetQueue(): void {
        console.log("Subscribing to Socket.io for Beeper's Queue");
        socket.emit('getQueue', userStore.user.id);
    }

    disableGetQueue(): void {
        console.log("Unsubscribing to Socket.io for Beeper's Queue");
        socket.emit('stopGetQueue');
    }

    updateSingles (value: undefined | string) {
        this.setState({ singlesRate: value });

        let tempUser = userStore.user;

        tempUser.singlesRate = value;

        AsyncStorage.setItem('@user', JSON.stringify(tempUser));
    }

    updateGroup(value: undefined | string): void {
        this.setState({groupRate: value});

        let tempUser = userStore.user;

        tempUser.groupRate = value;

        AsyncStorage.setItem('@user', JSON.stringify(tempUser));
    }

    updateCapacity(value: undefined | string): void {
        this.setState({capacity: value});

        let tempUser = userStore.user;

        tempUser.capacity = value;

        AsyncStorage.setItem('@user', JSON.stringify(tempUser));
    }

    handleDirections(origin: string, dest: string): void {
        if (Platform.OS == 'ios') {
            Linking.openURL('http://maps.apple.com/?saddr=' + origin + '&daddr=' + dest);
        }
        else {
            Linking.openURL('https://www.google.com/maps/dir/' + origin + '/' + dest + '/');
        }
    }

    handleVenmo (groupSize: string | number, venmo: string): void {
        if (groupSize > 1) {
            Linking.openURL('venmo://paycharge?txn=pay&recipients='+ venmo + '&amount=' + this.state.groupRate + '&note=Beep');
        }
        else {
            Linking.openURL('venmo://paycharge?txn=pay&recipients='+ venmo + '&amount=' + this.state.singlesRate + '&note=Beep');
        }
    }

    render () {
        console.log("[StartBeeping.js] Rendering Start Beeping Screen");
        if(!userStore.user.isBeeping) {
            return (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={!(Platform.OS == "ios" || Platform.OS == "android")} >
                <Layout style={styles.container}>
                    <Toggle isBeepingState={userStore.user.isBeeping} onToggle={(value) => this.toggleSwitch(value)}/>
                    <Layout style={{marginTop: 6, width: "85%"}}>
                        <Text style={{marginBottom: 10}} category="h4">Beeping Options</Text>
                        <Input
                            label='Max Capacity'
                            caption='The maximum number of people you can fit in your vehicle not including yourself.'
                            placeholder='Max Capcity'
                            keyboardType='numeric'
                            style={styles.inputs}
                            value={this.state.capacity}
                            onChangeText={(value) => this.updateCapacity(value)}
                        />
                        <Input
                            label='Singles Rate'
                            caption='Riders who need a ride alone will pay this price.'
                            placeholder='Singles Rate'
                            keyboardType='numeric'
                            style={styles.inputs}
                            value={this.state.singlesRate}
                            accessoryLeft={DollarIcon}
                            onChangeText={(value) => this.updateSingles(value)}
                        />
                        <Input
                            label='Group Rate'
                            caption='Riders who ride in a group will each pay this price.'
                            placeholder='Group Rate'
                            keyboardType='numeric'
                            style={styles.inputs}
                            value={this.state.groupRate}
                            accessoryLeft={DollarIcon}
                            onChangeText={(value) => this.updateGroup(value)}
                        />
                            <Text category="h6" style={{marginBottom: 10, marginTop: 10}}>Additional Options</Text>
                        <CheckBox
                            checked={this.state.masksRequired}
                            onChange={(value) => this.setState({ masksRequired: value })}
                        >
                            Require riders to have a mask 😷
                        </CheckBox>
                    </Layout>
                </Layout>
                </TouchableWithoutFeedback>
            );
        }
        else {
            if (this.state.queue && this.state.queue.length != 0) {
                return (
                    <Layout style={styles.container}>
                        <Toggle isBeepingState={userStore.user.isBeeping} onToggle={(value) => this.toggleSwitch(value)}/>
                        <List
                            style={styles.list}
                            data={this.state.queue}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({item, index}) =>
                                item.isAccepted ?

                                <Card
                                    style={styles.cards}
                                    status={(this.state.currentIndex == index) ? "primary" : "basic"} 
                                    onPress={() => this.props.navigation.navigate("Profile", {id: item.riderid})}
                                >
                                    <Layout
                                        style={{flex: 1, flexDirection: "row", alignItems: 'center'}}
                                    >
                                        {item.personalInfo.photoUrl &&
                                        <ProfilePicture
                                            size={50}
                                            url={item.personalInfo.photoUrl}
                                        />
                                        }
                                        <Text category="h6" style={styles.rowText}>{item.personalInfo.first} {item.personalInfo.last}</Text>
                                        {item.personalInfo.isStudent && <Text>🎓</Text>}
                                    </Layout>
                                    <Layout style={styles.row}>
                                        <Text category='h6'>Group Size</Text>
                                        <Text style={styles.rowText}>{item.groupSize}</Text>
                                    </Layout>
                                    <Layout style={styles.row}>
                                        <Text category='h6'>Pick Up </Text>
                                        <Text style={styles.rowText}>{item.origin}</Text>
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
                                                onPress={() =>{ Linking.openURL('tel:' + item.personalInfo.phone); } }
                                            >
                                            Call Rider
                                            </Button>
                                        </Layout>
                                        <Layout style={styles.layout}>
                                            <Button
                                                size="small"
                                                status='basic'
                                                accessoryLeft={TextIcon}
                                                onPress={() =>{ Linking.openURL('sms:' + item.personalInfo.phone); } }
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
                                        onPress={() => this.handleVenmo(item.groupSize, item.personalInfo.venmo)}
                                    >
                                    Request Money from Rider with Venmo
                                    </Button>
                                    {item.state <= 1 ?
                                        <Button
                                            size="small"
                                            style={styles.paddingUnder}
                                            status='success'
                                            accessoryLeft={MapsIcon}
                                            onPress={() => this.handleDirections("Current+Location", item.origin) }
                                        >
                                        Get Directions to Rider
                                        </Button>
                                    :
                                        <Button
                                            size="small"
                                            style={styles.paddingUnder}
                                            status='success'
                                            accessoryLeft={MapsIcon}
                                            onPress={() => this.handleDirections(item.origin, item.destination) }
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
                                    onPress={() => this.props.navigation.navigate("Profile", {id: item.riderid})}
                                >
                                    <Layout style={{flex: 1, flexDirection: "row", alignItems: 'center'}}>
                                        {item.personalInfo.photoUrl &&
                                        <ProfilePicture
                                            size={50}
                                            url={item.personalInfo.photoUrl}
                                        />
                                        }
                                        <Text category="h6" style={styles.rowText}>{item.personalInfo.first} {item.personalInfo.last}</Text>
                                        {item.personalInfo.isStudent && <Text>🎓</Text>}
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
                        <Toggle isBeepingState={userStore.user.isBeeping} onToggle={(value) => this.toggleSwitch(value)}/>
                        <Layout style={styles.empty}>
                            <Text category='h5'>Your queue is empty</Text>
                            <Text appearance='hint'>If someone wants you to beep them, it will appear here. If your app is closed, you will recieve a push notification.</Text>
                        </Layout>
                    </Layout>
                );
            }
        }
    }
}


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

export default view(StartBeepingScreen);
