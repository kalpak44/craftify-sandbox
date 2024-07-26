import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../components/page-layout/PageLayout.jsx";
import { PageLoader } from "../components/page-loader/PageLoader.jsx";
import { Notification } from "../components/notification/Notification.jsx";
import { Modal } from "../components/modal/Modal.jsx";
import { createProduct } from "../services/API";
import {DynamicProductSection} from "../components/dynamic-product-section/DynamicProductSection.jsx";

export const ProductAddPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [product, setProduct] = useState({
        name: "",
        attributes: [],
        measurements: [],
        tags: [],
        availability: [],
        categories: []
    });
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleNestedChange = (e, section, index, key) => {
        const { value } = e.target;
        const newSection = [...product[section]];
        newSection[index][key] = value;
        setProduct((prevState) => ({
            ...prevState,
            [section]: newSection
        }));
    };

    const handleAddField = (section, defaultField = {}) => {
        setProduct((prevState) => ({
            ...prevState,
            [section]: [...prevState[section], defaultField]
        }));
    };

    const handleRemoveField = (section, index) => {
        const newSection = product[section].filter((_, i) => i !== index);
        setProduct((prevState) => ({
            ...prevState,
            [section]: newSection
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const confirmSubmit = async () => {
        setLoading(true);
        setError(null);
        setShowModal(false);
        try {
            const accessToken = await getAccessTokenSilently();
            const formattedProduct = {
                ...product,
                attributes: Object.fromEntries(product.attributes.map((attr) => [attr.key, attr.value])),
                measurements: Object.fromEntries(product.measurements.map((meas) => [meas.key, { [meas.value]: meas.unit }])),
                availability: Object.fromEntries(product.availability.map((avail) => [avail.key, { [avail.value]: avail.unit }])),
                tags: Object.fromEntries(product.tags.map((tag) => [tag.key, tag.value])),
                categories: product.categories.map((cat) => cat.value)
            };
            const createdProduct = await createProduct(accessToken, formattedProduct);
            setSuccess("Product created successfully!");
            navigate(`/products/${createdProduct.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageLayout>
            {loading ? (
                <PageLoader />
            ) : error || success ? (
                <Notification show={true} message={error || success} onClose={() => { setError(null); setSuccess(null); }} />
            ) : (
                <div className="max-w-4xl mx-auto p-6">
                    <button
                        onClick={() => navigate("/products")}
                        className="text-white font-bold py-2 px-4 rounded mb-4 bg-blue-500 hover:bg-blue-700"
                    >
                        Back to List
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
                            Create new product
                        </button>
                    </form>
                    <Modal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        onConfirm={confirmSubmit}
                        title="Confirm Submission"
                        message="Are you sure you want to submit this product?"
                    />
                </div>
            )}
        </PageLayout>
    );
};
