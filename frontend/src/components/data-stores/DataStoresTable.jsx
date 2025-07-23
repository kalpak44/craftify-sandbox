import {useNavigate} from 'react-router-dom';
import {DataStoreActionsMenu} from "./DataStoreActionsMenu.jsx";

export function DataStoresTable({dataStores}) {
    const navigate = useNavigate();

    return (
        <div className="w-full bg-gray-950 rounded-xl shadow border border-gray-800 overflow-x-auto mt-4">
            <table className="min-w-full">
                <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Created at</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Records</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
                </thead>
                <tbody>
                {dataStores.map(ds => (
                    <tr
                        key={ds.id}
                        className="hover:bg-gray-900 transition border-b border-gray-900"
                    >
                        <td
                            className="px-4 py-3 cursor-pointer text-blue-400 hover:underline"
                            onClick={() => navigate(`/data-stores/${ds.id}`)}
                        >
                            {ds.name}
                        </td>
                        <td className="px-4 py-3">{ds.type}</td>
                        <td className="px-4 py-3">{new Date(ds.createdAt).toLocaleString() || " - "}</td>
                        <td className="px-4 py-3">{ds.status || "ACTIVE"}</td>
                        <td className="px-4 py-3">{ds.records || 0}</td>
                        <td className="px-4 py-3">
                            <DataStoreActionsMenu functionId={ds.id}/>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
