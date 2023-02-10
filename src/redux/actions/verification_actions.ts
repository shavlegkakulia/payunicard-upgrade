import KvalificaServices from '../../services/KvalificaServices';
import PresentationServive from '../../services/PresentationServive';
import UserService from '../../services/UserService';
import {
  SET_VER_COUNTRIES,
  SET_VER_CUSTOMEREXPECTEDTURNOVERTYPES,
  SET_VER_EPLOIMENTSTATUSES,
  SET_VER_ISLOADING,
  SET_VER_USERKYCDATA,
  SET_VER_WORKTTYPES,
} from '../action_types/verification_action_types';

export const GetCitizenshipCountries = (callback?: () => void) => (dispatch: any) => {
  dispatch({type: SET_VER_ISLOADING, isLoading: true});
  PresentationServive.GetCitizenshipCountries().subscribe({
    next: Response => {
      dispatch({
        type: SET_VER_COUNTRIES,
        countryes: Response.data?.data?.countries,
      });
    },
    error: () => {
        dispatch({type: SET_VER_ISLOADING, isLoading: false});
        callback && callback();
    },
    complete: () => {
        dispatch({type: SET_VER_ISLOADING, isLoading: false});
        callback && callback();
    }
  });
};

export const GetCustomerEmploymentStatusTypes = () => (dispatch: any) => {
  dispatch({type: SET_VER_ISLOADING, isLoading: true});
  UserService.GetCustomerEmploymentStatusTypes().subscribe({
    next: Response => {
      dispatch({
        type: SET_VER_EPLOIMENTSTATUSES,
        employmentStatuses: Response.data?.data?.statuses,
      });
    },
    error: () => dispatch({type: SET_VER_ISLOADING, isLoading: false}),
    complete: () => dispatch({type: SET_VER_ISLOADING, isLoading: false}),
  });
};

export const GetCustomerWorkTypes = () => (dispatch: any) => {
  dispatch({type: SET_VER_ISLOADING, isLoading: true});
  UserService.GetCustomerWorkTypes().subscribe({
    next: Response => {
      dispatch({
        type: SET_VER_WORKTTYPES,
        customerWorkTypes: Response.data?.data?.types,
      });
    },
    error: () => dispatch({type: SET_VER_ISLOADING, isLoading: false}),
    complete: () => dispatch({type: SET_VER_ISLOADING, isLoading: false}),
  });
};

export const GetCustomerExpectedTurnoverTypes = (callback?: () => void) => (dispatch: any) => {
  dispatch({type: SET_VER_ISLOADING, isLoading: true});
  UserService.GetCustomerExpectedTurnoverTypes().subscribe({
    next: Response => {
      dispatch({
        type: SET_VER_CUSTOMEREXPECTEDTURNOVERTYPES,
        customerExpectedTurnoverTypes: Response.data?.data?.types,
      });
    },
    error: () => {
        dispatch({type: SET_VER_ISLOADING, isLoading: false});
        callback && callback();
    },
    complete: () => {
        dispatch({type: SET_VER_ISLOADING, isLoading: false});
        callback && callback();
    },
  });
};

export const GetKycSessionData = () => (dispatch: any) => {
    dispatch({type: SET_VER_ISLOADING, isLoading: true});
    KvalificaServices.GetKycSessionData().subscribe({
      next: Response => {
        dispatch({
          type: SET_VER_USERKYCDATA,
          userKYCData: Response.data?.data?.data,
        });
      },
      error: () => dispatch({type: SET_VER_ISLOADING, isLoading: false}),
      complete: () => dispatch({type: SET_VER_ISLOADING, isLoading: false}),
    });
  };
