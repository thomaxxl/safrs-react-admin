import * as React from "react";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title } from 'react-admin';
import { useNotify, useRedirect } from 'react-admin';

const Home = () => {
    const redirect = useRedirect();

    redirect("/Configuration")
    return <Card>
        <Title title="Home" />
        <CardContent>
            Hello World
        </CardContent>
    </Card>
}

export default Home;
