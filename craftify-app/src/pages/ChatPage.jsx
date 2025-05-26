import React, { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { useAuth0 } from "@auth0/auth0-react";

let stompClient = null;

export const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();

    // Connect and disconnect WebSocket
    useEffect(() => {
        if (isAuthenticated) {
            connectWebSocket();
        }

        return () => {
            if (stompClient?.connected) {
                console.log("[WebSocket] Disconnecting...");
                stompClient.deactivate();
            }
        };
    }, [isAuthenticated]);

    const connectWebSocket = async () => {
        if (stompClient?.connected) {
            console.log("[WebSocket] Already connected.");
            return;
        }

        try {
            const token = await getAccessTokenSilently();
            console.log("[Auth0] Token retrieved:", token.slice(0, 20) + "...");

            stompClient = new Client({
                webSocketFactory: () => new WebSocket("ws://localhost:8080/ws-native"),  // skip SockJS

                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                debug: (str) => console.log("[STOMP DEBUG]:", str),
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log("[WebSocket] Connected to STOMP");

                    stompClient.subscribe("/topic/messages", (message) => {
                        const payload = message.body;
                        console.log("[STOMP] Message received:", payload);
                        setMessages((prev) => [...prev, { sender: "bot", text: payload }]);
                    });
                },
                onStompError: (frame) => {
                    console.error("[STOMP ERROR]", frame.headers["message"]);
                    console.error("[STOMP ERROR Details]", frame.body);
                },
                onWebSocketError: (event) => {
                    console.error("[WebSocket ERROR]", event);
                },
                onWebSocketClose: (event) => {
                    console.warn("[WebSocket CLOSED]", event);
                },
            });

            console.log("[WebSocket] Activating STOMP client...");
            stompClient.activate();
        } catch (err) {
            console.error("[WebSocket] Connection failed:", err);
        }
    };

    // Sending a message
    const handleSend = () => {
        if (!input.trim() || !stompClient?.connected) {
            console.warn("[Chat] Cannot send message. Disconnected or empty input.");
            return;
        }

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);

        stompClient.publish({
            destination: "/app/chat",
            body: JSON.stringify({ text: input }),
        });

        setInput("");
    };

    // Enter to send
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="mt-5">
            <div className="flex flex-col h-[80vh] mx-auto border border-gray-800 rounded-xl shadow-md bg-gray-900 text-white">
                {/* Message Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`rounded-lg px-4 py-3 max-w-[80%] whitespace-pre-wrap ${
                                msg.sender === "user"
                                    ? "ml-auto bg-blue-700 text-right"
                                    : "mr-auto bg-gray-700 text-left"
                            }`}
                        >
                            {msg.text}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex items-end p-4 border-t border-gray-800 bg-gray-950">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="flex-1 resize-none bg-gray-800 text-white border border-gray-700 rounded-xl p-3 mr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};
