import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useAuth0 } from "@auth0/auth0-react";

let stompClient = null;

export const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();

    const bufferRef = useRef("");
    const streamingRef = useRef(false);
    const streamingIndexRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated) {
            connectWebSocket();
        }

        return () => {
            if (stompClient?.connected) {
                stompClient.deactivate();
            }
        };
    }, [isAuthenticated]);

    const connectWebSocket = async () => {
        if (stompClient?.connected) return;

        try {
            const token = await getAccessTokenSilently();

            stompClient = new Client({
                webSocketFactory: () => new WebSocket("ws://localhost:8080/ws-native"),
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                reconnectDelay: 5000,
                onConnect: () => {
                    stompClient.subscribe("/topic/messages", (message) => {
                        const fragment = message.body;

                        if (fragment === "[END]") {
                            resetStreamingState();
                            return;
                        }

                        if (!streamingRef.current) {
                            streamingRef.current = true;
                            bufferRef.current = fragment;

                            setMessages((prev) => {
                                const newIndex = prev.length;
                                streamingIndexRef.current = newIndex;
                                return [...prev, fragment];
                            });
                        } else {
                            bufferRef.current += fragment;
                            setMessages((prev) => {
                                const updated = [...prev];
                                const index = streamingIndexRef.current;
                                if (index !== null && updated[index]) {
                                    updated[index] = bufferRef.current;
                                }
                                return updated;
                            });
                        }
                    });
                },
            });

            stompClient.activate();
        } catch (err) {
            console.error("WebSocket error:", err);
        }
    };

    const resetStreamingState = () => {
        bufferRef.current = "";
        streamingRef.current = false;
        streamingIndexRef.current = null;
    };

    const handleSend = () => {
        if (!input.trim() || !stompClient?.connected) return;

        resetStreamingState();
        setMessages((prev) => [...prev, input]);

        stompClient.publish({
            destination: "/app/chat",
            body: input,
        });

        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{ marginTop: "1rem", backgroundColor: "#111", color: "#eee", height: "100vh" }}>
            <div style={{ display: "flex", flexDirection: "column", height: "90vh", border: "1px solid #333" }}>
                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1rem", backgroundColor: "#111" }}>
                    {messages.map((text, idx) => (
                        <pre key={idx} style={{ whiteSpace: "pre-wrap", marginBottom: "1rem" }}>
                            {text}
                        </pre>
                    ))}
                </div>

                {/* Input Area */}
                <div
                    style={{
                        padding: "1rem",
                        borderTop: "1px solid #333",
                        backgroundColor: "#1a1a1a",
                    }}
                >
                    <div style={{ display: "flex", gap: "10px" }}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            style={{
                                flex: 1,
                                backgroundColor: "#222",
                                color: "#fff",
                                border: "1px solid #444",
                                borderRadius: "6px",
                                padding: "10px",
                                height: "50px",
                                resize: "none",
                            }}
                        />
                        <button
                            onClick={handleSend}
                            style={{
                                width: "120px",
                                height: "50px",
                                backgroundColor: "#333",
                                color: "#fff",
                                border: "1px solid #555",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
