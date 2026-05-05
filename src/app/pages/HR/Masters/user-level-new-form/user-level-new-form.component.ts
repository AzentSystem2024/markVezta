import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  NgModule,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  DxTabPanelModule,
  DxCheckBoxModule,
  DxSelectBoxModule,
  DxTemplateModule,
  DxTabsModule,
  DxTextBoxModule,
  DxButtonModule,
  DxDataGridModule,
  DxTreeViewModule,
  DxValidatorModule,
  DxLoadPanelModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-user-level-new-form',
  templateUrl: './user-level-new-form.component.html',
  styleUrls: ['./user-level-new-form.component.scss'],
})
export class UserLevelNewFormComponent implements OnInit, OnChanges {
  @ViewChild('dataGrid', { static: false }) dataGrid: any;
  @Input() sharedValue: any | false;
  width: any = '100%';
  rtlEnabled: boolean = false;
  scrollByContent: boolean = true;
  showNavButtons: boolean = true;
  orientations: any = 'horizontal';
  stylingMode: any = 'primary';
  iconPosition: any = 'left';
  selectedTabData: any[] = [];
  selectedRows: { [key: number]: any[] } = {};
  selectedTab: number = 0;
  allSelectedRows: any[] = [];
  MenuDatasource: any;

  UserLevelValue: any = '';
  isErrorVisible: boolean = false;
  UserListdataSource: any;
  userRoles: any;
  CopiedUserLevelValue: any;
  clearData: any;

  isLoading: boolean = false;

  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // setTimeout(() => {
    //   this.selectedTab = 0;
    //   this.selectedTabData = this.MenuDatasource[0]?.Menus || [];
    //   this.cdr.detectChanges();
    // }, 100);

    this.UserLevelValue = '';
    this.isLoading = true;

    this.get_All_MenuList();
    this.fetch_all_UserLevel_list();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sharedValue'] && this.sharedValue) {
      this.selectedTab = 0;
      this.UserLevelValue = '';
      this.selectedTabData = [];
      this.CopiedUserLevelValue = '';

      // Loop through each tab and reset selectedRows + permission fields
      this.MenuDatasource.forEach((tab, index) => {
        this.selectedRows[index] = [];

        if (Array.isArray(tab.Menus)) {
          tab.Menus.forEach((menu: any) => {
            menu.CanAdd = false;
            menu.CanPrint = false;
            menu.CanVerify = false;
            menu.CanEdit = false;
            menu.CanView = true;
            menu.CanDelete = false;
            menu.HideCost = false;
            menu.CanApprove = false;
            // Reset any other permission fields as needed
          });
        }
      });

      // Set the initial tab data
      this.selectedTabData = this.MenuDatasource[this.selectedTab]?.Menus || [];
      this.cdr.detectChanges();
    }
  }

  //==============All Menu List========================
  get_All_MenuList() {
    this.dataservice.get_usermenu_Api().subscribe((response: any) => {
      this.MenuDatasource = response.Data || [];

      // Set default permissions
      this.MenuDatasource.forEach((tab: any, index: number) => {
        this.selectedRows[index] = [];

        (tab.Menus || []).forEach((menu: any) => {
          menu.CanAdd = false;
          menu.CanPrint = false;
          menu.CanEdit = false;
          menu.CanVerify = false;
          menu.CanView = true;
          menu.CanDelete = false;
          menu.HideCost = false;
          menu.CanApprove = false;
        });
      });

      // Load first tab
      if (this.MenuDatasource.length > 0) {
        this.selectedTab = 0;
        this.selectedTabData = this.MenuDatasource[0].Menus || [];
        this.isLoading = false;
      }
      this.cdr.detectChanges();
    });
  }

  //===============Fetch All User Level List===================
  fetch_all_UserLevel_list() {
    this.dataservice.get_UserLevelData_List_Api().subscribe((response: any) => {
      this.UserListdataSource = response.data;
      this.userRoles = this.UserListdataSource.map(
        (user: any) => user.UserRoles,
      );
    });
  }

  onTabClick(event: any): void {
    this.selectedTab = event.itemIndex;
    this.selectedTabData = this.MenuDatasource[this.selectedTab].Menus;
    this.cdr.detectChanges();
  }

onSelectionChanged(event: any): void {
  if (this.UserLevelValue == '') {
    this.isErrorVisible = true;
  }

  const selectedKeys = new Set(event.selectedRowKeys);

  this.selectedRows[this.selectedTab] = event.selectedRowKeys;

  this.selectedTabData.forEach((menu: any) => {
    if (selectedKeys.has(menu.MenuId)) {
      menu.CanView = true; // default
    } else {
      // reset all permissions
      menu.CanAdd = false;
      menu.CanView = false;
      menu.CanEdit = false;
      menu.CanVerify = false;
      menu.CanApprove = false;
      menu.CanDelete = false;
      menu.CanPrint = false;
      menu.HideCost = false;
    }
  });

  this.combineSelectedRows();
}

  //   onSelectionChanged(event: any): void {
  //   if (this.UserLevelValue == '') {
  //     this.isErrorVisible = true;
  //   }

  //   const selectedKeys = new Set(event.selectedRowKeys);

  //   this.selectedRows[this.selectedTab] = event.selectedRowKeys;

  //   // Loop through current tab menus
  //   this.selectedTabData.forEach((menu: any) => {
  //     if (selectedKeys.has(menu.MenuId)) {
  //       // Row selected → enable view
  //       menu.CanView = true;
  //     } else {
  //       // Row unselected → disable everything
  //       menu.CanAdd = false;
  //       menu.CanView = false;
  //       menu.CanEdit = false;
  //       menu.CanApprove = false;
  //       menu.CanDelete = false;
  //       menu.CanPrint = false;
  //     }
  //   });

  //   this.combineSelectedRows();
  // }

  //============== copy data from already exis user ==========
  onUserRoleCopySelectionChange(event: any) {
    if (event.value) {
      const copiedUser = this.UserListdataSource.find(
        (user: any) => user.UserRoles === event.value,
      );

      if (copiedUser && copiedUser.usermenulist) {
        const userMenuList = copiedUser.usermenulist;

        // Clear selected rows
        this.selectedRows = {};

        this.MenuDatasource.forEach((tab: any, tabIndex: number) => {
          this.selectedRows[tabIndex] = [];

          (tab.Menus || []).forEach((menu: any) => {
            const match = userMenuList.find(
              (m: any) => m.MenuId === menu.MenuId && m.Selected,
            );

            if (match) {
              // Copy permissions from matched user
              menu.CanAdd = match.CanAdd ?? false;
              menu.CanView = match.CanView ?? true;
              menu.CanEdit = match.CanEdit ?? false;
              menu.CanVerify = match.CanVerify ?? false;
              menu.CanApprove = match.CanApprove ?? false;
              menu.CanDelete = match.CanDelete ?? false;
              menu.HideCost = match.HideCost ?? false;
              menu.CanPrint = match.CanPrint ?? false;

              // Also copy lowercase flags for checkbox binding
              menu.CanAdd = match.CanAdd ?? false;
              menu.CanView = match.CanView ?? true;
              menu.CanEdit = match.CanEdit ?? false;
              menu.CanVerify = match.CanVerify ?? false;
              menu.CanApprove = match.CanApprove ?? false;
              menu.HideCost = match.HideCost ?? false;
              menu.CanDelete = match.CanDelete ?? false;
              menu.CanPrint = match.CanPrint ?? false;
              menu.Selected = match.Selected ?? false;

              this.selectedRows[tabIndex].push(menu.MenuId);
            } else {
              // Clear permissions if not matched
              menu.CanAdd = false;
              menu.CanView = true;
              menu.CanEdit = false;
              menu.CanVerify = false;
              menu.CanApprove = false;
              menu.CanDelete = false;
              menu.HideCost = false;
              menu.CanPrint = false;

              menu.CanAdd = false;
              menu.CanView = true;
              menu.CanEdit = false;
              menu.CanVerify = false;
              menu.CanApprove = false;
              menu.HideCost = false;
              menu.CanDelete = false;
              menu.CanPrint = false;

              menu.Selected = false;
            }
          });
        });

        this.selectedTabData =
          this.MenuDatasource[this.selectedTab]?.Menus || [];
        this.combineSelectedRows();
      }
    } else {
      // Reset if selection is cleared
      this.selectedRows = {};
      this.selectedTabData = [];
    }
  }

  onEditorPreparing(e: any): void {
  if (e.parentType === 'dataRow' && e.dataField) {
    const originalOnValueChanged = e.editorOptions.onValueChanged;

    e.editorOptions.onValueChanged = (args: any) => {
      // 🔥 Update actual object immediately
      e.row.data[e.dataField] = args.value;

      // Call default behavior
      if (originalOnValueChanged) {
        originalOnValueChanged(args);
      }

      // Rebuild payload
      this.combineSelectedRows();
    };
  }
}

onPermissionCheckboxChanged(e: any): void {
  const { data, column, value } = e;

  if (data && column?.dataField) {
    data[column.dataField] = value; //  THIS IS THE KEY FIX
  }

  this.combineSelectedRows();
}

combineSelectedRows(): void {
    this.allSelectedRows = [];

    const selectedMenuIds = new Set<string>();

    Object.values(this.selectedRows || {}).forEach((menuIds: any[]) => {
      menuIds.forEach((menuId) => selectedMenuIds.add(String(menuId)));
    });

    const enrichedMenus: any[] = [];

    (this.MenuDatasource || []).forEach((group: any) => {
      (group.Menus || []).forEach((menu: any) => {
        if (selectedMenuIds.has(String(menu.MenuId))) {
          enrichedMenus.push({
            MenuId: menu.MenuId,
            MenuName: menu.MenuName,
            MenuOrder: menu.MenuOrder,
            Selected: true,

            CanAdd: menu.CanAdd ?? false,
            CanView: menu.CanView ?? true,
            CanEdit: menu.CanEdit ?? false,
            CanVerify:menu.CanVerify ?? false,
            CanApprove: menu.CanApprove ?? false,
            CanDelete: menu.CanDelete ?? false,
            HideCost : menu.HideCost ?? false,
            CanPrint: menu.CanPrint ?? false,
          });
        }
      });
    });

    this.allSelectedRows.push({
      userLevelname: this.UserLevelValue,
      Menus: enrichedMenus,
    });
  }


  getNewUSerLevelData = () => ({ ...this.allSelectedRows });
}

@NgModule({
  imports: [
    CommonModule,
    DxTabPanelModule,
    DxCheckBoxModule,
    DxSelectBoxModule,
    DxTemplateModule,
    DxTabsModule,
    DxTextBoxModule,
    DxButtonModule,
    DxDataGridModule,
    DxTreeViewModule,
    DxValidatorModule,
    DxLoadPanelModule,
  ],
  providers: [],
  declarations: [UserLevelNewFormComponent],
  exports: [UserLevelNewFormComponent],
})
export class UserLevelNewFormModule {}
