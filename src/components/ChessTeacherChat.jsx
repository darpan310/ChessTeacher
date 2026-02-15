import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  CHESS_TEACHER_PROMPT_VERSION,
  buildChessTeacherSystemPrompt,
} from "../config/chessTeacherPrompt";

const DEFAULT_MODEL = "gpt-5.1";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";

function buildContextText(context) {
  if (!context || typeof context !== "object") return "";
  try {
    return JSON.stringify(context, null, 2);
  } catch {
    return String(context);
  }
}

export function ChessTeacherChat({
  context,
  apiKey = import.meta.env.VITE_OPENAI_API_KEY,
  model = import.meta.env.VITE_OPENAI_MODEL || DEFAULT_MODEL,
  baseUrl = import.meta.env.VITE_OPENAI_BASE_URL || DEFAULT_BASE_URL,
}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask me about this position, opening ideas, tactical motifs, or move plans. I will use the current board context.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  const contextText = useMemo(() => buildContextText(context), [context]);
  const isConfigured = Boolean(apiKey && model);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt || isLoading) return;
    if (!isConfigured) {
      setError("Missing OpenAI config. Set VITE_OPENAI_API_KEY and VITE_OPENAI_MODEL.");
      return;
    }

    const userMsg = { id: `u-${Date.now()}`, role: "user", content: prompt };
    const streamAssistantId = `a-${Date.now()}`;
    const nextMessages = [...messages, userMsg, { id: streamAssistantId, role: "assistant", content: "" }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const systemPrompt = buildChessTeacherSystemPrompt();

      const apiMessages = [
        { role: "system", content: systemPrompt },
        { role: "system", content: `Prompt version: ${CHESS_TEACHER_PROMPT_VERSION}` },
        ...(contextText
          ? [{ role: "system", content: `Current board context:\n${contextText}` }]
          : []),
        ...nextMessages.map((msg) => ({ role: msg.role, content: msg.content })),
      ];

      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature: 0.3,
          stream: true,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed (${response.status})`);
      }

      if (!response.body) {
        throw new Error("Streaming response body is unavailable.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      let receivedText = "";

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        buffer += decoder.decode(value || new Uint8Array(), { stream: !streamDone });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const lines = event
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const data = line.replace(/^data:\s*/, "");
            if (data === "[DONE]") {
              done = true;
              break;
            }
            let json = null;
            try {
              json = JSON.parse(data);
            } catch {
              json = null;
            }
            if (!json) continue;

            const delta =
              json?.choices?.[0]?.delta?.content ??
              json?.choices?.[0]?.message?.content ??
              "";
            if (!delta) continue;
            receivedText += delta;
            setMessages((prev) =>
              prev.map((msg) => (msg.id === streamAssistantId ? { ...msg, content: receivedText } : msg))
            );
          }
        }
      }

      const finalText = receivedText.trim();
      if (!finalText) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === streamAssistantId ? { ...msg, content: "I couldn't generate a response for this prompt." } : msg
          )
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Chat request failed.";
      setError(msg);
      setMessages((prev) => prev.filter((item) => item.id !== streamAssistantId));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="coach-card chat-card">

      <div className="chat-messages" ref={listRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-row ${msg.role}`}>
            <div className={`chat-message ${msg.role}`}>
              {msg.role === "assistant" ? (
                <div className="chat-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="chat-text">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading ? <p className="chat-loading">Streaming response...</p> : null}
      </div>

      {error ? <p className="chat-error">{error}</p> : null}

      <div className="chat-input-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendMessage();
            }
          }}
          placeholder={isConfigured ? "Ask about this position..." : "Set OpenAI env vars to enable chat"}
          disabled={!isConfigured || isLoading}
        />
        <button onClick={() => void sendMessage()} disabled={!isConfigured || isLoading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
