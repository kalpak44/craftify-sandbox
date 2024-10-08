import {useAuth0} from "@auth0/auth0-react";
import React from "react";
import {NavBarTab} from "./NavBarTab.jsx";


export const NavBarTabs = () => {
    const {isAuthenticated} = useAuth0();

    return (
        <div className="nav-bar__tabs">
            <NavBarTab path="/profile" label="Profile"/>
            {isAuthenticated && (
                <>
                    <NavBarTab path="/items" label="My Items"/>
                    <NavBarTab path="/products" label="Products (Deprecated)"/>
                    <NavBarTab path="/notebooks" label="Notebooks"/>
                    {/*<NavBarTab path="/recipes" label="Crafts/Recipes"/>*/}
                </>
            )}
        </div>
    );
};
