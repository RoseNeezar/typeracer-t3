import create from "zustand";
import { persist } from "zustand/middleware";
import { combine } from "zustand/middleware";

export type IPlayer = {
  WPM: number;
  current_word_index: number;
  is_party_leader: boolean;
  nickname: string;
  id: string;
};

export type KeyInput = {
  nickname: string;
  key: string;
  gameID: string;
};

export type GameState = {
  id: string;
  is_open: boolean;
  is_over: boolean;
  players: IPlayer[];
  words: string[];
};

export type TimerState = {
  countDown: string;
  msg: string;
};
export interface IState {
  Game: GameState;
  currentPlayer?: IPlayer;
  KeyEvents: KeyInput[];
  TimerEvents: TimerState | {};
}

export const useGameStore = create(
  persist(
    combine(
      {
        Game: {
          id: "",
          is_open: false,
          is_over: false,
          players: [],
          words: [],
        },
        currentPlayer: undefined,
        KeyEvents: [],
        TimerEvents: {},
      } as IState,
      (set) => ({
        action: {
          updateGame: (data: GameState) =>
            set((state) => ({
              Game: {
                ...state.Game,
                ...data,
              },
            })),
          updateCurrentPlayer: (data: IPlayer) =>
            set(() => ({
              currentPlayer: data,
            })),
          updateKeyEvent: (data: KeyInput) =>
            set((state) => ({ KeyEvents: [...state.KeyEvents, data] })),
          updateTimerEvent: (data: TimerState) =>
            set((state) => ({
              TimerEvents: {
                ...state.TimerEvents,
                data,
              },
            })),
          resetTimerEvent: () =>
            set((state) => ({
              TimerEvents: {},
            })),
        },
      })
    ),
    {
      name: "game",
      getStorage: () => sessionStorage,
    }
  )
);

export const useGame = () => useGameStore((state) => state.Game);
export const useCurrentPlayer = () =>
  useGameStore((state) => state.currentPlayer);
export const useKeyEvent = () => useGameStore((state) => state.KeyEvents);
export const useTimerEvent = () => useGameStore((state) => state.TimerEvents);
export const useGameActions = () => useGameStore((state) => state.action);
