import {NavBar} from "../nav-bar/NavBar.jsx";
import "./PageFullLayout.css";

export const PageFullLayout = ({children}) => {
    return (
        <div className="page-full-layout">
            <NavBar/>
            <div className="page-full-layout__content">
                {children}
            </div>
        </div>
    );
};
