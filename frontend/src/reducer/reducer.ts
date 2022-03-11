import { Reducer } from 'redux';
import * as Types from 'types';
import {
  CHANGE_THEME, CHANGE_TICS, CHANGE_PEAKS, RELOAD_PEAK, RELOAD_DECON, reloadDecon, APPLY_PREVIEW,
  CHANGE_SAMPLE, changeSample, reloadPeak, changeTheme, changePeaks, changeTics, CHANGE_ROWSPREVIEW,
  CREATE_RESULTS, prepareResultsCreation, CHANGE_MODIFICATIONSET, SELECT_MODIFICATIONSET,
} from './actions';
// own libs

type Action =
    | ReturnType<typeof changeTheme> | ReturnType<typeof changePeaks>
    | ReturnType<typeof changeTics> | ReturnType<typeof reloadDecon>
    | ReturnType<typeof reloadPeak> | ReturnType<typeof changeSample>
    | ReturnType<typeof prepareResultsCreation>

const initialState : Types.State = {
  theme: 'light',
  tics: [],
  peaks: { id: '', data: [] },
  reloadPeaks: false,
  reloadDecon: false,
  samples: [],
  prepareResults: [],
  massDeconPreview: undefined,
  modificationSet: [],
  selectedModificationSet: [],
  applyPreview: false,
};

const appReducer: Reducer<any, any> = (
  previousState = initialState,
  action : Action,
) => {
  if (action.type === CHANGE_THEME) {
    return { ...previousState, theme: action.payload };
  }
  if (action.type === CHANGE_TICS) {
    return { ...previousState, tics: action.payload };
  }
  if (action.type === CHANGE_PEAKS) {
    return { ...previousState, peaks: action.payload };
  }

  if (action.type === RELOAD_PEAK) {
    return { ...previousState, reloadPeaks: action.payload };
  }
  if (action.type === CHANGE_SAMPLE) {
    return { ...previousState, samples: action.payload };
  }
  if (action.type === CREATE_RESULTS) {
    return { ...previousState, prepareResults: action.payload };
  }

  if (action.type === RELOAD_DECON) {
    return { ...previousState, reloadDecon: action.payload };
  }
  if (action.type === CHANGE_ROWSPREVIEW) {
    return { ...previousState, massDeconPreview: action.payload };
  }
  if (action.type === CHANGE_MODIFICATIONSET) {
    return { ...previousState, modificationSet: action.payload };
  }
  if (action.type === SELECT_MODIFICATIONSET) {
    return { ...previousState, selectedModificationSet: action.payload };
  }
  if (action.type === APPLY_PREVIEW) {
    return { ...previousState, applyPreview: action.payload };
  }
  return previousState;
};

export default { data: appReducer };
