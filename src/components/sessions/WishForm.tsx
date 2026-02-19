import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, Plus, Link as LinkIcon, Clock, Music2, Settings2, FileText, StickyNote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { WishRole, AccompanyingInstrument, WishInput, Wish } from '@/hooks/useWishes';

// Native time input with clear button
const TimeInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="relative flex items-center">
    <input
      type="time"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        className="absolute right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Clear time"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

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
export interface Constraints {
  arriveAfter: string;
  leaveBy: string;
  arrangementRequest: string;
  notes: string;
}

export const parseConstraints = (raw: string | null | undefined): Constraints => {
  const defaults = { arriveAfter: '20:00', leaveBy: '22:00', arrangementRequest: '', notes: '' };
  if (!raw) return defaults;
  try { return { ...defaults, ...JSON.parse(raw) }; }
  catch { return { ...defaults, notes: raw }; }
};

// Convert "HH:MM" to total minutes from midnight for comparison
const toMinutes = (t: string) => {
  if (!t || t === 'none') return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// Section wrapper for visual grouping
const FormSection = ({
  icon,
  title,
  subtitle,
  children,
  className = '',
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-3 p-3 rounded-lg bg-secondary/30 border border-border ${className}`}>
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <Label className="font-semibold">{title}</Label>
      </div>
      {subtitle && <p className="text-xs text-muted-foreground pl-6">{subtitle}</p>}
    </div>
    {children}
  </div>
);

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

  // Structured constraints — defaults to 20:00 / 22:00 for new wishes
  const parsed = parseConstraints(existingWish?.special_requirements);
  const [arriveAfter, setArriveAfter] = useState(parsed.arriveAfter);
  const [leaveBy, setLeaveBy] = useState(parsed.leaveBy);
  const [arrangementRequest, setArrangementRequest] = useState(parsed.arrangementRequest);
  const [specialNotes, setSpecialNotes] = useState(parsed.notes);

  // Validation: if both filled, arriveAfter must be before leaveBy
  const timeError = (() => {
    const arrMins = toMinutes(arriveAfter);
    const leaveMins = toMinutes(leaveBy);
    if (arrMins !== null && leaveMins !== null && arrMins >= leaveMins) {
      return en
        ? 'Arrival time must be earlier than leave time.'
        : '到达时间必须早于离开时间。';
    }
    return null;
  })();

  const handleRoleChange = (role: WishRole) => {
    setPrimaryRole(role);
    const mapped = ROLE_TO_INSTRUMENT[role];
    if (mapped) setAccompInstrument(mapped);
  };

  const handleSubmit = async () => {
    if (!songTitle.trim() || timeError) return;
    setSubmitting(true);

    const constraintsObj: Constraints = {
      arriveAfter,
      leaveBy,
      arrangementRequest: arrangementRequest.trim(),
      notes: specialNotes.trim(),
    };
    const hasConstraints =
      constraintsObj.arriveAfter ||
      constraintsObj.leaveBy ||
      constraintsObj.arrangementRequest ||
      constraintsObj.notes;
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
      <CardContent className="space-y-5">

        {/* ── Admin user picker ── */}
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

        {/* ── SECTION 1: Song Details ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-border">
            <Music2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">{en ? 'Song Details' : '歌曲信息'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{en ? 'Song Title' : '歌曲名称'} <span className="text-destructive">*</span></Label>
              <Input
                value={songTitle}
                onChange={e => setSongTitle(e.target.value)}
                placeholder={en ? 'Enter song title' : '输入歌曲名称'}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{en ? 'Artist' : '歌手 / 乐队'}</Label>
              <Input
                value={artist}
                onChange={e => setArtist(e.target.value)}
                placeholder={en ? 'Original artist' : '原唱'}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{en ? 'Key / Version' : '调式 / 版本'}</Label>
            <Input
              value={songVersion}
              onChange={e => setSongVersion(e.target.value)}
              placeholder={en ? 'e.g., Original key, -2 semitones' : '例：原调、降2个半音'}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{en ? 'Song / Accompaniment Link' : '歌曲 / 伴奏链接'}</Label>
            <Input
              value={songLink}
              onChange={e => setSongLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* ── SECTION 2: Performance Setup ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-border">
            <Settings2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">{en ? 'Performance Setup' : '演出配置'}</span>
          </div>

          {/* Primary Role */}
          <div className="space-y-1.5">
            <Label>{en ? 'Primary Role' : '主要角色'} <span className="text-destructive">*</span></Label>
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
            <div className="flex-1 min-w-0">
              <Label className="cursor-pointer">{en ? 'Self-Accompanied (弹唱)' : '弹唱'}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {en ? 'I will play an instrument while singing.' : '我将一边演奏一边演唱。'}
              </p>
            </div>
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
        </div>

        {/* ── SECTION 3: Resources ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-border">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">{en ? 'Scores & Files' : '乐谱与文件'}</span>
          </div>

          {/* Score Links */}
          <div className="space-y-2">
            <Label className="text-sm">{en ? 'Score Links (Music Sheets & Lyrics)' : '谱面链接（乐谱和歌词）'}</Label>
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
              <Input
                value={newScoreLink}
                onChange={e => setNewScoreLink(e.target.value)}
                placeholder="https://..."
                className="flex-1"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addScoreLink())}
              />
              <Button variant="outline" size="sm" onClick={addScoreLink} disabled={!newScoreLink.trim()}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-2">
            <Label className="text-sm">{en ? 'File Uploads (PDF, PNG, TXT…)' : '文件上传（PDF、PNG、TXT等）'}</Label>
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
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors text-sm text-muted-foreground">
              <Upload className="w-4 h-4" />
              {uploading ? (en ? 'Uploading...' : '上传中...') : (en ? 'Upload file' : '上传文件')}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx" />
            </label>
          </div>
        </div>

        {/* ── SECTION 4: Scheduling Preferences (time constraints ONLY) ── */}
        <FormSection
          icon={<Clock className="w-4 h-4" />}
          title={en ? 'Scheduling Preferences' : '时间偏好'}
          subtitle={en
            ? 'Let us know if you have time constraints so we can arrange your performance slot.'
            : '如有时间限制，请告知以便安排您的演出顺序。'}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">{en ? 'I will arrive after' : '我将在此时间后到达'}</Label>
              <TimeInput value={arriveAfter} onChange={setArriveAfter} />
              <p className="text-xs text-muted-foreground">
                {en ? 'Default: 8:00 PM' : '默认：晚上8点'}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">{en ? 'I will leave before' : '我将在此时间前离开'}</Label>
              <TimeInput value={leaveBy} onChange={setLeaveBy} />
              <p className="text-xs text-muted-foreground">
                {en ? 'Default: 10:00 PM' : '默认：晚上10点'}
              </p>
            </div>
          </div>

          {timeError && (
            <p className="text-xs text-destructive font-medium">{timeError}</p>
          )}
        </FormSection>

        {/* ── SECTION 5: Musical Direction (separate from scheduling) ── */}
        <FormSection
          icon={<Music2 className="w-4 h-4" />}
          title={en ? 'Musical Direction' : '音乐编排偏好'}
          subtitle={en
            ? 'Optional: Tell us if you want a different style, tempo, structure, or arrangement variation.'
            : '可选：如需不同风格、节奏、结构或编曲变化，请告知。'}
        >
          <Textarea
            value={arrangementRequest}
            onChange={e => setArrangementRequest(e.target.value)}
            placeholder={en
              ? 'e.g., Rock version, acoustic ballad, slower tempo, skip verse 2, guitar solo intro…'
              : '例：摇滚版本、民谣风格、节奏慢一点、跳过第二段、吉他独奏开场…'}
            rows={3}
          />
        </FormSection>

        {/* ── SECTION 6: Additional Notes ── */}
        <FormSection
          icon={<StickyNote className="w-4 h-4" />}
          title={en ? 'Additional Notes' : '其他备注'}
          subtitle={en
            ? 'Anything else the organiser should know about your performance.'
            : '其他主办方需要了解的演出信息。'}
        >
          <Textarea
            value={specialNotes}
            onChange={e => setSpecialNotes(e.target.value)}
            placeholder={en
              ? 'e.g., I need a mic stand, I\'ll bring my own guitar…'
              : '例：我需要麦架，我自带吉他…'}
            rows={2}
          />
        </FormSection>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-1">
          <Button
            onClick={handleSubmit}
            disabled={!songTitle.trim() || submitting || !!timeError || (!!profiles && !selectedUserId)}
            className="flex-1"
          >
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
