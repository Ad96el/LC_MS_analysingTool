import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import { useNotify, useTranslate } from 'ra-core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useSelector } from 'react-redux';
import {
  DataGrid, GridCellParams, GridRowData,
} from '@material-ui/data-grid';
import VisibilityIcon from '@material-ui/icons/Visibility';
// own libs
import dataProvider from 'dataProvider';
import * as Types from 'types';
import {
  LineChart, getColumPeakDecon, GridToolbar,
} from 'components';
import {
  TextField, Box, Button,
} from '@material-ui/core';
import Configuration from './Configuration';

interface PeakSelectionTabI {
  sid: string | undefined,
  method: Types.MethodSet.method
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  margin: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    minHeight: window.innerHeight * 0.5,
  },
  root: { width: '100%' },
}));

const PeakSelectionTab : React.FC<PeakSelectionTabI> = ({ sid, method }) => {
  // hooks
  const classes = useStyles();
  const translate = useTranslate();
  const notify = useNotify();
  const peaks = useSelector((state: Types.AppState) => state.data.peaks);
  const reload = useSelector((state : Types.AppState) => state.data.reloadDecon);

  // states
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [currentPeak, setCurrentPeak] = React.useState<Types.peak | undefined>();
  const [showFit, setShowFit] = React.useState<boolean>(false);
  const [highlightSpec, setHighlightSpec] = React.useState<Types.highlightDot[]>([]);
  const [highlightDecon, setHighlightDecon] = React.useState<Types.highlightDot[]>([]);
  const [highlightDeconAssign, setHighlightDeconAssign] = React.useState<Types.highlightDot[]>([]);
  const [highlightStroke, setHighlightStroke] = React.useState<Types.highlightStroke[]>([]);
  const [rerender, setRerender] = React.useState<React.Key>(Date());
  const [data, setData] = React.useState<undefined | Types.deconData>(undefined);

  // effects
  React.useEffect(() => {
    setCurrentPeak(undefined);
    setData(undefined);
    setHighlightSpec([]);
    setHighlightDecon([]);
    setHighlightDeconAssign([]);
    setHighlightStroke([]);
    setRerender(Date());
  }, [sid, peaks]);

  const getData = (start: number, end: number) => {
    setLoading(true);
    dataProvider.getValues(sid as string, 'msdecon', [start, end]).then((response) => {
      setData(response);
      setHighlightDeconAssign([]);
      setHighlightStroke([]);
      setHighlightSpec([]);
      setHighlightDecon([]);
      setLoading(false);
    }).catch(() => {
      notify('error in detection of peaks', 'warning');
    });
  };

  React.useEffect(() => {
    if (currentPeak) {
      getData(currentPeak.start, currentPeak.end);
    }
  }, [reload]);

  const handlePeakSelection = (selectedPeak : Types.peak | null) => {
    if (selectedPeak) {
      setCurrentPeak(selectedPeak);
      getData(selectedPeak.start, selectedPeak.end);
    } else {
      setData(undefined);
      setCurrentPeak(undefined);
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
        x: row.peakMass, y: row.peakIntensity === 100 ? 99 : row.peakIntensity, label: '', color: 'red', id: '0',
      }]);
    };
    const onClickAssign = (row: GridRowData) => {
      setHighlightDeconAssign([{
        x: row.peakMass, y: row.peakIntensity > 10 ? row.peakIntensity - 10 : row.peakIntensity, label: row.name, color: 'orange', id: '1',
      }]);
      setHighlightStroke([{
        x: row.mass, color: 'orange', label: '', id: '0',
      }]);
    };
    const { row } = params;
    return (
      <>
        <Button disabled={loading} size="small" color="secondary" variant="contained" onClick={() => onClick(row)} style={{ marginRight: '1em' }}>
          <VisibilityIcon fontSize="small" />
        </Button>
        <Button disabled={loading} size="small" color="primary" variant="contained" onClick={() => onClickAssign(row)}>
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
      <Configuration open={open} methodRaw={method} setOpen={setOpen} />
      <div className={classes.root}>
        <Box display="flex">
          <Box flexGrow={1} style={{ height: '100%', width: '60%' }}>
            <Autocomplete
              key={rerender}
              options={peaks.data}
              getOptionLabel={(option) => `Peak start: ${option.start}, Peak end: ${option.end}`}
              style={{ width: '400px', marginLeft: '2.5em' }}
              onChange={(_, obj) => handlePeakSelection(obj)}
              autoComplete
              renderInput={(params) => <TextField {...params} label={translate('resources.routes.sample.peakswitch')} />}
            />
          </Box>
          <div style={{ margin: '1em' }}>
            <Button disabled={!currentPeak} color={!showFit ? 'default' : 'secondary'} variant="contained" onClick={() => setShowFit(!showFit)}>
              {translate('resources.routes.sample.fitdat')}
            </Button>
          </div>
          <div style={{ margin: '1em', marginLeft: 0 }}>
            <Button
              variant="contained"
              onClick={() => {
                setOpen(true);
              }}
            >
              {translate('resources.routes.sample.methodprops')}
            </Button>
          </div>
        </Box>

        <Box display="flex" p={1}>
          <Box p={1} flexGrow={1} style={{ height: '100%', width: '50%' }}>
            <Typography variant="h5" color="textSecondary" style={{ marginLeft: '1em' }}>
              {translate('resources.routes.sample.msspectrum')}
            </Typography>
            <LineChart
              width={window.innerWidth * 0.4}
              data={dataToRender}
              reduced
              loading={loading}
              highlightDots={highlightSpec}
              yAxisLabel="Intensity in %"
              xAxisLabel="M/Z"
              half
            />
          </Box>
          <Box p={1} flexGrow={1} style={{ height: '100%', width: '50%' }}>
            <Typography variant="h5" color="textSecondary" style={{ marginLeft: '1em' }}>
              {translate('resources.routes.sample.decon')}
            </Typography>
            <LineChart
              reduced
              width={window.innerWidth * 0.4}
              data={data ? [{
                data: data?.decon, color: 'blue', dataKey: 'y',
              }] : []}
              yAxisLabel="Intensity in %"
              xAxisLabel="Mass in DA"
              loading={loading}
              highlightDots={highlightDecon.concat(highlightDeconAssign)}
              highlightStroke={highlightStroke}
              half
            />
          </Box>
        </Box>
        <Typography variant="h5" color="textSecondary" style={{ marginLeft: '1em', marginTop: '2em' }}>
          {translate('resources.routes.sample.tabledeconpeak')}
        </Typography>
        <div style={{
          height: window.innerHeight * 0.45, width: '100%',
        }}
        >
          <DataGrid
            rows={data ? data?.peaks : []}
            pageSize={10}
            loading={loading}
            columns={columns}
            style={{ margin: '1em', overflowX: 'hidden' }}
            disableSelectionOnClick
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
