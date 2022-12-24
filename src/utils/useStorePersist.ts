import { useCallback, useSyncExternalStore } from "react";
import { produce } from "immer";

export const createStorePersist = <T>(key: string, initialState: T) => {
  let currentState = initialState;
  const listeners: Set<(data: T) => void> = new Set();

  // Check if there is a value stored in session storage for the given key
  if (typeof window !== "undefined") {
    const storedState = sessionStorage.getItem(key);
    if (storedState) {
      // If there is, use the stored value as the initial state
      currentState = JSON.parse(storedState);
    }
  }

  return {
    getState: () => currentState,
    setState: <Q extends T>(newState: Q) => {
      currentState = newState;
      // Update the session storage with the new state
      typeof window !== "undefined" &&
        sessionStorage.setItem(key, JSON.stringify(newState));
      listeners.forEach((listener) => listener(currentState));
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export const useStorePersist = <S, T>(
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

export const useSetStatePersist = <S>(store: {
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
