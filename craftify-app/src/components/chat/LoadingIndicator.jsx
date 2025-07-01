const LoadingIndicator = () => {
    return (
        <div className="loading-indicator">
            <span>AI is thinking</span>
            <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
            </div>
        </div>
    );
};

export default LoadingIndicator;