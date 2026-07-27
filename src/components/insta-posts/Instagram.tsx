"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Images,
  Instagram,
  LoaderCircle,
  Play,
  X,
} from "lucide-react";
import { apiUrl } from "@/utils/api";

type InstagramPost = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

type InstagramResponse = {
  success: boolean;
  posts?: InstagramPost[];
  next_cursor?: string | null;
  has_more?: boolean;
  message?: string;
};

type InstagramPage = {
  posts: InstagramPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

async function fetchInstagramPage(
  after?: string,
  signal?: AbortSignal,
): Promise<InstagramPage> {
  const cursor = after ? `?after=${encodeURIComponent(after)}` : "";
  const response = await fetch(`${apiUrl("instagram/get_posts.php")}${cursor}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  let data: InstagramResponse;

  try {
    data = (await response.json()) as InstagramResponse;
  } catch {
    throw new Error("Instagram returned an invalid response.");
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch Instagram posts.");
  }

  const nextCursor = data.next_cursor ?? null;

  return {
    posts: data.posts ?? [],
    nextCursor,
    hasMore: Boolean(data.has_more && nextCursor),
  };
}

function mergeUniquePosts(
  currentPosts: InstagramPost[],
  incomingPosts: InstagramPost[],
): InstagramPost[] {
  const postIds = new Set(currentPosts.map((post) => post.id));
  const uniquePosts = incomingPosts.filter((post) => !postIds.has(post.id));

  return [...currentPosts, ...uniquePosts];
}

function getPreviewUrl(post: InstagramPost): string | undefined {
  return post.media_type === "VIDEO"
    ? post.thumbnail_url || post.media_url
    : post.media_url;
}

const INSTAGRAM_TIME_ZONE = "Australia/Melbourne";

function parsePostDate(timestamp: string): Date | null {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatPostDateTime(timestamp: string): string {
  const date = parsePostDate(timestamp);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: INSTAGRAM_TIME_ZONE,
    timeZoneName: "short",
  }).format(date);
}

function formatCompactPostDateTime(timestamp: string): string {
  const date = parsePostDate(timestamp);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: INSTAGRAM_TIME_ZONE,
  }).format(date);
}

export default function InstagramPosts() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadInitialPosts = async () => {
      try {
        const page = await fetchInstagramPage(undefined, controller.signal);

        setPosts(page.posts);
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load Instagram posts.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadInitialPosts();

    return () => controller.abort();
  }, []);

  const loadMorePosts = useCallback(async (): Promise<number> => {
    if (loadingMore || !hasMore || !nextCursor) {
      return 0;
    }

    setLoadingMore(true);
    setLoadMoreError("");

    try {
      const page = await fetchInstagramPage(nextCursor);
      const currentPostIds = new Set(posts.map((post) => post.id));
      const addedPostCount = page.posts.filter(
        (post) => !currentPostIds.has(post.id),
      ).length;

      setPosts((currentPosts) => mergeUniquePosts(currentPosts, page.posts));
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);

      return addedPostCount;
    } catch (requestError) {
      setLoadMoreError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load more Instagram posts.",
      );
      return 0;
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor, posts]);

  const showPreviousPost = useCallback(() => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null || currentIndex === 0) {
        return currentIndex;
      }

      return currentIndex - 1;
    });
  }, []);

  const showNextPost = useCallback(async () => {
    if (selectedIndex === null) {
      return;
    }

    if (selectedIndex < posts.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      return;
    }

    if (!hasMore) {
      return;
    }

    const nextPostIndex = posts.length;
    const addedPostCount = await loadMorePosts();

    if (addedPostCount > 0) {
      setSelectedIndex(nextPostIndex);
    }
  }, [hasMore, loadMorePosts, posts.length, selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
      } else if (event.key === "ArrowLeft") {
        showPreviousPost();
      } else if (event.key === "ArrowRight") {
        void showNextPost();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, showNextPost, showPreviousPost]);

  const selectedPost =
    selectedIndex === null ? null : posts[selectedIndex] ?? null;

  if (loading) {
    return <p className="py-10 text-center">Loading Instagram posts...</p>;
  }

  if (error) {
    return <p className="py-10 text-center text-red-600">{error}</p>;
  }

  if (posts.length === 0) {
    return <p className="py-10 text-center">No Instagram posts found.</p>;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 text-center">
        <Instagram className="mx-auto mb-3 h-7 w-7" aria-hidden="true" />
        <h2 className="text-3xl md:text-4xl font-semibold mb-4"
            style={{ fontFamily: "fairplaybold" }}>Follow us on Instagram</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {posts.map((post, index) => {
          const imageUrl = getPreviewUrl(post);
          const postDateTime = formatCompactPostDateTime(post.timestamp);

          return (
            <button
              key={post.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className="group relative aspect-square overflow-hidden bg-gray-100 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
              aria-label={`Open Instagram post ${index + 1}`}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={post.caption || "Instagram post"}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  Media unavailable
                </div>
              )}

              <div className="absolute inset-0 flex items-end bg-black/0 p-4 pb-12 transition group-hover:bg-black/40 group-focus-visible:bg-black/40">
                {post.caption && (
                  <p className="line-clamp-2 translate-y-3 text-sm text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    {post.caption}
                  </p>
                )}
              </div>

              {postDateTime && (
                <time
                  dateTime={post.timestamp}
                  className="absolute bottom-3 left-3 z-10 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm"
                >
                  {postDateTime}
                </time>
              )}

              {post.media_type === "VIDEO" && (
                <span className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white">
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                </span>
              )}

              {post.media_type === "CAROUSEL_ALBUM" && (
                <span className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white">
                  <Images className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        {hasMore && (
          <button
            type="button"
            onClick={() => void loadMorePosts()}
            disabled={loadingMore}
            className="inline-flex min-w-36 items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {loadingMore && (
              <LoaderCircle
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        )}

        {loadMoreError && (
          <p className="text-center text-sm text-red-600" role="alert">
            {loadMoreError} Please try again.
          </p>
        )}
      </div>

      {selectedPost && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedIndex(null);
            }
          }}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl lg:grid lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)] lg:overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="instagram-post-title"
          >
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="absolute right-3 top-3 z-20 rounded-full bg-black/70 p-2 text-white transition hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close Instagram post"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="relative flex min-h-[45vh] items-center justify-center bg-black lg:min-h-[70vh]">
              {selectedPost.media_type === "VIDEO" &&
              selectedPost.media_url ? (
                <video
                  key={selectedPost.id}
                  src={selectedPost.media_url}
                  poster={selectedPost.thumbnail_url}
                  controls
                  playsInline
                  className="max-h-[70vh] w-full object-contain"
                >
                  Your browser does not support embedded video.
                </video>
              ) : getPreviewUrl(selectedPost) ? (
                <img
                  src={getPreviewUrl(selectedPost)}
                  alt={selectedPost.caption || "Instagram post"}
                  className="max-h-[70vh] w-full object-contain"
                />
              ) : (
                <p className="text-sm text-white/70">Media unavailable</p>
              )}

              <button
                type="button"
                onClick={showPreviousPost}
                disabled={selectedIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/65 p-2.5 text-white transition hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-30"
                aria-label="Previous Instagram post"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => void showNextPost()}
                disabled={
                  loadingMore || (selectedIndex === posts.length - 1 && !hasMore)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/65 p-2.5 text-white transition hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-30"
                aria-label="Next Instagram post"
              >
                {loadingMore && selectedIndex === posts.length - 1 ? (
                  <LoaderCircle
                    className="h-6 w-6 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                )}
              </button>

              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-xs text-white">
                {selectedIndex + 1} / {posts.length}
                {hasMore ? "+" : ""}
              </span>
            </div>

            <div className="flex min-h-0 flex-col bg-white lg:max-h-[80vh]">
              <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 pr-14">
                <Instagram className="h-6 w-6" aria-hidden="true" />
                <div>
                  <h3 id="instagram-post-title" className="font-semibold">
                    Petite Fille Rosanna
                  </h3>
                  <p className="text-xs text-gray-500">Instagram post</p>
                </div>
              </div>

              <div className="min-h-28 flex-1 overflow-y-auto px-5 py-5">
                {selectedPost.caption ? (
                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {selectedPost.caption}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">No caption</p>
                )}
              </div>

              <div className="border-t border-gray-200 px-5 py-4">
                {formatPostDateTime(selectedPost.timestamp) && (
                  <time
                    dateTime={selectedPost.timestamp}
                    className="mb-3 block text-xs uppercase tracking-wide text-gray-500"
                  >
                    Posted {formatPostDateTime(selectedPost.timestamp)}
                  </time>
                )}
                <a
                  href={selectedPost.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                >
                  View on Instagram
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
