'use client';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useDisclosure } from '@heroui/react';
import { Chain } from '@rainbow-me/rainbowkit';

import Header from '@/components/layout/header/Header';
import { useTokens } from '@/components/providers/TokenProvider';
import TrustedVaultsModal from '@/components/settings/TrustedVaultsModal';
import EmptyScreen from '@/components/Status/EmptyScreen';
import LoadingScreen from '@/components/Status/LoadingScreen';
import { SupplyModalV2 } from '@/components/SupplyModalV2';
import { defaultTrustedVaults, type TrustedVault } from '@/constants/vaults/known_vaults';
import { useFilteredMarkets } from '@/hooks/useFilteredMarkets';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMarkets } from '@/hooks/useMarkets';
import { usePagination } from '@/hooks/usePagination';
import { useStaredMarkets } from '@/hooks/useStaredMarkets';
import { useStyledToast } from '@/hooks/useStyledToast';
import { useMarketStore } from '@/store/useMarketStore';
import { SupportedNetworks } from '@/utils/networks';
import { ERC20Token, UnknownERC20Token } from '@/utils/tokens';
import { Market } from '@/utils/types';

import AdvancedSearchBar, { ShortcutType } from './AdvancedSearchBar';
import { SortColumn } from './constants';
import { MarketFilters } from './MarketFilters';
import MarketSettingsModal from './MarketSettingsModal';
import { MarketToolbar } from './MarketToolbar';
import MarketsTable from './marketsTable';

type MarketContentProps = {
  initialNetwork: SupportedNetworks | null;
  initialCollaterals: string[];
  initialLoanAssets: string[];
};

export default function Markets({
  initialNetwork,
  initialCollaterals,
  initialLoanAssets,
}: MarketContentProps) {
  const toast = useStyledToast();

  // Zustand store
  const { filters, settings, sort, setFilter, setSort, setUsdFilter, setColumnVisibility } =
    useMarketStore();

  // API hooks
  const {
    loading,
    markets: rawMarkets,
    refetch,
    isRefetching,
    showUnwhitelistedMarkets,
    setShowUnwhitelistedMarkets,
    addBlacklistedMarket,
    isBlacklisted,
  } = useMarkets();
  const { staredIds, starMarket, unstarMarket } = useStaredMarkets();
  const { allTokens } = useTokens();

  // Local state (not in store)
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | undefined>(undefined);
  const [uniqueCollaterals, setUniqueCollaterals] = useState<(ERC20Token | UnknownERC20Token)[]>([]);
  const [uniqueLoanAssets, setUniqueLoanAssets] = useState<(ERC20Token | UnknownERC20Token)[]>([]);
  const [isTrustedVaultsModalOpen, setIsTrustedVaultsModalOpen] = useState(false);

  const {
    isOpen: isSettingsModalOpen,
    onOpen: onSettingsModalOpen,
    onOpenChange: onSettingsModalOpenChange,
  } = useDisclosure();

  const { currentPage, setCurrentPage, entriesPerPage, handleEntriesPerPageChange, resetPage } =
    usePagination();

  // User-managed trusted vaults
  const [userTrustedVaults, setUserTrustedVaults] = useLocalStorage<TrustedVault[]>(
    'userTrustedVaults',
    defaultTrustedVaults,
  );

  // Initialize filters from URL params on mount
  useEffect(() => {
    if (initialNetwork !== null) setFilter('selectedNetwork', initialNetwork);
    if (initialCollaterals.length > 0) setFilter('selectedCollaterals', initialCollaterals);
    if (initialLoanAssets.length > 0) setFilter('selectedLoanAssets', initialLoanAssets);
  }, []); // Only run once on mount

  // USD filters helpers
  const usdFilters = useMemo(
    () => ({
      minSupply: settings.usdFilters.minSupply,
      minBorrow: settings.usdFilters.minBorrow,
      minLiquidity: settings.usdFilters.minLiquidity,
    }),
    [settings.usdFilters],
  );

  const setUsdFilters = useCallback(
    (filters: { minSupply: string; minBorrow: string; minLiquidity: string }) => {
      setUsdFilter('minSupply', filters.minSupply);
      setUsdFilter('minBorrow', filters.minBorrow);
      setUsdFilter('minLiquidity', filters.minLiquidity);
    },
    [setUsdFilter],
  );

  // Process unique tokens from markets
  useEffect(() => {
    if (!rawMarkets) return;

    const processTokens = (
      tokenInfoList: { address: string; chainId: number; symbol: string; decimals: number }[],
    ) => {
      if (!settings.includeUnknownTokens) return allTokens;

      // Process unknown tokens
      const unknownTokensBySymbol = tokenInfoList.reduce(
        (acc, token) => {
          if (
            !allTokens.some((known) =>
              known.networks.some(
                (n) =>
                  n.address.toLowerCase() === token.address.toLowerCase() &&
                  n.chain.id === token.chainId,
              ),
            )
          ) {
            if (!acc[token.symbol]) {
              acc[token.symbol] = {
                symbol: token.symbol.length > 10 ? `${token.symbol.slice(0, 10)}...` : token.symbol,
                img: undefined,
                decimals: token.decimals,
                networks: [],
                isUnknown: true,
                source: 'unknown',
              };
            }
            acc[token.symbol].networks.push({
              chain: { id: token.chainId } as Chain,
              address: token.address,
            });
          }
          return acc;
        },
        {} as Record<string, UnknownERC20Token>,
      );

      return [...allTokens, ...Object.values(unknownTokensBySymbol)];
    };

    const collatList = rawMarkets.map((m) => ({
      address: m.collateralAsset.address,
      chainId: m.morphoBlue.chain.id,
      symbol: m.collateralAsset.symbol,
      decimals: m.collateralAsset.decimals,
    }));

    const loanList = rawMarkets.map((m) => ({
      address: m.loanAsset.address,
      chainId: m.morphoBlue.chain.id,
      symbol: m.loanAsset.symbol,
      decimals: m.loanAsset.decimals,
    }));

    setUniqueCollaterals(processTokens(collatList));
    setUniqueLoanAssets(processTokens(loanList));
  }, [rawMarkets, settings.includeUnknownTokens, allTokens]);

  // Use custom hook for filtering and sorting
  const filteredMarkets = useFilteredMarkets({
    markets: rawMarkets,
    filters,
    settings,
    sort,
    staredIds,
    trustedVaults: userTrustedVaults,
  });

  // Reset pagination when filters change
  useEffect(() => {
    resetPage();
  }, [filteredMarkets.length, resetPage]);

  const titleOnclick = useCallback(
    (column: number) => {
      // Validate that column is a valid SortColumn value
      const isValidColumn = Object.values(SortColumn).includes(column);
      if (!isValidColumn) {
        console.error(`Invalid sort column value: ${column}`);
        return;
      }

      setSort(column);
    },
    [setSort],
  );

  // Add keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        const searchInput = document.getElementById('market-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setFilter('searchQuery', query);
    },
    [setFilter],
  );

  const handleFilterUpdate = useCallback(
    (type: ShortcutType, tokens: string[]) => {
      // remove duplicates
      const uniqueTokens = [...new Set(tokens)];

      if (type === ShortcutType.Collateral) {
        setFilter('selectedCollaterals', uniqueTokens);
      } else {
        setFilter('selectedLoanAssets', uniqueTokens);
      }
    },
    [setFilter],
  );

  const handleMarketClick = useCallback(
    (market: Market) => {
      // Build URL with current state from store
      const params = new URLSearchParams();
      if (filters.selectedCollaterals.length > 0) {
        params.set('collaterals', filters.selectedCollaterals.join(','));
      }
      if (filters.selectedLoanAssets.length > 0) {
        params.set('loanAssets', filters.selectedLoanAssets.join(','));
      }
      if (filters.selectedNetwork) {
        params.set('network', filters.selectedNetwork.toString());
      }

      const marketPath = `/market/${market.morphoBlue.chain.id}/${market.uniqueKey}`;
      const targetPath = params.toString() ? `${marketPath}?${params.toString()}` : marketPath;
      window.open(targetPath, '_blank');
    },
    [filters],
  );

  const handleRefresh = () => {
    refetch(() => toast.success('Markets refreshed', 'Markets refreshed successfully'));
  };

  return (
    <>
      <div className="flex w-full flex-col justify-between font-zen">
        <Header />
      </div>
      <div className="container h-full gap-8 px-[4%]">
        <h1 className="py-8 font-zen"> Markets </h1>

        {showSupplyModal && selectedMarket && (
          <SupplyModalV2 market={selectedMarket} onOpenChange={setShowSupplyModal} />
        )}

        <MarketSettingsModal
          isOpen={isSettingsModalOpen}
          onOpenChange={onSettingsModalOpenChange}
          usdFilters={usdFilters}
          setUsdFilters={setUsdFilters}
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={handleEntriesPerPageChange}
          columnVisibility={settings.columnVisibility}
          setColumnVisibility={setColumnVisibility}
          onOpenTrustedVaultsModal={() => setIsTrustedVaultsModalOpen(true)}
          trustedVaults={userTrustedVaults}
        />

        <div className="flex items-center justify-between pb-4">
          <AdvancedSearchBar
            searchQuery={filters.searchQuery}
            onSearch={handleSearch}
            onFilterUpdate={handleFilterUpdate}
            selectedCollaterals={filters.selectedCollaterals}
            selectedLoanAssets={filters.selectedLoanAssets}
            uniqueCollaterals={uniqueCollaterals}
            uniqueLoanAssets={uniqueLoanAssets}
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <MarketFilters
            uniqueCollaterals={uniqueCollaterals}
            uniqueLoanAssets={uniqueLoanAssets}
            loading={loading}
            searchQuery={filters.searchQuery}
          />

          {/* Settings */}
          <div className="mt-4 flex items-center gap-2 lg:mt-0">
            <MarketToolbar
              loading={loading}
              isRefetching={isRefetching}
              onRefresh={handleRefresh}
              onOpenSettings={onSettingsModalOpen}
              showUnwhitelistedMarkets={showUnwhitelistedMarkets}
              setShowUnwhitelistedMarkets={setShowUnwhitelistedMarkets}
            />
          </div>
        </div>
      </div>

      {/* Table Section - can expand beyond container in expanded mode */}
      <div className={settings.tableViewMode === 'expanded' ? 'mt-4 px-[2%]' : 'container px-[4%] mt-4'}>

        {loading ? (
          <div className={settings.tableViewMode === 'expanded' ? 'container px-[4%]' : 'w-full'}>
            <LoadingScreen
              message="Loading Morpho Blue Markets..."
              className="min-h-[300px] w-full"
            />
          </div>
        ) : rawMarkets == null ? (
          <div className="flex justify-center"> No data </div>
        ) : (
          <div className={settings.tableViewMode === 'expanded' ? 'flex justify-center' : 'w-full'}>
            {filteredMarkets.length > 0 ? (
              <MarketsTable
                markets={filteredMarkets}
                titleOnclick={titleOnclick}
                sortColumn={sort.column}
                sortDirection={sort.direction}
                onMarketClick={handleMarketClick}
                staredIds={staredIds}
                starMarket={starMarket}
                unstarMarket={unstarMarket}
                currentPage={currentPage}
                entriesPerPage={entriesPerPage}
                setCurrentPage={setCurrentPage}
                setShowSupplyModal={setShowSupplyModal}
                setSelectedMarket={setSelectedMarket}
                columnVisibility={settings.columnVisibility}
                trustedVaults={userTrustedVaults}
                className={settings.tableViewMode === 'compact' ? 'w-full' : undefined}
                wrapperClassName={settings.tableViewMode === 'compact' ? 'w-full' : undefined}
                tableClassName={settings.tableViewMode === 'compact' ? 'w-full min-w-full' : undefined}
                addBlacklistedMarket={addBlacklistedMarket}
                isBlacklisted={isBlacklisted}
              />
            ) : (
              <EmptyScreen
                message="No markets found with the current filters"
                hint={
                  (filters.selectedCollaterals.length > 0 || filters.selectedLoanAssets.length > 0) &&
                  !settings.includeUnknownTokens
                    ? "Try enabling 'Show Unknown Tokens' in settings, or adjust your current filters."
                    : filters.selectedOracles.length > 0 && !settings.showUnknownOracle
                    ? "Try enabling 'Show Unknown Oracles' in settings, or adjust your oracle filters."
                    : settings.trustedVaultsOnly
                    ? 'Disable the Trusted Vaults filter or update your trusted list in Settings.'
                    : settings.filterEnabled.minSupply || settings.filterEnabled.minBorrow || settings.filterEnabled.minLiquidity
                    ? 'Try disabling USD filters in settings, or adjust your filter thresholds.'
                    : 'Try adjusting your filters or search query to see more results.'
                }
              />
            )}
          </div>
        )}
      </div>
      <TrustedVaultsModal
        isOpen={isTrustedVaultsModalOpen}
        onOpenChange={setIsTrustedVaultsModalOpen}
        userTrustedVaults={userTrustedVaults}
        setUserTrustedVaults={setUserTrustedVaults}
      />
    </>
    );
}
