import React from "react";
import {PageFooterHyperlink} from "../page-footer-hyperlink/PageFooterHyperlink.jsx";
import "./PageFooter.css";

export const PageFooter = () => {
    const resourceList = [
        {
            path: "https://app.craftify.com/",
            label: "Why Craftify?",
        },
        {
            path: "https://app.craftify.com/docs/get-started",
            label: "How It Works",
        },
        {
            path: "https://app.craftify.com//blog/developers/",
            label: "Developer Blog",
        },
        {
            path: "https://app.craftify.com/contact-us",
            label: "Contact an Expert",
        },
    ];

    return (
        <footer className="page-footer">
            <div className="page-footer-grid">
                <div className="page-footer-grid__info">
                    <div className="page-footer-info__message">
                        <p className="page-footer-message__headline">
                            <span>Lorem Ipsum is simply dummy text of the printing&nbsp;</span>
                        </p>
                        <p className="page-footer-message__description">
                            and typesetting industry.
                        </p>
                    </div>
                    <div className="page-footer-info__resource-list">
                        {resourceList.map((resource) => (
                            <div
                                key={resource.path}
                                className="page-footer-info__resource-list-item"
                            >
                                <PageFooterHyperlink path={resource.path}>
                                    {resource.label}
                                </PageFooterHyperlink>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};
