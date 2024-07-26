import React from "react";
import {useAuth0} from "@auth0/auth0-react";
import {PageLoader} from "./components/page-loader/PageLoader.jsx";
import {Route, Routes} from "react-router-dom";
import {NotFoundPage} from "./pages/NotFoundPage.jsx";
import {CallbackPage} from "./pages/CallbackPage.jsx";
import {HomePage} from "./pages/HomePage.jsx";
import {AuthenticationGuard} from "./components/authentication-guard/AuthenticationGuard.jsx";
import {ProfilePage} from "./pages/ProfilePage.jsx";
import {ProtectedPage} from "./pages/ProductsPage.jsx";
import {ProductEditPage} from "./pages/ProductEditPage.jsx";
import {ProductAddPage} from "./pages/ProductAddPage.jsx";

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
            <Route path="/" element={<HomePage/>}/>
            <Route
                path="/profile"
                element={<AuthenticationGuard component={ProfilePage}/>}
            />
            <Route
                path="/products"
                element={<AuthenticationGuard component={ProtectedPage}/>}
            />
            <Route
                path="/products/:id"
                element={<AuthenticationGuard component={ProductEditPage}/>}
            />
            <Route
                path="/products/add"
                element={<AuthenticationGuard component={ProductAddPage}/>}
            />
            <Route path="/callback" element={<CallbackPage/>}/>
            <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
    );
};
