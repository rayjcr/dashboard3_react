export const featureFlags = {
  disableRefund: true, // 禁止退款功能
  disableCapture: true, // 禁止捕获功能
  disableCancel: true, // 禁止取消功能
  disableDispute: true, // 禁止争议功能

  disableDatabaseWrite: true, // 禁止数据库写入（仅限测试环境）
};

export const isFeatureEnabled = (
  feature: 'refund' | 'capture' | 'dispute' | 'cancel',
) => {
  // 如果总开关禁用，所有功能都禁用
  if (featureFlags.disableDatabaseWrite) {
    return false;
  }

  switch (feature) {
    case 'refund':
      return !featureFlags.disableRefund;
    case 'capture':
      return !featureFlags.disableCapture;
    case 'cancel':
      return !featureFlags.disableCancel;
    case 'dispute':
      return !featureFlags.disableDispute;
    default:
      return true; // 默认启用
  }
};

/**
 * 检查是否允许数据库写入操作
 */
export const canWrite = () => !featureFlags.disableDatabaseWrite;
