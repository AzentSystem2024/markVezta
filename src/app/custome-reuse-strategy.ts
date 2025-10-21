import {
  RouteReuseStrategy,
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
} from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
  handlers: { [key: string]: DetachedRouteHandle } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.handlers[route.routeConfig?.path || ''] = handle;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!this.handlers[route.routeConfig?.path || ''];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.handlers[route.routeConfig?.path || ''] || null;
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  removeStoredComponent(routePath: string): void {
    // // Resolve the exact key matching the routePath
    // const handlerKey = Object.keys(this.handlers).find(
    //   (key) => key === routePath
    // );
    // if (handlerKey) {
    //   delete this.handlers[handlerKey];
    //   console.log(Component with route path "${handlerKey}" removed.);
    // } else {
    //   console.log(No component found with route path "${routePath}".);
    // }
    // console.log('Available components after removal:', this.handlers);
  }

  // Method to clear stored data on logout
  clearStoredData(): void {
    this.handlers = {};
  }
}
