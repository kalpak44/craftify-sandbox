import {useNavigate, useParams} from 'react-router-dom';
import {DataStoreRecordsActionsMenu} from "./DataStoreRecordsActionsMenu.jsx";

export function DataRecordsTable({dataRecords}) {
    const navigate = useNavigate();
    const { dataStoreId } = useParams();
    console.log(dataRecords);

    return (
        <div className="w-full bg-gray-950 rounded-xl shadow border border-gray-800 overflow-x-auto mt-4">
            <table className="min-w-full">
                <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Created at</th>
                    <th className="px-4 py-3 text-left font-medium">Updated at</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
                </thead>
                <tbody>
                {dataRecords.map(record => (
                    <tr
                        key={record.id}
                        className="hover:bg-gray-900 transition border-b border-gray-900"
                    >
                        <td
                            className="px-4 py-3 cursor-pointer text-blue-400 hover:underline"
                            onClick={() => navigate(`/data-stores/${dataStoreId}/${record.id}`)}
                        >
                            {record.name}
                        </td>
                        <td className="px-4 py-3">{new Date(record.createdAt).toLocaleString() || " - "}</td>
                        <td className="px-4 py-3">{new Date(record.updatedAt).toLocaleString() || " - "}</td>
                        <td className="px-4 py-3">
                            <DataStoreRecordsActionsMenu dataRecordId={record.id} dataStoreId={dataStoreId}/>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
