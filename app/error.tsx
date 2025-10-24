"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("에러 발생:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-warm flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm text-center">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          문제가 발생했습니다
        </h2>
        <p className="text-gray-700 mb-4 font-medium">
          일시적인 오류입니다. 다시 시도해주세요.
        </p>
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg text-left">
            <p className="text-xs text-red-800 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
        <div className="space-y-3">
          <Button onClick={reset} className="w-full">
            다시 시도
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="w-full"
          >
            홈으로 가기
          </Button>
        </div>
      </div>
    </div>
  );
}
