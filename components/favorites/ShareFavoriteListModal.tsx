"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Share2, Copy, Check, X } from "lucide-react";

interface ShareFavoriteListModalProps {
  onClose: () => void;
}

export default function ShareFavoriteListModal({
  onClose,
}: ShareFavoriteListModalProps) {
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchShareToken();
  }, []);

  const fetchShareToken = async () => {
    try {
      const response = await fetch("/api/favorites/share");
      if (response.ok) {
        const data = await response.json();
        setShareToken(data.favoriteList.share_token);
      }
    } catch (error) {
      console.error("공유 링크 조회 실패:", error);
    }
  };

  const generateShareLink = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/favorites/share", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setShareToken(data.favoriteList.share_token);
      } else {
        const data = await response.json();
        setError(data.error || "공유 링크 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("공유 링크 생성 실패:", error);
      setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const deleteShareLink = async () => {
    if (!confirm("공유 링크를 삭제하시겠습니까?")) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/favorites/share", {
        method: "DELETE",
      });

      if (response.ok) {
        setShareToken(null);
      } else {
        const data = await response.json();
        setError(data.error || "공유 링크 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("공유 링크 삭제 실패:", error);
      setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareToken) return;

    const shareUrl = `${window.location.origin}/favorites/shared/${shareToken}`;

    try {
      if (typeof navigator !== "undefined" && "clipboard" in navigator) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else if (
        typeof navigator !== "undefined" &&
        "share" in navigator &&
        typeof (navigator as any).share === "function"
      ) {
        await (navigator as any).share({
          title: "나의 찜목록",
          text: "내가 찜한 빵집 목록을 공유합니다!",
          url: shareUrl,
        });
      }
    } catch (error) {
      console.error("복사 실패:", error);
    }
  };

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/favorites/shared/${shareToken}`
    : "";

  return (
    <Modal isOpen={true} onClose={onClose} title="찜목록 공유">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          찜목록을 공유하면 다른 사람들이 내가 찜한 빵집 목록을 볼 수 있어요.
        </p>

        {!shareToken ? (
          <button
            onClick={generateShareLink}
            disabled={loading}
            className="w-full bg-brown text-white px-4 py-3 rounded-lg hover:bg-brown-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                생성 중...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                공유 링크 생성하기
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-cream rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-2">공유 링크</p>
              <p className="text-sm text-brown font-mono break-all">{shareUrl}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-brown text-white px-4 py-2 rounded-lg hover:bg-brown-dark transition-colors font-medium flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    복사됨!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    링크 복사
                  </>
                )}
              </button>

              <button
                onClick={deleteShareLink}
                disabled={loading}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                링크 삭제
              </button>
            </div>

            <p className="text-xs text-gray-500">
              💡 이 링크를 아는 사람은 누구나 내 찜목록을 볼 수 있습니다.
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
