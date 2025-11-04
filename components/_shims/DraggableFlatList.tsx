import React from 'react';
import { FlatList, type FlatListProps } from 'react-native';

export type RenderItemParams<T> = {
  item: T;
  index: number;
};

type Props<T> = Omit<FlatListProps<T>, 'renderItem' | 'data' | 'onDragEnd'> & {
  data: T[];
  renderItem: (params: RenderItemParams<T>) => React.ReactElement | null;
  onDragEnd?: (params: { data: T[] }) => void | Promise<void>;
};

export default function DraggableFlatList<T>(props: Props<T>) {
  return (
    <FlatList
      {...(props as unknown as FlatListProps<T>)}
      renderItem={({ item, index }) => props.renderItem({ item, index })}
      data={props.data}
    />
  );
}


