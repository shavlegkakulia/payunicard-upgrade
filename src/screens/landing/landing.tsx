import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LandingLayout from '../LandingLayout';
import FirstLoad from './firstLoad';
import Login from './login';
import storage from './../../services/StorageService';
import colors from '../../constants/colors';
import { FIRST_LOAD_KEY } from '../../constants/defaults';
import FullScreenLoader from './../../components/FullScreenLoading';
import { RouteProp, useRoute } from '@react-navigation/native';

type RouteParamList = {
    params: {
        loginWithPassword?:boolean;
    };
  };

const Main: React.FC = () => {
    const route = useRoute<RouteProp<RouteParamList, 'params'>>();
    const [firstLoad, setFirstsLoad] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const complateFirstLoad = async () => {
        await storage.setItem(FIRST_LOAD_KEY, '0');
        setFirstsLoad(false);
    }

    const isFirstLoad = async () => {
        return storage.getItem(FIRST_LOAD_KEY).then(res => {
            return res === null;
        }).catch(() => {
            return false;
        })
    }

    useEffect(() => {
        isFirstLoad().then(status => {
            setFirstsLoad(status);
            setIsLoading(false);
        }).finally(() => {
            setIsLoading(false);
        }).catch(() => {
            setIsLoading(false);
        })

        return () => setIsLoading(false)
    }, []);

    if (firstLoad) {
        return (
            <View style={styles.firstLoadContainer}>
                <FirstLoad Complate={complateFirstLoad} />
            </View>
        )
    }

    return (
        <LandingLayout>
            <>
            <View style={styles.container}>
                <Login loginWithPassword={route.params?.loginWithPassword} />
            </View>
            {isLoading && (
        <TouchableOpacity
          onPress={() => setIsLoading(false)}
          style={[styles.loader]}
        >
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            {/* <Text>landing</Text> */}
          </>
        </TouchableOpacity>
      )}
            </>
        </LandingLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white
    },
    firstLoadContainer: {
        flex: 1
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
      }
})

export default Main;