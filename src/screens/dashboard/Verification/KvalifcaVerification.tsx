// import {
//   KvalifikaSDK,
//   KvalifikaSDKLocale,
// } from '@kvalifika/react-native-sdk';
import React, {useEffect, useState} from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import colors from '../../../constants/colors';
import { ka_ge } from '../../../lang';
import Routes from '../../../navigation/routes';
import { PUSH } from '../../../redux/actions/error_action';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../../redux/action_types/translate_action_types';
import { SET_VER_USERKYCDATA } from '../../../redux/action_types/verification_action_types';
import KvalificaServices, { getKycFullYear, IKCData } from '../../../services/KvalificaServices';
import NavigationService from '../../../services/NavigationService';
import { getString } from '../../../utils/Converter';

const kIds = {
  prod: 'lUJvOmqrZC2dLYz5hjJ',
  //'lUJvOmqrZC2dLYz5hjJ',
  dev: '7cd20a8a-ea42-44d8-bca5-c843ce34cb62'
}

const KvalifcaVerification: React.FC = () => {
  const [sesId, setSesId] = useState<string | undefined>();
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const dispatch = useDispatch<any>();;

  const closeKvalificaVerification = () => {

    NavigationService.navigate(Routes.VerificationStep6, {
      verificationStep: 6
    })
  };

  const setUserKYCData = (c: IKCData | undefined) => {
    dispatch({type: SET_VER_USERKYCDATA, userKYCData: c});
  };
  
  const parseAndSetKCdata = (data: IKCData | undefined) => {
    const {
      birthDate,
      countryID,
      documentBackSide,
      documentFrontSide,
      documentNumber,
      documetType,
      firstName,
      lastName,
      personalNumber,
      selfImages,
      sex,
    } = data || {};

    let yearPattern = /^[\d]{4}-[\d]{2}-[\d]{2}$/;
    let parsedBirthDate = !yearPattern.test(birthDate!.split('/').reverse().join('-'))? "" : birthDate!.split('/').reverse().join('-');
    console.log('documetType', documetType)

    setUserKYCData({
      customerSelfContent: 'Selfie',
      customerSelfName: selfImages?.[0].split('/')[4],
      customerSelf: selfImages?.[0],
      documetType: documetType,
      documentBackSideContent: 'Back',
      documentBackSide: documentBackSide,
      documentBackSideName: documentBackSide?.split('/')[4],
      documentFrontSideContent: 'Front',
      documentFrontSide: documentFrontSide,
      documentFrontSideName: documentFrontSide?.split('/')[4],
      firstName,
      lastName,
      birthCityId: 0,
      countryID,
      sex: sex,
      birthDate: parsedBirthDate,
      personalNumber,
      documentNumber,
    });
  };
  
  const closeKycSession = (sessionId: string | undefined, complated: boolean) => {
  
    if (!sessionId) {
      NavigationService.navigate(Routes.VerificationStep4, {
        verificationStep: 4
      })
      return;
    }
    KvalificaServices.CloseKycSession(sessionId).subscribe({
      next: Response => {
        parseAndSetKCdata(Response.data?.data);
      },
      complete: () => {
        if(complated) {
          closeKvalificaVerification();
        } else {
          NavigationService.navigate(Routes.VerificationStep4);
        }
      },
      error: () => {
        NavigationService.GoBack();
      }
    });
  };


//   useEffect(() => {
//     KvalifikaSDK.initialize({
//       appId: __DEV__ ? kIds.dev : kIds.prod,
//       locale: (translate.key === ka_ge) ?  KvalifikaSDKLocale.GE: KvalifikaSDKLocale.EN,
//       development: __DEV__ ? true : false,
//       logo: 'logo',
//       documentIcon: 'document_icon'
//     });
//   }, []);

// // Now It works, sorry, It should be true, I think, can you plz try, okey sec 
//   useEffect(() => {
//       KvalifikaSDK.onInitialize(() => {
//         console.log('Kvalifika', 'Kvalifika SDK Initialized');
//         KvalifikaSDK.startSession();
//       });

//       KvalifikaSDK.onStart(sessionId => {
//         setSesId(sessionId);
//         console.log(`Started with id: ${sessionId}`);
//       });

//       KvalifikaSDK.onFinish(sessionId => {
//         console.log('Kvalifika', `Session finished with id: ${sessionId}`);
//         closeKycSession(sessionId, true);
//       });

//       KvalifikaSDK.onError((error, message) => {
//         console.log('OnKvalifikaError --->', error, message);

//         if(error !== 'USER_CANCELLED') {
//           dispatch(PUSH(message));
//         }
//         closeKycSession(sesId, false);
//       });

//     return () => {
//       console.log('Kvalifika Unmounted');
//       // Remove callbacks to avoid duplicate listeners if useEffect runs multiple times or remounts
//       KvalifikaSDK.removeCallbacks();
//     };
//   }, []);

  return <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default KvalifcaVerification;
