import { Record } from 'ra-core';
import * as TYPES from 'types';

export const CHANGE_THEME = 'CHANGE_THEME';
export const CHANGE_TICS = 'CHANGE_TICS';
export const CHANGE_PEAKS = 'CHANGE_PEAKS';
export const RELOAD_PEAK = 'RELOAD_PEAK';
export const RELOAD_DECON = 'RELOAD_DECON';
export const CHANGE_SAMPLE = 'CHANGE_SAMPLE';
export const CREATE_RESULTS = 'CREATE_RESULTS';
export const CHANGE_ROWSPREVIEW = 'CHANGE_ROWSPREVIEW';
export const CHANGE_MODIFICATIONSET = 'CHANGE_MODIFICATIONSET';
export const APPLY_PREVIEW = 'APPLY_PREVIEW';
export const SELECT_MODIFICATIONSET = 'SELECT_MODIFICATIONSET';

type ThemeName = 'light' | 'dark';

interface ChangeThemeI {
  type: string,
  payload: ThemeName
}
export const changeTheme = (theme: ThemeName) : ChangeThemeI => ({
  type: CHANGE_THEME,
  payload: theme,
});

interface ChangeTics {
  type: string,
  payload: TYPES.dataPoint[]
}
export const changeTics = (data : TYPES.dataPoint[]) : ChangeTics => ({
  type: CHANGE_TICS,
  payload: data,
});

interface ChangePeaks {
  type: string,
  payload: TYPES.peaks
}

export const changePeaks = (data : TYPES.peaks) : ChangePeaks => ({
  type: CHANGE_PEAKS,
  payload: data,
});

interface reloadComponents {
  type: string,
  payload: boolean
}

export const reloadPeak = (data : boolean) : reloadComponents => ({
  type: RELOAD_PEAK,
  payload: data,
});

interface changeSampleI {
  type: string,
  payload: Record[]
}

export const changeSample = (data : Record[]) : changeSampleI => ({
  type: CHANGE_SAMPLE,
  payload: data,
});

interface createResults {
  type: string,
  payload: Record[]
}

export const prepareResultsCreation = (data : Record[]) : createResults => ({
  type: CREATE_RESULTS,
  payload: data,
});

interface changeRowsI {
  type: string,
  payload: TYPES.proteinTypes.Rows | undefined
}

export const changeRowsPreview = (data : TYPES.proteinTypes.Rows | undefined) : changeRowsI => ({
  type: CHANGE_ROWSPREVIEW,
  payload: data,
});

interface reloadDeconI {
  type: string,
  payload: boolean
}

export const reloadDecon = (data : boolean) : reloadDeconI => ({
  type: RELOAD_DECON,
  payload: data,
});

interface changeModificationSetsI {
  type: string,
  payload: TYPES.modificationSet[]
}

export const changeModificationSets = (data : TYPES.modificationSet[]) :
changeModificationSetsI => ({
  type: CHANGE_MODIFICATIONSET,
  payload: data,
});

interface changeModificationSetI {
  type: string,
  payload: TYPES.modificationSet[]
}

export const changeModificationSet = (data : TYPES.modificationSet[]) :
changeModificationSetI => ({
  type: SELECT_MODIFICATIONSET,
  payload: data,
});

interface applyPreviewI {
  type: string,
  payload: boolean
}

export const applyPreview = (data : boolean) :
applyPreviewI => ({
  type: APPLY_PREVIEW,
  payload: data,
});
