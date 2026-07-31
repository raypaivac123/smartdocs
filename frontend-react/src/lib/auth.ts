import type { AuthUser } from './types';

const KEY_TOKEN = 'sd_token';
const KEY_USER = 'sd_user';

export const Auth = {
  save(token: string, user: AuthUser) {
    localStorage.setItem(KEY_TOKEN, token);
    localStorage.setItem(KEY_USER, JSON.stringify(user));
  },
  getToken(): string | null {
    return localStorage.getItem(KEY_TOKEN);
  },
  getUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(KEY_USER);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },
  isAuth(): boolean {
    return !!this.getToken();
  },
  logout() {
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_USER);
  },
};
