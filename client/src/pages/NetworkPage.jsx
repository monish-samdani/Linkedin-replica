import MainLayout from '../components/layout/MainLayout';
import InProgressCard from '../components/shared/InProgressCard';

export default function NetworkPage() {
  return (
    <MainLayout>
      <div className="flex justify-center py-12">
        <div className="w-full max-w-lg">
          <InProgressCard title="My Network" subtitle="Manage your connections and invitations" />
        </div>
      </div>
    </MainLayout>
  );
}
