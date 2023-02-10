
import { en_us, ka_ge } from '../../lang';
import { ITranslateState, ITranslateAction, FETCH_TRANSLATE, SET_LOADING, SET_KEY } from './../action_types/translate_action_types';

const initialState: ITranslateState = {
    translates: {},
    key: ka_ge,
    isLoading: false,
    next: function() {
        return this.key === ka_ge ? en_us : ka_ge
    },
    t: function(key: string) {
        let keys = key.split('.');
        let store = null;
        for (let t of keys) {
          if (!store) store = this.translates[t];
          else store = store[t];
        }
        return store || '';
    }
}

const TranslateReduser = (state: ITranslateState = initialState, action: ITranslateAction) => {
    switch(action.type) {
        case FETCH_TRANSLATE:
            return {
                ...state, translates: action.translates, key: action.key
            }
        case SET_LOADING:
            return {
                ...state, isLoading: action.isLoading
            }
        case SET_KEY:
            return {
                ...state, key: action.key
            }
        default: return {
            ...state
        }
    }
}

export default TranslateReduser