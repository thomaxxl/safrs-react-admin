import * as React from 'react';
import { useState, useEffect } from "react";
import { useGetList } from 'react-admin';
import App  from '../landing/MuiApp';

export const Spa = () => {
    const { data, total, isLoading, error } = useGetList(
        'Section'
    );

    if (isLoading || !data) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return <><App sections={data}/></>;
   
}