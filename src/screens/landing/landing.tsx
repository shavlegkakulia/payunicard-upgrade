import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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
        return await storage.getItem(FIRST_LOAD_KEY) === null;
    }

    useEffect(() => {
        isFirstLoad().then(status => {
            setFirstsLoad(status);
            setIsLoading(false);
        })
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
            <FullScreenLoader visible={isLoading} />
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
    }
})

export default Main;