import * as React from 'react';
import { useState, useEffect } from "react";
import { useGetList } from 'react-admin';

export const Spa = () => {
    const { data, total, isLoading, error } = useGetList(
        'Section'
    );

    if (isLoading || !data) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h1>Sections</h1>
            <ul>
                {data.map(section => (
                    <li key={section.id}>{section.name}</li>
                ))}
            </ul>
            <p>Total: {total}</p>
        </div>
    );
}