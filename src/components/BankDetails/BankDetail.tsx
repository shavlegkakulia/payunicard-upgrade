import React, {useRef, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import colors from '../../constants/colors';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from './../../redux/action_types/translate_action_types';
import {IBankTransferDetails} from '../../screens/dashboard/cardsStore/paymentMethods';
import Store from './../../redux/store';
import {getString} from './../../utils/Converter';
import TemporaryText from '../TemporaryText';
import Clipboard from '@react-native-clipboard/clipboard';
const bogImg = require('../../assets/images/BOG-logo.png');

interface IBankDetailProp {
  data: IBankTransferDetails;
}

const BankDetail: React.FC<IBankDetailProp> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [outer, setOuter] = useState(true);
  const [copiedText, setCopiedText] = useState<string | undefined>();
  const copiedTextTtl = useRef<NodeJS.Timeout>();

  const copyToClipboard = (str: string) => {
    setOuter(false);
    Clipboard.setString(str);
    setCopiedText(str);
    copiedTextTtl.current = setTimeout(() => {
      setCopiedText(undefined);
    }, 1000);
  };
  const curLangKey = Store.getState().TranslateReduser.key;
  console.log(curLangKey)
  return (
    <View style={style.bankItem}>
      <View
        style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
        <Image
          source={
            props.data.id === 3?
            props.data.logoUrl[curLangKey]
            :
            props.data.logoUrl
          }
          style={{
            width: props.data.id === 3 ? 40 : 30,
            height: props.data.id === 3 ?21 : 30,
            marginRight: 10,
          }}
        />
        <Text style={style.titleText}>
          {props.data.bankName.getName(curLangKey)}
        </Text>
      </View>
      <View style={style.rowItem}>
        <Text style={style.titleText}>{translate.t('transfer.account')}:</Text>
        <TouchableOpacity
          onPress={() => copyToClipboard(getString(props.data.accountNumber))}
          style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={[style.titleText, {fontFamily: 'FiraGO-Regular'}]}>
            {props.data.accountNumber}
          </Text>
          <Image
            source={require('../../assets/images/textCopyIcon.png')}
            style={{width: 12, height: 12}}
          />
          <TemporaryText
            text={translate.t('common.copied')}
            show={props.data.accountNumber === copiedText}
          />
        </TouchableOpacity>
      </View>
      <View style={style.rowItem}>
        <Text style={style.titleText}>Swift:</Text>
        <Text style={[style.titleText, {fontFamily: 'FiraGO-Regular'}]}>
          {props.data.swiftCode}
        </Text>
      </View>
    </View>
  );
};

export default BankDetail;

const style = StyleSheet.create({
  bankItem: {
    borderBottomColor: colors.placeholderColor,
    borderBottomWidth: 2,
    paddingBottom: 10,
    marginBottom: 10,
  },

  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  titleText: {
    fontFamily: 'FiraGO-Bold',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
    marginRight: 3,
  },
});
