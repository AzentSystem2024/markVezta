import {
  Component,
  NgModule,
  Output,
  Input,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import {
  DxTreeViewModule,
  DxTreeViewComponent,
  DxTreeViewTypes,
} from 'devextreme-angular/ui/tree-view';
import * as events from 'devextreme/events';
import { AuthService } from 'src/app/services/auth.service'; // Replace with your API service
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import { OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'side-navigation-menu',
  templateUrl: './side-navigation-menu.component.html',
  styleUrls: ['./side-navigation-menu.component.scss'],
})
export class SideNavigationMenuComponent implements AfterViewInit, OnDestroy {
  @ViewChild(DxTreeViewComponent, { static: true })
  menu!: DxTreeViewComponent;

  @Output() selectedItemChanged =
    new EventEmitter<DxTreeViewTypes.ItemClickEvent>();
  @Output() openMenu = new EventEmitter<any>();

  @Input() compactMode = false;
  @Input() selectedItem!: string;

  private _items!: Record<string, unknown>[];
  internalItems: any[];
  selectedKeys: string[] = [];

  get items() {
    return this._items;
  }

  constructor(
    private authService: AuthService,
    private elementRef: ElementRef,
    private service: DataService,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.refreshMenu();
  }

  public selectByPath(path: string) {
    const find = (items: any[]): any => {
      for (const item of items) {
        if (item.path === path) return item;
        if (item.items) {
          const found = find(item.items);
          if (found) return found;
        }
      }
      return null;
    };

    const node = find(this.internalItems);

    if (node) {
      setTimeout(() => {
        this.menu.instance.selectItem(node);
        this.menu.instance.expandItem(node);
      }, 0);
    }
  }

  // refreshMenu() {
  //   // Use static menu for now
  //   this.internalItems = this.staticMenu;
  //   console.log('✅ Sidebar Items (static):', this.internalItems);
  // }

  refreshMenu() {
    const menuGroups = JSON.parse(
      localStorage.getItem('sideMenuItems') || '[]',
    );

    this.internalItems = [];

    for (const group of menuGroups) {
      const menus = group.Menus || [];

      if (menus.length === 0) continue; // Skip empty groups

      // Remove duplicate menus based on MenuID (in case of repeated Timesheet)
      const uniqueMenus = Array.from(
        new Map(menus.map((item) => [item.MenuID, item])).values(),
      );

      const children = uniqueMenus
        .filter((menu: any) => menu.Selected)
        .map((submenu: any) => ({
          text: submenu.MenuName,
          path: submenu.Path || this.getRouteForMenu(submenu.MenuName),
        }));

      this.internalItems.push({
        text: group.Text || 'Main',
        icon: group.Icon || this.getIconForMainMenu(group.Text),
        path: '',
        items: children,
      });
    }

    console.log('✅ Sidebar Items:', this.internalItems);
  }

  getIconForMainMenu(menu: string): string {
    switch (menu.toLowerCase()) {
      case 'Accounts':
        return 'money';
      case 'HR':
        return 'fa fa-file-alt';
      default:
        return 'folder';
    }
  }

  getRouteForMenu(menuName: string): string {
    switch (menuName) {
      case 'Dashboard':
        return '/analytics-dashboard';
      case 'User Level':
        return '/user-role';
      case 'User':
        return '/user';
      case 'Chart Of Accounts':
        return '/accounts';
      case 'Journal Voucher':
        return '/journal-voucher';
      case 'Credit Note':
        return '/credit-note';
      case 'Debit Note':
        return '/debit';
      case 'Invoice':
        return '/invoice';

      case 'Company':
        return '/company';
      case 'Category':
        return '/Category';
      case 'Article Stock View':
        return '/article-stock-view';
      case 'Cartoon Stock View':
        return '/carton-stock-view';
      case 'Transfer in View':
        return '/Transfer-in-view';
      case 'Article Production View':
        return '/article-production-view';
      case 'Pack Production View':
        return '/pack-production-view';
      case 'Stock Movement View':
        return '/stock-movement-view';
      case 'Transfer Out View':
        return '/transfer-out-view';
      case 'Trial Balance':
        return '/trial-balance-report';
      case 'Journal Book':
        return '/journal-book';

      default:
        return '';
    }
  }

  setSelectedItem() {
    if (!this.menu.instance) {
      return;
    }
    this.menu.instance.selectItem(this.selectedItem);
  }

  // async onItemClick(event: DxTreeViewTypes.ItemClickEvent) {
  //   const selectedItem = event.itemData;
  //   console.log(selectedItem, 'selecteditem');

  //   // Extract userLevel and componentName
  //   const componentName = selectedItem.path;
  //   const userLevelId = sessionStorage.getItem('UserLevelId');

  //   if (userLevelId && componentName) {
  //     try {
  //       // Make API call
  //       this.service
  //         .getUserRightList(userLevelId, componentName)
  //         .subscribe((res: any) => {
  //           const response = res.UserRight;
  //           console.log(response, 'response');
  //           // Save response in session
  //           sessionStorage.setItem(
  //             'menuUserRightsResponse',
  //             JSON.stringify(response)
  //           );
  //         });

  //       // Emit the event for further handling (optional)
  //       this.selectedItemChanged.emit(event);
  //     } catch (error) {
  //       console.error('Error calling menu interaction API:', error);
  //     }
  //   }
  // }

  onItemClick(e: any) {
    e.event?.stopPropagation(); // prevent sidebar collapse

    const item = e.itemData;

    if (item?.path) {
      this.menu.instance.selectItem(item); // ✅ highlight menu
      this.router.navigate([item.path]); // ✅ routing
    }

    this.selectedItemChanged.emit(e); // ✅ tabs / parent logic
  }

  ngAfterViewInit() {
    this.setSelectedItem();
    events.on(this.elementRef.nativeElement, 'dxclick', (e: Event) => {
      this.openMenu.next(e);
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.selectByRoute(event.urlAfterRedirects);
      }
    });
  }

  selectByRoute(route: string) {
    const find = (items: any[]): any => {
      for (const item of items) {
        if (item.path === route) return item;
        if (item.items) {
          const found = find(item.items);
          if (found) return found;
        }
      }
      return null;
    };

    const node = find(this.internalItems);

    if (node) {
      this.menu.instance.selectItem(node); // 🔥 sync sidebar
    }
  }

  ngOnDestroy() {
    events.off(this.elementRef.nativeElement, 'dxclick');
  }
}

@NgModule({
  imports: [DxTreeViewModule],
  declarations: [SideNavigationMenuComponent],
  exports: [SideNavigationMenuComponent],
})
export class SideNavigationMenuModule {}
