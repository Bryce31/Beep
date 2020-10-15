import React, { Component } from "react";
import { Platform, StyleSheet, Keyboard, TouchableWithoutFeedback } from "react-native"
import { Input, Button, Layout, TopNavigation, TopNavigationAction } from "@ui-kitten/components";
import { BackIcon } from "../utils/Icons";
import { config } from "../utils/config";
import { UserContext } from '../utils/UserContext.js';
import { LoadingIndicator, ReportIcon } from "../utils/Icons";
import { parseError } from "../utils/Errors";

export class ReportScreen extends Component {
    static contextType = UserContext;

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            reason: ""
        };
    }

    reportUser() {
        this.setState({ isLoading: true });

        fetch(config.apiUrl + "/user/report", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + this.context.user.token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: this.props.route.params.id,
                reason: this.state.reason
            })
        })
        .then(response => {
            response.json().then(data => {
                alert(parseError(data.message));
                this.setState({ isLoading: false });
            });
        })
        .catch((error) => {
            console.log(error);
        });
    }

    render () {
        const BackAction = () => (
            <TopNavigationAction icon={BackIcon} onPress={() => this.props.navigation.goBack()}/>
        );

        return (
            <>
            <TopNavigation title='Report User' alignment='center' accessoryLeft={BackAction}/>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={!(Platform.OS == "ios" || Platform.OS == "android")} >
                <Layout style={styles.container}>            
                    <Layout style={styles.form}>
                        <Input
                            placeholder="User"
                            label="User"
                            value={this.props.route.params.first + " " + this.props.route.params.last}
                            disabled={true}
                        />
                        <Input
                            label="Reason"
                            multiline={true}
                            textContentType="text"
                            placeholder="Your reason for reporting here"
                            returnKeyType="go"
                            textStyle={{ minHeight: 64 }}
                            onChangeText={(text) => this.setState({ reason: text })}
                            onSubmitEditing={() => this.reportUser()}
                            blurOnSubmit={true}
                        />
                        {!this.state.isLoading ?
                            <Button accessoryRight={ReportIcon} onPress={() => this.reportUser()}>
                                Report User
                            </Button>
                            :
                            <Button appearance='outline' accessoryRight={LoadingIndicator}>
                                Loading
                            </Button>
                        }
                    </Layout>
                </Layout>
            </TouchableWithoutFeedback>
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1 ,
        alignItems: "center"
    },
    form: {
        marginTop: 20,
        width: "90%"
    }
});
