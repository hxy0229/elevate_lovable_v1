import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, Plus, Link as LinkIcon, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { WishRole, AccompanyingInstrument, WishInput, Wish } from '@/hooks/useWishes';

// 15-min increment time options 6am–midnight
const TIME_OPTIONS = (() => {
  const opts: { value: string; label: string }[] = [{ value: '', label: '—' }];
  for (let h = 6; h <= 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      if (h === 24 && m > 0) break;
      const hh = h % 24;
      const period = hh < 12 ? 'AM' : 'PM';
      const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
      const label = `${h12}:${m.toString().padStart(2, '0')} ${period}`;
      opts.push({ value: `${hh.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`, label });
    }
  }
  return opts;
})();

interface WishFormProps {
  instanceId: string;
  existingWish?: Wish;
  onSubmit: (input: WishInput) => Promise<boolean>;
  onCancel: () => void;
  onUploadFile?: (instanceId: string, file: File) => Promise<string | null>;
  profiles?: { user_id: string; display_name: string }[];
}

const ROLE_OPTIONS: { value: WishRole; labelEn: string; labelCn: string; icon: string }[] = [
  { value: 'vocal', labelEn: 'Vocal', labelCn: '主唱', icon: '🎤' },
  { value: 'guitar', labelEn: 'Guitar', labelCn: '吉他', icon: '🎸' },
  { value: 'keyboard', labelEn: 'Keyboard', labelCn: '键盘', icon: '🎹' },
  { value: 'drum', labelEn: 'Drum', labelCn: '鼓', icon: '🥁' },
  { value: 'bass', labelEn: 'Bass', labelCn: '贝斯', icon: '🎸' },
];

const ROLE_TO_INSTRUMENT: Record<string, AccompanyingInstrument> = {
  guitar: 'guitar',
  keyboard: 'keyboard',
  drum: 'drum',
  bass: 'bass',
};

// Structured constraints stored as JSON in special_requirements
interface Constraints {
  arriveAfter: string;
  arrangementRequest: string;
  notes: string;
}

const parseConstraints = (raw: string | null | undefined): Constraints => {
  if (!raw) return { arriveAfter: '', arrangementRequest: '', notes: '' };
  try { return { arriveAfter: '', arrangementRequest: '', notes: '', ...JSON.parse(raw) }; }
  catch { return { arriveAfter: '', arrangementRequest: '', notes: raw }; }
};

const WishForm = ({ instanceId, existingWish, onSubmit, onCancel, onUploadFile, profiles }: WishFormProps) => {
  const { language } = useLanguage();
  const en = language === 'en';
  const [selectedUserId, setSelectedUserId] = useState('');

  const [songTitle, setSongTitle] = useState(existingWish?.song_title || '');
  const [artist, setArtist] = useState(existingWish?.artist || '');
  const [primaryRole, setPrimaryRole] = useState<WishRole>(existingWish?.primary_role || 'vocal');
  const [isSelfAccompanied, setIsSelfAccompanied] = useState(existingWish?.is_self_accompanied || false);
  const [accompInstrument, setAccompInstrument] = useState<AccompanyingInstrument | ''>(existingWish?.accompanying_instrument || '');
  const [songVersion, setSongVersion] = useState(existingWish?.song_version || '');
  const [songLink, setSongLink] = useState(existingWish?.song_link || '');
  const [scoreLinks, setScoreLinks] = useState<string[]>(existingWish?.score_links || []);
  const [fileUrls, setFileUrls] = useState<string[]>(existingWish?.file_urls || []);
  const [newScoreLink, setNewScoreLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Structured constraints
  const parsed = parseConstraints(existingWish?.special_requirements);
  const [arriveAfter, setArriveAfter] = useState(parsed.arriveAfter);
  const [arrangementRequest, setArrangementRequest] = useState(parsed.arrangementRequest);
  const [specialNotes, setSpecialNotes] = useState(parsed.notes);

  const handleRoleChange = (role: WishRole) => {
    setPrimaryRole(role);
    const mapped = ROLE_TO_INSTRUMENT[role];
    if (mapped) setAccompInstrument(mapped);
  };

  const handleSubmit = async () => {
    if (!songTitle.trim()) return;
    setSubmitting(true);

    // Encode constraints as JSON
    const constraintsObj: Constraints = { arriveAfter, arrangementRequest: arrangementRequest.trim(), notes: specialNotes.trim() };
    const hasConstraints = arriveAfter || arrangementRequest.trim() || specialNotes.trim();
    const special_requirements = hasConstraints ? JSON.stringify(constraintsObj) : undefined;

    const input: WishInput = {
      instance_id: instanceId,
      song_title: songTitle.trim(),
      artist: artist.trim(),
      primary_role: primaryRole,
      is_self_accompanied: isSelfAccompanied,
      accompanying_instrument: isSelfAccompanied && accompInstrument ? accompInstrument : null,
      song_version: songVersion.trim() || undefined,
      song_link: songLink.trim() || undefined,
      score_links: scoreLinks,
      file_urls: fileUrls,
      special_requirements,
      ...(profiles && selectedUserId ? { user_id: selectedUserId } : {}),
    };
    const ok = await onSubmit(input);
    setSubmitting(false);
    if (ok) onCancel();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadFile) return;
    setUploading(true);
    const url = await onUploadFile(instanceId, file);
    if (url) setFileUrls(prev => [...prev, url]);
    setUploading(false);
    e.target.value = '';
  };

  const addScoreLink = () => {
    if (newScoreLink.trim()) {
      setScoreLinks(prev => [...prev, newScoreLink.trim()]);
      setNewScoreLink('');
    }
  };

  return (
    <Card className="border-primary/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display">
          {existingWish
            ? (en ? 'Edit Wish' : '编辑心愿')
            : (en ? 'Make a Wish 🎶' : '许一个心愿 🎶')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Admin user picker */}
        {profiles && profiles.length > 0 && (
          <div className="space-y-1.5">
            <Label>{en ? 'Username (on behalf of)' : '用户名（代表）'} *</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder={en ? 'Select user' : '选择用户'} />
              </SelectTrigger>
              <SelectContent>
                {profiles.map(p => (
                  <SelectItem key={p.user_id} value={p.user_id}>
                    {p.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Song Title & Artist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{en ? 'Song Title' : '歌曲名称'} *</Label>
            <Input value={songTitle} onChange={e => setSongTitle(e.target.value)} placeholder={en ? 'Enter song title' : '输入歌曲名称'} />
          </div>
          <div className="space-y-1.5">
            <Label>{en ? 'Artist' : '歌手/乐队'}</Label>
            <Input value={artist} onChange={e => setArtist(e.target.value)} placeholder={en ? 'Original artist' : '原唱'} />
          </div>
        </div>

        {/* Primary Role */}
        <div className="space-y-1.5">
          <Label>{en ? 'Primary Role' : '主要角色'} *</Label>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map(r => (
              <Button
                key={r.value}
                type="button"
                variant={primaryRole === r.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRoleChange(r.value)}
                className="gap-1.5"
              >
                {r.icon} {en ? r.labelEn : r.labelCn}
              </Button>
            ))}
          </div>
        </div>

        {/* Self-Accompanied */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
          <Switch checked={isSelfAccompanied} onCheckedChange={setIsSelfAccompanied} />
          <Label className="cursor-pointer">{en ? 'Self-Accompanied (弹唱)' : '弹唱'}</Label>
          {isSelfAccompanied && (
            <Select value={accompInstrument} onValueChange={(v) => setAccompInstrument(v as AccompanyingInstrument)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={en ? 'Instrument' : '乐器'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guitar">🎸 {en ? 'Guitar' : '吉他'}</SelectItem>
                <SelectItem value="keyboard">🎹 {en ? 'Keyboard' : '键盘'}</SelectItem>
                <SelectItem value="drum">🥁 {en ? 'Drum' : '鼓'}</SelectItem>
                <SelectItem value="bass">🎸 {en ? 'Bass' : '贝斯'}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Song Version */}
        <div className="space-y-1.5">
          <Label>{en ? 'Song Version (Key / Tone)' : '调式/版本'}</Label>
          <Input value={songVersion} onChange={e => setSongVersion(e.target.value)} placeholder={en ? 'e.g., Original key, -2 semitones' : '例：原调、降2个半音'} />
        </div>

        {/* Song / Accompaniment Link */}
        <div className="space-y-1.5">
          <Label>{en ? 'Song / Accompaniment Link' : '歌曲/伴奏链接'}</Label>
          <Input value={songLink} onChange={e => setSongLink(e.target.value)} placeholder="https://..." />
        </div>

        {/* Score Links */}
        <div className="space-y-2">
          <Label>{en ? 'Score Links (Music Sheets & Lyrics)' : '谱面链接（乐谱和歌词）'}</Label>
          {scoreLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <a href={link} target="_blank" rel="noopener" className="text-sm text-primary truncate hover:underline flex-1">{link}</a>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setScoreLinks(prev => prev.filter((_, idx) => idx !== i))}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input value={newScoreLink} onChange={e => setNewScoreLink(e.target.value)} placeholder="https://..." className="flex-1" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addScoreLink())} />
            <Button variant="outline" size="sm" onClick={addScoreLink} disabled={!newScoreLink.trim()}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* File Uploads */}
        <div className="space-y-2">
          <Label>{en ? 'File Uploads (PDF, PNG, TXT, etc.)' : '文件上传（PDF、PNG、TXT等）'}</Label>
          {fileUrls.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <a href={url} target="_blank" rel="noopener" className="text-sm text-primary truncate hover:underline flex-1">
                {url.split('/').pop()}
              </a>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFileUrls(prev => prev.filter((_, idx) => idx !== i))}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <div>
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors text-sm text-muted-foreground">
              <Upload className="w-4 h-4" />
              {uploading ? (en ? 'Uploading...' : '上传中...') : (en ? 'Upload file' : '上传文件')}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx" />
            </label>
          </div>
        </div>

        {/* ── Scheduling & Preferences ── */}
        <div className="space-y-3 p-3 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <Label className="font-semibold">
              {en ? 'Scheduling & Preferences' : '时间与偏好设置'}
            </Label>
          </div>

          {/* Arrival Time */}
          <div className="space-y-1.5">
            <Label className="text-sm">
              {en ? 'I will arrive after' : '我将在几点后到达'}
              <span className="text-muted-foreground ml-1 font-normal">{en ? '(Optional)' : '（可选）'}</span>
            </Label>
            <Select value={arriveAfter} onValueChange={setArriveAfter}>
              <SelectTrigger>
                <SelectValue placeholder={en ? 'No constraint' : '无限制'} />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {TIME_OPTIONS.map(o => (
                  <SelectItem key={o.value || 'none'} value={o.value || 'none'}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {en ? 'Helps us schedule your slot later in the session.' : '帮助我们将你安排在较后的出场顺序。'}
            </p>
          </div>

          {/* Arrangement / Style Request */}
          <div className="space-y-1.5">
            <Label className="text-sm">
              {en ? 'Arrangement / Style Request' : '编曲 / 风格要求'}
              <span className="text-muted-foreground ml-1 font-normal">{en ? '(Optional)' : '（可选）'}</span>
            </Label>
            <Textarea
              value={arrangementRequest}
              onChange={e => setArrangementRequest(e.target.value)}
              placeholder={en
                ? 'e.g., Rock version, lower key by 2 semitones, slower tempo...'
                : '例：摇滚版本、降2个半音、节奏慢一点...'}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              {en ? 'Musical preferences only. Does not affect scheduling.' : '仅限音乐偏好，不影响排程逻辑。'}
            </p>
          </div>

          {/* Additional Notes */}
          <div className="space-y-1.5">
            <Label className="text-sm">
              {en ? 'Additional Notes' : '其他备注'}
              <span className="text-muted-foreground ml-1 font-normal">{en ? '(Optional)' : '（可选）'}</span>
            </Label>
            <Textarea
              value={specialNotes}
              onChange={e => setSpecialNotes(e.target.value)}
              placeholder={en
                ? 'Anything else the admin should know...'
                : '其他管理员需要知道的信息...'}
              rows={2}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSubmit} disabled={!songTitle.trim() || submitting || (!!profiles && !selectedUserId)} className="flex-1">
            {submitting
              ? (en ? 'Saving...' : '保存中...')
              : existingWish
                ? (en ? 'Update Wish' : '更新心愿')
                : (en ? 'Submit Wish' : '提交心愿')}
          </Button>
          <Button variant="outline" onClick={onCancel}>{en ? 'Cancel' : '取消'}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WishForm;
