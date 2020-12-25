import React, { Component } from 'react';
import { Layout, Text, Divider, List, ListItem, Button, TopNavigation, TopNavigationAction, Spinner } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { config } from "../../utils/config";
import { BackIcon, RefreshIcon, StudentIcon } from '../../utils/Icons';
import { handleFetchError } from "../../utils/Errors";
import ProfilePicture from '../../components/ProfilePicture';

interface Props {
    navigation: any;
    route: any;
}

interface State {
    isLoading: boolean;
    beeperList: any[];
}

export class PickBeepScreen extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: true,
            beeperList: []
        }
    }

    async getBeeperList(): Promise<void> {
        try {
            const result = await fetch(config.apiUrl + "/rider/list");

            const data = await result.json();

            if (data.status === "success") {
                this.setState({ isLoading: false, beeperList: data.beeperList });
            }
            else {
                this.setState({ isLoading: handleFetchError(data.message) });
            }
        }
        catch (error){
            this.setState({ isLoading: handleFetchError(error) });
        }
    }

    componentDidMount(): void {
        this.getBeeperList();
    }

    goBack(id: string): void {
        const { navigation, route } = this.props;
        route.params.handlePick(id);
        navigation.goBack();
    }

    getDescription(item: any): string {
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

        const renderItem = ({ item }: any) => (
            //@ts-ignore
            <ListItem
                onPress={() => this.goBack(item.id)}
                title={`${item.first} ${item.last}`}
                description={this.getDescription(item)}
                accessoryRight={() => {
                    if (item.isStudent) {
                        return (
                            <Button appearance="outline" status="basic" size='tiny' accessoryRight={StudentIcon}>Student</Button>
                        );
                    }
                    return null;
                }}
                accessoryLeft={() => {
                    if (item.photoUrl) {
                        return (
                            <ProfilePicture
                                size={50}
                                url={item.photoUrl}
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
                            subtitle={(this.state.beeperList.length == 1) ? `${this.state.beeperList.length} person is beeping` : `${this.state.beeperList.length} people are beeping`}
                            accessoryLeft={BackAction} 
                            accessoryRight={RefreshAction}
                        />
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
                        <TopNavigation
                            title='Beeper List'
                            subtitle={(this.state.beeperList.length == 1) ? `${this.state.beeperList.length} person is beeping` : `${this.state.beeperList.length} people are beeping`}
                            alignment='center'
                            accessoryLeft={BackAction}
                            accessoryRight={RefreshAction}
                        />
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
                    <TopNavigation
                        title='Beeper List'
                        subtitle={(this.state.beeperList.length == 1) ? `${this.state.beeperList.length} person is beeping` : `${this.state.beeperList.length} people are beeping`}
                        alignment='center'
                        accessoryLeft={BackAction}
                        accessoryRight={RefreshAction}
                    />
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
