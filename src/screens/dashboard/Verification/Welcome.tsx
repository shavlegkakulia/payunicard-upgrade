import React from "react"
import { View, StyleSheet, Image, Text } from "react-native"
import { useSelector } from "react-redux";
import AppButton from "../../../components/UI/AppButton";
import { ITranslateState, IGlobalState as ITranslateGlobalState } from "../../../redux/action_types/translate_action_types";
import colors from './../../../constants/colors';

interface IProps {
    onActionClick: (action: number) => void,
    loading: boolean
}

const Welcome: React.FC<IProps> = (props) => {
    const translate = useSelector<ITranslateGlobalState>(
        state => state.TranslateReduser,
      ) as ITranslateState;
      
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image style={styles.cover} source={require('./../../../assets/images/verification_screen_1.png')} resizeMode={'contain'} />
            </View>
            <View style={styles.wrapper}>
                <Text style={styles.title}>
                    {translate.t('verification.aThirdParty')}
                </Text>
                <Text style={styles.desc}>
                    {translate.t('verification.attorneyPossible')}
                </Text>

                <View style={styles.inputsGroup}>
                    <AppButton title={translate.t('common.no')} onPress={() => props.onActionClick(0)} backgroundColor={colors.inputBackGround} color={colors.black} loaderColor={colors.black} style={styles.button} isLoading={props.loading} />
                    <AppButton title={translate.t('common.yes')} disabled={props.loading} onPress={() => props.onActionClick(1)} backgroundColor={colors.inputBackGround} color={colors.black} style={styles.button} />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        paddingVertical: 30,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40
    },
    cover: {
        width: 230,
        height: 260
    },
    wrapper: {
        maxWidth: 327,
        alignSelf: 'center'
    },
    title: {
        fontSize: 24,
        lineHeight: 29,
        color: colors.black,
        alignSelf: "center",
        fontFamily: 'FiraGO-Medium',
        marginTop: 70,
        textAlign: 'center',
    },
    desc: {
        fontSize: 14,
        lineHeight: 17,
        color: colors.placeholderColor,
        alignSelf: "center",
        fontFamily: 'FiraGO-Medium',
        marginTop: 17,
        textAlign: 'center',
    },
    inputsGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 50
    },
    button: {
        paddingHorizontal: 50
    }
});

export default Welcome;