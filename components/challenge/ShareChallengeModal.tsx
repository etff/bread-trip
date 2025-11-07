"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Copy, Check, Share2 } from "lucide-react";

interface ShareChallengeModalProps {
  challengeId: string;
  challengeName: string;
  onClose: () => void;
}

export default function ShareChallengeModal({
  challengeId,
  challengeName,
  onClose,
}: ShareChallengeModalProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generateShareLink = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/challenges/${challengeId}/share`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "공유 링크 생성에 실패했습니다.");
      }

      const data = await response.json();
      setShareUrl(data.share_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("클립보드 복사에 실패했습니다.");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: challengeName,
          text: `${challengeName} - 빵지순례 챌린지`,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="챌린지 공유하기">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          다른 사람들과 챌린지를 공유하고 함께 빵지순례를 떠나보세요!
        </p>

        {!shareUrl ? (
          <button
            onClick={generateShareLink}
            disabled={loading}
            className="w-full bg-brown text-white px-4 py-3 rounded-lg hover:bg-brown-dark transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? "링크 생성 중..." : "공유 링크 생성"}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="flex-shrink-0 p-2 hover:bg-white rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copied ? "복사됨!" : "링크 복사"}
              </button>

              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brown text-white rounded-lg hover:bg-brown-dark transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  공유하기
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center">
              공유 링크를 통해 다른 사람들이 이 챌린지를 볼 수 있습니다
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
