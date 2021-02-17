import React, { Component, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Button, Input, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { UserContext } from '../../utils/UserContext';
import { config } from "../../utils/config";
import { EditIcon, LoadingIndicator } from "../../utils/Icons";
import { handleFetchError } from "../../utils/Errors";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { BackIcon } from '../../utils/Icons';
import AsyncStorage from '@react-native-community/async-storage';
import { Formik } from 'formik';
import { gql, useMutation } from '@apollo/client';
import { EditAccountMutation } from '../../generated/graphql';

interface Props {
    navigation: any;
}

const EditAccount = gql`
    mutation EditAccount($first: String, $last: String, $email: String, $phone: String, $venmo: String) {
        editAccount (
            input: {
                first : $first,
                last: $last,
                email: $email,
                phone: $phone,
                venmo: $venmo
            }
        ) {
        id
        name
        }
    }
  `;


export function EditProfileScreen(props: Props) {
    const userContext = useContext(UserContext);
    const [edit, { data, loading, error }] = useMutation<EditAccountMutation>(EditAccount);

    function handleUpdate() {

    }

        const BackAction = () => (
            <TopNavigationAction icon={BackIcon} onPress={() => props.navigation.goBack()}/>
        );

        return (
            <>
                <TopNavigation title='Edit Profile' alignment='center' accessoryLeft={BackAction}/>
                <Layout style={{flex: 1}}>
                <KeyboardAwareScrollView scrollEnabled={false} extraScrollHeight={70}>
                <Layout style={styles.container}>
                    <Formik
                            initialValues={{
                                first: userContext?.user?.user.first,
                                last: userContext?.user?.user.last,
                                email: userContext?.user?.user.email,
                                phone: userContext?.user?.user.phone,
                                venmo: userContext?.user?.user.venmo,
                                username: userContext?.user?.user.username
                            }}
                            onSubmit={async (values, { setSubmitting }) => {
                                const result = await edit({ variables: values });
                                setSubmitting(false);
                            }}
                        >
                            {({
                                values,
                                errors,
                                touched,
                                handleChange,
                                handleBlur,
                                handleSubmit,
                                isSubmitting,
                            }) => (
                                <form onSubmit={handleSubmit}>
                                    <input
                                        type="text"
                                        name="first"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.first}
                                    />
                                    {errors.first && touched.first && errors.first}
                                    <input
                                        type="text"
                                        name="last"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.last}
                                    />
                                    {errors.last && touched.last && errors.last}
                                    <input
                                        type="text"
                                        name="email"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.email}
                                    />
                                    {errors.email && touched.email && errors.email}
                                    <input
                                        type="text"
                                        name="phone"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.phone}
                                    />
                                    {errors.phone && touched.phone && errors.phone}
                                    <input
                                        type="text"
                                        name="phone"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.venmo}
                                    />
                                    {errors.venmo && touched.venmo && errors.venmo}
                                    <input
                                        type="text"
                                        name="username"
                                        onBlur={handleBlur}
                                        value={values.username}
                                        disabled
                                    />
                                    {errors.username && touched.username && errors.username}
                                    <button type="submit" disabled={isSubmitting}>
                                        Submit
                                    </button>
                                </form>
                            )}
                        </Formik>
                </Layout>
                </KeyboardAwareScrollView>
                </Layout>
            </>
        );
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
