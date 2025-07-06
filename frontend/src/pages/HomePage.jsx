import {useAuth0} from '@auth0/auth0-react';

/**
 * HomePage: Displays a hero or welcome dashboard depending on authentication state.
 */
export const HomePage = () => {
    const {loginWithRedirect, isAuthenticated, isLoading, user} = useAuth0();

    const features = [
        {
            title: 'Build Flows',
            description: 'Design and manage your flow-based applications',
            icon: '🪄'
        },
        {
            title: 'Manage Data',
            description: 'Validate and store structured records',
            icon: '🗃️'
        },
        {
            title: 'Define Schemas',
            description: 'Create and edit data schemas',
            icon: '📐'
        }
    ];

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center text-xl text-gray-400">
                Loading...
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center h-full px-4">
                <h1 className="text-3xl font-bold mb-4 text-white">
                    Welcome, {user?.name || 'User'}!
                </h1>
                <p className="text-gray-400 mb-8">
                    You are signed in to the Flow Execution Platform.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    {features.map(({title, description, icon}) => (
                        <div
                            key={title}
                            className="bg-gray-800 p-6 rounded-lg shadow text-center hover:bg-gray-700 transition"
                        >
                            <div className="text-4xl mb-3">{icon}</div>
                            <h2 className="text-xl font-semibold text-white">{title}</h2>
                            <p className="text-gray-400 text-sm mt-2">{description}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // If not authenticated, show hero section
    return (
        <div className="flex flex-col items-center justify-center h-full px-4">
            <header className="w-full text-center mb-10">
                <h1 className="text-4xl font-semibold text-white">
                    Flow Execution Platform
                </h1>
                <p className="text-gray-400 mt-2">
                    Streamline the execution of your workflows
                </p>
                <button
                    onClick={() => loginWithRedirect()}
                    className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-lg"
                >
                    Log In
                </button>
            </header>
        </div>
    );
};