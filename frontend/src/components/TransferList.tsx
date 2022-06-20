import * as React from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import { TextField } from '@material-ui/core';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

function not(a: readonly selectedI[], b: readonly selectedI[]) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: readonly selectedI[], b: readonly selectedI[]) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

interface selectedI {
  [key: string]: any
  name: string
  id: string
}

interface TransferListI {
  selected: selectedI[],
  options: selectedI[],
  // eslint-disable-next-line react/no-unused-prop-types
  handleChanage: (selected : selectedI[]) => void,
  leftTitle?:string,
  rightTitle?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TransferList : React.FC<TransferListI> = ({
  selected, options, handleChanage, leftTitle = '', rightTitle = '',
}) => {
  const [checked, setChecked] = React.useState<readonly selectedI[]>([]);

  const [left, setLeft] = React.useState<readonly selectedI[]>([]);
  const [right, setRight] = React.useState<readonly selectedI[]>([]);

  React.useEffect(() => {
    setLeft(selected);
    setRight(options);
  }, [selected, options]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: selectedI) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setRight(right.concat(left));
    setLeft([]);
    handleChanage([]);
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
    handleChanage(left.concat(rightChecked));
  };

  const handleAllLeft = () => {
    setLeft(left.concat(right));
    setRight([]);
    handleChanage(right.concat(left));
  };

  const customList = (items: readonly selectedI[], title: string) => {
    const [filter, setFilter] = React.useState<string>('');
    const filteredIteams = filter.trim() !== '' ? items.filter((obj) => obj.name.toLowerCase().includes(filter.trim())) : items;

    return (
      <Card>
        <CardHeader
          sx={{
            px: 2, py: 1, width: 300,
          }}
          title={title}
        />
        <Divider />
        <TextField
          id="input-with-icon-textfield"
          fullWidth
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" style={{ marginLeft: '1em' }}>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
        />
        <List
          dense
          component="div"
          role="list"
          sx={{
            width: '100%', height: 330,
          }}
        >
          {filteredIteams.map((value: selectedI) => {
            const labelId = `transfer-list-item-${value}-label`;

            return (
              <ListItem
                key={value.id}
                sx={{ ml: -1 }}
                button
                onClick={handleToggle(value)}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={checked.indexOf(value) !== -1}
                    color="primary"
                    tabIndex={-1}
                    inputProps={{
                      'aria-labelledby': labelId,
                    }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={`${value.name}`} />
              </ListItem>
            );
          })}
          <ListItem />
        </List>
      </Card>
    );
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item>
        {customList(left, leftTitle)}
      </Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            style={{ marginTop: '5px', marginBottom: '5px' }}
            variant="outlined"
            size="small"
            onClick={handleAllRight}
            disabled={left.length === 0}
            aria-label="move all right"
            color="primary"
          >
            ≫
          </Button>
          <Button
            style={{ marginTop: '5px', marginBottom: '5px' }}
            variant="outlined"
            size="small"
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
            color="primary"
          >
            &gt;
          </Button>
          <Button
            style={{ marginTop: '5px', marginBottom: '5px' }}
            variant="outlined"
            size="small"
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
            color="primary"
          >
            &lt;
          </Button>
          <Button
            style={{ marginTop: '5px', marginBottom: '5px' }}
            variant="outlined"
            size="small"
            onClick={handleAllLeft}
            disabled={right.length === 0}
            aria-label="move all left"
            color="primary"
          >
            ≪
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList(right, rightTitle)}</Grid>
    </Grid>
  );
};

export { TransferList };
export type { selectedI };
