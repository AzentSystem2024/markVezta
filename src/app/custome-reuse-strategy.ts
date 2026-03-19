import {
  RouteReuseStrategy,
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
} from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
  handlers: { [key: string]: DetachedRouteHandle } = {};
  destroyedRoutes = new Set<string>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return true; // always detach first
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const key = route.routeConfig?.path || '';

    // skip storing ONLY once after close
    if (this.destroyedRoutes.has(key)) {
      this.destroyedRoutes.delete(key); // 🔥 reset
      return;
    }

    this.handlers[key] = handle;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!this.handlers[route.routeConfig?.path || ''];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.handlers[route.routeConfig?.path || ''] || null;
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot,
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  removeStoredComponent(routePath: string): void {
    const key = routePath.replace(/^\/+/, '');

    delete this.handlers[key];
    this.destroyedRoutes.add(key);
  }
  clearStoredData(): void {
    this.handlers = {};
    this.destroyedRoutes.clear();
  }
}
