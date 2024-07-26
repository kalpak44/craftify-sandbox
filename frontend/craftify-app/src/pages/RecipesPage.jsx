import React from "react";
import {PageLayout} from "../components/page-layout/PageLayout.jsx";

export const RecipesPage = () => {

    return (
        <PageLayout>
            <div className="content-layout">
                <h1 id="page-title" className="content__title">
                    Protected Page
                </h1>
                <div className="content__body flex justify-between items-center">
                    <p id="page-description">
                        <span>
                            This page retrieves a <strong>protected data</strong> from an
                            external API.
                        </span>
                    </p>

                </div>
            </div>
        </PageLayout>
    );
};
