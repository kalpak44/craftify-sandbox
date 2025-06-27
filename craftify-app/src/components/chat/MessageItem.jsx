import PropTypes from "prop-types";

const MessageItem = ({ message }) => {
  const { text, sender } = message;
  const isUser = sender === "user";

  return (
    <div className={`message ${isUser ? "message-user" : "message-ai"}`}>
      <div className={`message-sender ${isUser ? "message-sender-user" : "message-sender-ai"}`}>
        {isUser ? "You" : "AI"}
      </div>
      <pre className="message-content">{text}</pre>
    </div>
  );
};

MessageItem.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string.isRequired,
    sender: PropTypes.oneOf(["user", "ai"]).isRequired,
  }).isRequired,
};

export default MessageItem;
