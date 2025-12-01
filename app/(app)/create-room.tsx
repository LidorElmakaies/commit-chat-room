import React from "react";
import { StyleSheet, View } from "react-native";
import {
  ThemedView,
  ThemedTextInput,
  ThemedButton,
  ThemedText,
  ThemedCard,
  ThemedDropdown,
  ThemedErrorMessage,
} from "../../components";
import { commonStyles } from "../../constants/Styles";
import { useForm, Controller } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../src/store";
import { createRoom } from "../../src/store/slices/roomSlice";
import {
  CreateRoomOptions,
  LoadingState,
  RoomVisibility,
} from "../../src/types";

const CreateRoomScreen = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.room);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoomOptions>({
    defaultValues: {
      visibility: RoomVisibility.Public,
    },
  });

  const handleCreateRoom = (data: CreateRoomOptions) => {
    dispatch(createRoom(data));
  };

  return (
    <ThemedView style={commonStyles.container}>
      <ThemedCard style={styles.card}>
        <Controller
          control={control}
          name="name"
          rules={{ required: "Room name is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <ThemedTextInput
              placeholder="Room Name"
              containerStyle={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="topic"
          render={({ field: { onChange, onBlur, value } }) => (
            <ThemedTextInput
              placeholder="Topic (optional)"
              containerStyle={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        <ThemedText style={styles.label}>Visibility:</ThemedText>
        <Controller
          control={control}
          name="visibility"
          rules={{ required: "Visibility is required" }}
          render={({ field: { onChange, value } }) => (
            <View>
              <ThemedDropdown
                options={Object.values(RoomVisibility)}
                onSelect={onChange}
                value={value}
                placeholder="Select Visibility"
              />
              <ThemedErrorMessage message={errors.visibility?.message} />
            </View>
          )}
        />
        <ThemedErrorMessage message={error ?? undefined} />
        <ThemedButton
          title="Create Room"
          onPress={handleSubmit(handleCreateRoom)}
          style={{ marginTop: 24 }}
          loading={loading === LoadingState.Pending}
        />
      </ThemedCard>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "90%",
    alignItems: "stretch",
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default CreateRoomScreen;
