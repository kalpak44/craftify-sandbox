export function FunctionHeader({func}) {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">{func.name}</h2>
            <div className="flex flex-wrap gap-6 mt-3 text-gray-400 text-base">
                <span><b className="text-gray-200">Status:</b> {func.status}</span>
                <span><b className="text-gray-200">Type:</b> {func.type}</span>
                <span><b className="text-gray-200">Execution Mode:</b> {func.executionMode}</span>
            </div>
        </div>
    );
}
