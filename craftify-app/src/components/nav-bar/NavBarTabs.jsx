import {useAuth0} from "@auth0/auth0-react";
import {NavBarTab} from "./NavBarTab.jsx";


export const NavBarTabs = () => {
    const {isAuthenticated} = useAuth0();

    return (
        <div className="nav-bar__tabs">
            <NavBarTab path="/profile" label="Profile"/>
            {isAuthenticated && (
                <>
                    <NavBarTab path="/notebooks" label="My Notebooks"/>
                    <NavBarTab path="/flows" label="Flows"/>
                </>
            )}
        </div>
    );
};
