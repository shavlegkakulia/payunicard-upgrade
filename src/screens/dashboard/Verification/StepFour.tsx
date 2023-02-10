import React from "react"
import { View, StyleSheet, Image, Text } from "react-native"
import { useSelector } from "react-redux";
import AppButton from "../../../components/UI/AppButton";
import colors from "../../../constants/colors";
import { ITranslateState, IGlobalState as ITranslateGlobalState } from "../../../redux/action_types/translate_action_types";

interface IProps {
    loading: boolean,
    onComplate: () => void
}

const StepFour: React.FC<IProps> = (props) => {
    const translate = useSelector<ITranslateGlobalState>(
        state => state.TranslateReduser,
      ) as ITranslateState;
    const nextHandler = () => {
        props.onComplate();
    }

    return (
        <View style={styles.container}>
            <View style={styles.wrapper}>
                <Text style={styles.headerText}>
                    {translate.t('verification.visualIdentification')}
                </Text>
            </View>
            <View style={styles.imageContainer}>
                <Image style={styles.cover} source={require('./../../../assets/images/LoginScreen_1.png')} resizeMode={'contain'} />
            </View>
            <View style={styles.wrapper}>
                <Text style={styles.title}>
                {translate.t('verification.webcamAndDocument')}
                </Text>
            </View>
  
                <AppButton
                    isLoading={props.loading}
                    title={translate.t('common.next')}
                    onPress={nextHandler}
                    style={styles.button} />
      
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        paddingVertical: 30
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30
    },
    cover: {
        width: 230,
        height: 260
    },
    wrapper: {
        maxWidth: 327,
        alignSelf: 'center'
    },
    headerText: {
        fontSize: 24,
        lineHeight: 29,
        color: colors.black,
        alignSelf: "center",
        fontFamily: 'FiraGO-Bold',
        marginTop: 0,
        textAlign: 'center',
    },
    title: {
        fontSize: 14,
        lineHeight: 17,
        color: colors.black,
        alignSelf: "center",
        fontFamily: 'FiraGO-Bold',
        marginTop: 20,
        textAlign: 'center',
    },
    button: {
        marginTop: 50,
        width: '100%',
        maxWidth: 327,
        alignSelf: 'center'
    }
});

export default StepFour;