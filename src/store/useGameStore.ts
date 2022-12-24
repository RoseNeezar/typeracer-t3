import {
  createStorePersist,
  useSetStatePersist,
  useStorePersist,
} from "../utils/useStorePersist";

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

export const gameStore = createStorePersist<IState>("Game", {
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
});

export const useGameStoreActions = useSetStatePersist(gameStore);

export const useGame = () => useStorePersist((state) => state.Game, gameStore);
export const useCurrentPlayer = () =>
  useStorePersist((state) => state.currentPlayer, gameStore);
export const useKeyEvent = () =>
  useStorePersist((state) => state.KeyEvents, gameStore);
export const useTimerEvent = () =>
  useStorePersist((state) => state.TimerEvents, gameStore);
