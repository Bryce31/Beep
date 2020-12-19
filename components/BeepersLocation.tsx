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


    componentDidMount(): void {
        socket.on('hereIsBeepersLocation', (data: any) => {
            console.log(data);
            this.updateETA(data.latitude, data.longitude);
            this.setState({ data: data });
        });
    }

    componentWillUnmount(): void {
        socket.off('hereIsBeepersLocation');
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

