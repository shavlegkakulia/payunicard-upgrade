
 import React, { useEffect } from 'react';
 import Navigation from './src/navigation/index';
 import { Provider } from 'react-redux'
 import store from './src/redux/store';
//  import firebase from '@react-native-firebase/app';
import { Platform } from 'react-native';

 const App = () => {
  // // Your secondary Firebase project credentials for Android...
const androidCredentials = {
  clientId: '412327000492-q1eaq9hi3vr1vd3thi0v22q67lnfs3vd.apps.googleusercontent.com',
  appId: '',
  apiKey: 'AIzaSyAVC9o7J089MRsZ3UuBW_U5J6q4J6-yXqM',
  databaseURL: '',
  storageBucket: '',
  messagingSenderId: '',
  projectId: 'payunicard-8e9e4',
};

// Your secondary Firebase project credentials for iOS...
const iosCredentials = {
  clientId: '',
  appId: '',
  apiKey: '',
  databaseURL: '',
  storageBucket: '',
  messagingSenderId: '',
  projectId: '',
};

// Select the relevant credentials
const credentials = Platform.select({
  android: androidCredentials,
  ios: iosCredentials,
});

const config = {
  name: 'SECONDARY_APP',
};

// useEffect(() => {
//   if(credentials)
//   (async() => await firebase.initializeApp(credentials, config))();
// }, [credentials]);
   return (
     <Provider store={store} >
        <Navigation />
     </Provider>
   )
 };

 export default App;
