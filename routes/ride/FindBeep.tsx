import React, { useEffect, useState } from 'react';
import { Share, Platform, StyleSheet, Linking, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Icon, Layout, Text, Button, Input, Card } from '@ui-kitten/components';
import * as Location from 'expo-location';
import socket from '../../utils/Socket'
import * as SplashScreen from 'expo-splash-screen';
import { UserContext } from '../../utils/UserContext';
import { PhoneIcon, TextIcon, VenmoIcon, FindIcon, ShareIcon, LoadingIndicator } from '../../utils/Icons';
import ProfilePicture from "../../components/ProfilePicture";
import LeaveButton from './LeaveButton';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainNavParamList } from '../../navigators/MainTabs';
import Logger from '../../utils/Logger';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { GetRiderStatusQuery, GetEtaQuery } from '../../generated/graphql';
import { gqlChooseBeep } from './helpers';

const RiderStatus = gql`
    query GetRiderStatus {
        getRiderStatus {
            id
            ridersQueuePosition
            isAccepted
            origin
            destination
            state
            groupSize
            location {
                longitude
                latitude
            }
            beeper {
                id
                first
                last
                singlesRate
                groupRate
                isStudent
                role
                venmo
                username
                phone
                photoUrl
                masksRequired
                capacity
                queueSize
            }
        }
    }
`;

const GetETA = gql`
    query GetETA ($start: String!, $end: String!)	{
        getETA(start: $start, end: $end)
    }
`;


interface Props {
    navigation: BottomTabNavigationProp<MainNavParamList>;
}

export function MainFindBeepScreen(props: Props) {
    const userContext: any = React.useContext(UserContext);

    const [getETA, { data: eta, loading: etaLoading, error: etaError}] = useLazyQuery<GetEtaQuery>(GetETA);
    const [groupSize, setGroupSize] = useState<string>("1");
    const [origin, setOrigin] = useState<string>();
    const [destination, setDestination] = useState<string>();
    const [isGetBeepLoading, setIsGetBeepLoading] = useState<boolean>(false);

    const { loading, error, data, refetch, startPolling, previousData } = useQuery<GetRiderStatusQuery>(RiderStatus, { errorPolicy: 'all' });

    async function updateETA(lat: number, long: number): Promise<void> {
        const position = `${lat},${long}`;
        getETA({
            variables: {
                start: position,
                end: origin
            }
        });
    }

    useEffect(() => {
        try {
            SplashScreen.hideAsync();
        }
        catch(error) {
            console.error(error);
        }
        socket.on('updateRiderStatus', () => {
            refetch();
            console.log("Getting rider status");
        });

        socket.on('hereIsBeepersLocation', (data) => {
            updateETA(data.latitude, data.longitude);
        });

        socket.on("connect", async () => {
            console.log("SOCKET RECONNECT!!!");
            const t = await refetch();
            if (t.data?.getRiderStatus.beeper.id) {
                Logger.info("~~~~~ [getRiderStatus] reconnected to socket successfully");
                enableGetRiderStatus(t.data.getRiderStatus.beeper.id);
            }
            else {
                console.log("Socket reconnected but not in beep"); 
            }
        });
    }, []);

    useEffect(() => {
        if (data?.getRiderStatus.beeper.id && (previousData == null || previousData == undefined)) {
            enableGetRiderStatus(data.getRiderStatus.beeper.id);
        }
        if ((data == null || data.getRiderStatus.state == -1) && !(previousData == null || previousData == undefined)) {
            disableGetRiderStatus();
        }
        if (data?.getRiderStatus.location) {
            updateETA(data.getRiderStatus.location.latitude, data.getRiderStatus.location.longitude); 
        }
      }, [data, error])

    async function findBeep(): Promise<void> {
        return props.navigation.navigate('PickBeepScreen', {
            handlePick: (id: string) => chooseBeep(id)
        });
    }

    function enableGetRiderStatus(beeperId: string): void {
        socket.emit('getRiderStatus', userContext.user.tokens.id, beeperId);
    }

    function disableGetRiderStatus(): void {
        socket.emit('stopGetRiderStatus');
    }

    async function chooseBeep(id: string): Promise<void> {
        setIsGetBeepLoading(true);
        const result = await gqlChooseBeep({
            beeperId: id,
            origin: origin,
            destination: destination,
            groupSize: Number(groupSize)
        });
        setIsGetBeepLoading(false);

        console.log("Choose beeep result", result);

        enableGetRiderStatus(result.data?.chooseBeep.beeper.id);

        refetch();
    }

    function getVenmoLink(): string {
        if (Number(data?.getRiderStatus.groupSize) > 1) {
            return 'venmo://paycharge?txn=pay&recipients=' + data?.getRiderStatus.beeper?.venmo + '&amount=' + data?.getRiderStatus.beeper?.groupRate + '&note=Beep';
        }
        return 'venmo://paycharge?txn=pay&recipients=' + data?.getRiderStatus.beeper?.venmo + '&amount=' + data?.getRiderStatus.beeper?.singlesRate + '&note=Beep';
    }

    function shareVenmoInformation(): void {
        try {
            Share.share({
                message: `Please Venmo ${data?.getRiderStatus.beeper?.venmo} $${data?.getRiderStatus.beeper?.groupRate} for the beep!`,
                url: getVenmoLink()
            });
        }
        catch (error) {
            alert(error.message);
        }
    }            

    function getCurrentStatusMessage(): string {
        switch(data?.getRiderStatus.state) {
            case 0:
                return "Beeper is getting ready to come get you.";
            case 1:
                return "Beeper is on their way to get you.";
            case 2:
                return "Beeper is here to pick you up!";
            case 3:
                return "You are currenly in the car with your beeper.";
            default: 
                return "Unknown";
        }
    }

    async function useCurrentLocation(): Promise<void> {
        setOrigin("Loading your location...");
       
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

        setOrigin(string);
    }

    const CurrentLocationIcon = (props: Props) => (
        <TouchableWithoutFeedback onPress={() => useCurrentLocation()}>
            <Icon {...props} name='pin'/>
        </TouchableWithoutFeedback>
    );


    const Tags = () => (
        <Layout style={styles.tagRow}>
            {data?.getRiderStatus.beeper?.isStudent && <Button status="basic" size='tiny' style={styles.tag}>Student</Button>}
            {data?.getRiderStatus.beeper?.masksRequired && <Button status="info" size='tiny' style={styles.tag}>Masks Required</Button>}
            {(data?.getRiderStatus.beeper && data?.getRiderStatus.beeper?.role == "ADMIN") && <Button size='tiny' status='danger' style={styles.tag}>Founder</Button>}
        </Layout>
    );

    if (userContext.user.user.isBeeping) {
        return(
            <Layout style={styles.container}>
                <Text category="h5">You are beeping!</Text>
                <Text appearance="hint">You can{"'"}t find a ride when you are beeping</Text>
            </Layout>
        );
    }

    if (data == null || data?.getRiderStatus == null) {
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
                                value={groupSize}
                                onChangeText={value => setGroupSize(value)}
                            />
                            <Input
                                label='Pick-up Location'
                                style={styles.buttons}
                                placeholder='Pickup Location'
                                accessoryRight={CurrentLocationIcon}
                                value={origin}
                                onChangeText={value => setOrigin(value)}
                            />
                            <Input
                                label='Destination Location'
                                style={styles.buttons}
                                placeholder='Destination'
                                value={destination}
                                onChangeText={value => setDestination(value)}
                            />
                            {!isGetBeepLoading || loading ?
                                <Button
                                    accessoryRight={FindIcon}
                                    onPress={() => findBeep()}
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

    
    if (data?.getRiderStatus.isAccepted) {
        return (
            <Layout style={styles.container}>
                <TouchableWithoutFeedback onPress={() => props.navigation.navigate("Profile", { id: data?.getRiderStatus.beeper?.id, beep: data?.getRiderStatus.id })} >
                    <Layout style={{alignItems: "center", justifyContent: 'center'}}>
                        {data?.getRiderStatus.beeper?.photoUrl &&
                        <ProfilePicture
                            style={{marginBottom: 5}}
                            size={100}
                            url={data?.getRiderStatus.beeper.photoUrl}
                        />
                        }
                        <Layout style={styles.group}>
                            <Text category='h6'>{data?.getRiderStatus.beeper?.first || "No"} {data?.getRiderStatus.beeper?.last || "User"}</Text>
                            <Text appearance='hint'>is your beeper!</Text>
                        </Layout>
                    </Layout>
                </TouchableWithoutFeedback>
                <Tags/>
                {(data?.getRiderStatus.ridersQueuePosition == 0) &&
                <Layout style={styles.group}>
                    <Card>
                        <Text category='h6'>Current Status</Text>
                        <Text appearance='hint'>
                            {getCurrentStatusMessage()}
                        </Text>
                    </Card>
                    {(data?.getRiderStatus.state == 1) &&
                        <Layout>
                        {etaError && <Text>etaError.message</Text>}
                        {etaLoading && <Text>Loading ETA</Text>}
                        {eta &&
                            <Card style={{marginTop: 10}}>
                                <Text category='h6'>Arrival ETA</Text>
                                <Text appearance='hint'>Your beeper is {eta} away</Text>
                            </Card>
                        }
                        </Layout>
                    }
                </Layout>
                }
                {(data?.getRiderStatus.ridersQueuePosition != 0) && 
                    <Layout style={styles.group}>
                        <Text category='h6'>{data?.getRiderStatus.ridersQueuePosition}</Text>
                        <Text appearance='hint'>{(data?.getRiderStatus.ridersQueuePosition == 1) ? "person is" : "people are"} ahead of you in {data?.getRiderStatus.beeper?.first || "User"}{"'"}s queue.</Text>
                    </Layout>
                }
                <Button
                    status='basic'
                    accessoryRight={PhoneIcon}
                    style={styles.buttons}
                    onPress={() =>{ Linking.openURL('tel:' + data?.getRiderStatus.beeper?.phone); } }
                >
                    Call Beeper
                </Button>
                <Button
                    status='basic'
                    accessoryRight={TextIcon}
                    style={styles.buttons}
                    onPress={() =>{ Linking.openURL('sms:' + data?.getRiderStatus.beeper?.phone); } }
                >
                    Text Beeper
                </Button>
                <Button
                    status='info'
                    accessoryRight={VenmoIcon}
                    style={styles.buttons}
                    onPress={() => Linking.openURL(getVenmoLink())}
                >
                    Pay Beeper with Venmo
                </Button> 
                {(Number(data?.getRiderStatus.groupSize) > 1) &&
                <Button
                    status='basic'
                    accessoryRight={ShareIcon}
                    style={styles.buttons}
                    onPress={() => shareVenmoInformation()}
                >
                    Share Venmo Info with Your Friends
                </Button>
                }
                {(data?.getRiderStatus.ridersQueuePosition >= 1 && data?.getRiderStatus.beeper) && 
                    <LeaveButton beepersId={data?.getRiderStatus.beeper.id} refetch={() => refetch()} />
                }
            </Layout>
        );
    }
    else {
        return (
            <Layout style={styles.container}>
                <TouchableWithoutFeedback onPress={() => props.navigation.navigate("Profile", { id: data?.getRiderStatus.beeper.id, beep: data?.getRiderStatus.id })} >
                    <Layout style={{alignItems: "center", justifyContent: 'center'}}>
                        {data?.getRiderStatus.beeper.photoUrl &&
                        <ProfilePicture
                            style={{marginBottom: 5}}
                            size={100}
                            url={data.getRiderStatus.beeper.photoUrl}
                        />
                        }
                        <Layout style={styles.group}>
                            <Text appearance='hint'>Waiting on</Text>
                            <Text category='h6'>{data?.getRiderStatus.beeper.first || "No"} {data?.getRiderStatus.beeper.last || "User"}</Text>
                            <Text appearance='hint'>to accept your request.</Text>
                        </Layout>
                    </Layout>
                </TouchableWithoutFeedback>
                <Tags/>
                <Layout style={styles.group}>
                    <Text category='h6'>{data?.getRiderStatus.beeper?.first}{"'"}{(data?.getRiderStatus.beeper?.first.charAt(data?.getRiderStatus.beeper.first.length - 1) != 's') && "s"} Rates</Text>
                    <Text appearance='hint' style={{marginBottom: 6}}>per person</Text>
                    <Layout style={styles.rateGroup}>
                        <Layout style={styles.rateLayout}>
                            <Text appearance='hint'>Single</Text>
                            <Text>${data?.getRiderStatus.beeper?.singlesRate || "0.0"}</Text>
                        </Layout>
                        <Layout style={styles.rateLayout} >
                            <Text appearance='hint'>Group</Text>
                            <Text>${data?.getRiderStatus.beeper?.groupRate || "0.0"}</Text>
                        </Layout>
                    </Layout>
                </Layout>

                <Layout style={styles.group}>
                    <Text category='h6'>{data?.getRiderStatus.beeper?.queueSize}</Text>
                    <Text appearance='hint'>{(data?.getRiderStatus.beeper?.queueSize == 1) ? "person is" : "people are"} ahead of you in {data?.getRiderStatus.beeper?.first}{"'"}s queue</Text>
                </Layout>
                <LeaveButton beepersId={data?.getRiderStatus.beeper.id} refetch={() => refetch()} />
            </Layout>
        );
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
    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 10,
        width: "80%",
        justifyContent: "center"
    },
    tag: {
        margin: 4 
    }
});
