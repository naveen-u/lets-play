import { createMuiTheme } from '@material-ui/core';
import { red, blue, lightBlue, yellow, green } from '@material-ui/core/colors';
const white = '#FFF';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    default: {
      light: 'rgba(41, 150, 243, .1)',
      main: 'rgba(0, 40, 73, .9)',
      dark: 'rgb(0, 40, 73)',
      logoBg: 'rgb(51, 51, 51)',
      border: 'rgba(0, 40, 73, .1)',
      contrastText: white
    },
    primary: {
      light: lightBlue[300],
      main: lightBlue[500],
      dark: lightBlue[700],
      contrastText: white
    },
    success: {
      light: green[300],
      main: green[500],
      dark: green[700],
      contrastText: white
    },
    info: {
      light: blue[300],
      main: blue[500],
      dark: blue[700],
      contrastText: white
    },
    warning: {
      light: yellow[300],
      main: yellow[500],
      dark: yellow[700],
      contrastText: white
    },
    danger: {
      light: red[300],
      main: red[500],
      dark: red[700],
      contrastText: white
    },
    background: {
      paper: 'rgb(45, 45, 45)',
      default: 'rgb(26, 26, 26)',
      dark: 'rgb(26, 26, 26)'
    },
  },
  // shadows: ["none"],
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 16,
      }, 
    }, 
    MuiCssBaseline: {
      '@global': {
        '*::-webkit-scrollbar': {
          width: '0.4em'
        },
        '*::-webkit-scrollbar-track': {
          '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,.5)',
          outline: '2px solid slategrey'
        }
      }
    }
  }, 
  typography: {
    fontFamily: "Open Sans",
  }
})

export default darkTheme;