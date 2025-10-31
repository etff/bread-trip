"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signUp, signIn } from "@/app/actions/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "signup") {
        // 회원가입
        if (!nickname.trim()) {
          setError("닉네임을 입력해주세요.");
          setIsLoading(false);
          return;
        }

        const result = await signUp(email, password, nickname);

        if (result.error) {
          setError(result.error);
        } else {
          setSuccess(true);
          setTimeout(() => {
            handleClose();
            router.push('/');
            router.refresh();
          }, 2000);
        }
      } else {
        // 로그인
        const result = await signIn(email, password);

        if (result.error) {
          setError(result.error);
        } else {
          setSuccess(true);
          setTimeout(() => {
            handleClose();
            router.push('/');
            router.refresh();
          }, 1000);
        }
      }
    } catch (err) {
      setError("처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setNickname("");
    setError("");
    setSuccess(false);
    setMode("signin");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === "signin" ? "로그인" : "회원가입"}
    >
      {success ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-lg font-semibold mb-2">
            {mode === "signin" ? "로그인 완료!" : "회원가입 완료!"}
          </h3>
          <p className="text-gray-600 text-sm">
            {mode === "signin"
              ? "환영합니다!"
              : "빵지순례에 오신 것을 환영합니다!"}
          </p>
        </div>
      ) : (
        <>
          {/* 탭 */}
          <div className="flex gap-2 mb-6 p-1 bg-cream rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === "signin"
                  ? "bg-white text-brown shadow-sm"
                  : "text-gray-600 hover:text-brown"
              }`}
              onClick={() => {
                setMode("signin");
                setError("");
              }}
            >
              로그인
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-white text-brown shadow-sm"
                  : "text-gray-600 hover:text-brown"
              }`}
              onClick={() => {
                setMode("signup");
                setError("");
              }}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <Input
                type="text"
                label="닉네임"
                placeholder="사용할 닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                disabled={isLoading}
              />
            )}

            <Input
              type="email"
              label="이메일"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            <Input
              type="password"
              label="비밀번호"
              placeholder="6자 이상 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
            />

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "처리 중..."
                : mode === "signin"
                ? "로그인"
                : "회원가입"}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              {mode === "signin" ? (
                <>
                  계정이 없으신가요?{" "}
                  <button
                    type="button"
                    className="text-brown font-medium hover:underline"
                    onClick={() => setMode("signup")}
                  >
                    회원가입하기
                  </button>
                </>
              ) : (
                <>
                  이미 계정이 있으신가요?{" "}
                  <button
                    type="button"
                    className="text-brown font-medium hover:underline"
                    onClick={() => setMode("signin")}
                  >
                    로그인하기
                  </button>
                </>
              )}
            </p>
          </form>
        </>
      )}
    </Modal>
  );
}
