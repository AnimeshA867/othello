import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import gameReducer from "./slices/gameSlice";
import uiReducer from "./slices/uiSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      game: gameReducer,
      ui: uiReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
