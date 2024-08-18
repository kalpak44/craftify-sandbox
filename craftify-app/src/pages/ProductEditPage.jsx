import React, {useCallback, useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {useNavigate, useParams} from "react-router-dom";
import {deleteProduct, getProductById, updateProduct} from "../services/API";
import {PageLoader} from "../components/page-loader/PageLoader.jsx";
import {Notification} from "../components/notification/Notification.jsx";
import {Modal} from "../components/modal/Modal.jsx";
import {DynamicProductSection} from "../components/dynamic-product-section/DynamicProductSection.jsx";

export const ProductEditPage = () => {
    const {id} = useParams();
    const [originalProduct, setOriginalProduct] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const {getAccessTokenSilently} = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const accessToken = await getAccessTokenSilently();
                const productData = await getProductById(accessToken, id);

                // Format the product data to match the state structure
                const formattedProduct = {
                    name: productData.name,
                    attributes: Object.entries(productData.attributes || {}).map(([key, value]) => ({key, value})),
                    measurements: Object.entries(productData.measurements || {}).map(([key, value]) => ({
                        key,
                        value: value.value,
                        unit: value.unit
                    })),
                    tags: Object.entries(productData.tags || {}).map(([key, value]) => ({key, value})),
                    availability: Object.entries(productData.availability || {}).map(([key, value]) => ({
                        key,
                        value: value.value,
                        unit: value.unit,
                    })),
                    categories: (productData.categories || []).map(value => ({value}))
                };
                setProduct(formattedProduct);
                setOriginalProduct(formattedProduct);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct().catch(console.error);
    }, [getAccessTokenSilently, id]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setProduct(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleNestedChange = (e, section, index, key) => {
        const {value} = e.target;
        const newSection = [...product[section]];
        newSection[index][key] = value;
        setProduct(prevState => ({
            ...prevState,
            [section]: newSection
        }));
    };

    const handleAddField = (section, defaultField = {}) => {
        setProduct(prevState => ({
            ...prevState,
            [section]: [...prevState[section], defaultField]
        }));
    };

    const handleRemoveField = (section, index) => {
        const newSection = product[section].filter((_, i) => i !== index);
        setProduct(prevState => ({
            ...prevState,
            [section]: newSection
        }));
    };

    const hasChanges = useCallback(() => {
        return JSON.stringify(product) !== JSON.stringify(originalProduct);
    }, [product, originalProduct]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (hasChanges()) {
            setShowModal(true);
        } else {
            navigate("/products");
        }
    };

    const confirmSubmit = async () => {
        setLoading(true);
        setError(null);
        setShowModal(false);
        try {
            const accessToken = await getAccessTokenSilently();
            const formattedProduct = {
                ...product,
                attributes: Object.fromEntries(product.attributes.map(attr => [attr.key, attr.value])),
                measurements: Object.fromEntries(product.measurements.map(meas => [meas.key, {
                    value: meas.value,
                    unit: meas.unit
                }])),
                availability: Object.fromEntries(product.availability.map(avail => [avail.key, {
                    value: avail.value,
                    unit: avail.unit
                }])),
                tags: Object.fromEntries(product.tags.map(tag => [tag.key, tag.value])),
                categories: product.categories.map(cat => cat.value)
            };
            await updateProduct(accessToken, id, formattedProduct);
            setSuccess(`Product updated successfully!`);
            navigate("/products");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        setError(null);
        setShowDeleteModal(false);
        try {
            const accessToken = await getAccessTokenSilently();
            await deleteProduct(accessToken, id);
            setSuccess(`Product deleted successfully!`);
            navigate("/products");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        navigate("/products");
    };

    return (
        <>
            {loading ? (
                <PageLoader/>
            ) : error || success ? (
                <Notification show={true} message={error || success} onClose={() => {
                    setError(null);
                    setSuccess(null);
                }}/>
            ) : (
                <div className="relative w-full p-6 bg-gray-800 text-white rounded-lg shadow-md mt-8">
                    <button
                        onClick={handleBackClick}
                        className="absolute top-0 right-0 mt-4 mr-4 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                        style={{background: 'var(--mandarine-orange-gradient)', fontFamily: 'var(--font-primary)'}}
                    >
                        Close
                    </button>
                    <h1 className="text-white text-lg font-bold">Edit Product</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        <div className="space-y-2">
                            <label className="block font-medium">Product Name:<span
                                className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={product.name}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                                required
                            />
                        </div>
                        <DynamicProductSection
                            sectionName="Attributes"
                            sectionKey="attributes"
                            fields={product.attributes}
                            handleNestedChange={handleNestedChange}
                            handleAddField={handleAddField}
                            handleRemoveField={handleRemoveField}
                        />
                        <DynamicProductSection
                            sectionName="Measurements"
                            sectionKey="measurements"
                            fields={product.measurements}
                            handleNestedChange={handleNestedChange}
                            handleAddField={handleAddField}
                            handleRemoveField={handleRemoveField}
                            isMeasurement
                        />
                        <DynamicProductSection
                            sectionName="Availability"
                            sectionKey="availability"
                            fields={product.availability}
                            handleNestedChange={handleNestedChange}
                            handleAddField={handleAddField}
                            handleRemoveField={handleRemoveField}
                            isMeasurement
                        />
                        <DynamicProductSection
                            sectionName="Tags"
                            sectionKey="tags"
                            fields={product.tags}
                            handleNestedChange={handleNestedChange}
                            handleAddField={handleAddField}
                            handleRemoveField={handleRemoveField}
                        />
                        <DynamicProductSection
                            sectionName="Categories"
                            sectionKey="categories"
                            fields={product.categories}
                            handleNestedChange={handleNestedChange}
                            handleAddField={handleAddField}
                            handleRemoveField={handleRemoveField}
                            isCategory
                        />
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="w-full py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                                style={{background: 'var(--pink-yellow-gradient)', fontFamily: 'var(--font-primary)'}}
                                onClick={handleChange}
                            >
                                Update Product
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="w-full py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                                style={{
                                    background: 'var(--mandarine-orange-gradient)',
                                    fontFamily: 'var(--font-primary)'
                                }}
                            >
                                Delete Product
                            </button>
                        </div>
                    </form>
                    <Modal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        onConfirm={confirmSubmit}
                        title="Confirm Submission"
                        message="Are you sure you want to submit these changes?"
                    />
                    <Modal
                        show={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={confirmDelete}
                        title="Confirm Deletion"
                        message="Are you sure you want to delete this product?"
                    />
                </div>
            )}
        </>
    );
};
