import React, { Component, useMemo, useState } from "react";
import { Platform, StyleSheet, Keyboard, TouchableWithoutFeedback } from "react-native"
import { Input, Button, Layout, TopNavigation, TopNavigationAction } from "@ui-kitten/components";
import { BackIcon } from "../../utils/Icons";
import { config } from "../../utils/config";
import { UserContext } from '../../utils/UserContext';
import { LoadingIndicator, ReportIcon } from "../../utils/Icons";
import { handleFetchError, parseError } from "../../utils/Errors";
import { gql, useMutation } from "@apollo/client";

interface Props {
    route: any;
    navigation: any;
}

const ReportUser = gql`
    mutation ReportUser($userId: String!, $reason: String!, $beepId: String) {
        reportUser(input: { userId: $userId, reason: $reason, beepId: $beepId })
    }
`;

export function ReportScreen(props: Props) {
    const [reason, setReason] = useState<string>();
    const [report, { data, loading, error }] = useMutation(ReportUser);

        async function reportUser() {
            const result = await report({
                variables: {
                    userId: props.route.params.id,
                    beep: props.route.params.beep,
                    reason: reason
                }
            });
            if (result) alert("Successfully Reported User");
        }

        const BackAction = () => (
            <TopNavigationAction icon={BackIcon} onPress={() => props.navigation.goBack()}/>
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
                            value={props.route.params.first + " " + props.route.params.last}
                            disabled={true}
                        />
                        <Input
                            label="Reason"
                            multiline={true}
                            placeholder="Your reason for reporting here"
                            returnKeyType="go"
                            textStyle={{ minHeight: 64 }}
                            onChangeText={(text) => setReason(text)}
                            onSubmitEditing={() => reportUser()}
                            blurOnSubmit={true}
                        />
                        {!loading ?
                            <Button accessoryRight={ReportIcon} onPress={() => reportUser()}>
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
