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

  buildMenuTree(menus: any[], parentKey: string = ''): any[] {
    return menus
      .filter((menu) => menu.Selected)
      .map((menu, index) => {
        const uniqueKey = `${parentKey}${menu.MenuID}-${index}`;

        // IMPORTANT: only REAL routes are leaves
        const isLeaf =
          menu.Path !== null &&
          menu.Path !== undefined &&
          menu.Path !== '' &&
          menu.Path !== '#';

        const node: any = {
          id: uniqueKey, // ✅ unique across tree
          text: menu.MenuName,
          path: isLeaf ? menu.Path : null, //NEVER '#'
          selectable: isLeaf, //parents NOT selectable
          expanded: false,
        };

        if (menu.Children && menu.Children.length > 0) {
          node.items = this.buildMenuTree(menu.Children, uniqueKey + '-');
        }

        return node;
      });
  }

  // buildMenuTree(menus: any[]): any[] {
  //   return menus
  //     .filter((menu) => menu.Selected)
  //     .map((menu) => {
  //       const node: any = {
  //         text: menu.MenuName,
  //         path: menu.Path || '',
  //       };

  //       if (menu.Children && menu.Children.length > 0) {
  //         node.items = this.buildMenuTree(menu.Children); // s recursion
  //       }

  //       return node;
  //     });
  // }

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

    if (!node) return;

    setTimeout(() => {
      // select leaf
      this.menu.instance.selectItem(node);

      // find parent group
      const parent = this.internalItems.find((g) =>
        g.items?.some((i) => i.path === path),
      );

      if (parent) {
        //  expand correct group
        this.menu.instance.expandItem(parent);

        // collapse all others
        this.internalItems.forEach((group) => {
          if (group !== parent) {
            this.menu.instance.collapseItem(group);
          }
        });
      }
    }, 0);
  }

  // refreshMenu() {
  //   // Use static menu for now
  //   this.internalItems = this.staticMenu;
  //   console.log(' Sidebar Items (static):', this.internalItems);
  // }

  refreshMenu() {
    const menuGroups = JSON.parse(
      localStorage.getItem('sideMenuItems') || '[]',
    );

    this.internalItems = [];

    for (const group of menuGroups) {
      if (!group.Menus || group.Menus.length === 0) continue;

      this.internalItems.push({
        text: group.Text,
        icon: group.Icon || 'folder',
        expanded: false,
        items: this.buildMenuTree(group.Menus), //  recursive
      });
    }

    console.log(' Sidebar Tree:', this.internalItems);
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
    e.event?.stopPropagation();

    const item = e.itemData;

    // 🚫 Parent menu → do nothing (DevExtreme will expand)
    if (!item?.path) {
      return;
    }

    // ✅ Leaf menu → navigate
    this.menu.instance.selectItem(item);
    this.router.navigate([item.path]);
    this.selectedItemChanged.emit(e);
  }

  onItemExpanded(e: any) {
    const node = e.node;

    if (!node || !node.parent) return;

    // collapse only siblings under the same parent
    node.parent.children.forEach((sibling: any) => {
      if (sibling !== node) {
        this.menu.instance.collapseItem(sibling.itemData);
      }
    });
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
