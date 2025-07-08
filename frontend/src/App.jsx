import {useAuth0} from '@auth0/auth0-react';
import {Loader} from './components/common/Loader';
import {AuthenticationGuard} from './components/authentication-guard/AuthenticationGuard';
import {Route, Routes} from 'react-router-dom';
import {FullWidthLayout} from './components/page-layout/PageFullLayout';
import {HomePage} from './pages/HomePage';
import {FilesPage} from './pages/FilesPage';
import {FlowsPage} from './pages/FlowsPage';
import {SchemasPage} from './pages/SchemasPage.jsx';
import {TermsPage} from './pages/TermsPage';
import {PrivacyPage} from './pages/PrivacyPage';
import {CallbackPage} from './pages/CallbackPage';
import {NotFoundPage} from './pages/NotFoundPage';
import {RecordsPage} from "./pages/RecordsPage.jsx";

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
                path="/flows"
                element={
                    <AuthenticationGuard>
                        <FullWidthLayout><FlowsPage/></FullWidthLayout>
                    </AuthenticationGuard>
                }
            />
            <Route
                path="/schemas"
                element={
                    <AuthenticationGuard>
                        <FullWidthLayout><SchemasPage/></FullWidthLayout>
                    </AuthenticationGuard>
                }
            />
            <Route
                path="/schemas/:id/records"
                element={
                    <AuthenticationGuard>
                        <FullWidthLayout><RecordsPage/></FullWidthLayout>
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
