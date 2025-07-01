import PropTypes from "prop-types";

export default function Breadcrumbs({path, goToBreadcrumb}) {
    return (
        <div className="mb-4 flex items-center gap-2 text-gray-300" aria-label="Breadcrumb">
            <span className="cursor-pointer hover:underline" onClick={() => goToBreadcrumb(-1)}>Root</span>
            {path.map((p, idx) => (
                <React.Fragment key={p.id}>
                    <span>/</span>
                    <span className="cursor-pointer hover:underline" onClick={() => goToBreadcrumb(idx)}>{p.name}</span>
                </React.Fragment>
            ))}
        </div>
    );
}

Breadcrumbs.propTypes = {
    path: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.any.isRequired,
        name: PropTypes.string.isRequired
    })).isRequired,
    goToBreadcrumb: PropTypes.func.isRequired
}; 