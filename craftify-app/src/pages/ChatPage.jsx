import React, {useEffect, useRef, useState} from "react";
import {Client} from "@stomp/stompjs";
import {useAuth0} from "@auth0/auth0-react";

let stompClient = null;

export const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const {getAccessTokenSilently, isAuthenticated} = useAuth0();

    const bufferRef = useRef("");
    const streamingRef = useRef(false);
    const streamingIndexRef = useRef(null);

    const jobBufferRef = useRef("");
    const jobStreamingRef = useRef(false);
    const jobStreamingIndexRef = useRef(null);

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
                debug: (str) => console.log("[STOMP DEBUG]:", str),
                reconnectDelay: 5000,
                onConnect: () => {
                    stompClient.subscribe("/topic/messages", (message) => {
                        const fragment = message.body;

                        if (fragment === "[END]") {
                            resetStreamingState();
                            return;
                        }

                        const isJobLog = fragment.includes("👷") || fragment.includes("✅") || fragment.includes("❌");

                        if (isJobLog) {
                            if (!jobStreamingRef.current) {
                                jobStreamingRef.current = true;
                                jobBufferRef.current = fragment;

                                setMessages((prev) => {
                                    const newIndex = prev.length;
                                    jobStreamingIndexRef.current = newIndex;
                                    return [...prev, {sender: "job", text: fragment}];
                                });
                            } else {
                                jobBufferRef.current += "\n" + fragment;
                                setMessages((prev) => {
                                    const updated = [...prev];
                                    const index = jobStreamingIndexRef.current;
                                    if (index !== null && updated[index]) {
                                        updated[index] = {
                                            ...updated[index],
                                            text: jobBufferRef.current,
                                        };
                                    }
                                    return updated;
                                });
                            }
                            return;
                        }

                        // 🤖 обычный AI-бот
                        if (!streamingRef.current) {
                            streamingRef.current = true;
                            bufferRef.current = fragment;

                            setMessages((prev) => {
                                const newIndex = prev.length;
                                streamingIndexRef.current = newIndex;
                                return [...prev, {sender: "bot", text: fragment}];
                            });
                        } else {
                            bufferRef.current += fragment;
                            setMessages((prev) => {
                                const updated = [...prev];
                                const index = streamingIndexRef.current;
                                if (index !== null && updated[index]) {
                                    updated[index] = {
                                        ...updated[index],
                                        text: bufferRef.current,
                                    };
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

        jobBufferRef.current = "";
        jobStreamingRef.current = false;
        jobStreamingIndexRef.current = null;
    };

    const handleSend = () => {
        if (!input.trim() || !stompClient?.connected) return;

        // ✅ Всегда сбрасываем ВСЕ streaming-состояния перед отправкой
        resetStreamingState();

        const userMessage = {sender: "user", text: input};
        setMessages((prev) => [...prev, userMessage]);

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
        <div className="mt-5">
            <div
                className="flex flex-col h-[80vh] mx-auto border border-gray-800 rounded-xl shadow-md bg-gray-900 text-white">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`rounded-lg px-4 py-3 max-w-[80%] whitespace-pre-wrap font-mono ${
                                msg.sender === "user"
                                    ? "ml-auto bg-blue-700 text-right"
                                    : msg.sender === "bot"
                                        ? "mr-auto bg-gray-700 text-left"
                                        : "mr-auto bg-black text-green-400 text-left border border-green-600"
                            }`}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>

                {/* Input */}
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
