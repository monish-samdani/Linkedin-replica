import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    // Sorted "idA_idB" key — lets us enforce one conversation per pair with a single
    // unique index (a multikey unique index on the array itself can't do pair-uniqueness).
    participantsKey: { type: String, required: true, unique: true },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isStrangerConversation: { type: Boolean, default: false },
    connectionRequestSent: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

conversationSchema.pre('validate', function setParticipantsKey(next) {
  if (Array.isArray(this.participants) && this.participants.length === 2) {
    this.participantsKey = this.participants.map(String).sort().join('_');
  }
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
