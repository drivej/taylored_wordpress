interface Window {
  ajaxurl: string;
  vehicles_ajax: { url: string; nonce: string; action: string; product_id: string };
  vehicles: {
    selectVariation(selectedVariationId: number): void;
  };
  wp: {
    api: {
      collections: any;
      models: any;
      loadPromise: { done(fn: () => void): Promise<unknown> };
    };
    ajax: {
      send(config: { url: string; headers?: Record<string, string> }): Promise<Response>;
    };
  };
}

declare var vehicles: {
  selectVariation(selectedVariationId: number): void;
};
