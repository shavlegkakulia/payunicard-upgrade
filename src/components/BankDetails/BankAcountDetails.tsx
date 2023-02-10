import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../constants/colors';
import { IBankTransferDetails } from '../../screens/dashboard/cardsStore/paymentMethods';
import BankDetail from './BankDetail';

interface IIBankDetailData {
    title: string,
    data: IBankTransferDetails[];
}

const BankAcountDetails: React.FC<IIBankDetailData> = (props) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    return (
        <View>
            <TouchableOpacity
                style={styles.buttonStyle}
                onPress={() => setIsCollapsed(!isCollapsed)}
            >
                <Text style={styles.titleText}>{props.title}</Text>
            </TouchableOpacity>
            {
                isCollapsed ?
                    props.data.map((item: IBankTransferDetails) => (
                        <BankDetail data={item} key={item.swiftCode} />
                    ))
                    :
                    null
            }

        </View>
    );
};

export default BankAcountDetails;

const styles = StyleSheet.create({
    buttonStyle: {
        width: '100%',
        height: 45,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
        borderColor: colors.inputBackGround
    },
    titleText: {
        fontFamily: 'FiraGO-Regular',
        fontSize: 14,
        lineHeight: 17,
        color: colors.black,
        textTransform: 'uppercase'
    }
})