import React, { Component } from 'react';
import { config } from "../utils/config";
import { handleFetchError } from "../utils/Errors";
import { UserContext } from '../utils/UserContext';
import { Button } from '@ui-kitten/components';
import { EmailIcon, LoadingIndicator } from '../utils/Icons';

interface props {

}

interface state {
    isLoading: boolean;
}

export default class ResendButton extends Component<props, state> {
    static contextType = UserContext;

    constructor(props: props) {
        super(props);
        this.state = {
            isLoading: false
        };
    }

    resendEmailVerification() {
        this.setState({ isLoading: true });

        fetch(config.apiUrl + "/account/verify/resend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.context.user.token
            }
        })
        .then(response => {
            response.json().then(data => {
                    console.log("[Settings.js] [API] Get Email Status Responce: ", data);
                    this.setState({ isLoading: false });
                    alert(data.message);
                });
        })
        .catch((error) => this.setState({ isLoading: handleFetchError(error) }));
    }

    render() {
        if (this.state.isLoading) {
            return (
                <Button appearance='ghost' accessoryLeft={LoadingIndicator} style={{ marginBottom: 10 }}>
                    Loading
                </Button>
            );
        }
        
        return(
            <Button
                onPress={() => this.resendEmailVerification()}
                accessoryLeft={EmailIcon}
                style={{ marginBottom: 10 }}
                appearance='ghost'
            >
                    Resend Varification Email
            </Button>
        );
    }
}
