import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_COLUMN_VISIBILITY, type ColumnVisibility } from '../../app/markets/components/columnVisibility';
import { SortColumn } from '../../app/markets/components/constants';
import { DEFAULT_MIN_SUPPLY_USD, DEFAULT_MIN_LIQUIDITY_USD } from '@/constants/markets';
import { SupportedNetworks } from '@/utils/networks';
import { PriceFeedVendors } from '@/utils/oracle';

// Filter state
export interface MarketFilters {
  selectedCollaterals: string[];
  selectedLoanAssets: string[];
  selectedNetwork: SupportedNetworks | null;
  selectedOracles: PriceFeedVendors[];
  searchQuery: string;
}

// USD filter configuration
export interface UsdFilters {
  minSupply: string;
  minBorrow: string;
  minLiquidity: string;
}

export interface FilterEnabled {
  minSupply: boolean;
  minBorrow: boolean;
  minLiquidity: boolean;
}

// Settings state
export interface MarketSettings {
  usdFilters: UsdFilters;
  filterEnabled: FilterEnabled;
  includeUnknownTokens: boolean;
  showUnknownOracle: boolean;
  trustedVaultsOnly: boolean;
  columnVisibility: ColumnVisibility;
  tableViewMode: 'compact' | 'expanded';
}

// Sort state
export interface MarketSort {
  column: SortColumn;
  direction: 1 | -1;
}

// Complete store interface
interface MarketStore {
  // State
  filters: MarketFilters;
  settings: MarketSettings;
  sort: MarketSort;

  // Filter actions
  setFilter: <K extends keyof MarketFilters>(key: K, value: MarketFilters[K]) => void;
  setMultipleFilters: (updates: Partial<MarketFilters>) => void;
  resetFilters: () => void;

  // Settings actions
  setSetting: <K extends keyof MarketSettings>(key: K, value: MarketSettings[K]) => void;
  setUsdFilter: <K extends keyof UsdFilters>(key: K, value: string) => void;
  setFilterEnabled: <K extends keyof FilterEnabled>(key: K, value: boolean) => void;
  setColumnVisibility: (visibility: ColumnVisibility) => void;

  // Sort actions
  setSort: (column: SortColumn, direction?: 1 | -1) => void;
  toggleSortDirection: () => void;
}

// Default values
const defaultFilters: MarketFilters = {
  selectedCollaterals: [],
  selectedLoanAssets: [],
  selectedNetwork: null,
  selectedOracles: [],
  searchQuery: '',
};

const defaultSettings: MarketSettings = {
  usdFilters: {
    minSupply: DEFAULT_MIN_SUPPLY_USD.toString(),
    minBorrow: '',
    minLiquidity: DEFAULT_MIN_LIQUIDITY_USD.toString(),
  },
  filterEnabled: {
    minSupply: true,
    minBorrow: false,
    minLiquidity: false,
  },
  includeUnknownTokens: false,
  showUnknownOracle: false,
  trustedVaultsOnly: false,
  columnVisibility: DEFAULT_COLUMN_VISIBILITY,
  tableViewMode: 'compact',
};

const defaultSort: MarketSort = {
  column: SortColumn.Supply,
  direction: -1,
};

export const useMarketStore = create<MarketStore>()(
  persist(
    (set) => ({
      // Initial state
      filters: defaultFilters,
      settings: defaultSettings,
      sort: defaultSort,

      // Filter actions
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      setMultipleFilters: (updates) =>
        set((state) => ({
          filters: { ...state.filters, ...updates },
        })),

      resetFilters: () =>
        set({
          filters: defaultFilters,
        }),

      // Settings actions
      setSetting: (key, value) =>
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        })),

      setUsdFilter: (key, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            usdFilters: { ...state.settings.usdFilters, [key]: value },
          },
        })),

      setFilterEnabled: (key, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            filterEnabled: { ...state.settings.filterEnabled, [key]: value },
          },
        })),

      setColumnVisibility: (visibility) =>
        set((state) => ({
          settings: {
            ...state.settings,
            columnVisibility: { ...DEFAULT_COLUMN_VISIBILITY, ...visibility },
          },
        })),

      // Sort actions
      setSort: (column, direction) =>
        set((state) => ({
          sort: {
            column,
            direction:
              direction ?? (column === state.sort.column ? (-state.sort.direction as 1 | -1) : -1),
          },
        })),

      toggleSortDirection: () =>
        set((state) => ({
          sort: {
            ...state.sort,
            direction: -state.sort.direction as 1 | -1,
          },
        })),
    }),
    {
      name: 'market-storage', // localStorage key
      partialize: (state) => ({
        // Only persist settings and sort, not filters (they come from URL)
        settings: state.settings,
        sort: state.sort,
      }),
    },
  ),
);

// Selector hooks for better performance
export const useMarketFilters = () => useMarketStore((state) => state.filters);
export const useMarketSettings = () => useMarketStore((state) => state.settings);
export const useMarketSort = () => useMarketStore((state) => state.sort);
