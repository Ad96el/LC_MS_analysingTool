import * as React from 'react';
import { useSelector } from 'react-redux';
import SettingsIcon from '@material-ui/icons/Settings';
import {
  useMediaQuery, Theme, Box, makeStyles,
} from '@material-ui/core';
import {
  useTranslate,
  DashboardMenuItem,
  MenuItemLink,
  MenuProps,
  usePermissions,
} from 'react-admin';
import classnames from 'classnames';

// icons and typings + own libs
// intact
import SampleSet from 'routes/intactMass/sampleset';
import Method from 'routes/intactMass/method';
import MethodSet from 'routes/intactMass/methodset';
import FitnessCenterIcon from '@material-ui/icons/FitnessCenter';
import Sample from 'routes/intactMass/samples';
import { ProjectIcon } from 'routes/intactMass/project';
import Result from 'routes/intactMass/result';
import ResultSet from 'routes/intactMass/result_set';

// masscalculator
import CalculateIcon from '@mui/icons-material/Calculate';
import Modification from 'routes/massCalculation/modification';
import ModificationSet from 'routes/massCalculation/modificationSet';
// other apps
import Users from 'routes/userManagement';
import * as Types from 'types';
// import Ambr from 'routes/ambr';
import { FunctionsIcon } from 'routes/massCalculation/calculator';
import SubMenu from './SubMenu';

type MenuName = 'intactMass' | 'massCalculator';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  open: {
    width: 240,
  },
  closed: {
    width: 55,
  },
}));

const Menu: React.FC<MenuProps> = ({ dense = false }) => {
  // logic
  const translate = useTranslate();
  const { permissions } = usePermissions();

  const [state, setState] = React.useState({
    intactMass: false,
    massCalculator: false,
  });

  const handleToggle = (menu: MenuName) => {
    setState((s) => ({ ...s, [menu]: !s[menu] }));
  };

  // design
  const isXSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'));
  const open = useSelector((s: Types.AppState) => s.admin.ui.sidebarOpen);
  useSelector((s: Types.AppState) => s.data.theme);
  const classes = useStyles();

  // icons
  const SampleSetIcon = SampleSet.icon;
  const MethodIcon = Method.icon;
  const MethodSetIcon = MethodSet.icon;
  const SampleIcon = Sample.icon;
  const UserIcon = Users.icon;
  const ResultIcon = Result.icon;
  const ResultSetIcon = ResultSet.icon;
  const ModificationIcon = Modification.icon;
  const ModificationSetIcon = ModificationSet.icon;
  // const { IconFile } = Ambr;

  const { intactMass, massCalculator } = state;
  return (
    <div
      className={classnames(classes.root, {
        [classes.open]: open,
        [classes.closed]: !open,
      })}
    >
      <Box mt={1}>
        {' '}
        <DashboardMenuItem sidebarIsOpen={open} />

        {permissions >= 2 ? (
          <MenuItemLink
            to="/user"
            primaryText={translate('resources.routes.users.name', {
              smart_count: 2,
            })}
            leftIcon={<UserIcon />}
            sidebarIsOpen={open}
            dense={dense}
          />
        ) : <div /> }
        {/* <MenuItemLink
          to="/ambr"
          primaryText={translate('resources.routes.ambr.name')}
          leftIcon={<IconFile />}
          sidebarIsOpen={open}
          dense={dense}
        /> */}

        <SubMenu
          handleToggle={() => handleToggle('massCalculator')}
          isOpen={massCalculator}
          name="resources.routes.masscalculator"
          dense={dense}
          sidebarIsOpen={open}
          icon={<FunctionsIcon />}
        >
          <MenuItemLink
            to="/masscalculation"
            primaryText={translate('resources.routes.masscalculation.calculator', {
              smart_count: 2,
            })}
            leftIcon={<CalculateIcon />}
            sidebarIsOpen={open}
            dense={dense}
          />

          <MenuItemLink
            to="/modification"
            primaryText={translate('resources.routes.modification.modification', {
              smart_count: 2,
            })}
            leftIcon={<ModificationIcon />}
            sidebarIsOpen={open}
            dense={dense}
          />

          <MenuItemLink
            to="/modificationset"
            primaryText={translate('resources.routes.modificationset.modificationset', {
              smart_count: 2,
            })}
            leftIcon={<ModificationSetIcon />}
            sidebarIsOpen={open}
            dense={dense}
          />

        </SubMenu>

        <SubMenu
          handleToggle={() => handleToggle('intactMass')}
          isOpen={intactMass}
          name="resources.routes.intactmass"
          dense={dense}
          sidebarIsOpen={open}
          icon={<FitnessCenterIcon />}
        >

          <MenuItemLink
            to="/project"
            primaryText={translate('resources.routes.project.name', {
              smart_count: 2,
            })}
            leftIcon={<ProjectIcon />}
            sidebarIsOpen={open}
            dense={dense}
          />

          <MenuItemLink
            to="/sampleset"
            primaryText={translate('resources.routes.sampleset.name', {
              smart_count: 2,
            })}
            leftIcon={<SampleSetIcon />}
            sidebarIsOpen={open}
            dense={dense}
          />
          <MenuItemLink
            to="/sample"
            primaryText={translate('resources.routes.sample.name', {
              smart_count: 2,
            })}
            leftIcon={<SampleIcon />}
            sidebarIsOpen={open}
            dense={dense}
          />

          <MenuItemLink
            to="/method"
            primaryText={translate('resources.routes.method.name', {
              smart_count: 2,
            })}
            leftIcon={<MethodIcon />}
            sidebarIsOpen={open}
            dense={dense}
          />
          <MenuItemLink
            to="/methodset"
            primaryText={translate('resources.routes.methodset.name', {
              smart_count: 2,
            })}
            leftIcon={<MethodSetIcon />}
            sidebarIsOpen={open}
            dense={dense}
          />

          <MenuItemLink
            to="/result"
            primaryText={translate('resources.routes.result.name', {
              smart_count: 2,
            })}
            leftIcon={<ResultIcon />}
            sidebarIsOpen={open}
            dense={dense}
          />
          <MenuItemLink
            to="/resultset"
            primaryText={translate('resources.routes.resultset.name', {
              smart_count: 2,
            })}
            leftIcon={<ResultSetIcon />}
            sidebarIsOpen={open}
            dense={dense}
          />
        </SubMenu>

        {isXSmall && (
        <MenuItemLink
          to="/configuration"
          primaryText={translate('pos.configuration')}
          leftIcon={<SettingsIcon />}
          sidebarIsOpen={open}
          dense={dense}
        />
        )}
      </Box>
    </div>
  );
};

export default Menu;
