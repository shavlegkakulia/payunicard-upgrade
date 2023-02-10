import React, { useEffect } from "react";
import { View, StyleSheet, StyleProp, ViewStyle, Keyboard } from "react-native";
import FloatingLabelInput from "../../../../containers/otp/Otp";
import colors from "../../../../constants/colors";
import {
    ITranslateState,
    IGlobalState as ITranslateGlobalState,
  }  from "../../../../redux/action_types/translate_action_types";
import { useSelector } from "react-redux";
import { getString } from "../../../../utils/Converter";
import SmsRetriever from 'react-native-sms-retriever';

interface IProps {
    otp?: string;
    onSetOtp: (otp: string) => void;
    onSendUnicardOTP: () => void;
    style?: StyleProp<ViewStyle>;
}

const SetOtp: React.FC<IProps> = (props) => {
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
        } catch (error) {
        
        }
      };
    
      useEffect(() => {
        onSmsListener();
    
        return () => SmsRetriever.removeSmsListener();
      }, []);

    const translate = useSelector<ITranslateGlobalState>(
        state => state.TranslateReduser,
      ) as ITranslateState;
      
    return (
        <View style={[styles.container, props.style]}>
            <FloatingLabelInput
                    Style={styles.otpBox}
                    label={translate.t('otp.smsCode')}
                    title={translate.t('otp.otpSent')}
                    resendTitle={translate.t('otp.resend')}
                    value={props.otp}
                    onChangeText={props.onSetOtp}
                    onRetry={props.onSendUnicardOTP} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        backgroundColor: colors.white
    },
    otpBox: {
    }
});

export default SetOtp;