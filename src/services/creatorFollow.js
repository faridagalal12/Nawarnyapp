import api from './api';

const FOLLOW_ENDPOINTS = [
  (creatorId) => ({ method: 'post', url: `/creator/${creatorId}/follow` }),
  (creatorId) => ({ method: 'delete', url: `/creator/${creatorId}/follow`, unfollowOnly: true }),
  (creatorId) => ({ method: 'post', url: `/creators/${creatorId}/follow` }),
  (creatorId) => ({ method: 'delete', url: `/creators/${creatorId}/follow`, unfollowOnly: true }),
  (creatorId) => ({ method: 'post', url: `/users/${creatorId}/follow` }),
  (creatorId) => ({ method: 'delete', url: `/users/${creatorId}/follow`, unfollowOnly: true }),
  (creatorId) => ({ method: 'post', url: `/creator/${creatorId}/unfollow`, unfollowOnly: true }),
  (creatorId) => ({ method: 'post', url: `/creators/${creatorId}/unfollow`, unfollowOnly: true }),
  (creatorId) => ({ method: 'post', url: `/users/${creatorId}/unfollow`, unfollowOnly: true }),
];

export async function toggleCreatorFollow(creatorId, shouldFollow) {
  let lastError = null;

  for (const buildEndpoint of FOLLOW_ENDPOINTS) {
    const endpoint = buildEndpoint(creatorId);
    const isUnfollowAction = endpoint.method === 'delete' || endpoint.url.endsWith('/unfollow');

    if (shouldFollow && endpoint.unfollowOnly) continue;
    if (!shouldFollow && !isUnfollowAction) continue;

    try {
      const response = await api.request({
        method: endpoint.method,
        url: endpoint.url,
      });
      return response;
    } catch (error) {
      const status = error?.response?.status;
      lastError = error;
      if (status !== 404) throw error;
    }
  }

  throw lastError ?? new Error('No working follow endpoint found.');
}
