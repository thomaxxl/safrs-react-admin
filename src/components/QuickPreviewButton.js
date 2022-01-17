import React, { useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import { makeStyles } from '@material-ui/core/styles';
import {useConf} from '../Config.js'
import IconImageEye from '@material-ui/icons/RemoveRedEye';
import IconKeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { Button, SimpleShowLayout, TextField, useGetOne } from 'react-admin';


const useStyles = makeStyles({
    field: {
        // These styles will ensure our drawer don't fully cover our
        // application when teaser or title are very long
        '& span': {
            display: 'inline-block',
            maxWidth: '20em'
        }
    }
});

const QuickPreviewButton = ({resource_name, id }) => {
    const [showPanel, setShowPanel] = useState(false);
    const classes = useStyles();
    const { data } = useGetOne(resource_name, id);
    const conf = useConf();

    const handleClick = () => {
        setShowPanel(true);
    };

    const handleCloseClick = () => {
        setShowPanel(false);
    };

    console.log(resource_name, id)

    const attr_show = conf.resources[resource_name].attributes.map((attr) => <TextField source={attr.name} />)
    return (
        <>
            <Button onClick={handleClick} label="ra.action.show">
                <IconImageEye />
            </Button>
            <Drawer anchor="right" open={showPanel} onClose={handleCloseClick}>
                <div>
                    <Button label="Close" onClick={handleCloseClick}>
                        <IconKeyboardArrowRight />
                    </Button>
                </div>
                <SimpleShowLayout
                    record={data}
                    basePath="/"
                    resource={resource_name}
                >
                    {attr_show}
                </SimpleShowLayout>
            </Drawer>
        </>
    );
};

export default QuickPreviewButton;
