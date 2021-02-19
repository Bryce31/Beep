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
  getUserRating: Array<Rating>;
};


export type QueryGetUserArgs = {
  id: Scalars['String'];
};


export type QueryGetUsersArgs = {
  offset?: Maybe<Scalars['Int']>;
  show?: Maybe<Scalars['Int']>;
};


export type QueryGetRideHistoryArgs = {
  id?: Maybe<Scalars['String']>;
};


export type QueryGetBeepHistoryArgs = {
  id?: Maybe<Scalars['String']>;
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


export type QueryGetUserRatingArgs = {
  id: Scalars['String'];
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

export type Rating = {
  __typename?: 'Rating';
  id: Scalars['String'];
  rater: User;
  rated: User;
  stars: Scalars['Float'];
  message: Scalars['String'];
  timestamp: Scalars['Float'];
  beep: Beep;
};

export type Mutation = {
  __typename?: 'Mutation';
  removeUser: Scalars['Boolean'];
  editUser: User;
  chooseBeep: QueueEntry;
  riderLeaveQueue: Scalars['Boolean'];
  setBeeperStatus: Scalars['Boolean'];
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
  rateUser: Scalars['Boolean'];
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


export type MutationRateUserArgs = {
  input: RatingInput;
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

export type RatingInput = {
  userId: Scalars['String'];
  stars: Scalars['Float'];
  message?: Maybe<Scalars['String']>;
  beepId?: Maybe<Scalars['String']>;
};

export type UpdateBeeperQueueMutationVariables = Exact<{
  queueId: Scalars['String'];
  riderId: Scalars['String'];
  value: Scalars['String'];
}>;


export type UpdateBeeperQueueMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'setBeeperQueue'>
);

export type ResendMutationVariables = Exact<{ [key: string]: never; }>;


export type ResendMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'resendEmailVarification'>
);

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type ForgotPasswordMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'forgotPassword'>
);

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
    & Pick<QueueEntry, 'id' | 'isAccepted' | 'groupSize' | 'origin' | 'destination' | 'state' | 'timeEnteredQueue'>
    & { rider: (
      { __typename?: 'User' }
      & Pick<User, 'id' | 'name' | 'first' | 'last' | 'venmo' | 'phone' | 'photoUrl'>
    ) }
  )> }
);

export type UpdateBeepSettingsMutationVariables = Exact<{
  singlesRate: Scalars['Float'];
  groupRate: Scalars['Float'];
  capacity: Scalars['Float'];
  isBeeping: Scalars['Boolean'];
  masksRequired: Scalars['Boolean'];
}>;


export type UpdateBeepSettingsMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'setBeeperStatus'>
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

export type ReportUserMutationVariables = Exact<{
  userId: Scalars['String'];
  reason: Scalars['String'];
  beepId?: Maybe<Scalars['String']>;
}>;


export type ReportUserMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'reportUser'>
);

export type GetBeepHistoryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBeepHistoryQuery = (
  { __typename?: 'Query' }
  & { getBeepHistory: Array<(
    { __typename?: 'Beep' }
    & Pick<Beep, 'id' | 'timeEnteredQueue' | 'doneTime' | 'groupSize' | 'origin' | 'destination'>
    & { rider: (
      { __typename?: 'User' }
      & Pick<User, 'id' | 'name' | 'first' | 'last' | 'photoUrl'>
    ) }
  )> }
);

export type GetRideHistoryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRideHistoryQuery = (
  { __typename?: 'Query' }
  & { getRideHistory: Array<(
    { __typename?: 'Beep' }
    & Pick<Beep, 'id' | 'timeEnteredQueue' | 'doneTime' | 'groupSize' | 'origin' | 'destination'>
    & { beeper: (
      { __typename?: 'User' }
      & Pick<User, 'id' | 'name' | 'first' | 'last' | 'photoUrl'>
    ) }
  )> }
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

export type ChooseBeepMutationVariables = Exact<{
  beeperId: Scalars['String'];
  origin: Scalars['String'];
  destination: Scalars['String'];
  groupSize: Scalars['Float'];
}>;


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

export type FindBeepQueryVariables = Exact<{ [key: string]: never; }>;


export type FindBeepQuery = (
  { __typename?: 'Query' }
  & { findBeep: (
    { __typename?: 'User' }
    & Pick<User, 'id' | 'first' | 'last' | 'isStudent' | 'singlesRate' | 'groupRate' | 'capacity' | 'queueSize' | 'photoUrl' | 'role'>
  ) }
);

export type LeaveQueueMutationVariables = Exact<{ [key: string]: never; }>;


export type LeaveQueueMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'riderLeaveQueue'>
);

export type GetBeepersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBeepersQuery = (
  { __typename?: 'Query' }
  & { getBeeperList: Array<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'first' | 'last' | 'isStudent' | 'singlesRate' | 'groupRate' | 'capacity' | 'queueSize' | 'photoUrl' | 'role'>
  )> }
);

export type ChangePasswordMutationVariables = Exact<{
  password: Scalars['String'];
}>;


export type ChangePasswordMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'changePassword'>
);

export type EditAccountMutationVariables = Exact<{
  first?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  venmo?: Maybe<Scalars['String']>;
}>;


export type EditAccountMutation = (
  { __typename?: 'Mutation' }
  & { editAccount: (
    { __typename?: 'User' }
    & Pick<User, 'id' | 'name'>
  ) }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
);


export const UpdateBeeperQueueDocument = gql`
    mutation UpdateBeeperQueue($queueId: String!, $riderId: String!, $value: String!) {
  setBeeperQueue(input: {queueId: $queueId, riderId: $riderId, value: $value})
}
    `;
export type UpdateBeeperQueueMutationFn = ApolloReactCommon.MutationFunction<UpdateBeeperQueueMutation, UpdateBeeperQueueMutationVariables>;

/**
 * __useUpdateBeeperQueueMutation__
 *
 * To run a mutation, you first call `useUpdateBeeperQueueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateBeeperQueueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateBeeperQueueMutation, { data, loading, error }] = useUpdateBeeperQueueMutation({
 *   variables: {
 *      queueId: // value for 'queueId'
 *      riderId: // value for 'riderId'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useUpdateBeeperQueueMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateBeeperQueueMutation, UpdateBeeperQueueMutationVariables>) {
        return ApolloReactHooks.useMutation<UpdateBeeperQueueMutation, UpdateBeeperQueueMutationVariables>(UpdateBeeperQueueDocument, baseOptions);
      }
export type UpdateBeeperQueueMutationHookResult = ReturnType<typeof useUpdateBeeperQueueMutation>;
export type UpdateBeeperQueueMutationResult = ApolloReactCommon.MutationResult<UpdateBeeperQueueMutation>;
export type UpdateBeeperQueueMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateBeeperQueueMutation, UpdateBeeperQueueMutationVariables>;
export const ResendDocument = gql`
    mutation Resend {
  resendEmailVarification
}
    `;
export type ResendMutationFn = ApolloReactCommon.MutationFunction<ResendMutation, ResendMutationVariables>;

/**
 * __useResendMutation__
 *
 * To run a mutation, you first call `useResendMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResendMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resendMutation, { data, loading, error }] = useResendMutation({
 *   variables: {
 *   },
 * });
 */
export function useResendMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ResendMutation, ResendMutationVariables>) {
        return ApolloReactHooks.useMutation<ResendMutation, ResendMutationVariables>(ResendDocument, baseOptions);
      }
export type ResendMutationHookResult = ReturnType<typeof useResendMutation>;
export type ResendMutationResult = ApolloReactCommon.MutationResult<ResendMutation>;
export type ResendMutationOptions = ApolloReactCommon.BaseMutationOptions<ResendMutation, ResendMutationVariables>;
export const ForgotPasswordDocument = gql`
    mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}
    `;
export type ForgotPasswordMutationFn = ApolloReactCommon.MutationFunction<ForgotPasswordMutation, ForgotPasswordMutationVariables>;

/**
 * __useForgotPasswordMutation__
 *
 * To run a mutation, you first call `useForgotPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useForgotPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [forgotPasswordMutation, { data, loading, error }] = useForgotPasswordMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useForgotPasswordMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ForgotPasswordMutation, ForgotPasswordMutationVariables>) {
        return ApolloReactHooks.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(ForgotPasswordDocument, baseOptions);
      }
export type ForgotPasswordMutationHookResult = ReturnType<typeof useForgotPasswordMutation>;
export type ForgotPasswordMutationResult = ApolloReactCommon.MutationResult<ForgotPasswordMutation>;
export type ForgotPasswordMutationOptions = ApolloReactCommon.BaseMutationOptions<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
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
    timeEnteredQueue
    rider {
      id
      name
      first
      last
      venmo
      phone
      photoUrl
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
    mutation UpdateBeepSettings($singlesRate: Float!, $groupRate: Float!, $capacity: Float!, $isBeeping: Boolean!, $masksRequired: Boolean!) {
  setBeeperStatus(
    input: {singlesRate: $singlesRate, groupRate: $groupRate, capacity: $capacity, isBeeping: $isBeeping, masksRequired: $masksRequired}
  )
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
 *      singlesRate: // value for 'singlesRate'
 *      groupRate: // value for 'groupRate'
 *      capacity: // value for 'capacity'
 *      isBeeping: // value for 'isBeeping'
 *      masksRequired: // value for 'masksRequired'
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
export const ReportUserDocument = gql`
    mutation ReportUser($userId: String!, $reason: String!, $beepId: String) {
  reportUser(input: {userId: $userId, reason: $reason, beepId: $beepId})
}
    `;
export type ReportUserMutationFn = ApolloReactCommon.MutationFunction<ReportUserMutation, ReportUserMutationVariables>;

/**
 * __useReportUserMutation__
 *
 * To run a mutation, you first call `useReportUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReportUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reportUserMutation, { data, loading, error }] = useReportUserMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      reason: // value for 'reason'
 *      beepId: // value for 'beepId'
 *   },
 * });
 */
export function useReportUserMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ReportUserMutation, ReportUserMutationVariables>) {
        return ApolloReactHooks.useMutation<ReportUserMutation, ReportUserMutationVariables>(ReportUserDocument, baseOptions);
      }
export type ReportUserMutationHookResult = ReturnType<typeof useReportUserMutation>;
export type ReportUserMutationResult = ApolloReactCommon.MutationResult<ReportUserMutation>;
export type ReportUserMutationOptions = ApolloReactCommon.BaseMutationOptions<ReportUserMutation, ReportUserMutationVariables>;
export const GetBeepHistoryDocument = gql`
    query GetBeepHistory {
  getBeepHistory {
    id
    timeEnteredQueue
    doneTime
    groupSize
    origin
    destination
    rider {
      id
      name
      first
      last
      photoUrl
    }
  }
}
    `;

/**
 * __useGetBeepHistoryQuery__
 *
 * To run a query within a React component, call `useGetBeepHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBeepHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBeepHistoryQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetBeepHistoryQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetBeepHistoryQuery, GetBeepHistoryQueryVariables>) {
        return ApolloReactHooks.useQuery<GetBeepHistoryQuery, GetBeepHistoryQueryVariables>(GetBeepHistoryDocument, baseOptions);
      }
export function useGetBeepHistoryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetBeepHistoryQuery, GetBeepHistoryQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<GetBeepHistoryQuery, GetBeepHistoryQueryVariables>(GetBeepHistoryDocument, baseOptions);
        }
export type GetBeepHistoryQueryHookResult = ReturnType<typeof useGetBeepHistoryQuery>;
export type GetBeepHistoryLazyQueryHookResult = ReturnType<typeof useGetBeepHistoryLazyQuery>;
export type GetBeepHistoryQueryResult = ApolloReactCommon.QueryResult<GetBeepHistoryQuery, GetBeepHistoryQueryVariables>;
export const GetRideHistoryDocument = gql`
    query GetRideHistory {
  getRideHistory {
    id
    timeEnteredQueue
    doneTime
    groupSize
    origin
    destination
    beeper {
      id
      name
      first
      last
      photoUrl
    }
  }
}
    `;

/**
 * __useGetRideHistoryQuery__
 *
 * To run a query within a React component, call `useGetRideHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRideHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRideHistoryQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRideHistoryQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetRideHistoryQuery, GetRideHistoryQueryVariables>) {
        return ApolloReactHooks.useQuery<GetRideHistoryQuery, GetRideHistoryQueryVariables>(GetRideHistoryDocument, baseOptions);
      }
export function useGetRideHistoryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetRideHistoryQuery, GetRideHistoryQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<GetRideHistoryQuery, GetRideHistoryQueryVariables>(GetRideHistoryDocument, baseOptions);
        }
export type GetRideHistoryQueryHookResult = ReturnType<typeof useGetRideHistoryQuery>;
export type GetRideHistoryLazyQueryHookResult = ReturnType<typeof useGetRideHistoryLazyQuery>;
export type GetRideHistoryQueryResult = ApolloReactCommon.QueryResult<GetRideHistoryQuery, GetRideHistoryQueryVariables>;
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
    mutation ChooseBeep($beeperId: String!, $origin: String!, $destination: String!, $groupSize: Float!) {
  chooseBeep(
    beeperId: $beeperId
    input: {origin: $origin, destination: $destination, groupSize: $groupSize}
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
 *      beeperId: // value for 'beeperId'
 *      origin: // value for 'origin'
 *      destination: // value for 'destination'
 *      groupSize: // value for 'groupSize'
 *   },
 * });
 */
export function useChooseBeepMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ChooseBeepMutation, ChooseBeepMutationVariables>) {
        return ApolloReactHooks.useMutation<ChooseBeepMutation, ChooseBeepMutationVariables>(ChooseBeepDocument, baseOptions);
      }
export type ChooseBeepMutationHookResult = ReturnType<typeof useChooseBeepMutation>;
export type ChooseBeepMutationResult = ApolloReactCommon.MutationResult<ChooseBeepMutation>;
export type ChooseBeepMutationOptions = ApolloReactCommon.BaseMutationOptions<ChooseBeepMutation, ChooseBeepMutationVariables>;
export const FindBeepDocument = gql`
    query FindBeep {
  findBeep {
    id
    first
    last
    isStudent
    singlesRate
    groupRate
    capacity
    queueSize
    photoUrl
    role
  }
}
    `;

/**
 * __useFindBeepQuery__
 *
 * To run a query within a React component, call `useFindBeepQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindBeepQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindBeepQuery({
 *   variables: {
 *   },
 * });
 */
export function useFindBeepQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<FindBeepQuery, FindBeepQueryVariables>) {
        return ApolloReactHooks.useQuery<FindBeepQuery, FindBeepQueryVariables>(FindBeepDocument, baseOptions);
      }
export function useFindBeepLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<FindBeepQuery, FindBeepQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<FindBeepQuery, FindBeepQueryVariables>(FindBeepDocument, baseOptions);
        }
export type FindBeepQueryHookResult = ReturnType<typeof useFindBeepQuery>;
export type FindBeepLazyQueryHookResult = ReturnType<typeof useFindBeepLazyQuery>;
export type FindBeepQueryResult = ApolloReactCommon.QueryResult<FindBeepQuery, FindBeepQueryVariables>;
export const LeaveQueueDocument = gql`
    mutation LeaveQueue {
  riderLeaveQueue
}
    `;
export type LeaveQueueMutationFn = ApolloReactCommon.MutationFunction<LeaveQueueMutation, LeaveQueueMutationVariables>;

/**
 * __useLeaveQueueMutation__
 *
 * To run a mutation, you first call `useLeaveQueueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLeaveQueueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [leaveQueueMutation, { data, loading, error }] = useLeaveQueueMutation({
 *   variables: {
 *   },
 * });
 */
export function useLeaveQueueMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LeaveQueueMutation, LeaveQueueMutationVariables>) {
        return ApolloReactHooks.useMutation<LeaveQueueMutation, LeaveQueueMutationVariables>(LeaveQueueDocument, baseOptions);
      }
export type LeaveQueueMutationHookResult = ReturnType<typeof useLeaveQueueMutation>;
export type LeaveQueueMutationResult = ApolloReactCommon.MutationResult<LeaveQueueMutation>;
export type LeaveQueueMutationOptions = ApolloReactCommon.BaseMutationOptions<LeaveQueueMutation, LeaveQueueMutationVariables>;
export const GetBeepersDocument = gql`
    query GetBeepers {
  getBeeperList {
    id
    first
    last
    isStudent
    singlesRate
    groupRate
    capacity
    queueSize
    photoUrl
    role
  }
}
    `;

/**
 * __useGetBeepersQuery__
 *
 * To run a query within a React component, call `useGetBeepersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBeepersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBeepersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetBeepersQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetBeepersQuery, GetBeepersQueryVariables>) {
        return ApolloReactHooks.useQuery<GetBeepersQuery, GetBeepersQueryVariables>(GetBeepersDocument, baseOptions);
      }
export function useGetBeepersLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetBeepersQuery, GetBeepersQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<GetBeepersQuery, GetBeepersQueryVariables>(GetBeepersDocument, baseOptions);
        }
export type GetBeepersQueryHookResult = ReturnType<typeof useGetBeepersQuery>;
export type GetBeepersLazyQueryHookResult = ReturnType<typeof useGetBeepersLazyQuery>;
export type GetBeepersQueryResult = ApolloReactCommon.QueryResult<GetBeepersQuery, GetBeepersQueryVariables>;
export const ChangePasswordDocument = gql`
    mutation ChangePassword($password: String!) {
  changePassword(password: $password)
}
    `;
export type ChangePasswordMutationFn = ApolloReactCommon.MutationFunction<ChangePasswordMutation, ChangePasswordMutationVariables>;

/**
 * __useChangePasswordMutation__
 *
 * To run a mutation, you first call `useChangePasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePasswordMutation, { data, loading, error }] = useChangePasswordMutation({
 *   variables: {
 *      password: // value for 'password'
 *   },
 * });
 */
export function useChangePasswordMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ChangePasswordMutation, ChangePasswordMutationVariables>) {
        return ApolloReactHooks.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument, baseOptions);
      }
export type ChangePasswordMutationHookResult = ReturnType<typeof useChangePasswordMutation>;
export type ChangePasswordMutationResult = ApolloReactCommon.MutationResult<ChangePasswordMutation>;
export type ChangePasswordMutationOptions = ApolloReactCommon.BaseMutationOptions<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const EditAccountDocument = gql`
    mutation EditAccount($first: String, $last: String, $email: String, $phone: String, $venmo: String) {
  editAccount(
    input: {first: $first, last: $last, email: $email, phone: $phone, venmo: $venmo}
  ) {
    id
    name
  }
}
    `;
export type EditAccountMutationFn = ApolloReactCommon.MutationFunction<EditAccountMutation, EditAccountMutationVariables>;

/**
 * __useEditAccountMutation__
 *
 * To run a mutation, you first call `useEditAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editAccountMutation, { data, loading, error }] = useEditAccountMutation({
 *   variables: {
 *      first: // value for 'first'
 *      last: // value for 'last'
 *      email: // value for 'email'
 *      phone: // value for 'phone'
 *      venmo: // value for 'venmo'
 *   },
 * });
 */
export function useEditAccountMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<EditAccountMutation, EditAccountMutationVariables>) {
        return ApolloReactHooks.useMutation<EditAccountMutation, EditAccountMutationVariables>(EditAccountDocument, baseOptions);
      }
export type EditAccountMutationHookResult = ReturnType<typeof useEditAccountMutation>;
export type EditAccountMutationResult = ApolloReactCommon.MutationResult<EditAccountMutation>;
export type EditAccountMutationOptions = ApolloReactCommon.BaseMutationOptions<EditAccountMutation, EditAccountMutationVariables>;
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