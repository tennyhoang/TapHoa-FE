'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Props {
  thumbnailUrl?: string;
  images: string[];
  productName: string;
  outOfStock?: boolean;
  discountPct?: number | null;
}

export function ProductImageGallery({ thumbnailUrl, images, productName, outOfStock, discountPct }: Props) {
  const all = [
    ...(thumbnailUrl ? [thumbnailUrl] : []),
    ...images.filter(img => img !== thumbnailUrl),
  ];

  const [active, setActive] = useState(0);
  const src = all[active];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
        {src ? (
          <Image
            src={src}
            alt={productName}
            fill
            className="object-cover transition-opacity duration-200"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <span className="text-sm text-gray-400 font-medium">Chưa có ảnh</span>
          </div>
        )}

        {discountPct && (
          <div className="absolute top-4 left-4">
            <span className="bg-red-500 text-white text-sm px-3 py-1 font-bold rounded-xl">
              -{discountPct}%
            </span>
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
            <span className="bg-white text-gray-700 font-bold px-6 py-2 rounded-full text-lg">Hết hàng</span>
          </div>
        )}
      </div>

      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {all.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === active ? 'border-emerald-500' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image src={img} alt={`${productName} ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
