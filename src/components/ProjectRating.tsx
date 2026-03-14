import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, ThumbsUp, Flag, Send } from 'lucide-react';

interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  reported: boolean;
}

interface ProjectRatingProps {
  projectId: string;
  projectTitle: string;
  canReview: boolean;
  onReviewSubmitted?: () => void;
}

export default function ProjectRating({ projectId, projectTitle, canReview, onReviewSubmitted }: ProjectRatingProps) {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [projectId]);

  const loadReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('projectId', '==', projectId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];

      setReviews(reviewsData);
      setTotalReviews(reviewsData.length);

      if (reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
        setAverageRating(avg);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!profile || !rating || !comment.trim()) return;

    setSubmitting(true);
    try {
      const reviewData = {
        projectId,
        reviewerId: profile.uid,
        reviewerName: profile.displayName || 'Anonymous',
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        helpful: 0,
        reported: false
      };

      await addDoc(collection(db, 'reviews'), reviewData);
      setShowReviewForm(false);
      setRating(0);
      setComment('');
      await loadReviews();
      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        await updateDoc(reviewRef, { helpful: review.helpful + 1 });
        await loadReviews();
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const reportReview = async (reviewId: string) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, { reported: true });
      await loadReviews();
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };

  const renderStars = (rating: number, interactive = false, size: 'sm' | 'md' | 'lg' = 'md') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${starSize} ${interactive ? 'cursor-pointer' : ''}`}
          >
            <Star
              className={`${
                star <= (interactive ? (hoverRating || rating) : rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-zinc-600'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold mb-2">Project Reviews</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {renderStars(averageRating)}
              <span className="text-lg font-bold text-zinc-200">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-zinc-500">({totalReviews} reviews)</span>
          </div>
        </div>

        {canReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Write Review
          </button>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-white/10 rounded-xl p-6 mb-6"
          >
            <h4 className="font-bold mb-4">Share your experience with "{projectTitle}"</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Rating</label>
                <div className="flex gap-2">
                  {renderStars(rating, true, 'lg')}
                  <span className="text-zinc-500 ml-2">
                    {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell others about your experience working on this project..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none text-white placeholder:text-zinc-600 resize-none"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={submitReview}
                  disabled={submitting || !rating || !comment.trim()}
                  className="px-6 py-3 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit Review
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-3 bg-zinc-800 text-zinc-400 rounded-xl font-bold hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-white/5 pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-400">
                      {review.reviewerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-zinc-200">{review.reviewerName}</p>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating, false, 'sm')}
                      <span className="text-xs text-zinc-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => reportReview(review.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              <p className="text-zinc-300 mb-3 leading-relaxed">{review.comment}</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => markHelpful(review.id)}
                  className="flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">Helpful ({review.helpful})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}