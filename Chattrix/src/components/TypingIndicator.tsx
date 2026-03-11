import './TypingIndicator.css';

export default function TypingIndicator() {
  return (
    <div className="typing-indicator-wrapper">
      <div className="typing-indicator">
        <span className="typing-dot dot-1" />
        <span className="typing-dot dot-2" />
        <span className="typing-dot dot-3" />
      </div>
    </div>
  );
}
