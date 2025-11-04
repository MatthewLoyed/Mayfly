declare module 'react-native-draggable-flatlist' {
  import type React from 'react';
  import type { FlatListProps, StyleProp, ViewStyle } from 'react-native';

  export type RenderItemParams<T> = {
    item: T;
    index: number;
    drag?: () => void;
    isActive?: boolean;
    getIndex?: () => number | null;
  };

  export type OnDragEndParams<T> = {
    data: T[];
  };

  export interface DraggableFlatListProps<T>
    extends Omit<FlatListProps<T>, 'renderItem' | 'data' | 'onDragEnd'> {
    data: T[];
    renderItem: (params: RenderItemParams<T>) => React.ReactElement | null;
    onDragEnd?: (params: OnDragEndParams<T>) => void | Promise<void>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    style?: StyleProp<ViewStyle>;
  }

  const DraggableFlatList: <T>(
    props: DraggableFlatListProps<T>
  ) => React.ReactElement | null;

  export default DraggableFlatList;
}


