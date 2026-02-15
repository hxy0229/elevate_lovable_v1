import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAdmin } from "@/hooks/useAdmin";
import { useSessionData } from "@/hooks/useSessionData";
import { useSessionConfig } from "@/hooks/useSessionConfig";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminInstanceManager from "@/components/admin/AdminInstanceManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Calendar, Plus, Trash2, Mic2, Guitar,
  Shield, Settings,
} from "lucide-react";

interface ProfileRow {
  id: string;
  user_id: string;
  display_name: string;
  is_singer: boolean;
  is_musician: boolean;
  instruments: string[];
  created_at: string;
}

const Admin = () => {
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { sessions, loading: dataLoading, refetch } = useSessionData();
  const {
    sessionTypes, sessionRoles, loading: configLoading,
    addSessionType, removeSessionType, addSessionRole, removeSessionRole,
  } = useSessionConfig();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);

  // Config management state
  const [newType, setNewType] = useState({ value: "", label_en: "", label_cn: "", icon: "🎵" });
  const [newRole, setNewRole] = useState({ value: "", label_en: "", label_cn: "", icon: "🎵" });

  useEffect(() => {
    if (!authLoading && !adminLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .then(({ data }) => {
        if (data) setProfiles(data as ProfileRow[]);
      });
  }, []);

  if (authLoading || adminLoading || dataLoading || configLoading) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </section>
      </Layout>
    );
  }

  if (!isAdmin) return null;

  const en = language === "en";
  const totalMembers = profiles.length;
  const totalSingers = profiles.filter((p) => p.is_singer).length;
  const totalMusicians = profiles.filter((p) => p.is_musician).length;

  const handleAddType = async () => {
    if (!newType.value.trim() || !newType.label_en.trim()) return;
    const ok = await addSessionType(newType.value.trim(), newType.label_en.trim(), newType.label_cn.trim() || newType.label_en.trim(), newType.icon);
    if (ok) setNewType({ value: "", label_en: "", label_cn: "", icon: "🎵" });
  };

  const handleAddRole = async () => {
    if (!newRole.value.trim() || !newRole.label_en.trim()) return;
    const ok = await addSessionRole(newRole.value.trim(), newRole.label_en.trim(), newRole.label_cn.trim() || newRole.label_en.trim(), newRole.icon);
    if (ok) setNewRole({ value: "", label_en: "", label_cn: "", icon: "🎵" });
  };

  return (
    <Layout>
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gradient">
              {en ? "Admin Dashboard" : "管理后台"}
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: en ? "Members" : "会员", value: totalMembers, icon: Users },
              { label: en ? "Singers" : "歌手", value: totalSingers, icon: Mic2 },
              { label: en ? "Musicians" : "乐手", value: totalMusicians, icon: Guitar },
              { label: en ? "Sessions" : "活动", value: sessions.length, icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="sessions" className="space-y-6">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger value="sessions" className="gap-1.5">
                <Calendar className="w-4 h-4" /> {en ? "Weekly Sessions" : "每周活动"}
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-1.5">
                <Users className="w-4 h-4" /> {en ? "Members" : "会员"}
              </TabsTrigger>
              <TabsTrigger value="config" className="gap-1.5">
                <Settings className="w-4 h-4" /> {en ? "Settings" : "设置"}
              </TabsTrigger>
            </TabsList>

            {/* Unified Weekly Sessions Tab */}
            <TabsContent value="sessions">
              <AdminInstanceManager
                sessions={sessions}
                profiles={profiles.map(p => ({ user_id: p.user_id, display_name: p.display_name }))}
              />
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                {en ? "Member Directory" : "会员目录"}
              </h2>
              <div className="grid gap-3">
                {profiles.map((profile) => (
                  <Card key={profile.id} className="border-border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{profile.display_name || "Unnamed"}</p>
                          <p className="text-xs text-muted-foreground">
                            {en ? "Joined" : "加入"}: {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.is_singer && (
                          <Badge variant="outline"><Mic2 className="w-3 h-3 mr-1" />{en ? "Singer" : "歌手"}</Badge>
                        )}
                        {profile.is_musician && (
                          <Badge variant="outline"><Guitar className="w-3 h-3 mr-1" />{en ? "Musician" : "乐手"}</Badge>
                        )}
                        {profile.instruments.length > 0 && (
                          <Badge variant="secondary" className="text-xs">{profile.instruments.join(", ")}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {profiles.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">{en ? "No members yet" : "暂无会员"}</p>
                )}
              </div>
            </TabsContent>

            {/* Settings/Config Tab */}
            <TabsContent value="config" className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                {en ? "Session Configuration" : "活动配置"}
              </h2>

              {/* Session Types */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">{en ? "Session Types" : "活动类型"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {sessionTypes.map((t) => (
                      <div key={t.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30 border border-border">
                        <div className="flex items-center gap-2">
                          <span>{t.icon}</span>
                          <span className="font-medium text-foreground">{en ? t.label_en : t.label_cn}</span>
                          <span className="text-xs text-muted-foreground">({t.value})</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-destructive hover:text-destructive" onClick={() => removeSessionType(t.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/20 border border-border space-y-3">
                    <p className="text-sm font-medium text-foreground">{en ? "Add New Type" : "添加新类型"}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Input value={newType.value} onChange={(e) => setNewType((p) => ({ ...p, value: e.target.value }))} placeholder={en ? "Value (e.g. choir)" : "值（如 choir）"} className="bg-background border-border h-8 text-sm" />
                      <Input value={newType.label_en} onChange={(e) => setNewType((p) => ({ ...p, label_en: e.target.value }))} placeholder={en ? "Label EN" : "英文标签"} className="bg-background border-border h-8 text-sm" />
                      <Input value={newType.label_cn} onChange={(e) => setNewType((p) => ({ ...p, label_cn: e.target.value }))} placeholder={en ? "Label CN" : "中文标签"} className="bg-background border-border h-8 text-sm" />
                      <Input value={newType.icon} onChange={(e) => setNewType((p) => ({ ...p, icon: e.target.value }))} placeholder="🎵" className="bg-background border-border h-8 text-sm w-20" />
                    </div>
                    <Button size="sm" className="h-8 text-xs gap-1" onClick={handleAddType} disabled={!newType.value.trim() || !newType.label_en.trim()}>
                      <Plus className="w-3.5 h-3.5" /> {en ? "Add Type" : "添加类型"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Session Roles */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">{en ? "Participant Roles" : "参与者角色"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {sessionRoles.map((r) => (
                      <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30 border border-border">
                        <div className="flex items-center gap-2">
                          <span>{r.icon}</span>
                          <span className="font-medium text-foreground">{en ? r.label_en : r.label_cn}</span>
                          <span className="text-xs text-muted-foreground">({r.value})</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-destructive hover:text-destructive" onClick={() => removeSessionRole(r.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/20 border border-border space-y-3">
                    <p className="text-sm font-medium text-foreground">{en ? "Add New Role" : "添加新角色"}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Input value={newRole.value} onChange={(e) => setNewRole((p) => ({ ...p, value: e.target.value }))} placeholder={en ? "Value (e.g. Violin)" : "值（如 Violin）"} className="bg-background border-border h-8 text-sm" />
                      <Input value={newRole.label_en} onChange={(e) => setNewRole((p) => ({ ...p, label_en: e.target.value }))} placeholder={en ? "Label EN" : "英文标签"} className="bg-background border-border h-8 text-sm" />
                      <Input value={newRole.label_cn} onChange={(e) => setNewRole((p) => ({ ...p, label_cn: e.target.value }))} placeholder={en ? "Label CN" : "中文标签"} className="bg-background border-border h-8 text-sm" />
                      <Input value={newRole.icon} onChange={(e) => setNewRole((p) => ({ ...p, icon: e.target.value }))} placeholder="🎵" className="bg-background border-border h-8 text-sm w-20" />
                    </div>
                    <Button size="sm" className="h-8 text-xs gap-1" onClick={handleAddRole} disabled={!newRole.value.trim() || !newRole.label_en.trim()}>
                      <Plus className="w-3.5 h-3.5" /> {en ? "Add Role" : "添加角色"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Admin;
