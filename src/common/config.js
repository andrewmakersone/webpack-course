// export const API_URL = process.env.VUE_APP_API_URL;
// export const USER = process.env.VUE_APP_USER;
export const API_URL = 'https://6ecff0c4.ngrok.io/users';
export const USER = 'testuser';
export const CAMERAS_URL = `${API_URL}/${USER}/cams`;
export const SDP_URL = `${API_URL}/${USER}/sdp`;
export const SNAPSHOT_URL = `${API_URL}/${USER}/snapshot0`;
export const SNAPSHOT_QUALITY = '360'; //160 360 720 1080

export const PC_CONFIG = {
  iceServers: [{
    urls: "stun:sandbox.htc.ru:3478"
  },
    {
      urls: "turn:sandbox.htc.ru:3478",
      username: "1587113525",
      credential: "jipYGF/gHZ2sotVCzMrpY096d5M="
    }
  ],
  bundlePolicy: "max-bundle"
};

export const RETRIES = 3; // RETRIES IF SDP POST FAILED

export const VIDEO_ELEMENT_ID = 'video';
export const PLAYER_STATUS_ELEMENT_ID = 'loader';
export const CONNECTION_STATUS_ELEMENT_ID = 'connection-status';
export const LOG_LIST_ELEMENT_ID = 'debug-log-list';

export default {
  API_URL, USER, CAMERAS_URL, SDP_URL, SNAPSHOT_URL, SNAPSHOT_QUALITY,
  PC_CONFIG,
  RETRIES,
  VIDEO_ELEMENT_ID,
  PLAYER_STATUS_ELEMENT_ID,
  CONNECTION_STATUS_ELEMENT_ID,
  LOG_LIST_ELEMENT_ID
};
