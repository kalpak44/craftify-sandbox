import {FunctionActionsMenu} from './FunctionActionsMenu';
import {useNavigate} from 'react-router-dom';

export function FunctionTable({functions}) {
    const navigate = useNavigate();

    return (
        <div className="w-full bg-gray-950 rounded-xl shadow border border-gray-800 overflow-x-auto mt-4">
            <table className="min-w-full">
                <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Execution Mode</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
                </thead>
                <tbody>
                {functions.map(fn => (
                    <tr
                        key={fn.id}
                        className="hover:bg-gray-900 transition border-b border-gray-900"
                    >
                        <td
                            className="px-4 py-3 cursor-pointer text-blue-400 hover:underline"
                            onClick={() => navigate(`/functions/${fn.id}`)}
                        >
                            {fn.name}
                        </td>
                        <td className="px-4 py-3">{fn.status}</td>
                        <td className="px-4 py-3">{fn.executionMode}</td>
                        <td className="px-4 py-3">
                            <FunctionActionsMenu functionId={fn.id}/>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
