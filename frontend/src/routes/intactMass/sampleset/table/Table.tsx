/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import {
  useTranslate, useDataProvider, useNotify, GetListParams, PaginationPayload, SortPayload,
  Record,
} from 'react-admin';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {
  DataGrid, GridCellParams, GridColDef,
} from '@material-ui/data-grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { Prompt } from 'react-router';
import { Button } from '@material-ui/core';

import { ShowProps } from 'ra-core/esm/controller/details/useShowController';
// own libs
import dataProvider from 'dataProvider';
import { GridToolbar } from 'components';

const ColorSelect = ({
  value, row, handleSelect, editable, data,
}) => (
  <Select
    disabled={!editable}
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    fullWidth
    value={value}
    onChange={(event) => handleSelect(event, row)}
    style={{ backgroundColor: value }}
  >
    {data.map((v) => <MenuItem style={{ backgroundColor: v }} key={v} value={v}>{v}</MenuItem>)}
  </Select>
);

const MsSelect = ({
  value, row, handleSelect, editable, data,
}) => (
  <Select
    disabled={!editable}
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    fullWidth
    value={value}
    onChange={(event) => handleSelect(event, row)}
    style={{ backgroundColor: value }}
  >
    {data.map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
  </Select>
);

interface Table {
  props: ShowProps,
  editable: boolean,
  submit?: boolean,
  loading: boolean
}

// editable table
const SampleTable : React.FC<Table> = ({
  props, editable, submit = false, loading,
}) => {
  const [rows, setRows] = React.useState<Record[]>([]);
  const [methodSet, setMethodSet] = React.useState <Record[]>([]);
  const [colors, setColors] = React.useState<string[]>([]);
  const [highlight, setHighlight] = React.useState(false);
  const [fetchLoading, setFetchLoading] = React.useState(false);

  // hocks
  const dataProviderReact = useDataProvider();
  const translate = useTranslate();
  const notify = useNotify();
  React.useEffect(() => {
    if (submit) {
      handleSubmit();
    }
  }, [submit]);

  // get data
  React.useEffect(() => {
    const { id } = props;

    const getSamples = async () => {
      const pagination : PaginationPayload = { page: 1, perPage: 250 };
      const sort : SortPayload = { field: 'id', order: 'ASC' };
      const filter = { sid: id };
      const paramsSample : GetListParams = {
        pagination, sort, filter,
      };
      const response = await dataProviderReact.getList('sample', paramsSample);
      const { data } = response;
      const dataMS = data.map((obj) => {
        const upd = { ...obj };
        upd.msid = obj.methodset.id ? obj.methodset.id : '';
        return upd;
      });
      return dataMS;
    };

    const getMethodSet = async () => {
      const pagination : PaginationPayload = { page: 1, perPage: 250 };
      const sort : SortPayload = { field: 'id', order: 'ASC' };
      const paramsMethodSets : GetListParams = {
        pagination, sort, filter: {},
      };

      const rawData = await dataProviderReact.getList('methodset', paramsMethodSets);
      const { data } = rawData;
      return data;
    };

    const getColors = async () => {
      const colorData = await dataProvider.getColors();
      return colorData;
    };

    const getData = async () => {
      const sampleData = await getSamples();
      const methodSetdata = await getMethodSet();
      const colorsData = await getColors();
      return [sampleData, methodSetdata, colorsData];
    };

    setFetchLoading(true);
    getData().then((datas) => {
      const sampleData = datas[0];
      const methodData = datas[1];
      const colorsData = datas[2];
      setRows(sampleData);
      setMethodSet(methodData);
      setColors(colorsData);
      setFetchLoading(false);
    }).catch(() => {
      notify('could not get data', 'warning');
      setRows([]);
      setMethodSet([]);
      setColors([]);
      setFetchLoading(false);
    });

    // colors
  }, []);

  // Callback functions
  const changeMS = (e : React.ChangeEvent<{ name?: string | undefined; value: string; }>,
    row: Record) => {
    e.stopPropagation();

    const { value } = e.target;
    const updateRow = [...rows];
    const indexRow = updateRow.findIndex(((obj : Record) => obj.id === row.id));
    const selectedMethodsetIndex = methodSet.findIndex((obj) => obj.id === value);
    updateRow[indexRow].msid = value;
    updateRow[indexRow].methodset = methodSet[selectedMethodsetIndex];
    updateRow[indexRow].updated = true;
    setRows(updateRow);
    setHighlight(true);
  };

  const changeColor = (e : React.ChangeEvent<{ name?: string | undefined; value: string; }>,
    row: Record) => {
    e.stopPropagation();
    const newColor = e.target.value;
    if (!newColor) {
      return;
    }
    const updateRow = [...rows];
    const indexRow: number = updateRow.findIndex(((obj : Record) => obj.id === row.id));

    updateRow[indexRow].color = newColor;
    updateRow[indexRow].updated = true;
    setRows(updateRow);
    setHighlight(true);
  };

  const handleSubmit = async () => {
    const updatableRows = rows.filter((obj) => obj.updated);
    updatableRows.forEach(async (row) => {
      const params = {
        id: row.id,
        data: row,
        previousData: row,
      };
      try {
        await dataProviderReact.update('sample', params);
      } catch (error) {
        notify('error', 'warning');
      }
    });
    setHighlight(false);
  };

  const applyChanges = (row : Record) => {
    const { field, value, id } = row;
    const upd = [...rows];

    const index = upd.findIndex((obj) => obj.id === id);
    upd[index][field] = value;
    setRows(upd);
    setHighlight(true);
  };

  const columns: GridColDef[] = [
    {
      field: 'name', headerName: translate('resources.routes.sample.name'), flex: 400, editable: editable && !loading,
    },
    {
      field: 'type', headerName: translate('resources.routes.sample.type'), flex: 400, editable: editable && !loading,
    },
    {
      field: 'user',
      headerName: translate('resources.routes.sample.user'),
      flex: 300,
      valueFormatter: (param) => param.row?.user?.email,
    },
    {
      sortable: false,
      field: 'color',
      headerName: translate('resources.routes.sample.color'),
      flex: 300,
      renderCell: (params: GridCellParams) => {
        const { value, row } = params;
        return (
          <ColorSelect
            handleSelect={changeColor}
            value={value as string}
            row={row}
            data={colors}
            editable={editable && !loading}
          />
        );
      },
    },
    {
      sortable: false,
      field: 'methodset',
      headerName: translate('resources.routes.sample.methodset'),
      flex: 400,
      renderCell: (params: GridCellParams) => {
        const { row } = params;
        return (
          <MsSelect
            handleSelect={changeMS}
            value={row.methodset.id as string}
            row={row}
            data={methodSet}
            editable={editable && !loading}
          />
        );
      },
    },
    {
      sortable: false,
      field: 'Show',
      flex: 200,
      headerName: 'Show',
      renderCell: (params: GridCellParams) => {
        const { row } = params;
        return (
          <Button size="small" color="primary" variant="contained" onClick={() => { window.location.href = `/#/sample/${row.id}`; }}>
            <VisibilityIcon fontSize="small" />
          </Button>
        );
      },
    },

  ];

  const VerticalSpacer = () => <span style={{ height: '1em' }} />;
  return (
    <>

      <VerticalSpacer />
      <div style={{ display: 'flex' }}>
        <Button
          color="default"
          variant="outlined"
          style={{ marginLeft: 'auto', marginRight: 0, marginBottom: '1em' }}
          onClick={() => { window.location.href = `/#/sample/create/${props.id}`; }}
        >
          {translate('resources.routes.sampleset.add')}
        </Button>
      </div>

      <div style={{ height: 500, width: '100%', marginBottom: '1em' }}>
        <DataGrid
          disableSelectionOnClick
          onCellEditCommit={applyChanges}
          rows={rows}
          pageSize={10}
          loading={loading || fetchLoading}
          style={{ margin: '1em' }}
          columns={columns}
          components={{
            Toolbar: GridToolbar,
          }}
        />
      </div>
      <Prompt
        when={highlight}
        message="PLACEHOLDER: are you sure to leave the page? unsaved changes"
      />

    </>
  );
};

export default SampleTable;
