import React, { Component } from 'react';
import * as Location from 'expo-location';
import { StyleSheet, Linking, Platform, AppState, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Card, Layout, Text, Button, Input, Toggle, List, CheckBox } from '@ui-kitten/components';
import socket from '../../utils/Socket';
import { UserContext } from '../../utils/UserContext.js';
import { config } from "../../utils/config";
import * as Notifications from 'expo-notifications';
import ActionButton from "../../components/ActionButton";
import AcceptDenyButton from "../../components/AcceptDenyButton";
import { parseError, handleFetchError, handleStatusCodeError } from "../../utils/Errors";
import AsyncStorage from '@react-native-community/async-storage';
import {
    PhoneIcon,
    TextIcon,
    VenmoIcon,
    MapsIcon,
    DollarIcon,
} from '../../utils/Icons.js';

export class StartBeepingScreen extends Component {
    static contextType = UserContext;
    
    constructor(props, context) {
        super(props);
        this.state = {
            isBeeping: context.user.isBeeping,
            masksRequired: context.user.masksRequired,
            capacity: String(context.user.capacity),
            singlesRate: String(context.user.singlesRate),
            groupRate: String(context.user.groupRate),
            queue: []
        };
    }

    retrieveData = async () => {
        //Upon loading user data into states, get User's bepper status
        //to make sure our toggle switch is accurate with our database
        fetch(config.apiUrl + '/user/' + this.context.user.id)
        .then(response => {
            response.json().then(async (responseJson) => {
                if (responseJson.status == "success") {
                    if (this.state.isBeeping !== responseJson.user.isBeeping) {
                        this.setState({ isBeeping: responseJson.isBeeping });
                    }

                    if(responseJson.user.isBeeping) {
                        //if user turns 'isBeeping' on (to true), subscribe to rethinkdb changes
                        this.getQueue();
                        this.enableGetQueue();

                        //ensure we have location permissions before we start beeping
                        let { status } = await Location.requestPermissionsAsync();

                        if (status !== 'granted') {
                            //if we have no location access, dont let the user beep
                            //TODO we only disable beeping client side, should we push false to server also?
                            this.setState({isBeeping: false});
                            this.disableGetQueue();
                            //TODO better error handling
                            alert("You must allow location to beep!");
                        }
                    }
                    else {
                        //if the socket was somehow connected, make sure we are not lisiting to socket.io
                        //beacuse isBeeping is false
                        if (socket.connected) {
                            this.disableGetQueue();
                        }
                    }
                }
                else {
                    alert(message);
                }
            })
        })
        .catch((error) => {
            handleFetchError(error);
        });
    }

    componentDidMount () {
        //get user information and set toggle switch to correct status on mount
        this.retrieveData();

        AppState.addEventListener("change", this.handleAppStateChange);

        socket.on("updateQueue", () => {
            console.log("[StartBeeping.js] [Socket.io] Socktio.io told us to update queue!");
            this.getQueue();
        });

        socket.on("isBeepingData", (isSocketGettingQueue) => {
            console.log(isSocketGettingQueue);

            if (!socket.connected) {
                console.log("Socket is not connected! This is bad");
            }

            if (isSocketGettingQueue != String(this.state.isBeeping)) {
                console.log("Client and socket don't agree on whether or not client should be listening for queue");
                if (this.state.isBeeping) {
                    //there is a disagreement between the client and the socket server. 
                    //Asume client is connect and enable getting queue
                    this.getQueue();
                    this.enableGetQueue();
                }
            }
        });

        setInterval(function() {
            console.log("Checking to see if socket it working ok");
            socket.emit('isBeeping');
        }, 8000);
    }

    componentWillUnmount() {
        AppState.removeEventListener("change", this.handleAppStateChange);
    }

    handleAppStateChange = nextAppState => {
        if (nextAppState === "active" && !socket.connected && this.state.isBeeping) {
            console.log("socket is not connected but user is beeping! We need to resubscribe and get our queue.");
            this.enableGetQueue();
            this.getQueue();
        }
    }

    getQueue() {
        fetch(config.apiUrl + "/beeper/queue", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.context.user.token
            }
        })
        .then(response => {
            if (response.status !== 200) {
                return handleStatusCodeError(response);
            }

            response.json().then(data => {
                if (data.status === "success") {
                    //this is cool and it works with web somehow, iOS or web
                    //badge count will be your queue size!!
                    //TODO revisit this
                    Notifications.setBadgeCountAsync(data.queue.length);

                    //We sucessfuly updated beeper status in database
                    //This will calculate the array index of your current beep
                    //TODO revisit this, I think the index will always be zero?
                    let currentIndex;
                    for(let i = 0;  i < data.queue.length; i++) {
                        if (data.queue[i].isAccepted) {
                            currentIndex = i;
                            break;
                        }
                    }
                    this.setState({queue: data.queue, currentIndex: currentIndex});
                }
            });
        })
        .catch((error) => handleFetchError(error));
    }

    toggleSwitch = async (value) => {
        //Update the toggle switch's value into a isBeeping state
        this.setState({ isBeeping: value });

        if (value) {
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

        fetch(config.apiUrl + "/beeper/status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.context.user.token
            },
            body: JSON.stringify({
                "isBeeping": value,
                "singlesRate": this.state.singlesRate,
                "groupRate": this.state.groupRate,
                "capacity": this.state.capacity,
                "masksRequired": this.state.masksRequired
            })
        })
        .then(response => {
            if (response.status !== 200) {
                return handleStatusCodeError(response);
            }

            response.json().then(data => {
                if (data.status === "success") {
                    //We sucessfuly updated beeper status in database
                    if (value) {
                        this.getQueue();
                    }

                    let tempUser = this.context.user;
                    tempUser.isBeeping = value;
                    AsyncStorage.setItem('@user', JSON.stringify(tempUser));
                    this.context.setUser(tempUser);
                }
                else {
                    //Use native popup to tell user why they could not change their status
                    //Unupdate the toggle switch because something failed
                    //We redo our actions so the client does not have to wait on server to update the switch
                    this.setState({isBeeping: !this.state.isBeeping});
                    //we also need to resubscribe to the socket
                    if (this.state.isBeeping) {
                        this.enableGetQueue();
                    }
                    else {
                        this.disableGetQueue();
                    }
                    alert(parseError(data.message));
                }
            });
        })
        .catch((error) => handleFetchError(error));
    }

    enableGetQueue = () => {
        console.log("Subscribing to Socket.io for Beeper's Queue");
        //tell the socket server we want to get updates of our queue
        socket.emit('getQueue', this.context.user.id);
    }

    disableGetQueue = () => {
        console.log("Unsubscribing to Socket.io for Beeper's Queue");
        //tell socket.io to close cursor
        socket.emit('stopGetQueue');
    }


    updateSingles = (value) => {
        this.setState({singlesRate: value});

        let tempUser = this.context.user;

        tempUser.singlesRate = value;

        AsyncStorage.setItem('@user', JSON.stringify(tempUser));
    }

    updateGroup = (value) => {
        this.setState({groupRate: value});

        let tempUser = this.context.user;

        tempUser.groupRate = value;

        AsyncStorage.setItem('@user', JSON.stringify(tempUser));
    }

    updateCapacity = (value) => {
        this.setState({capacity: value});

        let tempUser = this.context.user;

        tempUser.capacity = value;

        AsyncStorage.setItem('@user', JSON.stringify(tempUser));
    }

    handleDirections = (origin, dest) => {
        if (Platform.OS == 'ios') {
            Linking.openURL('http://maps.apple.com/?saddr=' + origin + '&daddr=' + dest);
        }
        else {
            Linking.openURL('https://www.google.com/maps/dir/' + origin + '/' + dest + '/');
        }
    }

    handleVenmo = (groupSize, venmo) => {
        if (groupSize > 1) {
            Linking.openURL('venmo://paycharge?txn=pay&recipients='+ venmo + '&amount=' + this.state.groupRate + '&note=Beep');
        }
        else {
            Linking.openURL('venmo://paycharge?txn=pay&recipients='+ venmo + '&amount=' + this.state.singlesRate + '&note=Beep');
        }
    }

    render () {
        console.log("[StartBeeping.js] Rendering Start Beeping Screen");
        if(!this.state.isBeeping) {
            return (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={!(Platform.OS == "ios" || Platform.OS == "android")} >
                <Layout style={styles.container}>
                    <Toggle
                        style={styles.toggle}
                        onChange = {this.toggleSwitch}
                        checked = {this.state.isBeeping}
                    >
                        {this.state.isBeeping ? "Stop Beeping" : "Start Beeping"}
                    </Toggle>
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
                        <Toggle
                            style={styles.toggle}
                            onChange = {this.toggleSwitch}
                            checked = {this.state.isBeeping}
                        >
                            {this.state.isBeeping ? "Stop Beeping" : "Start Beeping"}
                        </Toggle>
                        <List
                            style={styles.list}
                            data={this.state.queue}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({item, index}) =>
                                item.isAccepted ?

                                <Card style={styles.cards} status={(this.state.currentIndex == index) ? "primary" : "basic"} >
                                    <Layout style={styles.row}>
                                        <Text category='h6'>Rider</Text>
                                        <Text style={styles.rowText}>{item.personalInfo.first} {item.personalInfo.last}</Text>
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
                                    <ActionButton ref={this.actionButtonElement} item={item}/>
                                </Card>

                                :

                                <Card style={styles.cards}>
                                    <Layout style={styles.row}>
                                        <Text category='h6'>Rider</Text>
                                        <Text style={styles.rowText}>{item.personalInfo.first} {item.personalInfo.last}</Text>
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
                        <Toggle
                            style={styles.toggle}
                            onChange = {this.toggleSwitch}
                            checked = {this.state.isBeeping}
                        >
                            {this.state.isBeeping ? "Stop Beeping" : "Start Beeping"}
                        </Toggle>
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
