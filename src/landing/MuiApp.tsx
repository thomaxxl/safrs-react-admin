import React, { useEffect, useState } from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useDataProvider, Loading } from 'react-admin';
import { ISection, IPageData } from './interfaces.tsx';
import { Section } from './Section.tsx';
import { getConf } from '../Config.ts';
import Header from './Header.tsx';
import Builder from './sections/Builder.tsx';

const Page: React.FC<IPageData> = ({ id, name, SectionList, ...props }) => {
    
    document.title = name;

    return (
        <>
            <Header title={name} SectionList={SectionList} />
            <Container id={id} sx={{margin: "0px", paddingTop: "4em"}} maxWidth={false}>
                {SectionList?.sort((a: ISection, b: ISection) => a.order - b.order).map((section: ISection) => (
                    <Section key={section.id} section={section} />
                ))}
            </Container>
        </>
    );
};

const PageList = ({ pages, setSelectedPage }: { pages: IPageData[], setSelectedPage: any }) => {
    
    return pages.map((page: IPageData) => (
                <div key={page.id}>
                    <Button onClick={() => setSelectedPage(page)}>{page.name}</Button>
                </div>
            ))
};


const SpApp = () => {
    const [pages, setPages] = useState<IPageData[]>([]);
    const [selectedPage, setSelectedPage] = useState<IPageData | null>(null);
    const [loading, setLoading] = useState(true);
    const dataProvider = useDataProvider();
    const conf = getConf();
    console.log('start raSpa', conf);

    useEffect(() => {
        if(!conf.resources?.SPAPage){
            sessionStorage.removeItem('raSpa');
            document.location.href = document.location.href.split('#')[0];
            return;
        }
        console.log('start dataprovider');
        dataProvider.getList('SPAPage', {
            pagination: { page: 1, perPage: 100 },
            meta: { include: ["SectionList"] }
        })
        .then(response => {
            setPages(response.data);
            if(response.data.length === 1){
                setSelectedPage(response.data[0]);
            }
            console.log('pages', response.data);
        })
        .catch(error => {
            console.error("Error fetching page:", error);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <Loading />;
    }

    if (pages.length === 0) {
        sessionStorage.removeItem('raSpa');
        return <Typography>No page data found</Typography>;
    }

    if(selectedPage){
        return <Page {...selectedPage} />;
    }
    
    return <PageList pages={pages} setSelectedPage={setSelectedPage} />;
    
};


const App = () => {

    if(document.location.hash.includes('builder=true')){
        return (
            <Builder />
        );
    }
    return (
        <SpApp />
    );
}

export default App;