'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useMarketStore } from '@/store/useMarketStore';
import { SupportedNetworks } from '@/utils/networks';
import { PriceFeedVendors } from '@/utils/oracle';
import { ERC20Token, UnknownERC20Token } from '@/utils/tokens';

import AssetFilter from './AssetFilter';
import NetworkFilter from './NetworkFilter';
import OracleFilter from './OracleFilter';

interface MarketFiltersProps {
  uniqueCollaterals: (ERC20Token | UnknownERC20Token)[];
  uniqueLoanAssets: (ERC20Token | UnknownERC20Token)[];
  loading: boolean;
  searchQuery: string;
}

export function MarketFilters({
  uniqueCollaterals,
  uniqueLoanAssets,
  loading,
  searchQuery,
}: MarketFiltersProps) {
  const router = useRouter();
  const { filters, setFilter } = useMarketStore();

  const updateUrlParams = useCallback(
    (collaterals: string[], loanAssets: string[], network: SupportedNetworks | null) => {
      const params = new URLSearchParams();

      if (collaterals.length > 0) {
        params.set('collaterals', collaterals.join(','));
      }
      if (loanAssets.length > 0) {
        params.set('loanAssets', loanAssets.join(','));
      }
      if (network) {
        params.set('network', network.toString());
      }

      const newParams = params.toString();
      router.push(`?${newParams}`, { scroll: false });
    },
    [router],
  );

  const handleNetworkChange = useCallback(
    (network: SupportedNetworks | null) => {
      setFilter('selectedNetwork', network);
      updateUrlParams(filters.selectedCollaterals, filters.selectedLoanAssets, network);
    },
    [setFilter, updateUrlParams, filters.selectedCollaterals, filters.selectedLoanAssets],
  );

  const handleLoanAssetsChange = useCallback(
    (assets: string[]) => {
      setFilter('selectedLoanAssets', assets);
      updateUrlParams(filters.selectedCollaterals, assets, filters.selectedNetwork);
    },
    [setFilter, updateUrlParams, filters.selectedCollaterals, filters.selectedNetwork],
  );

  const handleCollateralsChange = useCallback(
    (assets: string[]) => {
      setFilter('selectedCollaterals', assets);
      updateUrlParams(assets, filters.selectedLoanAssets, filters.selectedNetwork);
    },
    [setFilter, updateUrlParams, filters.selectedLoanAssets, filters.selectedNetwork],
  );

  const handleOraclesChange = useCallback(
    (oracles: PriceFeedVendors[]) => {
      setFilter('selectedOracles', oracles);
    },
    [setFilter],
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <NetworkFilter selectedNetwork={filters.selectedNetwork} setSelectedNetwork={handleNetworkChange} />

      <AssetFilter
        label="Loan Asset"
        placeholder="All loan asset"
        selectedAssets={filters.selectedLoanAssets}
        setSelectedAssets={handleLoanAssetsChange}
        items={uniqueLoanAssets}
        loading={loading}
        updateFromSearch={searchQuery.match(/loan:(\w+)/)?.[1]?.split(',')}
      />

      <AssetFilter
        label="Collateral"
        placeholder="All collateral"
        selectedAssets={filters.selectedCollaterals}
        setSelectedAssets={handleCollateralsChange}
        items={uniqueCollaterals}
        loading={loading}
        updateFromSearch={searchQuery.match(/collateral:(\w+)/)?.[1]?.split(',')}
      />

      <OracleFilter selectedOracles={filters.selectedOracles} setSelectedOracles={handleOraclesChange} />
    </div>
  );
}
