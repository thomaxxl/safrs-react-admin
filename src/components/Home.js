import * as React from "react";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title } from 'react-admin';

const Home = () => (
    <Card>
        <Title title="Home" />
        <CardContent>
            Hello World
        </CardContent>
    </Card>
);

export default Home;
