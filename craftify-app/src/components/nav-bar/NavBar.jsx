import {NavBarTabs} from "./NavBarTabs.jsx";
import {NavBarButtons} from "./NavBarButtons.jsx";
import {NavBarBrand} from "./NavBarBrand.jsx";


export const NavBar = () => {
    return (
        <div className="nav-bar__container">
            <nav className="nav-bar">
                <NavBarBrand/>
                <NavBarTabs/>
                <NavBarButtons/>
            </nav>
        </div>
    );
};
