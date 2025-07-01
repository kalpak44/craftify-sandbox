import {NavBar} from "../nav-bar/NavBar.jsx";
import {PageFooter} from "../page-footer/PageFooter.jsx";
import "./PageLayout.css";

export const PageLayout = ({children}) => {
    return (
        <div className="page-layout">
            <NavBar/>
            <div className="page-layout__content">{children}</div>
            <PageFooter/>
        </div>
    );
};
