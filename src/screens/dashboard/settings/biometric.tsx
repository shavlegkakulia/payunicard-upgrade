import React, {useEffect, useState} from 'react';
import ReactNativeBiometrics from "react-native-biometrics";
import { useSelector } from 'react-redux';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../../redux/action_types/translate_action_types';

interface IProps {
  start: boolean;
  returnStatus: (status: boolean, available?: boolean | undefined) => void;
  onSucces?: () => void;
  onlyStatusCheck?: boolean;
}

const rnBiometrics = new ReactNativeBiometrics();

const BiometricAuthScreen: React.FC<IProps> = props => {
  const [biometryType, setBiometryType] = useState<unknown>(null);
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  
  useEffect(() => {
    rnBiometrics.isSensorAvailable()
      .then((biometryType) => {
        console.log('FingerprintScanner', biometryType)
        if(biometryType.available) {
          setBiometryType(biometryType.biometryType);
        }
      })
      .catch(error => {
        props.returnStatus(error, false);
      });
  }, []);

  useEffect(() => {
    if (props.start) {
      if (biometryType !== null && biometryType !== undefined) {
        rnBiometrics.simplePrompt({ promptMessage: 'Confirm Biometrics', cancelButtonText: translate.t('common.cancel') })
        .then((resultObject) => {
            const { success } = resultObject
            if (success) {
              props.onSucces && props.onSucces();
            } else {
                console.log('user canceled');
                props.returnStatus(false);
            }
        })
        .catch(() => {
          props.returnStatus(false);
        })
    }
  }
  }, [props.start]);

  // const getMessage = () => {
  //   if (biometryType == 'FaceID') {
  //     return 'Scan your Face on the device to continue';
  //   } else {
  //     return translate.t('settings.easyLogin');
  //   }
  // };

  // const handleAuthenticationAttempted = (error: FingerprintScannerError) => {
  //   props.returnStatus(false);
  // }

  return null;
};

export default BiometricAuthScreen;
