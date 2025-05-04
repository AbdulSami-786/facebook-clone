// src/app/store.js or wherever your store is defined
import { configureStore } from "@reduxjs/toolkit";
import SignupReducer from '../redux/FacebookappSlice';

export const store = configureStore({
  reducer: {
    Sign: SignupReducer, // <-- "Sign" used in useSelector
  },
});
