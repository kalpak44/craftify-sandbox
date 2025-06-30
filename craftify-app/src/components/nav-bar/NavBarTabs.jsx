import {useAuth0} from "@auth0/auth0-react";
import {NavBarTab} from "./NavBarTab.jsx";
import { useState } from "react";
import { NavLink } from "react-router-dom";


export const NavBarTabs = () => {
    const {isAuthenticated} = useAuth0();
    const [dataMenuOpen, setDataMenuOpen] = useState(false);

    return (
        <div className="nav-bar__tabs">
            <NavBarTab path="/profile" label="Profile"/>
            {isAuthenticated && (
                <>
                    <NavBarTab path="/notebooks" label="My Notebooks"/>
                    <NavBarTab path="/flows" label="Flows"/>
                    <NavBarTab path="/data-modeler" label="Data Modeler"/>
                </>
            )}
        </div>
    );
};
