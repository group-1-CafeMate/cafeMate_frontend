import { Star } from "lucide-react";

const renderStars = (rating: number) => (
  <div className="flex items-center space-x-1">
    {Array.from({ length: 5 }, (_, index) => {
      const isFullStar = index < Math.floor(rating);
      const isHalfStar =
        !isFullStar && index === Math.floor(rating) && rating % 1 >= 0.5;

      return (
        <span key={index} className="relative inline-block">
          <Star
            className={`w-5 h-5 ${
              isFullStar
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
          {isHalfStar && (
            <Star
              className="w-5 h-5 absolute top-0 left-0 fill-yellow-400 text-yellow-400"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
          )}
        </span>
      );
    })}
    <span className="ml-2 font-semibold">{rating.toFixed(1)}</span>
  </div>
);

const renderEmojiStars = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push("⭐"); // Full star
    } else if (i === fullStars && hasHalfStar) {
      stars.push("✭"); // Half star
    } else {
      stars.push("☆"); // Empty star
    }
  }
  return stars.join("");
};
export default renderStars;
export { renderEmojiStars };
// export default renderStars;
