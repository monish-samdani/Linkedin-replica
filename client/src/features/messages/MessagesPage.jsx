import { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useMessages } from './hooks/useMessages';
import ConversationList from './components/ConversationList';
import ChatPanel from './components/ChatPanel';
import NewMessageModal from './components/NewMessageModal';

export default function MessagesPage() {
  const {
    conversations,
    archived,
    loading,
    archivedLoading,
    onlineUserIds,
    lastSeenById,
    refetch,
    refetchArchived,
  } = useMessages();
  const [activeId, setActiveId] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const handleConversationCreated = (conversation) => {
    setComposeOpen(false);
    if (!conversation?._id) return;
    setActiveId(conversation._id);
    refetch({ silent: true });
  };

  const handleConversationChanged = () => {
    refetch({ silent: true });
    refetchArchived();
  };

  return (
    <MainLayout>
      <div className="py-6">
        <div className="mb-2 flex justify-end">
          <Link to="/messages/blocked" className="text-xs font-semibold text-gray-500 hover:text-brand-500">
            Blocked users
          </Link>
        </div>
        <div className="card flex h-[calc(100vh-9rem)] overflow-hidden">
          <div
            className={`w-full flex-col border-r border-gray-200 md:flex md:w-80 lg:w-96 ${
              activeId ? 'hidden md:flex' : 'flex'
            }`}
          >
            <ConversationList
              conversations={conversations}
              archived={archived}
              activeId={activeId}
              onSelect={setActiveId}
              onCompose={() => setComposeOpen(true)}
              loading={loading}
              archivedLoading={archivedLoading}
              onLoadArchived={refetchArchived}
              onlineUserIds={onlineUserIds}
              lastSeenById={lastSeenById}
            />
          </div>

          <div className={`flex-1 flex-col ${activeId ? 'flex' : 'hidden md:flex'}`}>
            {activeId ? (
              <ChatPanel
                key={activeId}
                conversationId={activeId}
                onBack={() => setActiveId(null)}
                onConversationChanged={handleConversationChanged}
                onlineUserIds={onlineUserIds}
                lastSeenById={lastSeenById}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Select a conversation to start messaging.
              </div>
            )}
          </div>
        </div>
      </div>

      {composeOpen && (
        <NewMessageModal onClose={() => setComposeOpen(false)} onCreated={handleConversationCreated} />
      )}
    </MainLayout>
  );
}
