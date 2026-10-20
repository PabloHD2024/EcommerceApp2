window.ECOMMERCE_CONFIG = window.ECOMMERCE_CONFIG || {
  gatewayUrl: 'http://127.0.0.1:3000',
};

window.gatewayFetch = function gatewayFetch(input, options) {
  const requestUrl = input instanceof Request ? input.url : String(input);
  const gatewayUrl = window.ECOMMERCE_CONFIG.gatewayUrl.replace(/\/+$/, '');
  const target = requestUrl.startsWith('/api/')
    ? `${gatewayUrl}${requestUrl}`
    : requestUrl;
  return window.fetch(target, options);
};
