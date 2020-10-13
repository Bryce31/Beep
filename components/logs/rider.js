import React, { Component } from 'react';
import { Layout, Text, Divider, List, ListItem, Spinner } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { config } from "../../utils/config";
import { handleStatusCodeError, handleFetchError } from "../../utils/errors";
import { UserContext } from '../../utils/UserContext.js';

export class RiderRideLogScreen extends Component {
    static contextType = UserContext;

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            riderList: []
        }
    }

    getRiderList = () => {
        fetch(config.apiUrl + "/account/history/rider", {
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
                this.setState({isLoading: false, riderList: data});
            });
        })
        .catch((error) => {
            this.setState({ isLoading: handleFetchError(error) });
        });
    }

    componentDidMount () {
        this.getRiderList();
    }

    render() {
        const renderItem = ({ item, index }) => (
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
                <Layout style={styles.container}>
                    <Spinner size='large' />
                </Layout>
            );
        }
    } 
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        alignItems: "center",
        justifyContent: 'center'
    }
});
