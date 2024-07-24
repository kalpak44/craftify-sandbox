import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BrowserRouter} from "react-router-dom";
import {Auth0ProviderWithNavigate} from "./Auth0ProviderWithNavigate.jsx";

const onRedirectCallback = (appState) => {
    console.log(appState?.returnTo || window.location.pathname);
}


ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Auth0ProviderWithNavigate>
                <App />
            </Auth0ProviderWithNavigate>
        </BrowserRouter>
    </React.StrictMode>
)
