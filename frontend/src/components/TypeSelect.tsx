import React from 'react';
import { Select, MenuItem } from '@material-ui/core';

interface TypeSelect{
    editable: boolean,
    value: string,
    row: any,
    handleSelect: (event : React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>, row: any) => void

}

const TypeSelect : React.FC<TypeSelect> = ({
  value, row, handleSelect, editable,
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
    <MenuItem key="closest" value="closest">closest </MenuItem>
    <MenuItem key="heighest" value="highest">highest </MenuItem>
  </Select>
);

export default TypeSelect;
