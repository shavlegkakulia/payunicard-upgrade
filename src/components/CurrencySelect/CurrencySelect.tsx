import React from "react";
import {  Modal, ScrollView, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import colors from "../../constants/colors";
import { GEL } from "../../constants/currencies";
import { useDimension } from "../../hooks/useDimension";
import { ICurrency } from "../../services/UserService";

interface IProps {
    currencies: ICurrency[] | undefined;
    selectedCurrency: ICurrency | undefined;
    currencyVisible: boolean;
    onSelect: (account: ICurrency) => void;
    onToggle: (visible?: boolean) => void;
    style?: StyleProp<ViewStyle>;
}

interface IItemProps {
    currency: ICurrency;
    onCurrencySelect: (currency: ICurrency) => void;
    isSelected?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    defaultTitle?: string;
}

export const CurrencyItem: React.FC<IItemProps> = (props) => {
    return (
        <TouchableOpacity style={[styles.item, props.isSelected ? styles.activeIitem : {}, props.style]} onPress={() => props.onCurrencySelect(props.currency)}>
           <Text style={props.textStyle}>
               {props.currency.value || props.defaultTitle}
           </Text>
        </TouchableOpacity>
    )
}

const CurrencySelect: React.FC<IProps> = (props) => {
    const dimension = useDimension();

    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={props.currencyVisible}
                onRequestClose={() => {
                    props.onToggle()
                }}
            >
                <TouchableOpacity
                    style={styles.background}
                    activeOpacity={1}
                    onPress={() => props.onToggle()}
                />
                <View style={styles.centeredView}>
                    <View style={[styles.modalView]}>
                       <ScrollView style={{maxHeight: dimension.height - 200}}>
                       {props.currencies?.map((currency, index) =>
                            <CurrencyItem key={currency.key || 0 + index} currency={currency}  textStyle={styles.currency} style={props.style} onCurrencySelect={props.onSelect} isSelected={props.selectedCurrency?.key === currency.key} />
                        )}
                       </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        margin: 20,
        backgroundColor: colors.white,
        borderRadius: 20,
        paddingVertical: 30,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxWidth: 380
    },
    background: {
        flex: 1,
        backgroundColor: "#00000098",
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopColor: colors.baseBackgroundColor,
        borderBottomColor: colors.baseBackgroundColor,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingLeft: 20,
        paddingRight: 30,
        height: 54
        //paddingVertical: 20
    },
    activeIitem: {
        borderTopColor: colors.primary,
        borderBottomColor: colors.primary,
    },
    currency: {
        textAlign: 'center',
        flex: 1
    }
});


export default CurrencySelect;