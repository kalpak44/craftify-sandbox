import React from "react";
import {NavLink} from "react-router-dom";
import Logo from "../../assets/logo.svg?react";

export const NavBarBrand = () => {
    return (
        <div className="nav-bar__brand">
            <NavLink to="/">
                <Logo/>
            </NavLink>
        </div>
    );
};
