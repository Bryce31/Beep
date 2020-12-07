import { store  } from '@risingstack/react-easy-state';

interface UserStore {
   user: any; 
}

const userStore: UserStore = store({ user: null });

export default userStore;
