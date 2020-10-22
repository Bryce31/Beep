import React, { Component } from 'react';
import { Layout, Text, Divider, List, ListItem, TopNavigation, TopNavigationAction, Spinner } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { config } from "../../utils/config";
import { BackIcon, RefreshIcon } from '../../utils/Icons';
import { handleStatusCodeError, handleFetchError } from "../../utils/Errors";
import { UserContext } from '../../utils/UserContext.js';

export class BeeperRideLogScreen extends Component {
    static contextType = UserContext;

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            beeperList: []
        }
    }

    getBeeperList = () => {
        fetch(config.apiUrl + "/account/history/beeper", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.context.user.token
            }
        })
        .then(response => {
            if (response.status !== 200) {
                return this.setState({ isLoading: handleStatusCodeError(response) });
            }

            response.json().then(data => {
                this.setState({isLoading: false, beeperList: data});
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
        const renderItem = ({ item, index }) => (
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
        height: '80%',
        alignItems: "center",
        justifyContent: 'center'
    }
});
