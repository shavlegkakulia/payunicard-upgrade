import React, {useState} from 'react';
import {View, StyleSheet, Image, Text} from 'react-native';
import {useSelector} from 'react-redux';
import AppButton from '../../../components/UI/AppButton';
import AppCheckbox from '../../../components/UI/AppCheckbox';
import colors from '../../../constants/colors';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import {IKCData} from '../../../services/KvalificaServices';
import { getString } from '../../../utils/Converter';
import {documentTypes} from './Index';

interface IProps {
  kycData: IKCData | undefined;
  loading: boolean;
  onComplate: () => void;
}

const StepNine: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [accepted, setAccepted] = useState<boolean>(false);

  const nextHandler = () => {
    props.onComplate();
  };

  console.log(props.kycData?.documetType, '==', documentTypes.Enum_Driver_License)
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>
          {translate.t('verification.checkPersonalInfo')}
        </Text>

        <View style={styles.block}>
          <Text style={styles.labelText}>
            {translate.t('verification.docType')}:
          </Text>
          <Text style={styles.labelValue}>
            {props.kycData?.documetType === documentTypes.Enum_Driver_License
              ? translate.t('verification.driverLicense')
              : props.kycData?.documetType === documentTypes.PASSPORT
              ? translate.t('verification.passport')
              : translate.t('verification.idCard')}
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.labelText}>
            {translate.t('common.documentNumber')}
          </Text>
          <Text style={styles.labelValue}>{props.kycData?.documentNumber}</Text>
        </View>

        {(props.kycData?.personalNumber !== null && getString(props.kycData?.personalNumber).length > 0) && [
          <View style={styles.block}>
            <Text style={styles.labelText}>
              {translate.t('verification.idNumber')}
            </Text>
            <Text style={styles.labelValue}>
              {props.kycData?.personalNumber}
            </Text>
          </View>,
        ]}

        <View style={styles.block}>
          <Text style={styles.labelText}>
            {translate.t('common.name')}, {translate.t('common.lname')}:
          </Text>
          <Text style={styles.labelValue}>
            {props.kycData?.firstName} {props.kycData?.lastName}
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.labelText}>
            {translate.t('verification.dateOfBirth')}:
          </Text>
          <Text style={styles.labelValue}>{props.kycData?.birthDate}</Text>
        </View>

        <Text style={[styles.title, styles.title2]}>
          {translate.t('verification.uploadedDocuments')}
        </Text>

        <View style={styles.imgContainer}>
          <Image
            style={styles.cover}
            source={{uri: props.kycData?.customerSelf}}
            resizeMode={'contain'}
          />

          <Image
            style={styles.cover}
            source={{uri: props.kycData?.documentFrontSide}}
            resizeMode={'contain'}
          />

          {props.kycData?.documentBackSide && (
            <Image
              style={styles.cover}
              source={{uri: props.kycData?.documentBackSide}}
              resizeMode={'contain'}
            />
          )}
        </View>

        <View>
          <AppCheckbox
            style={styles.checkbox}
            activeColor={colors.primary}
            label={translate.t('verification.agreePayUniTerms')}
            clicked={() => setAccepted(!accepted)}
            value={accepted}
            key={'accept'}
            customKey="accept"
            context="verification"
          />
        </View>
      </View>

      <AppButton
        isLoading={props.loading}
        disabled={!accepted}
        title={translate.t('common.next')}
        onPress={nextHandler}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    paddingBottom: 30,
  },
  block: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 30,
  },
  imgContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  cover: {
    marginVertical: 5,
    height: 150,
  },
  wrapper: {
    maxWidth: 327,
    alignSelf: 'center',
  },
  labelText: {
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
    fontFamily: 'FiraGO-Bold',
    textAlign: 'center',
  },
  labelValue: {
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
    fontFamily: 'FiraGO-Regular',
    textAlign: 'center',
    marginTop: 5,
  },
  title: {
    fontSize: 16,
    lineHeight: 19,
    color: colors.black,
    alignSelf: 'center',
    fontFamily: 'FiraGO-Bold',
    marginTop: 40,
    textAlign: 'center',
    marginBottom: 22,
  },
  title2: {
    marginTop: 0,
  },
  button: {
    marginTop: 50,
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
  },
  checkbox: {
    alignSelf: 'flex-start',
    marginBottom: 17,
  },
});

export default StepNine;
