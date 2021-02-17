import React, { Component, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Spinner } from "@ui-kitten/components";
import { UserContext } from '../utils/UserContext';
import { config } from "../utils/config";
import { handleFetchError } from "../utils/Errors";
import { gql, useMutation } from "@apollo/client";
import { UpdateBeeperQueueMutation } from "../generated/graphql";

interface Props {
    item: any;
}

const LoadingIndicator = () => (
  <View style={styles.indicator}>
    <Spinner size='small'/>
  </View>
);

const UpdateBeeperQueue = gql`
    mutation UpdateBeeperQueue($queueId: String!, $riderId: String!, $value: String!) {
        setBeeperQueue(input: {
        queueId: $queueId,
        riderId: $riderId,
        value: $value
    })
    }
`;

function ActionButton(props: Props) {
    const [update, { data, loading, error }] = useMutation<UpdateBeeperQueueMutation>(UpdateBeeperQueue);

    async function updateStatus(queueId: string, riderId: string, value: string | boolean): Promise<void> {
        const result = await update({
            variables: {
                queueId: queueId,
                riderId: riderId,
                value: value
            }
        });
    }

    function getMessage(): string {
        switch(props.item.state) {
            case 0:
                return "I'm on the way";
            case 1:
                return "I'm here";
            case 2:
                return "I'm now beeping this rider";
            case 3:
                return "I'm done beeping this rider";
            default:
                return "Yikes";
        }
    }

        if (loading) {
            return (
                <Button size="giant" appearance='outline' accessoryLeft={LoadingIndicator}>
                    Loading
                </Button>
            );
        }

        return (
            <Button size="giant" onPress={() => updateStatus(props.item.id, props.item.rider.id, (props.item.state < 3) ? "next" : "complete")}>
                {getMessage()}
            </Button>
        ) 
} 

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    button: {
        margin: 2,
    },
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ActionButton;