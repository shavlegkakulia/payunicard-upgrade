import React, {useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import { useSelector } from 'react-redux';
import colors from '../../../constants/colors';
import {tabHeight} from '../../../navigation/TabNav';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../../redux/action_types/translate_action_types';
import screenStyles from '../../../styles/screens';
import DashboardLayout from '../../DashboardLayout';

const Notifications: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {};

  return (
    <DashboardLayout>
      <ScrollView
        style={screenStyles.screenContainer}
        contentContainerStyle={[styles.avoid, !notifications.length && {flex: 1}]}
        refreshControl={
          <RefreshControl
            progressBackgroundColor={colors.white}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }>
          {!notifications.length && <View style={styles.emptyContent}>
            <Text style={styles.emptyText}>
              {translate.t('notifications.emptycontent')}
            </Text>
          </View>}
        </ScrollView>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  avoid: {
    paddingBottom: tabHeight,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
    textAlign: 'center'
  }
});

export default Notifications;
