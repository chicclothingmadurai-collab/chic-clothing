import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, Flag, MoreVertical } from "lucide-react";

const ReviewCard = ({ review, showActions = true, onHelpful, onReport, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const {
    user,
    rating,
    title,
    comment,
    images,
    createdAt,
    helpful,
    verifiedPurchase
  } = review;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`}
      />
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const shouldTruncate = comment && comment.length > 200;
  const displayComment = isExpanded || !shouldTruncate
    ? comment
    : `${comment.slice(0, 200)}...`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-stone-600 font-semibold text-sm">
                {user?.name?.charAt(0) || "U"}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-stone-900">{user?.name || "Anonymous"}</p>
              {verifiedPurchase && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs">
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-0.5">
                {renderStars(rating)}
              </div>
              <span className="text-xs text-stone-400">{formatDate(createdAt)}</span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-stone-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl border border-stone-100 shadow-lg z-10">
                {onReport && (
                  <button
                    onClick={() => {
                      onReport(review);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-t-xl"
                  >
                    Report
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(review);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-b-xl"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      {title && (
        <h4 className="font-semibold text-stone-900 mb-2">{title}</h4>
      )}

      {/* Comment */}
      {comment && (
        <div className="mb-3">
          <p className="text-sm text-stone-600 leading-relaxed">{displayComment}</p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-medium text-stone-500 hover:text-stone-900 mt-1"
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Images */}
      {images && images.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {images.slice(0, 4).map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Review ${index + 1}`}
              className="w-16 h-16 rounded-lg object-cover border border-stone-100 cursor-pointer hover:opacity-80 transition-opacity"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-4 pt-3 border-t border-stone-100">
          <button
            onClick={() => onHelpful?.(review)}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Helpful ({helpful?.length || 0})
          </button>
          <button
            onClick={() => onReport?.(review)}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-red-500 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            Report
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ReviewCard;