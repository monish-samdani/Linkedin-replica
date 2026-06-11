import MainLayout from '../../components/layout/MainLayout';
import InProgressCard from '../../components/shared/InProgressCard';

export default function NotificationsPage() {
  return (
    <MainLayout>
      <div className="flex justify-center py-12">
        <div className="w-full max-w-lg">
          <InProgressCard title="Notifications" subtitle="Stay updated on your network activity" />
        </div>
      </div>
    </MainLayout>
  );
}
