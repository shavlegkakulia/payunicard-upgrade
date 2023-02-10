export const FETCH_TRANSLATE = 'FETCH_TRANSLATE';
export const SET_LOADING = 'SET_LOADING';
export const SET_KEY = 'SET_KEY';

export interface ITranslateState {
    key: string;
    isLoading: boolean;
    translates: any;
    next: () => string;
    t: (key: string) => string;
}

export interface ITranslateAction {
    isLoading: boolean;
    accesToken: string,
    translates: any;
    key: string;
    type: string
}

export interface IGlobalState {
    TranslateReduser: ITranslateState
}