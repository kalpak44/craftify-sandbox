import {useEffect} from "react";
import {useAuth0} from "@auth0/auth0-react";
import "./ChatPage.css";

// Components
import MessageList from "../components/chat/MessageList";
import ChatInput from "../components/chat/ChatInput";
import LoadingIndicator from "../components/chat/LoadingIndicator";

// Hooks
import useWebSocket from "../components/chat/useWebSocket";

export const ChatPage = () => {
    const {getAccessTokenSilently, isAuthenticated} = useAuth0();
    const {
        isConnected,
        messages,
        isLoading,
        connectWebSocket,
        sendMessage
    } = useWebSocket(getAccessTokenSilently);

    useEffect(() => {
        if (isAuthenticated) {
            connectWebSocket();
        }
    }, [isAuthenticated, connectWebSocket]);

    return (
        <div className="chat-container">
            <div className="chat-window">
                <MessageList messages={messages}/>
                {isLoading && <LoadingIndicator/>}
                <ChatInput
                    onSendMessage={sendMessage}
                    isConnected={isConnected}
                />
            </div>
        </div>
    );
};
