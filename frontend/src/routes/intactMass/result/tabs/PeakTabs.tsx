import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import {
  DataGrid, GridCellParams, GridColDef,
} from '@material-ui/data-grid';
import { useTranslate } from 'ra-core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { Button } from '@material-ui/core';
// own libs
import { LineChart, getColumPeak, GridToolbar } from 'components';
import * as Types from 'types';

const useStyles = makeStyles((theme: Theme) => createStyles({
  margin: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
  },
  root: { width: '100%' },
}));

const PeakSelectionTab : React.FC<any> = ({ record }) => {
  // hooks
  const classes = useStyles();
  const translate = useTranslate();

  // states
  const [dataChart, setDataChart] = React.useState<Types.dataPoint[]>([]);
  const [peak, setPeak] = React.useState<any[]>([]);
  const [highlightStroke, setHighlightStroke] = React.useState<Types.highlightStroke[]>([]);
  const [highlightLine, setHighlightLine] = React.useState<Types.highlightLine[]>([]);
  const [area, setArea] = React.useState<number[]>([0, 0]);

  React.useEffect(() => {
    const { tics, peaks } = record;
    setDataChart(JSON.parse(tics));
    setPeak(JSON.parse(peaks));
  }, []);

  const renderCell = (params: GridCellParams) => {
    const { row } = params;

    const changePeakHighlight = () => {
      setArea([row.start, row.end]);
      const strokePeak : Types.highlightStroke = {
        x: row.rtPeak, label: 'Peak', color: 'red', id: '0',
      };
      const strokeComp : Types.highlightStroke = {
        x: row.rtComp, label: row.comp, color: 'green', id: '1',
      };
      const highlightLineUpd : Types.highlightLine = {
        x1: row.rtComp - row.window,
        x2: row.rtComp + row.window,
        color: 'blue',
        id: row.id,
        y1: 40,
        y2: 40,
        label: `window ${row.comp}`,
      };

      setHighlightLine([highlightLineUpd]);
      setHighlightStroke([strokePeak, strokeComp]);
    };

    return (

      <Button size="small" color="primary" variant="contained" onClick={changePeakHighlight}>
        <VisibilityIcon fontSize="small" />
      </Button>

    );
  };

  const columns: GridColDef[] = getColumPeak(renderCell, false);

  return (
    <>
      <div className={classes.root}>

        <Box display="flex" p={1}>
          <Box p={1} flexGrow={1}>
            <Typography variant="h4" color="textSecondary">
              {translate('resources.routes.sample.lc')}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" p={1}>
          <Box p={1} flexGrow={1} style={{ height: '100%', width: '60%' }}>

            <LineChart
              width={window.innerWidth * 0.55}
              data={[{
                data: dataChart, color: '#4f3cc9', dataKey: 'y',
              }]}
              handleIntervallChange={setArea}
              highlightArea={area}
              highlightStroke={highlightStroke}
              highlightLine={highlightLine}
              yAxisLabel="Intensity in %"
              xAxisLabel="Time in min"
              half
            />
          </Box>
        </Box>
        <Box>
          <Box display="flex" p={1}>
            <Box
              p={1}
              flexGrow={1}
              style={{
                height: '100%', width: '60%', marginTop: '1em',
              }}
            >
              <Typography variant="h5" color="textSecondary">

                {translate('resources.routes.sample.detectpeak')}
              </Typography>
              <div style={{ height: 550, width: '100%', marginTop: '1em' }}>
                <DataGrid
                  disableSelectionOnClick
                  rows={peak}
                  pageSize={10}
                  columns={columns}
                  components={{
                    Toolbar: GridToolbar,
                  }}
                />
              </div>
            </Box>
            <Box p={1} />
          </Box>
        </Box>
      </div>
    </>
  );
};

export default PeakSelectionTab;
