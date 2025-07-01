import { useState } from "react";
import PropTypes from "prop-types";

const ChatInput = ({ onSendMessage, isConnected }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || !isConnected) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-area">
      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="message-input"
          disabled={!isConnected}
        />
        <button
          onClick={handleSend}
          className={`send-button ${!isConnected || !input.trim() ? "send-button-disabled" : ""}`}
          disabled={!isConnected || !input.trim()}
        >
          Send
        </button>
      </div>
      {!isConnected && (
        <div className="connection-status">
          Connecting to chat server...
        </div>
      )}
    </div>
  );
};

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  isConnected: PropTypes.bool.isRequired,
};

export default ChatInput;