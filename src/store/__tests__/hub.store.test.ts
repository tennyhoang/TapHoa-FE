import { describe, it, expect, beforeEach } from 'vitest';
import { useHubStore } from '../hub.store';

beforeEach(() => {
  useHubStore.setState({ currentHub: null });
});

describe('hub.store', () => {
  it('should have initial state with currentHub=null', () => {
    expect(useHubStore.getState().currentHub).toBeNull();
  });

  it('should set the hub on setHub', () => {
    const hub = { id: '1', name: 'Main Hub', address: '123 Street', isActive: true };
    useHubStore.getState().setHub(hub);
    expect(useHubStore.getState().currentHub).toEqual(hub);
  });

  it('should set currentHub to null on clearHub', () => {
    const hub = { id: '1', name: 'Main Hub', address: '123 Street', isActive: true };
    useHubStore.getState().setHub(hub);
    useHubStore.getState().clearHub();
    expect(useHubStore.getState().currentHub).toBeNull();
  });
});
