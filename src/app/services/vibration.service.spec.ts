import { TestBed } from '@angular/core/testing';
import { Haptics } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';

import { VibrationService } from './vibration.service';

vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    notification: vi.fn(),
    impact: vi.fn(),
    vibrate: vi.fn(),
  },
  NotificationType: { Success: 'SUCCESS', Warning: 'WARNING', Error: 'ERROR' },
  ImpactStyle: { Heavy: 'HEAVY' },
}));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('VibrationService', () => {
  let service: VibrationService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });
    vi.mocked(Preferences.set).mockResolvedValue(undefined);
    service = TestBed.inject(VibrationService);
  });

  it('defaults to enabled when nothing is saved', async () => {
    await expect(service.loadSetting()).resolves.toBe(true);
  });

  it('reads and writes the saved choice', async () => {
    vi.mocked(Preferences.get).mockResolvedValue({ value: 'false' });
    await expect(service.loadSetting()).resolves.toBe(false);

    await service.setEnabled(true);

    expect(Preferences.set).toHaveBeenCalledWith({ key: 'tally.vibrationEnabled', value: 'true' });
  });

  it('uses the matching haptic style for each event', async () => {
    await service.success();
    await service.warning();
    await service.error();

    expect(Haptics.notification).toHaveBeenNthCalledWith(1, { type: 'SUCCESS' });
    expect(Haptics.notification).toHaveBeenNthCalledWith(2, { type: 'WARNING' });
    expect(Haptics.notification).toHaveBeenNthCalledWith(3, { type: 'ERROR' });
  });

  it('buzzes harder when the budget is exceeded', async () => {
    await service.strong();

    expect(Haptics.impact).toHaveBeenCalledWith({ style: 'HEAVY' });
    expect(Haptics.vibrate).toHaveBeenCalledWith({ duration: 300 });
  });

  it('does nothing while turned off', async () => {
    await service.setEnabled(false);

    await service.success();
    await service.strong();

    expect(Haptics.notification).not.toHaveBeenCalled();
    expect(Haptics.impact).not.toHaveBeenCalled();
  });

  it('swallows haptics errors so the browser does not crash', async () => {
    vi.mocked(Haptics.notification).mockRejectedValue(new Error('not supported'));

    await expect(service.success()).resolves.toBeUndefined();
  });
});
