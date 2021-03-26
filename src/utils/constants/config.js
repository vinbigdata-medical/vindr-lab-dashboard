// common
export const TOKEN = 'token';
export const REFRESH_TOKEN = 'refresh_token';
export const FIRST_REFRESH_TOKEN = 'first_refresh_token';
export const EXPIRED_REFRESH_TOKEN = 60 * 60 * 1000;
export const VINLAB_LOCALE = 'vinlab-locale';
export const VINLAB_VIEW_MODE = 'vinlab_view_mode';

const {
  OIDC_ACCESS_TOKEN_URI,
  OIDC_AUTHORIZATION_URI,
  OIDC_REDIRECT_URI,
  OIDC_CLIENT_ID,
  OIDC_LOGOUT_URI,
  OIDC_USERINFO_ENDPOINT,
  OIDC_SCOPE,
  DASHBOARD_URL_PREFIX,
  SERVER_BASE_URL,
  MEDICAL_VIEWER_URL,
  OIDC_AUDIENCE,
} = process.env || {};

// Config to run local for dashboard and viewer
export const REDIRECT_VIEWER_URL =
  MEDICAL_VIEWER_URL || window.origin + '/medical-view/viewer';

export const BASE_ROUTER_PREFIX = DASHBOARD_URL_PREFIX || '/dashboard';

const BASE_URL = SERVER_BASE_URL || '';

export let CONFIG_SERVER = {
  BASE_URL: BASE_URL,
  LOGIN_CALLBACK_URI: OIDC_REDIRECT_URI || window.origin,
  CLIENT_ID: OIDC_CLIENT_ID || '',
  RESPONSE_TYPE: 'code',
  AUDIENCE: OIDC_AUDIENCE || '',
  SCOPE: OIDC_SCOPE || 'profile',
  STATE: Math.random().toString(36).substring(2),
  OIDC_ACCESS_TOKEN_URI: OIDC_ACCESS_TOKEN_URI,
  OIDC_AUTHORIZATION_URI: OIDC_AUTHORIZATION_URI,
  OIDC_LOGOUT_URI: OIDC_LOGOUT_URI,
  OIDC_USERINFO_ENDPOINT: OIDC_USERINFO_ENDPOINT,
  TOKEN_PERMISSION: ['api#all'],
};

// routes
export const routes = {
  LOGOUT: '/logout',
  PROJECTS: '/projects',
  STUDY_LIST: '/study-list',
  STUDY_LIST_ID: '/study-list/:projectId',
  LABEL_MANAGEMENT: '/label-management',
};

export const STUDY_STATUS = {
  ALL: 'count',
  ASSIGNED: 'ASSIGNED',
  UNASSIGNED: 'UNASSIGNED',
  COMPLETED: 'COMPLETED',
};

export const TASK_STATUS = {
  ALL: 'count',
  NEW: 'NEW',
  DOING: 'DOING',
  COMPLETED: 'COMPLETED',
};

export const LABEL_TYPE = [
  { text: 'Impression', value: 'IMPRESSION' },
  { text: 'Finding', value: 'FINDING' },
];

export const DRAW_SCOPE = {
  STUDY: 'STUDY',
  SERIES: 'SERIES',
  IMAGE: 'IMAGE',
};

export const LABEL_SCOPE = [
  { text: 'Study', value: DRAW_SCOPE.STUDY, isDisable: 'FINDING' },
  { text: 'Series', value: DRAW_SCOPE.SERIES, isDisable: 'FINDING' },
  { text: 'Image', value: DRAW_SCOPE.IMAGE },
];

export const DRAW_TYPE = {
  TAG: 'TAG',
  BOUNDING_BOX: 'BOUNDING_BOX',
  POLYGON: 'POLYGON',
  MASK: 'MASK',
};

export const ANNOTATION_TYPE = [
  { text: 'Tag', value: DRAW_TYPE.TAG, isDisable: 'FINDING' },
  {
    text: 'Bounding box',
    value: DRAW_TYPE.BOUNDING_BOX,
    isDisable: 'IMPRESSION',
  },
  { text: 'Polygon', value: DRAW_TYPE.POLYGON, isDisable: 'IMPRESSION' },
  { text: 'Mask', value: DRAW_TYPE.MASK, isDisable: 'IMPRESSION' },
];

export const DEFAULT_COLOR_PICKER = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#607d8b',
];

export const SESSION_TYPE = {
  STUDY: 'STUDY',
  TASK: 'TASK',
};

export const ROLES = {
  PO: 'PO',
  PO_PARTNER: 'PO_PARTNER',
  LABELER: 'Labeler',
};

export const STUDY_TABS = {
  DATA: 'DATA',
  TASK: 'TASK',
  SETTING: 'SETTING',
  ANNOTATE: 'ANNOTATE',
  REVIEW: 'REVIEW',
};

export const WORKFLOW_PROJECT = {
  SINGLE: 'SINGLE',
  TRIANGLE: 'TRIANGLE',
};

export const USER_ROLES = {
  ANNOTATOR: 'ANNOTATOR',
  REVIEWER: 'REVIEWER',
  PROJECT_OWNER: 'PROJECT_OWNER',
};
