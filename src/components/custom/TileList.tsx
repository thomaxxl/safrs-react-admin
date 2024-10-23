import React from 'react';
import { List, SimpleList, WithListContext  } from 'react-admin';
import { Card, CardContent, Typography, Stack } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
    tile: {
        margin: '1rem',
        width: 'calc(20% - 2rem)', // 25% to fit 4 columns, minus margin adjustment
        display: 'inline-block',
        verticalAlign: 'top',
    },
    container: {
        textAlign: 'center', // Center the tiles
    },
});

const Tile = ({ record }) => {
    const classes = useStyles();
    return (
        <Card className={classes.tile}>
            <CardContent>
                <Typography variant="h6">{record.id}</Typography>
                <Typography variant="body2">{record.username}</Typography>
                
            </CardContent>
        </Card>
    );
};


export const TileList = (props) => (
    <List {...props} sx={{width:"40em"}}>
        {/* <SimpleList primaryText={record => <Tile record={record} />} /> */}
        <WithListContext render={({ data }) => (
            <Stack spacing={2} sx={{ padding: 2 }}>
                {data?.map(user => (
                    <Typography key={user.id}>
                        <i>{user.id}</i>, by {user.username} 
                    </Typography>
                ))}
            </Stack>
        )} />
    </List>
);



// export const UserList = (props) => (
//     <List {...props}>
//         <Datagrid rowClick="edit">
//             <TextField source="id" />
//             <TextField source="username" />
            
            
//         </Datagrid>
//     </List>
// );

