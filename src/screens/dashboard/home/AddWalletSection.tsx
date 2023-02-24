import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import colors from '../../../constants/colors';
import Routes from '../../../navigation/routes';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import NavigationService from '../../../services/NavigationService';
import screenStyles from '../../../styles/screens';

const AddWalletSection = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  return (
    <View style={[styles.accountStatusView, screenStyles.shadowedCardbr15]}>
      <View style={styles.accountStatusViewInner}>
        <TouchableOpacity
          onPress={() => NavigationService.navigate(Routes.Products)}
          style={styles.accountStatusViewTouchable}>
          <Text style={styles.title}>{translate.t('common.addAppleWalletEasy')}</Text>
          <Image
            source={require('./../../../assets/images/icon-apple-pay-button.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  accountStatusView: {
    marginTop: 16,
    minHeight: 46,
    backgroundColor: colors.white,
    flex: 1,
    alignItems: 'center',
  },
  accountStatusViewInner: {
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 13,
    flex: 1,
  },
  accountStatusViewTouchable: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'FiraGO-Book',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: colors.black,
    flex: 1,
  },
  icon: {
    width: 56,
    height: 36,
    marginLeft: 50,
    resizeMode: 'contain'
  },
});

export default AddWalletSection;
