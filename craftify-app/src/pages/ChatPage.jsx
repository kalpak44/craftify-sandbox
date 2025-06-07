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
    const scrollRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated) connectWebSocket();
        return () => {
            if (stompClient?.connected) stompClient.deactivate();
        };
    }, [isAuthenticated]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const connectWebSocket = async () => {
        if (stompClient?.connected) return;

        try {
            const token = await getAccessTokenSilently();
            stompClient = new Client({
                webSocketFactory: () => new WebSocket("ws://localhost:8080/ws-native"),
                connectHeaders: { Authorization: `Bearer ${token}` },
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
                                return [...prev, { text: fragment, sender: "ai" }];
                            });
                        } else {
                            bufferRef.current += fragment;
                            setMessages((prev) => {
                                const updated = [...prev];
                                const index = streamingIndexRef.current;
                                if (index !== null && updated[index]) {
                                    updated[index].text = bufferRef.current;
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
        setMessages((prev) => [...prev, { text: input, sender: "user" }]);

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
        <div style={{ marginTop: "1rem", backgroundColor: "#0f0f0f", color: "#eee", height: "100vh" }}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%", margin: "0 auto", border: "1px solid #222" }}>
                {/* Message History */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            style={{
                                marginBottom: "1rem",
                                backgroundColor: msg.sender === "user" ? "#1e3a5f" : "#1a1a1a",
                                color: "#f1f1f1",
                                padding: "12px 16px",
                                borderRadius: "12px",
                                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                                maxWidth: "75%",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                            }}
                        >
                            <div style={{
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                marginBottom: "6px",
                                color: msg.sender === "user" ? "#90cdf4" : "#ccc"
                            }}>
                                {msg.sender === "user" ? "You" : "AI"}
                            </div>
                            <pre style={{
                                whiteSpace: "pre-wrap",
                                margin: 0,
                                lineHeight: "1.4",
                                fontSize: "0.95rem"
                            }}>
                                {msg.text}
                            </pre>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: "1rem", borderTop: "1px solid #333", backgroundColor: "#181818" }}>
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
                                borderRadius: "8px",
                                padding: "12px",
                                height: "60px",
                                resize: "none",
                                fontSize: "1rem"
                            }}
                        />
                        <button
                            onClick={handleSend}
                            style={{
                                width: "120px",
                                height: "60px",
                                backgroundColor: "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "1rem",
                                transition: "background-color 0.2s ease-in-out"
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1e40af")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
