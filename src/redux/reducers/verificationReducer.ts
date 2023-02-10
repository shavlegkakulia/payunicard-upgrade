import {ITransactionCategoryInterface} from '../../screens/dashboard/Verification/Index';
import {
  IVerficationAction,
  IVerficationState,
  SET_VER_ADDRESS,
  SET_VER_CITY,
  SET_VER_COUNTRIES,
  SET_VER_COUNTRY,
  SET_VER_COUNTRY2,
  SET_VER_WORKTTYPES,
  SET_VER_EPLOIMENTSTATUS,
  SET_VER_EPLOIMENTSTATUSES,
  SET_VER_POSTCODE,
  SET_VER_TITLE,
  SET_VER_JOBTYPE,
  SET_VER_COMPLIMENTARY,
  SET_VER_OCCUPIEDPOSITION,
  SET_VER_CUSTOMEREXPECTEDTURNOVERTYPES,
  SET_VER_CUSTOMEREXPECTEDTURNOVERTYPE,
  SET_VER_TRANSACTIONCATREGORIES,
  SET_VER_ANOTHERTRANSACTIONCATREGORIES,
  SET_VER_STARTVERIFICATION,
  SET_VER_USERKYCDATA,
  SET_VER_ISLOADING,
  SET_VER_RESETSTATE,
  SET_VER_PLACE
} from '../action_types/verification_action_types';

export const TransactionCategories: ITransactionCategoryInterface[] = [
  {id: 1, value: 'verification.comAndUtils', active: false},
  {id: 2, value: 'verification.transport', active: false},
  {id: 3, value: 'verification.intertransactions', active: false},
  {id: 4, value: 'verification.gamblings', active: false},
  {id: 5, value: 'verification.other', active: false},
];

const initialState: IVerficationState = {
  isLoading: false,
  countryes: undefined,
  country: undefined,
  country2: undefined,
  city: undefined,
  address: undefined,
  postCode: undefined,
  placeItem: undefined,
  selectedEmploymentStatus: undefined,
  employmentStatuses: undefined,
  customerWorkTypes: undefined,
  selectedJobType: undefined,
  complimentary: undefined,
  occupiedPosition: undefined,
  customerExpectedTurnoverTypes: undefined,
  customerExpectedTurnoverType: undefined,
  transactionCategories: TransactionCategories,
  anotherTransactionCategory: undefined,
  startVerification: false,
  userKYCData: undefined,
};

const VerificationReducer = (
  state: IVerficationState = initialState,
  action: IVerficationAction,
) => {
  switch (action.type) {
    case SET_VER_RESETSTATE:
      return {
        isLoading: false,
        countryes: undefined,
        country: undefined,
        country2: undefined,
        city: undefined,
        address: undefined,
        postCode: undefined,
        placeItem: undefined,
        selectedEmploymentStatus: undefined,
        employmentStatuses: undefined,
        customerWorkTypes: undefined,
        selectedJobType: undefined,
        complimentary: undefined,
        occupiedPosition: undefined,
        customerExpectedTurnoverTypes: undefined,
        customerExpectedTurnoverType: undefined,
        transactionCategories: TransactionCategories,
        anotherTransactionCategory: undefined,
        startVerification: false,
        userKYCData: undefined,
      };
    case SET_VER_ISLOADING:
      return {...state, isLoading: action.isLoading};
    case SET_VER_COUNTRIES:
      return {...state, countryes: action.countryes};
    case SET_VER_COUNTRY:
      return {...state, country: action.country};
    case SET_VER_COUNTRY2:
      return {...state, country2: action.country2};
    case SET_VER_PLACE: 
      return {...state, placeItem: action.placeItem}
    case SET_VER_CITY:
      return {...state, city: action.city};
    case SET_VER_ADDRESS:
      return {...state, address: action.address};
    case SET_VER_POSTCODE:
      return {...state, postCode: action.postCode};
    case SET_VER_EPLOIMENTSTATUS:
      return {
        ...state,
        selectedEmploymentStatus: action.selectedEmploymentStatus,
      };
    case SET_VER_EPLOIMENTSTATUSES:
      return {...state, employmentStatuses: action.employmentStatuses};
    case SET_VER_WORKTTYPES:
      return {...state, customerWorkTypes: action.customerWorkTypes};
    case SET_VER_JOBTYPE:
      return {...state, selectedJobType: action.selectedJobType};
    case SET_VER_COMPLIMENTARY:
      return {...state, complimentary: action.complimentary};
    case SET_VER_OCCUPIEDPOSITION:
      return {...state, occupiedPosition: action.occupiedPosition};
    case SET_VER_CUSTOMEREXPECTEDTURNOVERTYPES:
      return {
        ...state,
        customerExpectedTurnoverTypes: action.customerExpectedTurnoverTypes,
      };
    case SET_VER_CUSTOMEREXPECTEDTURNOVERTYPE:
      return {
        ...state,
        customerExpectedTurnoverType: action.customerExpectedTurnoverType,
      };
    case SET_VER_TRANSACTIONCATREGORIES:
      return {...state, transactionCategories: action.transactionCategories};
    case SET_VER_ANOTHERTRANSACTIONCATREGORIES:
      return {
        ...state,
        anotherTransactionCategory: action.anotherTransactionCategory,
      };
    case SET_VER_STARTVERIFICATION:
      return {...state, startVerification: action.startVerification};
    case SET_VER_USERKYCDATA:
      return {...state, userKYCData: action.userKYCData};
    default:
      return {...state};
  }
};

export default VerificationReducer;
