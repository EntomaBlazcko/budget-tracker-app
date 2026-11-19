import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';

const VIBRATION_KEY = 'tally.vibrationEnabled';

@Injectable({ providedIn: 'root' })
export class VibrationService {
  private enabledSetting = true;

  /** Reads the saved on/off choice; defaults to on. */
  async loadSetting(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: VIBRATION_KEY });
      this.enabledSetting = value === null ? true : value === 'true';
    } catch {
      this.enabledSetting = true;
    }

    return this.enabledSetting;
  }

  isEnabled(): boolean {
    return this.enabledSetting;
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.enabledSetting = enabled;

    try {
      await Preferences.set({ key: VIBRATION_KEY, value: String(enabled) });
    } catch {
      // The browser has no Preferences, so saving should never crash the app.
    }
  }

  success(): Promise<void> {
    return this.vibrate(() => Haptics.notification({ type: NotificationType.Success }));
  }

  warning(): Promise<void> {
    return this.vibrate(() => Haptics.notification({ type: NotificationType.Warning }));
  }

  error(): Promise<void> {
    return this.vibrate(() => Haptics.notification({ type: NotificationType.Error }));
  }

  /** A longer buzz for going over the monthly budget. */
  strong(): Promise<void> {
    return this.vibrate(async () => {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      await Haptics.vibrate({ duration: 300 });
    });
  }

  private async vibrate(action: () => Promise<void>): Promise<void> {
    if (!this.enabledSetting) {
      return;
    }

    try {
      await action();
    } catch {
      // Haptics does not exist in the browser, so ignore failures there.
    }
  }
}
