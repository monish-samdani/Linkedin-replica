import MainLayout from '../components/layout/MainLayout';
import InProgressCard from '../components/shared/InProgressCard';
import ProfileCard from '../features/profile/components/ProfileCard';

export default function FeedPage() {
  return (
    <MainLayout>
      <div className="grid gap-4 py-6 lg:grid-cols-4">
        <aside className="hidden lg:block">
          <ProfileCard />
        </aside>
        <section className="lg:col-span-2">
          <InProgressCard title="Feed coming soon" subtitle="Posts and updates will appear here" />
        </section>
        <aside className="hidden lg:block">
          <InProgressCard title="Recommendations" subtitle="Suggested connections and content" />
        </aside>
      </div>
    </MainLayout>
  );
}
