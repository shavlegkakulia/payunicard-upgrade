import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  Platform
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { useSelector } from 'react-redux';
import AppButton from '../../../components/UI/AppButton';
import AppInput from '../../../components/UI/AppInput';
import Validation, {required} from '../../../components/UI/Validation';
import colors from '../../../constants/colors';
import { EN, KA, ka_ge } from '../../../lang';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../../redux/action_types/translate_action_types';
import {IKCData} from '../../../services/KvalificaServices';
import { formatDate } from '../../../utils/utils';
import { documentTypes } from './Index';

interface IProps {
  kycData: IKCData | undefined;
  notEditable: boolean | undefined;
  onUpdateData: (c: IKCData | undefined) => void;
  onComplate: () => void;
}

const ValidationContext = 'userVerification7';

const StepSeven: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [chooseDate, setChooseDate] = useState<boolean>(false);
  const [chooseValidDate, setChooseValidDate] = useState<boolean>(false);
  const [dateErrorStyle, setDateErrorStyle] = useState<StyleProp<ViewStyle>>(
    {},
  );
  const [dateValidErrorStyle, setDateValidErrorStyle] = useState<StyleProp<ViewStyle>>(
    {},
  );
  const [issueDate, setIssueDate] = useState<Date | null>(null);
  const [validTo, setValidTo] = useState<Date | null>(null);
  const nextHandler = () => {
    if (Validation.validate(ValidationContext)) {
      return;
    }

    if(!issueDate) {
      setDateErrorStyle({borderColor: colors.danger, borderWidth: 1});
      return;
    } else {
      setDateErrorStyle({});
    }

    if(!validTo) {
      setDateValidErrorStyle({borderColor: colors.danger, borderWidth: 1});
      return;
    } else {
      setDateValidErrorStyle({});
    }
    let data = {...props.kycData};
    data.issueDate = issueDate.toISOString().split('T')[0];
    data.validTo = validTo.toISOString().split('T')[0];
    props.onUpdateData(data);
    props.onComplate();
  };

  const setPersonalNumber = (value: string) => {
    let data = {...props.kycData};
    data.personalNumber = value;
    props.onUpdateData(data);
  };

  const setDocumentNumber = (value: string) => {
    let data = {...props.kycData};
    data.documentNumber = value;
    props.onUpdateData(data);
  };

  const setFirstName = (value: string) => {
    let data = {...props.kycData};
    data.firstName = value;
    props.onUpdateData(data);
  };

  const setLastName = (value: string) => {
    let data = {...props.kycData};
    data.lastName = value;
    props.onUpdateData(data);
  };

  const dtissue = useMemo(
    () => (
      <DatePicker
        modal
        mode="date"
        title={translate.t('common.setDate')}
        cancelText={translate.t('common.cancel')}
        confirmText={translate.t('common.confirm')}
        locale={translate.key === ka_ge ? KA : EN}
        timeZoneOffsetInMinutes={-7 * 60}
        maximumDate={new Date()}
        open={chooseDate}
        date={issueDate || new Date()}
        onDateChange={() => { }}
        onConfirm={date => {
          setChooseDate(false);
          setIssueDate(date);
        }}
        onCancel={() => {
          setChooseDate(false);
        }}
      />
    ),
    [chooseDate, issueDate],
  );

  const dtvalid = useMemo(
    () => (
      <DatePicker
        modal
        mode="date"
        title={translate.t('common.setDate')}
        cancelText={translate.t('common.cancel')}
        confirmText={translate.t('common.confirm')}
        locale={translate.key === ka_ge ? KA : EN}
        open={chooseValidDate}
        date={validTo || new Date()}
        timeZoneOffsetInMinutes={-7 * 60}
        onDateChange={() => { }}
        onConfirm={date => {
          setChooseValidDate(false);
          setValidTo(date);
        }}
        onCancel={() => {
          setChooseValidDate(false);
        }}
      />
    ),
    [chooseValidDate, validTo],
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.addressContainer}>
        <AppInput
          placeholder={translate.t('common.documentNumber')}
          onChange={documentNumber => !props.notEditable && setDocumentNumber(documentNumber)}
          value={props.kycData?.documentNumber}
          customKey="documentNumber"
          requireds={[required]}
          style={styles.input}
          editable={!props.notEditable}
          context={ValidationContext}
        /> 
        
         {props.kycData?.personalNumber !== undefined && <AppInput
          placeholder={translate.t('common.personalNumber')}
          onChange={personalNumber => !props.notEditable && setPersonalNumber(personalNumber)}
          value={props.kycData?.personalNumber}
          customKey="personalNumber"
          requireds={[props.kycData?.personalNumber !== undefined? required : '']}
          style={styles.input}
          editable={!props.notEditable}
          context={ValidationContext}
        /> }
        <TouchableOpacity onPress={() => setChooseValidDate(true)}>
              <View style={[styles.InputBox, dateValidErrorStyle]}>
                <Text style={styles.birthDateValue}>
                  {validTo ? (
                    formatDate(validTo?.toString()).split('.').join('/')
                  ) : (
                    <>
                      {translate.t('verification.dateOfExpire')}
                    </>
                  )}
                </Text>
              </View>
            </TouchableOpacity>
         <TouchableOpacity onPress={() => setChooseDate(true)}>
              <View style={[styles.InputBox, dateErrorStyle]}>
                <Text style={styles.birthDateValue}>
                  {issueDate ? (
                    formatDate(issueDate?.toString()).split('.').join('/')
                  ) : (
                    <>
                      {translate.t('verification.DateOfIssue')}
                    </>
                  )}
                </Text>
              </View>
            </TouchableOpacity>
            

        <AppInput
          placeholder={translate.t('common.name')}
          onChange={firstName => !props.notEditable && setFirstName(firstName)}
          value={props.kycData?.firstName}
          customKey="setFirstName"
          requireds={[required]}
          style={styles.input}
          editable={!props.notEditable}
          context={ValidationContext}
        />

        <AppInput
          placeholder={translate.t('common.lname')}
          onChange={lastName => !props.notEditable && setLastName(lastName)}
          value={props.kycData?.lastName}
          customKey="lastName"
          requireds={[required]}
          style={styles.input}
          editable={!props.notEditable}
          context={ValidationContext}
        />
      </View>
      <AppButton
        title={translate.t('common.next')}
        onPress={nextHandler}
        style={styles.button}
      />
       {dtissue}
       {dtvalid}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 327,
    width: '100%',
    alignSelf: 'center',
  },
  addressContainer: {
    marginTop: 40,
  },
  input: {
    marginVertical: 8
  },
  button: {
    marginTop: 30,
  },
  InputBox: {
    backgroundColor: colors.inputBackGround,
    borderRadius: 7,
    height: 59,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginVertical: 8,
  },
  birthDateValue: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
    marginTop: 20,
    marginBottom: 20
  },
});

export default StepSeven;
