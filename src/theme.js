import createCache from '@emotion/cache';
import { createTheme } from '@mui/material/styles';
import "@fontsource/assistant/400.css";
import "@fontsource/assistant/700.css";

export const rtl_cache = createCache({
    key: 'mui-rtl',
    prepend: true
});
rtl_cache.compat = true;

export const main_theme = createTheme({
    direction: 'rtl',
    palette: {
        primary: { main: '#fd384f' },
        secondary: { main: '#FFA500' }
    },
    typography: {
        fontFamily: 'Assistant, Arial, sans-serif',
        h5: { fontWeight: 700 }
    }
});
