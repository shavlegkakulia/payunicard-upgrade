import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, StyleProp, Platform } from "react-native";
import colors from '../../constants/colors';

//@ts-ignore
TouchableOpacity.defaultProps = { activeOpacity: 0.5 };

interface IButton {
  onPress: () => void;
  title: string;
  backgroundColor?: string;
  loaderColor?: string;
  color?: string;
  isLoading?: boolean;
  hasSpacing?: boolean;
  disabled?:boolean;
  loadingSize?: number | "small" | "large" | undefined;
  style?: StyleProp<ViewStyle>;
  TextStyle?: StyleProp<TextStyle>;
  loaderStyle?: StyleProp<ViewStyle>;
}

const AppButton: React.FC<IButton> = ({ onPress, title, backgroundColor, color, isLoading, style, TextStyle, loaderStyle, loaderColor, loadingSize, disabled, hasSpacing = true }) => {

  return <TouchableOpacity
    onPress={isLoading ? () => { } : onPress}
    disabled={disabled}
    style={[
      styles.appButtonContainer,
      backgroundColor ? { backgroundColor } : undefined,
      !hasSpacing ? { paddingVertical: 0, paddingHorizontal: 0 } : undefined,
      disabled && {backgroundColor: colors.disabledprimary},
      style
    ]}
  >
    {!isLoading ? <Text style={[styles.appButtonText, color ? { color: color } : undefined, TextStyle]}>
      {title}
    </Text> : <View style={styles.loading}>
      <ActivityIndicator size={loadingSize} color={loaderColor || "#ffffff"} style={loaderStyle} />
    </View>}
  </TouchableOpacity>
}

const styles = StyleSheet.create({
  appButtonContainer: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    lineHeight: 16,
    paddingVertical: Platform.OS === 'ios' ? 17 : 12,
    maxHeight: 51
  },
  appButtonText: {
    fontSize: 14,
    color: colors.white,
    alignSelf: "center",
    fontFamily: 'FiraGO-Regular'
  },
  loading: {
    padding: Platform.OS === 'ios' ? 0: 4
  }
});

export default AppButton;