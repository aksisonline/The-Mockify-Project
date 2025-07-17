"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageSquare,
  Heart,
  Share2,
  Bookmark,
  MoreHorizontal,
  ArrowLeft,
  ImageIcon,
  Paperclip,
  Send,
  ThumbsUp,
  ThumbsDown,
  Reply,
  ChevronDown,
  ChevronUp,
  X,
  ChevronLeft,
  ChevronRight,
  File as FileIcon,
  Trash2,
  Flag,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/auth-context"
import { DiscussionPollComponent } from "@/components/discussions/discussion-poll"
import { ReportDialog } from "@/components/discussions/report-dialog"
import {
  getDiscussionById,
  getDiscussionComments,
  getDiscussionPoll,
  getUserPollVotes,
  getRelatedDiscussions,
  createComment,
  voteDiscussion,
  votePoll,
  votePollSingleOption,
  voteComment,
  recordShare,
  getUserDiscussionVote,
  getUserBookmark,
  getUserCommentVote,
  createAttachment,
  getDiscussionCategories,
  toggleBookmark,
} from "@/lib/discussions-service"
import { uploadFile } from "@/lib/file-service"
import type { 
  FileAttachment, 
  Discussion, 
  DiscussionComment as CommentType, 
  DiscussionPoll, 
  DiscussionAttachment,
  DiscussionCategory
} from "@/types/discussion"
import {
  formatFileSize,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  ALLOWED_FILE_TYPES,
  ALLOWED_IMAGE_TYPES,
} from "@/utils/file-utils"
import { set } from "date-fns"
import Link from "next/link"
import ContentWrapper from "@/components/ContentWrapper"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Extend DiscussionAttachment to include file_path for runtime use
interface DiscussionAttachmentWithPath extends DiscussionAttachment {
  file_path?: string;
}

// Helper function to upload attachments and create attachment records
const uploadAttachments = async (
  attachments: FileAttachment[],
  commentId?: string,
  discussionId?: string,
  user?: any
) => {
  if (!user) {
    throw new Error("User must be authenticated to upload attachments");
  }

  const uploadedAttachments = [];
  const supabase = createBrowserClient();

  for (const attachment of attachments) {
    try {
      // Upload file using the new file service
      const uploadResult = await uploadFile(attachment.file);

      if (!uploadResult || !uploadResult.url) {
        throw new Error(`Failed to upload ${attachment.file.name}: No URL returned`);
      }

      // Create attachment record in database
      const { data: attachmentRecord, error } = await supabase
        .from('discussion_attachments')
        .insert({
          discussion_id: commentId ? null : discussionId,
          comment_id: commentId || null,
          file_name: attachment.file.name,
          file_path: uploadResult.url, // Store the URL as file_path
          file_type: attachment.type === 'image' ? 'image' : 'document',
          file_size: attachment.file.size,
          mime_type: attachment.file.type,
          uploaded_by: user.id,
          is_deleted: false
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create attachment record: ${error.message}`);
      }

      uploadedAttachments.push(attachmentRecord);
    } catch (error) {
      console.error(
        `Error uploading attachment ${attachment.file.name}:`,
        error
      );
      throw new Error(`Failed to upload ${attachment.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return uploadedAttachments;
};

// Helper to check if a URL is public (http/https)
function isPublicUrl(url?: string) {
  return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"));
}

// Comment component with updated styling to match the new design
function Comment({ 
  comment, 
  depth = 0, 
  user, 
  router, 
  refreshComments,
  userVotes 
}: { 
  comment: CommentType; 
  depth?: number; 
  user: any; 
  router: any;
  refreshComments?: () => void;
  userVotes?: Record<string, "up" | "down">;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.vote_score || 0);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const maxVisibleReplies = 2;
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get image attachments
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  // Use DiscussionAttachmentWithPath in normalizedAttachments mapping and filters
  const normalizedAttachments = (comment.attachments || []).map(att => ({
    ...att,
    file_url: att.file_url || (att as any).file_path,
  })) as DiscussionAttachmentWithPath[];
  const imageAttachments = normalizedAttachments.filter(
    (att: DiscussionAttachmentWithPath) =>
      !att.is_deleted &&
      ((att.file_type && att.file_type.startsWith("image/")) ||
        (att.file_name && imageExtensions.some(ext => att.file_name.toLowerCase().endsWith(ext))))
  ) || [];

  // Get file attachments
  const fileAttachments = normalizedAttachments.filter(
    att => !att.is_deleted && !att.file_type.startsWith('image/')
  ) || [];

  // Function to open image preview
  const openImagePreview = (index: number) => {
    setActiveImageIndex(index);
    setIsImagePreviewOpen(true);
  };

  // Auto-resize textarea when content changes
  useEffect(() => {
    const adjustHeight = () => {
      const textarea = replyTextareaRef.current;
      if (textarea && isReplyOpen) {
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = "auto";
        // Set the height to scrollHeight to fit the content
        textarea.style.height = `${Math.max(100, textarea.scrollHeight)}px`;
      }
    };

    adjustHeight();
    // Add event listener for window resize to readjust if needed
    window.addEventListener("resize", adjustHeight);

    return () => {
      window.removeEventListener("resize", adjustHeight);
    };
  }, [replyText, isReplyOpen]);

  // Check user's existing vote when component loads
  useEffect(() => {
    const checkUserVote = async () => {
      if (!user || !comment.id) return;

      try {
        // This would need to be implemented in the service
        const userVote = await getUserCommentVote(comment.id, user.id);
        if (userVote) {
          setIsLiked(userVote.vote_type === "up");
          setIsDisliked(userVote.vote_type === "down");
        }
      } catch (error) {
        console.error("Error checking user vote:", error);
      }
    };

    checkUserVote();
  }, [user, comment.id]);

  // Set initial vote state based on user's existing votes
  useEffect(() => {
    if (userVotes && comment.id in userVotes) {
      const voteType = userVotes[comment.id];
      setIsLiked(voteType === "up");
      setIsDisliked(voteType === "down");
    } else {
      setIsLiked(false);
      setIsDisliked(false);
    }
  }, [userVotes, comment.id]);

  const handleReplyTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyText(e.target.value);
  };

  const hasReplies = comment.replies && comment.replies.length > 0;
  const hasHiddenReplies =
    hasReplies && comment.replies!.length > maxVisibleReplies;
  const visibleReplies = showAllReplies
    ? comment.replies
    : comment.replies?.slice(0, maxVisibleReplies);

  const handleLike = async () => {
    if (!user) {
      if (
        confirm(
          "You need to be logged in to vote. Would you like to log in now?"
        )
      ) {
        router.push(
          "/login?redirect=" + encodeURIComponent(window.location.pathname)
        );
      }
      return;
    }

    try {
      // If already liked, remove the like (neutral vote)
      // If not liked, add a like (upvote)
      const voteType = isLiked ? "neutral" : "up";
      await voteComment(comment.id, user.id, voteType as "up" | "down");

      // Update local state optimistically
      if (isLiked) {
        // Removing like
        setLikeCount(likeCount - 1);
        setIsLiked(false);
      } else {
        // Adding like
        if (isDisliked) {
          // Was disliked, now liking
          setIsDisliked(false);
          setLikeCount(likeCount + 2); // Remove downvote and add upvote
        } else {
          // Was neutral, now liking
          setLikeCount(likeCount + 1);
        }
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error voting on comment:", error);
      alert("Failed to vote on comment. Please try again.");
    }
  };

  const handleDislike = async () => {
    if (!user) {
      if (
        confirm(
          "You need to be logged in to vote. Would you like to log in now?"
        )
      ) {
        router.push(
          "/login?redirect=" + encodeURIComponent(window.location.pathname)
        );
      }
      return;
    }

    try {
      // If already disliked, remove the dislike (neutral vote)
      // If not disliked, add a dislike (downvote)
      const voteType = isDisliked ? "neutral" : "down";
      await voteComment(comment.id, user.id, voteType as "up" | "down");

      // Update local state optimistically
      if (isDisliked) {
        // Removing dislike
        if (isLiked) {
          // Was liked before disliking, restore like state
          setLikeCount(likeCount + 1);
          setIsLiked(true);
        } else {
          // Was just disliked, now neutral
          setLikeCount(likeCount + 1);
        }
        setIsDisliked(false);
      } else {
        // Adding dislike
        if (isLiked) {
          // Was liked, now disliking
          setIsLiked(false);
          setLikeCount(likeCount - 2); // Remove upvote and add downvote
        } else {
          // Was neutral, now disliking
          setLikeCount(likeCount - 1);
        }
        setIsDisliked(true);
      }
    } catch (error) {
      console.error("Error voting on comment:", error);
      alert("Failed to vote on comment. Please try again.");
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileAttachment[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        alert(
          `File type ${file.type} is not supported. Please upload JPEG, PNG, GIF or WebP images.`
        );
        return;
      }

      // Validate file size
      if (file.size > MAX_IMAGE_SIZE) {
        alert(
          `Image is too large. Maximum size is ${formatFileSize(
            MAX_IMAGE_SIZE
          )}.`
        );
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        type: "image",
        previewUrl,
      });
    });

    setAttachments((prev) => [...prev, ...newFiles]);

    // Reset the input
    e.target.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileAttachment[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert(
          `File type ${file.type} is not supported. Please upload PDF, Word, text, or ZIP files.`
        );
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(
          `File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`
        );
        return;
      }

      newFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        type: "document",
      });
    });

    setAttachments((prev) => [...prev, ...newFiles]);

    // Reset the input
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSubmitReply = async () => {
    // Check if user is authenticated
    if (!user) {
      alert("You must be logged in to reply");
      return;
    }

    // Allow submission with attachments even if no text content
    if (!replyText.trim() && attachments.length === 0) {
      alert("Reply cannot be empty and must have content or attachments");
      return;
    }

    try {
      // Create the reply comment first
      const newReply = await createComment({
        content: replyText,
        parent_id: comment.id,
        discussion_id: comment.discussion_id,
        author_id: user.id,
      });

      // Upload attachments if any
      if (attachments.length > 0) {
        await uploadAttachments(attachments, newReply.id, comment.discussion_id, user);
      }

      // Clean up preview URLs
      attachments.forEach((attachment) => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });

      setIsReplyOpen(false);
      setReplyText("");
      setAttachments([]);

      // Refresh the comments
      if (typeof refreshComments === "function") {
        refreshComments();
      }

      toast.success("Reply submitted successfully!");
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error(
        `Failed to submit reply: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    }
  };

  const handleReplyClick = () => {
    if (!user) {
      // If user is not logged in, prompt them to log in
      if (
        confirm(
          "You need to be logged in to reply. Would you like to log in now?"
        )
      ) {
        router.push(
          "/login?redirect=" + encodeURIComponent(window.location.pathname)
        );
      }
      return;
    }

    // If user is logged in, open the reply form
    setIsReplyOpen(!isReplyOpen);
  };

  const handleFileDownload = async (att: DiscussionAttachment) => {
    if (isPublicUrl(att.file_url)) return; // Let browser handle
    try {
      const res = await fetch(att.file_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = att.file_name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (e) {
      alert("Failed to download file");
    }
  };

  return (
    <div
      className={`mb-4 ${
        depth > 0 ? "ml-6 pl-4 border-l-2 border-gray-200" : ""
      }`}
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-blue-200 transition-colors">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 rounded-full">
            <AvatarImage
              src={comment.author?.avatar_url || "/placeholder.svg"}
              alt={comment.author?.full_name || "User"}
            />
            <AvatarFallback>
              {comment.author?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-semibold text-gray-900">
                {comment.author?.full_name || "Anonymous"}
              </span>
              {comment.author?.role && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {comment.author.role}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleString()}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <ReportDialog
                  discussionId={comment.discussion_id}
                  commentId={comment.id}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      Report Comment
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-2 text-gray-700">{comment.content}</div>

        {/* Image Gallery */}
        {imageAttachments.length > 0 && (
          <div className="mt-4 mb-4">
            <div
              className={`grid gap-2 ${
                imageAttachments.length === 1
                  ? "grid-cols-1"
                  : imageAttachments.length === 2
                  ? "grid-cols-2"
                  : imageAttachments.length >= 3
                  ? "grid-cols-2"
                  : ""
              }`}
            >
              {/* First image (larger if 3+ images) */}
              <div
                className={`${
                  imageAttachments.length >= 3 ? "row-span-2" : ""
                } relative cursor-pointer`}
                onClick={() => openImagePreview(0)}
              >
                <img
                  src={imageAttachments[0]?.file_url ? imageAttachments[0].file_url : "/placeholder.svg"}
                  alt={`Comment image 1`}
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
              </div>

              {/* Second image */}
              {imageAttachments.length >= 2 && (
                <div
                  className="relative cursor-pointer"
                  onClick={() => openImagePreview(1)}
                >
                  <img
                    src={imageAttachments[1]?.file_url ? imageAttachments[1].file_url : "/placeholder.svg"}
                    alt={`Comment image 2`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Third image */}
              {imageAttachments.length >= 3 && (
                <div
                  className="relative cursor-pointer"
                  onClick={() => openImagePreview(2)}
                >
                  <img
                    src={imageAttachments[2]?.file_url ? imageAttachments[2].file_url : "/placeholder.svg"}
                    alt={`Comment image 3`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Fourth image with overlay if more images */}
              {imageAttachments.length >= 4 && (
                <div
                  className="relative cursor-pointer"
                  onClick={() => openImagePreview(3)}
                >
                  <img
                    src={imageAttachments[3]?.file_url ? imageAttachments[3].file_url : "/placeholder.svg"}
                    alt={`Comment image 4`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                  />
                  {imageAttachments.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                      <span className="text-white text-xl font-bold">
                        +{imageAttachments.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* File Attachments */}
        {fileAttachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {fileAttachments.map((att, idx) => (
              <a
                key={att.id}
                href={att.file_url}
                download={att.file_name}
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <FileIcon className="h-4 w-4" />
                {att.file_name}
              </a>
            ))}
          </div>
        )}

        {/* Image Preview Modal */}
        {isImagePreviewOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full"
                onClick={() => setIsImagePreviewOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>

              {/* Navigation buttons */}
              {imageAttachments.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) =>
                        prev === 0 ? imageAttachments.length - 1 : prev - 1
                      );
                    }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) =>
                        prev === imageAttachments.length - 1 ? 0 : prev + 1
                      );
                    }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Current image */}
              <img
                src={imageAttachments[activeImageIndex]?.file_url ? imageAttachments[activeImageIndex].file_url : "/placeholder.svg"}
                alt={`Comment image ${activeImageIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 rounded-md ${
              isLiked ? "text-blue-600" : "text-gray-500"
            }`}
            onClick={handleLike}
          >
            <ThumbsUp
              className={`h-4 w-4 mr-1 ${isLiked ? "fill-blue-600" : ""}`}
            />
            <span>{likeCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 rounded-md ${
              isDisliked ? "text-red-600" : "text-gray-500"
            }`}
            onClick={handleDislike}
          >
            <ThumbsDown
              className={`h-4 w-4 mr-1 ${isDisliked ? "fill-red-600" : ""}`}
            />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 rounded-md text-gray-500"
            onClick={handleReplyClick}
          >
            <Reply className="h-4 w-4 mr-1" />
            Reply
          </Button>

          {hasReplies && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 rounded-md text-gray-500 ml-auto"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide replies
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show replies ({comment.replies!.length})
                </>
              )}
            </Button>
          )}
        </div>

        {isReplyOpen && (
          <div className="mt-3 space-y-3">
            <textarea
              ref={replyTextareaRef}
              placeholder="Write your reply..."
              className="w-full min-h-[100px] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none gradient-border-focus resize-none overflow-hidden transition-all duration-300"
              value={replyText}
              onChange={handleReplyTextChange}
            />

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={imageInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              multiple
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.zip"
              onChange={handleFileChange}
              multiple
            />

            {/* Attachment previews */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="relative">
                    {attachment.type === "image" && attachment.previewUrl ? (
                      <div className="relative group">
                        <img
                          src={attachment.previewUrl || "/placeholder.svg"}
                          alt="Attachment preview"
                          className="max-h-40 rounded-md border border-gray-200"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center p-2 border border-gray-200 rounded-md bg-gray-50 group">
                        <FileIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <div className="flex-1 truncate">
                          <p className="text-sm font-medium">
                            {attachment.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.file.size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500"
                        onClick={handleImageClick}
                      >
                        <ImageIcon className="h-4 w-4 mr-1" />
                        Image
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Max size: {formatFileSize(MAX_IMAGE_SIZE)}</p>
                      <p className="text-xs">Supported: JPG, PNG, GIF, WebP</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500"
                        onClick={handleFileClick}
                      >
                        <Paperclip className="h-4 w-4 mr-1" />
                        Attach
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Max size: {formatFileSize(MAX_FILE_SIZE)}</p>
                      <p className="text-xs">Supported: PDF, DOC, TXT, ZIP</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReplyOpen(false);
                    setReplyText("");
                    setAttachments([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() && attachments.length === 0}
                >
                  Post Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isExpanded && hasReplies && (
        <div className="mt-3 space-y-3">
          {visibleReplies?.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              user={user}
              router={router}
              refreshComments={refreshComments}
              userVotes={userVotes}
            />
          ))}

          {hasHiddenReplies && (
            <Button
              variant="ghost"
              className="ml-6 text-blue-600 text-sm"
              onClick={() => setShowAllReplies(!showAllReplies)}
            >
              {showAllReplies
                ? "Show fewer replies"
                : `View ${
                    comment.replies!.length - maxVisibleReplies
                  } more replies`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const discussionId = typeof params.id === "string" ? params.id : "";
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const supabase = createBrowserClient();

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [poll, setPoll] = useState<DiscussionPoll | null>(null);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [userDiscussionVote, setUserDiscussionVote] = useState<Record<string, "up" | "down">>({});
  const [relatedDiscussions, setRelatedDiscussions] = useState<Discussion[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [commentText, setCommentText] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "popular">(
    "newest"
  );
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [categories, setCategories] = useState<DiscussionCategory[]>([]);

  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const mainFileInputRef = useRef<HTMLInputElement>(null);

  const isMobile = useMobile();

  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  // Auto-resize comment textarea when content changes
  useEffect(() => {
    const adjustHeight = () => {
      const textarea = commentTextareaRef.current;
      if (textarea) {
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = "auto";
        // Set the height to scrollHeight to fit the content
        textarea.style.height = `${Math.max(100, textarea.scrollHeight)}px`;
      }
    };

    adjustHeight();
    // Add event listener for window resize to readjust if needed
    window.addEventListener("resize", adjustHeight);

    return () => {
      window.removeEventListener("resize", adjustHeight);
    };
  }, [commentText]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => {
        if (
          attachment.previewUrl &&
          attachment.previewUrl.startsWith("blob:")
        ) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });
    };
  }, [attachments]);

  // Extract images from discussion when it loads
  useEffect(() => {
    if (discussion && discussion.attachments) {
      const imageAttachments = discussion.attachments
        .filter((att) => !att.is_deleted && att.file_type.startsWith("image/"))
        .map((att) => att.file_url);

      setImages(imageAttachments);
    }
  }, [discussion]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getDiscussionCategories()
        setCategories(data)
      } catch (err) {
        setCategories([])
      }
    }
    loadCategories()
  }, [])

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const fetchDiscussion = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDiscussionById(discussionId)
      if (!data) {
        setError(new Error("Discussion not found or has been deleted"))
      } else {
        // console.log('Fetched discussion:', data);
        if (data.attachments) {
          // console.log('Discussion attachments:', data.attachments);
        }
        setDiscussion(data)
      }
    } catch (err) {
      console.error("Error fetching discussion:", err)
      setError(
        err instanceof Error ? err : new Error("Failed to fetch discussion")
      )
    } finally {
      setLoading(false)
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      // Fetch top-level comments only
      const topLevelComments = await getDiscussionComments(discussionId, {
        sort_by: sortOrder,
        parentId: null, // Only get top-level comments
      });

      // Fetch replies for each top-level comment recursively
      const commentsWithReplies = await Promise.all(
        topLevelComments.map(async (comment) => {
          const replies = await fetchRepliesRecursively(comment.id);
          return { ...comment, replies };
        })
      );

      setComments(commentsWithReplies);

      // Fetch user votes for all comments
      if (user?.id) {
        await fetchUserCommentVotes(commentsWithReplies);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Recursive function to fetch all replies for a comment
  const fetchRepliesRecursively = async (
    parentId: string
  ): Promise<CommentType[]> => {
    try {
      const replies = await getDiscussionComments(discussionId, {
        parentId: parentId,
        sort_by: sortOrder,
      });

      // For each reply, fetch its own replies
      const repliesWithNestedReplies = await Promise.all(
        replies.map(async (reply) => {
          const nestedReplies = await fetchRepliesRecursively(reply.id);
          return { ...reply, replies: nestedReplies };
        })
      );

      return repliesWithNestedReplies;
    } catch (error) {
      console.error(`Error fetching replies for comment ${parentId}:`, error);
      return [];
    }
  };

  const fetchPoll = async () => {
    try {
      const data = await getDiscussionPoll(discussionId);
      setPoll(data);

      // Get user votes if authenticated and poll exists
      if (user && data) {
        const votes = await getUserPollVotes(data.id, user.id);
        setUserVotes(votes);
      }
    } catch (error) {
      console.error("Error fetching poll:", error);
    }
  };

  const fetchRelatedDiscussions = async () => {
    if (!discussion) return;

    try {
      const relatedData = await getRelatedDiscussions(
        discussionId,
        discussion.category_id,
        discussion.author_id,
        5
      );
      setRelatedDiscussions(relatedData);
    } catch (error) {
      console.error("Error fetching related discussions:", error);
      setRelatedDiscussions([]);
    }
  };

  // Fetch user's existing votes for all comments
  const fetchUserCommentVotes = async (allComments: CommentType[]) => {
    if (!user) return;

    try {
      // Collect all comment IDs recursively
      const getAllCommentIds = (comments: CommentType[]): string[] => {
        const ids: string[] = [];
        comments.forEach((comment) => {
          ids.push(comment.id);
          if (comment.replies && comment.replies.length > 0) {
            ids.push(...getAllCommentIds(comment.replies));
          }
        });
        return ids;
      };

      const commentIds = getAllCommentIds(allComments);
      
      // Fetch votes for all comment IDs
      const votePromises = commentIds.map(commentId => 
        getUserCommentVote(commentId, user.id)
      );
      
      const votes = await Promise.all(votePromises);
      
      // Create a map of commentId -> vote_type
      const userVoteMap: Record<string, "up" | "down"> = {};
      commentIds.forEach((commentId, index) => {
        const vote = votes[index];
        if (vote) {
          userVoteMap[commentId] = vote.vote_type;
        }
      });
      
      setUserDiscussionVote(userVoteMap);
    } catch (error) {
      console.error("Error fetching user comment votes:", error);
    }
  };

  useEffect(() => {
    if (discussionId) {
      fetchDiscussion();
      fetchComments();
      fetchPoll();
    }
  }, [discussionId]);

  useEffect(() => {
    if (discussion) {
      fetchRelatedDiscussions();
    }
  }, [discussion]);

  useEffect(() => {
    fetchComments();
  }, [sortOrder]);

  // Check user's existing vote for the discussion
  useEffect(() => {
    const checkUserStates = async () => {
      if (!user || !discussion) return;

      try {
        // Check discussion vote
        const userVote = await getUserDiscussionVote(discussionId, user.id);
        setIsLiked(!!userVote);

        // Check bookmark
        const bookmark = await getUserBookmark(discussionId, user.id);
        setIsBookmarked(!!bookmark);
      } catch (error) {
        console.error("Error checking user states:", error);
      }
    };

    checkUserStates();
  }, [user, discussion]);

  const refresh = () => {
    fetchDiscussion();
    fetchPoll();
  };

  const refreshComments = () => {
    fetchComments();
  };

  const handleCommentTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCommentText(e.target.value);
  };

  const handleShareDiscussion = () => {
    const shareUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    }/discussions/${discussionId}`;

    if (isMobile && navigator.share) {
      navigator
        .share({
          title: discussion?.title || "Discussion",
          text: `Check out this discussion: ${discussion?.title}`,
          url: shareUrl,
        })
        .then(() => {
          // Record the share
          if (user) {
            recordShare(user.id, "social", "native", discussionId).catch(
              console.error
            );
          }
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      // For desktop: copy to clipboard
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);

          // Record the share
          if (user) {
            recordShare(user.id, "link", "clipboard", discussionId).catch(
              console.error
            );
          }
        })
        .catch((err) => console.error("Error copying link:", err));
    }
  };

  const handleMainImageClick = () => {
    mainImageInputRef.current?.click();
  };

  const handleMainFileClick = () => {
    mainFileInputRef.current?.click();
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileAttachment[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        alert(
          `File type ${file.type} is not supported. Please upload JPEG, PNG, GIF or WebP images.`
        );
        return;
      }

      // Validate file size
      if (file.size > MAX_IMAGE_SIZE) {
        alert(
          `Image is too large. Maximum size is ${formatFileSize(
            MAX_IMAGE_SIZE
          )}.`
        );
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        type: "image",
        previewUrl,
      });
    });

    setAttachments((prev) => [...prev, ...newFiles]);

    // Reset the input
    e.target.value = "";
  };

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileAttachment[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert(
          `File type ${file.type} is not supported. Please upload PDF, Word, text, or ZIP files.`
        );
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(
          `File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`
        );
        return;
      }

      newFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        type: "document",
      });
    });

    setAttachments((prev) => [...prev, ...newFiles]);

    // Reset the input
    e.target.value = "";
  };

  const removeMainAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("You must be logged in to post a comment");
      return;
    }

    if (!commentText.trim() && attachments.length === 0) {
      toast.error("Comment cannot be empty and must have content or attachments");
      return;
    }

    try {
      // Create the comment first
      const newComment = await createComment({
        content: commentText,
        discussion_id: discussionId,
        author_id: user.id,
      });

      // Upload attachments if any
      if (attachments.length > 0) {
        await uploadAttachments(attachments, newComment.id, discussionId, user);
      }

      // Clean up preview URLs
      attachments.forEach((attachment) => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });

      setCommentText("");
      setAttachments([]);

      // Refresh comments
      refreshComments();

      toast.success("Comment submitted successfully!");
    } catch (error) {
      console.error("Error submitting comment:", error);
      let errorMessage = 'Failed to submit comment. ';
      
      if (error instanceof Error) {
        errorMessage += error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Try to extract error message from Supabase error
        const supabaseError = error as { message?: string; details?: string; hint?: string };
        errorMessage += supabaseError.message || supabaseError.details || supabaseError.hint || 'Please try again.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      toast.error(errorMessage);
    }
  };

  const handleVote = async (optionId: string) => {
    // Check if user is authenticated
    if (!user) {
      if (
        confirm(
          "You need to be logged in to vote. Would you like to log in now?"
        )
      ) {
        router.push(
          "/login?redirect=" + encodeURIComponent(window.location.pathname)
        );
      }
      return;
    }

    if (!poll) return;

    try {
      // Check if user already voted for this option
      const hasVotedForOption = userVotes.includes(optionId);

      if (hasVotedForOption && !poll.is_multiple_choice) {
        // For single choice polls, remove the vote by voting again
        await votePollSingleOption(poll.id, optionId, user.id);
      } else if (hasVotedForOption && poll.is_multiple_choice) {
        // For multiple choice polls, toggle the vote
        await votePollSingleOption(poll.id, optionId, user.id);
      } else {
        // Add new vote,
        await votePollSingleOption(poll.id, optionId, user.id);
      }

      // Refresh poll data to get updated vote counts and user votes
      await fetchPoll();
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to vote. Please try again.");
    }
  };

  const handleLikePost = async () => {
    // Check if user is authenticated
    if (!user) {
      if (
        confirm(
          "You need to be logged in to like this post. Would you like to log in now?"
        )
      ) {
        router.push(
          "/login?redirect=" + encodeURIComponent(window.location.pathname)
        );
      }
      return;
    }

    try {
      // Toggle like: if already liked, remove the like (downvote to neutral)
      // If not liked, add a like (upvote)
      const voteType = isLiked ? "down" : "up";
      await voteDiscussion(discussionId, user.id, voteType);

      // Toggle like state locally
      setIsLiked(!isLiked);

      // Refresh the discussion data to get updated vote count
      await fetchDiscussion();
    } catch (error) {
      console.error("Error liking post:", error);
      alert("Failed to like post. Please try again.");
    }
  };

  const handleBookmarkPost = async () => {
    // Check if user is authenticated
    if (!user) {
      if (
        confirm(
          "You need to be logged in to bookmark this post. Would you like to log in now?"
        )
      ) {
        router.push(
          "/login?redirect=" + encodeURIComponent(window.location.pathname)
        );
      }
      return;
    }

    try {
      const bookmarked = await toggleBookmark(user.id, discussionId);
      setIsBookmarked(bookmarked);
      toast.success(bookmarked ? "Discussion saved" : "Discussion unsaved");
    } catch (error) {
      console.error("Error bookmarking post:", error);
      toast.error("Failed to save discussion. Please try again.");
    }
  };

  const handleShare = () => {
    const shareUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    }/discussions/${discussionId}`;

    if (isMobile && navigator.share) {
      navigator
        .share({
          title: discussion?.title || "Discussion",
          text: `Check out this discussion: ${discussion?.title}`,
          url: shareUrl,
        })
        .then(() => {
          // Record the share
          if (user) {
            recordShare(user.id, "social", "native", discussionId).catch(
              console.error
            );
          }
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      // For desktop: copy to clipboard
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);

          // Record the share
          if (user) {
            recordShare(user.id, "link", "clipboard", discussionId).catch(
              console.error
            );
          }
        })
        .catch((err) => console.error("Error copying link:", err));
    }
  };

  if (loading) {
    return (
      <div className="w-full mx-auto p-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-gray-500">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="w-full mx-auto p-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-red-500">
            Error loading discussion. It may have been deleted or does not
            exist.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/discussions")}
          >
            Back to Discussions
          </Button>
        </div>
      </div>
    );
  }

  function openImagePreview(index: number): void {
    setActiveImageIndex(index);
    setIsImagePreviewOpen(true);
  }

  return (
    <ContentWrapper>
      <div className="w-full mx-auto p-4 min-h-screen">
        <style jsx global>{`
          @keyframes gradientBorder {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          .gradient-border-focus:focus {
            outline: none !important;
            border-color: transparent !important;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
            position: relative;
          }

          .gradient-border-focus:focus::before {
            content: "";
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(
              90deg,
              #3b82f6,
              #60a5fa,
              #93c5fd,
              #60a5fa,
              #3b82f6
            );
            background-size: 200% 100%;
            border-radius: 0.5rem;
            z-index: -1;
            animation: gradientBorder 3s ease infinite;
          }
        `}</style>
        {/* Main three-column layout container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto">
          {/* Left sidebar - Categories/Navigation (hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">My Activity</h3>
              <div className="space-y-2">
                {["My Posts", "Saved", "Following", "Drafts"].map((item) => (
                  <Button
                    key={item}
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div> */}
          </div>

          {/* Main content area */}
          <div className="col-span-1 lg:col-span-9 space-y-4">
            {/* Back button */}
            <div className="mb-4">
              <Button
                variant="ghost"
                className="flex items-center text-blue-600"
                onClick={() => router.push("/discussions")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Discussions
              </Button>
            </div>

            {/* Discussion post */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Author info */}
              <div className="flex items-center mb-4">
                <Avatar className="h-10 w-10 rounded-full mr-3">
                  <AvatarImage
                    src={discussion.author?.avatar_url || "/placeholder.svg"}
                    alt={discussion.author?.full_name || "User"}
                  />
                  <AvatarFallback>
                    {discussion.author?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-900">
                      {discussion.author?.full_name || "Anonymous"}
                    </h3>
                    {discussion.author?.role && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                        {discussion.author.role}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(discussion.created_at).toLocaleString()}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto rounded-full h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-5 w-5 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <ReportDialog
                      discussionId={discussion.id}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2">
                          <Flag className="w-4 h-4" />
                          Report Discussion
                        </DropdownMenuItem>
                      }
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Post content */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {discussion.title}
                </h1>

                {discussion.tags && discussion.tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {discussion.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="prose max-w-none mb-4">
                  {discussion.content?.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                  {/* Discussion Attachments */}
                  {discussion.attachments && discussion.attachments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Attachments</h4>
                      <div className="space-y-2">
                        {discussion.attachments
                          .filter((att) => !att.is_deleted && !att.file_type.startsWith("image/"))
                          .map((att) => (
                            <a
                              key={att.id}
                              href={att.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-blue-600 hover:underline"
                            >
                              {att.file_name}
                            </a>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Poll */}
                  {poll && (
                    <div className="my-6">
                      <DiscussionPollComponent
                        poll={poll}
                        discussionId={discussion?.id || ''}
                        onVoteUpdate={() => fetchPoll()}
                      />
                    </div>
                  )}

                  {/* Image Gallery */}
                  {images.length > 0 && (
                    <div className="mt-4 mb-6">
                      {/* Image Grid Layout */}
                      <div
                        className={`grid gap-2 ${
                          images.length === 1
                            ? "grid-cols-1"
                            : images.length === 2
                            ? "grid-cols-2"
                            : images.length >= 3
                            ? "grid-cols-2"
                            : ""
                        }`}
                      >
                        {/* First image (larger if 3+ images) */}
                        <div
                          className={`${
                            images.length >= 3 ? "row-span-2" : ""
                          } relative cursor-pointer`}
                          onClick={() => openImagePreview(0)}
                        >
                          <img
                            src={images[0] || "/placeholder.svg"}
                            alt={`Discussion visual 1`}
                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                          />
                        </div>

                        {/* Second image */}
                        {images.length >= 2 && (
                          <div
                            className="relative cursor-pointer"
                            onClick={() => openImagePreview(1)}
                          >
                            <img
                              src={images[1] || "/placeholder.svg"}
                              alt={`Discussion visual 2`}
                              className="w-full h-full object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}

                        {/* Third image */}
                        {images.length >= 3 && (
                          <div
                            className="relative cursor-pointer"
                            onClick={() => openImagePreview(2)}
                          >
                            <img
                              src={images[2] || "/placeholder.svg"}
                              alt={`Discussion visual 3`}
                              className="w-full h-full object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}

                        {/* Fourth image with overlay if more images */}
                        {images.length >= 4 && (
                          <div
                            className="relative cursor-pointer"
                            onClick={() => openImagePreview(3)}
                          >
                            <img
                              src={images[3] || "/placeholder.svg"}
                              alt={`Discussion visual 4`}
                              className="w-full h-full object-cover rounded-lg border border-gray-200"
                            />
                            {images.length > 4 && (
                              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                                <span className="text-white text-xl font-bold">
                                  +{images.length - 4} more
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Image Preview Modal */}
                  {isImagePreviewOpen && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
                      <div className="relative w-full max-w-4xl">
                        {/* Close button */}
                        <button
                          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full"
                          onClick={() => setIsImagePreviewOpen(false)}
                        >
                          <X className="h-6 w-6" />
                        </button>

                        {/* Navigation buttons */}
                        {images.length > 1 && (
                          <>
                            <button
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex((prev) =>
                                  prev === 0 ? images.length - 1 : prev - 1
                                );
                              }}
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex((prev) =>
                                  prev === images.length - 1 ? 0 : prev + 1
                                );
                              }}
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>
                          </>
                        )}

                        {/* Current image */}
                        <img
                          src={images[activeImageIndex] || "/placeholder.svg"}
                          alt={`Discussion visual ${activeImageIndex + 1}`}
                          className="w-full h-auto max-h-[80vh] object-contain"
                        />

                        {/* Image counter */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                          {activeImageIndex + 1} / {images.length}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interaction buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        className={`flex items-center gap-1 ${
                          isLiked ? "text-red-600" : "text-gray-500"
                        }`}
                        onClick={handleLikePost}
                      >
                        <Heart
                          className={`h-5 w-5 ${isLiked ? "fill-red-600" : ""}`}
                        />
                        <span>{discussion.vote_score}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 text-gray-500"
                        onClick={() => {
                          const commentsSection =
                            document.getElementById("comments");
                          if (commentsSection) {
                            commentsSection.scrollIntoView({
                              behavior: "smooth",
                            });
                          }
                        }}
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>{discussion.comment_count}</span>
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 text-gray-500"
                        onClick={handleShare}
                      >
                        <Share2 className="h-5 w-5" />
                        <span className="hidden sm:inline">
                          {linkCopied ? "Copied Link" : "Share"}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        className={`flex items-center gap-1 ${
                          isBookmarked ? "text-blue-600" : "text-gray-500"
                        }`}
                        onClick={handleBookmarkPost}
                      >
                        <Bookmark
                          className={`h-5 w-5 ${
                            isBookmarked ? "fill-blue-600" : ""
                          }`}
                        />
                        <span className="hidden sm:inline">Save</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment input */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Add a Comment
                </h3>
                {!user ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">
                      You need to be logged in to comment
                    </p>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() =>
                        router.push(
                          "/login?redirect=" +
                            encodeURIComponent(window.location.pathname)
                        )
                      }
                    >
                      Log in to comment
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 rounded-full">
                      <AvatarImage
                        src={userProfile?.avatar_url || user?.user_metadata?.avatar_url || undefined}
                        alt={userProfile?.full_name || user?.email || "User"}
                      />
                      <AvatarFallback>
                        {(userProfile?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <textarea
                        ref={commentTextareaRef}
                        placeholder="What are your thoughts?"
                        className="w-full min-h-[100px] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none gradient-border-focus resize-none overflow-hidden transition-all duration-300"
                        value={commentText}
                        onChange={handleCommentTextChange}
                      />

                      {/* Hidden file inputs for main comment */}
                      <input
                        type="file"
                        ref={mainImageInputRef}
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleMainImageChange}
                        multiple
                      />
                      <input
                        type="file"
                        ref={mainFileInputRef}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.zip"
                        onChange={handleMainFileChange}
                        multiple
                      />

                      {/* Attachment previews */}
                      {attachments.length > 0 && (
                        <div className="space-y-2">
                          {attachments.map((attachment) => (
                            <div key={attachment.id} className="relative">
                              {attachment.type === "image" &&
                              attachment.previewUrl ? (
                                <div className="relative group">
                                  <img
                                    src={
                                      attachment.previewUrl || "/placeholder.svg"
                                    }
                                    alt="Attachment preview"
                                    className="max-h-40 rounded-md border border-gray-200"
                                  />
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() =>
                                      removeMainAttachment(attachment.id)
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center p-2 border border-gray-200 rounded-md bg-gray-50 group">
                                  <FileIcon className="h-5 w-5 text-gray-500 mr-2" />
                                  <div className="flex-1 truncate">
                                    <p className="text-sm font-medium">
                                      {attachment.file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatFileSize(attachment.file.size)}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() =>
                                      removeMainAttachment(attachment.id)
                                    }
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-500"
                                  onClick={handleMainImageClick}
                                >
                                  <ImageIcon className="h-4 w-4 mr-1" />
                                  Image
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Max size: {formatFileSize(MAX_IMAGE_SIZE)}</p>
                                <p className="text-xs">
                                  Supported: JPG, PNG, GIF, WebP
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-500"
                                  onClick={handleMainFileClick}
                                >
                                  <Paperclip className="h-4 w-4 mr-1" />
                                  Attach
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Max size: {formatFileSize(MAX_FILE_SIZE)}</p>
                                <p className="text-xs">
                                  Supported: PDF, DOC, TXT, ZIP
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={handleSubmitComment}
                          disabled={
                            !commentText.trim() && attachments.length === 0
                          }
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Comments section */}
              <div
                id="comments"
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 scroll-mt-20"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">
                    Comments ({discussion.comment_count})
                  </h3>
                  <Select
                    value={sortOrder}
                    onValueChange={(value: "newest" | "oldest" | "popular") => {
                      setSortOrder(value);
                      fetchComments();
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-sm">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {commentsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading comments...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <Comment
                        key={comment.id}
                        comment={comment}
                        user={user}
                        router={router}
                        refreshComments={refreshComments}
                        userVotes={userDiscussionVote}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar - Ads and related content (hidden on mobile and tablet) */}
            {/* <div className="hidden lg:block lg:col-span-3 space-y-4">

              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-sm p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium bg-white bg-opacity-20 px-2 py-1 rounded">
                    Sponsored
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">Upgrade Your   Skills</h3>
                <p className="text-sm mb-3">
                  Get certified with our premium   training courses. Special
                  discount for community members.
                </p>
                <Link href="/training" passHref>
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Related Discussions
                </h3>
                <div className="space-y-3">
                  {relatedDiscussions.length > 0 ? (
                    relatedDiscussions.map((relatedDiscussion) => (
                      <div
                        key={relatedDiscussion.id}
                        className="group cursor-pointer"
                        onClick={() =>
                          router.push(`/discussions/${relatedDiscussion.id}`)
                        }
                      >
                        <p className="text-sm text-gray-700 group-hover:text-blue-600 line-clamp-2">
                          {relatedDiscussion.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-xs text-gray-600">
                              {relatedDiscussion.author?.full_name?.charAt(0) ||
                                "U"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              relatedDiscussion.created_at
                            ).toLocaleDateString()}{" "}
                            • {relatedDiscussion.comment_count} comments
                          </p>
                        </div>
                        {relatedDiscussion.category_id ===
                          discussion?.category_id && (
                          <Badge className="text-xs bg-blue-100 text-blue-700 mt-1">
                            Same Category
                          </Badge>
                        )}
                        {relatedDiscussion.author_id ===
                          discussion?.author_id && (
                          <Badge className="text-xs bg-green-100 text-green-700 mt-1">
                            Same Author
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No related discussions found
                    </p>
                  )}
                </div>
              </div>


              {discussion.author && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    About the Author
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12 rounded-full">
                      <AvatarImage
                        src={discussion.author.avatar_url || "/placeholder.svg"}
                        alt={discussion.author.full_name || "User"}
                      />
                      <AvatarFallback>
                        {discussion.author.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {discussion.author.full_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {discussion.author.role || "Community Member"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Active community member contributing to Mockify discussions.
                  </p>
                  <Button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100">
                    Follow
                  </Button>
                </div>
              )}
            </div> */}
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
}