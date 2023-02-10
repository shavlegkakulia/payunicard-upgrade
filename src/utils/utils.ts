import {getNumber, getString} from './Converter';
export const sleep = async (callBack: Function, timeout: number = 0) => {
  await new Promise(res => setTimeout(res, timeout));
  return callBack;
};

export const objectHasValue = (obj: any) => Boolean(Object.keys(obj || {})[0]);

export const stringToObject = (value: string) => {
  if (!value) return {};
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_) {
    return {};
  }
};

export const formatDate = (
  dateString: string | undefined,
  separate?: string,
  includeTime?: boolean,
) => {
  if (!dateString) return '';
  let dateObj = new Date(dateString),
    month = dateObj.getUTCMonth() + 1, //months from 1-12
    day = dateObj.getUTCDate(),
    year = dateObj.getUTCFullYear(),
    minutes = dateObj.getMinutes(),
    hour = dateObj.getHours(),
    newdate =
      ('0' + day).slice(-2) +
      (separate || '.') +
      ('0' + month).slice(-2) +
      (separate || '.') +
      year +
      (includeTime
        ? ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2)
        : '');
  return newdate;
};

export const minusMonthFromDate = (
  minusmonthcount: number = 1,
  date: Date | string | undefined = undefined,
) => {
  let _D;
  if (typeof date === 'string') {
    _D = new Date(date);
  } else if (typeof date === 'undefined') {
    _D = new Date();
  } else {
    _D = date;
  }

  _D?.setMonth(_D.getMonth() - minusmonthcount);
  return _D;
};

export const futureDay = (daysLeft: number) => {
  return new Date(
    Date.now() + getNumber(daysLeft) * 24 * 60 * 60 * 1000,
  ).toDateString();
};

export const dateDiff = (date1: Date, date2: Date) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2 - d1;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
let timeout: NodeJS.Timeout | null;
export const debounce = (func: Function, wait: number, immediate?: boolean) => {


  return function (e: Function) {
    let context: any = e,
      args = arguments;

    let callNow = immediate && !timeout;

    timeout && clearTimeout(timeout);

    timeout = setTimeout(function () {
      timeout = null;

      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);

    if (callNow) func.apply(context, args);
  };
};

export const highLightWord = (
  word?: string | undefined,
  highlight?: string,
) => {
  const startIndex = getNumber(word?.indexOf(getString(highlight)));
  const endIndex = startIndex + getString(highlight).length;
  const startString = getString(word?.slice(0, startIndex));
  const endString = getString(word?.slice(endIndex));
  const match = word?.slice(startIndex, getString(highlight).length);

  return {
    startString,
    match,
    endString,
  };
};


