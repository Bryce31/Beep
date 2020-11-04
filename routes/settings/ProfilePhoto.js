import React, { Component } from 'react';
import { Platform, Image, StyleSheet } from 'react-native';
import { Text, Layout, Button, Input, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { UserContext } from '../../utils/UserContext.js';
import { config } from "../../utils/config";
import { LoadingIndicator } from "../../utils/Icons";
import { parseError, handleStatusCodeError, handleFetchError } from "../../utils/Errors";
import { BackIcon } from '../../utils/Icons';
import AsyncStorage from '@react-native-community/async-storage';
import * as ImagePicker from 'expo-image-picker';

export class ProfilePhotoScreen extends Component {
    static contextType = UserContext;
    
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            photo: null
        };
    }

   async handleUpdate() {
       //send button into loading state
       this.setState({ isLoading: true });

       let form = new FormData();

       let result = await ImagePicker.launchImageLibraryAsync({
           mediaTypes: ImagePicker.MediaTypeOptions.Images,
           allowsMultipleSelection: false,
           base64: false
       });

       if (Platform.OS !== "ios" || Platform.OS !== "android") {
           await fetch(result.uri)
               .then(res => res.blob())
               .then(blob => {
                   const file = new File([blob], "filename.jpeg");
                   form.append('photo', file)
               });
       }
       else {
           console.log(result);
           this.setState({photo: result.uri});

           const photo = {
               uri: result.uri,
               type: 'image/jpeg',
               name: 'photo.jpg',
           };

           if (!result.cancelled) {
               form.append("photo", photo);
               //form.append("photo", photo.uri);
           }
       }

       fetch(config.apiUrl + "/files/upload", {
           method: "POST",
           headers: {
               //'Content-Type': `multipart/form-data`,
               "Authorization": "Bearer " + this.context.user.token
           },
           body: form
       })
           .then(response => {
               if (response.status !== 200) {
                   return this.setState({ isLoading: handleStatusCodeError(response) });
               }

               response.json().then(data => {
                   if (data.status === "success") {
                       //make a copy of the current user
                       let tempUser = this.context.user;

                       //update the tempUser with the new data
                       tempUser.photoUrl = data.url;

                       //update the context
                       this.context.setUser(tempUser);

                       //put the tempUser back into storage
                       AsyncStorage.setItem('@user', JSON.stringify(tempUser));

                       //on success, go back to settings page
                       this.props.navigation.goBack();
                   }
                   else {
                       alert(parseError(data.message));
                   }
               });
           })
           .catch((error) => {
               this.setState({ isLoading: handleFetchError(error) });
           });
    }

    render () {
        const BackAction = () => (
            <TopNavigationAction icon={BackIcon} onPress={() => this.props.navigation.goBack()}/>
        );
        if (!this.state.isLoading) {
            return (
                <>
                    <TopNavigation title='Profile Photo' alignment='center' accessoryLeft={BackAction}/>
                    <Layout style={styles.container}>
                        <Text>Upload Profile Photo</Text>
                        {this.state.photo && <Image source={{ uri: this.state.photo }} style={{ width: 200, height: 200 }} />}
                        <Button onPress={() => this.handleUpdate()}>
                            Choose Photo
                        </Button>
                    </Layout>
                </>
            );
        }
        else {
            return (
                <>
                    <TopNavigation title='Profile Photo' alignment='center' accessoryLeft={BackAction}/>
                    <Layout style={styles.container}>
                        <LoadingIndicator />
                    </Layout>
                </>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    form: {
        justifyContent: "center",
        width: "83%",
        marginTop: 20,
    }
});
