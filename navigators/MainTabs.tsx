import React, { Component } from 'react';
import { BottomTabNavigationProp, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FindBeepScreen } from './FindBeep';
import { SettingsScreen } from './Settings';
import { StartBeepingScreen } from '../routes/beep/StartBeeping';
import { BottomNavigation, BottomNavigationTab } from '@ui-kitten/components';
import { CarIcon, MapIcon, SettingsIcon } from '../utils/Icons';

export type MainNavParamList = {
    Ride: undefined;
    Beep: undefined;
    Settings: undefined;
    MainFindBeepScreen: undefined;
    PickBeepScreen: { handlePick: (id: string) => Promise<void> } | undefined;
    Profile: { id: string | undefined} | undefined;
    EditProfileScreen: undefined;
    ProfilePhotoScreen: undefined;
    ChangePasswordScreen: undefined;
    RideLogScreen: undefined;
}

interface NavState {
    index: number;
    routeNames: [];
}

const { Navigator, Screen } = createBottomTabNavigator<MainNavParamList>();


const BottomTabBar = ({ navigation, state }: { navigation: BottomTabNavigationProp<MainNavParamList>, state: NavState}) => (
    <BottomNavigation
        selectedIndex={state.index}
        onSelect={index => navigation.navigate(state.routeNames[index])}
    >
        <BottomNavigationTab icon={MapIcon} title='Find a Beep'/>
        <BottomNavigationTab icon={CarIcon} title='Start Beeping'/>
        <BottomNavigationTab icon={SettingsIcon} title='Dashboard'/>
  </BottomNavigation>
);

export class MainTabs extends Component {
    render() {
       return (
            <Navigator tabBar={props => <BottomTabBar {...props} />}>
                <Screen name='Ride' component={FindBeepScreen}/>
                <Screen name='Beep' component={StartBeepingScreen} />
                <Screen name='Settings' component={SettingsScreen}/>
            </Navigator>
        );
    }
}
