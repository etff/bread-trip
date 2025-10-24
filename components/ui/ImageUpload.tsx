"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { uploadBakeryImage } from "@/lib/supabase/storage";

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImage?: string;
}

export default function ImageUpload({
  onUploadComplete,
  currentImage,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드
    setIsUploading(true);
    try {
      const url = await uploadBakeryImage(file);
      onUploadComplete(url);
    } catch (error) {
      alert("이미지 업로드에 실패했습니다.");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {preview ? (
        <div className="relative rounded-lg overflow-hidden border-2 border-cream">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            disabled={isUploading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-brown hover:bg-cream/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 font-medium">
            {isUploading ? "업로드 중..." : "이미지를 선택하거나 드래그하세요"}
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG (최대 5MB)</p>
        </button>
      )}
    </div>
  );
}
