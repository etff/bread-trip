"use client";

import { Star, MapPin, Heart } from "lucide-react";
import Link from "next/link";

export interface Activity {
  id: string;
  type: "review" | "favorite";
  bakery: {
    id: string;
    name: string;
    image_url: string | null;
  };
  rating?: number;
  comment?: string | null;
  created_at: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-brown mb-4">최근 활동</h3>
        <div className="text-center py-8 text-gray-600">
          <p>아직 활동 내역이 없습니다</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "review":
        return <Star className="w-5 h-5 text-yellow-500" />;
      case "favorite":
        return <Heart className="w-5 h-5 text-red-500" />;
      default:
        return <MapPin className="w-5 h-5 text-brown" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "review":
        return (
          <>
            <span className="font-bold">{activity.bakery.name}</span>에 리뷰를
            작성했습니다
          </>
        );
      case "favorite":
        return (
          <>
            <span className="font-bold">{activity.bakery.name}</span>을(를)
            찜했습니다
          </>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-brown mb-4">최근 활동</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative">
            {/* Timeline line */}
            {index !== activities.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200" />
            )}

            <Link
              href={`/bakeries/${activity.bakery.id}`}
              className="flex gap-4 group"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center relative z-10">
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 group-hover:text-brown transition-colors">
                  {getActivityText(activity)}
                </p>
                {activity.type === "review" && activity.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < activity.rating!
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
                {activity.type === "review" && activity.comment && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {activity.comment}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(activity.created_at)}
                </p>
              </div>

              {/* Bakery Image */}
              {activity.bakery.image_url && (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                  <img
                    src={activity.bakery.image_url}
                    alt={activity.bakery.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
