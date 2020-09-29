import React, { Component } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainSettingsScreen } from './MainSettings'
import { EditProfileScreen } from './EditProfile'
import { ChangePasswordScreen } from './ChangePassword'
import { TabViewSimpleUsageShowcase } from './logs/main'

const Stack = createStackNavigator();

export class SettingsScreen extends Component {
    render () {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }} >
                <Stack.Screen name="MainSettingsScreen" component={MainSettingsScreen} />
                <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
                <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
                <Stack.Screen name="RideLogScreen" component={TabViewSimpleUsageShowcase} />
            </Stack.Navigator>
        );
    }
}
