import React, {useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {useNavigate, useParams} from "react-router-dom";
import {getProductById} from "../services/API";
import {PageLayout} from "../components/page-layout/PageLayout.jsx";
import {PageLoader} from "../components/page-loader/PageLoader.jsx";
import {Notification} from "../components/notification/Notification.jsx";
import {CodeSnippet} from "../components/code-snippet/CodeSnippet.jsx";

export const ProductDetailsPage = () => {
    const {id} = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {getAccessTokenSilently} = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const accessToken = await getAccessTokenSilently();
                const productData = await getProductById(accessToken, id);
                setProduct(productData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct().catch(console.error);
    }, [getAccessTokenSilently, id]);

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <PageLayout>
            {loading ? (
                <PageLoader/>
            ) : error ? (
                <Notification show={true} message={error} onClose={() => setError(null)}/>
            ) : (
                <div>
                    <CodeSnippet
                        title="Product Details"
                        code={JSON.stringify(product, null, 2)}
                    />
                    <button
                        onClick={handleBackClick}
                        className="text-white font-bold py-2 px-4 rounded mb-4"
                        style={{background: 'var(--blue-aqua-gradient)'}}
                    >
                        Back
                    </button>
                </div>
            )}
        </PageLayout>
    );
};
