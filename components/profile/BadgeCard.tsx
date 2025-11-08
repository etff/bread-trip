interface BadgeCardProps {
  badge: {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    color: string | null;
  };
  earned?: boolean;
  earnedAt?: string;
}

export default function BadgeCard({ badge, earned = false, earnedAt }: BadgeCardProps) {
  return (
    <div
      className={`relative rounded-xl p-4 border-2 transition-all ${
        earned
          ? "bg-white border-brown shadow-sm"
          : "bg-gray-50 border-gray-200 opacity-60"
      }`}
    >
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 rounded-xl">
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
      <div className="flex flex-col items-center gap-2 text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
            earned ? "" : "grayscale"
          }`}
          style={
            earned && badge.color
              ? { backgroundColor: badge.color }
              : undefined
          }
        >
          {badge.icon}
        </div>
        <div>
          <h4
            className={`font-bold ${earned ? "text-brown" : "text-gray-500"}`}
          >
            {badge.name}
          </h4>
          <p
            className={`text-xs mt-1 ${
              earned ? "text-gray-600" : "text-gray-400"
            }`}
          >
            {badge.description}
          </p>
          {earned && earnedAt && (
            <p className="text-xs text-gray-400 mt-1">
              {new Date(earnedAt).toLocaleDateString("ko-KR")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
