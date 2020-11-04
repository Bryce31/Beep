import React, { Component } from 'react';
import { Layout, Text, Divider, List, ListItem, Button, TopNavigation, TopNavigationAction, Spinner } from '@ui-kitten/components';
import { Image, StyleSheet } from 'react-native';
import { config } from "../../utils/config";
import { BackIcon, RefreshIcon, GetIcon } from '../../utils/Icons';
import { handleStatusCodeError, handleFetchError } from "../../utils/Errors";

export class PickBeepScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            beeperList: []
        }
    }

    getBeeperList = () => {
        fetch(config.apiUrl + "/rider/list")
        .then(response => {
            if (response.status !== 200) {
                return this.setState({ isLoading: handleStatusCodeError(response) });
            }

            response.json().then(data => {
                if (data.status === "success") {
                    this.setState({isLoading: false, beeperList: data.beeperList});
                }
                else {
                    alert(data.message);
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

    goBack (id) {
        const { navigation, route } = this.props;
        route.params.handlePick(id);
        navigation.goBack();
    }

    getDescription(item) {
        let output = `${item.queueSize} in ${item.first}'s queue\nRider Capacity: ${item.capacity}\nSingles: $${item.singlesRate}\nGroups: $${item.groupRate}`;
        if (item.masksRequired) {
            output += "\nMasks required 😷";
        }
        return output;
    }

    render() {
        const BackAction = () => (
            <TopNavigationAction icon={BackIcon} onPress={() => this.props.navigation.goBack()}/>
        );

        const RefreshAction = () => (
            <TopNavigationAction icon={RefreshIcon} onPress={() => this.getBeeperList()}/>
        );

        const renderItem = ({ item, index }) => (
            <ListItem
                onPress={() => this.goBack(item.id)}
                title={`${item.first} ${item.last}`}
                description={this.getDescription(item)}
                accessoryRight={() => {
                    if (item.isStudent) {
                        return (
                            <Button appearance="outline" size='tiny' accessoryRight={GetIcon}>Student</Button>
                        );
                    }
                    return null;
                }}
                accessoryLeft={() => {
                    if (item.photoUrl) {
                        return (
                            <Image
                                style={{width: 50, height: 50, borderRadius: 50/ 2 }}
                                size='large'
                                source={{uri: item.photoUrl || "https://icon-library.com/images/default-profile-icon/default-profile-icon-24.jpg"}}
                            />
                        );
                    }
                    return null;
                }}
            />
        );
        
        if (!this.state.isLoading) {
            if (this.state.beeperList && this.state.beeperList.length != 0) {
                return (
                    <>
                        <TopNavigation title='Beeper List' 
                        alignment='center' 
                        subtitle= {(this.state.beeperList.length == 1) ? `${this.state.beeperList.length} person is beeping` : `${this.state.beeperList.length} people are beeping`}
                        accessoryLeft={BackAction} 
                        accessoryRight={RefreshAction}/>

                        <List
                            data={this.state.beeperList}
                            ItemSeparatorComponent={Divider}
                            renderItem={renderItem}
                        />
                    </>
                );
            }
            else {
                return (
                    <>
                        <TopNavigation title='Beeper List' alignment='center' accessoryLeft={BackAction}/>
                        <Layout style={styles.container}>
                            <Text category='h5'>Nobody is beeping!</Text>
                            <Text appearance='hint'>Nobody is giving rides right now. Check back later!</Text>
                        </Layout>
                    </>
                );
            }
        }
        else {
            return (
                <>
                <TopNavigation title='Beeper List' alignment='center' accessoryLeft={BackAction}/>
                <Layout style={styles.container}>
                    <Spinner size='large' />
                </Layout>
                </>
            );
        }
    } 
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        alignItems: "center",
        justifyContent: 'center'
    }
});
