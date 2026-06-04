"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import ImageViewer from "@/components/ImageViewer";
import { LogOut, ImagePlus, MessageSquare, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageItem {
  id: string;
  url: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [commentMode, setCommentMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("userName");
      if (!storedUser && !user) {
        router.push("/login");
      } else {
        setLoading(false);
        fetchImages();
      }
    };
    checkAuth();
  }, [user, router]);

  const fetchImages = async () => {
    try {
      const res = await api.get("/images");
      setImages(res.data);
    } catch (err) {
      console.error("Failed to fetch images", err);
    }
  };

  const handleGenerateImage = async () => {
    try {
      const res = await api.post("/images");
      setImages([...images, res.data]);
      setSelectedImage(res.data);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Failed to generate image", err);
    }
  };

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-50 overflow-hidden relative">

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 left-0 h-full w-64 bg-slate-900 border-r border-white/10 flex flex-col z-40 shadow-2xl transition-transform duration-300 transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-lg">I</span>
            </div>
            <h1 className="font-bold text-xl tracking-tight">Tagger</h1>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h3 className="text-xs uppercase text-slate-500 font-semibold mb-4 tracking-wider">Generated Images</h3>
          {images.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No images yet. Generate one!</p>
          ) : (
            images.map((img) => (
              <button
                key={img.id}
                onClick={() => {
                  setSelectedImage(img);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 truncate ${selectedImage?.id === img.id
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "hover:bg-white/5 text-slate-300 border border-transparent"
                  }`}
              >
                {img.id}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-auto min-h-[5rem] py-3 md:h-20 bg-slate-900/50 backdrop-blur-md border-b border-white/10 flex flex-col md:flex-row items-center justify-between px-4 md:px-8 z-10 gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <button
              className="md:hidden p-2 bg-white/5 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <div className="text-xs md:text-sm">
                <span className="font-semibold text-white bg-white/10 px-3 py-1 rounded-full">{user}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start w-full md:w-auto">
            <button
              onClick={handleGenerateImage}
              className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 text-sm md:text-base md:px-5 md:py-2.5 rounded-xl font-semibold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 w-full sm:w-auto"
            >
              <ImagePlus className="w-5 h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Generate New Image</span>
            </button>

            <div className="flex items-center justify-between w-full sm:w-auto gap-3 bg-black/30 p-1.5 rounded-xl border border-white/5 px-3">
              <span className={`text-sm font-medium ${commentMode ? "text-blue-400" : "text-slate-400"}`}>
                Comment Mode
              </span>
              <button
                onClick={() => setCommentMode(!commentMode)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${commentMode ? "bg-blue-600" : "bg-slate-700"
                  }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${commentMode ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="text-sm">
              <span className="text-slate-400">Welcome, </span>
              <span className="font-semibold text-white bg-white/10 px-3 py-1 rounded-full">{user}!</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Viewer */}
        <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black relative">
          {selectedImage ? (
            <ImageViewer
              imageId={selectedImage.id}
              imageUrl={selectedImage.url}
              commentMode={commentMode}
              onImageDelete={() => {
                setSelectedImage(null);
                fetchImages();
              }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 p-6 text-center">
              <MessageSquare className="w-12 h-12 md:w-16 md:h-16 opacity-20" />
              <p className="text-base md:text-lg font-medium">Select an image from the sidebar or generate a new one.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
