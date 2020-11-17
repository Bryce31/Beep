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
    beeperList: any[];
}

export class BeeperRideLogScreen extends Component<Props, State> {
    static contextType = UserContext;

    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: true,
            beeperList: []
        }
    }

    getBeeperList() {
        fetch(config.apiUrl + "/account/history/beeper", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.context.user.token
            }
        })
        .then(response => {
            response.json().then(data => {
                if (data.status == "success") {
                    this.setState({ isLoading: false, beeperList: data.data });
                }
                else {
                    this.setState({ isLoading: handleFetchError(data.message) });
                }
            });
        })
        .catch((error) => {
            this.setState({ isLoading: handleFetchError(error) });
        });
    }

    componentDidMount () {
        this.getBeeperList();
    }

    render() {
        const renderItem = ({ item }: any) => (
            <ListItem
                onPress={() => this.props.navigation.push("Profile", { id: item.riderid })}
                title={`You beeped ${item.riderName}`}
                description={`Group size: ${item.groupSize}\nOrigin: ${item.origin}\nDestination: ${item.destination}\nDate: ${new Date(item.timeEnteredQueue)}`}
            />
        );
        
        if (!this.state.isLoading) {
            if (this.state.beeperList && this.state.beeperList.length != 0) {
                return (
                <Layout style={styles.container}>
                    <List
                        style={{width:"100%"}}
                        data={this.state.beeperList}
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
                        <Text appearance='hint'>You have no previous beeps to display</Text>
                    </Layout>
                );
            }
        }
        else {
            return (
                <Layout style={styles.container}>
                    <Spinner style={{marginTop: 20}} size='large' />
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
