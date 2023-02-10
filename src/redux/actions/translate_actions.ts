import { FETCH_TRANSLATE, SET_LOADING } from './../action_types/translate_action_types';
import translateList from './../../lang/index';
import storage from './../../services/StorageService';
import { LOCALE_IN_STORAGE } from '../../constants/defaults';
import Store from './../store';


export const use = (key: string) => async(dispatch: any) => {
    dispatch({type: SET_LOADING, isLoading: true});
    await storage.setItem(LOCALE_IN_STORAGE, key);
    dispatch({type: FETCH_TRANSLATE, translates: translateList[key], key: key});
    dispatch({type: SET_LOADING, isLoading: false});
}

export const setKey = (key: string) => (dispatch: any) => {
    dispatch({type: FETCH_TRANSLATE, key: key});
}

export const t = (key: string) => (dispatch: any) => {
    let keys = key.split('.');
    let store = Store.getState().TranslateReduser.translates;
    for (let t of keys) {
      if (!store) store = Store.getState().TranslateReduser.translates;
      else store = store[t];
    }
    return store || '';
}