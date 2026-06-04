import { test, expect, Page } from '@playwright/test';

const API_URL = 'http://localhost:5084/api/v1';

const TEST_USER = {
  email: 'test@taphoa.com',
  password: 'Test1234',
  fullName: 'Nguyễn Văn Test',
  role: 'Customer',
};

const MOCK_PRODUCTS = {
  items: [
    {
      id: 'p1',
      name: 'Rau muống',
      price: 15000,
      discountPrice: null,
      stock: 50,
      thumbnailUrl: 'https://picsum.photos/400',
      images: [],
      categoryId: 'c1',
      categoryName: 'Rau củ',
      description: 'Rau muống tươi',
      rating: 4.5,
      reviewCount: 10,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'p2',
      name: 'Thịt heo',
      price: 80000,
      discountPrice: 65000,
      stock: 20,
      thumbnailUrl: 'https://picsum.photos/400',
      images: [],
      categoryId: 'c2',
      categoryName: 'Thịt',
      description: 'Thịt heo tươi',
      rating: 4.2,
      reviewCount: 8,
      createdAt: new Date().toISOString(),
    },
  ],
  totalCount: 2,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

const MOCK_ADDRESSES = [
  {
    id: 'a1',
    receiverName: 'Nguyễn Văn Test',
    phoneNumber: '0912345678',
    streetAddress: '123 Nguyễn Huệ',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    province: 'TP. Hồ Chí Minh',
    isDefault: true,
  },
];

const MOCK_HUBS = [
  {
    id: 'h1',
    name: 'Hub Quận 1',
    address: '456 Lê Lợi',
    ward: 'Phường Bến Thành',
    district: 'Quận 1',
    province: 'TP. Hồ Chí Minh',
    phoneNumber: '0281234567',
    isActive: true,
  },
];

async function mockApi(page: Page) {
  await page.route(`${API_URL}/auth/login`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          accessToken: 'mock-token-123',
          email: TEST_USER.email,
          fullName: TEST_USER.fullName,
          role: TEST_USER.role,
        },
      }),
    });
  });

  await page.route(`${API_URL}/categories`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { id: 'c1', name: 'Rau củ', imageUrl: null, parentId: null },
          { id: 'c2', name: 'Thịt', imageUrl: null, parentId: null },
        ],
      }),
    });
  });

  await page.route(`${API_URL}/products*`, async route => {
    const url = route.request().url();
    if (url.includes('reviews')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_PRODUCTS }),
    });
  });

  await page.route(`${API_URL}/products/p1`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: MOCK_PRODUCTS.items[0],
      }),
    });
  });

  await page.route(`${API_URL}/cart`, async route => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [
              {
                productId: 'p1',
                productName: 'Rau muống',
                thumbnailUrl: 'https://picsum.photos/400',
                unitPrice: 15000,
                quantity: 2,
                subtotal: 30000,
                stock: 50,
              },
            ],
            totalAmount: 30000,
            totalItems: 1,
          },
        }),
      });
    } else if (method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [
              {
                productId: 'p1',
                productName: 'Rau muống',
                thumbnailUrl: 'https://picsum.photos/400',
                unitPrice: 15000,
                quantity: 2,
                subtotal: 30000,
                stock: 50,
              },
            ],
            totalAmount: 30000,
            totalItems: 1,
          },
        }),
      });
    } else {
      await route.fulfill({ status: 200, body: '{}' });
    }
  });

  await page.route(`${API_URL}/addresses`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_ADDRESSES }),
    });
  });

  await page.route(`${API_URL}/hubs*`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_HUBS }),
    });
  });

  await page.route(`${API_URL}/wallet/me*`, async route => {
    const url = route.request().url();
    if (url.includes('balance')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { balance: 100000 } }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { balance: 100000, recentTransactions: [] } }),
    });
  });

  await page.route(`${API_URL}/flash-sale/current`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null }),
    });
  });

  await page.route(`${API_URL}/orders*`, async route => {
    const method = route.request().method();
    if (method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'order-123',
            status: 'PendingPayment',
            totalAmount: 30000,
            items: [{ productId: 'p1', productName: 'Rau muống', quantity: 2, subtotal: 30000 }],
            hub: MOCK_HUBS[0],
            createdAt: new Date().toISOString(),
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [],
            totalCount: 0,
            page: 1,
            pageSize: 10,
            totalPages: 0,
          },
        }),
      });
    }
  });

  await page.route(`${API_URL}/users/me`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          email: TEST_USER.email,
          fullName: TEST_USER.fullName,
          role: TEST_USER.role,
        },
      }),
    });
  });

  await page.route(`${API_URL}/articles`, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });
}

test.describe('E2E: Login → Browse → Add to Cart → Checkout', () => {
  test('complete purchase flow', async ({ page }) => {
    await mockApi(page);

    // ── Step 1: Login ──
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to home page
    await page.waitForURL('**/');
    await expect(page.locator('text=TapHoa')).toBeVisible();

    // ── Step 2: Browse products ──
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Verify products are displayed
    await expect(page.locator('text=Rau muống').first()).toBeVisible();
    await expect(page.locator('text=Thịt heo').first()).toBeVisible();

    // ── Step 3: Add product to cart ──
    const addToCartBtn = page.locator('button:has-text("Thêm vào giỏ")').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
    }

    // Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Verify cart has items
    await expect(page.locator('text=Rau muống')).toBeVisible();

    // ── Step 4: Go to checkout ──
    await page.click('text=Đặt hàng');
    await page.waitForURL('**/checkout');
    await page.waitForLoadState('networkidle');

    // Verify checkout page loads
    await expect(page.locator('text=Xác nhận đơn hàng')).toBeVisible();

    // ── Step 5: Place order ──
    await page.click('button:has-text("Đặt hàng")');

    // Wait for redirect to order detail
    await page.waitForURL('**/order/**');
    await page.waitForLoadState('networkidle');

    // Verify order was created
    await expect(page.locator('text=Chi tiết đơn hàng')).toBeVisible();
  });
});
