import { useSelector } from 'react-redux';
import { DashboardMenuItem, Menu as RAMenu, MenuItemLink, getResources } from 'react-admin';
import DefaultIcon from '@material-ui/icons/ViewList';

/*
export const MenuA = (props) => (
    <RAMenu {...props}>
        <DashboardMenuItem />
        <MenuItemLink to="/wxxx" primaryText="Posts" leftIcon={<BookIcon />}/>
        <MenuItemLink to="/comments" primaryText="Comments" leftIcon={<ChatBubbleIcon />}/>
        <MenuItemLink to="/users" primaryText="Users" leftIcon={<PeopleIcon />}/>
        <MenuItemLink to="/custom-route" primaryText="Miscellaneous" leftIcon={<LabelIcon />}/>
    </RAMenu>
);
*/

const onMenuClick = (evt) => {
    //console.log(`Menu Click`, evt);
}

export const Menu = (props) => {
    const resources = useSelector(getResources);
    const open = true;
    return (
        <RAMenu {...props}>
            {resources.map(resource => (
                <MenuItemLink
                    key={resource.name}
                    to={`/${resource.name}`}
                    primaryText={
                        (resource.options && resource.options.label) ||
                        resource.name
                    }
                    leftIcon={
                        resource.icon ? <resource.icon /> : <DefaultIcon />
                    }
                    onClick={onMenuClick}
                    sidebarIsOpen={open}
                />
            ))}
            <DashboardMenuItem to={'/Configuration'}/>
        </RAMenu>
    );
};