'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Copy, BookOpen, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { articleService, GeneratedArticle } from '@/services/article.service';

const CATEGORIES = [
  { value: 'dinh-duong',          label: 'Dinh dưỡng',           color: 'oklch(0.54 0.158 145)' },
  { value: 'mua-sam-thong-minh',  label: 'Mua sắm thông minh',   color: 'oklch(0.57 0.135 196)' },
  { value: 'he-thong-hub',        label: 'Hệ thống Hub',         color: 'oklch(0.55 0.15 280)'  },
  { value: 'san-pham-noi-bat',    label: 'Sản phẩm nổi bật',     color: 'oklch(0.75 0.155 55)'  },
];

interface Draft {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  topic: string;
  createdAt: string;
}

const STORAGE_KEY = 'cam-nang-drafts';

function getDrafts(): Draft[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export default function AdminCamNangPage() {
  const [topic, setTopic]           = useState('');
  const [category, setCategory]     = useState(CATEGORIES[0].value);
  const [preview, setPreview]       = useState<GeneratedArticle | null>(null);
  const [drafts, setDrafts]         = useState<Draft[]>(() => getDrafts());
  const [expanded, setExpanded]     = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: () => articleService.generate(topic, category),
    onSuccess:  (data) => setPreview(data),
    onError:    () => toast.error('Tạo bài thất bại — kiểm tra backend endpoint + GEMINI_API_KEY'),
  });

  function saveDraft() {
    if (!preview) return;
    const draft: Draft = {
      id: crypto.randomUUID(),
      ...preview,
      category,
      topic,
      createdAt: new Date().toISOString(),
    };
    const updated = [draft, ...getDrafts()];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDrafts(updated);
    setPreview(null);
    setTopic('');
    toast.success('Đã lưu nháp');
  }

  function deleteDraft(id: string) {
    const updated = getDrafts().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setDrafts(updated);
    if (expanded === id) setExpanded(null);
    toast.success('Đã xóa');
  }

  function copyCode(draft: Draft) {
    const cat = CATEGORIES.find(c => c.value === draft.category);
    const code = `  {
    image: 'https://images.unsplash.com/photo-TODO?w=600&q=85&auto=format&fit=crop',
    category: '${cat?.label ?? draft.category}',
    categoryColor: '${cat?.color ?? '#888'}',
    title: '${draft.title.replace(/'/g, "\\'")}',
    desc: '${draft.excerpt.replace(/'/g, "\\'")}',
    readTime: '5 phút',
  },`;
    navigator.clipboard.writeText(code);
    toast.success('Đã copy — dán vào mảng ARTICLES trong cam-nang/page.tsx');
  }

  const activeCat = CATEGORIES.find(c => c.value === category)!;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cẩm nang</h1>
        <p className="text-sm text-gray-500 mt-1">Tạo bài viết tự động bằng AI — Gemini API (miễn phí)</p>
      </div>

      {/* Generator */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Sparkles className="h-4 w-4 text-purple-500" />
          Tạo bài mới
        </p>

        <div className="grid sm:grid-cols-[1fr_180px_auto] gap-3 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Chủ đề</label>
            <Input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="VD: Cách chọn mua thịt heo tươi an toàn..."
              onKeyDown={e => e.key === 'Enter' && topic.trim() && generateMutation.mutate()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Danh mục</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!topic.trim() || generateMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 h-9 gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {generateMutation.isPending ? 'Đang tạo...' : 'Tạo bài'}
          </Button>
        </div>

        {/* Preview */}
        {preview && (
          <div className="border border-purple-100 rounded-xl bg-purple-50/30 p-5 space-y-4">
            <div>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                style={{ background: activeCat.color }}
              >
                {activeCat.label}
              </span>
              <h2 className="mt-2.5 text-base font-bold text-gray-900 leading-snug">{preview.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{preview.excerpt}</p>
            </div>

            <div className="bg-white rounded-lg border border-purple-100 p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{preview.content}</pre>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setPreview(null)}>Bỏ</Button>
              <Button
                variant="outline" size="sm" gap-1
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Tạo lại
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={saveDraft}>
                Lưu nháp
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Drafts */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Bản nháp đã lưu</span>
          {drafts.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{drafts.length}</span>
          )}
        </div>

        {drafts.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Chưa có bản nháp nào
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {drafts.map(draft => {
              const cat = CATEGORIES.find(c => c.value === draft.category);
              const isOpen = expanded === draft.id;
              return (
                <div key={draft.id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                          style={{ background: cat?.color ?? '#888' }}
                        >
                          {cat?.label ?? draft.category}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(draft.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-gray-800 line-clamp-1">{draft.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{draft.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => copyCode(draft)}
                        className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        <Copy className="h-3 w-3" /> Copy code
                      </button>
                      <button
                        onClick={() => setExpanded(isOpen ? null : draft.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                      >
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deleteDraft(draft.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="mt-3 bg-gray-50 rounded-lg border border-gray-100 p-4 max-h-56 overflow-y-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{draft.content}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How-to */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
        <p className="text-xs font-semibold text-amber-700 mb-2">Cách dùng</p>
        <ol className="text-xs text-amber-600 space-y-1 list-decimal list-inside leading-relaxed">
          <li>Điền chủ đề → chọn danh mục → nhấn &ldquo;Tạo bài&rdquo;</li>
          <li>Xem preview → &ldquo;Tạo lại&rdquo; nếu chưa ưng → &ldquo;Lưu nháp&rdquo;</li>
          <li>Nhấn &ldquo;Copy code&rdquo; trên bản nháp</li>
          <li>Mở <code className="bg-amber-100 px-1 rounded font-mono">src/app/cam-nang/page.tsx</code> → dán vào mảng <code className="bg-amber-100 px-1 rounded font-mono">ARTICLES</code></li>
          <li>Thay <code className="bg-amber-100 px-1 rounded font-mono">photo-TODO</code> bằng ID ảnh từ Unsplash</li>
        </ol>
        <p className="text-[11px] text-amber-400 mt-3">
          Backend cần: <code className="bg-amber-100 px-1 rounded font-mono">POST /admin/articles/generate</code> + biến môi trường <code className="bg-amber-100 px-1 rounded font-mono">GEMINI_API_KEY</code>
        </p>
      </div>
    </div>
  );
}
