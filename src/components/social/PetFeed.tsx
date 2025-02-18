import { useState, useRef, useEffect } from "react";
import { PetFeedItem } from "./PetFeedItem";
import { useSocialPosts } from "../../hooks/useSocialPosts";
import { useSwipeable } from "react-swipeable";

interface PetFeedProps {
  onShowComments: (postId: string) => void;
  onLike: (postId: string) => void;
  onDoubleTap: (postId: string) => void;
}

export function PetFeed({ onShowComments, onLike, onDoubleTap }: PetFeedProps) {
  const { posts, loading, refresh: loadPosts, likePost } = useSocialPosts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  const scrollToPost = (index: number) => {
    if (feedRef.current && index >= 0 && index < posts.length) {
      const postElement = feedRef.current.children[index] as HTMLElement;
      postElement.scrollIntoView({ behavior: "smooth" });
      setCurrentIndex(index);
    }
  };

  const handlers = useSwipeable({
    onSwipedUp: () => scrollToPost(currentIndex + 1),
    onSwipedDown: () => scrollToPost(currentIndex - 1),
    trackMouse: true,
  });

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        scrollToPost(currentIndex - 1);
      } else if (e.key === "ArrowDown") {
        scrollToPost(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  // Handle scroll snap
  useEffect(() => {
    const handleScroll = () => {
      if (feedRef.current) {
        const scrollTop = feedRef.current.scrollTop;
        const postHeight = window.innerHeight;
        const newIndex = Math.round(scrollTop / postHeight);
        setCurrentIndex(newIndex);
      }
    };

    const feedElement = feedRef.current;
    if (feedElement) {
      feedElement.addEventListener("scroll", handleScroll);
      return () => feedElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div
      {...handlers}
      ref={feedRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      style={{ touchAction: "pan-y" }}
    >
      {posts.map((post, index) => (
        <PetFeedItem
          key={post.id}
          post={post}
          onLike={onLike}
          onShowComment={onShowComments} // Fixed naming issue
          // isActive={index === currentIndex} // Ensure `PetFeedItem` supports this
        />
      ))}
    </div>
  );
}
