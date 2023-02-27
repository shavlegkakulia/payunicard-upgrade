import {NavigationContainerRef} from '@react-navigation/core';
import {CommonActions} from '@react-navigation/routers';
import {DrawerMovementOption} from 'react-native-gesture-handler/lib/typescript/components/DrawerLayout';
import Routes from '../navigation/routes';
// import analytics from '@react-native-firebase/analytics';

let _navigator: NavigationContainerRef<ReactNavigation.RootParamList> | undefined = undefined;

let backHandler = () => {};

const setBackHandler = (fn: () => void) => {
  backHandler = fn;
};

let currentRoute: string = Routes.Home;

function setCurrentRoute(routeName: string) {
  currentRoute = routeName;
}

function setTopLevelNavigator(navigatorRef: NavigationContainerRef<ReactNavigation.RootParamList>) {
  _navigator = navigatorRef;
}

interface IParams {
  routeName: string;
  params?: any;
}

function navigate(routeName: any, params?: any) { 
  if (routeName === currentRoute) return;

  // (async() => {
  //   await analytics().logScreenView({
  //     screen_name: routeName,
  //     screen_class: routeName,
  //   });
  // })();

  let parameters: IParams = {
    routeName: routeName,
  };
  if (params) {
    parameters = {routeName: parameters.routeName, params: params};
  }

  setCurrentRoute(routeName);
  _navigator?.dispatch(
    CommonActions.navigate({
      name: routeName,
      params: params,
    }),
  );
}

function dispatch({
  type,
  payload,
  source,
  target,
}: {
  type: string;
  payload?: object | undefined;
  source?: string | undefined;
  target?: string | undefined;
}) {
  _navigator?.dispatch({
    type,
    payload,
    source,
    target,
  });
}

const GoBack = (skipbackHandler?: boolean) => {
  if(!skipbackHandler) {
    backHandler();
  }
  _navigator?.goBack();
};

// add other navigation functions that you need and export them

export default {
  _navigator,
  navigate,
  setTopLevelNavigator,
  setCurrentRoute,
  currentRoute,
  dispatch,
  setBackHandler,
  GoBack,
};
