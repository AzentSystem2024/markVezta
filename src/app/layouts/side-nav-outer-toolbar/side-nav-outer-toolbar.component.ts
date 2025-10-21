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
import { SideNavigationMenuModule, AppHeaderModule, AppFooterModule } from '../../components';

import { Subscription } from 'rxjs';
import { DxSortableModule, DxSortableTypes } from 'devextreme-angular/ui/sortable';
import { DxTabPanelModule } from 'devextreme-angular';

@Component({
  selector: 'app-side-nav-outer-toolbar',
  templateUrl: './side-nav-outer-toolbar.component.html',
  styleUrls: ['./side-nav-outer-toolbar.component.scss'],
})
export class SideNavOuterToolbarComponent implements OnInit, OnDestroy {
  @ViewChild(DxScrollViewComponent, { static: true }) scrollView!: DxScrollViewComponent;

  @Input()
  title!: string;

  selectedRoute = '';

  menuOpened!: boolean;

  temporaryMenuOpened = false;

  menuMode: DxDrawerTypes.OpenedStateMode = 'shrink';

  menuRevealMode: DxDrawerTypes.RevealMode = 'expand';

  minMenuSize = 0;

  shaderEnabled = false;

  routerSubscription: Subscription;

  screenSubscription: Subscription;

  tabs: any[] = [];
  selectedIndex = 0;

  constructor(private screen: ScreenService, private router: Router, public appInfo: AppInfoService,private cdr: ChangeDetectorRef,
    // private inactiveservice: InactivityService,
    private dataService: DataService) {
    this.routerSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.selectedRoute = event.urlAfterRedirects.split('?')[0];
      }
    });
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

    this.screenSubscription = this.screen.changed.subscribe(() => this.updateDrawer());

    this.updateDrawer();
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.screenSubscription.unsubscribe();
  }

  updateDrawer() {
    const isXSmall = this.screen.sizes['screen-x-small'];
    const isLarge = this.screen.sizes['screen-large'];

    this.menuMode = isLarge ? 'shrink' : 'overlap';
    this.menuRevealMode = isXSmall ? 'slide' : 'expand';
    this.minMenuSize = isXSmall ? 0 : 48;
    this.shaderEnabled = !isLarge;
  }

  get hideMenuAfterNavigation() {
    return this.menuMode === 'overlap' || this.temporaryMenuOpened;
  }

  get showMenuAfterClick() {
    return !this.menuOpened;
  }

  // navigationChanged(event: DxTreeViewTypes.ItemClickEvent) {
  //   const path = (event.itemData as any).path;
  //   const pointerEvent = event.event;

  //   if (path && this.menuOpened) {
  //     if (event.node?.selected) {
  //       pointerEvent?.preventDefault();
  //     } else {
  //       this.router.navigate([path]);
  //     }

  //     if (this.hideMenuAfterNavigation) {
  //       this.temporaryMenuOpened = false;
  //       this.menuOpened = false;
  //       pointerEvent?.stopPropagation();
  //     }
  //   } else {
  //     pointerEvent?.preventDefault();
  //   }
  // }

  navigationChanged(event: DxTreeViewTypes.ItemClickEvent) {
    console.log('Menu clicked:', event);
  
    const path = (event.itemData as any).path;
    const title = (event.itemData as any).text;
  
    const pointerEvent = event.event;
  
    if (path) {
      const tabExists = this.tabs.some((tab) => tab.path === path);
      console.log('Tab exists?', tabExists);
  
      if (!tabExists) {
        this.tabs.push({ title, path });
        console.log('Tab added:', { title, path });
      }
  
      this.selectedIndex = this.tabs.findIndex((tab) => tab.path === path);
      console.log('Selected index:', this.selectedIndex);
  
      this.router.navigate([path]);
      if (this.menuOpened) {
        pointerEvent?.preventDefault();
      }
      if (this.hideMenuAfterNavigation) {
        this.menuOpened = false;
        pointerEvent?.stopPropagation();
      }
  
      this.cdr.detectChanges();
    } else {
      pointerEvent?.preventDefault();
    }

      if (this.showMenuAfterClick) {
    this.temporaryMenuOpened = true;
  }

  const previousState = this.menuOpened;
  this.menuOpened = !this.menuOpened;

  if (previousState !== this.menuOpened) {
    this.cdr.detectChanges();
  }
  }
  





onTabChanged(index: number) {
  this.selectedIndex = index;
  const selectedTab = this.tabs[index];
  if (selectedTab) {
    this.router.navigate([selectedTab.path]);
  }
}


navigationClick() {
  if (this.showMenuAfterClick) {
    this.temporaryMenuOpened = true;
  }

  const previousState = this.menuOpened;
  this.menuOpened = !this.menuOpened;

  if (previousState !== this.menuOpened) {
    this.cdr.detectChanges();
  }
}



// navigationClick() {
//   // this.menuOpened = !this.menuOpened;
//   if (this.showMenuAfterClick) {
//     this.temporaryMenuOpened = true;
//     this.menuOpened = true;
//   }
// }

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

  onTabDrop(event) {}

  showCloseButton() {
    return true;
  }

  closeButtonHandler(tab: any) {
    const index = this.tabs.indexOf(tab);
    if (index > -1) {
      this.tabs.splice(index, 1);
     
      if (this.selectedIndex >= this.tabs.length) {
        this.selectedIndex = this.tabs.length - 1;
      }
    }
    if (this.selectedIndex >= 0) {
      const selectedTab = this.tabs[this.selectedIndex];
      let path = selectedTab.path;
      this.router.navigate([path]);
    } else {
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
    DxSortableModule
  ],
  exports: [SideNavOuterToolbarComponent],
  declarations: [SideNavOuterToolbarComponent],
})
export class SideNavOuterToolbarModule { }