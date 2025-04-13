import React, { useEffect, useState } from 'react';
import { useDataProvider } from 'react-admin';
import { Container, List, ListItem, Typography } from '@mui/material';
//import App from './landing/MuiApp';
import Builder from './components/builder/Builder.tsx';
import App from './landing2/App.tsx';

export const RaSpa = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dataProvider = useDataProvider();
  if(document.location.origin == 'https://g.apifabric.ai'){
    localStorage.removeItem('raconfigs');
  }

  if(document.location.hash.includes('builder=true')){
    return (
        <Builder />
    );
  }

  return <App  />;
};

