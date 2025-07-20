import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";

/**
 * Live log hook for registration process, using a Bearer token for secure STOMP connection.
 */
export function useRegistrationLogs({ registrationId, getToken, onRegistered }) {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState("idle"); // idle | in-progress | success | error
    const [error, setError] = useState(null);
    const clientRef = useRef(null);

    const reset = useCallback(() => {
        setLogs([]);
        setStatus("idle");
        setError(null);
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!registrationId) {
            reset();
            return;
        }
        let unsub = null;
        let isMounted = true;

        async function connect() {
            setStatus("in-progress");
            setLogs(["Connecting to log server (STOMP)..."]);
            setError(null);

            try {
                const token = await getToken();
                const wsUrl = `${import.meta.env.VITE_WS_API_HOST || "ws://localhost:8080"}/ws-native`;

                const client = new Client({
                    brokerURL: wsUrl,
                    reconnectDelay: 5000,
                    connectHeaders: { Authorization: `Bearer ${token}` },
                    onConnect: () => {
                        if (!isMounted) return;
                        setLogs(prev => [...prev, "[connected]"]);
                        unsub = client.subscribe(
                            `/topic/registration/${registrationId}`,
                            (message) => {
                                try {
                                    const parsed = JSON.parse(message.body);
                                    let logMsg = parsed.message || parsed.log || parsed.step || message.body;
                                    if (parsed.status === "success") {
                                        setStatus("success");
                                        setLogs(prev => [...prev, logMsg, "[success] Registration complete!"]);
                                        if (onRegistered) onRegistered();
                                    } else if (parsed.status === "error") {
                                        setStatus("error");
                                        setLogs(prev => [...prev, logMsg, `[error] ${parsed.error || 'Registration failed'}`]);
                                        setError(parsed.error || "Registration failed");
                                    } else {
                                        setLogs(prev => [...prev, logMsg]);
                                    }
                                } catch {
                                    setLogs(prev => [...prev, message.body]);
                                }
                            }
                        );
                    },
                    onStompError: (frame) => {
                        setStatus("error");
                        setLogs(prev => [...prev, "[error] " + (frame.headers.message || "STOMP error.")]);
                        setError(frame.headers.message || "STOMP error.");
                    }
                });

                client.activate();
                clientRef.current = client;
            } catch (e) {
                setStatus("error");
                setError(e.message || "WebSocket connect failed");
                setLogs(prev => [...prev, `[error] ${e.message || "WebSocket connect failed"}`]);
            }
        }

        connect();

        return () => {
            isMounted = false;
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
            if (unsub) unsub.unsubscribe();
        };
    }, [registrationId, getToken, onRegistered, reset]);

    return { logs, status, error, reset };
}
