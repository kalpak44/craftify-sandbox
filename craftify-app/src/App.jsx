import React from "react";
import {useAuth0} from "@auth0/auth0-react";
import {PageLoader} from "./components/page-loader/PageLoader.jsx";
import {PageLayout} from "./components/page-layout/PageLayout.jsx";
import {AuthenticationGuard} from "./components/authentication-guard/AuthenticationGuard.jsx";
import {Route, Routes} from "react-router-dom";
import {NotFoundPage} from "./pages/NotFoundPage.jsx";
import {CallbackPage} from "./pages/CallbackPage.jsx";
import {ProfilePage} from "./pages/ProfilePage.jsx";
import {ProductsPage} from "./pages/ProductsPage.jsx";
import {ProductEditPage} from "./pages/ProductEditPage.jsx";
import {ProductAddPage} from "./pages/ProductAddPage.jsx";
import {RecipesPage} from "./pages/RecipesPage.jsx";
import {RecipeAddPage} from "./pages/RecipeAddPage.jsx";
import {RecipeEditPage} from "./pages/RecipeEditPage.jsx";
import {HomePage} from "./pages/HomePage.jsx";


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
                element={<AuthenticationGuard component={<PageLayout><ProfilePage/></PageLayout>}/>}
            />
            <Route
                path="/products"
                element={<AuthenticationGuard component={() => (
                    <PageLayout>
                        <ProductsPage/>
                    </PageLayout>
                )}/>}
            />
            <Route
                path="/products/:id"
                element={<AuthenticationGuard component={() => (<PageLayout><ProductEditPage/></PageLayout>)}/>}
            />
            <Route
                path="/products/add"
                element={<AuthenticationGuard component={() => (<PageLayout><ProductAddPage/></PageLayout>)}/>}
            />
            <Route
                path="/recipes"
                element={<AuthenticationGuard component={() => (<PageLayout><RecipesPage/></PageLayout>)}/>}
            />
            <Route
                path="/recipes/add"
                element={<AuthenticationGuard component={() => (<PageLayout><RecipeAddPage/></PageLayout>)}/>}
            />
            <Route
                path="/recipes/:id"
                element={<AuthenticationGuard component={() => (<PageLayout><RecipeEditPage/></PageLayout>)}/>}
            />
            <Route path="/callback" element={<PageLayout><CallbackPage/></PageLayout>}/>
            <Route path="*" element={<PageLayout><NotFoundPage/></PageLayout>}/>
        </Routes>
    );
};
