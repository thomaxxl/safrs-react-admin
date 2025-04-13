import { AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import { ISection, IPageData } from './interfaces.tsx';
import SettingsIcon from '@mui/icons-material/Settings';


const StyledAppBar = styled(AppBar)({
    position: 'fixed',
    backgroundColor: '#222',
    height: '4.5em',
});

const StyledToolbar = styled(Toolbar)({
    display: 'flex',
    justifyContent: 'space-between',
});

const Settings = () => {
    const handleClick = () => {
        console.log('Settings clicked');
        sessionStorage.removeItem('raSpa');
        window.location.href = window.location.href.split('#')[0];
    };
    return <IconButton edge="end" color="inherit" onClick={handleClick}>
            <SettingsIcon sx={{color: "#888"}}/>
        </IconButton>
}

const Header = ({ title, SectionList }: { title: string; SectionList: ISection[] | undefined }) => {
    const SRAappBarId = 'SRAheader';

    const scrollTo = (section: ISection) => {
        const element = document.getElementById(section.id);
        if (!element) return;
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const appBarHeight = document.getElementById(SRAappBarId)?.offsetHeight || 0;
        // window.scrollBy({
        //     top: appBarHeight, // appBarHeight, // Move up by 100px
        //     behavior: 'smooth'
        // });
    };

    if (!SectionList) return null;

    const sections = SectionList.filter((section: ISection) =>  section.name !== 'Hero')
        .sort((a: ISection, b: ISection) => a.order - b.order)
        .map((section: ISection) => (
            <Button key={section.id} color="inherit" onClick={() => scrollTo(section)}>
                {section.label || section.name}
            </Button>
        ));

    return (
        <StyledAppBar id={SRAappBarId}>
            <StyledToolbar>
                <Typography variant="h6">{title}</Typography>
                <Box sx={{ flexGrow: 1 }} />
                {sections}
                <Settings />
            </StyledToolbar>
        </StyledAppBar>
    );
};

export default Header;