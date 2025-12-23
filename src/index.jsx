import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import { rtl_cache, main_theme } from './theme.js';
import { UserProvider } from "./context/UserContext";
import '@fontsource/assistant/400.css'; // normal
import '@fontsource/assistant/700.css'; // bold
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <CacheProvider value={rtl_cache}>
        <ThemeProvider theme={main_theme}>
            <UserProvider>
                <App />
            </UserProvider>
        </ThemeProvider>
    </CacheProvider>
);
