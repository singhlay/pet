import React, { useState, useCallback } from "react";
import { Plus, Heart, MessageCircle, Share2, Music } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useSocialPosts } from "../../hooks/useSocialPosts";
import { CreatePostModal } from "./CreatePostModal";
import { CommentsModal } from "./CommentsModal";
import { AuthModal } from "../auth/AuthModal";
import { PetFeed } from "./PetFeed";

export function SocialFeed() {
  const { isAuthenticated } = useAuth();
  const { posts, loading, refresh: loadPosts, likePost } = useSocialPosts();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [likeInProgress, setLikeInProgress] = useState<Record<string, boolean>>(
    {}
  );
  const [doubleTapPostId, setDoubleTapPostId] = useState<string | null>(null);

  const handleLike = useCallback(
    async (postId: string) => {
      if (!isAuthenticated) {
        toast("Please sign in to like posts", { icon: "🔒" });
        setShowAuthModal(true);
        return;
      }
      if (likeInProgress[postId]) return;

      setLikeInProgress((prev) => ({ ...prev, [postId]: true }));
      await likePost(postId);
      setLikeInProgress((prev) => ({ ...prev, [postId]: false }));
    },
    [isAuthenticated, likePost, likeInProgress]
  );

  const handleShowComments = (postId: string) => {
    if (!isAuthenticated) {
      toast("Please sign in to view comments", { icon: "🔒" });
      setShowAuthModal(true);
      return;
    }
    setSelectedPostId(postId);
  };

  const handleDoubleTap = (postId: string) => {
    setDoubleTapPostId(postId);
    setTimeout(() => setDoubleTapPostId(null), 1000);
    handleLike(postId);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h2 className="text-2xl font-serif mb-4">Welcome to Pet Social</h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Connect with other pet owners, share moments, and discover amazing
          pets in your community.
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Sign in to view posts
        </button>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 mb-4">No posts yet</p>
          <button
            onClick={() => setShowCreatePost(true)}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Create the first post
          </button>
        </div>
      ) : (
        <PetFeed
          onShowComments={handleShowComments}
          onLike={handleLike}
          onDoubleTap={handleDoubleTap}
        />
      )}

      {/* Create Post Button */}
      <div className="fixed bottom-4 right-2">
        <button
          onClick={() => setShowCreatePost(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Modals */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onSuccess={loadPosts}
        />
      )}
      {selectedPostId && (
        <CommentsModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
