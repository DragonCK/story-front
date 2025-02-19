import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import rootReducer from './modules';

const isDev = process.env.NODE_ENV === 'development';

const middleware = [...getDefaultMiddleware({ thunk: false })];

const store = () => {
  return configureStore({
    reducer: rootReducer,
    middleware,
    devTools: isDev,
  });
};

export type AppStore = ReturnType<typeof store>;

export const wrapper = createWrapper(store, {
  // debug: process.env.NODE_ENV !== 'production',
  debug: false,
});

export default store;
