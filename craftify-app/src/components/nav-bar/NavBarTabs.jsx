import {useAuth0} from "@auth0/auth0-react";
import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getFolderSchemaTree } from "../../services/API";

export const NavBarTabs = () => {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dataMenuOpen, setDataMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            setLoading(true);
            getAccessTokenSilently()
                .then(token => getFolderSchemaTree(token))
                .then(data => setTree(data))
                .finally(() => setLoading(false));
        }
    }, [isAuthenticated, getAccessTokenSilently]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDataMenuOpen(false);
            }
        }
        if (dataMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dataMenuOpen]);

    const renderTree = (nodes) => {
        return (
            <ul className="nav-bar__dropdown-list">
                {nodes.map(node => {
                    if (node.type === "folder") {
                        return (
                            <li key={node.id} className="nav-bar__dropdown-folder">
                                <span className="nav-bar__dropdown-folder-label">
                                    <span className="nav-bar__dropdown-icon" role="img" aria-label="folder">📁</span>
                                    {node.name}
                                </span>
                                {node.children && node.children.length > 0 && renderTree(node.children)}
                            </li>
                        );
                    } else if (node.type === "schema") {
                        return (
                            <li key={node.id} className="nav-bar__dropdown-schema">
                                <a
                                    href="#"
                                    onClick={e => {
                                        e.preventDefault();
                                        setDataMenuOpen(false);
                                        navigate(`/schemas/${node.id}`);
                                    }}
                                    className="nav-bar__dropdown-link"
                                >
                                    <span className="nav-bar__dropdown-icon" role="img" aria-label="schema">📄</span>
                                    {node.name}
                                </a>
                            </li>
                        );
                    }
                    return null;
                })}
            </ul>
        );
    };

    return (
        <div className="nav-bar__tabs">
            <NavLink
                to="/profile"
                end
                className={({isActive}) =>
                    "nav-bar__tab " + (isActive ? "nav-bar__tab--active" : "")
                }
            >
                Profile
            </NavLink>
            {isAuthenticated && (
                <>
                    <NavLink
                        to="/notebooks"
                        className={({isActive}) =>
                            "nav-bar__tab " + (isActive ? "nav-bar__tab--active" : "")
                        }
                    >
                        My Notebooks
                    </NavLink>
                    <NavLink
                        to="/flows"
                        className={({isActive}) =>
                            "nav-bar__tab " + (isActive ? "nav-bar__tab--active" : "")
                        }
                    >
                        Flows
                    </NavLink>
                    <NavLink
                        to="/data-modeler"
                        className={({isActive}) =>
                            "nav-bar__tab " + (isActive ? "nav-bar__tab--active" : "")
                        }
                    >
                        Data Modeler
                    </NavLink>
                </>
            )}
            {isAuthenticated && !loading && tree.length > 0 && (
                <div className="nav-bar__tab nav-bar__tab--dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
                    <button
                        className="nav-bar__tab nav-bar__tab--dropdown-btn"
                        onClick={() => setDataMenuOpen(open => !open)}
                    >
                        Data ▾
                    </button>
                    {dataMenuOpen && (
                        <div className="nav-bar__dropdown">
                            {renderTree(tree)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
