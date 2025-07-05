import {useAuth0} from "@auth0/auth0-react";
import {PageLoader} from "./components/page-loader/PageLoader.jsx";
import {AuthenticationGuard} from "./components/authentication-guard/AuthenticationGuard.jsx";
import {Route, Routes} from "react-router-dom";
import {NotFoundPage} from "./pages/NotFoundPage.jsx";
import {CallbackPage} from "./pages/CallbackPage.jsx";
import {HomePage} from "./pages/HomePage.jsx";
import {FullWidthLayout} from "./components/page-layout/PageFullLayout.jsx";
import {PrivacyPage} from "./pages/PrivacyPage.jsx";
import {TermsPage} from "./pages/TermsPage.jsx";
import {FilesPage} from "./pages/FilesPage.jsx";
import {FlowsPage} from "./pages/FlowsPage.jsx";
import {DataPage} from "./pages/DataPage.jsx";


export default function App() {
    const {isLoading} = useAuth0();

    // Show a loading spinner while authentication state is being determined
    if (isLoading) {
        return (
            <div className="page-layout">
                <PageLoader/>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<FullWidthLayout><HomePage/></FullWidthLayout>}/>
            <Route
                path="/files"
                element={<AuthenticationGuard component={() => <FullWidthLayout><FilesPage/></FullWidthLayout>}/>}
            />
            <Route
                path="/flows"
                element={<AuthenticationGuard component={() => <FullWidthLayout><FlowsPage/></FullWidthLayout>}/>}
            />
            <Route
                path="/data"
                element={<AuthenticationGuard component={() => <FullWidthLayout><DataPage/></FullWidthLayout>}/>}
            />

            <Route path="/terms" element={<FullWidthLayout><TermsPage /></FullWidthLayout>} />
            <Route path="/privacy" element={<FullWidthLayout><PrivacyPage /></FullWidthLayout>} />

            <Route path="/callback" element={<FullWidthLayout><CallbackPage/></FullWidthLayout>}/>
            <Route path="*" element={<FullWidthLayout><NotFoundPage/></FullWidthLayout>}/>
        </Routes>
    );
}
