import { useParams } from "react-router-dom";

export const RecordsPage = () => {
    const { id: schemaId } = useParams();

    return (
        <div className="p-8 max-w-4xl mx-auto text-white">
            <h1 className="text-3xl font-semibold mb-4">Records</h1>
            <p className="text-lg">Current Schema ID: <span className="font-mono">{schemaId}</span></p>
        </div>
    );
};
