import React from "react";
import { NavBar } from "../nav-bar/NavBar.jsx";
import { PageFooter } from "../page-footer/PageFooter.jsx";
import "./PageFullLayout.css";

export const PageFullLayout = ({ children }) => {
    return (
        <div className="page-full-layout">
            <NavBar />
            <div className="page-full-layout__content">
                {children}
            </div>
            <PageFooter />
        </div>
    );
};
