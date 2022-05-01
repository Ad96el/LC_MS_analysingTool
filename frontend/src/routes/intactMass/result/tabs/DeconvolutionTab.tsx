import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import { useTranslate } from 'ra-core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  DataGrid, GridCellParams, GridRowData,
} from '@material-ui/data-grid';
import VisibilityIcon from '@material-ui/icons/Visibility';
// own libs
import * as Types from 'types';
import {
  getColumPeakDecon, LineChart, GridToolbar,
} from 'components';
import {
  TextField, Box, Button,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => createStyles({
  margin: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    minHeight: window.innerHeight * 0.5,
  },
  root: { width: '100%' },
}));

const PeakSelectionTab : React.FC<any> = ({ record }) => {
  // hooks
  const classes = useStyles();
  const translate = useTranslate();
  const deconData = JSON.parse(record.deconData);

  // states
  const [peaks, setPeaks] = React.useState<any[]>([]);

  const [showFit, setShowFit] = React.useState<boolean>(false);
  const [highlightSpec, setHighlightSpec] = React.useState<Types.highlightDot[]>([]);
  const [highlightDecon, setHighlightDecon] = React.useState<Types.highlightDot[]>([]);
  const [highlightDeconAssign, setHighlightDeconAssign] = React.useState<Types.highlightDot[]>([]);
  const [highlightStroke, setHighlightStroke] = React.useState<Types.highlightStroke[]>([]);
  const [data, setData] = React.useState<undefined | Types.deconData>(undefined);

  React.useEffect(() => {
    setPeaks(JSON.parse(record.peaks));
  }, []);

  const handlePeakSelection = (selectedPeak : Types.peak | null) => {
    if (selectedPeak) {
      const index = peaks.findIndex((obj) => obj.id === selectedPeak?.id);
      setData(deconData[index]);
      setHighlightDecon([]);
      setHighlightDeconAssign([]);
      setHighlightSpec([]);
      setHighlightStroke([]);
    }
  };

  const renderCellDeconPeak = (params: GridCellParams) => {
    const onClick = (row: GridRowData) => {
      const { specToPeak } = row;
      const updHighlightSpec = specToPeak.map((obj, index) => ({
        x: obj.x, y: obj.y, lablel: '', color: 'red', id: index,
      }));

      setHighlightSpec(updHighlightSpec);
      setHighlightDecon([{
        x: row.peakMass, y: row.peakIntensity === 100 ? 99 : row.peakIntensity, label: '', color: 'red', id: '1',
      }]);
    };

    const onClickAssign = (row: GridRowData) => {
      setHighlightDeconAssign([{
        x: row.peakMass, y: row.peakIntensity > 10 ? row.peakIntensity - 10 : row.peakIntensity + 5, label: row.name, color: 'orange', id: '0',
      }]);
      setHighlightStroke([{
        x: row.mass, color: 'orange', label: '', id: '0',
      }]);
    };
    const { row } = params;
    return (
      <>
        <Button size="small" color="secondary" variant="contained" style={{ marginRight: '1em' }} onClick={() => onClick(row)}>
          <VisibilityIcon fontSize="small" />
        </Button>
        <Button size="small" color="primary" variant="contained" onClick={() => onClickAssign(row)}>
          <VisibilityIcon fontSize="small" />
        </Button>
      </>
    );
  };

  const columns = getColumPeakDecon(renderCellDeconPeak);

  const rawData = [{
    data: data?.raw ? data?.raw : [], color: '#4f3cc9', dataKey: 'y',
  }];
  const dataToRender = !showFit ? rawData : rawData.concat([{
    data: data?.fit ? data?.fit : [], color: 'red', dataKey: 'y',
  }]);
  return (
    <>
      <div className={classes.root}>
        <Box display="flex">
          <Box flexGrow={1} style={{ height: '100%', width: '60%' }}>
            <Autocomplete
              options={peaks}
              getOptionLabel={(option) => `Peak start: ${option.start}, Peak end: ${option.end}`}
              getOptionSelected={(option, value) => option.id === value.id}
              style={{ width: '400px', marginLeft: '1em' }}
              onChange={(_, obj) => handlePeakSelection(obj)}
              autoComplete
              renderInput={(params) => <TextField {...params} label={translate('resources.routes.sample.peakswitch')} />}
            />
          </Box>
          <div style={{ margin: '1em' }}>
            <Button color={!showFit ? 'default' : 'secondary'} variant="contained" onClick={() => setShowFit(!showFit)}>
              {translate('resources.routes.sample.fitdat')}
            </Button>
          </div>

        </Box>

        <Box display="flex" p={1}>
          <Box p={1} flexGrow={1} style={{ height: '100%', width: '50%' }}>
            <Typography variant="h5" color="textSecondary">
              {translate('resources.routes.sample.msspectrum')}
            </Typography>
            <LineChart
              width={window.innerWidth * 0.28}
              data={dataToRender}
              highlightDots={highlightSpec}
              xAxisLabel="M/Z"
              yAxisLabel="Intensity in %"
              half
              reduced
            />
          </Box>
          <Box p={1} flexGrow={1} style={{ height: '100%', width: '50%' }}>
            <Typography variant="h5" color="textSecondary">
              {translate('resources.routes.sample.decon')}
            </Typography>
            <LineChart
              width={window.innerWidth * 0.28}
              data={data ? [{
                data: data?.decon, color: '#4f3cc9', dataKey: 'y',
              }] : []}
              highlightDots={highlightDecon.concat(highlightDeconAssign)}
              highlightStroke={highlightStroke}
              xAxisLabel="Mass in DA"
              yAxisLabel="Intensity in %"
              half
              reduced
            />
          </Box>
        </Box>
        <Typography variant="h5" color="textSecondary">
          {translate('resources.routes.sample.tabledeconpeak')}
        </Typography>
        <div style={{ height: window.innerHeight * 0.55, margin: '1em', width: '98%' }}>
          <DataGrid
            rows={data ? data?.peaks : []}
            pageSize={10}
            style={{ margin: '1em' }}
            disableSelectionOnClick
            columns={columns}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>

      </div>

    </>
  );
};

export default PeakSelectionTab;
