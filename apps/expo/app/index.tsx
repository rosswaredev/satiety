import React, { PropsWithChildren, useReducer, useState } from "react";
import {
  Button,
  ButtonProps,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FlashList, ListRenderItem } from "@shopify/flash-list";

import { api } from "../src/utils/api";

const Separator = () => <View className="h-1 w-1" />;

const ItemBackground = ({ children }: PropsWithChildren<unknown>) => (
  <View className="bg-slate-800 px-4 py-3 rounded-lg">{children}</View>
);

type ItemInputProps = {
  onSubmit: (title: string) => void;
};
const ItemInput = ({ onSubmit }: ItemInputProps) => {
  const [newItemText, setNewItemText] = useState("");

  const handleSubmitEditing = () => {
    onSubmit(newItemText);
    setNewItemText("");
  };

  const handleTextChange = (newText: string) => setNewItemText(newText);

  return (
    <>
      <ItemBackground>
        <TextInput
          value={newItemText}
          placeholder="Add ingredient"
          onSubmitEditing={handleSubmitEditing}
          onChangeText={handleTextChange}
          placeholderTextColor="#666"
          className="text-white placeholder-white"
          blurOnSubmit
          autoFocus
        />
      </ItemBackground>
    </>
  );
};

type ListItemProps = {
  title: string;
};
const ListItem = ({ title }: ListItemProps) => {
  return (
    <>
      <ItemBackground>
        <Text className="text-white">{title}</Text>
      </ItemBackground>
      <Separator />
    </>
  );
};

const ListActionType = {
  Add: "add",
  Remove: "remove",
} as const;
type ListActionType = (typeof ListActionType)[keyof typeof ListActionType];

const addItem = (item: string) => ({
  type: ListActionType.Add,
  payload: item,
});

const removeItem = (index: number) => ({
  type: ListActionType.Remove,
  payload: index,
});

type ListAction = ReturnType<typeof addItem | typeof removeItem>;
const reduceIngredients = (state: string[], action: ListAction): string[] => {
  if (action.type === ListActionType.Add) return [...state, action.payload];
  if (action.type === ListActionType.Remove)
    return state.filter((_, index) => index !== action.payload);
  return [];
};

type IngredientsScreenProps = {
  ingredients: string[];
  onAdd: (title: string) => void;
  onRemove: (index: number) => void;
  onSubmit: () => void;
};
const IngredientsScreen = ({
  ingredients,
  onAdd,
  onRemove,
  onSubmit,
}: IngredientsScreenProps) => {
  const renderItem: ListRenderItem<string> = ({ item, index }) => (
    <Pressable key={index} onPress={() => onRemove(index)}>
      <ListItem title={item} />
    </Pressable>
  );

  const renderFooter = () => <ItemInput onSubmit={(title) => onAdd(title)} />;

  const isSubmitDisabled = ingredients.length === 0;

  console.log({ isSubmitDisabled });

  return (
    <>
      <Stack.Screen options={{ title: "Ultra Chef" }} />
      <Text className="text-white text-lg text-bold mb-2">Ingredients</Text>
      <View className="w-full  flex-1">
        <FlashList
          data={ingredients}
          renderItem={renderItem}
          estimatedItemSize={8}
          ListFooterComponent={renderFooter}
        />
      </View>
      <TouchableOpacity
        className={`bg-cyan-400 py-3 mx-3 mb-6 rounded-full ${
          isSubmitDisabled ? "opacity-10" : ""
        }`}
        onPress={onSubmit}
        disabled={isSubmitDisabled}
      >
        <Text className="text-black text-2xl text-center font-bold">Cook</Text>
      </TouchableOpacity>
    </>
  );
};
const BackButton = (props: TouchableOpacityProps) => (
  <TouchableOpacity
    className={`bg-cyan-400 py-3 mx-3 mb-6 rounded-full`}
    {...props}
  >
    <Text className="text-black text-2xl text-center font-bold">Back</Text>
  </TouchableOpacity>
);

const LoadingScreen = () => {
  return <Text className="text-white text-lg text-bold mb-2">Loading...</Text>;
};

type ResultProps = {
  title: string;
};
const Result = ({ title }: ResultProps) => (
  <>
    <ItemBackground>
      <Text className="text-white">{title}</Text>
    </ItemBackground>
    <Separator />
  </>
);

type ResultsScreenProps = {
  recipeNames: string[];
  onBack: () => void;
};
const ResultsScreen = ({ recipeNames, onBack }: ResultsScreenProps) => {
  return (
    <View className="flex-1">
      <View className="flex-1">
        <Text className="text-white text-lg text-bold mb-2">Recipe Ideas</Text>
        {recipeNames.map((name, index) => (
          <Result key={index} title={name} />
        ))}
      </View>
      <BackButton onPress={onBack} />
    </View>
  );
};

const Main = () => {
  const [ingredients, dispatch] = useReducer(reduceIngredients, []);
  const suggestRecipes = api.chef.suggestRecipes.useMutation({});

  const handleSubmit = () => {
    suggestRecipes.mutate({ ingredients });
  };

  if (suggestRecipes.isLoading) return <LoadingScreen />;

  if (suggestRecipes.data)
    return (
      <ResultsScreen
        recipeNames={suggestRecipes.data}
        onBack={suggestRecipes.reset}
      />
    );

  if (suggestRecipes.error) {
    return (
      <>
        <Text>{`Error: ${suggestRecipes.error.message} ${JSON.stringify(
          suggestRecipes.error.data,
        )}`}</Text>
        <BackButton onPress={suggestRecipes.reset} />
      </>
    );
  }

  return (
    <IngredientsScreen
      ingredients={ingredients}
      onAdd={(title) => dispatch(addItem(title))}
      onRemove={(index) => dispatch(removeItem(index))}
      onSubmit={handleSubmit}
    />
  );
};

const Index = () => {
  return (
    <SafeAreaView className="bg-slate-900 h-full px-3 py-0">
      <Main />
    </SafeAreaView>
  );
};

export default Index;
