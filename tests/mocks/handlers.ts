import { http, HttpResponse } from 'msw';

const API_BASE = '/api';

/**
 * MSW API handlers for testing
 */
export const handlers = [
  // Login API
  http.post(`${API_BASE}/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        code: 200,
        message: 'Login successful',
        user_id: '12345',
        user_email: 'test@example.com',
        role: 'merchant',
        session_id: 'session_123456',
        hierarchy: 'H001',
        hierarchyName: 'Test Hierarchy',
        merchant_id: 'M001',
        merchant_name: 'Test Merchant',
        merchants: [{ id: 'M001', name: 'Test Merchant' }],
        child: [],
        adminPermissions: 'full',
        can_refund: 1,
        MFA: false,
        config: '{}',
        settlement_currencys: ['USD', 'CNY'],
        timezone: 'America/Los_Angeles',
        timezone_short: 'PST',
      });
    }

    if (body.email === 'mfa@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        code: 200,
        message: 'MFA required',
        user_id: '12346',
        user_email: 'mfa@example.com',
        session_id: 'session_mfa',
        MFA: true,
      });
    }

    return HttpResponse.json(
      {
        code: 401,
        message: 'Invalid email or password',
      },
      { status: 401 },
    );
  }),

  // MFA Verify
  http.post(`${API_BASE}/mfa/verify`, async ({ request }) => {
    const body = (await request.json()) as { code: string };

    if (body.code === '123456') {
      return HttpResponse.json({
        code: 200,
        message: 'MFA verified',
      });
    }

    return HttpResponse.json(
      {
        code: 400,
        message: 'Invalid MFA code',
      },
      { status: 400 },
    );
  }),

  // Logout API
  http.post(`${API_BASE}/logout`, () => {
    return HttpResponse.json({
      code: 200,
      message: 'Logout successful',
    });
  }),

  // Summary API
  http.get(`${API_BASE}/summary`, () => {
    return HttpResponse.json({
      code: 200,
      data: {
        daily_summary: [
          {
            settle_date: '2024-01-15',
            sales_count: 100,
            sales_amount: '10000.00',
            refund_count: 5,
            refund_amount: '500.00',
            fee: '100.00',
            net_amount: '9400.00',
            status: 'Settled',
          },
        ],
        monthly_summary: [
          {
            month: '202401',
            sales_count: 3000,
            sales_amount: '300000.00',
            refund_count: 150,
            refund_amount: '15000.00',
            fee: '3000.00',
            net_amount: '282000.00',
          },
        ],
        isMultiCurrency: false,
        isElavonSite: false,
        hasElavonChild: false,
        hierarchy_user_data: {
          merchant_id: 'M001',
          merchant_name: 'Test Merchant',
        },
      },
    });
  }),

  // Transaction Lookup API
  http.post(`${API_BASE}/transaction/lookup`, async ({ request }) => {
    const body = (await request.json()) as {
      start_date: string;
      end_date: string;
      keyword?: string;
      page?: number;
      page_size?: number;
    };

    return HttpResponse.json({
      code: 200,
      data: {
        total: 100,
        page: body.page || 1,
        page_size: body.page_size || 20,
        list: [
          {
            id: 'TXN001',
            reference: 'REF001',
            transaction_type: 'charge',
            tranx_status: 'success',
            payment_method: 'card',
            payment_gateway: 'stripe',
            amount: '100.00',
            currency: 'USD',
            created_at: '2024-01-15 10:30:00',
            remaining_balance: '100.00',
            amount_captured: '100.00',
            amount_refunded: '0.00',
          },
          {
            id: 'TXN002',
            reference: 'REF002',
            transaction_type: 'charge',
            tranx_status: 'authorized',
            payment_method: 'card',
            payment_gateway: 'stripe',
            amount: '200.00',
            currency: 'USD',
            created_at: '2024-01-15 11:00:00',
            amount_authorized_remaining: '200.00',
            amount_captured: '0.00',
          },
        ],
      },
    });
  }),

  // Refund API
  http.post(`${API_BASE}/transaction/refund`, async ({ request }) => {
    const body = (await request.json()) as {
      transaction_id: string;
      amount: string;
    };

    if (parseFloat(body.amount) > 0) {
      return HttpResponse.json({
        code: 200,
        message: 'Refund successful',
        data: {
          refund_id: 'REFUND001',
          status: 'success',
        },
      });
    }

    return HttpResponse.json(
      {
        code: 400,
        message: 'Invalid refund amount',
      },
      { status: 400 },
    );
  }),

  // Capture API
  http.post(`${API_BASE}/transaction/capture`, async ({ request }) => {
    const body = (await request.json()) as { transaction_id: string };

    if (body.transaction_id) {
      return HttpResponse.json({
        code: 200,
        message: 'Capture successful',
        data: {
          status: 'success',
        },
      });
    }

    return HttpResponse.json(
      {
        code: 400,
        message: 'Capture failed',
      },
      { status: 400 },
    );
  }),

  // Cancel API
  http.post(`${API_BASE}/transaction/cancel`, async ({ request }) => {
    const body = (await request.json()) as { transaction_id: string };

    if (body.transaction_id) {
      return HttpResponse.json({
        code: 200,
        message: 'Cancel successful',
        data: {
          status: 'cancelled',
        },
      });
    }

    return HttpResponse.json(
      {
        code: 400,
        message: 'Cancel failed',
      },
      { status: 400 },
    );
  }),
];
