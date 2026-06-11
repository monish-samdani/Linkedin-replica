import MainLayout from '../../components/layout/MainLayout';
import InProgressCard from '../../components/shared/InProgressCard';

export default function MessagingPage() {
  return (
    <MainLayout>
      <div className="flex justify-center py-12">
        <div className="w-full max-w-lg">
          <InProgressCard title="Messaging" subtitle="Chat with your connections" />
        </div>
      </div>
    </MainLayout>
  );
}
