'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { formatPrice } from '@/lib/format';

interface Props {
  item: CartItemType;
  onUpdate: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  updating: boolean;
  removing: boolean;
}

export function CartItem({ item, onUpdate, onRemove, updating, removing }: Props) {
  const busy = updating || removing;

  return (
    <div
      className={`bg-card rounded-xl p-4 flex gap-4 border border-border/60 transition-opacity ${busy ? 'opacity-60' : ''}`}
    >
      <Link
        href={`/products/${item.productId}`}
        className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted/50 shrink-0 hover:opacity-90 transition-opacity"
      >
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/50">
            <span className="text-[10px] text-muted-foreground">N/A</span>
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.productId}`}
            className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
          >
            {item.productName}
          </Link>
          <button
            onClick={() => onRemove(item.productId)}
            disabled={busy}
            className="shrink-0 w-6 h-6 rounded-full bg-muted hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-muted-foreground disabled:opacity-40 transition-colors"
            aria-label="Xóa sản phẩm"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">{formatPrice(item.unitPrice)} / sản phẩm</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => onUpdate(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1 || busy}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted/50 disabled:opacity-40 transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-foreground border-x border-border">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdate(item.productId, item.quantity + 1)}
              disabled={busy}
              className="w-7 h-7 flex items-center justify-center bg-primary text-white hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <p className="font-bold text-primary text-sm">{formatPrice(item.subtotal)}</p>
        </div>
      </div>
    </div>
  );
}
