import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import colors from '../constants/colors';
type Props = {
    children: JSX.Element,
  };

const LandingLayout:React.FC<Props> = (props) => {
    return (
        <SafeAreaView  style={style.container}>
  
            {props.children}
      
        </SafeAreaView>
    )
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white
    }
})

export default LandingLayout;