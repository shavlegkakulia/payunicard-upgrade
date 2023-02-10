import React, { useEffect, useState } from "react"
import { View, StyleSheet, Text, StyleProp, ViewStyle, TouchableOpacity, Image } from "react-native"
import { useDispatch, useSelector } from "react-redux";
import AppButton from "../../../components/UI/AppButton";
import AppCheckbox from "../../../components/UI/AppCheckbox";
import AppInput from "../../../components/UI/AppInput";
import AppSelect, { SelectItem } from "../../../components/UI/AppSelect/AppSelect";
import Validation, { required } from "../../../components/UI/Validation";
import colors from "../../../constants/colors";
import { PUSH } from "../../../redux/actions/error_action";
import { ITranslateState, IGlobalState as ITranslateGlobalState } from "../../../redux/action_types/translate_action_types";
import { IExpectedType } from "../../../services/UserService";
import { ITransactionCategoryInterface } from "./Index";

interface IProps {
    loading: boolean,
    selectedExpectedTurnover: IExpectedType | undefined,
    expectedTurnovers: IExpectedType[] | undefined;
    transactionCategories: ITransactionCategoryInterface[],
    anotherTransactionCategory: string | undefined,
    onSetExpectedTurnover: (status: IExpectedType) => void,
    onToggleTransactionCategory: (index: ITransactionCategoryInterface) => void,
    setAnotherTransactionCategory: (other: string) => void,
    onComplete: () => void
}

const ValidationContext = 'userVerification3';

const StepThree: React.FC<IProps> = (props) => {
    const translate = useSelector<ITranslateGlobalState>(
        state => state.TranslateReduser,
      ) as ITranslateState;      
      const dispatch = useDispatch<any>();;
      
    const [expectedTurnoverErrorStyle, setExpectedTurnoverErrorStyle] = useState<StyleProp<ViewStyle>>({});
    const [expectedTurnoverVisible, setExpectedTurnoverVisible] = useState(false);

    const nextHandler = () => {
        if (!props.selectedExpectedTurnover) {
            setExpectedTurnoverErrorStyle({ borderColor: colors.danger, borderWidth: 1 });
            return;
        } else {
            setExpectedTurnoverErrorStyle({});
        }

        if(!transactionCategories.filter(cat => cat.active === true).length) {
            console.log(transactionCategories.filter(cat => cat.active === true).length)
            dispatch(PUSH(translate.t('generalErrors.fillOutField')))
            return;
        }

        if (Validation.validate(ValidationContext)) {
            return;
        }

        props.onComplete();
    }

    let isAnotherSelected = props.transactionCategories.some(tc => tc.id === 5 && tc.active); //another

    const transactionCategories = [...props.transactionCategories].map(category => {
        const v = {...category};
        v.value = translate.t(v.value);
        return v;
      });

    return (
        <View style={styles.container}>
            <View style={styles.sectionContainer}>
                <Text style={styles.BoxTitle}>{translate.t('verification.expectedTurnover')}</Text>
                <View style={[styles.sectionBox, expectedTurnoverErrorStyle]}>
                    {props.selectedExpectedTurnover ?
                        <SelectItem
                            itemKey='expectedTurnover'
                            defaultTitle={translate.t('verification.chooseExpectedTurnover')}
                            item={props.selectedExpectedTurnover}
                            onItemSelect={() => setExpectedTurnoverVisible(true)}
                            style={styles.typeItem} />
                        :
                        <TouchableOpacity
                            onPress={() => setExpectedTurnoverVisible(true)}
                            style={[styles.typeSelectHandler]}>
                            <Text style={styles.typePlaceholder}>{translate.t('verification.chooseExpectedTurnover')}</Text>
                            <Image style={styles.dropImg} source={require('./../../../assets/images/down-arrow.png')} />
                        </TouchableOpacity>}

                    <AppSelect
                        itemKey='expectedTurnover'
                        elements={props.expectedTurnovers}
                        selectedItem={props.selectedExpectedTurnover}
                        itemVisible={expectedTurnoverVisible}
                        onSelect={(item) => { props.onSetExpectedTurnover(item); setExpectedTurnoverVisible(false) }}
                        onToggle={() => setExpectedTurnoverVisible(!expectedTurnoverVisible)} />
                </View>


                <View style={styles.categories}>
                    <Text style={styles.BoxTitle}>{translate.t('verification.chooseTransactionOptions')}</Text>
                    {transactionCategories.map((category, index) =>
                        <View key={index} style={styles.categoryItem}>
                            <TouchableOpacity
                                onPress={() => props.onToggleTransactionCategory(category)}
                                style={styles.touchArea}>
                                <AppCheckbox
                                    label={category.value}
                                    value={category.active}
                                    customKey='activeCategory'
                                    context={ValidationContext}
                                    activeColor={colors.primary}
                                    clicked={() => props.onToggleTransactionCategory(category)}
                                    style={styles.typeCheck} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {isAnotherSelected && <AppInput
                        placeholder={translate.t('verification.other')}
                        onChange={(anotherTransactionCategory) => props.setAnotherTransactionCategory(anotherTransactionCategory)}
                        value={props.anotherTransactionCategory}
                        customKey='anotherTransactionCategory'
                        requireds={[required]}
                        style={styles.input}
                        context={ValidationContext} />}

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
        maxWidth: 327,
        width: '100%',
        alignSelf: 'center'
    },
    sectionContainer: {
        marginTop: 40
    },
    BoxTitle: {
        fontFamily: 'FiraGO-Bold',
        fontSize: 14,
        lineHeight: 17,
        color: colors.labelColor,
        marginBottom: 15
    },
    sectionBox: {
        backgroundColor: colors.inputBackGround,
        borderRadius: 7
    },
    typeItem: {
        backgroundColor: colors.inputBackGround,
        borderRadius: 7
    },
    dropImg: {
        marginRight: 12
    },
    typeSelectHandler: {
        height: 54,
        backgroundColor: colors.inputBackGround,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    typePlaceholder: {
        fontFamily: 'FiraGO-Regular',
        fontSize: 14,
        lineHeight: 17,
        color: colors.placeholderColor,
        marginLeft: 13
    },
    input: {
        marginTop: 20
    },
    button: {
        marginTop: 30
    },
    touchArea: {
        
    },
    typeCheck: {
        paddingVertical: 7
    },
    categories: {
        marginTop: 20,
        justifyContent: 'flex-start'
    },
    categoryItem: {
        flexDirection:'row',
        justifyContent: 'flex-start'
    }
});

export default StepThree;