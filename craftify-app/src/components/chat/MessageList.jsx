import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import MessageItem from "./MessageItem";

const MessageList = ({ messages }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="message-history">
      {messages.length === 0 ? (
        <div className="empty-chat">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <MessageItem key={idx} message={msg} />
        ))
      )}
      <div ref={scrollRef} />
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      sender: PropTypes.oneOf(["user", "ai"]).isRequired,
    })
  ).isRequired,
};

export default MessageList;