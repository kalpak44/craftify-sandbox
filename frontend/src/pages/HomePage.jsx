import {useAuth0} from '@auth0/auth0-react';

/**
 * HomePage: Displays Craftify's simplified value pillars depending on authentication state.
 */
export const HomePage = () => {
    const {loginWithRedirect, isAuthenticated, isLoading, user} = useAuth0();

    const features = [
        {
            title: 'Persist Data',
            description: 'Submit forms or upload files and store them reliably.',
            icon: '🗃️',
        },
        {
            title: 'Run Logic',
            description: 'Write functions to process data using Python, Node.js, or Bash.',
            icon: '🧠',
        },
        {
            title: 'Build APIs',
            description: 'Expose forms and functions as simple API endpoints.',
            icon: '🔗',
        },
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
                    Welcome, {user?.name || 'Developer'}!
                </h1>
                <p className="text-gray-400 mb-8">
                    You are signed in to the Craftify Platform.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
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

    return (
        <div className="flex flex-col items-center justify-center h-full px-4">
            <header className="w-full text-center mb-10">
                <h1 className="text-4xl font-semibold text-white">Craftify</h1>
                <p className="text-gray-400 mt-2 max-w-xl mx-auto">
                    Build lightweight APIs powered by logic and data. Just forms, code, and results — no infrastructure.
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
