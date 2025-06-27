import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";

const useWebSocket = (getToken) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const stompClientRef = useRef(null);
  const bufferRef = useRef("");
  const streamingRef = useRef(false);
  const streamingIndexRef = useRef(null);

  const resetStreamingState = useCallback(() => {
    bufferRef.current = "";
    streamingRef.current = false;
    streamingIndexRef.current = null;
    setIsLoading(false);
  }, []);

  const connectWebSocket = useCallback(async () => {
    if (stompClientRef.current?.connected) {
      setIsConnected(true);
      return;
    }

    try {
      const token = await getToken();

      stompClientRef.current = new Client({
        webSocketFactory: () => new WebSocket("ws://localhost:8080/ws-native"),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        onConnect: () => {
          setIsConnected(true);

          stompClientRef.current.subscribe("/topic/messages", (message) => {
            const fragment = message.body;

            if (fragment === "[END]") {
              resetStreamingState();
              return;
            }

            if (!streamingRef.current) {
              streamingRef.current = true;
              bufferRef.current = fragment;
              setIsLoading(false); // Hide "AI is thinking" when response starts
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
        onStompError: (frame) => {
          console.error("STOMP error:", frame);
          setIsConnected(false);
        },
        onWebSocketClose: () => {
          setIsConnected(false);
        },
      });

      stompClientRef.current.activate();
    } catch (err) {
      console.error("WebSocket error:", err);
      setIsConnected(false);
    }
  }, [getToken, resetStreamingState]);

  const disconnectWebSocket = useCallback(() => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.deactivate();
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (!stompClientRef.current?.connected || !message.trim()) return;

    resetStreamingState();
    setIsLoading(true);

    setMessages((prev) => [...prev, { text: message, sender: "user" }]);

    stompClientRef.current.publish({
      destination: "/app/chat",
      body: message,
    });
  }, [resetStreamingState]);

  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  return {
    isConnected,
    messages,
    isLoading,
    connectWebSocket,
    disconnectWebSocket,
    sendMessage,
  };
};

export default useWebSocket;
