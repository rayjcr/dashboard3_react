/**
 * Dashboard utility functions
 */

import type { UserConfig } from '@/types/dashboard';

/**
 * Parse user configuration string
 * @param configString JSON formatted configuration string
 * @returns Parsed user configuration object
 */
export function parseUserConfig(configString: string): UserConfig {
  if (!configString) {
    return {};
  }
  try {
    return JSON.parse(configString) as UserConfig;
  } catch {
    return {};
  }
}

/**
 * Determine if daily report detail is clickable
 * @param config User configuration (parsed from authStore.config)
 * @param hierarchyMerchantId The hierarchy_user_data.merchant_id returned from /summary
 * @returns true means clickable, false means disabled
 */
export function isDailyDetailClickable(
  config: UserConfig,
  hierarchyMerchantId: string | undefined,
): boolean {
  // If detail_daily_report_disable is an empty string, disable
  if (config.detail_daily_report_disable === '') {
    return false;
  }
  // Sub-merchant (has merchant_id) can click, parent node (no merchant_id) cannot click
  if (!hierarchyMerchantId) {
    return false;
  }
  return true;
}

/**
 * Determine if monthly report detail is clickable
 * @param config User configuration (parsed from authStore.config)
 * @param hierarchyMerchantId The hierarchy_user_data.merchant_id returned from /summary
 * @returns true means clickable, false means disabled
 */
export function isMonthlyDetailClickable(
  config: UserConfig,
  hierarchyMerchantId: string | undefined,
): boolean {
  // If detail_monthly_report_disable is an empty string, disable
  if (config.detail_monthly_report_disable === '') {
    return false;
  }
  // Sub-merchant (has merchant_id) can click, parent node (no merchant_id) cannot click
  if (!hierarchyMerchantId) {
    return false;
  }
  return true;
}

/**
 * Get status display text
 * @param status Original status
 * @param settleDate Settlement date
 * @param umfEnabled Whether UMF is enabled
 * @param hasJkoPay Whether has JkoPay
 * @param isElavonSite Whether is Elavon site
 * @returns Display status text
 */
export function getStatusDisplay(
  status: string,
  settleDate: string,
  umfEnabled: boolean,
  hasJkoPay: boolean,
  isElavonSite: boolean,
): string {
  if (umfEnabled || hasJkoPay || isElavonSite) {
    return `Cleared ${settleDate}`;
  }
  return status;
}

/**
 * Get current date string (format: YYYY-MM-DD)
 * @returns Current date string
 */
export function getCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current month string (format: YYYYMM)
 * @returns Current month string
 */
export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

/**
 * Merchant ID list that has Payout column
 */
export const MERCHANT_IDS_HAVE_PAYOUT: string[] = [
  '634201701345000',
  '634201705214000',
  '634201705215000',
  '634201705211000',
  '634201702097000',
  '634201702096000',
  '634201702095000',
  '634201700184000',
  '634201700397000',
  '634201700395000',
  '634201700183000',
  '634201700112000',
  // added 3/5 MDB-153
  '634201701641000',
  '634201701643000',
  '634201701642000',
  '634201701644000',
  '634201702942000',
  // test
  '634201701285000',
  '634201700370000',
];

/**
 * Determine whether to show Payout column
 * @param merchantId Merchant ID
 * @returns true means show Payout column
 */
export function shouldShowPayoutColumn(
  merchantId: string | undefined,
): boolean {
  if (!merchantId) return false;
  return MERCHANT_IDS_HAVE_PAYOUT.includes(merchantId);
}
