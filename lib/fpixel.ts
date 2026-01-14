
const env = import.meta.env || {};
export const FB_PIXEL_ID = env.VITE_FACEBOOK_PIXEL_ID;

console.log('Facebook Pixel ID:', FB_PIXEL_ID);

declare global {
  interface Window {
    fbq: any;
  }
}

export const pageview = () => {
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

export const event = (name: string, options = {}) => {
  if (window.fbq) {
    window.fbq('track', name, options);
  }
};

export const trackViewContent = (product: { id: number; name: string; price: number; category: string }) => {
  event('ViewContent', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id.toString()],
    content_type: 'product',
    value: product.price,
    currency: 'UZS',
  });
};

export const trackAddToCart = (product: { id: number; name: string; price: number; category: string }) => {
  event('AddToCart', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id.toString()],
    content_type: 'product',
    value: product.price,
    currency: 'UZS',
  });
};

export const trackPurchase = (orderId: string, value: number, productIds: string[] = [], currency: string = 'UZS') => {
  event('Purchase', {
    order_id: orderId,
    content_ids: productIds,
    content_type: 'product',
    value: value,
    currency: currency,
  });
};
