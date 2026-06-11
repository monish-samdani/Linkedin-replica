import MainLayout from '../../components/layout/MainLayout';
import InProgressCard from '../../components/shared/InProgressCard';

export default function JobsPage() {
  return (
    <MainLayout>
      <div className="flex justify-center py-12">
        <div className="w-full max-w-lg">
          <InProgressCard title="Jobs" subtitle="Browse and apply for opportunities" />
        </div>
      </div>
    </MainLayout>
  );
}
