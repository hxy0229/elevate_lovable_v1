import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, Plus, ListMusic, Lock, Megaphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatTime12h, formatSessionDate, calculateSchedule } from "@/lib/timeUtils";
import { supabase } from "@/integrations/supabase/client";
import type { SessionInstance } from "@/hooks/useSessionInstances";
import type { Wish, WishInput } from "@/hooks/useWishes";
import WishForm from "./WishForm";
import WishCard from "./WishCard";

interface SessionInstanceCardProps {
  instance: SessionInstance;
  isAdmin: boolean;
  userId?: string;
  wishes: Wish[];
  onCreateWish: (input: WishInput) => Promise<boolean>;
  onUpdateWish: (id: string, version: number, updates: Partial<WishInput>) => Promise<boolean>;
  onDeleteWish: (id: string) => Promise<boolean>;
  onUploadFile: (instanceId: string, file: File) => Promise<string | null>;
}

const STATUS_CONFIG = {
  draft: { labelEn: "Open for Wishes", labelCn: "开放点歌", variant: "default" as const },
  open: { labelEn: "Open for Wishes", labelCn: "开放点歌", variant: "default" as const },
  published: { labelEn: "Published", labelCn: "已发布", variant: "outline" as const },
};

const SessionInstanceCard = ({
  instance,
  isAdmin,
  userId,
  wishes,
  onCreateWish,
  onUpdateWish,
  onDeleteWish,
  onUploadFile,
}: SessionInstanceCardProps) => {
  const { language } = useLanguage();
  const en = language === "en";
  const [showWishForm, setShowWishForm] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  const session = instance.session;
  const sessionName = instance.name_override || (en ? session?.name : session?.name_cn || session?.name) || "";
  const statusConfig = STATUS_CONFIG[instance.status];
  const isEditable = instance.status !== "published";
  const isPublished = instance.status === "published";

  const myWishes = wishes.filter((w) => w.user_id === userId);
  const canAddWish = isEditable && userId;

  // Calculate schedule
  const schedule = calculateSchedule(instance.start_time, wishes.length);

  // Fetch display names for admin view
  useEffect(() => {
    if (isAdmin) {
      // Fetch all profiles so admin can create wishes on behalf of any user
      supabase
        .from("profiles")
        .select("user_id, display_name")
        .then(({ data }) => {
          if (data) {
            const map: Record<string, string> = {};
            data.forEach((p: any) => {
              map[p.user_id] = p.display_name;
            });
            setProfiles(map);
          }
        });
    }
  }, [isAdmin]);

  // Determine which wishes to show
  const visibleWishes = isAdmin ? wishes : myWishes;

  return (
    <Card className="overflow-hidden transition-all duration-300 border-border hover:border-primary/50">
      <CardHeader className="bg-secondary/50 border-b border-border">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={statusConfig.variant}
                className={isEditable ? "bg-primary/20 text-primary border-primary/40" : ""}
              >
                {en ? statusConfig.labelEn : statusConfig.labelCn}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">
                {formatSessionDate(instance.instance_date, language)}
              </span>
            </div>
            <CardTitle className="font-display text-xl">{sessionName}</CardTitle>
            {instance.theme && (
              <div className="text-sm text-primary font-medium">
                🎨 {en ? "Theme" : "主题"}: {en ? instance.theme : instance.theme_cn || instance.theme}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm">{formatTime12h(instance.start_time)}</span>
          </div>
        </div>

        {/* Announcement */}
        {instance.announcement && (
          <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
            <Megaphone className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <span className="text-sm text-foreground">
              {en ? instance.announcement : instance.announcement_cn || instance.announcement}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Published lock notice */}
        {isPublished && !isAdmin && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            {en ? "This session has been published. Wishes are locked." : "此活动已发布，心愿已锁定。"}
          </div>
        )}

        {/* Wish list */}
        {visibleWishes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-primary" />
              {isAdmin ? (en ? "All Wishes" : "所有心愿") : en ? "My Wishes" : "我的心愿"}
              <span className="text-muted-foreground font-normal">({visibleWishes.length})</span>
            </h4>
            <div className="bg-secondary/20 rounded-lg border border-border divide-y divide-border">
              {visibleWishes.map((wish, i) => (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  index={i}
                  timeSlot={isPublished ? schedule.times[wishes.indexOf(wish)] : undefined}
                  isOwner={wish.user_id === userId}
                  isEditable={isEditable || isAdmin}
                  showUsername={isAdmin ? profiles[wish.user_id] || "—" : undefined}
                  onUpdate={onUpdateWish}
                  onDelete={onDeleteWish}
                  onUploadFile={onUploadFile}
                />
              ))}
            </div>
            {isPublished && (
              <p className="text-xs text-muted-foreground italic">
                *
                {en
                  ? "Schedule is tentative and subject to change based on actual progress."
                  : "时间安排仅供参考，可能根据实际进度有所调整。"}
              </p>
            )}
          </div>
        )}

        {visibleWishes.length === 0 && !showWishForm && (
          <p className="text-center text-muted-foreground py-4 text-sm">
            {en ? "Join this session by submitting your song wish!" : "提交你的心愿，加入本次活动吧！"}
          </p>
        )}

        <Separator className="bg-border" />

        {/* Add wish button */}
        {canAddWish && !showWishForm && (
          <Button onClick={() => setShowWishForm(true)} className="gap-2" variant="default">
            <Plus className="w-4 h-4" />
            {en ? "Make a Wish" : "许愿"}
          </Button>
        )}

        {/* Wish form */}
        {showWishForm && (
          <WishForm
            instanceId={instance.id}
            onSubmit={onCreateWish}
            onCancel={() => setShowWishForm(false)}
            onUploadFile={onUploadFile}
            profiles={
              isAdmin
                ? Object.entries(profiles).map(([user_id, display_name]) => ({ user_id, display_name }))
                : undefined
            }
          />
        )}

        {/* Login prompt */}
        {!userId && isEditable && (
          <p className="text-sm text-muted-foreground">{en ? "Please log in to make a wish." : "请登录后许愿。"}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionInstanceCard;
