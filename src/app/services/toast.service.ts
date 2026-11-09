import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Toast from 'devextreme/ui/toast';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastInfo {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  time: string;
  headerClass: string;
  icon: string;
  borderClass: string;
}

export interface ToastOptions {
  message?: string;
  type?: ToastType | string;
  title?: string;
  displayTime?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private static instance: ToastService | null = null;
  public static pendingQueue: { messageOrOptions: any; type?: any }[] = [];

  private toastsSubject = new BehaviorSubject<ToastInfo[]>([]);
  public toasts$: Observable<ToastInfo[]> = this.toastsSubject.asObservable();
  public toasts: ToastInfo[] = [];

  constructor(private ngZone: NgZone) {
    ToastService.instance = this;

    // Flush any toasts queued before DI finished initializing
    if (ToastService.pendingQueue.length > 0) {
      const queue = [...ToastService.pendingQueue];
      ToastService.pendingQueue = [];
      queue.forEach((item) => this.show(item.messageOrOptions, item.type));
    }
  }

  public static getInstance(): ToastService | null {
    return ToastService.instance;
  }

  public show(
    messageOrOptions: any,
    typeParam?: string,
    _displayTime?: number,
  ): string {
    let message = '';
    let type: ToastType = 'info';
    let customTitle = '';

    if (typeof messageOrOptions === 'string') {
      message = messageOrOptions;
      if (typeParam) {
        type = this.normalizeType(typeParam);
      }
    } else if (messageOrOptions && typeof messageOrOptions === 'object') {
      message = messageOrOptions.message || '';
      type = this.normalizeType(
        messageOrOptions.type || typeParam || 'info',
      );
      customTitle = messageOrOptions.title || '';
    }

    if (!message) return '';

    if (!ToastService.instance) {
      ToastService.pendingQueue.push({ messageOrOptions, type });
      return '';
    }

    const id =
      'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const toastMeta = this.getTypeMeta(type, customTitle);

    const newToast: ToastInfo = {
      id,
      title: toastMeta.title,
      message,
      type,
      time,
      headerClass: toastMeta.headerClass,
      icon: toastMeta.icon,
      borderClass: toastMeta.borderClass,
    };

    ToastService.instance.ngZone.run(() => {
      // Kept until user manually closes - no autohide timer
      ToastService.instance!.toasts = [newToast, ...ToastService.instance!.toasts];
      ToastService.instance!.toastsSubject.next(ToastService.instance!.toasts);
    });

    return id;
  }

  public success(message: string, title?: string): string {
    return this.show({ message, title, type: 'success' });
  }

  public error(message: string, title?: string): string {
    return this.show({ message, title, type: 'error' });
  }

  public warning(message: string, title?: string): string {
    return this.show({ message, title, type: 'warning' });
  }

  public info(message: string, title?: string): string {
    return this.show({ message, title, type: 'info' });
  }

  public remove(id: string): void {
    if (!ToastService.instance) return;
    ToastService.instance.ngZone.run(() => {
      ToastService.instance!.toasts = ToastService.instance!.toasts.filter(
        (t) => t.id !== id,
      );
      ToastService.instance!.toastsSubject.next(ToastService.instance!.toasts);
    });
  }

  public clear(): void {
    if (!ToastService.instance) return;
    ToastService.instance.ngZone.run(() => {
      ToastService.instance!.toasts = [];
      ToastService.instance!.toastsSubject.next(ToastService.instance!.toasts);
    });
  }

  private normalizeType(type?: string): ToastType {
    if (!type) return 'info';
    const lower = type.toLowerCase();
    if (lower === 'error' || lower === 'danger') return 'error';
    if (lower === 'success') return 'success';
    if (lower === 'warning') return 'warning';
    return 'info';
  }

  private getTypeMeta(type: ToastType, customTitle?: string) {
    switch (type) {
      case 'error':
        return {
          title: customTitle || 'Error',
          headerClass: '',
          icon: 'bi bi-x-circle-fill',
          borderClass: '',
        };
      case 'success':
        return {
          title: customTitle || 'Success',
          headerClass: '',
          icon: 'bi bi-check-circle-fill',
          borderClass: '',
        };
      case 'warning':
        return {
          title: customTitle || 'Warning',
          headerClass: '',
          icon: 'bi bi-exclamation-triangle-fill',
          borderClass: '',
        };
      case 'info':
      default:
        return {
          title: customTitle || 'Notice',
          headerClass: '',
          icon: 'bi bi-info-circle-fill',
          borderClass: '',
        };
    }
  }
}

// Global helper function usable throughout the project
export function notify(
  messageOrOptions: any,
  type?: any,
  displayTime?: any,
): any {
  if (ToastService.getInstance()) {
    ToastService.getInstance()!.show(messageOrOptions, type, displayTime);
  } else {
    ToastService.pendingQueue.push({ messageOrOptions, type });
  }
}

// Hook DevExtreme Toast.prototype.show so every call to devextreme notify() across all components
// is globally intercepted and rendered as a persistent Bootstrap toast with manual close
try {
  const toastProto = (Toast as any)?.prototype;
  if (toastProto && !toastProto.__bootstrapToastHooked) {
    toastProto.__bootstrapToastHooked = true;
    const originalToastShow = toastProto.show;

    toastProto.show = function () {
      try {
        const options =
          (typeof this.option === 'function' ? this.option() : null) || {};
        const message = options.message || '';
        const type = options.type || 'info';

        if (message) {
          notify(message, type);
        }

        // Clean up the temporary DevExtreme container from DOM
        const el = typeof this.element === 'function' ? this.element() : null;
        if (el) {
          if (typeof el.remove === 'function') {
            el.remove();
          } else if (el[0] && typeof el[0].remove === 'function') {
            el[0].remove();
          } else if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }
      } catch (err) {
        console.error('Error in Bootstrap Toast interceptor:', err);
      }

      return Promise.resolve(this);
    };
  }
} catch (e) {
  console.warn('Could not hook DevExtreme Toast.prototype.show:', e);
}

export default notify;

