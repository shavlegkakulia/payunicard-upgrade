import React, { useEffect } from 'react';
import { FetchUserDetail } from './../redux/actions/user_actions';
import { useDispatch, useSelector } from 'react-redux';
import {
  IAuthState,
  IGlobalState,
} from '../redux/action_types/auth_action_types';
import NetworkService from '../services/NetworkService';
import DashboardLayoutRightDarwer from '../navigation/DashboardLayoutRightDarwer';
import IdleHook from './idleHook';
import { KeyboardAvoidingView, Platform } from 'react-native';
type Props = {
  children: JSX.Element,
};
const DashboardLayout: React.FC<Props> = (props) => {
  const dispatch = useDispatch<any>();
  const state = useSelector<IGlobalState>(
    state => state.AuthReducer,
  ) as IAuthState;



  useEffect(() => {
    NetworkService.CheckConnection(() => {
      dispatch(FetchUserDetail(state.remember));
    });
  }, []);

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <DashboardLayoutRightDarwer>
        <IdleHook>{props.children}</IdleHook>
      </DashboardLayoutRightDarwer>
    </KeyboardAvoidingView>
  );
};

export default DashboardLayout;
