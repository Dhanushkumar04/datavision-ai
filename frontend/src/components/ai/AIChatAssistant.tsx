import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RotateCcw
} from 'lucide-react';
import { ChatMessage } from '../../types/ai';
import { ThemeConfig } from '../../types/dashboard';
import { ParsedDataset, ColumnProfile } from '../../types/dataset';
import { processNaturalLanguageQuery } from '../../services/nlQueryEngine';

interface AIChatAssistantProps {
  dataset: ParsedDataset;
  profiles: Record<string, ColumnProfile>;
  theme: ThemeConfig;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  dataset,
  profiles,
  theme,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial welcome message with suggestions
    const initialAnswer = processNaturalLanguageQuery('Summarize findings', dataset, profiles);
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Hello! I am your **DataVision AI Analytics Copilot**. I have analyzed **${dataset.meta.name}** (${dataset.meta.rowCount.toLocaleString()} rows). Ask me anything about your metrics, segment performance, or anomalies.`,
        suggestedFollowUps: [
          'What is our total revenue?',
          'Show me top 5 products by sales',
          'Are there any outliers in the data?',
          'What is the average transaction value?',
        ],
      },
      initialAnswer,
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: queryText.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    // Simulate responsive analytical thinking
    setTimeout(() => {
      const assistantResponse = processNaturalLanguageQuery(queryText, dataset, profiles);
      setMessages(prev => [...prev, assistantResponse]);
      setIsThinking(false);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendQuery(inputQuery);
    }
  };

  return (
    <div className={`rounded-2xl border flex flex-col h-[650px] shadow-xl overflow-hidden ${theme.cardClass} ${theme.borderClass}`}>
      {/* Copilot Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold flex items-center gap-1.5 ${theme.textPrimaryClass}`}>
              AI Analytics Copilot
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-500 font-bold">
                Online
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Natural Language Dataset Query Engine
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const initialAnswer = processNaturalLanguageQuery('Summarize findings', dataset, profiles);
            setMessages([initialAnswer]);
          }}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                isUser 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-cyan-400 border border-slate-700'
              }`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs space-y-2 ${
                isUser 
                  ? 'bg-blue-600 text-white shadow-md rounded-tr-xs' 
                  : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-sm'
              }`}>
                <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-0.5">
                  <span className="font-bold">{isUser ? 'You' : 'DataVision Copilot'}</span>
                  <span className="font-mono">{msg.timestamp}</span>
                </div>

                {/* Text Content */}
                <div className="leading-relaxed whitespace-pre-line font-sans">
                  {msg.text}
                </div>

                {/* Embedded Visual Metric Card */}
                {msg.visualData && msg.visualData.type === 'metric' && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 my-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500 uppercase">{msg.visualData.title}</span>
                    <span className="text-lg font-extrabold font-mono text-blue-600 dark:text-cyan-400">
                      {msg.visualData.highlightValue}
                    </span>
                  </div>
                )}

                {/* Embedded Visual Comparison List */}
                {msg.visualData && (msg.visualData.type === 'comparison' || msg.visualData.type === 'list') && msg.visualData.items && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 my-1.5 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {msg.visualData.title}
                    </div>
                    {msg.visualData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-100 dark:border-slate-800 last:border-none">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{item.label}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
                          {item.secondary && (
                            <span className="text-[10px] text-slate-400">{item.secondary}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Follow-ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Suggested Questions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendQuery(prompt)}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-cyan-400 border border-blue-500/20 transition-all text-left cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic font-mono pl-10">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-500" />
            Analyzing dataset schema & computing aggregations...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask a question about your dataset (e.g. 'Show top 5 products', 'Total revenue')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans shadow-xs"
          />
          <button
            onClick={() => handleSendQuery(inputQuery)}
            disabled={!inputQuery.trim() || isThinking}
            className="absolute right-2 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
