import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // Generic methods
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // User-specific methods
  async setUserToken(token: string): Promise<void> {
    return this.setItem('userToken', token);
  }

  async getUserToken(): Promise<string | null> {
    return this.getItem<string>('userToken');
  }

  async removeUserToken(): Promise<void> {
    return this.removeItem('userToken');
  }

  async setUserProfile(profile: any): Promise<void> {
    return this.setItem('userProfile', profile);
  }

  async getUserProfile(): Promise<any | null> {
    return this.getItem('userProfile');
  }

  async setUserPreferences(preferences: any): Promise<void> {
    return this.setItem('userPreferences', preferences);
  }

  async getUserPreferences(): Promise<any | null> {
    return this.getItem('userPreferences');
  }

  // App state methods
  async setHasLaunched(hasLaunched: boolean): Promise<void> {
    return this.setItem('hasLaunched', hasLaunched);
  }

  async getHasLaunched(): Promise<boolean> {
    const value = await this.getItem<boolean>('hasLaunched');
    return value === true;
  }

  async setOnboardingComplete(complete: boolean): Promise<void> {
    return this.setItem('onboardingComplete', complete);
  }

  async getOnboardingComplete(): Promise<boolean> {
    const value = await this.getItem<boolean>('onboardingComplete');
    return value === true;
  }

  // Cache methods
  async setCachedData<T>(key: string, data: T, expirationMinutes = 60): Promise<void> {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expiration: Date.now() + (expirationMinutes * 60 * 1000),
    };
    return this.setItem(`cache_${key}`, cacheItem);
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    const cacheItem = await this.getItem<{
      data: T;
      timestamp: number;
      expiration: number;
    }>(`cache_${key}`);

    if (!cacheItem) return null;

    if (Date.now() > cacheItem.expiration) {
      await this.removeItem(`cache_${key}`);
      return null;
    }

    return cacheItem.data;
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Draft methods (for unsent messages, posts, etc.)
  async saveDraft(type: string, id: string, content: any): Promise<void> {
    return this.setItem(`draft_${type}_${id}`, {
      content,
      timestamp: Date.now(),
    });
  }

  async getDraft(type: string, id: string): Promise<any | null> {
    const draft = await this.getItem<{
      content: any;
      timestamp: number;
    }>(`draft_${type}_${id}`);
    return draft?.content || null;
  }

  async removeDraft(type: string, id: string): Promise<void> {
    return this.removeItem(`draft_${type}_${id}`);
  }

  async getAllDrafts(type: string): Promise<{ [id: string]: any }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const draftKeys = keys.filter(key => key.startsWith(`draft_${type}_`));
      const drafts: { [id: string]: any } = {};

      for (const key of draftKeys) {
        const id = key.replace(`draft_${type}_`, '');
        const draft = await this.getDraft(type, id);
        if (draft) {
          drafts[id] = draft;
        }
      }

      return drafts;
    } catch (error) {
      console.error('Error getting all drafts:', error);
      return {};
    }
  }

  // Settings methods
  async setSetting(key: string, value: any): Promise<void> {
    const settings = await this.getItem<{ [key: string]: any }>('appSettings') || {};
    settings[key] = value;
    return this.setItem('appSettings', settings);
  }

  async getSetting<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    const settings = await this.getItem<{ [key: string]: any }>('appSettings') || {};
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }

  async removeSetting(key: string): Promise<void> {
    const settings = await this.getItem<{ [key: string]: any }>('appSettings') || {};
    delete settings[key];
    return this.setItem('appSettings', settings);
  }
}

export const storageService = new StorageService();