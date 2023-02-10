import currencies, {
  GEL,
  RUB,
  RUR,
  USD,
  EUR,
  GBP,
  TRY,
} from '../constants/currencies';
import { ka_ge } from '../lang';

export const CurrencyConverter = (value: string | number = '0') => {
  return parseFloat(value?.toString())
    .toFixed(2)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

export const CurrencySimbolConverter = (currency?: string, lang?: string) => {
  switch (currency) {
    case GEL:
      return lang === ka_ge ? currencies.GEL : GEL;
    case USD:
      return currencies.USD;
    case RUB:
      return currencies.RUB;
    case RUR:
      return currencies.RUR;
    case EUR:
      return currencies.EUR;
    case GBP:
      return currencies.GBP;
    case TRY:
      return currencies.TRY;
    default:
      return currency;
  }
};

export const getNumber = (value: string | number | undefined) => {
  let number = value?.toString();
  if (value === undefined) {
    return 0;
  }

  if (!number || number === '') {
    return 0;
  } else {
    if (number.indexOf('.') === -1) {
      return parseFloat(number.replace(',', '.'));
    } else {
      return parseFloat(number);
    }
  }
};

export const getString = (value: string | undefined | null) => {

  let string = '';
  if (value === undefined || value === null) {
    string = '';
  }
 

  if (typeof value === 'string') {
    try {
      string = value;
    } catch (_) {
      string = '';
    }
  }

  return string;
};

export const getArray = (value: Array<any> | undefined) => {
  let array: any = value;
  if (value === undefined) {
    array = [];
  }

  return array;
};
