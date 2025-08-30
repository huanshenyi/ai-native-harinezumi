"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, addToolResult } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "getStaffSchedule") {
        addToolResult({
          tool: "getStaffSchedule",
          toolCallId: toolCall.toolCallId,
          output: toolCall.input,
        });
      }
    },
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === "user" ? "User: " : "AI: "}
          {m.parts.map((part, index) => {
            if (part.type === "text") {
              return <span key={`${m.id}-text-${index}`}>{part.text}</span>;
            }
            if (part.type === "tool-getStaffSchedule") {
              const callId = part.toolCallId;
              switch (part.state) {
                case "input-streaming":
                  return (
                    <div
                      key={callId}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">
                        Preparing schedule request...
                      </span>
                    </div>
                  );
                case "input-available":
                  return (
                    <div
                      key={callId}
                      className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-blue-700 font-medium">
                        Fetching staff schedule...
                      </span>
                    </div>
                  );
                case "output-available":
                  return (
                    <div
                      key={callId}
                      className="p-4 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="text-green-800 font-semibold mb-2">
                        📅 Staff Schedule
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">
                            Date:
                          </span>
                          <span className="px-2 py-1 bg-white rounded border">
                            {
                              (
                                part.input as {
                                  date: string;
                                  staffName?: string;
                                }
                              ).date
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">
                            Staff:
                          </span>
                          <span className="px-2 py-1 bg-white rounded border">
                            {(
                              part.input as { date: string; staffName?: string }
                            ).staffName || "All Staff"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                case "output-error":
                  return (
                    <div
                      key={callId}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="text-red-800 font-medium">❌ Error</div>
                      <div className="text-red-700 text-sm mt-1">
                        {part.errorText}
                      </div>
                    </div>
                  );
              }
            }
            return null;
          })}
        </div>
      ))}

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          sendMessage({
            role: "user",
            parts: [{ type: "text", text: input }],
          });
          setInput("");
        }}
        className="fixed bottom-0 w-full max-w-md mb-8 border border-gray-300 rounded shadow-xl"
      >
        <input
          className="w-full p-2"
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </div>
  );
}
