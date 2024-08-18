import {useAuth0} from "@auth0/auth0-react";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {deleteProduct, getProductsPageable} from "../services/API";
import {PageLoader} from "../components/page-loader/PageLoader.jsx";
import {Modal} from "../components/modal/Modal.jsx";
import {Notification} from "../components/notification/Notification.jsx";
import noDataImage from '../assets/no-data.png';

export const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [expandedProductId, setExpandedProductId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [error, setError] = useState(null);
    const {getAccessTokenSilently} = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const getProductData = async (page) => {
            setLoading(true);
            setError(null);
            try {
                const accessToken = await getAccessTokenSilently();
                const productsData = await getProductsPageable(accessToken, {page: page});

                if (!isMounted) {
                    return;
                }

                if (productsData && productsData.content) {
                    setProducts(productsData.content);
                    setTotalPages(productsData.totalPages);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getProductData(currentPage).catch((error) => {
            console.error(error);
            setLoading(false);
            setError(error.message);
        });

        return () => {
            isMounted = false;
        };
    }, [getAccessTokenSilently, currentPage]);

    const toggleExpand = (productId) => {
        setExpandedProductId(expandedProductId === productId ? null : productId);
    };

    const handleEdit = (id) => {
        navigate(`/products/${id}`);
    };

    const handleRemove = (id) => {
        setProductToDelete(id);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        setError(null);
        setLoading(true);
        try {
            const accessToken = await getAccessTokenSilently();
            await deleteProduct(accessToken, productToDelete);
            await fetchProducts(currentPage);
            setShowModal(false);
            setProductToDelete(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async (page) => {
        setLoading(true);
        setError(null);
        try {
            const accessToken = await getAccessTokenSilently();
            const productsData = await getProductsPageable(accessToken, page);
            setProducts(productsData.content);
            setTotalPages(productsData.totalPages);
            setCurrentPage(0)
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderTable = (data) => (
        <table className="min-w-full bg-gray-800 text-white">
            <tbody>
            {Object.entries(data).map(([key, value]) => (
                <tr key={key}>
                    <td className="py-2 px-4 border-b border-gray-600 font-semibold">{key}</td>
                    <td className="py-2 px-4 border-b border-gray-600">
                        {typeof value === 'object' ? renderNestedTable(value) : value}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );

    const renderNestedTable = (nestedData) => (
        <table className="min-w-full bg-gray-800 text-white">
            <tbody>
            {Object.entries(nestedData).map(([nestedKey, nestedValue]) => (
                <tr key={nestedKey}>
                    <td className="py-1 px-2 border-b border-gray-600">{nestedKey}</td>
                    <td className="py-1 px-2 border-b border-gray-600">{nestedValue}</td>
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
        <>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-white">Products Page</h1>
                    <button
                        className="text-white font-bold py-2 px-4 rounded"
                        style={{
                            minWidth: '8.4rem',
                            border: '0.1rem solid var(--indigo)',
                            color: 'var(--white)',
                            background: 'var(--indigo)',
                            width: '17%',
                            fontSize: '1.6rem',
                            marginRight: '1.6rem',
                            fontFamily: 'var(--font-primary)',
                            fontStyle: 'normal',
                            fontWeight: '600',
                            lineHeight: '3.2rem',
                            padding: '0.8rem 0',
                            borderRadius: '0.8rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            userSelect: 'none',
                            marginBottom: '15px',
                            transition: 'background 0.3s ease-out, color 0.3s ease-out'
                        }}
                        onClick={() => navigate('/products/add')}
                    >
                        Add Product
                    </button>
                </div>
                {loading ? (
                    <PageLoader/>
                ) : (
                    <div className="overflow-x-auto p-4 border rounded-lg shadow-md bg-gray-800">
                        {products.length > 0 ? (
                            <>
                                <table className="min-w-full bg-gray-800 text-white">
                                    <thead>
                                    <tr>
                                        <th className="py-3 px-6 border-b-2 border-gray-600 text-left">ID</th>
                                        <th className="py-3 px-6 border-b-2 border-gray-600 text-left">Name</th>
                                        <th className="py-3 px-6 border-b-2 border-gray-600 text-left">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {products.map((product) => (
                                        <React.Fragment key={product.id}>
                                            <tr
                                                onClick={() => toggleExpand(product.id)}
                                                className={`hover:bg-gray-700 cursor-pointer ${expandedProductId === product.id ? 'bg-gray-900' : ''}`}
                                            >
                                                <td className="py-3 px-6 border-b border-gray-600">{product.id}</td>
                                                <td className="py-3 px-6 border-b border-gray-600">{product.name}</td>
                                                <td className="py-3 px-6 border-b border-gray-600">
                                                    <button
                                                        className="p-2 bg-green-500 text-white rounded mr-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(product.id);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="p-2 bg-red-500 text-white rounded"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemove(product.id);
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedProductId === product.id && (
                                                <tr>
                                                    <td colSpan="3" className="py-3 px-6 border-b border-gray-600 ">
                                                        <div className="border-t border-gray-600">
                                                            <h3 className="py-2 px-4 bg-gray-700 font-semibold text-white">Measurements</h3>
                                                            {renderTable(product.measurements)}
                                                        </div>
                                                        <div className="border-t border-gray-600">
                                                            <h3 className="py-2 px-4 bg-gray-700 font-semibold text-white">Availability</h3>
                                                            {renderTable(product.availability)}
                                                        </div>
                                                        <div className="border-t border-gray-600">
                                                            <h3 className="py-2 px-4 bg-gray-700 font-semibold text-white">Attributes</h3>
                                                            {renderTable(product.attributes)}
                                                        </div>
                                                        <div className="border-t border-gray-600">
                                                            <h3 className="py-2 px-4 bg-gray-700 font-semibold text-white">Tags</h3>
                                                            {renderTable(product.tags)}
                                                        </div>
                                                        <div className="border-t border-gray-600">
                                                            <h3 className="py-2 px-4 bg-gray-700 font-semibold text-white">Categories</h3>
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
                                        className={`p-2 rounded ${currentPage === 0 ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white cursor-pointer'}`}
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 0}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-white">Page {currentPage + 1} of {totalPages}</span>
                                    <button
                                        className={`p-2 rounded ${currentPage === totalPages - 1 ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white cursor-pointer'}`}
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages - 1}
                                    >
                                        Next
                                    </button>
                                </div>

                            </>
                        ) : (
                            noDataImage && (
                                <div className="flex justify-center items-center">
                                    <img src={noDataImage || undefined} alt="No Data"/>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this product?"
            />
            <Notification
                show={!!error}
                message={error}
                onClose={() => setError(null)}
            />
        </>
    );
};
