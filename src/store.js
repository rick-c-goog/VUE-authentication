import { createStore } from 'vuex'
import { auth } from './firebaseConfig'
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut, updateProfile} from 'firebase/auth'
import { getFirestore, collection, addDoc}  from 'firebase/firestore'

const store = createStore({
  state: {
        user: {
            loggedIn: false,
            data: null
          }
  },    
  
  getters: {
    user(state){
      return state.user
    }
  },
  mutations: {
    SET_USER(state, payload) {
      state.user.data = payload
    },
    SET_LOGGED_IN(state, value) {
      state.user.loggedIn = value;
    }
  },
  actions: {
      async register(context, { email, password, name}){
          const response = await createUserWithEmailAndPassword(auth, email, password)
          const dbstore=getFirestore()
          if (response) {
              context.commit('SET_USER', response.user)
              //response.user.updateProfile({displayName: name})
              updateProfile(response.user, {
                displayName: name
              })
              await addDoc(collection(dbstore, "users"), {
                name: name,
                email: email,
                id: response.user.uid
             });

          } else {
              throw new Error('Unable to register user')
          }
      },

      async logIn(context, { email, password }){
        const response = await signInWithEmailAndPassword(auth, email, password)
        if (response) {
            context.commit('SET_USER', response.user)
        } else {
            throw new Error('login failed')
        }
    },

    async logOut(context){
        await signOut(auth)
        context.commit('SET_USER', null)
    },
    
    async fetchUser(context ,user) {
      context.commit("SET_LOGGED_IN", user !== null);
      if (user) {
        context.commit("SET_USER", {
          displayName: user.displayName,
          email: user.email
        });
      } else {
        context.commit("SET_USER", null);
      }
  }
  }
  

})



// export the store
export default store