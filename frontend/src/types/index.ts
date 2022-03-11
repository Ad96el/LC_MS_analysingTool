/* eslint-disable camelcase */
import { Record } from 'react-admin';
import * as proteinTypes from './protein';
import * as MethodSet from './method';

export {
  proteinTypes, MethodSet,
};

export interface dataChart {
  data: dataPoint[]
  dataKey: string
  color: string
}

export interface dataPoint {
  x: number,
  [key: string]: number
}

export interface peak {
  rtPeak: number,
  intensity?: number,
  rtComp?: number,
  window?: number,
  start: number,
  end: number,
  comp?: string,
  id: string
}

export interface peaks {
  id: string
  data: peak[]
}

export interface credentialsI {
  email: string,
  password: string,
  signUp: boolean
}

export interface loginI {
  token: string,
  userId: string,
  role: string
}

export interface peaksToComp{
  rtPeak: number,
  intensity: number
  rtComp: number
  window:number
  comp: string
}

export interface LooseObject {
  [key: string]: any
}

export type ThemeName = 'light' | 'dark';
export interface State {
  theme: ThemeName,
  tics: dataPoint[]
  peaks: peaks
  samples: Record[]
  reloadPeaks: boolean
  reloadDecon: boolean
  prepareResults :prepareResults[]
  massDeconPreview: proteinTypes.Rows | undefined
  modificationSet: modificationSet[]
  selectedModificationSet: modificationSet[]
  applyPreview: boolean
}

export interface RowI {
  name: string,
  mass: number,
  glyco: string,
  modifications: string,
  modificationQuantity: string,
  score?: number
}

export interface AppState {
  data: State
  admin: any
}

export interface prepareResults {
  peaks: peaks[]
  id: string
  tics: dataPoint[]
  updated: boolean
}

export interface highlightDot{
  x: number,
  y: number,
  label: string,
  id: string,
  color: string,
}

export interface highlightStroke{
  x: number,
  label: string,
  id: string,
  color: string,
}

export interface highlightLine{
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
  id: string,
  color: string,
}

export interface peaksDecon {
  x: number,
  y: number,
  id: number,
  score: number,
  specToPeak: dataPoint[]
}

export interface deconData {
  assign: RowI[],
  decon: dataPoint[],
  fit: dataPoint[],
  raw: dataPoint[],
  peaks:peaksDecon[]
}

export interface modification {
  id: string,
  formula_add : string,
  formula_sub: string,
  kind: string,
  mass: number,
  name: string
}

export interface modificationSet {
  id: string,
  created: string,
  name: string,
  modifications: modification[]
}

interface ivc {
  [key: string]: number
}

interface vcc {
  [key: string]: number
}

interface lactate {
  [key: string]: number
}

interface vitability {
  [key: string]: number
}

interface summary {
  [key: string]: number
}

export interface ambrFile {
  summary: summary[],
  Ivc: ivc[],
  Vcc: vcc[],
  Lactate: lactate[],
  Vitability: vitability[],
  keys: select[],
}

export interface select {
  id: number,
  selected: boolean,
  key: string
}
