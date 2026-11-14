import { useState } from "react";

type ChatPanelProps = {
  onClose: () => void; // Changed from onLeave to onClose for the panel specifically
};

export default function MessagePanel({ onClose }: ChatPanelProps) {
  const [message, setMessage] = useState("");

  const handleSend = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;
    // Add send logic here later
    setMessage("");
  };

  return (
    <div className="flex h-full w-80 flex-col rounded-2xl bg-[#1e1e20] text-white">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-medium">In-call messages</h2>
        <button
          onClick={onClose}
          className="rounded-full p-2 hover:bg-[#2a2a2d] transition-colors"
          aria-label="Close chat panel"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
          </svg>
        </button>
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 rounded-lg bg-[#2a2a2d] p-3 text-center text-xs leading-relaxed text-gray-300">
          Messages can only be seen by people in the call and are deleted when
          the call ends.
        </div>
        
        {/* Placeholder for future messages */}
        <div className="flex flex-col gap-4 mt-6">
           {/* Example Message 
           <div className="flex flex-col">
             <span className="text-xs font-medium text-gray-400">You • 9:30 PM</span>
             <span className="text-sm mt-1">Ready when you are :)</span>
           </div>
           */}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 pt-2">
        <form 
          onSubmit={handleSend}
          className="flex items-end gap-2 rounded-xl bg-[#2a2a2d] p-1 focus-within:ring-1 focus-within:ring-[#a8c7fa]"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a message"
            className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-gray-400 outline-none"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="mb-1 mr-1 rounded-full p-2 text-[#a8c7fa] hover:bg-[#3f3f42] disabled:text-gray-500 disabled:hover:bg-transparent transition-colors"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}