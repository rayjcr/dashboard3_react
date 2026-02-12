import { env } from './env';

/**
 * User menu item configuration
 */
export interface UserMenuItem {
  /**
   * Unique key for the menu item
   */
  key: string;
  /**
   * Display label
   */
  label: string;
  /**
   * Ant Design icon name
   */
  icon: string;
  /**
   * Internal route path (for navigation)
   */
  path?: string;
  /**
   * External link URL
   */
  href?: string;
  /**
   * Link target (_blank for new window)
   */
  target?: '_blank' | '_self';
  /**
   * Special action type
   */
  action?: 'logout';
}

/**
 * Static user menu items configuration
 */
export const USER_MENU_ITEMS: UserMenuItem[] = [
  {
    key: 'alltransactions',
    label: 'All Transactions Search',
    icon: 'SearchOutlined',
    path: '/alltransactions',
  },
  {
    key: 'accountsettings',
    label: 'Account Settings',
    icon: 'SettingOutlined',
    path: '/accountsettings',
  },
  /** Remove this function **/
  // {
  //   key: 'fraudengine',
  //   label: 'Fraud Engine',
  //   icon: 'SafetyOutlined',
  //   path: '/fraudengine',
  // },
  {
    key: 'helpdesk',
    label: 'Citcon Help Desk',
    icon: 'QuestionCircleOutlined',
    href: env.helpDeskUrl,
    target: '_blank',
  },
  {
    key: 'logout',
    label: 'Logout',
    icon: 'LogoutOutlined',
    action: 'logout',
  },
];
