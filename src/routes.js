import { Redirect, Route, Switch } from 'react-router-dom';
import RepoCard from './components/RepoCard';
import RepoList from './components/RepoList';

const Routes = ({ match }) => (
  <Switch>
    <Route path={`${match.url}/fetchdata`} component={RepoList} />
    <Route path={`${match.url}/detail`} component={RepoCard} />
  </Switch>
);
export default Routes;