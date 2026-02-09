import { useState, useRef } from 'react';
import { Camera, Video, FileText, Music2, Upload, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ContentRow } from '@/hooks/useSessionData';

interface Props {
  sessionId: string;
  contents: ContentRow[];
  user: any;
  onUpload: (sessionId: string, contentType: string, file?: File, title?: string, description?: string, contentText?: string) => Promise<boolean>;
  onDelete: (contentId: string) => Promise<boolean>;
}

const contentTypeIcons: Record<string, React.ReactNode> = {
  photo: <Camera className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
  chord: <Music2 className="w-4 h-4" />,
};

const SessionContentSection = ({ sessionId, contents, user, onUpload, onDelete }: Props) => {
  const { language } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [contentType, setContentType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (contents.length === 0 && !user) return null;

  const handleSubmit = async () => {
    setUploading(true);
    const isTextType = contentType === 'note' || contentType === 'chord';
    await onUpload(
      sessionId,
      contentType,
      isTextType ? undefined : file || undefined,
      title || undefined,
      undefined,
      isTextType ? contentText : undefined
    );
    setTitle('');
    setContentText('');
    setFile(null);
    setContentType('');
    setShowForm(false);
    setUploading(false);
  };

  const types = [
    { id: 'photo', label: language === 'zh' ? '📷 照片' : '📷 Photo' },
    { id: 'video', label: language === 'zh' ? '🎬 视频' : '🎬 Video' },
    { id: 'note', label: language === 'zh' ? '📝 笔记' : '📝 Note' },
    { id: 'chord', label: language === 'zh' ? '🎵 和弦' : '🎵 Chords' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          {language === 'zh' ? '排练记录' : 'Session Records'}
        </h4>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            {language === 'zh' ? '上传' : 'Upload'}
          </button>
        )}
      </div>

      {/* Upload form */}
      {showForm && (
        <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setContentType(t.id)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                  contentType === t.id ? 'bg-primary/10 border-primary text-foreground' : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {contentType && (
            <>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={language === 'zh' ? '标题（可选）' : 'Title (optional)'} className="bg-background border-border" maxLength={100} />
              {(contentType === 'note' || contentType === 'chord') ? (
                <Textarea value={contentText} onChange={(e) => setContentText(e.target.value)} placeholder={contentType === 'chord' ? (language === 'zh' ? '输入和弦谱...' : 'Enter chords...') : (language === 'zh' ? '写下笔记...' : 'Write notes...')} className="bg-background border-border min-h-[100px] font-mono" maxLength={5000} />
              ) : (
                <div>
                  <input ref={fileRef} type="file" accept={contentType === 'photo' ? 'image/*' : 'video/*'} onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
                  <Button variant="outline" onClick={() => fileRef.current?.click()} className="rounded-lg">
                    <Upload className="w-4 h-4 mr-2" />
                    {file ? file.name : (language === 'zh' ? '选择文件' : 'Choose file')}
                  </Button>
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={handleSubmit} disabled={uploading || (!(contentType === 'note' || contentType === 'chord') && !file) || ((contentType === 'note' || contentType === 'chord') && !contentText.trim())} className="rounded-full gold-glow">
                  {uploading ? (language === 'zh' ? '上传中...' : 'Uploading...') : (language === 'zh' ? '提交' : 'Submit')}
                </Button>
                <Button variant="ghost" onClick={() => { setShowForm(false); setContentType(''); }} className="rounded-full">
                  {language === 'zh' ? '取消' : 'Cancel'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Content list */}
      {contents.length > 0 && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {contents.map((c) => (
            <div key={c.id} className="p-3 rounded-lg bg-secondary/30 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {contentTypeIcons[c.content_type] || <FileText className="w-4 h-4" />}
                  <span className="font-medium text-foreground">{c.title || c.content_type}</span>
                </div>
                {user && c.user_id === user.id && (
                  <button onClick={() => onDelete(c.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {c.content_text && (
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-background/50 p-2 rounded max-h-32 overflow-y-auto">
                  {c.content_text}
                </pre>
              )}
              {c.file_url && c.content_type === 'photo' && (
                <img src={c.file_url} alt={c.title || 'Photo'} className="rounded-lg w-full max-h-48 object-cover" />
              )}
              {c.file_url && c.content_type === 'video' && (
                <video src={c.file_url} controls className="rounded-lg w-full max-h-48" />
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(c.uploaded_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionContentSection;
