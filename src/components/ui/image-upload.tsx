'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

async function uploadToCloudinary(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(UPLOAD_URL, { method: 'POST', body: form });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error?.message ?? 'Upload thất bại');
  return data.secure_url as string;
}

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function ImageUpload({ value, onChange, placeholder = 'Tải ảnh lên' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err?.message ?? 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {value ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 group border border-gray-200">
          <Image src={value} alt="preview" fill className="object-cover" sizes="400px" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-700 rounded-lg px-3 py-1.5 text-xs font-medium mr-2 hover:bg-gray-100"
            >
              Đổi ảnh
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-500 text-white rounded-lg p-1.5 hover:bg-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50/30 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="text-xs text-gray-500">Đang tải lên Cloudinary...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">{placeholder}</p>
              <p className="text-xs text-gray-400">Kéo thả hoặc click để chọn • JPG, PNG, WebP • Tối đa 5MB</p>
            </>
          )}
        </div>
      )}

      {uploading && value && (
        <div className="flex items-center gap-2 text-xs text-blue-600">
          <Loader2 className="h-3 w-3 animate-spin" /> Đang tải lên...
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
