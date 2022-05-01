import React from 'react';

import { useNotify, useTranslate } from 'ra-core';
import { Loading } from 'react-admin';
import { Button, Box, Typography } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
// own libs
import {
  Upload as UploadField, ambrColumn, CheckedList, LineChart, GridToolbar,
} from 'components';
import * as Types from 'types';
import dataProvider from 'dataProvider';
import { DataGrid } from '@material-ui/data-grid';

const useStyles = makeStyles((theme: Theme) => createStyles({
  button: {
    margin: theme.spacing(1),
  },
  root: {
    display: 'flex',
    margin: '1em',
    marginLeft: 'auto',
  },

}));

const probValues = [
  { key: 'Vitability', id: 0, selected: true },
  { key: 'Lactate', id: 1, selected: false },
  { key: 'Vcc', id: 2, selected: false },
  { key: 'Ivc', id: 3, selected: false }];
const Page : React.FC = () => {
  // states
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState<File[]>([]);
  const [uploaded, setUploaded] = React.useState(false);
  const [data, setData] = React.useState<Types.ambrFile>({
    summary: [],
    Ivc: [],
    Vcc: [],
    Lactate: [],
    Vitability: [],
    keys: [],
  });
  const [dataToRender, setDataToRender] = React.useState<Types.dataChart[]>([]);
  const [dataKeys, setDataKeys] = React.useState<Types.select[]>([]);
  const [yAxisLabel, setYAxisLabel] = React.useState<string>('in (%)');
  const [plots, setPlots] = React.useState<Types.select[]>(probValues);
  // hooks
  const notify = useNotify();
  const classes = useStyles();
  const translate = useTranslate();
  const onFileInputChange = async (files : File[]) => {
    setFile(files);
  };

  // side effects

  React.useEffect(() => {
    if (data?.keys && data?.keys.length > 0) {
      setDataKeys([...data?.keys]);
    }
  }, [data]);

  React.useEffect(() => {
    const selectedDataKeys = dataKeys.filter((obj) => obj.selected);
    const selectedPlot = plots.filter((obj) => obj.selected)[0];
    const relevantData : Types.dataPoint[] = data[selectedPlot.key];

    const datasToRender : Types.dataChart[] = [];
    selectedDataKeys.forEach((obj) => {
      const field = obj.key;
      const dataField : Types.dataPoint[] = [];
      relevantData.forEach((point) => {
        const yPoint = point[field];
        if (yPoint) {
          const newPoint = { x: point.x, [field]: yPoint };
          dataField.push(newPoint);
        }
      });
      datasToRender.push({ color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, data: dataField, dataKey: field });
    });
    setDataToRender(datasToRender);
  }, [dataKeys, plots]);

  // functions
  const handleClick = async () => {
    let csvFile : any;
    let excelFile : any;
    if (file.length !== 2) {
      notify('resources.routes.ambr.error.filecount', 'warning');
      return;
    }

    file.forEach((obj) => {
      if (obj.name.includes('.csv')) {
        csvFile = obj;
      }
      if (obj.name.includes('.xlsx')) {
        excelFile = obj;
      }
    });

    if (!csvFile || !excelFile) {
      notify('resources.routes.ambr.error.format', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response : Types.ambrFile = await dataProvider.getAmbrData(csvFile, excelFile);
      setUploaded(true);
      setLoading(false);
      setData(response);
    } catch {
      notify('error.ambr', 'warning');
      setLoading(false);
    }
  };

  const exportFile = () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const dataOut : any[] = [];
    data.summary.forEach((obj) => {
      const upd = { ...obj };
      delete upd.id;
      dataOut.push(upd);
    });
    const summarySheet = XLSX.utils.json_to_sheet(dataOut);

    const wb = {
      Sheets: {
        Summary: summarySheet,
      },
      SheetNames: ['Summary'],
    };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(dataBlob, 'summary.xlsx');
  };

  const clear = () => {
    setLoading(false);
    setUploaded(false);
    setFile([]);
  };

  const handleDataKeys = (changed : Types.select) => {
    const upd = [...dataKeys];
    const indexChanged = upd.findIndex((obj) => obj.id === changed.id);
    upd[indexChanged].selected = !upd[indexChanged].selected;
    setDataKeys(upd);
  };

  const handlePlotKind = (changed: Types.select) => {
    const currentPlot = plots.filter((obj) => obj.selected)[0];

    if (currentPlot.id === changed.id) {
      return;
    }

    const upd : Types.select[] = [];
    plots.forEach((obj) => {
      const updObj = { ...obj };
      updObj.selected = false;
      upd.push(updObj);
    });
    const indexChanged = upd.findIndex((obj) => obj.id === changed.id);
    upd[indexChanged].selected = true;
    if (upd[indexChanged].key === 'Vitability') {
      setYAxisLabel(' in  (%)');
    } else if (upd[indexChanged].key === 'Lactate') {
      setYAxisLabel('in (g/L)');
    } else if (upd[indexChanged].key === 'Vcc') {
      setYAxisLabel('in (10E6 cells/mL)');
    } else if (upd[indexChanged].key === 'IVC') {
      setYAxisLabel('in (10E6 cells x h/ L)');
    }

    setPlots(upd);
  };

  const name = plots.filter((obj) => obj.selected)[0].key;
  return (
    <>
      {loading ? <Loading loadingPrimary="resources.message.loading" loadingSecondary="resources.message.createambr" />

        : (
          <>
            <div className={classes.root}>
              <Button
                style={{ marginRight: '1em' }}
                onClick={handleClick}
                variant="outlined"
                color="secondary"
                disabled={file.length !== 2 || uploaded}
              >
                {translate('resources.routes.ambr.calculate')}
              </Button>
              <Button
                style={{ marginRight: '1em' }}
                onClick={clear}
                variant="outlined"
                color="primary"
              >
                {translate('resources.routes.ambr.clear')}
              </Button>
              <Button
                variant="outlined"
                onClick={exportFile}
                color="primary"
                disabled={!uploaded}
              >
                {translate('resources.routes.ambr.export')}
              </Button>
            </div>

            {!uploaded && (
            <UploadField
              onFileInputChange={onFileInputChange}
            />
            )}

            {uploaded && (
              <>
                <div style={{ width: '100%', height: 450 }}>
                  <DataGrid
                    style={{ margin: '1em' }}
                    disableSelectionOnClick
                    rows={data.summary}
                    pageSize={10}
                    columns={ambrColumn}
                    components={{
                      Toolbar: GridToolbar,
                    }}
                  />
                </div>
                <div style={{ marginTop: '1em' }}>
                  <Box display="flex" p={1}>
                    <Box p={1} flexGrow={1}>
                      <div style={{ display: 'flex', flexDirection: 'row' }}>

                        <CheckedList
                          data={plots}
                          handleChange={handlePlotKind}
                          title={name}
                          close
                        />
                        <Typography variant="subtitle1" component="div" style={{ marginLeft: '1em', marginTop: 4 }}>
                          {yAxisLabel}
                        </Typography>

                      </div>

                    </Box>
                    <Box p={1}>
                      <CheckedList data={dataKeys} title="Data Keys" handleChange={handleDataKeys} />
                    </Box>
                  </Box>
                  <LineChart
                    width={window.innerWidth * 0.8}
                    data={dataToRender}
                    showLegend
                    xAxisLabel="Elapsed Time (Hours)"
                  />

                </div>
              </>
            )}
          </>
        )}
    </>
  );
};

export default Page;
