import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { SvgXml } from 'react-native-svg';
import {useSelector} from 'react-redux';
import colors from '../../../constants/colors';
import { unicardLogoAction } from '../../../constants/svgXmls';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import {OpenDrawer} from '../../../services/NavigationService';
import screenStyles from '../../../styles/screens';

const UnicardAction: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;

  const openUnicardSidebar = () => {
    OpenDrawer && OpenDrawer[1]();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={openUnicardSidebar}
      style={[styles.unicardActionContainer, screenStyles.shadowedCardbr15]}>
      <View style={styles.unicardActionInnerLeft}>
        <View style={styles.unicardLogoBox}>
        <SvgXml xml={unicardLogoAction} width="20" />
        </View>
        <Text style={styles.unicardACtionText}>
          {translate.t('dashboard.unicardCard')}
        </Text>
      </View>
      <Image
        source={require('./../../../assets/images/icon-right-arrow-green.png')}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  unicardActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 36,
    padding: 17,
    backgroundColor: colors.white,
  },
  unicardActionInnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unicardLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.inputBackGround,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unicardACtionText: {
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
});

export default UnicardAction;
