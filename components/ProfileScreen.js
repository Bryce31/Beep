import React, { Component } from "react";
import { StyleSheet } from "react-native"
import { Button, Spinner, Text, Layout, TopNavigation, TopNavigationAction } from "@ui-kitten/components";
import { BackIcon, ReportIcon } from "../utils/Icons";
import { config } from "../utils/config";

export class ProfileScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            user: {}
        };
    }

    getUser() {
        fetch(config.apiUrl + "/user/" + this.props.route.params.id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            response.json().then(data => {
                this.setState({isLoading: false, user: data.user});
            });
        })
        .catch((error) => {
            console.log(error);
        });
    }
    
    handleReport() {
        this.props.navigation.navigate("Report", {
            id: this.props.route.params.id,
            first: this.state.user.first,
            last: this.state.user.last
        });
    }
    
    componentDidMount() {
        this.getUser();
    }

    render () {
        const BackAction = () => (
            <TopNavigationAction icon={BackIcon} onPress={() => this.props.navigation.goBack()}/>
        );

        if (this.state.isLoading) {
            return (
                <>
                    <TopNavigation title='User Profile' alignment='center' accessoryLeft={BackAction}/>
                    <Layout style={styles.spinnerContainer}>            
                        <Spinner size='large' />
                    </Layout>
                </>
            );
        }
        else {
            const user = this.state.user;

            return (
                <>
                    <TopNavigation title='User Profile' alignment='center' accessoryLeft={BackAction}/>
                    <Layout style={styles.container}>            
                        <Text style={styles.item} category="h1">{user.first} {user.last}</Text>

                        {user.isBeeping && <Text style={styles.item} >{user.first} is beeping 🚗</Text>}

                        {user.isStudent && <Text style={styles.item} >{user.first} is a student 🎓</Text>}

                        {user.masksRequired && <Text style={styles.item} >{user.first} requires a mask 😷</Text>}
                        
                        <Layout style={styles.data}>
                            {user.isBeeping && 
                                <Layout style={styles.group}>
                                    <Text category="h6" style={styles.groupLabel}>Queue Size</Text>
                                    <Text>{user.queueSize}</Text>
                                </Layout>
                            }

                            <Layout style={styles.group}>
                                <Text category="h6" style={styles.groupLabel}>Venmo</Text>
                                <Text>@{user.venmo}</Text>
                            </Layout>

                            <Layout style={styles.group}>
                                <Text category="h6" style={styles.groupLabel}>Capacity</Text>
                                <Text>{user.capacity}</Text>
                            </Layout>

                            <Layout style={styles.group}>
                                <Text category="h6" style={styles.groupLabel}>Singles Rate</Text>
                                <Text>${user.singlesRate}</Text>
                            </Layout>

                            <Layout style={styles.group}>
                                <Text category="h6" style={styles.groupLabel}>Group Rate</Text>
                                <Text>${user.groupRate}</Text>
                            </Layout>
                        </Layout>
                        <Button onPress={() => this.handleReport()} accessoryRight={ReportIcon} style={styles.button}>Report User</Button>
                    </Layout>
                </>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1 ,
        alignItems: "center",
    },
    spinnerContainer: {
        height: '100%',
        width: '100%',
        alignItems: "center",
        justifyContent: 'center'
    },
    group: {
        flexDirection: "row",
        marginBottom: 6
    },
    groupLabel: {
        width: 150
    },
    data: {
        width: 250,
    },
    item: {
        marginBottom: 10
    },
    button: {
        width: "80%",
        marginTop: 20
    }
});
