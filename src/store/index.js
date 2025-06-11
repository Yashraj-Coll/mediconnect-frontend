import { createStore } from 'redux';
// Or if you're using Redux Toolkit:
// import { configureStore } from '@reduxjs/toolkit';

// A simple reducer for now - you'll expand this later
const initialState = {
  auth: {
    user: null
  }
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    // Add your action handlers here
    default:
      return state;
  }
}

// Create the store
const store = createStore(rootReducer);
// Or with Redux Toolkit:
// const store = configureStore({ reducer: rootReducer });

export default store;