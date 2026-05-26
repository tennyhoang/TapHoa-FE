'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, BookOpen, Trash2, ChevronDown, ChevronUp, RefreshCw, Send } from 'lucide-react';
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

export default function AdminCamNangPage() {
  const queryClient = useQueryClient();
  const [topic, setTopic]       = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [preview, setPreview]   = useState<GeneratedArticle | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: publishedArticles = [] } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: articleService.getAll,
  });

  const generateMutation = useMutation({
    mutationFn: () => articleService.generate(topic, category),
    onSuccess: (data) => setPreview(data),
    onError: () => toast.error('Tạo bài thất bại — kiểm tra GROQ_API_KEY trên Render'),
  });

  const publishMutation = useMutation({
    mutationFn: () => articleService.publish({
      title: preview!.title,
      excerpt: preview!.excerpt,
      content: preview!.content,
      category,
      readTimeMinutes: Math.ceil(preview!.content.split(' ').length / 200),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setPreview(null);
      setTopic('');
      toast.success('Đã đăng bài lên Cẩm nang!');
    },
    onError: () => toast.error('Đăng bài thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => articleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Đã xóa bài viết');
    },
    onError: () => toast.error('Xóa thất bại'),
  });

  const activeCat = CATEGORIES.find(c => c.value === category)!;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cẩm nang</h1>
        <p className="text-sm text-muted-foreground mt-1">Tạo và đăng bài viết tự động bằng AI</p>
      </div>

      {/* Generator */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Tạo bài mới
        </p>

        <div className="grid sm:grid-cols-[1fr_180px_auto] gap-3 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Chủ đề</label>
            <Input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="VD: Cách chọn mua thịt heo tươi an toàn..."
              onKeyDown={e => e.key === 'Enter' && topic.trim() && generateMutation.mutate()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Danh mục</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!topic.trim() || generateMutation.isPending}
            className="h-9 gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {generateMutation.isPending ? 'Đang tạo...' : 'Tạo bài'}
          </Button>
        </div>

        {/* Preview */}
        {preview && (
          <div className="border border-primary/20 rounded-xl bg-primary/5 p-5 space-y-4">
            <div>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                style={{ background: activeCat.color }}
              >
                {activeCat.label}
              </span>
              <h2 className="mt-2.5 text-base font-bold text-foreground leading-snug">{preview.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{preview.excerpt}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">{preview.content}</pre>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setPreview(null)}>Bỏ</Button>
              <Button
                variant="outline" size="sm"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Tạo lại
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
              >
                <Send className="h-3.5 w-3.5" />
                {publishMutation.isPending ? 'Đang đăng...' : 'Đăng bài'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Published articles */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Bài đã đăng</span>
          {publishedArticles.length > 0 && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{publishedArticles.length}</span>
          )}
        </div>

        {publishedArticles.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Chưa có bài nào — tạo và đăng bài đầu tiên ở trên
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {publishedArticles.map(article => {
              const cat   = CATEGORIES.find(c => c.value === article.category);
              const isOpen = expanded === article.id;
              return (
                <div key={article.id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                          style={{ background: cat?.color ?? '#888' }}
                        >
                          {cat?.label ?? article.category}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-foreground line-clamp-1">{article.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{article.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setExpanded(isOpen ? null : article.id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                      >
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => { if (confirm('Xóa bài viết này?')) deleteMutation.mutate(article.id); }}
                        disabled={deleteMutation.isPending && deleteMutation.variables === article.id}
                        className="p-1.5 rounded-lg hover:bg-destructive/8 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="mt-3 bg-muted rounded-lg border border-border/60 p-4 max-h-56 overflow-y-auto">
                      <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">{article.content}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
