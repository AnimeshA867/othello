import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  // Dialog states
  showGameOverDialog: boolean;
  showResignDialog: boolean;
  showDrawOfferDialog: boolean;
  showAuthPrompt: boolean;
  showSettingsDialog: boolean;

  // Loading states
  isLoading: boolean;
  loadingMessage: string | null;

  // Error states
  error: string | null;

  // Toast notifications (for reference, actual toasts use shadcn)
  lastToast: {
    title: string;
    description: string;
    timestamp: number;
  } | null;
}

const initialState: UIState = {
  showGameOverDialog: false,
  showResignDialog: false,
  showDrawOfferDialog: false,
  showAuthPrompt: false,
  showSettingsDialog: false,
  isLoading: false,
  loadingMessage: null,
  error: null,
  lastToast: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setShowGameOverDialog: (state, action: PayloadAction<boolean>) => {
      state.showGameOverDialog = action.payload;
    },
    setShowResignDialog: (state, action: PayloadAction<boolean>) => {
      state.showResignDialog = action.payload;
    },
    setShowDrawOfferDialog: (state, action: PayloadAction<boolean>) => {
      state.showDrawOfferDialog = action.payload;
    },
    setShowAuthPrompt: (state, action: PayloadAction<boolean>) => {
      state.showAuthPrompt = action.payload;
    },
    setShowSettingsDialog: (state, action: PayloadAction<boolean>) => {
      state.showSettingsDialog = action.payload;
    },
    setLoading: (
      state,
      action: PayloadAction<{ isLoading: boolean; message?: string }>
    ) => {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message || null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setLastToast: (
      state,
      action: PayloadAction<{ title: string; description: string }>
    ) => {
      state.lastToast = {
        ...action.payload,
        timestamp: Date.now(),
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetUI: (state) => {
      return initialState;
    },
  },
});

export const {
  setShowGameOverDialog,
  setShowResignDialog,
  setShowDrawOfferDialog,
  setShowAuthPrompt,
  setShowSettingsDialog,
  setLoading,
  setError,
  setLastToast,
  clearError,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
