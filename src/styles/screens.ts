import { Platform, StyleSheet } from "react-native";
import colors from "../constants/colors";

const screenStyles = StyleSheet.create({
    wraperWithShadow: {
        flex: 1,
        backgroundColor: colors.baseBackgroundColor,
        paddingHorizontal: 12, // -margin
    },
    wraper: {
        //flex: 1,
        backgroundColor: colors.baseBackgroundColor,
        paddingHorizontal: 20, // no shadow
    },
    screenContainer: {
        flex: 1,
        backgroundColor: colors.baseBackgroundColor,
    },
    shadowedCardbr15: {
        margin: 4,
        marginVertical: Platform.OS === 'ios' ? 4: 4,
        elevation: 4,
        shadowColor: '#00000060',
        shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.3,
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowRadius: Platform.OS === 'ios' ? 5 : 15,
        borderRadius: 15,
    },
    shadowedCardbr10: {
        margin: 4,
        elevation: 4,
        shadowColor: '#00000060',
        shadowOpacity: 0.3,
        shadowOffset: {
            width: 2,
            height: 2
        },
        shadowRadius: Platform.OS === 'ios' ? 5 : 10,
        borderRadius: 10,
    }
});

export default screenStyles;