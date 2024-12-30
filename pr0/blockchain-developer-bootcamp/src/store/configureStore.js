// import { createStore, applyMiddleware, compose } from 'redux'
// import { createLogger } from 'redux-logger'
// import rootReducer from './reducers'

// const loggerMiddleware = createLogger()
// const middleware = []

// // For Redux Dev Tools
// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// export default function configureStore(preloadedState) {
//   return createStore(
//     rootReducer,
//     preloadedState,
//     composeEnhancers(applyMiddleware(...middleware, loggerMiddleware))
//   )
// }


import { createStore, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';
import rootReducer from './reducers';

// Helper function to handle circular references
function safeStringify(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return undefined; // Skip circular references
      }
      seen.add(value);
    }
    return typeof value === 'bigint' ? value.toString() : value; // Convert BigInt to string
  });
}

// Configure redux-logger to handle circular references
const loggerMiddleware = createLogger({
  stateTransformer: (state) => JSON.parse(safeStringify(state)),
  actionTransformer: (action) => JSON.parse(safeStringify(action)),
});

// Middleware array
const middleware = [loggerMiddleware];

// For Redux DevTools with circular reference handling
const composeEnhancers =
  (typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      stateSanitizer: (state) => JSON.parse(safeStringify(state)),
      actionSanitizer: (action) => JSON.parse(safeStringify(action)),
    })) ||
  compose;

export default function configureStore(preloadedState) {
  return createStore(
    rootReducer,
    preloadedState,
    composeEnhancers(applyMiddleware(...middleware))
  );
}

