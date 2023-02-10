import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    Animated,
    StyleProp,
    ViewStyle,
    NativeSyntheticEvent,
    TextInputChangeEventData,
    TouchableOpacity,
    Text,
    TextInputKeyPressEventData,
    Keyboard
} from 'react-native';
import { useSelector } from 'react-redux';
import colors from '../../constants/colors';
import {
    ITranslateState,
    IGlobalState as ITranslateGlobalState,
  }  from '../../redux/action_types/translate_action_types';

interface IProps {
    label: string;
    value?: string;
    title?: string;
    resendTitle?: string;
    onChangeText: (text: string) => void;
    onRetry?: () => void;
    Style?: StyleProp<ViewStyle>;
}

interface IState {

}

export default class FloatingLabelInput extends Component<IProps, IState> {
    
    private _animatedIsFocused!: Animated.Value;
    iRef: React.RefObject<TextInput>;

    constructor(props: IProps) {
        super(props);
        this.iRef = React.createRef();
        this._animatedIsFocused = new Animated.Value((this.props.value !== undefined && this.props.value === '') ? 0 : 1);
    }
   
    state = {
        isFocused: false,
    };
    handleFocus = () => this.setState({ isFocused: true });
    handleBlur = () => this.setState({ isFocused: false });

    componentDidUpdate() {
        Animated.timing(this._animatedIsFocused, {
            toValue: (this.state.isFocused || (this.props.value !== undefined && this.props.value !== '')) ? 1 : 0,
            duration: 200,
            useNativeDriver: false
        }).start();
    }

    onRetry = () => {
        this.props.onRetry && this.props.onRetry();
        this.iRef.current?.focus();
    }

    handleKeyDown = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
        if (e.nativeEvent.key === 'Backspace' && this.props.value === null) {
          Keyboard.dismiss();
        }
      };

    render() {
        const { label, ...props } = this.props;
        const labelStyle = {
            top: this._animatedIsFocused.interpolate({
                inputRange: [0, 1],
                outputRange: [5, -14],
            }),
            fontSize: this._animatedIsFocused.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 14],
            }),
            color: this._animatedIsFocused.interpolate({
                inputRange: [0, 1],
                outputRange: [colors.primary, colors.primary],
            }),
        };

        return (
            <View style={[styles.otpContainer, this.props.Style]}>
                <Text style={styles.title}>{props.title}</Text>
                <View style={styles.otpInner}>
                <Animated.Text style={[labelStyle, styles.label]}>
                    {label}
                </Animated.Text>
                <View style={styles.inputWraper}>
                    <TextInput
                        {...props}
                        autoCompleteType='postal-code'
                        textContentType='oneTimeCode'
                        keyboardType='numeric'
                        style={styles.input}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        onChange={(e: NativeSyntheticEvent<TextInputChangeEventData>) => this.props.onChangeText(e.nativeEvent.text)}
                        blurOnSubmit
                        autoFocus
                        onKeyPress={this.handleKeyDown}
                        maxLength={4}
                        ref={this.iRef}
                    />
                    <TouchableOpacity onPress={this.onRetry} style={styles.retry}>
                        <Text style={styles.retryText}>{this.props.resendTitle}</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    otpContainer: {
        paddingTop: 14,
        marginHorizontal: 18
    },
    label: {
        position: 'absolute',
        left: 0,
        fontFamily: 'FiraGO-Regular',
        lineHeight: 17
    },
    input: {
        minHeight: 36,
        fontSize: 14,
        color: colors.black,
        borderBottomWidth: 1,
        borderBottomColor:
            colors.primary
    },
    inputWraper: {
        justifyContent: 'space-between',
    },
    retry: {
        alignSelf: 'flex-end',
        position: 'absolute',
        top: 5
    },
    retryText: {
        color: colors.primary,
        fontFamily: 'FiraGO-Regular',
        fontSize: 14,
        lineHeight: 17
    },
    showContainer: {
        paddingLeft: 7,
        position: 'relative'
    },
    showIcon: {
        marginLeft: 7,
        position: 'absolute',
        top: -10
    },
    title: {
        marginBottom: 40,
        fontFamily: 'FiraGO-Book',
        fontSize: 14,
        lineHeight: 17,
        color: colors.placeholderColor
    },
    otpInner: {
       
    }
});
