import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import React from 'react';

interface TabPanelProps {
    children: React.ReactNode;
    index: number;
    value: number;
  }

const TabPanel : React.FC< TabPanelProps> = (props) => {
  const {
    children, value, index, ...other
  } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
      <Box p={3}>
        <Typography>{children}</Typography>
      </Box>
      )}
    </div>
  );
};

export default TabPanel;
