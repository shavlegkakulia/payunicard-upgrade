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
    Text
} from 'react-native';
import colors from '../../constants/colors';

interface IProps {
    label: string;
    value?: string;
    title?: string;
    autoFocus?: boolean | undefined;
    onChangeText: (text: string) => void;
    Style?: StyleProp<ViewStyle>;
}

interface IState {

}

export default class AppInputText extends Component<IProps, IState> {
    state = {
        isFocused: false,
    };
    private _animatedIsFocused!: Animated.Value;

    constructor(props: IProps) {
        super(props);
        this._animatedIsFocused = new Animated.Value((this.props.value !== undefined && this.props.value === '') ? 1 : 0);
    }

    handleFocus = () => this.setState({ isFocused: true });
    handleBlur = () => this.setState({ isFocused: false });

    componentDidUpdate() {
        Animated.timing(this._animatedIsFocused, {
            toValue: (this.state.isFocused || (this.props.value !== undefined && this.props.value !== '')) ? 1 : 0,
            duration: 200,
            useNativeDriver: false
        }).start();
    }

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
            })
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
                        maxLength={9}
                    />
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
        height: 36,
        fontSize: 14,
        color: colors.black
    },
    inputWraper: {
     
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
