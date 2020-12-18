import React, { Component, ReactNode } from "react";
import { Text } from '@ui-kitten/components';
import socket from "../utils/Socket";
import * as Location from 'expo-location';
import {config} from "../utils/config";

interface Props {
    origin: string;
}

interface State {
    isLoading: boolean;
    eta: string;
    data: any;
}

export default class BeepersLocation extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: false,
            eta: "",
            data: null
        };
    }

    //routes[0].legs[0].duration.text
    async updateETA(lat: number, long: number): Promise<void> {
        console.log("Props", this.props);
        if (!this.props.origin) {
            console.log("NO ORIGIN!!!!!!!!!!!");
            return;
        }
        
        /*
        Location.setGoogleApiKey("AIzaSyBgabJrpu7-ELWiUIKJlpBz2mL6GYjwCVI");
        const endCords = await Location.geocodeAsync(this.props.origin);
        const b = endCords[0].latitude + "," + endCords[0].longitude;
         */

        const a = lat + "," + long;
        const s = config.apiUrl + '/directions/' + a + '/' + this.props.origin;

        const result = await fetch(s);

        try {
            const data = await result.json();
            console.log(data);
            this.setState({ eta: data.eta });
        }
        catch (error) {
            console.log(error);
        }
    }

    componentDidMount(): void {
        socket.on('hereIsBeepersLocation', (data: any) => {
            console.log(data);
            this.updateETA(data.latitude, data.longitude);
            this.setState({ data: data });
        });
    }

    render(): ReactNode {
        if (this.state.data == null) {
            return(
                <Text>Loading</Text>
            );
        }

        return (
            <>
                <Text style={{marginBottom: 20}}>Beeper is driving at {this.state.data.speed} m/s</Text>
                <Text style={{marginBottom: 20}}>{this.state.data.latitude}, {this.state.data.longitude}</Text>
                <Text style={{marginBottom: 20}}>{this.state.eta}</Text>
            </>
        );
    }
}

