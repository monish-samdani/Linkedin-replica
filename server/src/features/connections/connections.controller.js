import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getConnectionState,
  getUserConnections,
  getPendingRequests,
  getMutualConnections,
} from './connections.service.js';

export const sendRequestController = asyncHandler(async (req, res) => {
  const connection = await sendConnectionRequest(req.user._id, req.params.recipientId);
  return sendSuccess(res, {
    message: 'Connection request sent',
    data: { connection },
    statusCode: 201,
  });
});

export const acceptRequestController = asyncHandler(async (req, res) => {
  const connection = await acceptConnectionRequest(req.params.requestId, req.user._id);
  return sendSuccess(res, { message: 'Connection request accepted', data: { connection } });
});

export const rejectRequestController = asyncHandler(async (req, res) => {
  const connection = await rejectConnectionRequest(req.params.requestId, req.user._id);
  return sendSuccess(res, { message: 'Connection request rejected', data: { connection } });
});

export const removeConnectionController = asyncHandler(async (req, res) => {
  const result = await removeConnection(req.params.connectionId, req.user._id);
  return sendSuccess(res, { message: 'Connection removed', data: result });
});

export const getStatusController = asyncHandler(async (req, res) => {
  const state = await getConnectionState(req.user._id, req.params.otherUserId);
  return sendSuccess(res, { message: 'Connection status fetched', data: state });
});

export const getMyConnectionsController = asyncHandler(async (req, res) => {
  const connections = await getUserConnections(req.user._id);
  return sendSuccess(res, { message: 'Connections fetched', data: { connections } });
});

export const getRequestsController = asyncHandler(async (req, res) => {
  const requests = await getPendingRequests(req.user._id);
  return sendSuccess(res, { message: 'Pending requests fetched', data: { requests } });
});

export const getMutualController = asyncHandler(async (req, res) => {
  const mutual = await getMutualConnections(req.user._id, req.params.otherUserId);
  return sendSuccess(res, { message: 'Mutual connections fetched', data: { mutual } });
});
