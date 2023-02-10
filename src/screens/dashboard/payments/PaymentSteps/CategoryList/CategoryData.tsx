import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Cover from "../../../../../components/Cover";
import colors from "../../../../../constants/colors";

interface IProps {
    name?: string,
    imageUrl?: string,
    merchantServiceURL?: string,
    isLoading?: boolean
}

const CategoryData: React.FC<IProps> = (props) => {
    return (
        <View style={styles.item}>
            <Cover imageUrl={props.imageUrl || props.merchantServiceURL} isLoading={props.isLoading} style={styles.logo} />
            <Text numberOfLines={1} style={styles.title}>{props.name}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: colors.white,
        paddingHorizontal: 23,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        fontFamily: 'FiraGO-Medium',
        fontSize: 14,
        lineHeight: 17,
        marginLeft: 18,
        color: colors.black,
        flex: 1
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.inputBackGround
    },
    loaderBox: {
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default CategoryData;