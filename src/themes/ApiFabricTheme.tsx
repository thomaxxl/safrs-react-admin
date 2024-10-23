import { createTheme, PaletteOptions, Theme } from '@mui/material';
import { RaThemeOptions } from 'react-admin';
import { deepmerge } from '@mui/utils';
import { green, grey, blue, purple, teal } from '@mui/material/colors';


const defaultThemeInvariants = {
    typography: {
        // body1: {
        //     fontSize: '1rem',
        //   },
        // body2: {
        //     fontSize: '0.875rem',
        //   },
        h6: {
            Weight: 400,
        },
    },
    sidebar: {
        width: 240,
        closedWidth: 50,
    },
    components: {
        MuiAutocomplete: {
            defaultProps: {
                fullWidth: true,
            },
            variants: [
                {
                    props: {},
                    style: ({ theme }) => ({
                        [theme.breakpoints.down('sm')]: { width: '100%' },
                    }),
                },
            ],
        },
        MuiTextField: {
            defaultProps: {
                variant: 'filled' as const,
                margin: 'dense' as const,
                size: 'small' as const,
                fullWidth: true,
            },
            variants: [
                {
                    props: {},
                    style: ({ theme }) => ({
                        [theme.breakpoints.down('sm')]: { width: '100%' },
                    }),
                },
            ],
        },
        MuiFormControl: {
            defaultProps: {
                variant: 'filled' as const,
                margin: 'dense' as const,
                size: 'small' as const,
                fullWidth: true,
            },
        },
        RaSimpleFormIterator: {
            defaultProps: {
                fullWidth: true,
            },
        },
        RaTranslatableInputs: {
            defaultProps: {
                fullWidth: true,
            },
        },
    },
};

export const defaultLightTheme: RaThemeOptions = deepmerge(
    defaultThemeInvariants,
    {
        palette: {
            background: {
                default: '#fafafb',
            },
            secondary: {
                light: '#6ec6ff',
                main: '#2196f3',
                dark: '#0069c0',
                contrastText: '#fff',
            },
        },
        components: {
            MuiFilledInput: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        '&$disabled': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                    },
                },
            },
        },
    }
);

export const defaultDarkTheme: RaThemeOptions = deepmerge(
    defaultThemeInvariants,
    {
        palette: {
            mode: 'dark',
            primary: {
                main: '#90caf9',
            },
            background: {
                default: '#313131',
            },
        },
    }
);


const apiFabColor = '#5d5d5d';

const theme = createTheme(defaultLightTheme, {
    palette: {
        primary: {
          main: apiFabColor,
        },
        background: {
            paper: '#fff', // Custom paper color
        },      
        // secondary: {
        //   main: 'red',
        // },
      },
    components: {
        MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: '#ffffff', // Custom background color
              },
            },
          },
    MuiIconButton: {
        styleOverrides: {
        root: {
            backgroundColor: 'transparent', // Custom background color
            color: apiFabColor, // Custom text color
        }}},
    MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgb(47,47,47)', // Custom background color
          },
        },
      },
    },
  });  

export const ApiFabricLightTheme = theme;
