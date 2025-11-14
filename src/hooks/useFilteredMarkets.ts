import { useMemo } from 'react';

import { SortColumn } from '../../app/markets/components/constants';
import { TrustedVault, getVaultKey } from '@/constants/vaults/known_vaults';
import { useTokens } from '@/components/providers/TokenProvider';
import { filterMarkets, sortMarkets, createPropertySort, createStarredSort } from '@/utils/marketFilters';
import { Market } from '@/utils/types';
import type { MarketFilters, MarketSettings, MarketSort } from '@/store/useMarketStore';

export interface UseFilteredMarketsOptions {
  markets: Market[] | null;
  filters: MarketFilters;
  settings: MarketSettings;
  sort: MarketSort;
  staredIds: string[];
  trustedVaults: TrustedVault[];
}

/**
 * Custom hook to filter and sort markets based on current filters and settings.
 * Uses memoization to prevent unnecessary recalculations.
 */
export function useFilteredMarkets({
  markets,
  filters,
  settings,
  sort,
  staredIds,
  trustedVaults,
}: UseFilteredMarketsOptions): Market[] {
  const { findToken } = useTokens();

  // Create set of trusted vault keys for efficient lookup
  const trustedVaultKeys = useMemo(() => {
    return new Set(trustedVaults.map((vault) => getVaultKey(vault.address, vault.chainId)));
  }, [trustedVaults]);

  // Check if a market has a trusted vault
  const hasTrustedVault = useMemo(
    () => (market: Market) => {
      if (!market.supplyingVaults?.length) return false;
      const chainId = market.morphoBlue.chain.id;
      return market.supplyingVaults.some((vault) => {
        if (!vault.address) return false;
        return trustedVaultKeys.has(getVaultKey(vault.address as string, chainId));
      });
    },
    [trustedVaultKeys],
  );

  // Filter and sort markets
  const filteredAndSortedMarkets = useMemo(() => {
    if (!markets) return [];

    // Apply filters using the composable filtering system
    let filtered = filterMarkets(markets, {
      selectedNetwork: filters.selectedNetwork,
      showUnknownTokens: settings.includeUnknownTokens,
      showUnknownOracle: settings.showUnknownOracle,
      selectedCollaterals: filters.selectedCollaterals,
      selectedLoanAssets: filters.selectedLoanAssets,
      selectedOracles: filters.selectedOracles,
      usdFilters: {
        minSupply: {
          enabled: settings.filterEnabled.minSupply,
          threshold: settings.usdFilters.minSupply,
        },
        minBorrow: {
          enabled: settings.filterEnabled.minBorrow,
          threshold: settings.usdFilters.minBorrow,
        },
        minLiquidity: {
          enabled: settings.filterEnabled.minLiquidity,
          threshold: settings.usdFilters.minLiquidity,
        },
      },
      findToken,
      searchQuery: filters.searchQuery,
    });

    // Apply trusted vaults filter if enabled
    if (settings.trustedVaultsOnly) {
      filtered = filtered.filter(hasTrustedVault);
    }

    // Apply sorting
    let sorted: Market[];
    if (sort.column === SortColumn.Starred) {
      sorted = sortMarkets(filtered, createStarredSort(staredIds), 1);
    } else if (sort.column === SortColumn.TrustedBy) {
      sorted = sortMarkets(
        filtered,
        (a, b) => Number(hasTrustedVault(a)) - Number(hasTrustedVault(b)),
        sort.direction,
      );
    } else {
      const sortPropertyMap: Record<SortColumn, string> = {
        [SortColumn.Starred]: 'uniqueKey',
        [SortColumn.LoanAsset]: 'loanAsset.name',
        [SortColumn.CollateralAsset]: 'collateralAsset.name',
        [SortColumn.LLTV]: 'lltv',
        [SortColumn.Supply]: 'state.supplyAssetsUsd',
        [SortColumn.Borrow]: 'state.borrowAssetsUsd',
        [SortColumn.SupplyAPY]: 'state.supplyApy',
        [SortColumn.Liquidity]: 'state.liquidityAssets',
        [SortColumn.BorrowAPY]: 'state.borrowApy',
        [SortColumn.RateAtTarget]: 'state.apyAtTarget',
        [SortColumn.TrustedBy]: '',
      };
      const propertyPath = sortPropertyMap[sort.column];
      if (propertyPath) {
        sorted = sortMarkets(filtered, createPropertySort(propertyPath), sort.direction);
      } else {
        sorted = filtered;
      }
    }

    return sorted;
  }, [
    markets,
    filters,
    settings,
    sort,
    staredIds,
    findToken,
    hasTrustedVault,
  ]);

  return filteredAndSortedMarkets;
}
