interface Window {
  ajaxurl: string;
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
