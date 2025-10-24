"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signInWithEmail } from "@/app/actions/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signInWithEmail(email);

      if (result.error) {
        setError(result.error);
      } else {
        setIsSent(true);
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setIsSent(false);
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="로그인">
      {isSent ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-4">📧</div>
          <h3 className="text-lg font-semibold mb-2">이메일을 확인하세요</h3>
          <p className="text-gray-600 text-sm">
            {email}로 로그인 링크를 보냈습니다.
            <br />
            이메일의 링크를 클릭하면 로그인됩니다.
          </p>
          <Button onClick={handleClose} className="mt-6 w-full">
            확인
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-gray-600 text-sm mb-4">
            이메일 주소를 입력하면 로그인 링크를 보내드립니다.
          </p>

          <Input
            type="email"
            label="이메일"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            required
            disabled={isLoading}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "전송 중..." : "로그인 링크 받기"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            빵지순례가 처음이신가요?
            <br />
            자동으로 계정이 생성됩니다.
          </p>
        </form>
      )}
    </Modal>
  );
}
