import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import SessionCard from '@/components/sessions/SessionCard';
import { useSessionData } from '@/hooks/useSessionData';
import { useMusicSheets } from '@/hooks/useMusicSheets';
import { useSessionConfig } from '@/hooks/useSessionConfig';
import { Skeleton } from '@/components/ui/skeleton';

const Sessions = () => {
  const { t } = useLanguage();
  const {
    sessions, registrations, songs, contents, user, loading,
    register, unregister, addSong, removeSong, updateTheme,
    uploadContent, deleteContent,
  } = useSessionData();
  const { sheets, uploadSheet, deleteSheet } = useMusicSheets();
  const { sessionTypes, sessionRoles } = useSessionConfig();

  // Filter out archived sessions for regular users
  const activeSessions = sessions.filter(s => !(s as any).is_archived);

  return (
    <Layout>
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-gradient">
              {t('sessions.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('sessions.subtitle')}
            </p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-6" />
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))
            ) : activeSessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No sessions scheduled yet.
              </p>
            ) : (
              activeSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  registrations={registrations.filter((r) => r.session_id === session.id)}
                  songs={songs.filter((s) => s.session_id === session.id)}
                  contents={contents.filter((c) => c.session_id === session.id)}
                  musicSheets={sheets.filter((s) => s.session_id === session.id)}
                  sessionTypes={sessionTypes}
                  sessionRoles={sessionRoles}
                  user={user}
                  onRegister={register}
                  onUnregister={unregister}
                  onAddSong={addSong}
                  onRemoveSong={removeSong}
                  onUpdateTheme={updateTheme}
                  onUploadContent={uploadContent}
                  onDeleteContent={deleteContent}
                  onUploadSheet={uploadSheet}
                  onDeleteSheet={deleteSheet}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Sessions;
