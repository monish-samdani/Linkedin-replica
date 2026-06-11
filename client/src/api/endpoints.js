export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/me',
    EXPERIENCE: '/auth/me/experience',
    EDUCATION: '/auth/me/education',
    SKILLS: '/auth/me/skills',
    PROFILE_PHOTO: '/auth/me/photo/profile',
    BANNER_PHOTO: '/auth/me/photo/banner',
  },
  USERS: {
    BY_ID: (id) => `/users/${id}`,
  },
};
