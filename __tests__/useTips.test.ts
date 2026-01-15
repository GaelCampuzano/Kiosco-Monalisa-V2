import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTips } from '@/hooks/useTips';
import * as actions from '@/app/actions/tips';
import * as idb from 'idb-keyval';
import { toast } from 'sonner';

// Mocks
vi.mock('@/app/actions/tips', () => ({
  saveTipToDb: vi.fn(),
}));

vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useTips Hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default online status
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      configurable: true,
    });
  });

  it('should save tip to DB when online', async () => {
    (actions.saveTipToDb as Mock).mockResolvedValue({ success: true });
    (idb.get as Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useTips());

    const tipData = {
      waiterName: 'Juan',
      tableNumber: '10',
      tipPercentage: 10,
    };

    await act(async () => {
      await result.current.saveTip(tipData);
    });

    expect(actions.saveTipToDb).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Propina registrada correctamente');
    expect(idb.set).not.toHaveBeenCalled(); // Should not save locally if online success
  });

  it('should save to IndexedDB when offline', async () => {
    // Simulate offline
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      configurable: true,
    });

    (idb.get as Mock).mockResolvedValue([]); // Initial empty store

    const { result } = renderHook(() => useTips());

    const tipData = {
      waiterName: 'Pedro',
      tableNumber: '5',
      tipPercentage: 15,
    };

    await act(async () => {
      await result.current.saveTip(tipData);
    });

    expect(actions.saveTipToDb).not.toHaveBeenCalled();
    expect(idb.set).toHaveBeenCalled();
    expect(toast.warning).toHaveBeenCalled();
    expect(result.current.isOffline).toBe(true);
  });

  it('should save to IndexedDB when server action fails', async () => {
    (actions.saveTipToDb as Mock).mockResolvedValue({ success: false, error: 'DB Error' });
    (idb.get as Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useTips());

    const tipData = { waiterName: 'Luis', tableNumber: '1', tipPercentage: 20 };

    await act(async () => {
      await result.current.saveTip(tipData);
    });

    expect(actions.saveTipToDb).toHaveBeenCalled();
    expect(idb.set).toHaveBeenCalled(); // Fallback to local
    expect(toast.warning).toHaveBeenCalled();
  });

  it('should sync offline tips when back online', async () => {
    // Setup pending tips in IDB
    const offlineTips = [
      { idempotencyKey: 'abc', waiterName: 'SyncPending', tableNumber: '99', tipPercentage: 10 },
    ];
    (idb.get as Mock).mockResolvedValue(offlineTips);
    (actions.saveTipToDb as Mock).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useTips());

    // Trigger sync manually or via effect (effect runs on mount)
    // Here we test the sync function exposed
    await act(async () => {
      await result.current.syncOfflineTips();
    });

    expect(actions.saveTipToDb).toHaveBeenCalledTimes(1);
    expect(idb.set).toHaveBeenCalled(); // To remove the synced tip
    expect(toast.success).toHaveBeenCalled();
  });
});
