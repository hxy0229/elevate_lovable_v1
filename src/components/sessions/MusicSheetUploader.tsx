import { useState, useRef } from 'react';
import { Music2, Upload, Trash2, Plus, FileText, Guitar, Piano, Mic2, Drum } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { MusicSheetRow } from '@/hooks/useMusicSheets';
import type { SongRow } from '@/hooks/useSessionData';

interface Props {
  sessionId: string;
  sheets: MusicSheetRow[];
  songs: SongRow[];
  user: any;
  onUpload: (sessionId: string, instrumentType: string, title: string, file?: File, contentText?: string, songId?: string) => Promise<boolean>;
  onDelete: (sheetId: string) => Promise<boolean>;
}

const instrumentOptions = [
  { id: 'general', label: 'General', labelCn: '通用', icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 'vocal', label: 'Vocal', labelCn: '声乐', icon: <Mic2 className="w-3.5 h-3.5" /> },
  { id: 'guitar', label: 'Guitar', labelCn: '吉他', icon: <Guitar className="w-3.5 h-3.5" /> },
  { id: 'piano', label: 'Piano', labelCn: '钢琴', icon: <Piano className="w-3.5 h-3.5" /> },
  { id: 'bass', label: 'Bass', labelCn: '贝斯', icon: <Music2 className="w-3.5 h-3.5" /> },
  { id: 'drums', label: 'Drums', labelCn: '鼓', icon: <Drum className="w-3.5 h-3.5" /> },
];

const MusicSheetUploader = ({ sessionId, sheets, songs, user, onUpload, onDelete }: Props) => {
  const { language } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [instrument, setInstrument] = useState('general');
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [songId, setSongId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const fileRef = useRef<HTMLInputElement>(null);

  const en = language === 'en';

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setUploading(true);
    await onUpload(
      sessionId,
      instrument,
      title,
      uploadMode === 'file' ? file || undefined : undefined,
      uploadMode === 'text' ? contentText : undefined,
      songId || undefined,
    );
    setTitle('');
    setContentText('');
    setFile(null);
    setSongId('');
    setShowForm(false);
    setUploading(false);
  };

  const sessionSheets = sheets.filter(s => s.session_id === sessionId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Music2 className="w-4 h-4 text-primary" />
          {en ? 'Music Sheets & Lyrics' : '乐谱与歌词'}
        </h4>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            {en ? 'Upload' : '上传'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={en ? 'Title (e.g. "Song Name - Guitar Chords")' : '标题（如"歌名 - 吉他和弦"）'}
            className="bg-background border-border"
            maxLength={100}
          />

          {/* Instrument selection */}
          <div className="flex flex-wrap gap-2">
            {instrumentOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setInstrument(opt.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                  instrument === opt.id
                    ? 'bg-primary/10 border-primary text-foreground'
                    : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {opt.icon}
                {en ? opt.label : opt.labelCn}
              </button>
            ))}
          </div>

          {/* Link to song (optional) */}
          {songs.length > 0 && (
            <select
              value={songId}
              onChange={e => setSongId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">{en ? '-- Link to a song (optional) --' : '-- 关联歌曲（可选）--'}</option>
              {songs.map(s => (
                <option key={s.id} value={s.id}>{s.singer_name} - {s.song_title} ({s.artist})</option>
              ))}
            </select>
          )}

          {/* Upload mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setUploadMode('file')}
              className={`px-3 py-1.5 rounded-lg border text-sm ${uploadMode === 'file' ? 'bg-primary/10 border-primary text-foreground' : 'bg-background border-border text-muted-foreground'}`}
            >
              📎 {en ? 'Upload File' : '上传文件'}
            </button>
            <button
              onClick={() => setUploadMode('text')}
              className={`px-3 py-1.5 rounded-lg border text-sm ${uploadMode === 'text' ? 'bg-primary/10 border-primary text-foreground' : 'bg-background border-border text-muted-foreground'}`}
            >
              ✏️ {en ? 'Type Text' : '输入文字'}
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()} className="rounded-lg">
                <Upload className="w-4 h-4 mr-2" />
                {file ? file.name : (en ? 'Choose file (image, PDF, doc)' : '选择文件（图片、PDF、文档）')}
              </Button>
            </div>
          ) : (
            <Textarea
              value={contentText}
              onChange={e => setContentText(e.target.value)}
              placeholder={en ? 'Paste chords, lyrics, or notes here...' : '在此粘贴和弦、歌词或笔记...'}
              className="bg-background border-border min-h-[120px] font-mono"
              maxLength={10000}
            />
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={uploading || !title.trim() || (uploadMode === 'file' && !file) || (uploadMode === 'text' && !contentText.trim())}
              className="rounded-full"
            >
              {uploading ? (en ? 'Uploading...' : '上传中...') : (en ? 'Submit' : '提交')}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-full">
              {en ? 'Cancel' : '取消'}
            </Button>
          </div>
        </div>
      )}

      {/* Sheets list */}
      {sessionSheets.length > 0 && (
        <div className="space-y-2">
          {sessionSheets.map(sheet => {
            const instOpt = instrumentOptions.find(o => o.id === sheet.instrument_type);
            return (
              <div key={sheet.id} className="p-3 rounded-lg bg-secondary/30 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    {instOpt?.icon || <FileText className="w-4 h-4" />}
                    <span className="font-medium text-foreground">{sheet.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {en ? instOpt?.label || sheet.instrument_type : instOpt?.labelCn || sheet.instrument_type}
                    </Badge>
                  </div>
                  {user && sheet.user_id === user.id && (
                    <button onClick={() => onDelete(sheet.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {sheet.content_text && (
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-background/50 p-2 rounded max-h-40 overflow-y-auto">
                    {sheet.content_text}
                  </pre>
                )}
                {sheet.file_url && (
                  <a
                    href={sheet.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    {en ? 'View file' : '查看文件'}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MusicSheetUploader;
