import React, {PureComponent} from 'react';
import {
  View,
  PanResponder,
  PanResponderInstance,
  StyleProp,
  ViewStyle,
  Modal,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import AppButton from '../components/UI/AppButton';
import colors from '../constants/colors';
import {Logout} from '../redux/actions/auth_actions';
import {t} from '../redux/actions/translate_actions';
import { subscriptionService } from '../services/subscriptionService';
import BackgroundTimer from 'react-native-background-timer';
import { CloseDrawer } from '../services/NavigationService';

interface IProps {
  timeForInactivity: number;
  logout?: Function;
  t?: Function;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  isAuth?: boolean;
}

class UserInactivity extends PureComponent<IProps, any> {
  panResponder: PanResponderInstance | undefined;
  timeout: number | undefined;
  popupTimeout: number | undefined;

  constructor(props: any) {
    super(props);
  }

  static defaultProps = {
    timeForInactivity: 10000,
    style: {
      flex: 1,
    },
  };

  state = {
    active: true,
    modalVisible: false,
    auth: false,
  };

  onAction = (value: boolean) => {
    if (!value) {
      this.props.logout && this.props.logout();
      if(CloseDrawer && CloseDrawer[0]) {
        CloseDrawer[0]();
        if(CloseDrawer?.[1]) {
          CloseDrawer[1]();
        }
      }
    }
  };

  registerPan() {
    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture:
        this.onMoveShouldSetPanResponderCapture,
      onStartShouldSetPanResponderCapture:
        this.onMoveShouldSetPanResponderCapture,
    });
    this.handleInactivity();
  }

  UNSAFE_componentWillMount() {
    if (this.props.isAuth) {
      if(Platform.OS === 'ios') {
        BackgroundTimer.start();
      }
      this.registerPan();
    }
  }

  componentWillUnmount() {
    if (this.timeout) BackgroundTimer.clearTimeout(this.timeout);
    if (this.popupTimeout) BackgroundTimer.clearTimeout(this.popupTimeout);
    if(Platform.OS === 'ios') {
      BackgroundTimer.stop();
    }
  }

  componentDidUpdate() {
    if (!this.props.isAuth) {
      if (this.timeout) BackgroundTimer.clearTimeout(this.timeout);
      if (this.popupTimeout) BackgroundTimer.clearTimeout(this.popupTimeout);
      this.panResponder = undefined;
    } else {
      if (!this.panResponder) {
        this.registerPan();
      }
    }
    return true;
  }

  /**
   * This method is called whenever a touch is detected. If no touch is
   * detected after `this.props.timeForInactivity` milliseconds, then
   * `this.state.inactive` turns to true.
   */

  handleInactivity = () => {
    if (this.timeout) BackgroundTimer.clearTimeout(this.timeout);
    if (this.popupTimeout) BackgroundTimer.clearTimeout(this.popupTimeout);
    this.setState(
      {
        active: true,
      },
      () => {
        this.onAction(this.state.active); //true
      },
    );
    this.resetTimeout();
    this.initPopap();
    return false;
  };

  /**
   * If more than `this.props.timeForInactivity` milliseconds have passed
   * from the latest touch event, then the current state is set to `inactive`
   * and the `this.props.onInactivity` callback is dispatched.
   */

  timeoutHandler = () => {
    this.setState(
      {
        active: false,
      },
      () => {
        this.onAction(this.state.active); // false
      },
    );
  };

  resetTimeout = () => {
    this.timeout = BackgroundTimer.setTimeout(
      this.timeoutHandler,
      this.props.timeForInactivity,
    );
  };

  initPopap = () => {
    this.popupTimeout = BackgroundTimer.setTimeout(
      () => this.setState({modalVisible: true}),
      this.props.timeForInactivity - 30000, //30 second
    );
  };

  onMoveShouldSetPanResponderCapture = () => {
    this.handleInactivity();
    /**
     * In order not to steal any touches from the children components, this method
     * must return false.
     */
    return false;
  };

  onCloseModal() {
    this.setState({modalVisible: false}, () => {
      subscriptionService.sendData('force_redirect', true);
    });
  }

  render() {
    const {style, children} = this.props;
    let sessionTitle =
      this.props.t && this.props.t('common.sessionExpiredTitle');
    let sessionText = this.props.t && this.props.t('common.sessionExpiredText');
    if (!this.props.isAuth) {
      sessionText =
        this.props.t && this.props.t('common.sessionExpiredTextAfter');
    }

    return (
      <>
        <View
          style={style}
          collapsable={false}
          {...this.panResponder?.panHandlers}>
          {children}
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({modalVisible: false});
          }}>
          <TouchableOpacity
            style={styles.modal}
            activeOpacity={!this.props.isAuth ? 0.5 : 1}
            onPress={() => {
              if (!this.props.isAuth) {
                this.setState({modalVisible: false});
              }
            }}>
            <View style={styles.modalContent}>
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  {this.props.isAuth ? sessionTitle + '\n\n' : sessionText}
                  
                  {this.props.isAuth && <Text style={styles.modalText2}>{sessionText}</Text>}
                </Text>
              </View>
              <View style={styles.modalFooter}>
                {this.props.isAuth ? (
                  <>
                    <AppButton
                      style={[styles.modalButton, styles.buttonOne]}
                      backgroundColor={colors.inputBackGround}
                      color={colors.black}
                      TextStyle={styles.buttonText}
                      title={this.props.t && this.props.t('common.logout')}
                      onPress={() => {
                        this.props.logout && this.props.logout();
                        if(CloseDrawer && CloseDrawer[0]) {
                          CloseDrawer[0]();
                          if(CloseDrawer?.[1]) {
                            CloseDrawer[1]();
                          }
                        }
                      }}
                    />
                    <AppButton
                      style={[styles.modalButton, styles.buttonTwo]}
                      TextStyle={styles.buttonText}
                      title={this.props.t && this.props.t('common.continue')}
                      onPress={() => {
                        this.setState({modalVisible: false}, () => {
                          this.handleInactivity();
                        });
                      }}
                    />
                  </>
                ) : (
                  <AppButton
                    style={styles.modalButton}
                    backgroundColor={colors.inputBackGround}
                    color={colors.black}
                    TextStyle={styles.buttonText}
                    title={this.props.t && this.props.t('common.close')}
                    onPress={() => {
                      this.onCloseModal()
                    }}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    logout: () => dispatch(Logout()),
    t: (key: string) => dispatch(t(key)),
  };
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    width: Dimensions.get('window').width - 70,
  },
  modalBody: {
    padding: 17,
  },
  modalText: {
    fontFamily: 'FiraGO-Book',
    fontSize: 16,
    lineHeight: 19,
    color: colors.labelColor,
    textAlign: 'center',
  },
  modalText2: {
    fontSize: 11,
    lineHeight: 14,
  },
  modalFooter: {
    padding: 17,
    flexDirection: 'row',
  },
  modalButton: {
    flex: 5,
    paddingVertical: 7,
    maxHeight: 38,
  },
  buttonOne: {
    marginRight: 10,
  },
  buttonTwo: {
    marginLeft: 10,
  },
  buttonText: {
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 19,
  },
});

export default connect(null, mapDispatchToProps)(UserInactivity);
