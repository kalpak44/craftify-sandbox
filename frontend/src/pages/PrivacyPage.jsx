export const PrivacyPage = () => (
    <div className="p-8 max-w-4xl mx-auto text-white">
        <h1 className="text-3xl font-semibold mb-6">Privacy Policy</h1>

        <p className="text-gray-300 leading-relaxed mb-4">
            Craftify is committed to protecting your data and ensuring transparency around how it is
            collected, used, and stored. This Privacy Policy outlines our practices regarding the
            information we handle through the platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-white">1. Data We Collect</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
            We collect only the data required to support your use of the platform. This may include:
        </p>
        <ul className="list-disc pl-6 text-gray-300 mb-4">
            <li>Your account information (via Auth0)</li>
            <li>Form submissions and uploaded files</li>
            <li>Code snippets and function logic</li>
            <li>Execution logs and results</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-white">3. Data Storage</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
            Your data is stored securely using encrypted services. Execution
            logs and task history are retained only for as long as needed to support diagnostics and debugging.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-white">4. Your Control</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
            You can delete your files, submissions, or functions at any time via the platform interface.
            If you wish to delete your account or request a full data export, please contact support.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-white">5. Third-Party Services</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
            We use Auth0 for authentication. No credentials are stored by Craftify. Any interactions with
            cloud infrastructure (e.g., S3, AWS, Redis) follow industry-standard security best practices.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-white">6. Contact</h2>
        <p className="text-gray-300 leading-relaxed">
            If you have questions about privacy or data handling, please reach out to us at&nbsp;
            <a href="mailto:support@craftify.dev" className="text-blue-400 underline">
                support@craftify.dev
            </a>.
        </p>
    </div>
);
