import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { NavLink } from 'react-router-dom';
import { Loader } from '../common/Loader';

/**
 * Layout with full width, navbar, and profile dropdown.
 * Wrap your page content in this component.
 *
 * Props:
 * - children: ReactNode
 */
export const FullWidthLayout = ({ children }) => {
    const { isAuthenticated, user, logout, loginWithRedirect, isLoading } = useAuth0();
    const [showProfile, setShowProfile] = useState(false);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setShowProfile(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleSignUp = () => {
        loginWithRedirect({
            appState: { returnTo: '/callback' },
            authorizationParams: { prompt: 'login', screen_hint: 'signup' }
        });
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-900 text-white">
            <nav className="flex items-center justify-between px-6 py-4 bg-gray-950 border-b border-gray-800">
                <div className="text-white text-lg font-semibold">Craftify Platform</div>
                <div className="flex items-center space-x-6 text-gray-400 text-sm relative">
                    {isAuthenticated ? (
                        <>
                            <NavLink to="/" className={({ isActive }) => isActive ? 'text-white' : 'hover:text-white'}>Home</NavLink>
                            <NavLink to="/files" className={({ isActive }) => isActive ? 'text-white' : 'hover:text-white'}>Files</NavLink>
                            <div className="relative" ref={profileMenuRef}>
                                <img
                                    src={user.picture}
                                    alt="profile"
                                    className="w-8 h-8 rounded-full cursor-pointer border border-gray-700"
                                    onClick={() => setShowProfile(prev => !prev)}
                                />
                                {showProfile && (
                                    <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <img src={user.picture} alt="avatar" className="w-10 h-10 rounded-full" />
                                            <div>
                                                <p className="text-sm font-medium text-white">{user.name}</p>
                                                <p className="text-xs text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem('access_token');
                                                logout({ returnTo: window.location.origin });
                                            }}
                                            className="w-full mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <NavLink to="/" className={({ isActive }) => isActive ? 'text-white' : 'hover:text-white'}>Home</NavLink>
                            <NavLink to="/terms" className={({ isActive }) => isActive ? 'text-white' : 'hover:text-white'}>Terms</NavLink>
                            <NavLink to="/privacy" className={({ isActive }) => isActive ? 'text-white' : 'hover:text-white'}>Privacy</NavLink>
                            <button
                                onClick={() => loginWithRedirect()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
                            >
                                Log In
                            </button>
                            <button
                                onClick={handleSignUp}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded text-sm"
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </nav>
            <div className="flex flex-col flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
};

FullWidthLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
