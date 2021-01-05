import React, { Component, ReactNode } from 'react';
import { Share, Platform, StyleSheet, Linking, TouchableWithoutFeedback, AppState, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Icon, Layout, Text, Button, Input, CheckBox, Card } from '@ui-kitten/components';
import * as Location from 'expo-location';
import socket from '../../utils/Socket'
import * as SplashScreen from 'expo-splash-screen';
import { UserContext } from '../../utils/UserContext';
import { config } from '../../utils/config';
import { handleFetchError } from "../../utils/Errors";
import { PhoneIcon, TextIcon, VenmoIcon, LeaveIcon, BackIcon, GetIcon, FindIcon, ShareIcon, LoadingIndicator } from '../../utils/Icons';
import ProfilePicture from "../../components/ProfilePicture";
import Logger from '../../utils/Logger';
import LeaveButton from './LeaveButton';

interface Props {
    navigation: any;
}

interface State {
    isLoading: boolean;
    foundBeep: boolean;
    isAccepted: boolean;
    groupSize: number | string;
    origin: string;
    destination: string;
    pickBeeper: boolean;
    beeper: any;
    state: number;
    ridersQueuePosition: number;
    eta: string | null;
}

export class MainFindBeepScreen extends Component<Props, State> {
    static contextType = UserContext;

    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: false,
            foundBeep: false,
            isAccepted: false,
            groupSize: 1,
            origin: '',
            destination: '',
            pickBeeper: true,
            beeper: {},
            state: 0,
            ridersQueuePosition: 0,
            eta: null
        }
    }

    async updateETA(lat: number, long: number): Promise<void> {
        if (!this.state.origin) {
            Logger.info("Origin was null!");
            return;
        }

        const a = lat + "," + long;
        const s = config.apiUrl + '/directions/' + a + '/' + this.state.origin;

        const result = await fetch(s, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.context.user.token
            }
        });

        try {
            const data = await result.json();
            this.setState({ eta: data.eta });
        }
        catch (error) {
            //this.setState({ eta: "ETA unavailable" });
        }
    }

    componentDidMount(): void {
        this.getRiderStatus(true);

        socket.on('updateRiderStatus', () => {
            this.getRiderStatus(false);
            //alert("Socket Triggered an Update");
        });

        socket.on('hereIsBeepersLocation', (data: any) => {
            console.log(data);
            this.updateETA(data.latitude, data.longitude);
        });

        socket.on("connect", async () => {
            await this.getRiderStatus();
            if (this.state.foundBeep) {
                Logger.info("[getRiderStatus] reconnected to socket successfully");
                this.enableGetRiderStatus();
            }
        });
    }

    async getRiderStatus(isInitial?: boolean): Promise<void> {
        try {
            const result = await fetch(config.apiUrl + "/rider/status", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + this.context.user.token
                }
            });

            const data = await result.json();

            if (data.status === "success") {

                if (data.state !== this.state.state) {
                    //TODO do something to emphesise beep state change
                }

                this.setState({
                    foundBeep: true,
                    isLoading: false,
                    ...data
                });

                if (data.beeper.location) {
                    this.updateETA(data.beeper.location.latitude, data.beeper.location.longitude);
                }

                if (isInitial) {
                    this.enableGetRiderStatus();
                }
            }
            else {
                //TODO: our API should really not return a result with status: "error"
                //we need to rewrite the API to NOT return error when rider is not in a queue
                if (result.status !== 200) {
                    await SplashScreen.hideAsync();
                    this.setState({ isLoading: handleFetchError(data.message) });
                }

                if (!isInitial) {
                    this.setState({ isLoading: false, foundBeep: false, isAccepted: false, beeper: {}, state: 0, ridersQueuePosition: 0 });
                    this.disableGetRiderStatus();
                }
            }
            if (isInitial) {
                await SplashScreen.hideAsync();
            }
        }
        catch (error) {
            this.setState({ isLoading: handleFetchError(error) }, async () => {
                if (isInitial) {
                    await SplashScreen.hideAsync();
                }
            });
        }
    }

    async chooseBeep (id: string): Promise<void> {
        if(this.state.origin == "Loading Location...") {
            return alert("Please let your current location finish loading or manualy enter your pickup location");
        }

        this.setState({ isLoading: true });

        try {
            const result = await fetch(config.apiUrl + "/rider/choose", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + this.context.user.token
                },
                body: JSON.stringify({
                    origin: this.state.origin,
                    destination: this.state.destination,
                    groupSize: Number(this.state.groupSize),
                    beepersID: id
                })
            });

            const data = await result.json();

            if (data.status === "success") {
                this.setState({
                    foundBeep: true,
                    isLoading: false,
                    ...data
                });

                this.enableGetRiderStatus();
            }
            else {
                this.setState({ isLoading: handleFetchError(data.message) });
            }
        }
        catch (error) {
            this.setState({ isLoading: handleFetchError(error) });
        }
    }

    async findBeep (): Promise<void> {
        if (this.state.pickBeeper) {
            this.props.navigation.navigate('PickBeepScreen', {
                handlePick: (id: string) => this.chooseBeep(id)
            });
            return;
        }

        this.setState({ isLoading: true });

        try {
            const result = await fetch(config.apiUrl + "/rider/find", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + this.context.user.token
                }
            });

            const data = await result.json();

            if (data.status === "success") {
                this.setState({
                    beeper: data.beeper,
                    isLoading: false
                });
            }
            else {
                this.setState({ isLoading: handleFetchError(data.message) });
            }
        }
        catch (error) {
            this.setState({ isLoading: handleFetchError(error) });
        }
    }

    async useCurrentLocation(): Promise<void> {
        this.setState({ origin: "Loading Location..." });
       
        Location.setGoogleApiKey("AIzaSyBgabJrpu7-ELWiUIKJlpBz2mL6GYjwCVI");

        const { status } = await Location.requestPermissionsAsync();

        if (status !== 'granted') {
            return alert("You must enable location to use this feature.");
        }

        const position = await Location.getCurrentPositionAsync({});
        const location = await Location.reverseGeocodeAsync({ latitude: position.coords.latitude, longitude: position.coords.longitude });

        let string;

        if (!location[0].name) {
            string = position.coords.latitude + ", "+ position.coords.longitude;
        }
        else {
            string = location[0].name + " " + location[0].street + " " + location[0].city + ", " + location[0].region + " " + location[0].postalCode;  
        }

        this.setState({ origin: string });
    }

    enableGetRiderStatus(): void {
        socket.emit('getRiderStatus', this.context.user.token, this.state.beeper.id);
    }

    disableGetRiderStatus(): void {
        socket.emit('stopGetRiderStatus');
    }

    getVenmoLink(): string {
        if (Number(this.state.groupSize) > 1) {
            return 'venmo://paycharge?txn=pay&recipients=' + this.state.beeper.venmo + '&amount=' + this.state.beeper.groupRate + '&note=Beep';
        }
        return 'venmo://paycharge?txn=pay&recipients=' + this.state.beeper.venmo + '&amount=' + this.state.beeper.singlesRate + '&note=Beep';
    }

    shareVenmoInformation(): void {
        try {
            Share.share({
                message: `Please Venmo ${this.state.beeper.venmo} $${this.state.beeper.groupRate} for the beep!`,
                url: this.getVenmoLink()
            });
        }
        catch (error) {
            alert(error.message);
        }
    }            

    render(): ReactNode {
        console.log("[MainFindBeep.js] Rendered");

        const CurrentLocationIcon = (props: Props) => (
            <TouchableWithoutFeedback onPress={() => this.useCurrentLocation()}>
                <Icon {...props} name='pin'/>
            </TouchableWithoutFeedback>
        );

        if (this.context.user.isBeeping) {
            return(
                <Layout style={styles.container}>
                    <Text category="h5">You are beeping!</Text>
                    <Text appearance="hint">You can't find a ride when you are beeping</Text>
                </Layout>
            );
        }

        if (!this.state.foundBeep) {
            if (this.state.beeper.id) {
                return(
                    <Layout style={styles.container}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate("Profile", {id: this.state.beeper.id})} >
                            <Layout style={{alignItems: "center", justifyContent: 'center'}}>
                                {this.state.beeper.photoUrl &&
                                <ProfilePicture
                                    style={{marginBottom: 5}}
                                    size={100}
                                    url={this.state.beeper.photoUrl}
                                />
                                }
                                <Layout style={styles.group}>
                                    <Text category='h5'>{this.state.beeper.first} {this.state.beeper.last}</Text>
                                    <Text appearance='hint'>is avalible to beep you!</Text>
                                </Layout>
                            </Layout>
                        </TouchableWithoutFeedback>
                        { this.state.beeper.isStudent &&
                        <Layout style={styles.group}>
                            <Text>{this.state.beeper.first} is a student 🎓</Text>
                        </Layout>
                        }
                        {this.state.beeper.masksRequired &&
                        <Layout style={styles.group}>
                            <Text>{this.state.beeper.first} requires a mask 😷</Text>
                        </Layout>
                        }
                        <Layout style={styles.group}>
                            <Text category='h6'>{this.state.beeper.first}'s Rates</Text>
                            <Layout style={styles.rateGroup}>
                                <Layout style={styles.rateLayout}>
                                    <Text appearance='hint'>Single</Text>
                                    <Text>${this.state.beeper.singlesRate}</Text>
                                </Layout>
                                <Layout style={styles.rateLayout} >
                                    <Text appearance='hint'>Group</Text>
                                    <Text>${this.state.beeper.groupRate}</Text>
                                </Layout>
                            </Layout>
                        </Layout>
                        <Layout style={styles.group}>
                            <Text appearance='hint'>{this.state.beeper.first}'s rider capacity is</Text>
                            <Text category='h6'>{this.state.beeper.capacity}</Text>
                        </Layout>

                        <Layout style={styles.group}>
                            <Text appearance='hint'>{this.state.beeper.first}'s total queue length is</Text>
                            <Text category='h6'>{this.state.beeper.queueSize}</Text>
                        </Layout>
                        {!this.state.isLoading ?
                            <Button
                                style={styles.buttons}
                                accessoryRight={GetIcon}
                                onPress={() => this.chooseBeep(this.state.beeper.id)}
                            >
                            Get Beep
                            </Button>
                            :
                            <Button appearance='outline' style={styles.buttons} accessoryRight={LoadingIndicator}>
                                Loading
                            </Button>
                        }
                        <Button
                            status='basic'
                            style={styles.buttons}
                            accessoryLeft={BackIcon}
                            onPress={() => this.setState({'beeper': {}})}
                        >
                        Go Back
                        </Button>
                    </Layout>
                );
            }
            else {
                return (
                    <Layout style={{height:"100%"}}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS == "ios" ? "padding" : "height"}
                        style={styles.container}
                    >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={!(Platform.OS == "ios" || Platform.OS == "android")} >
                    <Layout style={styles.container}>
                        <Input
                            keyboardType="number-pad"
                            label='Group Size'
                            style={styles.buttons}
                            placeholder='Group Size'
                            value={String(this.state.groupSize)}
                            onChangeText={value => this.setState({groupSize: value})}
                        />
                        <Input
                            label='Pick-up Location'
                            style={styles.buttons}
                            placeholder='Pickup Location'
                            accessoryRight={CurrentLocationIcon}
                            value={this.state.origin}
                            onChangeText={value => this.setState({origin: value})}
                        />
                        <Input
                            label='Destination Location'
                            style={styles.buttons}
                            placeholder='Destination'
                            value={this.state.destination}
                            onChangeText={value => this.setState({destination: value})}
                        />
                        <CheckBox
                            checked={this.state.pickBeeper}
                            onChange={(value) => this.setState({pickBeeper: value})}
                        >
                            Pick your own beeper
                        </CheckBox>
                        {!this.state.isLoading ?
                            <Button
                                accessoryRight={FindIcon}
                                onPress={() => this.findBeep()}
                                size='large'
                                style={{marginTop:15}}
                            >
                            Find a Beep
                            </Button>
                            :
                            <Button
                                size='large'
                                style={{marginTop:15}}
                                appearance='outline'
                                accessoryRight={LoadingIndicator}
                            >
                                Loading
                            </Button>
                        }
                    </Layout>
                    </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                    </Layout>
                );
            }
        }
        else {
            if (this.state.isAccepted) {
                return (
                    <Layout style={styles.container}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate("Profile", {id: this.state.beeper.id})} >
                            <Layout style={{alignItems: "center", justifyContent: 'center'}}>
                                {this.state.beeper.photoUrl &&
                                <ProfilePicture
                                    style={{marginBottom: 5}}
                                    size={100}
                                    url={this.state.beeper.photoUrl}
                                />
                                }
                                <Layout style={styles.group}>
                                    <Text category='h6'>{this.state.beeper.first} {this.state.beeper.last}</Text>
                                    <Text appearance='hint'>is your beeper!</Text>
                                </Layout>
                            </Layout>
                        </TouchableWithoutFeedback>
                        {this.state.beeper.isStudent &&
                        <Layout style={styles.group}>
                            <Text>{this.state.beeper.first} is a student 🎓</Text>
                        </Layout>
                        }
                        {this.state.beeper.masksRequired &&
                        <Layout style={styles.group}>
                            <Text>{this.state.beeper.first} requires a mask 😷</Text>
                        </Layout>
                        }

                        {(this.state.ridersQueuePosition == 0) ?
                            <Layout style={styles.group}>
                                <Card>
                                <Text category='h6'>Current Status</Text>
                                {this.state.state == 0 ?
                                    <Text appearance='hint'>
                                        Beeper is getting ready to come get you.
                                    </Text>
                                    :
                                    null
                                }
                                {this.state.state == 1 ?
                                    <>
                                        <Text appearance='hint'>
                                            Beeper is on their way to get you.
                                        </Text>
                                    </>
                                    :
                                    null
                                }
                                {this.state.state == 2 ?
                                    <Text appearance='hint'>
                                        Beeper is here to pick you up!
                                    </Text>
                                    :
                                    null
                                }
                                {this.state.state >= 3 ?
                                    <Text appearance='hint'>
                                        You are currenly in the car with your beeper.
                                    </Text>
                                    :
                                    null
                                }
                                </Card>
                                {(this.state.state == 1 && this.state.eta) &&
                                <Card style={{marginTop: 10}}>
                                        <Text category='h6'>Arrival ETA</Text>
                                        <Text appearance='hint'>Your beeper is {this.state.eta} away</Text>
                                    </Card>
                                }
                            </Layout>
                            :
                            null
                        }

                        <Layout style={styles.group}>
                            {(this.state.ridersQueuePosition != 0) && 
                                <>
                                    <Text category='h6'>{this.state.ridersQueuePosition}</Text>
                                    <Text appearance='hint'>{(this.state.ridersQueuePosition == 1) ? "person is" : "people are"} ahead of you in {this.state.beeper.first}'s queue.</Text>
                                </>
                            }
                        </Layout>

                        <Button
                            status='basic'
                            accessoryRight={PhoneIcon}
                            style={styles.buttons}
                            onPress={() =>{ Linking.openURL('tel:' + this.state.beeper.phone); } }
                        >
                        Call Beeper
                        </Button>

                        <Button
                            status='basic'
                            accessoryRight={TextIcon}
                            style={styles.buttons}
                            onPress={() =>{ Linking.openURL('sms:' + this.state.beeper.phone); } }
                        >
                        Text Beeper
                        </Button>
                        <Button
                            status='info'
                            accessoryRight={VenmoIcon}
                            style={styles.buttons}
                            onPress={() => Linking.openURL(this.getVenmoLink())}
                        >
                        Pay Beeper with Venmo
                        </Button> 
                        {(Number(this.state.groupSize) > 1) ?

                        <Button
                            status='basic'
                            accessoryRight={ShareIcon}
                            style={styles.buttons}
                            onPress={() => this.shareVenmoInformation()}
                        >
                        Share Venmo Info with Your Friends
                        </Button>
                        
                        : null}
                        {(this.state.ridersQueuePosition >= 1) && 
                            <LeaveButton beepersId={this.state.beeper.id} />
                        }
                    </Layout>
                );
            }
            else {
                return (
                    <Layout style={styles.container}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate("Profile", {id: this.state.beeper.id})} >
                            <Layout style={{alignItems: "center", justifyContent: 'center'}}>
                                {this.state.beeper.photoUrl &&
                                <ProfilePicture
                                    style={{marginBottom: 5}}
                                    size={100}
                                    url={this.state.beeper.photoUrl}
                                />
                                }
                                <Layout style={styles.group}>
                                <Text appearance='hint'>Waiting on</Text>
                                <Text category='h6'>{this.state.beeper.first} {this.state.beeper.last}</Text>
                                <Text appearance='hint'>to accept your request.</Text>
                                </Layout>
                            </Layout>
                        </TouchableWithoutFeedback>
                        {this.state.beeper.isStudent &&
                        <Layout style={styles.group}>
                            <Text>{this.state.beeper.first} is a student 🎓</Text>
                        </Layout>
                        }
                        {this.state.beeper.masksRequired &&
                        <Layout style={styles.group}>
                            <Text>{this.state.beeper.first} requires a mask 😷</Text>
                        </Layout>
                        }

                        <Layout style={styles.group}>
                            <Text category='h6'>{this.state.beeper.first}'{(this.state.beeper.first.charAt(this.state.beeper.first.length - 1) != 's') && "s"} Rates</Text>
                            <Text appearance='hint' style={{marginBottom: 6}}>per person</Text>
                            <Layout style={styles.rateGroup}>
                                <Layout style={styles.rateLayout}>
                                    <Text appearance='hint'>Single</Text>
                                    <Text>${this.state.beeper.singlesRate}</Text>
                                </Layout>
                                <Layout style={styles.rateLayout} >
                                    <Text appearance='hint'>Group</Text>
                                    <Text>${this.state.beeper.groupRate}</Text>
                                </Layout>
                            </Layout>
                        </Layout>

                        <Layout style={styles.group}>
                        <Text category='h6'>{this.state.beeper.queueSize}</Text>
                        <Text appearance='hint'>{(this.state.beeper.queueSize == 1) ? "person is" : "people are"} ahead of you in {this.state.beeper.first}'s queue</Text>
                        </Layout>
                        <LeaveButton beepersId={this.state.beeper.id} />
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
        justifyContent: 'center',
        width: "100%"
    },
    buttons: {
        marginBottom:5,
        width: "85%"
    },
    rowItem: {
        marginBottom:5,
        width: "95%"
    },
    group: {
        alignItems: "center",
        marginBottom: 12,
        width: '100%'
    },
    groupConatiner: {
        flexDirection: 'row',
        width: "80%",
        alignItems: "center",
        justifyContent: 'center',
    },
    rateGroup: {
        flexDirection: 'row',
        width: 120
    },
    layout: {
        flex: 1,
    },
    rateLayout: {
        flex: 1,
        alignItems: "center",
        justifyContent: 'center',
    },
});
