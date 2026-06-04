"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Trash2, MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Reply {
  id: string;
  creator: string;
  comment: string;
  createdAt: number;
}

interface Thread {
  id: string;
  imageId: string;
  creator: string;
  x: number;
  y: number;
  comment: string;
  replies: Reply[];
}

interface ImageViewerProps {
  imageId: string;
  imageUrl: string;
  commentMode: boolean;
  onImageDelete?: () => void;
}

const getColorForUser = (username: string) => {
  const colors = [
    'text-red-400', 'text-orange-400', 'text-amber-400', 'text-green-400', 
    'text-emerald-400', 'text-teal-400', 'text-cyan-400', 'text-blue-400', 
    'text-indigo-400', 'text-violet-400', 'text-purple-400', 'text-fuchsia-400', 
    'text-pink-400', 'text-rose-400'
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function ImageViewer({ imageId, imageUrl, commentMode, onImageDelete }: ImageViewerProps) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [showInput, setShowInput] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingPin, setDraggingPin] = useState<string | null>(null);

  useEffect(() => {
    fetchThreads();
  }, [imageId]);

  const fetchThreads = async () => {
    try {
      const response = await api.get(`/images/${imageId}/threads`);
      setThreads(response.data);
    } catch (err) {
      console.error("Failed to fetch threads", err);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!commentMode || draggingPin) {
      setExpandedThreadId(null);
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setShowInput({ x, y });
    setExpandedThreadId(null);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showInput || !commentText.trim()) return;

    try {
      const response = await api.post(`/images/${imageId}/threads`, {
        x: showInput.x,
        y: showInput.y,
        comment: commentText,
      });
      setThreads([...threads, response.data]);
      setShowInput(null);
      setCommentText("");
      setExpandedThreadId(response.data.id);
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, threadId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const response = await api.post(`/threads/${threadId}/replies`, {
        comment: replyText,
      });
      setThreads(threads.map(t =>
        t.id === threadId ? { ...t, replies: [...t.replies, response.data] } : t
      ));
      setReplyText("");
    } catch (err) {
      console.error("Failed to post reply", err);
    }
  };

  const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/threads/${threadId}`);
      setThreads(threads.filter((t) => t.id !== threadId));
      if (expandedThreadId === threadId) setExpandedThreadId(null);
    } catch (err) {
      console.error("Failed to delete thread", err);
    }
  };

  const handleDeleteReply = async (e: React.MouseEvent, threadId: string, replyId: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/threads/${threadId}/replies/${replyId}`);
      setThreads(threads.map(t =>
        t.id === threadId ? { ...t, replies: t.replies.filter(r => r.id !== replyId) } : t
      ));
    } catch (err) {
      console.error("Failed to delete reply", err);
    }
  };

  const handleDragEnd = async (e: any, info: any, threadId: string) => {
    setDraggingPin(null);
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;

    const currentPxX = (thread.x / 100) * rect.width;
    const currentPxY = (thread.y / 100) * rect.height;

    let newX = ((currentPxX + info.offset.x) / rect.width) * 100;
    let newY = ((currentPxY + info.offset.y) / rect.height) * 100;

    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    setThreads(threads.map(t => t.id === threadId ? { ...t, x: newX, y: newY } : t));

    try {
      await api.patch(`/threads/${threadId}`, { x: newX, y: newY });
    } catch (err) {
      console.error("Failed to update thread position", err);
      fetchThreads();
    }
  };

  const handleDeleteImage = async () => {
    try {
      await api.delete(`/images/${imageId}`);
      if (onImageDelete) onImageDelete();
    } catch (err) {
      console.error("Failed to delete image", err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full p-4 md:p-6">
      <div className="flex justify-between w-full max-w-4xl mb-4 items-center">
        <h2 className="text-lg md:text-xl font-semibold truncate">Image: {imageId}</h2>
        <button
          onClick={handleDeleteImage}
          className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete Image</span>
        </button>
      </div>

      <div
        className={`relative w-full max-w-4xl bg-black rounded-xl shadow-2xl border border-white/10 ${commentMode ? 'cursor-crosshair' : ''}`}
        ref={containerRef}
        onClick={handleImageClick}
      >
        <img
          src={imageUrl}
          alt={`Generated ${imageId}`}
          className="w-full h-auto object-contain pointer-events-none select-none rounded-xl"
        />

        {threads.map((thread) => (
          <motion.div
            key={`${thread.id}-${thread.x}-${thread.y}`} // Changing key on drop resets framer-motion's internal drag transform
            drag={commentMode && thread.creator === user && !expandedThreadId ? true : false}
            dragConstraints={containerRef}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={() => setDraggingPin(thread.id)}
            onDragEnd={(e, info) => handleDragEnd(e, info, thread.id)}
            className={`absolute flex flex-col items-center ${expandedThreadId === thread.id ? 'z-50' : 'z-10'}`}
            style={{
              left: `${thread.x}%`,
              top: `${thread.y}%`,
              transform: 'translate(-50%, -50%)' // Center the pin on the coordinate
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!draggingPin) {
                setExpandedThreadId(expandedThreadId === thread.id ? null : thread.id);
                setReplyText("");
              }
            }}
          >
            {/* The Pin */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileDrag={{ scale: 1.2, zIndex: 50 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg cursor-pointer transition-colors relative
                ${thread.creator === user ? 'bg-blue-500 text-white' : 'bg-white text-black'}
                ${expandedThreadId === thread.id ? 'ring-4 ring-blue-500/50' : ''}
              `}
            >
              {thread.creator.substring(0, 2).toUpperCase()}
              {thread.replies.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {thread.replies.length}
                </div>
              )}
            </motion.div>

            {/* Expanded Popover */}
            <AnimatePresence>
              {expandedThreadId === thread.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute w-72 sm:w-80 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl flex flex-col z-50 cursor-default"
                  // Dynamically shift popover if it's too close to the edges
                  style={{
                    top: thread.y > 60 ? 'auto' : '2.5rem',
                    bottom: thread.y > 60 ? '2.5rem' : 'auto',
                    left: thread.x > 80 ? 'auto' : thread.x < 20 ? '0' : '50%',
                    right: thread.x > 80 ? '0' : 'auto',
                    transform: thread.x > 80 ? 'none' : thread.x < 20 ? 'none' : 'translateX(-50%)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header / Original Comment */}
                  <div className="p-4 border-b border-white/10 bg-slate-800/50 relative">
                    <button
                      onClick={() => setExpandedThreadId(null)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-start justify-between mr-6">
                      <div>
                        <span className={`font-semibold text-sm ${getColorForUser(thread.creator)}`}>{thread.creator}</span>
                        <div className="text-sm mt-1 text-slate-200 break-words" dangerouslySetInnerHTML={{ __html: thread.comment }} />
                      </div>
                    </div>
                    {commentMode && thread.creator === user && (
                      <button
                        onClick={(e) => handleDeleteThread(e, thread.id)}
                        className="mt-3 flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" /> Delete Thread
                      </button>
                    )}
                  </div>

                  {/* Replies List */}
                  <div className="max-h-48 overflow-y-auto p-4 space-y-3 bg-slate-900/50">
                    {thread.replies.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center">No replies yet.</p>
                    ) : (
                      thread.replies.map((reply) => (
                        <div key={reply.id} className="flex flex-col bg-white/5 rounded-lg p-2.5">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium text-xs ${getColorForUser(reply.creator)}`}>{reply.creator}</span>
                            {commentMode && reply.creator === user && (
                              <button
                                onClick={(e) => handleDeleteReply(e, thread.id, reply.id)}
                                className="text-red-400/70 hover:text-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div className="text-sm text-slate-300 mt-1 break-words" dangerouslySetInnerHTML={{ __html: reply.comment }} />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply Input */}
                  {commentMode && (
                    <div className="p-3 border-t border-white/10 bg-slate-900">
                      <form onSubmit={(e) => handleReplySubmit(e, thread.id)} className="flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Add a reply..."
                          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={!replyText.trim()}
                          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg text-white transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {showInput && (
          <div
            className="absolute z-40 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-white/20 shadow-2xl mt-4"
            style={{
              left: `${showInput.x}%`,
              top: `${showInput.y}%`,
              transform: `translate(${showInput.x > 80 ? '-100%' : showInput.x < 20 ? '0%' : '-50%'}, 0)`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Post
              </button>
              <button
                type="button"
                onClick={() => setShowInput(null)}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
