import {useAuth0} from "@auth0/auth0-react";

import {SignupButton} from "../buttons/signup-button/SignupButton.jsx";

import "./NavBar.css";
import "../buttons/index.css";
import {LoginButton} from "../buttons/login-button/LoginButton.jsx";
import {LogoutButton} from "../buttons/logout-button/LogoutButton.jsx";


export const NavBarButtons = () => {
    const {isAuthenticated} = useAuth0();

    return (
        <div className="nav-bar__buttons">
            {!isAuthenticated && (
                <>
                    <SignupButton/>
                    <LoginButton/>
                </>
            )}
            {isAuthenticated && (
                <>
                    <LogoutButton/>
                </>
            )}
        </div>
    );
};
