import { useAuth0 } from "@auth0/auth0-react";

export const HomePage = () => {
    const { loginWithRedirect } = useAuth0();

    const features = [
        {
            title: "Build Flows",
            description: "Design and manage your flow-based applications",
            icon: "🪄"
        },
        {
            title: "Manage Data",
            description: "Validate and store structured records",
            icon: "🗃️"
        },
        {
            title: "Define Schemas",
            description: "Create and edit data schemas",
            icon: "📐"
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full px-4">
            {/* Hero Section */}
            <header className="w-full text-center mb-10">
                <h1 className="text-4xl font-semibold">Flow Execution Platform</h1>
                <p className="text-gray-400 mt-2">Streamline the execution of your workflows</p>
                <button
                    onClick={() => loginWithRedirect()}
                    className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-lg"
                >
                    Log In
                </button>
            </header>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
                {features.map(({ title, description, icon }) => (
                    <div
                        key={title}
                        className="bg-gray-800 p-6 rounded-lg shadow text-center hover:bg-gray-700 transition"
                    >
                        <div className="text-4xl mb-3">{icon}</div>
                        <h2 className="text-xl font-semibold">{title}</h2>
                        <p className="text-gray-400 text-sm mt-2">{description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
