import React, { useState } from "react"
import { View, StyleSheet, Text, StyleProp, ViewStyle, TouchableOpacity, Image } from "react-native"
import { useSelector } from "react-redux";
import AppButton from "../../../components/UI/AppButton";
import AppInput from "../../../components/UI/AppInput";
import AppSelect, { SelectItem } from "../../../components/UI/AppSelect/AppSelect";
import Validation, { required } from "../../../components/UI/Validation";
import colors from "../../../constants/colors";
import { ITranslateState, IGlobalState as ITranslateGlobalState } from "../../../redux/action_types/translate_action_types";
import { IStatus, IType2 } from "../../../services/UserService";

interface IProps {
    loading: boolean,
    selectedEmploymentStatus: IStatus | undefined,
    employmentStatuses: IStatus[] | undefined;
    onSetEmploymentStatus: (status: IStatus) => void,
    selectedJobType: IType2 | undefined,
    customerWorkTypes: IType2[] | undefined;
    onSetJobTypes: (type: IType2) => void,
    complimentary: string | undefined,
    onSetComplimentary: (complimentary: string) => void,
    occupiedPosition: string | undefined,
    onSetOccupiedPositions: (position: string) => void,
    onComplete: () => void
}

const skipEmployeStatuses = ['UnEmployed', 'Retired'];
const ValidationContext = 'userVerification2';

const StepTwo: React.FC<IProps> = (props) => {
    const translate = useSelector<ITranslateGlobalState>(
        state => state.TranslateReduser,
      ) as ITranslateState;
    const [employmentStatusErrorStyle, setEmploymentStatusErrorStyle] = useState<StyleProp<ViewStyle>>({});
    const [jobTypeErrorStyle, setJobTypeErrorStyle] = useState<StyleProp<ViewStyle>>({});
    const [jobStatusVisible, setJobStatusVisible] = useState(false);
    const [jobTypeVisible, setJobTypesVisible] = useState(false);

    const skipFields = skipEmployeStatuses.some(employ => props.selectedEmploymentStatus?.employmentStatusCode === employ);

    const nextHandler = () => {
        if (!props.selectedEmploymentStatus) {
            setEmploymentStatusErrorStyle({ borderColor: colors.danger, borderWidth: 1 });
            return;
        } else {
            setEmploymentStatusErrorStyle({});
        }

        if (!props.selectedJobType && !skipFields) {
            setJobTypeErrorStyle({ borderColor: colors.danger, borderWidth: 1 });
            return;
        } else {
            setJobTypeErrorStyle({});
        }

        if (Validation.validate(ValidationContext) && !skipFields) {
            return;
        }

        props.onComplete();
    }
  
    return (
        <View style={styles.container}>
            <View style={styles.sectionContainer}>
                <Text style={styles.BoxTitle}>{translate.t('verification.fieldOfEmployment')}</Text>
                <View style={[styles.sectionBox, employmentStatusErrorStyle]}>
                    {props.selectedEmploymentStatus ?
                        <SelectItem
                            itemKey='employmentStatus'
                            defaultTitle={translate.t('verification.chooseStatusOfEmployment')}
                            item={props.selectedEmploymentStatus}
                            onItemSelect={() => setJobStatusVisible(true)}
                            style={styles.typeItem} />
                        :
                        <TouchableOpacity
                            onPress={() => setJobStatusVisible(true)}
                            style={[styles.typeSelectHandler]}>
                            <Text style={styles.typePlaceholder}>{translate.t('verification.chooseStatusOfEmployment')}</Text>
                            <Image style={styles.dropImg} source={require('./../../../assets/images/down-arrow.png')} />
                        </TouchableOpacity>}

                    <AppSelect
                        itemKey='employmentStatus'
                        elements={props.employmentStatuses}
                        selectedItem={props.selectedEmploymentStatus}
                        itemVisible={jobStatusVisible}
                        onSelect={(item) => { props.onSetEmploymentStatus(item); setJobStatusVisible(false) }}
                        onToggle={() => setJobStatusVisible(!jobStatusVisible)} />
                </View>

                {!skipFields && <>
                    <View style={[styles.sectionBox, styles.input, jobTypeErrorStyle]}>
                        {props.selectedJobType ?
                            <SelectItem
                                itemKey='customerEmploymentType'
                                defaultTitle={translate.t('verification.chooseFieldOfEmployment')}
                                item={props.selectedJobType}
                                onItemSelect={() => setJobTypesVisible(true)}
                                style={styles.typeItem} />
                            :
                            <TouchableOpacity
                                onPress={() => setJobTypesVisible(true)}
                                style={[styles.typeSelectHandler]}>
                                <Text style={styles.typePlaceholder}>{translate.t('verification.chooseFieldOfEmployment')}</Text>
                                <Image style={styles.dropImg} source={require('./../../../assets/images/down-arrow.png')} />
                            </TouchableOpacity>}

                        <AppSelect
                            itemKey='customerEmploymentType'
                            elements={props.customerWorkTypes}
                            selectedItem={props.selectedJobType}
                            itemVisible={jobTypeVisible}
                            onSelect={(item) => { props.onSetJobTypes(item); setJobTypesVisible(false) }}
                            onToggle={() => setJobTypesVisible(!jobTypeVisible)} />
                    </View>

                    <AppInput
                        placeholder={translate.t('verification.employer')}
                        onChange={(complimentary) => props.onSetComplimentary(complimentary)}
                        value={props.complimentary}
                        customKey='complimentary'
                        requireds={[required]}
                        style={styles.input}
                        context={ValidationContext} />

                    <AppInput
                        placeholder={translate.t('verification.workPosition')}
                        onChange={(occupiedPosition) => props.onSetOccupiedPositions(occupiedPosition)}
                        value={props.occupiedPosition}
                        customKey='occupiedPosition'
                        requireds={[required]}
                        style={styles.input}
                        context={ValidationContext} />
                </>}
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
    }
});

export default StepTwo;