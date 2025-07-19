export function Pagination() {
    // TODO: Реализовать логику для реального пейджинга
    return (
        <div className="flex justify-center mt-6">
            <button className="px-4 py-2 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 mr-2">Prev</button>
            <button className="px-4 py-2 rounded bg-gray-800 text-gray-400 hover:bg-gray-700">Next</button>
        </div>
    );
}
