import {useAuth0} from '@auth0/auth0-react';
import {Loader} from './components/common/Loader';
import {AuthenticationGuard} from './components/authentication-guard/AuthenticationGuard';
import {Route, Routes} from 'react-router-dom';
import {FullWidthLayout} from './components/page-layout/PageFullLayout';
import {HomePage} from './pages/HomePage';
import {FilesPage} from './pages/FilesPage';
import {TermsPage} from './pages/TermsPage';
import {PrivacyPage} from './pages/PrivacyPage';
import {CallbackPage} from './pages/CallbackPage';
import {NotFoundPage} from './pages/NotFoundPage';
import {FunctionEditorPage} from "./pages/FunctionEditorPage.jsx";
import {FunctionsListPage} from "./pages/FunctionsListPage.jsx";
import {FunctionDetailsPage} from "./pages/FunctionDetailsPage.jsx";

export default function App() {
    const {isLoading} = useAuth0();

    // Show a loading spinner while Auth0 finishes initialization
    if (isLoading) {
        return (
            <div className="page-layout">
                <Loader/>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<FullWidthLayout><HomePage/></FullWidthLayout>}/>
            <Route
                path="/files"
                element={
                    <AuthenticationGuard>
                        <FullWidthLayout><FilesPage/></FullWidthLayout>
                    </AuthenticationGuard>
                }
            />

            <Route
                path="/editor"
                element={
                    <AuthenticationGuard>
                        <FullWidthLayout><FunctionEditorPage/></FullWidthLayout>
                    </AuthenticationGuard>
                }
            />
            <Route
                path="/functions"
                element={
                    <AuthenticationGuard>
                        <FullWidthLayout><FunctionsListPage/></FullWidthLayout>
                    </AuthenticationGuard>
                }
            />
            <Route
                path="/functions/:id"
                element={
                    <AuthenticationGuard>
                        <FullWidthLayout><FunctionDetailsPage/></FullWidthLayout>
                    </AuthenticationGuard>
                }
            />
            <Route path="/terms" element={<FullWidthLayout><TermsPage/></FullWidthLayout>}/>
            <Route path="/privacy" element={<FullWidthLayout><PrivacyPage/></FullWidthLayout>}/>

            <Route path="/callback" element={<CallbackPage/>}/>
            <Route path="*" element={<FullWidthLayout><NotFoundPage/></FullWidthLayout>}/>
        </Routes>
    );
}
