import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../components/page-layout/PageLayout.jsx";
import { PageLoader } from "../components/page-loader/PageLoader.jsx";
import { Notification } from "../components/notification/Notification.jsx";
import { Modal } from "../components/modal/Modal.jsx";
import { createProduct } from "../services/API";
import { DynamicProductSection } from "../components/dynamic-product-section/DynamicProductSection.jsx";

const demoProducts = [
    {
        name: "Olive Oil",
        attributes: {
            brand: "Extra Virgin",
            origin: "Italy",
            type: "Cold Pressed"
        },
        measurements: {
            volume: {
                1000: "ml"
            }
        },
        tags: {
            category: "Oil",
            usage: "Cooking",
            diet: "Vegan"
        },
        availability: {},
        categories: ["Oils", "Vegan"]
    },
    {
        name: "Parmesan Cheese",
        attributes: {
            brand: "Parmigiano Reggiano",
            origin: "Italy",
            type: "Aged"
        },
        measurements: {
            weight: {
                200: "g"
            }
        },
        tags: {
            usage: "Cooking",
            diet: "Vegetarian"
        },
        availability: {
            weight: {
                20: "g"
            }
        },
        categories: ["Vegetarian"]
    },
    {
        name: "Basil",
        attributes: {
            variety: "Genovese",
            origin: "Italy",
            type: "Fresh"
        },
        measurements: {
            weight: {
                30: "g"
            },
            package: {
                4: "count"
            }
        },
        tags: {
            usage: "Cooking",
            diet: "Vegan"
        },
        availability: {
            weight: {
                30: "g"
            },
            package: {
                1: "count"
            }
        },
        categories: ["Vegan", "Herb"]
    },
    {
        name: "Eggs",
        attributes: {
            variety: "Free-range",
            origin: "Bulgaria",
            type: "Organic",
            size: "XL"
        },
        measurements: {
            quantity: {
                10: "count"
            },
            price: {
                5: "usd"
            }
        },
        tags: {
            usage: "Cooking",
            diet: "Vegetarian",
            product: "Eggs"
        },
        availability: {},
        categories: ["Dairy", "Vegetarian"]
    },
    {
        name: "Eggs",
        attributes: {
            variety: "Free-range",
            type: "Organic",
            size: "M"
        },
        measurements: {
            quantity: {
                6: "count"
            }
        },
        tags: {
            category: "Dairy",
            usage: "Cooking",
            diet: "Vegetarian",
            product: "Eggs"
        },
        availability: {},
        categories: ["Dairy", "Vegetarian"]
    }
];

export const ProductAddPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDemoModal, setShowDemoModal] = useState(false);
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

    const confirmSubmit = async (navigateToList = true) => {
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
            if (navigateToList) {
                navigate(`/products`);
            } else {
                navigate(`/products/${createdProduct.id}`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDemoProducts = () => {
        setShowDemoModal(true);
    };

    const confirmCreateDemoProducts = async () => {
        setLoading(true);
        setError(null);
        setShowDemoModal(false);
        try {
            const accessToken = await getAccessTokenSilently();
            for (const demoProduct of demoProducts) {
                await createProduct(accessToken, demoProduct);
            }
            setSuccess("Demo products created successfully!");
            navigate("/products");
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
                <div className="relative w-full p-6 bg-gray-800 text-white rounded-lg shadow-md mt-8">
                    <button
                        onClick={() => navigate("/products")}
                        className="absolute top-0 right-0 mt-4 mr-4 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                        style={{ background: 'var(--mandarine-orange-gradient)', fontFamily: 'var(--font-primary)' }}
                    >
                        Close
                    </button>
                    <h1 className="text-white text-lg font-bold">New Product</h1>
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
                        <div className="flex flex-wrap md:flex-nowrap gap-4">
                            <button
                                type="button"
                                onClick={handleCreateDemoProducts}
                                className="flex-1 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                                style={{
                                    background: 'var(--mandarine-orange-gradient)',
                                    fontFamily: 'var(--font-primary)'
                                }}
                            >
                                Create Demo Products
                            </button>
                        </div>
                        <div className="flex flex-wrap md:flex-nowrap gap-4">
                            <button
                                type="button"
                                onClick={() => confirmSubmit(false)}
                                className="flex-1 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                                style={{background: 'var(--blue-aqua-gradient)', fontFamily: 'var(--font-primary)'}}
                            >
                                Apply
                            </button>
                            <button
                                type="button"
                                onClick={() => confirmSubmit(true)}
                                className="flex-1 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                                style={{background: 'var(--pink-yellow-gradient)', fontFamily: 'var(--font-primary)'}}
                            >
                                OK
                            </button>
                        </div>
                    </form>
                    <Modal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        onConfirm={() => confirmSubmit(true)}
                        title="Confirm Submission"
                        message="Are you sure you want to submit this product?"
                    />
                    <Modal
                        show={showDemoModal}
                        onClose={() => setShowDemoModal(false)}
                        onConfirm={confirmCreateDemoProducts}
                        title="Confirm Demo Creation"
                        message="Are you sure you want to create demo products?"
                    />
                </div>
            )}
        </PageLayout>
    );
};