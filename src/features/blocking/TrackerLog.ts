import type { TrackerBlockEvent } from './types';

const MAX_EVENTS = 500;

export class TrackerLog {
  private events: TrackerBlockEvent[] = [];

  record(
    trackerDomain: string,
    hostPage: string,
    category: TrackerBlockEvent['category'] = 'TRACKER',
  ): TrackerBlockEvent {
    const event: TrackerBlockEvent = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
      trackerDomain,
      hostPage,
      blockedAt: new Date().toISOString(),
      category,
    };
    this.events.unshift(event);
    if (this.events.length > MAX_EVENTS) {
      this.events.length = MAX_EVENTS;
    }
    return event;
  }

  getAll(): TrackerBlockEvent[] {
    return [...this.events];
  }

  getByDomain(domain: string): TrackerBlockEvent[] {
    return this.events.filter(e => e.trackerDomain === domain);
  }

  getByHostPage(hostPage: string): TrackerBlockEvent[] {
    return this.events.filter(e => e.hostPage === hostPage);
  }

  clear(): void {
    this.events = [];
  }

  count(): number {
    return this.events.length;
  }
}
