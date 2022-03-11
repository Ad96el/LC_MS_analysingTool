import { NavigationHeader, VersionBar } from 'components';
import * as React from 'react';
import {
  Show, TextField, ShowProps, useTranslate,
  FunctionField, ReferenceField, DateField, TabbedShowLayout, Tab, useDataProvider, GetOneParams,
} from 'react-admin';
import * as Types from 'types';
import Link from '@material-ui/core/Link';
import { useSelector } from 'react-redux';
import PeakTabs from './tabs/PeakTabs';
import DeconvolutionTab from './tabs/DeconvolutionTab';

const ResultShow : React.FC<ShowProps> = (props) => {
  const translate = useTranslate();
  const ReactAdmindata = useSelector((state : Types.AppState) => state.admin.resources.result.data);
  const [options, setOptions] = React.useState<string[]>([]);
  const dataProvider = useDataProvider();

  React.useEffect(() => {
    if (props.id && Object.keys(ReactAdmindata).length > 0 && ReactAdmindata[props.id].head) {
      const param : GetOneParams = {
        id: ReactAdmindata[props.id].rsid,
      };
      dataProvider.getOne('resultset', param).then((response) => {
        const { data } = response;
        setOptions(data.results);
      });
    } else {
      setOptions([]);
    }
  }, [ReactAdmindata]);

  const { id } = props;
  return (
    <>
      <NavigationHeader options={options} currentId={id} show />
      <Show {...props} aside={<VersionBar kind="show" {...props} />}>
        <TabbedShowLayout>

          <Tab label={translate('resources.routes.result.meta')}>
            <FunctionField
              label={translate('resources.routes.result.user')}
              render={(record) => `${record.user ? record.user.email : ''}`}
            />
            <TextField source="name" label={translate('resources.routes.result.name')} />
            <DateField source="created" label={translate('resources.routes.result.created')} />
            <TextField source="version" label={translate('resources.routes.result.version')} />
            <ReferenceField label={translate('resources.routes.result.resultset')} reference="resultset" source="rsid" link="show">
              <TextField source="name" />
            </ReferenceField>
            <FunctionField
              label={translate('resources.routes.sample.methodset')}
              render={(record) => (
                record.methodset ? (
                  <Link underline="none" href={`/#/methodset/${record.methodset.id}/show`}>
                    {record.methodset.name}
                  </Link>
                ) : 'None'
              )}
            />
            <ReferenceField label={translate('resources.routes.result.sample')} reference="sample" source="sid" link="show">
              <TextField source="name" />
            </ReferenceField>
          </Tab>
          <Tab label="Peaks">
            <PeakTabs source="tics" />
          </Tab>
          <Tab label="Deconvolution">
            <DeconvolutionTab source="tics" />

          </Tab>
        </TabbedShowLayout>

      </Show>

    </>
  );
};

export default ResultShow;
