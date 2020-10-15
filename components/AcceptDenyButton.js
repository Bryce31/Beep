import React, { Component } from "react";
import { StyleSheet } from "react-native";
import { Button } from "@ui-kitten/components";
import { UserContext } from '../utils/UserContext.js';
import { config } from "../utils/config";
import { AcceptIcon, DenyIcon, AcceptIndicator, DenyIndicator } from "../utils/Icons";
import { handleFetchError, handleStatusCodeError } from "../utils/Errors";

export default class AcceptDenyButton extends Component {
    static contextType = UserContext;

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
        };
    }

    UNSAFE_componentWillReceiveProps() {
        this.setState({ isLoading: false });
    }

    updateStatus(queueID, riderID, value) {
        this.setState({ isLoading: true });

        fetch(config.apiUrl + "/beeper/queue/status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.context.user.token
            },
            body: JSON.stringify({
                "value": value,
                "queueID": queueID,
                "riderID": riderID
            })
        })
        .then(response => {
            if (response.status !== 200) {
                return this.setState({ isLoading: handleStatusCodeError(response) });
            }

            response.json().then(data => {
                if (data.status === "error") {
                    alert(data.message);
                    this.setState({isLoading: false});
                }
            });
        })
        .catch((error) => {
            this.setState({ isLoading: handleFetchError(error) });
        });
    }
    

    render() {
        if (this.state.isLoading) {
            return(
                <Button style={styles.button} appearance="outline" status={(this.props.type == "accept") ? "success" : "danger" } accessoryLeft={(this.props.type == "accept") ? AcceptIndicator : DenyIndicator }>
                    Loading
                </Button>
            );
        }

        return (
            <Button style={styles.button} status={(this.props.type == "accept") ? "success" : "danger" } accessoryLeft={(this.props.type == "accept") ? AcceptIcon : DenyIcon } onPress={()=> this.updateStatus(this.props.item.id, this.props.item.riderid, this.props.type)}>
                {(this.props.type == "accept") ? "Accept" : "Deny" }
            </Button>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    button: {
        margin: 2,
    },
});
