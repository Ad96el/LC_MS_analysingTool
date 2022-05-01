import {
  GridColDef, GridCellParams,
} from '@material-ui/data-grid';
import { ReactElement } from 'react';

export const getColumnsAssign = (renderActionCell : (params : GridCellParams) => ReactElement)
: GridColDef[] => [
  {
    field: 'name',
    headerName: 'Chain(s)',
    flex: 380,
  },
  {
    field: 'mass', type: 'number', headerName: 'Mass Fasta (Da)', flex: 400,
  },
  {
    field: 'peakMass', type: 'number', headerName: 'Mass Peak (Da)', flex: 400,
  },
  {
    field: 'glyco', headerName: 'Glyco Form', flex: 400,
  },
  {
    field: 'modifications',
    headerName: 'Mod Name',
    flex: 400,
  },
  {
    field: 'modificationQuantity', headerName: 'Mod Quantity', flex: 400,
  },
  { field: 'score', headerName: 'Error to Peak', flex: 400 },
  {
    field: 'action',
    width: 160,
    headerName: 'actions',

    renderCell: renderActionCell,
  },
];

export const getColumPeakDecon = (renderActionCell : (params : GridCellParams) => ReactElement)
: GridColDef[] => [
  {
    field: 'peakMass', headerName: 'Mass', flex: 70,
  },
  {
    field: 'peakIntensity', headerName: 'Intensity in %', flex: 100,
  },

  {
    field: 'score', headerName: 'Score in %', flex: 100,
  },
  {
    field: 'name', headerName: 'Chain', flex: 100,
  },
  {
    field: 'quantity', headerName: 'Quant.', flex: 70,
  },
  {
    field: 'modifications', headerName: 'Mod.', flex: 100,
  },
  {
    field: 'modificationQuantity', headerName: 'Mod. Quant.', flex: 100,
  },
  {
    field: 'glyco', headerName: 'Glyco', flex: 100,
  },
  {
    field: 'error', headerName: 'Error', flex: 100,
  },
  {
    field: 'action',
    flex: 120,
    headerName: 'actions',
    renderCell: renderActionCell,
  },
];

export const getColumPeak = (renderActionCell : (params : GridCellParams) => ReactElement,
  editable: boolean)
: GridColDef[] => [
  {
    field: 'rtPeak', headerName: 'Rt', flex: 100, editable,
  },
  {
    field: 'start', headerName: 'Start', flex: 120, editable,
  },
  {
    field: 'end', headerName: 'End', flex: 120, editable,
  },
  {
    field: 'window', headerName: 'Window', flex: 100,
  },
  {
    field: 'comp', headerName: 'Component', flex: 150,
  },
  {
    field: 'rtComp', headerName: 'Rt Component', flex: 150,
  },
  {
    field: 'action',
    width: 160,
    headerName: 'actions',
    renderCell: renderActionCell,
  },
];

export const massColoums: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Chain(s)',
    flex: 380,
  },
  {
    field: 'mass', type: 'number', headerName: 'Mass (Da)', flex: 400,
  },
  { field: 'glyco', headerName: 'Glyco Form', flex: 400 },
  {
    field: 'modifications',
    headerName: 'Mod Name',
    flex: 400,
  },
  { field: 'modificationQuantity', headerName: 'Mod Quantity', flex: 400 },
];

export const sugarColumns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Sugar',
    flex: 380,
  },
  { field: 'chemadd', headerName: 'Chemical formula', flex: 400 },
  {
    field: 'mass', type: 'number', headerName: 'Mass (Da)', flex: 400,
  },
];

export const speciesColumns: GridColDef[] = [
  {
    field: 'x',
    headerName: 'Mass (Da)',
    flex: 380,
  },
  { field: 'y', headerName: 'Intensity', flex: 400 },
];

export const ambrColumn : GridColDef[] = [
  {
    field: 'Column Name',
    headerName: 'Column Name',
    flex: 380,
  },
  {
    field: 'Culture Viability at Max. VCC (%)',
    headerName: 'Culture Viability at Max. VCC (%)',
    flex: 380,
  },
  {
    field: 'IVC at Harvest (10⁶ cells x h/ L)',
    type: 'number',
    headerName: 'IVC at Harvest (10⁶ cells x h/ L)',
    flex: 380,
  },
  {
    field: 'VCC Max (10⁶ cells/mL)',
    headerName: 'VCC Max (10⁶ cells/mL)',
    flex: 380,
    type: 'number',
  },
  {

    field: 'VCC at Harvest (10⁶ cells/mL)',
    type: 'number',
    headerName: 'VCC at Harvest (10⁶ cells/mL)',
    flex: 380,
  },
  {
    type: 'number',
    field: 'Viability at Harvest (%)',
    headerName: 'Viability at Harvest (%)',
    flex: 380,
  },

];
