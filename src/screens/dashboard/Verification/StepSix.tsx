import React, { useState } from 'react';
import {View, StyleSheet, Image, Text} from 'react-native';
import { useSelector } from 'react-redux';
import AppButton from '../../../components/UI/AppButton';
import AppCheckbox from '../../../components/UI/AppCheckbox';
import colors from '../../../constants/colors';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../../redux/action_types/translate_action_types';

interface IProps {
  loading: boolean;
  onComplate: () => void;
}

const StepSix: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [accepted, setAccepted] = useState<boolean>(false);

  const nextHandler = () => {
    props.onComplate();
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.cover}
            source={require('./../../../assets/images/ICON.png')}
            resizeMode={'contain'}
          />
        </View> 
        <Text style={styles.title}>
          {translate.t('verification.kvForSecuirty')}
        </Text>

        <View style={styles.block}>
          <Image
            style={styles.blockImg}
            source={require('./../../../assets/images/home_active.png')}
            resizeMode={'contain'}
          />
          <Text style={styles.labelText}>1. {translate.t('verification.kvVisualIdentification')}</Text>
        </View>

        <View style={styles.block}>
          <Image
            style={styles.blockImg}
            source={require('./../../../assets/images/home_active.png')}
            resizeMode={'contain'}
          />
          <Text style={styles.labelText}>
            2. {translate.t('verification.kvDocumentScan')}
          </Text>
        </View>

        <View style={styles.block}>
          <Image
            style={styles.blockImg}
            source={require('./../../../assets/images/home_active.png')}
            resizeMode={'contain'}
          />
          <Text style={styles.labelText}>
            3. {translate.t('verification.kvWebCamRequired')}
          </Text>
        </View>

        <View>
            <AppCheckbox style={styles.checkbox} activeColor={colors.primary} label={translate.t('common.agreeTerms')} clicked={() => setAccepted(!accepted)} value={accepted} key={'accept'} customKey='accept' context='verification' />
            <Text style={styles.description}>{translate.t('verification.kvDisclamer')}</Text>
        </View>
      </View>

      <AppButton
        isLoading={props.loading}
        disabled={!accepted}
        title={translate.t('verification.kvStart')}
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
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  block: {
    paddingHorizontal: 23,
    paddingVertical: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  blockImg: {
    width: 40,
    height: 40,
  },
  cover: {
    height: 41,
  },
  wrapper: {
    maxWidth: 327,
    alignSelf: 'center',
  },
  labelText: {
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
    fontFamily: 'FiraGO-Regular',
    marginLeft: 10,
    flex: 1,
    flexWrap: 'wrap'
  },
  title: {
    fontSize: 14,
    lineHeight: 17,
    color: colors.primary,
    alignSelf: 'center',
    fontFamily: 'FiraGO-Bold',
    marginTop: 20,
    textAlign: 'center',
    marginBottom: 80,
  },
  description: {
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
    fontFamily: 'FiraGO-Regular',
    paddingLeft: 34
  },
  button: {
    marginTop: 50,
    width: '100%',
    maxWidth: 327,
    alignSelf: 'center',
  },
  checkbox: {
    alignSelf: 'flex-start', 
    marginBottom: 17
  }
});

export default StepSix;
