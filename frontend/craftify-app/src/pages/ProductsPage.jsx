import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { getProductsPageable } from "../services/API";
import { PageLayout } from "../components/page-layout/PageLayout.jsx";
import {PageLoader} from "../components/page-loader/PageLoader.jsx";

export const ProtectedPage = () => {
    const [products, setProducts] = useState([]);
    const [expandedProductId, setExpandedProductId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        let isMounted = true;

        const getProductData = async (page) => {
            setLoading(true);
            const accessToken = await getAccessTokenSilently();
            const productsData = await getProductsPageable(accessToken, page);

            if (!isMounted) {
                return;
            }

            if (productsData && productsData.content) {
                setProducts(productsData.content);
                setTotalPages(productsData.totalPages);
            }
            setLoading(false);
        };

        getProductData(currentPage).catch((error) => {
            console.error(error);
            setLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, [getAccessTokenSilently, currentPage]);

    const toggleExpand = (productId) => {
        setExpandedProductId(expandedProductId === productId ? null : productId);
    };

    const handleEdit = (id) => {
        console.log(`Edit product with id: ${id}`);
        // Implement edit functionality here
    };

    const handleRemove = (id) => {
        console.log(`Remove product with id: ${id}`);
        setProducts((prevProducts) => prevProducts.filter(product => product.id !== id));
    };

    const renderTable = (data) => (
        <table className="min-w-full bg-white">
            <tbody>
            {Object.entries(data).map(([key, value]) => (
                <tr key={key}>
                    <td className="py-2 px-4 border-b border-gray-200 font-semibold">{key}</td>
                    <td className="py-2 px-4 border-b border-gray-200">
                        {typeof value === 'object' ? renderNestedTable(value) : value}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );

    const renderNestedTable = (nestedData) => (
        <table className="min-w-full bg-white">
            <tbody>
            {Object.entries(nestedData).map(([nestedKey, nestedValue]) => (
                <tr key={nestedKey}>
                    <td className="py-1 px-2 border-b border-gray-200">{nestedKey}</td>
                    <td className="py-1 px-2 border-b border-gray-200">{nestedValue}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <PageLayout>
            <div className="content-layout">
                <h1 id="page-title" className="content__title">
                    Protected Page
                </h1>
                <div className="content__body">
                    <p id="page-description">
                        <span>
                            This page retrieves a <strong>protected message</strong> from an
                            external API.
                        </span>
                    </p>
                    {loading ? (
                        <PageLoader />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead>
                                <tr>
                                    <th className="w-1/5 py-3 px-6 border-b-2 border-gray-300 text-left leading-tight text-black" style={{ cursor: 'pointer', background: 'var(--pink-yellow-gradient)' }}>ID</th>
                                    <th className="w-3/5 py-3 px-6 border-b-2 border-gray-300 text-left leading-tight text-black" style={{ cursor: 'pointer', background: 'var(--pink-yellow-gradient)' }}>Name</th>
                                    <th className="w-1/5 py-3 px-6 border-b-2 border-gray-300 text-left leading-tight text-black" style={{ cursor: 'pointer', background: 'var(--pink-yellow-gradient)' }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {products.map((product) => (
                                    <React.Fragment key={product.id}>
                                        <tr onClick={() => toggleExpand(product.id)} className="hover:bg-gray-100 cursor-pointer">
                                            <td className="w-1/5 py-3 px-6 border-b border-gray-200 text-black">{product.id}</td>
                                            <td className="w-3/5 py-3 px-6 border-b border-gray-200 text-black">{product.name}</td>
                                            <td className="w-1/5 py-3 px-6 border-b border-gray-200 text-black">
                                                <button
                                                    className="text-white font-bold py-2 px-4 rounded mr-2"
                                                    style={{ background: 'var(--blue-aqua-gradient)' }}
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(product.id); }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="text-white font-bold py-2 px-4 rounded"
                                                    style={{ background: 'var(--pink-yellow-gradient)' }}
                                                    onClick={(e) => { e.stopPropagation(); handleRemove(product.id); }}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedProductId === product.id && (
                                            <tr>
                                                <td colSpan="3" className="py-3 px-6 border-b border-gray-200 text-black">
                                                    <div className="border-t border-gray-200">
                                                        <h3 className="py-2 px-4 bg-gray-100 font-semibold">Measurements</h3>
                                                        {renderTable(product.measurements)}
                                                    </div>
                                                    <div className="border-t border-gray-200">
                                                        <h3 className="py-2 px-4 bg-gray-100 font-semibold">Availability</h3>
                                                        {renderTable(product.availability)}
                                                    </div>
                                                    <div className="border-t border-gray-200">
                                                        <h3 className="py-2 px-4 bg-gray-100 font-semibold">Attributes</h3>
                                                        {renderTable(product.attributes)}
                                                    </div>
                                                    <div className="border-t border-gray-200">
                                                        <h3 className="py-2 px-4 bg-gray-100 font-semibold">Tags</h3>
                                                        {renderTable(product.tags)}
                                                    </div>
                                                    <div className="border-t border-gray-200">
                                                        <h3 className="py-2 px-4 bg-gray-100 font-semibold">Categories</h3>
                                                        {product.categories.join(', ')}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>
                            <div className="flex justify-between items-center py-4">
                                <button
                                    className="text-white font-bold py-2 px-4 rounded"
                                    style={{ background: 'var(--blue-aqua-gradient)' }}
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 0}
                                >
                                    Previous
                                </button>
                                <span>Page {currentPage + 1} of {totalPages}</span>
                                <button
                                    className="text-white font-bold py-2 px-4 rounded"
                                    style={{ background: 'var(--pink-yellow-gradient)' }}
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages - 1}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};
