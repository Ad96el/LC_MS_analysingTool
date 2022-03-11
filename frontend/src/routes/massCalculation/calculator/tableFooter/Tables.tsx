import * as React from 'react';
import { DataGrid, GridColDef } from '@material-ui/data-grid';

// own libs
import { massColoums, GridToolbar } from 'components';
import * as Types from '../types';

const DataTable : React.FC<Types.DataTableI> = (props) => {
  const { rows } = props;
  const columns: GridColDef[] = massColoums;

  return (
    <>
      <div style={{ height: 400 }}>
        <DataGrid
          disableSelectionOnClick
          headerHeight={40}
          rowHeight={30}
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 15, 20]}
          components={{
            Toolbar: GridToolbar,
          }}
        />
      </div>
    </>

  );
};

export default DataTable;
