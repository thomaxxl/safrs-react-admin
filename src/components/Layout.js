import { Layout as RALayout } from 'react-admin';
import { Menu } from './Menu';

export const Layout = (props) => <RALayout {...props} menu={Menu} />;