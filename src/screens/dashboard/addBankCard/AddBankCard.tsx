import React, {useEffect, useState} from 'react';
import {StyleSheet, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {useDispatch, useSelector} from 'react-redux';
import FullScreenLoader from '../../../components/FullScreenLoading';
import colors from '../../../constants/colors';
import Routes from '../../../navigation/routes';
import {PUSH} from '../../../redux/actions/error_action';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../../redux/action_types/translate_action_types';
import CardService from '../../../services/CardService';
import NavigationService from '../../../services/NavigationService';
import TransactionService from '../../../services/TransactionService';
import {getString} from '../../../utils/Converter';
import {parseUrlParamsegex} from '../../../utils/Regex';

const AddBankCard: React.FC = () => {
  const [tranId, setTranId] = useState<string | null | undefined>();
  const [isEcommerce, setIsEcommerce] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const dispatch = useDispatch<any>();

  const addBankCard = () => {
    CardService.AddUserBankCard().subscribe({
      next: Response => {
        if (Response.data.ok) {
          setIsEcommerce(Response.data.data?.redirectUrl);
        } else {
          dispatch(PUSH(translate.t('generalErrors.errorOccurred')));
        }
      },
      complete: () => setIsLoading(false),
      error: () => {
        dispatch(PUSH(translate.t('generalErrors.errorOccurred')));
        setIsLoading(false);
      },
    });
  };

  const CheckTransaction = () => {
    TransactionService.GetPayBills(undefined, tranId).subscribe({
      next: Response => {
        if (Response.data.Ok) {
          if (
            Response.data.Data?.Status === 6 ||
            Response.data.Data?.Status === 50 ||
            (Response.data.Data?.Status == 33 &&
              Response.data.Data?.forOpClassCode == 'B2B.Recurring')
          ) {
            NavigationService.navigate(Routes.AddBankCardSucces);
          } else {
            dispatch(PUSH(translate.t('generalErrors.errorOccurred')));
            NavigationService.GoBack();
          }
        } else {
          dispatch(PUSH(translate.t('generalErrors.errorOccurred')));
          setIsLoading(false)
          NavigationService.GoBack();
        }
      },
      complete: () => setIsLoading(false),
      error: err => {
        dispatch(PUSH(getString(err)));
        setIsLoading(false);
        NavigationService.GoBack();
      },
    });
  };

  const _onNavigationStateChange = (webViewState: WebViewNavigation) => {
    let match: RegExpExecArray | null;
    while ((match = parseUrlParamsegex.exec(webViewState.url.toString()))) {
      let m = match[1];
      if (m.toString() === 'trans_id') {
        setTranId(decodeURI(match[2]));
      }
    }

    const retriveUrl = webViewState.url.toString().trim();
   
    if (retriveUrl.endsWith('Payment_Success')) {
      setIsEcommerce(undefined);
      CheckTransaction();
    } else if (retriveUrl.endsWith('Payment_Failure')) {
      setIsEcommerce(undefined);
      dispatch(PUSH(translate.t('generalErrors.errorOccurred')));
      NavigationService.GoBack();
    }
  };

  useEffect(() => {
    addBankCard();
  }, []);

  return isLoading ? (
    <FullScreenLoader />
  ) : (
    <ScrollView contentContainerStyle={styles.avoid}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.avoid}>
        <WebView
          source={{uri: getString(isEcommerce)}}
          onNavigationStateChange={_onNavigationStateChange.bind(this)}
          cacheEnabled={false}
          thirdPartyCookiesEnabled={true}
        />
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
});

export default AddBankCard;
