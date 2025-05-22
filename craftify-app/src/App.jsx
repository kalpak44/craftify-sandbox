import React from "react";
import {useAuth0} from "@auth0/auth0-react";
import {PageLoader} from "./components/page-loader/PageLoader.jsx";
import {PageLayout} from "./components/page-layout/PageLayout.jsx";
import {AuthenticationGuard} from "./components/authentication-guard/AuthenticationGuard.jsx";
import {Route, Routes} from "react-router-dom";
import {NotFoundPage} from "./pages/NotFoundPage.jsx";
import {CallbackPage} from "./pages/CallbackPage.jsx";
import {ProfilePage} from "./pages/ProfilePage.jsx";
import {HomePage} from "./pages/HomePage.jsx";
import {NotebooksPage} from "./pages/NotebooksPage.jsx";
import {NotebookDetailPage} from "./pages/NotebookDetailPage.jsx";


export default function App() {
    const {isLoading} = useAuth0();

    if (isLoading) {
        return (
            <div className="page-layout">
                <PageLoader/>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<PageLayout><HomePage/></PageLayout>}/>
            <Route
                path="/profile"
                element={<AuthenticationGuard component={() => <PageLayout><ProfilePage/></PageLayout>}/>}
            />
            <Route
                path="/notebooks"
                element={<AuthenticationGuard component={() => <PageLayout><NotebooksPage/></PageLayout>}/>}
            />
            <Route
                path="/notebooks/:id"
                element={<AuthenticationGuard component={() => <PageLayout><NotebookDetailPage/></PageLayout>}/>}
            />
            <Route path="/callback" element={<PageLayout><CallbackPage/></PageLayout>}/>
            <Route path="*" element={<PageLayout><NotFoundPage/></PageLayout>}/>
        </Routes>
    );
};
