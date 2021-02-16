import React, { Component } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { config } from '../../utils/config';
import { handleFetchError } from '../../utils/Errors';
import { LeaveIcon } from '../../utils/Icons';
import { Button } from '@ui-kitten/components';
import { UserContext } from '../../utils/UserContext';
import { isMobile } from '../../utils/config';
import {gql, useMutation} from '@apollo/client';
import {LeaveQueueMutation} from '../../generated/graphql';

interface Props {
    beepersId: string; 
}

const LeaveQueue = gql`
    mutation LeaveQueue {
        riderLeaveQueue
    }
`;

function LeaveButton(props: Props) {
    const [leave, { loading, error, data }] = useMutation<LeaveQueueMutation>(LeaveQueue);

    function leaveQueueWrapper(): void {
        if (isMobile) {
            Alert.alert(
                "Leave Queue?",
                "Are you sure you want to leave this queue?",
                [
                    {
                        text: "No",
                        onPress: () => console.log("No Pressed"),
                            style: "cancel"
                    },
                    { text: "Yes", onPress: () => leaveQueue() }
                ],
                { cancelable: true }
            );
        }
        else {
            leaveQueue();
        }
    }

    async function leaveQueue(): Promise<void> {
        leave();
    }

    if (loading) {
        return (
            <Button appearance='outline' status='danger' style={styles.button}>
                Loading
            </Button>
        );
    }

    return (
        <Button
            status='danger'
            style={styles.button}
            accessoryRight={LeaveIcon}
            onPress={() => leaveQueueWrapper()}
        >
            Leave Queue
        </Button>
    );
}

const styles = StyleSheet.create({
    button: {
        width: "85%"
    }
});

export default LeaveButton;
