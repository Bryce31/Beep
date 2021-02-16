import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  getUser: User;
  getUsers: Array<User>;
  getRideHistory: Array<Beep>;
  getBeepHistory: Array<Beep>;
  getQueue: Array<QueueEntry>;
  findBeep: User;
  getRiderStatus: QueueEntry;
  getBeeperList: Array<User>;
  getBeeps: Array<Beep>;
  getBeep: Array<Beep>;
  getReports: Array<Report>;
  getReport: Array<Report>;
  getDirections: Scalars['String'];
};


export type QueryGetUserArgs = {
  id: Scalars['String'];
};


export type QueryGetUsersArgs = {
  offset?: Maybe<Scalars['Int']>;
  show?: Maybe<Scalars['Int']>;
};


export type QueryGetRideHistoryArgs = {
  id: Scalars['String'];
};


export type QueryGetBeepHistoryArgs = {
  id: Scalars['String'];
};


export type QueryGetQueueArgs = {
  id?: Maybe<Scalars['String']>;
};


export type QueryGetBeepsArgs = {
  offset?: Maybe<Scalars['Int']>;
  show?: Maybe<Scalars['Int']>;
};


export type QueryGetReportsArgs = {
  offset?: Maybe<Scalars['Int']>;
  show?: Maybe<Scalars['Int']>;
};


export type QueryGetDirectionsArgs = {
  end: Scalars['String'];
  start: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['String'];
  first: Scalars['String'];
  last: Scalars['String'];
  username: Scalars['String'];
  email: Scalars['String'];
  phone: Scalars['String'];
  venmo: Scalars['String'];
  password: Scalars['String'];
  isBeeping: Scalars['Boolean'];
  isEmailVerified: Scalars['Boolean'];
  isStudent: Scalars['Boolean'];
  groupRate: Scalars['Float'];
  singlesRate: Scalars['Float'];
  capacity: Scalars['Float'];
  masksRequired: Scalars['Boolean'];
  queueSize: Scalars['Float'];
  role: Scalars['String'];
  pushToken?: Maybe<Scalars['String']>;
  photoUrl?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  queue: Array<QueueEntry>;
};

export type QueueEntry = {
  __typename?: 'QueueEntry';
  id: Scalars['String'];
  origin: Scalars['String'];
  destination: Scalars['String'];
  state: Scalars['Float'];
  isAccepted: Scalars['Boolean'];
  groupSize: Scalars['Float'];
  timeEnteredQueue: Scalars['Float'];
  beeper: User;
  rider: User;
  ridersQueuePosition: Scalars['Float'];
  location?: Maybe<Location>;
};

export type Location = {
  __typename?: 'Location';
  id: Scalars['String'];
  user: User;
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
  altitude: Scalars['Float'];
  accuracy: Scalars['Float'];
  altitudeAccuracy: Scalars['Float'];
  heading: Scalars['Float'];
  speed: Scalars['Float'];
  timestamp: Scalars['Float'];
};

export type Beep = {
  __typename?: 'Beep';
  id: Scalars['String'];
  beeper: User;
  rider: User;
  origin: Scalars['String'];
  destination: Scalars['String'];
  state: Scalars['Float'];
  isAccepted: Scalars['Boolean'];
  groupSize: Scalars['Float'];
  timeEnteredQueue: Scalars['Float'];
  doneTime: Scalars['Float'];
};

export type Report = {
  __typename?: 'Report';
  id: Scalars['String'];
  reporter: User;
  reported: User;
  handledBy?: Maybe<User>;
  reason: Scalars['String'];
  notes: Scalars['String'];
  timestamp: Scalars['Float'];
  handled: Scalars['Boolean'];
  beep: Beep;
};

export type Mutation = {
  __typename?: 'Mutation';
  removeUser: Scalars['Boolean'];
  editUser: User;
  chooseBeep: QueueEntry;
  riderLeaveQueue: Scalars['Boolean'];
  setBeeperStatus: User;
  setBeeperQueue: Scalars['Boolean'];
  reportUser: Scalars['Boolean'];
  updateReport: Report;
  deleteReport: Scalars['Boolean'];
  login: Auth;
  signup: Auth;
  logout: Scalars['Boolean'];
  removeToken: Scalars['Boolean'];
  forgotPassword: Scalars['Boolean'];
  resetPassword: Scalars['Boolean'];
  editAccount: User;
  changePassword: Scalars['Boolean'];
  updatePushToken: Scalars['Boolean'];
  verifyAccount: User;
  resendEmailVarification: Scalars['Boolean'];
  deleteAccount: Scalars['Boolean'];
};


export type MutationRemoveUserArgs = {
  id: Scalars['String'];
};


export type MutationEditUserArgs = {
  data: EditUserValidator;
  id: Scalars['String'];
};


export type MutationChooseBeepArgs = {
  input: GetBeepInput;
  beeperId: Scalars['String'];
};


export type MutationSetBeeperStatusArgs = {
  input: BeeperSettingsInput;
};


export type MutationSetBeeperQueueArgs = {
  input: UpdateQueueEntryInput;
};


export type MutationReportUserArgs = {
  input: ReportInput;
};


export type MutationUpdateReportArgs = {
  input: UpdateReportInput;
  id: Scalars['String'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationSignupArgs = {
  input: SignUpInput;
};


export type MutationLogoutArgs = {
  isApp?: Maybe<Scalars['Boolean']>;
};


export type MutationRemoveTokenArgs = {
  token: Scalars['String'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String'];
};


export type MutationResetPasswordArgs = {
  password: Scalars['String'];
  id: Scalars['String'];
};


export type MutationEditAccountArgs = {
  input: EditAccountInput;
};


export type MutationChangePasswordArgs = {
  password: Scalars['String'];
};


export type MutationUpdatePushTokenArgs = {
  pushToken: Scalars['String'];
};


export type MutationVerifyAccountArgs = {
  id: Scalars['String'];
};

export type EditUserValidator = {
  first?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  venmo?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  isBeeping?: Maybe<Scalars['Boolean']>;
  isEmailVerified?: Maybe<Scalars['Boolean']>;
  isStudent?: Maybe<Scalars['Boolean']>;
  groupRate?: Maybe<Scalars['Float']>;
  singlesRate?: Maybe<Scalars['Float']>;
  capacity?: Maybe<Scalars['Float']>;
  masksRequired?: Maybe<Scalars['Boolean']>;
  queueSize?: Maybe<Scalars['Float']>;
  role?: Maybe<Scalars['String']>;
  pushToken?: Maybe<Scalars['String']>;
};

export type GetBeepInput = {
  origin: Scalars['String'];
  destination: Scalars['String'];
  groupSize: Scalars['Float'];
};

export type BeeperSettingsInput = {
  singlesRate?: Maybe<Scalars['Float']>;
  groupRate?: Maybe<Scalars['Float']>;
  capacity?: Maybe<Scalars['Float']>;
  isBeeping?: Maybe<Scalars['Boolean']>;
  masksRequired?: Maybe<Scalars['Boolean']>;
};

export type UpdateQueueEntryInput = {
  value: Scalars['String'];
  riderId: Scalars['String'];
  queueId: Scalars['String'];
};

export type ReportInput = {
  userId: Scalars['String'];
  reason: Scalars['String'];
  beepId?: Maybe<Scalars['String']>;
};

export type UpdateReportInput = {
  handled?: Maybe<Scalars['Boolean']>;
  notes?: Maybe<Scalars['String']>;
};

export type Auth = {
  __typename?: 'Auth';
  user: User;
  tokens: TokenEntry;
};

export type TokenEntry = {
  __typename?: 'TokenEntry';
  id: Scalars['String'];
  tokenid: Scalars['String'];
  user: User;
};

export type LoginInput = {
  username: Scalars['String'];
  password: Scalars['String'];
  pushToken?: Maybe<Scalars['String']>;
};

export type SignUpInput = {
  username: Scalars['String'];
  first: Scalars['String'];
  last: Scalars['String'];
  phone: Scalars['String'];
  email: Scalars['String'];
  venmo: Scalars['String'];
  password: Scalars['String'];
  pushToken?: Maybe<Scalars['String']>;
};

export type EditAccountInput = {
  first?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  venmo?: Maybe<Scalars['String']>;
};

export type LoginMutationVariables = Exact<{
  username: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'Auth' }
    & { user: (
      { __typename?: 'User' }
      & Pick<User, 'id' | 'first' | 'last' | 'username' | 'email' | 'phone' | 'venmo' | 'isBeeping' | 'isEmailVerified' | 'isStudent' | 'groupRate' | 'singlesRate' | 'capacity' | 'masksRequired' | 'queueSize' | 'role' | 'photoUrl' | 'name'>
    ), tokens: (
      { __typename?: 'TokenEntry' }
      & Pick<TokenEntry, 'id' | 'tokenid'>
    ) }
  ) }
);

export type GetQueueQueryVariables = Exact<{ [key: string]: never; }>;


export type GetQueueQuery = (
  { __typename?: 'Query' }
  & { getQueue: Array<(
    { __typename?: 'QueueEntry' }
    & Pick<QueueEntry, 'id' | 'isAccepted' | 'groupSize' | 'origin' | 'destination' | 'state'>
    & { rider: (
      { __typename?: 'User' }
      & Pick<User, 'id' | 'name' | 'first' | 'last' | 'venmo' | 'phone'>
    ) }
  )> }
);

export type UpdateBeepSettingsMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateBeepSettingsMutation = (
  { __typename?: 'Mutation' }
  & { setBeeperStatus: (
    { __typename?: 'User' }
    & { queue: Array<(
      { __typename?: 'QueueEntry' }
      & Pick<QueueEntry, 'id'>
    )> }
  ) }
);

export type GetUserQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetUserQuery = (
  { __typename?: 'Query' }
  & { getUser: (
    { __typename?: 'User' }
    & Pick<User, 'id' | 'first' | 'last' | 'isBeeping' | 'isStudent' | 'role' | 'venmo' | 'singlesRate' | 'groupRate' | 'capacity' | 'masksRequired' | 'photoUrl' | 'queueSize'>
  ) }
);

export type GetRiderStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRiderStatusQuery = (
  { __typename?: 'Query' }
  & { getRiderStatus: (
    { __typename?: 'QueueEntry' }
    & Pick<QueueEntry, 'id' | 'ridersQueuePosition' | 'isAccepted' | 'origin' | 'destination' | 'state' | 'groupSize'>
    & { location?: Maybe<(
      { __typename?: 'Location' }
      & Pick<Location, 'longitude' | 'latitude'>
    )>, beeper: (
      { __typename?: 'User' }
      & Pick<User, 'id' | 'first' | 'last' | 'singlesRate' | 'groupRate' | 'isStudent' | 'role' | 'venmo' | 'username' | 'phone' | 'photoUrl' | 'masksRequired' | 'capacity' | 'queueSize'>
    ) }
  ) }
);

export type ChooseBeepMutationVariables = Exact<{ [key: string]: never; }>;


export type ChooseBeepMutation = (
  { __typename?: 'Mutation' }
  & { chooseBeep: (
    { __typename?: 'QueueEntry' }
    & Pick<QueueEntry, 'id' | 'ridersQueuePosition' | 'isAccepted' | 'origin' | 'destination' | 'state' | 'groupSize'>
    & { location?: Maybe<(
      { __typename?: 'Location' }
      & Pick<Location, 'longitude' | 'latitude'>
    )>, beeper: (
      { __typename?: 'User' }
      & Pick<User, 'id' | 'first' | 'last' | 'singlesRate' | 'groupRate' | 'isStudent' | 'role' | 'venmo' | 'username' | 'phone' | 'photoUrl' | 'masksRequired' | 'capacity' | 'queueSize'>
    ) }
  ) }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
);


export const LoginDocument = gql`
    mutation Login($username: String!, $password: String!) {
  login(input: {username: $username, password: $password}) {
    user {
      id
      first
      last
      username
      email
      phone
      venmo
      isBeeping
      isEmailVerified
      isStudent
      groupRate
      singlesRate
      capacity
      masksRequired
      queueSize
      role
      photoUrl
      name
    }
    tokens {
      id
      tokenid
    }
  }
}
    `;
export type LoginMutationFn = ApolloReactCommon.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, baseOptions);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = ApolloReactCommon.MutationResult<LoginMutation>;
export type LoginMutationOptions = ApolloReactCommon.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const GetQueueDocument = gql`
    query GetQueue {
  getQueue {
    id
    isAccepted
    groupSize
    origin
    destination
    state
    rider {
      id
      name
      first
      last
      venmo
      phone
    }
  }
}
    `;

/**
 * __useGetQueueQuery__
 *
 * To run a query within a React component, call `useGetQueueQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQueueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQueueQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetQueueQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetQueueQuery, GetQueueQueryVariables>) {
        return ApolloReactHooks.useQuery<GetQueueQuery, GetQueueQueryVariables>(GetQueueDocument, baseOptions);
      }
export function useGetQueueLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetQueueQuery, GetQueueQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<GetQueueQuery, GetQueueQueryVariables>(GetQueueDocument, baseOptions);
        }
export type GetQueueQueryHookResult = ReturnType<typeof useGetQueueQuery>;
export type GetQueueLazyQueryHookResult = ReturnType<typeof useGetQueueLazyQuery>;
export type GetQueueQueryResult = ApolloReactCommon.QueryResult<GetQueueQuery, GetQueueQueryVariables>;
export const UpdateBeepSettingsDocument = gql`
    mutation UpdateBeepSettings {
  setBeeperStatus(
    input: {singlesRate: 1, groupRate: 1, capacity: 9, isBeeping: false, masksRequired: true}
  ) {
    queue {
      id
    }
  }
}
    `;
export type UpdateBeepSettingsMutationFn = ApolloReactCommon.MutationFunction<UpdateBeepSettingsMutation, UpdateBeepSettingsMutationVariables>;

/**
 * __useUpdateBeepSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateBeepSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateBeepSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateBeepSettingsMutation, { data, loading, error }] = useUpdateBeepSettingsMutation({
 *   variables: {
 *   },
 * });
 */
export function useUpdateBeepSettingsMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateBeepSettingsMutation, UpdateBeepSettingsMutationVariables>) {
        return ApolloReactHooks.useMutation<UpdateBeepSettingsMutation, UpdateBeepSettingsMutationVariables>(UpdateBeepSettingsDocument, baseOptions);
      }
export type UpdateBeepSettingsMutationHookResult = ReturnType<typeof useUpdateBeepSettingsMutation>;
export type UpdateBeepSettingsMutationResult = ApolloReactCommon.MutationResult<UpdateBeepSettingsMutation>;
export type UpdateBeepSettingsMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateBeepSettingsMutation, UpdateBeepSettingsMutationVariables>;
export const GetUserDocument = gql`
    query GetUser($id: String!) {
  getUser(id: $id) {
    id
    first
    last
    isBeeping
    isStudent
    role
    venmo
    singlesRate
    groupRate
    capacity
    masksRequired
    photoUrl
    queueSize
  }
}
    `;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
        return ApolloReactHooks.useQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, baseOptions);
      }
export function useGetUserLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, baseOptions);
        }
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserQueryResult = ApolloReactCommon.QueryResult<GetUserQuery, GetUserQueryVariables>;
export const GetRiderStatusDocument = gql`
    query GetRiderStatus {
  getRiderStatus {
    id
    ridersQueuePosition
    isAccepted
    origin
    destination
    state
    groupSize
    location {
      longitude
      latitude
    }
    beeper {
      id
      first
      last
      singlesRate
      groupRate
      isStudent
      role
      venmo
      username
      phone
      photoUrl
      masksRequired
      capacity
      queueSize
    }
  }
}
    `;

/**
 * __useGetRiderStatusQuery__
 *
 * To run a query within a React component, call `useGetRiderStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRiderStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRiderStatusQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRiderStatusQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetRiderStatusQuery, GetRiderStatusQueryVariables>) {
        return ApolloReactHooks.useQuery<GetRiderStatusQuery, GetRiderStatusQueryVariables>(GetRiderStatusDocument, baseOptions);
      }
export function useGetRiderStatusLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetRiderStatusQuery, GetRiderStatusQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<GetRiderStatusQuery, GetRiderStatusQueryVariables>(GetRiderStatusDocument, baseOptions);
        }
export type GetRiderStatusQueryHookResult = ReturnType<typeof useGetRiderStatusQuery>;
export type GetRiderStatusLazyQueryHookResult = ReturnType<typeof useGetRiderStatusLazyQuery>;
export type GetRiderStatusQueryResult = ApolloReactCommon.QueryResult<GetRiderStatusQuery, GetRiderStatusQueryVariables>;
export const ChooseBeepDocument = gql`
    mutation ChooseBeep {
  chooseBeep(
    beeperId: "string"
    input: {origin: "test", destination: "test", groupSize: 1}
  ) {
    id
    ridersQueuePosition
    isAccepted
    origin
    destination
    state
    groupSize
    location {
      longitude
      latitude
    }
    beeper {
      id
      first
      last
      singlesRate
      groupRate
      isStudent
      role
      venmo
      username
      phone
      photoUrl
      masksRequired
      capacity
      queueSize
    }
  }
}
    `;
export type ChooseBeepMutationFn = ApolloReactCommon.MutationFunction<ChooseBeepMutation, ChooseBeepMutationVariables>;

/**
 * __useChooseBeepMutation__
 *
 * To run a mutation, you first call `useChooseBeepMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChooseBeepMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [chooseBeepMutation, { data, loading, error }] = useChooseBeepMutation({
 *   variables: {
 *   },
 * });
 */
export function useChooseBeepMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ChooseBeepMutation, ChooseBeepMutationVariables>) {
        return ApolloReactHooks.useMutation<ChooseBeepMutation, ChooseBeepMutationVariables>(ChooseBeepDocument, baseOptions);
      }
export type ChooseBeepMutationHookResult = ReturnType<typeof useChooseBeepMutation>;
export type ChooseBeepMutationResult = ApolloReactCommon.MutationResult<ChooseBeepMutation>;
export type ChooseBeepMutationOptions = ApolloReactCommon.BaseMutationOptions<ChooseBeepMutation, ChooseBeepMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout(isApp: true)
}
    `;
export type LogoutMutationFn = ApolloReactCommon.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        return ApolloReactHooks.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, baseOptions);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = ApolloReactCommon.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = ApolloReactCommon.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;