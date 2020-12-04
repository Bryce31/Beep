import React, { Component } from 'react';
import { Layout, Text, Divider, List, ListItem, Spinner } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { config } from "../../utils/config";
import { handleFetchError } from "../../utils/Errors";
import { UserContext } from '../../utils/UserContext';

interface Props {
    navigation: any;
}

interface State {
    isLoading: boolean;
    riderList: any[];
}

export class RiderRideLogScreen extends Component<Props, State> {
    static contextType = UserContext;

    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: true,
            riderList: []
        }
    }

    async getRiderList() {
        try {
            const result = await fetch(config.apiUrl + "/account/history/rider", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + this.context.user.token
                }
            });

            const data = await result.json();

            if (data.status == "success") {
                this.setState({ isLoading: false, riderList: data.data });
            }
            else {
                this.setState({ isLoading: handleFetchError(data.message) });
            }
        }
        catch(error) {
            this.setState({ isLoading: handleFetchError(error) });
        }
    }

    componentDidMount () {
        this.getRiderList();
    }

    render() {
        const renderItem = ({ item }: any) => (
            <ListItem
                onPress={() => this.props.navigation.push("Profile", { id: item.beepersid })}
                title={`${item.beepersName} beeped you`}
                description={`Group size: ${item.groupSize}\nOrigin: ${item.origin}\nDestination: ${item.destination}\nDate: ${new Date(item.timeEnteredQueue)}`}
            />
        );
        
        if (!this.state.isLoading) {
            if (this.state.riderList && this.state.riderList.length != 0) {
                return (
                <Layout style={styles.container}>
                    <List
                        style={{width:"100%"}}
                        data={this.state.riderList}
                        ItemSeparatorComponent={Divider}
                        renderItem={renderItem}
                    />
                </Layout>
                );
            }
            else {
                return (
                    <Layout style={styles.container}>
                        <Text category='h5'>Nothing to display!</Text>
                        <Text appearance='hint'>You have no previous rides to display</Text>
                    </Layout>
                );
            }
        }
        else {
            return (
                <Layout>
                    <Text category='h5'>Loading your history</Text>
                    <Spinner />
                </Layout>
            );
        }
    } 
}

const styles = StyleSheet.create({
    container: {
        height: '82%',
        alignItems: "center",
        justifyContent: 'center'
    }
});
