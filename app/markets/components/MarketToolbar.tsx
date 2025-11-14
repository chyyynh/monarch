'use client';

import { Tooltip } from '@heroui/react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { CgCompress } from 'react-icons/cg';
import { FiSettings } from 'react-icons/fi';
import { RiExpandHorizontalLine } from 'react-icons/ri';

import { Button } from '@/components/common';
import { SuppliedAssetFilterCompactSwitch } from '@/components/common/SuppliedAssetFilterCompactSwitch';
import { TooltipContent } from '@/components/TooltipContent';
import { useMarketStore } from '@/store/useMarketStore';
import { parseNumericThreshold } from '@/utils/markets';

interface MarketToolbarProps {
  loading: boolean;
  isRefetching: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  showUnwhitelistedMarkets: boolean;
  setShowUnwhitelistedMarkets: (show: boolean) => void;
}

export function MarketToolbar({
  loading,
  isRefetching,
  onRefresh,
  onOpenSettings,
  showUnwhitelistedMarkets,
  setShowUnwhitelistedMarkets,
}: MarketToolbarProps) {
  const { settings, setSetting, setFilterEnabled } = useMarketStore();

  const effectiveMinSupply = parseNumericThreshold(settings.usdFilters.minSupply);
  const effectiveMinBorrow = parseNumericThreshold(settings.usdFilters.minBorrow);
  const effectiveMinLiquidity = parseNumericThreshold(settings.usdFilters.minLiquidity);

  return (
    <div className="flex items-center gap-2">
      <SuppliedAssetFilterCompactSwitch
        includeUnknownTokens={settings.includeUnknownTokens}
        setIncludeUnknownTokens={(value) => setSetting('includeUnknownTokens', value)}
        showUnknownOracle={settings.showUnknownOracle}
        setShowUnknownOracle={(value) => setSetting('showUnknownOracle', value)}
        showUnwhitelistedMarkets={showUnwhitelistedMarkets}
        setShowUnwhitelistedMarkets={setShowUnwhitelistedMarkets}
        trustedVaultsOnly={settings.trustedVaultsOnly}
        setTrustedVaultsOnly={(value) => setSetting('trustedVaultsOnly', value)}
        minSupplyEnabled={settings.filterEnabled.minSupply}
        setMinSupplyEnabled={(value) => setFilterEnabled('minSupply', value)}
        minBorrowEnabled={settings.filterEnabled.minBorrow}
        setMinBorrowEnabled={(value) => setFilterEnabled('minBorrow', value)}
        minLiquidityEnabled={settings.filterEnabled.minLiquidity}
        setMinLiquidityEnabled={(value) => setFilterEnabled('minLiquidity', value)}
        thresholds={{
          minSupply: effectiveMinSupply,
          minBorrow: effectiveMinBorrow,
          minLiquidity: effectiveMinLiquidity,
        }}
        onOpenSettings={onOpenSettings}
      />

      <Tooltip
        classNames={{
          base: 'p-0 m-0 bg-transparent shadow-sm border-none',
          content: 'p-0 m-0 bg-transparent shadow-sm border-none',
        }}
        content={<TooltipContent title="Refresh" detail="Fetch the latest market data" />}
      >
        <Button
          disabled={loading || isRefetching}
          variant="light"
          size="sm"
          className="text-secondary min-w-0 px-2"
          onPress={onRefresh}
          isIconOnly
        >
          <ReloadIcon className={`${isRefetching ? 'animate-spin' : ''} h-3 w-3`} />
        </Button>
      </Tooltip>

      <Tooltip
        classNames={{
          base: 'p-0 m-0 bg-transparent shadow-sm border-none',
          content: 'p-0 m-0 bg-transparent shadow-sm border-none',
        }}
        content={
          <TooltipContent
            icon={
              settings.tableViewMode === 'compact' ? (
                <RiExpandHorizontalLine size={14} />
              ) : (
                <CgCompress size={14} />
              )
            }
            title={settings.tableViewMode === 'compact' ? 'Expand Table' : 'Compact Table'}
            detail={
              settings.tableViewMode === 'compact'
                ? 'Expand table to full width, useful when more columns are enabled.'
                : 'Restore compact table view'
            }
          />
        }
      >
        <Button
          isIconOnly
          aria-label="Toggle table width"
          variant="light"
          size="sm"
          className="text-secondary min-w-0 px-2"
          onPress={() =>
            setSetting('tableViewMode', settings.tableViewMode === 'compact' ? 'expanded' : 'compact')
          }
        >
          {settings.tableViewMode === 'compact' ? (
            <RiExpandHorizontalLine size={16} />
          ) : (
            <CgCompress size={16} />
          )}
        </Button>
      </Tooltip>

      <Tooltip
        classNames={{
          base: 'p-0 m-0 bg-transparent shadow-sm border-none',
          content: 'p-0 m-0 bg-transparent shadow-sm border-none',
        }}
        content={<TooltipContent title="Preferences" detail="Adjust thresholds and columns" />}
      >
        <Button
          isIconOnly
          aria-label="Market Preferences"
          variant="light"
          size="sm"
          className="text-secondary min-w-0 px-2"
          onPress={onOpenSettings}
        >
          <FiSettings size={12} />
        </Button>
      </Tooltip>
    </div>
  );
}
