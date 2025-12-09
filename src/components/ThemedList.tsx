import React from "react";
import { FlatList, FlatListProps, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "./text";
import { themedListStyles } from "../constants/ComponentStyles";

export interface ThemedListItem {
  label: string;
  onItemPress?: () => void;
}

interface ThemedListProps
  extends Omit<FlatListProps<ThemedListItem>, "renderItem"> {
  data: ThemedListItem[];
}

const ITEM_HEIGHT = 45; // Approximate height for getItemLayout

function ListItem({ item }: { item: ThemedListItem }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={item.onItemPress}
      disabled={!item.onItemPress}
      style={[
        themedListStyles.itemContainer,
        { borderBottomColor: colors.border },
      ]}
    >
      <ThemedText style={themedListStyles.itemText}>{item.label}</ThemedText>
    </TouchableOpacity>
  );
}

export default function ThemedList({ data, ...props }: ThemedListProps) {
  return (
    <View style={{ flex: 1, width: "100%" }}>
      <FlatList
        data={data}
        renderItem={({ item }) => <ListItem item={item} />}
        keyExtractor={(_item, index) => index.toString()}
        style={themedListStyles.list}
        showsVerticalScrollIndicator={false}
        getItemLayout={(_data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        {...props}
      />
    </View>
  );
}
ThemedList.Item = ListItem;
