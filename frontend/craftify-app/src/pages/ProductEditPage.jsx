import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../services/API";
import { PageLayout } from "../components/page-layout/PageLayout.jsx";
import { PageLoader } from "../components/page-loader/PageLoader.jsx";
import { Notification } from "../components/notification/Notification.jsx";
import {DynamicProductSection} from "../components/dynamic-product-section/DynamicProductSection.jsx";

export const ProductEditPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getAccessTokenSilently } = useAuth0();
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
                    attributes: Object.entries(productData.attributes || {}).map(([key, value]) => ({ key, value })),
                    measurements: Object.entries(productData.measurements || {}).map(([key, value]) => ({ key, value: Object.keys(value)[0], unit: Object.values(value)[0] })),
                    tags: Object.entries(productData.tags || {}).map(([key, value]) => ({ key, value })),
                    availability: Object.entries(productData.availability || {}).map(([key, value]) => ({ key, value: Object.keys(value)[0], unit: Object.values(value)[0] })),
                    categories: (productData.categories || []).map(value => ({ value }))
                };
                setProduct(formattedProduct);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct().catch(console.error);
    }, [getAccessTokenSilently, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleNestedChange = (e, section, index, key) => {
        const { value } = e.target;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const accessToken = await getAccessTokenSilently();
            const formattedProduct = {
                ...product,
                attributes: Object.fromEntries(product.attributes.map(attr => [attr.key, attr.value])),
                measurements: Object.fromEntries(product.measurements.map(meas => [meas.key, { [meas.value]: meas.unit }])),
                availability: Object.fromEntries(product.availability.map(avail => [avail.key, { [avail.value]: avail.unit }])),
                tags: Object.fromEntries(product.tags.map(tag => [tag.key, tag.value])),
                categories: product.categories.map(cat => cat.value)
            };
            console.log(JSON.stringify(formattedProduct, null, 2))
            await updateProduct(accessToken, id, formattedProduct);
            navigate("/products");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <PageLayout>
            {loading ? (
                <PageLoader />
            ) : error ? (
                <Notification show={true} message={error} onClose={() => setError(null)} />
            ) : (
                <div className="max-w-4xl mx-auto p-6">
                    <button
                        onClick={handleBackClick}
                        className="text-white font-bold py-2 px-4 rounded mb-4 bg-blue-500 hover:bg-blue-700"
                    >
                        Back
                    </button>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block font-medium">Product Name:<span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={product.name}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded text-black"
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
                        <button
                            type="submit"
                            className="w-full py-2 px-4 rounded bg-green-500 text-white font-bold hover:bg-green-700"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            )}
        </PageLayout>
    );
};
