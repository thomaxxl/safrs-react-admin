import React, { useEffect, useState } from 'react';
import { Box, Container, Toolbar, Typography, TextField, Button } from '@mui/material';
import { styled } from '@mui/system';
import { useConf } from '../Config.ts';
import { useDataProvider } from 'react-admin';
import Header from './Header.tsx'; // Import the Header component
import {ISection, IPageData} from './interfaces.tsx';
import ReactMarkdown from 'react-markdown'
import { TestSection } from './sections/TestSection.tsx';

interface StyledBoxProps {
    section: ISection;
}

const StyledBox = styled(Box)<StyledBoxProps>(({ theme, section }) => ({
    minHeight: '80vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'black',
    textAlign: 'left',
    backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.1)), url(${section.background})`,
    border: '0px solid blue',
    ...section.style || {},
}));

const SectionBox = styled(Box)(({ theme }) => ({
    my: theme.spacing(4),
    minHeight: '80vh',
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
    width: '100%',
    background: 'linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.1))', // Adjust the gradient colors as needed
    color: 'black',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    display: 'inline-block'
  }));

  
const SimpleSection = ({section}: {section: ISection}) => {
    return <SectionBox>
                <Typography variant="h4">{section.title}</Typography>
                <Typography paragraph>{section.paragraph}</Typography>
                <Typography component="div">
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                </Typography>
            </SectionBox>
}

const FullSection = ({section}: {section: ISection}) => {
    return <StyledBox section={section}>
                <Typography variant="h1">{section.title}</Typography>
                <Typography paragraph>{section.paragraph}</Typography>
                <Typography component="div">
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                </Typography>
            </StyledBox>
}

const MarkDownSection = ({section}: {section: ISection}) => {
    return <StyledBox section={section}>
                <Typography variant="h1">{section.title}</Typography>
                <Typography component="div">
                    <ReactMarkdown>{section.paragraph}</ReactMarkdown>
                </Typography>
            </StyledBox>
}

const HeroSection = ({section}: {section: ISection}) => {

    const handleClick = () => {
        sessionStorage.removeItem('raSpa');
        window.location.href = window.location.href.split('#')[0];
    };
    const conf = useConf();
    let background = section.background;
    
    return <StyledBox section={section}>
                <GradientTypography variant="h1" sx={{fontSize: "4rem"}}>
                    {section.title}
                    <Typography paragraph>{section.subtitle}
                        <Button variant="contained" color="primary" href="#contact" onClick={handleClick} sx={{width: "92%", padding:"8px", marginTop:"1em", marginBlockEnd: "0.67em"}}>
                            Backend Admin
                        </Button>
                    </Typography>
                </GradientTypography>
                <img src={background} onClick={handleClick}/>
            </StyledBox>
}

const Image = styled('img')(({ theme }) => ({
    width: '100%',
    height: 'auto',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
}));

const ImageSection = ({ section }: { section: ISection }) => {
    return (
      <SectionBox>
        <Image src={section.image} alt={section.title} />
        <Typography variant="h4" gutterBottom>
          {section.title}
        </Typography>
        <Typography variant="body1">{section.paragraph}</Typography>
      </SectionBox>
    );
  };

const sectionTemplates: { [key: string]: ({ section }: { section: ISection }) => JSX.Element } = {
    'simple': SimpleSection,
    'full': FullSection,
    'hero': HeroSection,
    'markdown': MarkDownSection,
    'image': ImageSection,
    'test': TestSection,
    // Add more section templates here
}

export const Section = ({section}: {section: ISection}) => {

    const SectionComponent = sectionTemplates[section.Type?.toLowerCase()] || SimpleSection;

    return <>
        <div id={section.id} style={{position: "relative", top: "-4.1em", border: "none", display:"block"}} > </div>
        <SectionComponent section={section}/>
        </>
}
