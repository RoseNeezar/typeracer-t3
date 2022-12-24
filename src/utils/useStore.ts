import { useCallback, useSyncExternalStore } from "react";
import { produce } from "immer";

export const createStore = <T>(initialState: T) => {
  let currentState = initialState;
  const listeners: Set<(data: T) => void> = new Set();
  return {
    getState: () => currentState,
    setState: <Q extends T>(newState: Q) => {
      currentState = newState;
      listeners.forEach((listener) => listener(currentState));
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export const useStore = <S, T>(
  selector: (state: S) => T,
  store: {
    getState: () => S;
    subscribe: (listener: () => void) => () => void;
  }
) => {
  const subscribe = useCallback(store.subscribe, []);
  const getState = useCallback(store.getState, []);
  const t = (): T =>
    useSyncExternalStore(subscribe, () => selector(getState()));

  return t();
};

export const useSetState = <S>(store: {
  getState: () => S;
  setState: (newState: S) => void;
}) => {
  const setState = useCallback(
    (updater: (draft: S) => void) =>
      store.setState(produce(store.getState(), updater)),
    []
  );

  return setState;
};
