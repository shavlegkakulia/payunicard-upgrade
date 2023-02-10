import React from 'react';
import {ScrollView, View} from 'react-native';
import {ICategory} from '../../../../../services/PresentationServive';
import CategoryItem from './CategoryItem';

export interface ICategoryOpenFN {
  onOpen: (
    parentID: number,
    isService: boolean,
    hasService: boolean,
    hasChildren: boolean,
    viewInAction: boolean,
    title: string,
  ) => void;
}

interface IProps extends ICategoryOpenFN {
  data: ICategory[];
}

const CategoryList: React.FC<IProps> = props => {
  return (
    <ScrollView>
      <View>
        {props.data.map((item, index) => (
          <CategoryItem
            onOpen={props.onOpen}
            item={item}
            index={index}
            key={item?.categoryID?.toString() + item.name + item.merchantCode}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default CategoryList;
