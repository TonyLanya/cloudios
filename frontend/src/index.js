import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from "redux";
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { PersistGate } from 'redux-persist/integration/react'
import { composeWithDevTools } from 'redux-devtools-extension';
import { BrowserRouter, Route, Switch } from "react-router-dom";
// import App from './App';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import './index.css';
import HomePage from './components/pages/HomePage';
import userLogin from './components/pages/auth/userLogin';
import RequireAuth from './components/pages/auth/requireAuth';
import UploadPage from './components/pages/UploadPage';
import DownAppPage from './components/pages/DownAppPage';
import SignUpPage from './components/pages/auth/SignUpPage';
import reduxThunk from 'redux-thunk';
import reducers from "./reducers";

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, reducers)

const middleware = [thunk];
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(persistedReducer, composeEnhancers(
  applyMiddleware(...middleware)
));
const persistor = persistStore(store);

global.baseUrl = 'http://106.14.134.55:4000/api/';

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <main>
          <Switch>
            <Route exact path='/login' component={userLogin} />
            <Route exact path='/signup' component={SignUpPage} />
            <Route exact path='/' component = {RequireAuth(HomePage)} />
            <Route exact path='/upload' component = {RequireAuth(UploadPage)} />
            <Route exact path='/:applink' component = {DownAppPage} />
          </Switch>
        </main>
      </BrowserRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);
