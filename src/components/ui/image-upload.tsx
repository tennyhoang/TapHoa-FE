'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

async function uploadToBackend(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<{ url: string }>('/upload/cloudinary-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
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
      const url = await uploadToBackend(file);
      onChange(url);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message ?? err?.message ?? 'Upload thất bại');
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
              <p className="text-xs text-gray-500">Đang tải lên...</p>
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

      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Hoặc nhập URL trực tiếp"
          className="flex-1 h-8 px-3 text-xs rounded-md border border-gray-200 bg-white text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-gray-400 hover:text-red-500 shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {uploading && value && (
        <div className="flex items-center gap-2 text-xs text-blue-600">
          <Loader2 className="h-3 w-3 animate-spin" /> Đang tải lên...
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
