import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  NgModule,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
} from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-user-level-edit-form',
  templateUrl: './user-level-edit-form.component.html',
  styleUrls: ['./user-level-edit-form.component.scss'],
})
export class UserLevelEditFormComponent implements OnInit, OnChanges {
  @Input() editValue: any;

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
  checkedRows: any;
  resetValue: boolean = false;
  clearData: any;

  constructor(private fb: FormBuilder, private dataservice: DataService) {}

  ngOnInit(): void {
    this.get_All_MenuList();
    console.log(
      this.editValue,
      'editvl++++++++++++++++++++++++++++++++++++++++++++='
    );
  }


  ngOnChanges(changes: SimpleChanges): void {
  if (changes['editValue'] && this.editValue) {
    console.log('selected edit data value is', this.editValue);

    this.allSelectedRows = [];
    this.UserLevelValue = this.editValue.UserRoles;
    const userMenus = this.editValue.usermenulist || [];

    // Step 1: Reset and restore menu permissions
    this.MenuDatasource.forEach((tab, tabIndex) => {
      this.selectedRows[tabIndex] = [];

      (tab.Menus || []).forEach((menu: any) => {
        // Reset all permissions
        menu.Selected = false;
        menu.CanAdd = false;     
menu.CanView = true;
        menu.CanEdit = false;
        menu.CanApprove = false;
        menu.CanDelete = false;
menu.CanPrint = false;


        const match = userMenus.find(
          (m: any) => m.MenuId === menu.MenuId && m.Selected
        );

        if (match) {
           menu.Selected = true;
         menu.CanAdd = match.CanAdd ?? false;
menu.CanView = match.CanView ?? true;
menu.CanEdit = match.CanEdit ?? false;
menu.CanApprove = match.CanApprove ?? false;
menu.CanDelete = match.CanDelete ?? false;
menu.CanPrint = match.CanPrint ?? false;

// Bind to grid checkboxes:
  menu.canAdd = match.CanAdd ?? false;
  menu.canView = match.CanView ?? true;
  menu.canEdit = match.CanEdit ?? false;
  menu.canApprove = match.CanApprove ?? false;
  menu.canDelete = match.CanDelete ?? false;
  menu.canPrint = match.CanPrint ?? false;

         

          this.selectedRows[tabIndex].push(menu.MenuId);
        }
      });
    });

    // Step 2: Set tab data
    this.selectedTab = 0;
    this.selectedTabData = this.MenuDatasource[this.selectedTab]?.Menus || [];

    this.combineSelectedRows();

    // ✅ Step 3: Build allSelectedRows using selected menu IDs
    const selectedMenuIds = new Set<number>();
    Object.values(this.selectedRows).forEach((menuIdList: number[]) => {
      menuIdList.forEach((menuId) => selectedMenuIds.add(menuId));
    });

    const enrichedMenus: any[] = [];

    (this.MenuDatasource || []).forEach((group: any) => {
      (group.Menus || []).forEach((menu: any) => {
        if (selectedMenuIds.has(menu.MenuId)) {
          enrichedMenus.push({
            userLevelID: this.editValue.ID,
            MenuId: menu.MenuId,
            MenuName: menu.MenuName,
            MenuOrder: menu.MenuOrder,
            Selected: true,
          CanAdd: menu.canAdd ?? false,
  CanView: menu.canView ?? true,
  CanEdit: menu.canEdit ?? false,
    CanApprove: menu.canApprove ?? false,
  CanDelete: menu.canDelete ?? false,
  CanPrint: menu.canPrint ?? false,

          });
        }
      });
    });

    this.allSelectedRows.push({
      userLevelID: this.editValue.ID,
      userLevelname: this.UserLevelValue,
      Menus: enrichedMenus
    });

    console.log('✅ Enriched selected rows:', this.allSelectedRows);
  }
  }

onPermissionCheckboxChanged(e: any): void {
  this.combineSelectedRows(); // Rebuild the latest data from updated grid values
}

// ngOnChanges(changes: SimpleChanges): void {
//     if (changes['editValue'] && this.editValue) {
//       console.log('selected edit data value is ', this.editValue);
//       this.allSelectedRows = [];
//       this.UserLevelValue = this.editValue.UserRoles;
//       // Process the editData to match the new format
//       const selectedMenuIds = this.editValue.usermenulist.map(
//         (menu: any) => menu.MenuId
//       );
//       // Update selectedRows for each tab based on selectedMenuIds
//       this.MenuDatasource.forEach((tab, index) => {
//         this.selectedRows[index] = tab.Menus.filter((menu: any) =>
//           selectedMenuIds.includes(menu.MenuId)
//         ).map((menu: any) => menu.MenuId);
//       });
//       // Set the data for the initial tab
//       this.selectedTab = 0;
//       this.selectedTabData = this.MenuDatasource[this.selectedTab].Menus;
//     }
//   }

  onTabClick(event: any): void {
    this.selectedTab = event.itemIndex;
    this.selectedTabData = this.MenuDatasource[this.selectedTab].Menus;
  }

  //   //==============All Menu List========================
  get_All_MenuList() {
    this.dataservice.get_usermenu_Api().subscribe((response: any) => {
      this.MenuDatasource = response.Data;
    });

    
  }

  onUserLevelValueChange(event: any): void {
    this.UserLevelValue = event.value;
    this.combineSelectedRows();
  }

  onSelectionChanged(event: any): void {
    if (this.UserLevelValue == '') {
      this.isErrorVisible = true;
    } else {
      this.selectedRows[this.selectedTab] = event.selectedRowKeys;
      this.combineSelectedRows();
    }
  }

  combineSelectedRows(): void {
    this.allSelectedRows = [];

    //  Step 1: Collect all selected MenuIds
    const selectedMenuIds = new Set<number>();
    Object.values(this.selectedRows).forEach((menuIdList: any[]) => {
      menuIdList.forEach((menuId) => selectedMenuIds.add(menuId)); // menuId is just a number
    });

    //  Step 2: Only enrich selected menus
    const enrichedMenus: any[] = [];

    (this.MenuDatasource || []).forEach((group: any) => {
      (group.Menus || []).forEach((menu: any) => {
        if (selectedMenuIds.has(menu.MenuId)) {
          enrichedMenus.push({
            userLevelID: this.editValue.ID,
            MenuId: menu.MenuId,
            MenuName: menu.MenuName,
            MenuOrder: menu.MenuOrder,
            Selected: true, // explicitly true
            CanAdd: menu.CanAdd ?? false,
CanView: menu.CanView ?? true,
CanEdit: menu.CanEdit ?? false,
CanApprove: menu.CanApprove ?? false,
CanDelete: menu.CanDelete ?? false,
CanPrint: menu.CanPrint ?? false,
          });
        }
      });
    });

    //  Step 3: Store only selected/enriched menus
    this.allSelectedRows.push({
       userLevelID: this.editValue?.ID || 0,
      userLevelname: this.UserLevelValue,
      Menus: enrichedMenus,
    });
    

  }

  // getNewUSerLevelEditedData = () => ({ ...this.allSelectedRows });
  
getNewUSerLevelEditedData = () => {
  this.combineSelectedRows(); // Ensure this reflects latest grid changes
  return { ...this.allSelectedRows[0] }; // Return the first object, not wrapped in array
};

  resetUserChanges = () => {
    this.editValue = '';
  };
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
  ],
  providers: [],
  declarations: [UserLevelEditFormComponent],
  exports: [UserLevelEditFormComponent],
})
export class UserLevelEditFormModule {}
