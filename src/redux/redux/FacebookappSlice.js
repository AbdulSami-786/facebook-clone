import { createSlice, nanoid } from "@reduxjs/toolkit";

// Slice to handle signup-related data
const SignupSlice = createSlice({
  name: 'signup',
  initialState: {
    sign: [] // This will hold an array of signed-up users
  },
  reducers: {
    addTodo: (state, action) => {
      state.sign.push({
        id: nanoid(),
        title: action.payload.title, // e.g., user email
      });
    },
  },
});

// Export action
export const { addTodo } = SignupSlice.actions;

// Export reducer
export default SignupSlice.reducer;
