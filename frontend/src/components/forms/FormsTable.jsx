import {useNavigate} from 'react-router-dom';
import {FormsActionsMenu} from "./FormsActionsMenu.jsx";

export function FormsTable({ forms, onRefresh }) {
    const navigate = useNavigate();

    return (
        <div className="w-full bg-gray-950 rounded-xl shadow border border-gray-800 overflow-x-auto mt-4">
            <table className="min-w-full">
                <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Created At</th>
                    <th className="px-4 py-3 text-left font-medium">Updated At</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
                </thead>
                <tbody>
                {forms.map(form => (
                    <tr key={form.id} className="hover:bg-gray-900 transition border-b border-gray-900">
                        <td
                            className="px-4 py-3 cursor-pointer text-blue-400 hover:underline"
                            onClick={() => navigate(`/forms/${form.id}`)}
                        >
                            {form.name}
                        </td>
                        <td className="px-4 py-3">{new Date(form.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3">{new Date(form.updatedAt).toLocaleString()}</td>
                        <td className="px-4 py-3">
                            <FormsActionsMenu formId={form.id} onDeleted={onRefresh} />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

