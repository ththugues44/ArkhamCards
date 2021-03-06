import { Action } from 'redux';
import { InteractionManager } from 'react-native';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import {
  CLEAR_DECKS,
  SET_MY_DECKS,
  MY_DECKS_START_REFRESH,
  MY_DECKS_CACHE_HIT,
  MY_DECKS_ERROR,
  SET_IN_COLLECTION,
  SET_PACK_SPOILER,
  LOGIN_STARTED,
  LOGIN,
  LOGIN_ERROR,
  LOGOUT,
} from './types';
import { AppState } from '@reducers';

import Database from '@data/Database';
import { getAccessToken, signInFlow, signOutFlow } from '@lib/auth';
// @ts-ignore
import { decks } from '@lib/authApi';
import { where } from '@data/query';

export function login(): ThunkAction<void, AppState, unknown, Action> {
  return (dispatch: ThunkDispatch<AppState, unknown, Action>): void => {
    dispatch({
      type: LOGIN_STARTED,
    });
    signInFlow().then(response => {
      if (response.success) {
        dispatch({
          type: LOGIN,
        });
        dispatch(refreshMyDecks());
      } else {
        dispatch({
          type: LOGIN_ERROR,
          error: response.error,
        });
      }
    });
  };
}

export function logout(): ThunkAction<void, AppState, null, Action<string>> {
  return (dispatch) => {
    dispatch({
      type: LOGIN_STARTED,
    });
    signOutFlow().then(() => {
      dispatch({
        type: LOGOUT,
      });
    });
  };
}

export function verifyLogin(): ThunkAction<void, AppState, null, Action<string>> {
  return (dispatch) => {
    getAccessToken().then(accessToken => {
      if (accessToken) {
        dispatch({
          type: LOGIN,
        });
      } else {
        dispatch({
          type: LOGOUT,
        });
      }
    });
  };
}

export function clearDecks(): Action<string> {
  return {
    type: CLEAR_DECKS,
  };
}

function getDecksLastModified(state: AppState): string | undefined {
  return (state.decks.myDecks && state.decks.myDecks.length) ?
    state.decks.lastModified :
    undefined;
}

export function refreshMyDecks(): ThunkAction<void, AppState, unknown, Action> {
  return (dispatch: ThunkDispatch<AppState, unknown, Action>, getState: () => AppState) => {
    dispatch({
      type: MY_DECKS_START_REFRESH,
    });
    decks(getDecksLastModified(getState())).then(response => {
      if (response.cacheHit) {
        dispatch({
          type: MY_DECKS_CACHE_HIT,
          timestamp: new Date(),
        });
      } else {
        dispatch({
          type: SET_MY_DECKS,
          decks: response.decks,
          lastModified: response.lastModified,
          timestamp: new Date(),
        });
      }
    },
    error => {
      console.log(`ERROR: ${error.message || error}`);
      dispatch({
        type: MY_DECKS_ERROR,
        error: error.message || error,
      });
    });
  };
}

export function setInCollection(code: string, value: boolean, db: Database): ThunkAction<void, AppState, unknown, Action> {
  return (dispatch: ThunkDispatch<AppState, unknown, Action>) => {
    dispatch({
      type: SET_IN_COLLECTION,
      code,
      value,
    });
    InteractionManager.runAfterInteractions(() => {
      db.setCardInCollection(where('pack_code = :code', { code }), value);
    });
  };
}

export function setCycleInCollection(cycle_code: string, value: boolean, db: Database): ThunkAction<void, AppState, unknown, Action> {
  return (dispatch: ThunkDispatch<AppState, unknown, Action>) => {
    dispatch({
      type: SET_IN_COLLECTION,
      cycle_code,
      value,
    });
    InteractionManager.runAfterInteractions(() => {
      db.setCardInCollection(where('cycle_code = :cycle_code', { cycle_code }), value);
    });
  };
}

export function setPackSpoiler(code: string, value: boolean, db: Database): ThunkAction<void, AppState, unknown, Action> {
  return (dispatch: ThunkDispatch<AppState, unknown, Action>) => {
    dispatch({
      type: SET_PACK_SPOILER,
      code,
      value,
    });
    InteractionManager.runAfterInteractions(() => {
      db.setCardSpoiler(where('encounter_code is not null AND pack_code = :code', { code }), value);
    });
  };
}

export function setCyclePackSpoiler(cycle_code: string, value: boolean, db: Database): ThunkAction<void, AppState, unknown, Action> {
  return (dispatch: ThunkDispatch<AppState, unknown, Action>) => {
    dispatch({
      type: SET_PACK_SPOILER,
      cycle_code,
      value,
    });
    InteractionManager.runAfterInteractions(() => {
      db.setCardSpoiler(where('encounter_code is not null AND cycle_code = :cycle_code', { cycle_code }), value);
    });
  };
}

export default {
  login,
  logout,
  verifyLogin,
  refreshMyDecks,
  setInCollection,
  setPackSpoiler,
};
