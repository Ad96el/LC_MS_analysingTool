import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import {
  DataGrid, GridCellParams, GridColDef,
} from '@material-ui/data-grid';
import { useNotify, useTranslate } from 'ra-core';
import RemoveIcon from '@material-ui/icons/Remove';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { Button } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
// own libs
import dataProvider from 'dataProvider';
import * as Types from 'types';
import { changePeaks, changeTics } from 'reducer/actions';
import {
  LineChart, getColumPeak, GridToolbar,
} from 'components';
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
  const ref = React.useRef(null);
  const classes = useStyles();
  const translate = useTranslate();
  const notify = useNotify();
  const dispatch = useDispatch();
  const peak = useSelector((state: Types.AppState) => state.data.peaks);
  const prepareResult = useSelector((state: Types.AppState) => state.data.prepareResults);
  const realod = useSelector((state: Types.AppState) => state.data.reloadPeaks);
  const dataTics = useSelector((state: Types.AppState) => state.data.tics);

  // states
  const [loadingMS, setLoadingMS] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [area, setArea] = React.useState<number[]>([0, 0]);
  const [open, setOpen] = React.useState(false);
  const [dataChart, setDataChart] = React.useState<Types.dataPoint[] >([]);
  const [msData, setMsData] = React.useState<Types.dataPoint[]>([]);
  const [highlightStroke, setHighlightStroke] = React.useState<Types.highlightStroke[]>([]);
  const [highlightLine, setHighlightLine] = React.useState<Types.highlightLine[]>([]);

  const renderCell = (params: GridCellParams) => {
    const { row } = params;

    const onclick = (value: any) => {
      const { id } = value;
      const upd = { ...peak };
      const updList = [...upd.data];
      const index = updList.findIndex((obj) => obj.id === id);
      updList.splice(index, 1);
      upd.data = updList;
      dispatch(changePeaks(upd));
      setHighlightLine([]);
      setHighlightStroke([]);
      setArea([0, 0]);
    };

    const changePeakHighlight = () => {
      const strokePeak : Types.highlightStroke = {
        x: row.rtPeak, label: 'Peak', color: 'red', id: '0',
      };
      const strokeComp : Types.highlightStroke = {
        x: row.rtComp, label: row.comp, color: 'green', id: '1',
      };
      const highlightLineUpd : Types.highlightLine = {
        x1: row.rtComp - row.window,
        x2: row.rtComp + row.window,
        color: '#4f3cc9',
        id: row.id,
        y1: 40,
        y2: 40,
        label: `window ${row.comp}`,
      };

      setHighlightLine([highlightLineUpd]);
      setHighlightStroke([strokePeak, strokeComp]);
      setArea([row.start, row.end]);
    };

    return (
      <>
        <Button disabled={loading} size="small" variant="contained" color="secondary" style={{ marginRight: '1em' }} onClick={() => onclick(row)}>
          <RemoveIcon fontSize="small" />
        </Button>
        <Button disabled={loading} size="small" color="primary" variant="contained" onClick={changePeakHighlight}>
          <VisibilityIcon fontSize="small" />
        </Button>
      </>
    );
  };

  // effects
  React.useEffect(() => {
    const index = prepareResult.findIndex((obj) => obj.id === sid);
    setLoading(true);
    dataProvider.getValues(sid as string, 'all').then((response) => {
      const { tics } = response;
      const peaks = index > 0 ? prepareResult[index] : response.peaks;
      setDataChart(tics);
      dispatch(changePeaks(peaks));
      dispatch(changeTics(tics));
      setLoading(false);
      setArea([0, 0]);
      setHighlightLine([]);
      setHighlightStroke([]);
    }).catch(() => {
      notify('error in detection of peaks', 'warning');
    });
  }, [sid, realod]);

  React.useEffect(() => {
    if ((area[0] === 0 && area[1] === 0) || typeof area[0] !== 'number' || typeof area[1] !== 'number') {
      setMsData([]);
    } else {
      setLoadingMS(true);
      dataProvider.getValues(sid as string, 'spectrum', area).then((rows : Types.dataPoint []) => {
        setMsData(rows);
        setLoadingMS(false);
      }).catch(() => {
        notify(translate('resources.routes.samples.errorspectrum'), 'error');
      });
    }
  }, [area]);

  React.useEffect(() => {
    setDataChart(dataTics);
  }, [sid]);

  const addPeak = (i : number[]) => {
    if (!i || typeof i[0] !== 'number' || typeof i[1] !== 'number') {
      return;
    }

    const upd = { ...peak };
    const updateList = [...upd.data];
    const start = i[0] < i[1] ? i[0] : i[1];
    const end = i[0] < i[1] ? i[1] : i[0];
    const id = uuidv4();
    const components : Types.MethodSet.ComponentI[] = JSON.parse(method.components);

    const updates : Types.peak [] = [];
    components.forEach((comp) => {
      if (start <= comp.rt && end >= comp.rt) {
        const candidate : Types.peak = {
          rtPeak: ((start + end) / 2),
          start,
          end,
          id,
          rtComp: comp.rt,
          window: comp.window,
          comp: comp.name,
        };
        updates.push(candidate);
      }
    });

    if (updates.length === 0) {
      updateList.push({
        rtPeak: ((start + end) / 2),
        start,
        end,
        id,
      });
      upd.data = updateList;
    } else {
      const concatenatedArray = updateList.concat(updates);
      upd.data = concatenatedArray;
    }

    const highlightPeak : Types.highlightStroke = {
      x: ((start + end) / 2), label: 'Peak', color: 'red', id,
    };

    dispatch(changePeaks(upd));
    setHighlightStroke([highlightPeak]);
    setHighlightLine([]);
  };

  const applyChanges = (row) => {
    const { field, value, id } = row;
    const upd = { ...peak };
    const { data } = upd;

    const index = data.findIndex((obj) => obj.id === id);
    upd.data[index][field] = +value;

    const highlightPeak : Types.highlightStroke = {
      x: upd.data[index].rtPeak, label: 'Peak', color: 'red', id,
    };

    setArea([upd.data[index].start, upd.data[index].end]);

    dispatch(changePeaks(upd));
    setHighlightStroke([highlightPeak]);
  };

  const { data } = peak;
  const columns: GridColDef[] = getColumPeak(renderCell, true);

  return (
    <>

      <Configuration open={open} methodRaw={method} setOpen={setOpen} />

      <div className={classes.root}>

        <Box display="flex" p={1}>
          <Box p={1} flexGrow={1}>
            <Typography variant="h4" color="textSecondary">
              {translate('resources.routes.sample.lc')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => {
              setOpen(true);
            }}
          >
            {translate('resources.routes.sample.methodprops')}
          </Button>

        </Box>
        <Box display="flex" p={1}>
          <Box p={1} flexGrow={1} style={{ height: '100%', width: '60%' }}>
            <div ref={ref}>
              <LineChart
                width={window.innerWidth * 0.8}
                data={[{ data: dataChart, color: '#4f3cc9', dataKey: 'y' }]}
                loading={loading}
                xAxisLabel="Time in Min"
                yAxisLabel="Intensity in %"
                handleIntervallChange={setArea}
                addPeak={addPeak}
                half={false}
                highlightArea={area}
                highlightStroke={highlightStroke}
                highlightLine={highlightLine}
                reduced
              />
            </div>
          </Box>

        </Box>
        <Box>

          <Box display="flex" p={1}>
            <Box p={1} flexGrow={1} style={{ height: '100%', width: '60%' }}>
              <Typography variant="h5" color="textSecondary">

                {translate('resources.routes.sample.detectpeak')}
              </Typography>
              <div style={{
                height: 500, width: window.innerWidth * 0.4, margin: 1,
              }}
              >
                <DataGrid
                  onCellEditCommit={applyChanges}
                  rows={data}
                  disableSelectionOnClick
                  pageSize={10}
                  loading={loading}
                  columns={columns}
                  rowsPerPageOptions={[10, 15, 20]}
                  components={{
                    Toolbar: GridToolbar,
                  }}

                />
              </div>

            </Box>
            <Box p={1}>
              <Typography style={{ marginLeft: '2em' }} variant="h5" color="textSecondary">
                {translate('resources.routes.sample.ms')}
              </Typography>

              <div style={{
                height: 300, width: window.innerWidth * 0.4, margin: 1,
              }}
              >
                <LineChart
                  width={window.innerWidth * 0.4}
                  xAxisLabel="Mass in KDA"
                  yAxisLabel="Intensity in %"
                  data={[{ data: msData, color: '#4f3cc9', dataKey: 'y' }]}
                  loading={loadingMS}
                  half
                  reduced
                />
              </div>
            </Box>

          </Box>

        </Box>
      </div>
    </>
  );
};

export default PeakSelectionTab;
