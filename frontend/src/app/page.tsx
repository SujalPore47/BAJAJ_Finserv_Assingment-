"use client";
import { useState, useEffect, useRef } from "react";
import { Send, TrendingUp, PiggyBank, Sparkles, MoreHorizontal } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

// Type for a single message object from the backend's "messages" array
type BackendMessage = {
  id: string;
  type: 'human' | 'ai' | 'tool';
  content: string;
  tool_calls?: any[];
  name?: string;
  response_metadata?: any;
};

// The message object used for rendering in the UI
type UIMessage = {
  id: string; // Unique ID for React key
  sender: 'user' | 'bot';
  text: string; // The content to display
  details?: BackendMessage[]; // Store the array of backend messages for this turn
};

const Modal = ({ content, onClose }: { content: BackendMessage[], onClose: () => void }) => {
  const getMessageIcon = (type: string) => {
    if (type === 'human') return '👤';
    if (type === 'ai') return '🤖';
    if (type === 'tool') return '🔧';
    return '📝';
  };

  const getMessageBadge = (type: string) => {
    const badges = {
      human: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
      ai: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
      tool: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200'
    };
    return badges[type as keyof typeof badges] || 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-900">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Conversation Flow</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Detailed view of the message chain</p>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {content.map((msg, index) => (
              <div key={msg.id} className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl text-slate-700 dark:text-slate-200">{getMessageIcon(msg.type)}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getMessageBadge(msg.type)}`}>
                      {msg.type.toUpperCase()}
                    </span>
                    {msg.name && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        {msg.name}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Step {index + 1}</span>
                </div>
                
                {msg.content && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Content:</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                )}

                {msg.tool_calls && msg.tool_calls.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Tool Calls:</p>
                    <div className="space-y-2">
                      {msg.tool_calls.map((tool, i) => (
                        <div key={i} className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-purple-700 dark:text-purple-200 font-semibold text-sm">{tool.name}</span>
                            <span className="text-xs text-purple-600 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded">
                              {tool.type}
                            </span>
                          </div>
                          {tool.args && (
                            <div className="text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/80 p-2 rounded border border-purple-100 dark:border-purple-800/60">
                              <span className="font-semibold">Args:</span> {JSON.stringify(tool.args, null, 2)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {msg.response_metadata && Object.keys(msg.response_metadata).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Metadata:</p>
                    <div className="bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      {msg.response_metadata.model_name && (
                        <div className="text-xs mb-1 text-slate-700 dark:text-slate-300">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">Model:</span>{' '}
                          <span className="text-slate-600 dark:text-slate-300">{msg.response_metadata.model_name}</span>
                        </div>
                      )}
                      {msg.response_metadata.finish_reason && (
                        <div className="text-xs mb-1 text-slate-700 dark:text-slate-300">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">Finish Reason:</span>{' '}
                          <span className="text-slate-600 dark:text-slate-300">{msg.response_metadata.finish_reason}</span>
                        </div>
                      )}
                      {(msg as any).usage_metadata && (
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">Tokens:</span>{' '}
                          <span className="text-slate-600 dark:text-slate-300">
                            {(msg as any).usage_metadata.input_tokens} in / {(msg as any).usage_metadata.output_tokens} out
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button 
            onClick={onClose} 
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="flex flex-col items-start animate-slide-up">
    <div className="flex items-start gap-3 w-full max-w-2xl">
      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
      <div className="flex-1 space-y-3 bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-3/4 h-3 bg-slate-200 dark:bg-slate-700/80 rounded animate-pulse"></div>
        <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-700/80 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [modalContent, setModalContent] = useState<BackendMessage[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length === 0) {
      inputRef.current?.focus();
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage: UIMessage = { id: uuidv4(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await response.json();
      
      const botMessage: UIMessage = {
        id: uuidv4(),
        sender: "bot",
        text: data.messages[data.messages.length - 1].content,
        details: data.messages, // Store the full details
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      const errorMessage: UIMessage = {
        id: uuidv4(),
        sender: "bot",
        text: "Sorry, something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full px-4 animate-fade-in">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-3xl shadow-lg">
          <TrendingUp className="w-16 h-16 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
        </div>
      </div>
      <h1 className="text-4xl font-semibold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">Financial Assistant</h1>
      <p className="text-slate-500 dark:text-slate-400 text-lg mb-12 max-w-md text-center">Ask me anything about budgeting, investing, or financial planning</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        {[
          { icon: <PiggyBank className="w-5 h-5" />, text: "How can I start saving for retirement?" },
          { icon: <TrendingUp className="w-5 h-5" />, text: "Explain index funds vs mutual funds" },
          { icon: <Sparkles className="w-5 h-5" />, text: "Create a monthly budget template" },
        ].map((suggestion, i) => (
          <button key={i} onClick={() => setInput(suggestion.text)} className="group flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-300 text-left hover:-translate-y-1">
            <div className="text-emerald-600 dark:text-emerald-400 mt-0.5 group-hover:scale-110 transition-transform duration-300">{suggestion.icon}</div>
            <span className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <main className="flex flex-col h-[calc(100vh-81px)]">
      {modalContent && <Modal content={modalContent} onClose={() => setModalContent(null)} />}
      <div className={`flex-1 overflow-y-auto ${messages.length === 0 ? "flex items-center justify-center" : ""}`}>
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-2xl px-5 py-3.5 rounded-2xl transition-all duration-300 animate-slide-up ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-sm"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  {msg.sender === 'bot' && msg.details && msg.details.length > 1 && (
                    <div className="mt-2">
                      <button 
                        onClick={() => setModalContent(msg.details!)} 
                        className="w-7 h-7 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && <SkeletonLoader />}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>
      <div className={`border-t border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ${messages.length === 0 ? "sticky bottom-0" : ""}`}>
        <div className={`mx-auto px-6 py-6 transition-all duration-500 ${messages.length === 0 ? "max-w-3xl" : "max-w-4xl"}`}>
          <div className="relative group">
            <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSend()} className="w-full px-6 py-4 pr-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm hover:shadow-md" placeholder="Ask about budgeting, investing, or financial advice..." />
            <button onClick={handleSend} disabled={input.trim() === "" || isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300">
              <Send className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-3">AI can make mistakes. Verify important financial information.</p>
        </div>
      </div>
      <style jsx>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
      `}</style>
    </main>
  );
}
