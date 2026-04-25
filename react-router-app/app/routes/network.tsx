import { useEffect, useState } from "react";
import { Users, MessageCircle, UserPlus, TrendingUp, Award } from "lucide-react";
import { useLoaderData } from "react-router";

import { apiGet, apiPost } from "../lib/api";
import type { NetworkResponse } from "../types/api";

export async function loader() {
  return apiGet<NetworkResponse>("/api/network");
}

export default function Network() {
  const data = useLoaderData() as NetworkResponse;
  const [activeTab, setActiveTab] = useState("All Connections");
  const [connections, setConnections] = useState(data.connections);
  const [suggested, setSuggested] = useState(data.suggestedConnections);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    setConnections(data.connections);
    setSuggested(data.suggestedConnections);
  }, [data.connections, data.suggestedConnections]);

  const typeColors: Record<string, string> = {
    Mentor: "bg-purple-100 text-purple-700",
    Alumni: "bg-green-100 text-green-700",
    Peer: "bg-blue-100 text-blue-700",
  };

  const filteredConnections =
    activeTab === "All Connections"
      ? connections
      : connections.filter((connection) => connection.type === activeTab.replace(/s$/, ""));

  async function sendMessage(connectionId: string) {
    const message = (messageDrafts[connectionId] || "").trim();

    if (!message) {
      return;
    }

    setSendingTo(connectionId);

    try {
      const updated = await apiPost<NetworkResponse["connections"][number]>(
        `/api/network/connections/${connectionId}/message`,
        { message },
      );
      setConnections((current) =>
        current.map((connection) =>
          connection.id === connectionId ? updated : connection,
        ),
      );
      setMessageDrafts((current) => ({ ...current, [connectionId]: "" }));
    } finally {
      setSendingTo(null);
    }
  }

  async function connect(connectionId: string) {
    setConnectingId(connectionId);

    try {
      const updated = await apiPost<NetworkResponse["suggestedConnections"][number]>(
        `/api/network/suggested/${connectionId}/connect`,
      );
      setSuggested((current) =>
        current.map((connection) =>
          connection.id === connectionId ? updated : connection,
        ),
      );
    } finally {
      setConnectingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">Network</h1>
          <p className="text-gray-600">Connect with mentors, alumni, and peers.</p>
        </div>
        <button
          onClick={() => setActiveTab("Suggested")}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <UserPlus className="h-4 w-4" /> Find Connections
        </button>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Connections",
            value: String(data.stats.totalConnections),
            icon: <Users className="h-5 w-5 text-indigo-600" />,
          },
          {
            label: "Mentors",
            value: String(data.stats.mentors),
            icon: <Award className="h-5 w-5 text-purple-600" />,
          },
          {
            label: "Alumni",
            value: String(data.stats.alumni),
            icon: <TrendingUp className="h-5 w-5 text-green-600" />,
          },
          {
            label: "Active Chats",
            value: String(data.stats.activeChats),
            icon: <MessageCircle className="h-5 w-5 text-blue-600" />,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-3">
              {stat.icon}
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
            <div className="text-2xl font-semibold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex gap-3">
        {["All Connections", "Mentors", "Alumni", "Peers", "Suggested"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {activeTab === "Suggested"
            ? suggested.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(connection.name)}`}
                    alt={connection.name}
                    className="h-14 w-14 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{connection.name}</div>
                    <div className="text-sm text-gray-600">
                      {connection.role} • {connection.company}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {connection.mutual} mutual connections
                    </div>
                  </div>
                  <button
                    onClick={() => void connect(connection.id)}
                    disabled={connection.connected || connectingId === connection.id}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                      connection.connected
                        ? "border border-green-200 bg-green-50 text-green-600"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    {connection.connected ? "Connected" : "Connect"}
                  </button>
                </div>
              ))
            : filteredConnections.map((connection) => (
                <div
                  key={connection.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 flex items-start gap-4">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(connection.name)}`}
                      alt={connection.name}
                      className="h-16 w-16 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{connection.name}</h3>
                          <p className="text-sm text-gray-600">
                            {connection.role} • {connection.company}
                          </p>
                        </div>
                        <span
                          className={`rounded px-2 py-1 text-xs ${
                            typeColors[connection.type] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {connection.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Connected {connection.date} • {connection.mutual} mutual connections
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {connection.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageDrafts[connection.id] || connection.message || ""}
                      onChange={(event) =>
                        setMessageDrafts((current) => ({
                          ...current,
                          [connection.id]: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          void sendMessage(connection.id);
                        }
                      }}
                      placeholder={`Message ${connection.name.split(" ")[0]}...`}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => void sendMessage(connection.id)}
                      disabled={sendingTo === connection.id}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {sendingTo === connection.id ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 font-semibold">Suggested Connections</h3>
            <div className="space-y-4">
              {suggested.map((connection) => (
                <div key={connection.id} className="flex items-start gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(connection.name)}`}
                    alt={connection.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{connection.name}</div>
                    <div className="text-xs text-gray-600">
                      {connection.role} • {connection.company}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {connection.mutual} mutual
                    </div>
                    <button
                      onClick={() => void connect(connection.id)}
                      disabled={connection.connected || connectingId === connection.id}
                      className={`mt-2 rounded border px-3 py-1 text-xs transition-colors ${
                        connection.connected
                          ? "border-green-200 bg-green-50 text-green-600"
                          : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                      }`}
                    >
                      {connection.connected ? "Connected" : "Connect"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
