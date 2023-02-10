import {ITransactionCategoryInterface} from '../../screens/dashboard/Verification/Index';
import {IKCData} from '../../services/KvalificaServices';
import {ICitizenshipCountry} from '../../services/PresentationServive';
import {IExpectedType, IStatus, IType2} from '../../services/UserService';

export const SET_VER_ISLOADING = 'SET_VER_ISLOADING';
export const SET_VER_TITLE = 'SET_VER_TITLE';
export const SET_VER_COUNTRIES = 'SET_VER_COUNTRIES';
export const SET_VER_COUNTRY = 'SET_VER_COUNTRY';
export const SET_VER_COUNTRY2 = 'SET_VER_COUNTRY2';
export const SET_VER_PLACE = 'SET_VER_PLACE';
export const SET_VER_CITY = 'SET_VER_CITY';
export const SET_VER_ADDRESS = 'SET_VER_ADDRESS';
export const SET_VER_POSTCODE = 'SET_VER_POSTCODE';
export const SET_VER_EPLOIMENTSTATUS = 'SET_VER_EPLOIMENTSTATUS';
export const SET_VER_EPLOIMENTSTATUSES = 'SET_VER_EPLOIMENTSTATUSES';
export const SET_VER_WORKTTYPES = 'SET_VER_WORKTTYPES';
export const SET_VER_JOBTYPE = 'SET_VER_JOBTYPE';
export const SET_VER_COMPLIMENTARY = 'SET_VER_COMPLIMENTARY';
export const SET_VER_OCCUPIEDPOSITION = 'SET_VER_OCCUPIEDPOSITION';
export const SET_VER_CUSTOMEREXPECTEDTURNOVERTYPES =
  'SET_VER_CUSTOMEREXPECTEDTURNOVERTYPES';
export const SET_VER_CUSTOMEREXPECTEDTURNOVERTYPE =
  'SET_VER_CUSTOMEREXPECTEDTURNOVERTYPE';
export const SET_VER_TRANSACTIONCATREGORIES = 'SET_VER_TRANSACTIONCATREGORIES';
export const SET_VER_ANOTHERTRANSACTIONCATREGORIES =
  'SET_VER_ANOTHERTRANSACTIONCATREGORIES';
export const SET_VER_STARTVERIFICATION = 'SET_VER_STARTVERIFICATION';
export const SET_VER_USERKYCDATA = 'SET_VER_USERKYCDATA';
export const SET_VER_RESETSTATE = 'SET_VER_RESETSTATE';

export interface IVerficationState {
  isLoading: boolean;
  countryes: ICitizenshipCountry[] | undefined;
  country: ICitizenshipCountry | undefined;
  country2: ICitizenshipCountry | undefined;
  placeItem: ICitizenshipCountry | undefined;
  city: string | undefined;
  address: string | undefined;
  postCode: string | undefined;
  selectedEmploymentStatus: IStatus | undefined;
  employmentStatuses: IStatus[] | undefined;
  customerWorkTypes: IType2[] | undefined;
  selectedJobType: IType2 | undefined;
  complimentary: string | undefined;
  occupiedPosition: string | undefined;
  customerExpectedTurnoverTypes: IExpectedType[] | undefined;
  customerExpectedTurnoverType: IExpectedType | undefined;
  transactionCategories: ITransactionCategoryInterface[];
  anotherTransactionCategory: string | undefined;
  startVerification: boolean;
  userKYCData: IKCData | undefined;
}

export interface IVerficationAction {
  isLoading?: boolean;
  countryes: ICitizenshipCountry[] | undefined;
  country: ICitizenshipCountry | undefined;
  country2: ICitizenshipCountry | undefined;
  placeItem: ICitizenshipCountry | undefined;
  city: string | undefined;
  type: string | undefined;
  address: string | undefined;
  postCode: string | undefined;
  selectedEmploymentStatus: IStatus | undefined;
  employmentStatuses: IStatus[] | undefined;
  customerWorkTypes: IType2[] | undefined;
  selectedJobType: IType2 | undefined;
  complimentary: string | undefined;
  occupiedPosition: string | undefined;
  customerExpectedTurnoverTypes: IExpectedType[] | undefined;
  customerExpectedTurnoverType: IExpectedType | undefined;
  transactionCategories: ITransactionCategoryInterface[];
  anotherTransactionCategory: string | undefined;
  startVerification: boolean;
  userKYCData: IKCData | undefined;
}

export interface IGlobalState {
  VerificationReducer: IVerficationState;
}
