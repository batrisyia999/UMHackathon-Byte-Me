import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  Edit3,
  X,
  Check,
} from "lucide-react";
import { useLoaderData } from "react-router";

import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";
import type { DocumentsResponse } from "../types/api";

export async function loader() {
  return apiGet<DocumentsResponse>("/api/documents");
}

export default function Documents() {
  const data = useLoaderData() as DocumentsResponse;
  const [activeCategory, setActiveCategory] = useState("All Documents");
  const [docs, setDocs] = useState(data.items);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [previewDoc, setPreviewDoc] = useState<DocumentsResponse["items"][number] | null>(
    null,
  );
  const [workingId, setWorkingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<string | null>(null);

  useEffect(() => {
    setDocs(data.items);
  }, [data.items]);

  const statusConfig: Record<
    string,
    { bg: string; border: string; text: string; label: string }
  > = {
    ready: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      label: "Ready",
    },
    "needs-update": {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      label: "Needs Update",
    },
    missing: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      label: "Missing",
    },
  };

  const categories = [
    "All Documents",
    "CV / Resume",
    "Academic",
    "Certifications",
    "Personal",
    "Others",
  ];

  const filtered =
    activeCategory === "All Documents"
      ? docs
      : activeCategory === "Others"
        ? docs.filter(
            (doc) =>
              !["CV / Resume", "Academic", "Certifications", "Personal"].includes(
                doc.category,
              ),
          )
        : docs.filter((doc) => doc.category === activeCategory);

  async function handleDelete(documentId: string) {
    const previous = docs;
    setWorkingId(documentId);
    setDocs((current) => current.filter((doc) => doc.id !== documentId));

    try {
      await apiDelete(`/api/documents/${documentId}`);
    } catch {
      setDocs(previous);
    } finally {
      setWorkingId(null);
    }
  }

  function handleDownload(doc: DocumentsResponse["items"][number]) {
    const content = JSON.stringify(doc, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = doc.title.replace(/\.[^.]+$/, "") + ".json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function startEdit(document: DocumentsResponse["items"][number]) {
    setEditingId(document.id);
    setEditValue(document.title);
  }

  async function saveEdit() {
    if (!editingId || !editValue.trim()) {
      return;
    }

    const previous = docs;
    setWorkingId(editingId);
    setDocs((current) =>
      current.map((doc) =>
        doc.id === editingId ? { ...doc, title: editValue.trim() } : doc,
      ),
    );

    try {
      const updated = await apiPatch<DocumentsResponse["items"][number]>(
        `/api/documents/${editingId}`,
        { title: editValue.trim() },
      );
      setDocs((current) =>
        current.map((doc) => (doc.id === editingId ? updated : doc)),
      );
      setEditingId(null);
    } catch {
      setDocs(previous);
    } finally {
      setWorkingId(null);
    }
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const targetId = uploadTargetRef.current;
    const sizeMB = file.size / (1024 * 1024);
    const sizeLabel =
      sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    setWorkingId(targetId ?? "new");

    try {
      if (targetId) {
        const updated = await apiPatch<DocumentsResponse["items"][number]>(
          `/api/documents/${targetId}`,
          {
            title: file.name,
            size: sizeLabel,
            uploadDate: today,
            status: "ready",
          },
        );

        setDocs((current) =>
          current.map((doc) => (doc.id === targetId ? updated : doc)),
        );
      } else {
        const created = await apiPost<DocumentsResponse["items"][number]>("/api/documents", {
          title: file.name,
          category: "Personal",
          size: sizeLabel,
          uploadDate: today,
          status: "ready",
        });

        setDocs((current) => [created, ...current]);
      }
    } finally {
      setWorkingId(null);
      uploadTargetRef.current = null;
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const stats = {
    totalDocuments: docs.length,
    ready: docs.filter((doc) => doc.status === "ready").length,
    needsUpdate: docs.filter((doc) => doc.status === "needs-update").length,
    missing: docs.filter((doc) => doc.status === "missing").length,
  };

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      {previewDoc ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">{previewDoc.title}</h3>
              <button onClick={() => setPreviewDoc(null)}>
                <X className="h-5 w-5 text-gray-500 hover:text-gray-900" />
              </button>
            </div>
            <div className="mb-4 flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
              <div className="text-center text-gray-400">
                <FileText className="mx-auto mb-2 h-16 w-16 text-indigo-200" />
                <p className="text-sm">Metadata preview</p>
                <p className="mt-1 text-xs">
                  {previewDoc.size} • {previewDoc.uploadDate}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(previewDoc)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Download className="h-4 w-4" /> Download
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.png,.jpg"
        onChange={(event) => void handleFileUpload(event.target.files)}
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">Documents</h1>
          <p className="text-gray-600">
            Manage and organize your application documents.
          </p>
        </div>
        <button
          onClick={() => {
            uploadTargetRef.current = null;
            fileInputRef.current?.click();
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Upload className="h-4 w-4" /> Upload Document
        </button>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: "Total Documents", value: stats.totalDocuments },
          { label: "Ready to Use", value: stats.ready },
          { label: "Needs Update", value: stats.needsUpdate },
          { label: "Missing", value: stats.missing },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-2 text-xs text-gray-500">{stat.label}</div>
            <div className="text-2xl font-semibold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              activeCategory === category
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400">
          No documents in this category.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const config = statusConfig[doc.status];
            const isEditing = editingId === doc.id;

            return (
              <div
                key={doc.id}
                className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(event) => setEditValue(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              void saveEdit();
                            }

                            if (event.key === "Escape") {
                              setEditingId(null);
                            }
                          }}
                          className="flex-1 rounded border border-indigo-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => void saveEdit()}
                          className="rounded p-1 text-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <h3 className="mb-1 truncate text-sm font-medium">{doc.title}</h3>
                    )}
                    <p className="text-xs text-gray-600">{doc.category}</p>
                  </div>
                </div>

                <div
                  className={`mb-4 flex items-center gap-2 rounded-full border px-3 py-1.5 ${config.bg} ${config.border} ${config.text}`}
                >
                  <span className="text-xs font-medium">{config.label}</span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Size</div>
                    <div className="font-medium">{doc.size}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Used In</div>
                    <div className="font-medium">{doc.usedIn} applications</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500">Uploaded</div>
                    <div className="font-medium">{doc.uploadDate}</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
                    title="Preview"
                  >
                    <Eye className="mx-auto h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
                    title="Download"
                  >
                    <Download className="mx-auto h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => startEdit(doc)}
                    className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
                    title="Rename"
                  >
                    <Edit3 className="mx-auto h-4 w-4 text-gray-600" />
                  </button>
                  {doc.status === "missing" || doc.status === "needs-update" ? (
                    <button
                      onClick={() => {
                        uploadTargetRef.current = doc.id;
                        fileInputRef.current?.click();
                      }}
                      className="rounded-lg border border-indigo-200 p-2 text-indigo-600 hover:bg-indigo-50"
                      title="Upload replacement"
                    >
                      <Upload className="mx-auto h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => void handleDelete(doc.id)}
                      disabled={workingId === doc.id}
                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
                      title="Delete"
                    >
                      <Trash2 className="mx-auto h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
