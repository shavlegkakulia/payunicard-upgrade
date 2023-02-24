import React, {useEffect} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import {useSelector} from 'react-redux';
import Cover from '../components/Cover';
import colors from '../constants/colors';
import SUBSCRIBTION_KEYS from '../constants/subscribtionKeys';
import Routes from '../navigation/routes';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from './../redux/action_types/translate_action_types';
import NavigationService from '../services/NavigationService';
import {subscriptionService} from '../services/subscriptionService';

interface IProps {
  title: string;
  sendHeader: (element: JSX.Element | null) => void;
  oncallback: () => void;
}

const Actions: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const Back = () => {};

  const openCreateTransfer = () => {
    subscriptionService.sendData(
      SUBSCRIBTION_KEYS.OPEN_CREATE_TRANSFER_TEMPLATE,
      true,
    );
    props.oncallback();
  };

  const openCreatePayment = () => {
    subscriptionService.sendData(
      SUBSCRIBTION_KEYS.OPEN_CREATE_PAYMENT_TEMPLATE,
      true,
    );
    props.oncallback();
  };

  const openCardsStore = () => {
    subscriptionService.sendData(SUBSCRIBTION_KEYS.OPEN_CARDS_STOTE, true);
    props.oncallback();
  };

  const TopUp = () => {
    subscriptionService.sendData(SUBSCRIBTION_KEYS.START_TOPUP, true);
    props.oncallback();
  };

  const AddBankCard = () => {
    subscriptionService.sendData(SUBSCRIBTION_KEYS.ADD_BANK_CARD, true);
    props.oncallback();
  };

  useEffect(() => {
    const data = (
      <View style={[styles.actionHeader, true && {justifyContent: 'center'}]}>
        {false && (
          <TouchableOpacity style={styles.back} onPress={Back}>
            <Image
              style={styles.backImg}
              source={require('./../assets/images/back-arrow-primary.png')}
            />
            <Text style={styles.backText}>{translate.t('common.back')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.titleBox}>
          <Text
            numberOfLines={1}
            style={[
              styles.titleText,
              true && {textAlign: 'center', alignSelf: 'center'},
            ]}>
            {props.title}
          </Text>
        </View>
      </View>
    );
    props.sendHeader(data);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.action} onPress={TopUp.bind(this)}>
            <Cover isOverflowVisible={true} circleBg={'#94DD3410'} localImage={require('./../assets/images/topup.png')} />
            <Text style={styles.actionTitle}>{translate.t('plusSign.topUp')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.action}
            onPress={AddBankCard.bind(this)}>
            <Cover isOverflowVisible={true} circleBg={'#F9BD1510'} localImage={require('./../assets/images/add_card.png')} />
            <Text style={styles.actionTitle}>{translate.t('plusSign.addCard')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.action} onPress={openCardsStore}>
            <Cover isOverflowVisible={true} circleBg={'#94DD3410'} localImage={require('./../assets/images/order_card.png')} />
            <Text style={styles.actionTitle}>{translate.t('plusSign.orderCard')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.action} onPress={openCreateTransfer}>
            <Cover localImage={require('./../assets/images/plus.png')} />
            <Text style={styles.actionTitle}>{translate.t('plusSign.crTransferTemplate')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.action} onPress={openCreatePayment}>
            <Cover
              localImage={require('./../assets/images/transaction_template.png')}
            />
            <Text style={styles.actionTitle}>{translate.t('plusSign.crPaymentTemplate')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    minHeight: '100%',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 16,
    marginTop: 0,
    paddingHorizontal: 20,
    height: 27,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    paddingVertical: 5,
  },
  backImg: {
    marginRight: 12,
  },
  backText: {
    fontFamily: 'FiraGO-Bold',
    fontWeight: '500',
    color: colors.primary,
    fontSize: 14,
    lineHeight: 17,
  },
  titleBox: {
    flex: 1,
  },
  titleText: {
    fontFamily: 'FiraGO-Bold',
    fontWeight: '500',
    color: colors.black,
    fontSize: 14,
    lineHeight: 27,
    flex: 1,
    textAlign: 'right',
    alignSelf: 'stretch',
  },
  actions: {
    marginHorizontal: 30,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  actionTitle: {
    fontFamily: 'FiraGO-Regular',
    fontWeight: '500',
    color: colors.labelColor,
    fontSize: 14,
    lineHeight: 17,
    marginLeft: 30,
  },
  body: {
    justifyContent: 'space-between',
    flex: 1,
    marginTop: 40,
  },
});

export default Actions;
