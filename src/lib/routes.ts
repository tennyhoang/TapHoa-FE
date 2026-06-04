export const ROUTES = {
  home: '/',
  products: '/products',
  product: (id: string) => `/products/${id}`,
  cart: '/cart',
  checkout: '/checkout',
  checkoutSuccess: (orderId: string, payment: string) =>
    `/checkout/success?orderId=${orderId}&payment=${payment}`,
  flashSale: '/flash-sale',
  camNang: '/cam-nang',
  article: (id: string) => `/cam-nang/${id}`,
  gioisThieu: '/gioi-thieu',
  lienHe: '/lien-he',

  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },

  profile: {
    root: '/profile',
    orders: '/profile/orders',
    order: (id: string) => `/profile/orders/${id}`,
    addresses: '/profile/addresses',
  },

  admin: {
    root: '/admin',
    products: '/admin/products',
    categories: '/admin/categories',
    orders: '/admin/orders',
    users: '/admin/users',
    flashSale: '/admin/flash-sale',
    camNang: '/admin/cam-nang',
    wallet: '/admin/wallet',
    warehouses: '/admin/warehouses',
  },

  agent: '/agent',
  driver: '/driver',
} as const;
