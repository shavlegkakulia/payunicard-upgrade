import {NativeModules, Platform} from 'react-native';
const {RTCAppleWalletModule} = NativeModules;

export type ICardsInWallet = {
  primaryAccountIdentifier: string,
  primaryAccountNumberSuffix: string
}

export const parseWalletResponse = (data: string) => {
    let _data: {text: string, status: boolean} = {
      text: '',
      status: false
    }
    const json = data.match(/\[(.*?)\]/g);
    if(json?.length) {
      _data.text = json[0].replace(/[\[\]']+/g,'');
      if(json.length > 1) {
        let s = json[1].replace(/[\[\]']+/g,'');
        if(s === 'false')
        _data.status = false;
        else _data.status = true;
      }
    }
    return _data;
  };

  export const onEcheckElements = () => {
    return new Promise((resolve, reject) => {
      RTCAppleWalletModule.onEcheckElements((data: ICardsInWallet[]) => {
        return resolve(data as ICardsInWallet[]);
      });
    })
    
  }

  
  export const AddCardToWallet = (
    cardId: number,
    authToken: string,
    cardMaks: string,
    cardHolderName?: string,
    callBack?: (data: string) => void,
  ) => {
    if (!cardHolderName || !cardId || !cardMaks || !authToken || Platform.OS !== 'ios') return;
    console.log(cardHolderName, cardId, cardMaks, authToken);
    RTCAppleWalletModule.onEnroll(
      cardHolderName,
      cardId,
      cardMaks,
      authToken,
      callBack,
    );
  };