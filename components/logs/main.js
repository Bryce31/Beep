import React from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Tab, TabView, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { BeeperRideLogScreen } from "./beeper";
import { RiderRideLogScreen } from "./rider";
import { BackIcon } from '../../utils/Icons';


export const TabViewSimpleUsageShowcase = ({ navigation }) => {

    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const BackAction = () => (
        <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()}/>
    );

    return (
        <>
            <TopNavigation
                title='Beep Logs' 
                alignment='center' 
                accessoryLeft={BackAction} 
            />
            <Layout style={styles.conatiner}>
                <TabView
                    selectedIndex={selectedIndex}
                    onSelect={index => setSelectedIndex(index)}>
                    <Tab title='Beeps'>
                        <Layout style={styles.tabContainer}>
                            <BeeperRideLogScreen />
                        </Layout>
                    </Tab>
                    <Tab title='Rides'>
                        <Layout style={styles.tabContainer}>
                            <RiderRideLogScreen />
                        </Layout>
                    </Tab>
                </TabView>
            </Layout>
        </>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        height: "100%",
        width: "100%",
    },
    conatiner: {
        height: "100%",
        width: "100%",
    }
});
