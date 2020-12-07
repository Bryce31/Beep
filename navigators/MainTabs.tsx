import React, { Component } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FindBeepScreen } from './FindBeep';
import { SettingsScreen } from './Settings';
import StartBeepingScreen from '../routes/beep/StartBeeping';
import { BottomNavigation, BottomNavigationTab, Icon } from '@ui-kitten/components';
import { CarIcon, MapIcon, SettingsIcon } from '../utils/Icons';

const { Navigator, Screen } = createBottomTabNavigator();

const BottomTabBar = ({ navigation, state }) => (
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
                <Screen name='Get a Beep' component={FindBeepScreen}/>
                <Screen name='Start Beeping' component={StartBeepingScreen} />
                <Screen name='Settings' component={SettingsScreen}/>
            </Navigator>
        );
    }
}
