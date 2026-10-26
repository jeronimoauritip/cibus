import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MainPageStore } from './main-page.store';
import { BranchService } from '../../branches/service/branch-service';

describe('MainPageStore', () => {
  let store: MainPageStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MainPageStore,
        BranchService,
        provideHttpClient()
      ]
    });
    store = TestBed.inject(MainPageStore);
  });

  it('should initialize with mock branches by default', () => {
    expect(store).toBeTruthy();
    expect(store.branches().length).toBeGreaterThan(0);
    expect(store.branchOverviews().length).toBe(3);
  });

  it('should compute globalStats accurately', () => {
    const stats = store.globalStats();
    expect(stats.totalBranches).toBe(3);
    expect(stats.totalTables).toBeGreaterThan(0);
    expect(stats.occupancyPercent).toBeGreaterThanOrEqual(0);
    expect(stats.occupancyPercent).toBeLessThanOrEqual(100);
  });

  it('should filter branches by status', () => {
    store.setFilter('all');
    expect(store.filteredOverviews().length).toBe(3);

    store.setFilter('active');
    const active = store.filteredOverviews();
    active.forEach(b => expect(b.status).toBe('active'));
  });
});
