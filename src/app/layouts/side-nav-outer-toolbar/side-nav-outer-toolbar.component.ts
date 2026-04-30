import {
  Component,
  OnInit,
  OnDestroy,
  NgModule,
  Input,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { DxTreeViewTypes } from 'devextreme-angular/ui/tree-view';
import { DxDrawerModule, DxDrawerTypes } from 'devextreme-angular/ui/drawer';
import { DxScrollViewComponent } from 'devextreme-angular/ui/scroll-view';
import { CommonModule } from '@angular/common';

import { Router, RouterModule, NavigationEnd, Event } from '@angular/router';
import { ScreenService, AppInfoService, DataService } from '../../services';
import {
  SideNavigationMenuModule,
  AppHeaderModule,
  AppFooterModule,
  SideNavigationMenuComponent,
} from '../../components';

import { Subscription } from 'rxjs';
import {
  DxSortableModule,
  DxSortableTypes,
} from 'devextreme-angular/ui/sortable';
import { DxTabPanelModule } from 'devextreme-angular';
import { CustomReuseStrategy } from 'src/app/custome-reuse-strategy';
import { RouteReuseStrategy } from '@angular/router';
import { InactivityService } from 'src/app/services/inactivity.service';

@Component({
  selector: 'app-side-nav-outer-toolbar',
  templateUrl: './side-nav-outer-toolbar.component.html',
  styleUrls: ['./side-nav-outer-toolbar.component.scss'],
  providers: [DataService],
})
export class SideNavOuterToolbarComponent implements OnInit, OnDestroy {
  @ViewChild(DxScrollViewComponent, { static: true })
  scrollView!: DxScrollViewComponent;

  @ViewChild(SideNavigationMenuComponent)
  sideMenu!: SideNavigationMenuComponent;

  @Input()
  title!: string;

  selectedRoute = '';

  private lastScrollTop = 0;

  menuOpened!: boolean;

  temporaryMenuOpened = false;

  menuMode: DxDrawerTypes.OpenedStateMode = 'shrink';

  menuRevealMode: DxDrawerTypes.RevealMode = 'expand';

  minMenuSize = 48;

  shaderEnabled = false;

  routerSubscription: Subscription;

  screenSubscription: Subscription | undefined;

  tabs: any[] = [];
  selectedIndex = 0;

  constructor(
    private screen: ScreenService,
    private router: Router,
    public appInfo: AppInfoService,
    private cdr: ChangeDetectorRef,
    private inactiveservice: InactivityService,
    private reuseStrategy: RouteReuseStrategy,

    private dataService: DataService,
  ) {
    this.routerSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.selectedRoute = event.urlAfterRedirects.split('?')[0];
      }
    });
    inactiveservice.startTheInactiveService();
  }

  ngOnInit() {
    let path = 'analytics-dashboard';
    let title = 'Home';
    this.tabs.push({
      title: title,
      path: path,
    });
    this.selectedIndex = this.tabs.findIndex((tab) => tab.path === path);
    this.router.navigate([path]);

    this.menuOpened = this.screen.sizes['screen-large'];

    this.screenSubscription = this.screen.changed.subscribe(() =>
      this.updateDrawer(),
    );

    this.updateDrawer();
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.screenSubscription?.unsubscribe();
  }

  updateDrawer() {
    const isXSmall = this.screen.sizes['screen-x-small'];
    const isLarge = this.screen.sizes['screen-large'];
    this.menuMode = isLarge ? 'shrink' : 'overlap';
    this.menuRevealMode = isXSmall ? 'slide' : 'expand';
    // this.minMenuSize = isXSmall ? 0 : 48;
    this.shaderEnabled = !isLarge;
  }

  get hideMenuAfterNavigation() {
    return this.menuMode === 'overlap' || this.temporaryMenuOpened;
  }

  navigationChanged(event: DxTreeViewTypes.ItemClickEvent) {
    const path = (event.itemData as any)?.path;
    const title = (event.itemData as any)?.text;

    if (!path) return;

    const tabExists = this.tabs.some((tab) => tab.path === path);
    if (!tabExists) {
      this.tabs.push({ title, path });
    }

    this.selectedIndex = this.tabs.findIndex((tab) => tab.path === path);
    this.router.navigate([path]);

    // IMPORTANT FIX
    this.temporaryMenuOpened = false;

    // close ONLY on mobile overlap
    if (this.menuMode === 'overlap') {
      this.menuOpened = false;
    }

    this.cdr.detectChanges();
  }

  onTabChanged(index: number) {
    this.selectedIndex = index;
    const selectedTab = this.tabs[index];
    if (selectedTab) {
      this.router.navigate([selectedTab.path]);

      // FORCE SIDEBAR SELECTION
      this.sideMenu.selectByPath(selectedTab.path);
    }
  }

  navigationClick() {
    this.menuOpened = !this.menuOpened;

    // reset temporary state safely
    this.temporaryMenuOpened = false;

    this.cdr.detectChanges();
  }

  TabItemClick(tab: any) {
    const path = tab.path;
    this.selectedIndex = this.tabs.findIndex((tab) => tab.path === path);
    this.router.navigate([path]);
  }

  disableButton() {
    return false;
  }

  onTabDragStart(e: DxSortableTypes.DragStartEvent) {
    e.itemData = e.fromData[e.fromIndex];
  }

  onTabDrop(event:any) {}

  showCloseButton() {
    return true;
  }

  closeButtonHandler(tab: any) {
    // Prevent closing "analytics-dashboard"
    if (tab.path === 'analytics-dashboard') {
      return;
    }

    // Prevent closing last remaining tab
    if (this.tabs.length === 1) {
      return;
    }
    const index = this.tabs.indexOf(tab);
    if (index === -1) return;
    const isCurrent = this.router.url.replace(/^\/+/, '') === tab.path;
    // remove tab first from UI list
    this.tabs.splice(index, 1);

    // select last tab
    this.selectedIndex = this.tabs.length - 1;
    const nextPath = this.tabs[this.selectedIndex].path;

    if (isCurrent) {
      // navigate to real remaining tab (forces detach/store)
      this.router.navigate([nextPath]).then(() => {
        (this.reuseStrategy as CustomReuseStrategy).removeStoredComponent(
          tab.path,
        );
      });
    } else {
      (this.reuseStrategy as CustomReuseStrategy).removeStoredComponent(
        tab.path,
      );
    }
  }

 
}

@NgModule({
  imports: [
    RouterModule,
    SideNavigationMenuModule,
    DxDrawerModule,
    AppHeaderModule,
    CommonModule,
    AppFooterModule,
    DxTabPanelModule,
    DxSortableModule,
  ],
  exports: [SideNavOuterToolbarComponent],
  declarations: [SideNavOuterToolbarComponent],
})
export class SideNavOuterToolbarModule {}
