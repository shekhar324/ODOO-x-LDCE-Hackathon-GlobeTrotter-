"use client";

import React, { useState } from "react";
import { NavigationPill } from "@/components/editorial/navigation-pill";
import { Footer } from "@/components/editorial/footer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { EditorialHeading } from "@/components/editorial/editorial-heading";
import { ConciergeModal } from "@/components/editorial/concierge-modal";
import {
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconPlus,
  IconSparkles,
  IconTrash,
  IconBook,
  IconMapPin,
  IconCheck,
  IconX,
  IconBulb,
} from "@tabler/icons-react";
import { useAuth } from "@/context/auth-context";
import {
  useCommunityPosts,
  useCreateCommunityPost,
  useDeleteCommunityPost,
  CommunityPost,
} from "@/hooks/use-community";
import { toast } from "sonner";

export default function CommunityPage() {
  const { user } = useAuth();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  // Supabase hooks
  const { data: posts = [], isLoading, isError } = useCommunityPosts();
  const createPostMutation = useCreateCommunityPost();
  const deletePostMutation = useDeleteCommunityPost();

  // New post form state
  const [newPost, setNewPost] = useState({
    title: "",
    destination: "",
    story: "",
    how_it_went: "",
    recommendations: "",
    dos: "",
    donts: "",
    tips: "",
    cover_image_url: "",
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPost.title.trim() || !newPost.story.trim()) {
      toast.error("Please provide both a title and a story for your experience.");
      return;
    }

    try {
      await createPostMutation.mutateAsync({
        title: newPost.title.trim(),
        destination: newPost.destination.trim() || undefined,
        story: newPost.story.trim(),
        how_it_went: newPost.how_it_went.trim() || undefined,
        recommendations: newPost.recommendations.trim() || undefined,
        dos: newPost.dos.trim() || undefined,
        donts: newPost.donts.trim() || undefined,
        tips: newPost.tips.trim() || undefined,
        cover_image_url: newPost.cover_image_url.trim() || undefined,
      });

      toast.success("Travel story published to the community!");
      setIsCreateModalOpen(false);
      setNewPost({
        title: "",
        destination: "",
        story: "",
        how_it_went: "",
        recommendations: "",
        dos: "",
        donts: "",
        tips: "",
        cover_image_url: "",
      });
    } catch (err: any) {
      toast.error("Failed to publish story", {
        description: err.message || "An unexpected error occurred.",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostMutation.mutateAsync(postId);
      toast.success("Story deleted successfully.");
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
    } catch (err: any) {
      toast.error("Failed to delete story", {
        description: err.message || "An unexpected error occurred.",
      });
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0e0e0e] text-[#e2e2e2] flex flex-col font-sans selection:bg-[#c3eeb4] selection:text-[#002200]">
        <NavigationPill onContactClick={() => setIsContactModalOpen(true)} />

        <main className="flex-1 max-w-[1200px] mx-auto w-full pt-32 sm:pt-40 pb-32 px-6 md:px-12 z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-apple-pill text-xs text-emerald-300 mb-4">
                <IconBook className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono tracking-wide uppercase text-[11px]">
                  Global Collective & Journal
                </span>
              </div>
              <EditorialHeading className="text-[44px] sm:text-[64px] md:text-[80px] leading-none text-white font-thin tracking-tight">
                Traveler Stories
              </EditorialHeading>
              <p className="font-sans text-lg text-[#becabb] mt-4 max-w-xl">
                Real accounts, authentic recommendations, and unvarnished dos & don'ts from our private travel collective.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#2d9b4c] hover:bg-[#38a454] text-white px-6 py-3.5 rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-[#2d9b4c]/20 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <IconPlus className="w-4 h-4" />
              <span>Share Your Story</span>
            </button>
          </div>

          {/* Stories Grid */}
          {isLoading ? (
            <div className="py-20 text-center text-[#becabb] font-mono animate-pulse">
              Loading collective stories...
            </div>
          ) : isError ? (
            <div className="py-20 text-center text-red-400 font-mono">
              Failed to load community posts. Please refresh or try again later.
            </div>
          ) : posts.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center max-w-md mx-auto">
              <IconSparkles className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl text-white font-light mb-2">No Stories Published Yet</h3>
              <p className="text-xs text-[#becabb] mb-6">
                Be the first traveler to share your journey, insights, and local recommendations.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer"
              >
                Share First Story
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                const isAuthor = user?.id === post.author_id;

                return (
                  <div
                    key={post.id}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all duration-300 group"
                  >
                    <div>
                      {/* Cover Image */}
                      {post.cover_image_url && (
                        <div className="h-48 w-full relative overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {post.destination && (
                            <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                              <IconMapPin className="w-3 h-3" />
                              {post.destination}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="p-6">
                        {/* Author Header */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center justify-center font-bold">
                              {(post.profiles?.full_name || post.profiles?.username || "A")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs text-white font-medium">
                                {post.profiles?.full_name || post.profiles?.username || "Anonymous Traveler"}
                              </p>
                              <p className="text-[10px] text-neutral-500">
                                {new Date(post.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {isAuthor && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              disabled={deletePostMutation.isPending}
                              className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                              title="Delete Story"
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Title & Story */}
                        <h3 className="text-xl font-light text-white mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-[#becabb] leading-relaxed line-clamp-4 mb-4">
                          {post.story || post.description}
                        </p>

                        {/* Quick Highlights Pill Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.dos && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <IconCheck className="w-3 h-3" /> Do's included
                            </span>
                          )}
                          {post.donts && (
                            <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <IconX className="w-3 h-3" /> Don'ts included
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2 border-t border-white/5 flex justify-between items-center">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-mono transition-colors cursor-pointer"
                      >
                        Read Full Journey →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Read Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="backdrop-blur-2xl bg-[#141414] border border-white/15 text-white max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  {selectedPost.destination && (
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block mb-1">
                      {selectedPost.destination}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-3xl font-light">{selectedPost.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>

              {selectedPost.cover_image_url && (
                <div className="h-64 w-full rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedPost.cover_image_url}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4 text-sm text-[#becabb] leading-relaxed">
                <div>
                  <h4 className="text-white font-medium text-xs uppercase tracking-wider mb-2 font-mono">
                    The Experience
                  </h4>
                  <p className="whitespace-pre-line">{selectedPost.story || selectedPost.description}</p>
                </div>

                {selectedPost.how_it_went && (
                  <div>
                    <h4 className="text-white font-medium text-xs uppercase tracking-wider mb-2 font-mono">
                      How It Went
                    </h4>
                    <p className="whitespace-pre-line">{selectedPost.how_it_went}</p>
                  </div>
                )}

                {selectedPost.recommendations && (
                  <div>
                    <h4 className="text-white font-medium text-xs uppercase tracking-wider mb-2 font-mono">
                      Top Recommendations
                    </h4>
                    <p className="whitespace-pre-line">{selectedPost.recommendations}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {selectedPost.dos && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <h5 className="text-emerald-400 font-mono text-xs font-semibold mb-2 flex items-center gap-1.5">
                        <IconCheck className="w-4 h-4" /> Do's
                      </h5>
                      <p className="text-xs text-[#becabb] whitespace-pre-line">{selectedPost.dos}</p>
                    </div>
                  )}

                  {selectedPost.donts && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <h5 className="text-rose-400 font-mono text-xs font-semibold mb-2 flex items-center gap-1.5">
                        <IconX className="w-4 h-4" /> Don'ts
                      </h5>
                      <p className="text-xs text-[#becabb] whitespace-pre-line">{selectedPost.donts}</p>
                    </div>
                  )}
                </div>

                {selectedPost.tips && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <h5 className="text-amber-400 font-mono text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <IconBulb className="w-4 h-4" /> Insider Tips
                    </h5>
                    <p className="text-xs text-[#becabb] whitespace-pre-line">{selectedPost.tips}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Post Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="backdrop-blur-2xl bg-[#141414] border border-white/15 text-white max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-light text-white">Share Your Journey</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-mono">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hidden izakayas of Kyoto & peaceful mornings"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-mono">Destination</label>
                  <input
                    type="text"
                    placeholder="e.g. Kyoto, Japan"
                    value={newPost.destination}
                    onChange={(e) => setNewPost({ ...newPost, destination: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-mono">
                    Story & Atmosphere *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe the experience, mood, culture, and memorable moments..."
                    value={newPost.story}
                    onChange={(e) => setNewPost({ ...newPost, story: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-emerald-400 block mb-1.5 font-mono">Do's</label>
                    <textarea
                      rows={2}
                      placeholder="What travelers SHOULD do..."
                      value={newPost.dos}
                      onChange={(e) => setNewPost({ ...newPost, dos: e.target.value })}
                      className="w-full px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 text-xs resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-rose-400 block mb-1.5 font-mono">Don'ts</label>
                    <textarea
                      rows={2}
                      placeholder="What travelers SHOULD avoid..."
                      value={newPost.donts}
                      onChange={(e) => setNewPost({ ...newPost, donts: e.target.value })}
                      className="w-full px-3 py-2 bg-rose-500/5 border border-rose-500/20 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-400 text-xs resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-amber-400 block mb-1.5 font-mono">Insider Tips</label>
                  <input
                    type="text"
                    placeholder="e.g. Reserve train passes 3 weeks ahead"
                    value={newPost.tips}
                    onChange={(e) => setNewPost({ ...newPost, tips: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-mono">
                    Cover Image URL <span className="text-neutral-500 font-sans">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://images.unsplash.com/photo-1507525428034..."
                    value={newPost.cover_image_url}
                    onChange={(e) => setNewPost({ ...newPost, cover_image_url: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-medium py-3.5 rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50 mt-4"
                >
                  {createPostMutation.isPending ? "Publishing..." : "Publish to Community"}
                </button>
              </form>
            </div>
          </div>
        )}

        <Footer />
        <ConciergeModal
          isOpen={isContactModalOpen}
          onOpenChange={setIsContactModalOpen}
        />
      </div>
    </AuthGuard>
  );
}
