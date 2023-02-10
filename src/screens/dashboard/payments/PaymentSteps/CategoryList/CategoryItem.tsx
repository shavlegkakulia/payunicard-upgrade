import {useNavigationState} from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {ICategory} from '../../../../../services/PresentationServive';
import {subscriptionService} from '../../../../../services/subscriptionService';
import CategoryData from './CategoryData';
import {ICategoryOpenFN} from './CategoryList';

export interface IItemProps extends ICategoryOpenFN {
  item: ICategory;
  index: number;
}

export const RESET_TRANSFER_STEPS_LOADING = 'RESET_TRANSFER_STEPS_LOADING';

const ViewServicesInACtionSheet = true;

const CategoryItem = ({item, index, onOpen}: IItemProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const routes = useNavigationState(state => state.routes);
  const currentRoute = routes[routes.length - 1].name;

  const onItemHandle = () => {
    if (activeIndex === index) return;
    setActiveIndex(index);
    onOpen(
      item.categoryID,
      item.isService,
      item.hasServices,
      item.hasChildren,
      ViewServicesInACtionSheet,
      item.name,
    );
  };

  useEffect(() => {
    const subscription = subscriptionService.getData().subscribe(data => {
      if (data?.key === RESET_TRANSFER_STEPS_LOADING) {
        setActiveIndex(undefined);
      }
    });

    return () => {
      subscriptionService.clearData();
      subscription.unsubscribe();
    };
  }, [currentRoute]);

  return (
    <TouchableOpacity onPress={onItemHandle} style={[index === 0 && styles.firstItem]}>
      <CategoryData
        name={item.name}
        imageUrl={item.imageUrl}
        merchantServiceURL={item.merchantServiceURL}
        isLoading={activeIndex === index}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  firstItem : {
    marginTop: 30
  }
})

export default CategoryItem;
