import {
  INavigationActions,
  INavigationState,
  NAVIGATION_ACTIONS,
} from '../action_types/navigation_action_types';

const initialStates: INavigationState = {
  parentRoute: undefined,
  currentRoute: undefined,
  index: 0,
  parentIndex: 0,
  visible: true,
  backAction: Function
};

export default function NavigationReducer(
  state = initialStates,
  actions: INavigationActions,
) {
  switch (actions.type) {
    case NAVIGATION_ACTIONS.SET_PARENT_ROUTE:
      return {...state, parentRoute: actions.parentRoute};
    case NAVIGATION_ACTIONS.SET_CURRENT_ROUTE_INDEX:
      return {...state, index: actions.index};
    case NAVIGATION_ACTIONS.SET_PARENT_ROUTE_INDEX:
      return {...state, parentIndex: actions.index};
    case NAVIGATION_ACTIONS.SET_CURRENT_ROUTE:
      return {...state, currentRoute: actions.currentRoute};
    case NAVIGATION_ACTIONS.SET_HIDER_VISIBLE:
      return {...state, visible: actions.visible};
      case NAVIGATION_ACTIONS.SET_BACK_ACTION:
        return {...state, backAction: actions.backAction}
    default:
      return {...state};
  }
}
