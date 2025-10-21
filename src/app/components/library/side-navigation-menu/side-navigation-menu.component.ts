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

  get items() {
    return this._items;
  }

  // staticMenu: any[] = [
  //   {
  //     text: 'Home',
  //     icon: 'home',
  //     path: '/analytics-dashboard',
  //   },
  //   {
  //     text: 'Masters',
  //     icon: 'user',
  //     items: [
  //       { text: 'User Level', path: '/user-role' },
  //       { text: 'User', path: '/user' },
  //       // { text: 'Dealer', path: '/dealer' },
  //       { text: 'Company', path: '/company' },
  //       { text: 'Customer', path: '/customer-list' },
  //       { text: 'Supplier', path: '/supplier' },
  //     ],
  //   },
  //   {
  //     text: 'Operations',
  //     icon: 'group',
  //     items: [
  //       { text: 'Invoice', path: '/invoice' },
  //       { text: 'Article Stock View', path: '/article-stock-view' },
  //       { text: 'Article Production View', path: '/article-production-view' },
  //       { text: 'Transfer Out View', path: '/transfer-out-view' },
  //       { text: 'Customer Receipts', path: '/customer-receipt' },
  //       { text: 'Box Production View', path: '/Box-production-view' },
  //       { text: 'Supplier Payments', path: '/supplier-payment' },
  //       { text: 'Purchase Invoice', path: '/purchase-invoice' },
  //       { text: 'Purchase Order', path: '/purchase-order' },
  //       { text: 'GRN', path: '/grn' },
  //     ],
  //   },
  //   {
  //     text: 'Accounts',
  //     icon: 'money',
  //     items: [
  //       { text: 'Chart Of Accounts', path: '/accounts' },
  //       { text: 'Opening Balance', path: '/opening-balance' },
  //       { text: 'Miscellaneous Receipts', path: '/misc-receipt' },
  //       { text: 'Miscellaneous Payment', path: '/miscellaneous-payment' },
  //       { text: 'Journal Voucher', path: '/journal-voucher' },
  //       { text: 'Debit Note', path: '/debit' },
  //       { text: 'Credit Note', path: '/credit-note' },
  //       { text: 'Prepayment', path: '/pre-payment' },
  //       { text: 'PDC', path: '/pdc' },
  //       { text: 'Fixed Asset', path: '/fixed-assets' },
  //       { text: 'Depreciation', path: '/depreciation' },
  //       // { text: 'Journal Book', path: '/journal-book' },
  //       // { text: 'Ledger Statement', path: '/ledger-statement' },
  //       // { text: 'Customer Detail', path: '/customer-statement-details' },
  //       // { text: 'Supplier Detail', path: '/supplier-statement-details' },
  //       // { text: 'Aged Receivables', path: '/age-receivables' },
  //       // { text: 'Aged Payables', path: '/age-payables' },
  //       // { text: 'Profit Loss', path: '/profit-loss' },
  //       // { text: 'Balance Sheet', path: '/balance-sheet' },
  //       // { text: 'Cash Book', path: '/cash-book' },
  //       // { text: 'Input Tax Worksheet', path: '/input-vat' },
  //       // { text: 'Output Tax Worksheet', path: '/output-vat' },
  //       // { text: 'VAT Return', path: '/vat-return' },
  //       // { text: 'Aged Payable Details', path: '/aged-payable-details' },
  //       // { text: 'Aged Receivable Details', path: '/aged-receivable-details' },
  //       // { text: 'Trial Balance', path: '/trial-balance-report' },
  //       {
  //         text: 'Reports',
  //         icon: 'chart',
  //         items: [
  //           { text: 'Journal Book', path: '/journal-book' },
  //           { text: 'Ledger Statement', path: '/ledger-statement' },
  //           {
  //             text: 'Customer Statement Detail',
  //             path: '/customer-statement-details',
  //           },
  //           {
  //             text: 'Supplier Statement Detail',
  //             path: '/supplier-statement-details',
  //           },
  //           { text: 'Input VAT Worksheet', path: '/input-vat' },
  //           { text: 'Output VAT Worksheet', path: '/output-vat' },
  //           { text: 'Aged Receivable', path: '/age-receivables' },
  //           { text: 'Aged Payable', path: '/age-payables' },
  //           { text: 'Trial Balance', path: '/trial-balance-report' },
  //           { text: 'Profit & Loss', path: '/profit-loss' },
  //           { text: 'Balance Sheet', path: '/balance-sheet' },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     text: 'HR & Payroll',
  //     icon: 'user',
  //     items: [
  //       { text: 'Employee', path: '/employee' },
  //       { text: 'Salary Head', path: '/salary-head' },
  //       { text: 'Employee Salary Settings', path: '/employee-salary-settings' },
  //       { text: 'Timesheet', path: '/timesheet' },
  //       { text: 'Payroll', path: '/payroll' },
  //       { text: 'Salary Advance', path: '/salary-advance' },
  //       { text: 'Paytime Entry', path: '/Paytime-entry' },
  //       { text: 'Salary Payment', path: '/salary-payment' },
  //     ],
  //   },
  //   //
  // ];

  constructor(
    private authService: AuthService,
    private elementRef: ElementRef,
    private service: DataService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.refreshMenu();
  }
  // refreshMenu() {
  //   // Use static menu for now
  //   this.internalItems = this.staticMenu;
  //   console.log('✅ Sidebar Items (static):', this.internalItems);
  // }

  refreshMenu() {
    const menuGroups = JSON.parse(
      localStorage.getItem('sideMenuItems') || '[]'
    );

    this.internalItems = [];

    for (const group of menuGroups) {
      const menus = group.Menus || [];

      if (menus.length === 0) continue; // Skip empty groups

      // Remove duplicate menus based on MenuID (in case of repeated Timesheet)
      const uniqueMenus = Array.from(
        new Map(menus.map((item) => [item.MenuID, item])).values()
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
      case 'Home':
        return 'preferences';
      case 'Masters':
        return 'user';
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
    const item = e.itemData;

    if (item && item.path) {
      this.router.navigate([item.path]);
    }

    this.selectedItemChanged.emit(e); // now parent gets the event
  }

  ngAfterViewInit() {
    this.setSelectedItem();
    events.on(this.elementRef.nativeElement, 'dxclick', (e: Event) => {
      this.openMenu.next(e);
    });
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
