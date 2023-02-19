import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Modal,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';
import FloatingLabelInput from '../containers/otp/Otp';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from './../redux/action_types/translate_action_types';
import { useSelector} from 'react-redux';
import {getString} from './../utils/Converter';
import SmsRetriever from 'react-native-sms-retriever';
import AppButton from './UI/AppButton';
import colors from '../constants/colors';
import { subscriptionService } from '../services/subscriptionService';

interface IProps {
  otp?: string;
  modalVisible: boolean;
  isLoading?: boolean;
  buttonText?: string;
  label?: string;
  resendTitle?: string;
  title?: string;
  onSetOtp: (otp: string) => void;
  onSendOTP?: () => void;
  onClose?: () => void;
  onComplate: () => void;
  style?: StyleProp<ViewStyle>;
}

const OtpModal: React.FC<IProps> = props => {
  const [error, setError] = useState('');
  const onSmsListener = async () => {
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        SmsRetriever.addSmsListener(event => {
          if (event && event?.message) {
            try {
              const otpobj = /(\d{4})/g?.exec(getString(event?.message));
            if (otpobj && otpobj?.length > 0) {
              props.onSetOtp(otpobj[1]);
              Keyboard.dismiss();
            }
            } catch (error) {
              console.log(JSON.stringify(error))
            }
          }
        })
      }
    } catch (error) {}
  };

  useEffect(() => {
    if(Platform.OS == 'android') {
    onSmsListener();
  }

    return () => {
      try {
        SmsRetriever.removeSmsListener();
      } catch (_) {}
    };
  }, [Platform.OS]);

  useEffect(() => {
    if(error) {
      setError('');
    }
  }, [props.otp])

  useEffect(() => {
    subscriptionService.getData().subscribe({
      next: res => {
        if(res?.key === 'otp_error') {
          setError(res.data);
        }
      }
    });

    return () => {
      subscriptionService.clearData();
    }
  })

  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;

  return (
    <Modal
      visible={props.modalVisible}
      onRequestClose={props.onClose}
      animationType="slide">
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView
          {...(Platform.OS === 'ios' && {behavior: 'padding'})}
          style={styles.over}>
          <TouchableOpacity style={styles.modalClose} onPress={() => props.onClose?.()}>
            <Image
              source={require('./../assets/images/close40x40.png')}
              style={styles.modalCloseIcon}
            />
          </TouchableOpacity>
          <View style={styles.otpContent}>
            <FloatingLabelInput
              value={props.otp}
              onChangeText={props.onSetOtp}
              onRetry={props.onSendOTP}
              title={props.title || translate.t('otp.otpSentBlank')}
              resendTitle={props.resendTitle || translate.t('otp.resend')}
              label={props.label || translate.t('otp.smsCode')}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null }
          </View>
          <View style={styles.buttons}>
            <AppButton
              isLoading={props.isLoading}
              onPress={props.onComplate}
              title={props.buttonText || translate.t('common.next')}
            />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  otpContent: {
    //flex: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttons: {
    //flex: 2,
    paddingHorizontal: 20,
  },
  modalClose: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 30 : 40,
    right: 15,
    padding: 8,
    flex: 1,
    width: 40,
  },
  modalCloseIcon: {
    width: 24,
    height: 24,
  },
  over: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: 40,
  },
  error: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 11,
    color: colors.danger,
    marginTop: 7,
    marginHorizontal: 18
  }
});

export default OtpModal;
