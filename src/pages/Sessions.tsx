import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import { useSessionInstances } from '@/hooks/useSessionInstances';
import { useWishes } from '@/hooks/useWishes';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import SessionInstanceCard from '@/components/sessions/SessionInstanceCard';

const Sessions = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { instances, loading: instancesLoading } = useSessionInstances();
  const {
    wishes, loading: wishesLoading,
    createWish, updateWish, deleteWish, uploadWishFile,
  } = useWishes();

  const loading = instancesLoading || wishesLoading;

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
            ) : instances.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                {isAdmin
                  ? 'No session instances yet. Create one from the Admin panel.'
                  : 'No upcoming sessions. Check back soon!'}
              </p>
            ) : (
              instances.map((instance) => (
                <SessionInstanceCard
                  key={instance.id}
                  instance={instance}
                  isAdmin={isAdmin}
                  userId={user?.id}
                  wishes={wishes.filter(w => w.instance_id === instance.id)}
                  onCreateWish={createWish}
                  onUpdateWish={updateWish}
                  onDeleteWish={deleteWish}
                  onUploadFile={uploadWishFile}
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
