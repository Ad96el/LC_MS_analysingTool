export default {
  apiURL: process.env.REACT_APP_BASEURL ? process.env.REACT_APP_BASEURL : 'http://localhost:5000/api/v1',
  api2URL: process.env.REACT_APP_BASEURL2 ? process.env.REACT_APP_BASEURL2 : 'http://localhost:5000/api/v1',
  apiURLAuth: process.env.REACT_APP_BASEURLAUTH ? process.env.REACT_APP_BASEURLAUTH : 'http://localhost:5000/api/v1/user',
};
