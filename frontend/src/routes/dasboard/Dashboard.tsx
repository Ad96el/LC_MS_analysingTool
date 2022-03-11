/* eslint-disable camelcase */
import * as React from 'react';
import { Grid } from '@material-ui/core';
import { useTranslate } from 'react-admin';
import PersonIcon from '@material-ui/icons/Person';
// own libs
import dataProvider from 'dataProvider';
import { ProjectIcon } from 'routes/intactMass/project';
import SampleSet from 'routes/intactMass/sampleset';
import Sample from 'routes/intactMass/samples';
import Welcome from './Welcome';
import CardWithIcon from './CardWithIcon';

const SampleSetIcon = SampleSet.icon;
const SampleIcon = Sample.icon;

const Dashboard : React.FC = () => {
  const translate = useTranslate();
  const [statistics, setStatistics] = React.useState<any>({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    dataProvider.getStatistics().then((data) => {
      setStatistics(data);
      setLoading(false);
    });
  }, []);

  const {
    sample_count,
    project_count,
    sampleset_cout,
    samples_no_sampleset,
    new_project,
    users_count,
  } = statistics;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Welcome />
      </Grid>
      <Grid item xs={6}>
        <CardWithIcon
          to="/project"
          title={translate('resources.routes.dashboard.project')}
          subtitle={project_count}
          icon={ProjectIcon}
          loading={loading}
        />
      </Grid>
      <Grid item xs={6}>
        <CardWithIcon
          to="/sampleset"
          title={translate('resources.routes.dashboard.sampleset')}
          subtitle={sampleset_cout}
          icon={SampleSetIcon}
          loading={loading}
        />

      </Grid>
      <Grid item xs={3}>
        <CardWithIcon
          to="/sample"
          title={translate('resources.routes.dashboard.sample')}
          subtitle={sample_count}
          icon={SampleIcon}
          loading={loading}
        />
      </Grid>
      <Grid item xs={3}>
        <CardWithIcon
          to="/sample"
          title={translate('resources.routes.dashboard.sampleno')}
          subtitle={samples_no_sampleset}
          icon={SampleIcon}
          loading={loading}
        />
      </Grid>
      <Grid item xs={3}>

        <CardWithIcon
          to={`/project/${new_project}/show`}
          title={translate('resources.routes.dashboard.projectnew')}
          icon={ProjectIcon}
          loading={loading}
          subtitle="Here"
        />

      </Grid>
      <Grid item xs={3}>

        <CardWithIcon
          to="/"
          title={translate('resources.routes.dashboard.users')}
          subtitle={users_count}
          icon={PersonIcon}
          loading={loading}
        />
      </Grid>
    </Grid>
  );
};

// );

export default Dashboard;
