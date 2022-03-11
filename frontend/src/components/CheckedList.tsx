import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
// own libs

import * as Types from 'types';

interface MenuListI{
    data: Types.select[]
    title: string
    handleChange: (data: Types.select) => void
    close?:boolean

}

const MenuList : React.FC<MenuListI> = ({
  data, handleChange, title, close = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selected = (e, obj) => {
    e.preventDefault();
    handleChange(obj);
    if (close) {
      handleClose();
    }
  };

  return (
    <div>
      <Button
        aria-controls="customized-menu"
        aria-haspopup="true"
        variant="outlined"
        color="primary"
        onClick={handleClick}
      >
        {title}
      </Button>
      <Menu
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '20ch',
          },
        }}
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {data.map((obj) => (
          <MenuItem key={obj.id} onClick={(e) => selected(e, obj)}>
            <ListItemIcon>
              {obj.selected ? <CheckIcon /> : <ClearIcon />}
            </ListItemIcon>
            <ListItemText primary={obj.key} />
          </MenuItem>

        ))}

      </Menu>
    </div>
  );
};
export default MenuList;
