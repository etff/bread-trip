import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export default function StarRating({
  rating,
  reviewCount,
  size = "md",
  showCount = true,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const starSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  // 별 5개 생성
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    const isFilled = starValue <= Math.round(rating);

    return (
      <Star
        key={index}
        className={`${starSize} ${
          isFilled
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    );
  });

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex items-center gap-0.5">{stars}</div>
      <div className={`${textSize} font-semibold text-gray-700 flex items-center gap-1`}>
        <span>{rating.toFixed(1)}</span>
        {showCount && reviewCount !== undefined && (
          <span className="text-gray-500 font-medium">({reviewCount})</span>
        )}
      </div>
    </div>
  );
}
