import {useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import FileNavigator from "./FileNavigator.jsx";
import {listFolders} from "../services/API";

const AccordionSection = ({title, expanded, onClick, children}) => (
    <div className="mb-2">
        <button
            className="w-full text-left px-2 py-2 bg-gray-800 hover:bg-gray-700 rounded font-semibold text-white flex justify-between items-center"
            onClick={onClick}
        >
            <span>{title}</span>
            <span>{expanded ? '▾' : '▸'}</span>
        </button>
        {expanded && <div className="pl-2 pt-2">{children}</div>}
    </div>
);

const MinimalLeftPanel = ({leftPanelOpen, setLeftPanelOpen, favorites, onFavoriteClick}) => {
    const [favExpanded, setFavExpanded] = useState(true);
    const [viewExpanded, setViewExpanded] = useState(false);
    const [viewMode, setViewMode] = useState('list');

    return (
        <div className={`transition-all bg-gray-900 text-white p-4 ${leftPanelOpen ? 'w-80' : 'w-12'} flex flex-col`}>
            <button
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                className="text-gray-400 hover:text-white self-end mb-4"
            >
                {leftPanelOpen ? '←' : '→'}
            </button>
            {leftPanelOpen && (
                <>
                    <h2 className="text-xl font-bold mb-4">Data Menu</h2>
                    <AccordionSection
                        title="Favorite folders"
                        expanded={favExpanded}
                        onClick={() => setFavExpanded((v) => !v)}
                    >
                        {favorites.length === 0 ? (
                            <div className="text-gray-400">No favorites yet.</div>
                        ) : (
                            <ul>
                                {favorites.map(fav => (
                                    <li key={fav.id}>
                                        <button
                                            className="text-blue-300 hover:underline w-full text-left px-2 py-1 flex items-center gap-2"
                                            onClick={() => onFavoriteClick(fav)}
                                        >
                                            <span>📁</span>
                                            <span>{fav.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </AccordionSection>
                    <AccordionSection
                        title="View"
                        expanded={viewExpanded}
                        onClick={() => setViewExpanded((v) => !v)}
                    >
                        <div className="flex flex-col gap-2">
                            <button
                                className={`px-2 py-1 rounded text-left ${viewMode === 'list' ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                                onClick={() => setViewMode('list')}
                            >
                                as List
                            </button>
                            <button
                                className={`px-2 py-1 rounded text-left ${viewMode === 'icons' ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                                onClick={() => setViewMode('icons')}
                            >
                                as Icons
                            </button>
                        </div>
                    </AccordionSection>
                </>
            )}
        </div>
    );
};

export const SchemaNavigationPage = () => {
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const {user, getAccessTokenSilently} = useAuth0();
    const [favorites, setFavorites] = useState([]);
    const [navigateToFolder, setNavigateToFolder] = useState(null);

    // Helper to recursively collect all favorite folders
    const collectAllFavorites = async (accessToken, parentId = null) => {
        const folders = await listFolders(accessToken, parentId);
        let favorites = [];
        for (const folder of folders) {
            if (folder.favorite) {
                favorites.push({...folder, isFavorite: true});
            }
            // Always recurse to find favorites at any depth
            favorites = favorites.concat(await collectAllFavorites(accessToken, folder.id));
        }
        return favorites;
    };

    const fetchFavorites = async () => {
        if (!user) return;
        try {
            const accessToken = await getAccessTokenSilently();
            const favs = await collectAllFavorites(accessToken, null);
            setFavorites(favs);
        } catch (e) {
            setFavorites([]);
        }
    };

    useEffect(() => {
        fetchFavorites();
        // eslint-disable-next-line
    }, [user]);

    const handleFavoriteClick = (fav) => {
        setNavigateToFolder(fav.id);
    };

    return (
        <div className="flex h-full min-h-screen bg-gray-900">
            <MinimalLeftPanel
                leftPanelOpen={leftPanelOpen}
                setLeftPanelOpen={setLeftPanelOpen}
                favorites={favorites}
                onFavoriteClick={handleFavoriteClick}
            />
            <div className="flex-1 flex items-center justify-center" style={{background: '#1F2836', height: '100vh'}}>
                {user && <FileNavigator userId={user.sub} navigateToFolder={navigateToFolder}
                                        onFavoriteToggled={fetchFavorites}/>}
            </div>
        </div>
    );
};

// This is the Data Modeler page
export default SchemaNavigationPage;