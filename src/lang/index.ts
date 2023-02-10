import ka from './ka';
import en from './en';

interface IKey {
    [key: string]: any;
}

export const KA = 'ka-GE';
export const EN = 'en-US';

export const KA_GE = 'KA';
export const ka_ge = 'ka';
export const EN_US = 'en';
export const en_us = 'en';

export const LANG_KEYS: IKey = {
    ka: KA, en: EN
}

const translateList: IKey = {
     ka, en
}

export default translateList