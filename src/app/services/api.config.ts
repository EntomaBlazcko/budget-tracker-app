/**
 * Base URL of the REST backend.
 *
 * Web dev: `npm run start:api` serves http://localhost:3000/api on this machine.
 * Physical Android device: the app points at the development PC's LAN IP so the
 * REST demo works on the phone. Change this if the PC gets a different IP, and
 * keep the phone on the same Wi-Fi. Plain HTTP is allowed in the debug build by
 * `android:usesCleartextTraffic="true"` in AndroidManifest.xml.
 */
export const API_BASE_URL = 'http://192.168.100.17:3000/api';
