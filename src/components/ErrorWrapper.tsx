import React, { FC, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Modal, Platform, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import colors from '../constants/colors';
import { IErrorState, IGlobalState as ErrorState } from './../redux/action_types/error_action_types';
import { DELETE } from './../redux/actions/error_action';
type Props = {
    children: JSX.Element,
  };
const ErrorWrapper: FC<Props> = ({children}) => {
    const errors = useSelector<ErrorState>(state => state.ErrorReducer) as IErrorState;
    const dispatch = useDispatch<any>();
    const ErrorTtl = useRef<any>();
    const animatedValue = useRef(new Animated.Value(1)).current;

    const startAnimation = (toValue: number, end: boolean = false) => {
        Animated.timing(animatedValue, {
            toValue,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => {
            if (end) {
                dispatch(DELETE());
            }
        });
    }

    useEffect(() => {
        if (ErrorTtl.current) clearTimeout(ErrorTtl.current);

        if (errors?.errors) {
            startAnimation(0);
            ErrorTtl.current = setTimeout(() => {
                startAnimation(1, true);
            }, 3000);
        }
    }, [errors.errors])

    const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -60],
        extrapolate: 'extend'
    })

    return (
        <View style={styles.container}>
                        {children}
            {errors?.errors !== undefined &&
                <Modal transparent>
                    <Animated.View style={{ ...styles.errorContainer, transform: [{ translateY: translateY }] }}>
                        <Text style={styles.errorText}>
                            {errors.errors}
                        </Text>
                    </Animated.View>
                </Modal>}
        </View>
    )
}

const screenHeight = Dimensions.get("window").height;
const cHeight = screenHeight >= 800 && Platform.OS === 'ios' ? 90 : 60;
const cPaddingTop = screenHeight >= 800 && Platform.OS === 'ios' ? 35 : 0;

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
        backgroundColor: '#fff',
    },
    errorContainer: {
        backgroundColor: colors.danger,
        zIndex: 9999999999,
        elevation: 9999999999,
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        flex: 1,
        width: '100%',
        height: cHeight,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    errorText: {
        color: colors.white,
        paddingTop: cPaddingTop
    }
});

export default ErrorWrapper;