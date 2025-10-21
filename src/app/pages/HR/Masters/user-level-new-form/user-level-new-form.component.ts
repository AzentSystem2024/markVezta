import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
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
  DxValidatorComponent,
  DxValidationSummaryModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-user-level-new-form',
  templateUrl: './user-level-new-form.component.html',
  styleUrls: ['./user-level-new-form.component.scss']
})
export class UserLevelNewFormComponent{

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
MenuDatasource:any;

 
  UserLevelValue: any = '';
  isErrorVisible: boolean = false;
  UserListdataSource: any;
  userRoles: any;
  CopiedUserLevelValue: any;
  clearData: any;
 

   constructor(private fb: FormBuilder, private dataservice: DataService,private cdr: ChangeDetectorRef) {
       
     }

  ngOnInit(): void {
    this.selectedTab = 0;
    this.UserLevelValue = '';
    
   this.get_All_MenuList();
    this.fetch_all_UserLevel_list();
    console.log(this.sharedValue,'sharedvalue');
    
  }

ngOnChanges(changes: SimpleChanges): void {
  if (changes['sharedValue'] && this.sharedValue) {
console.log(this.sharedValue,'selected');

    this.selectedTab = 0;
    this.UserLevelValue = '';
    this.selectedTabData = [];
    this.CopiedUserLevelValue = '';

    // ✅ Loop through each tab and reset selectedRows + permission fields
    this.MenuDatasource.forEach((tab, index) => {
      this.selectedRows[index] = [];

      if (Array.isArray(tab.Menus)) {
        tab.Menus.forEach((menu: any) => {
          menu.canAdd = false;
          menu.canPrint = false;
          menu.canEdit = false;
          menu.canView = true;
          menu.canDelete = false;
          menu.canApprove = false;
          // Reset any other permission fields as needed
        });
      }
    });

    // ✅ Set the initial tab data
    this.selectedTabData = this.MenuDatasource[this.selectedTab]?.Menus || [];
  }
}



  //   //==============All Menu List========================
  get_All_MenuList() {
    this.dataservice. get_usermenu_Api().subscribe((response: any) => {
      this.MenuDatasource = response.Data;
    });

    
  }

   //===============Fetch All User Level List===================
  fetch_all_UserLevel_list() {

    this.dataservice.get_UserLevelData_List_Api().subscribe((response: any) => {
      this.UserListdataSource = response.data;
      this.userRoles = this.UserListdataSource.map(
        (user: any) => user.UserRoles
      );
      console.log('user roles list :', this.userRoles);
    });
  }

  onTabClick(event: any): void {
    this.selectedTab = event.itemIndex;
    this.selectedTabData = this.MenuDatasource[this.selectedTab].Menus;
  }

  

   onSelectionChanged(event: any): void {
    if (this.UserLevelValue == '') {
      this.isErrorVisible = true;
    }
    this.selectedRows[this.selectedTab] = event.selectedRowsData;
    this.combineSelectedRows();
  }
  
  //============== copy data from already exis user ==========
 
  onUserRoleCopySelectionChange(event: any) {
  if (event.value) {
    const copiedUser = this.UserListdataSource.find(
      (user: any) => user.UserRoles === event.value
    );

    if (copiedUser && copiedUser.usermenulist) {
      const userMenuList = copiedUser.usermenulist;

      // Clear selected rows
      this.selectedRows = {};

      this.MenuDatasource.forEach((tab: any, tabIndex: number) => {
        this.selectedRows[tabIndex] = [];

        (tab.Menus || []).forEach((menu: any) => {
          const match = userMenuList.find((m: any) => m.MenuId === menu.MenuId && m.Selected);

          if (match) {
            // Copy permissions from matched user
            menu.CanAdd = match.CanAdd ?? false;
            menu.CanView = match.CanView ?? true;
            menu.CanEdit = match.CanEdit ?? false;
            menu.CanApprove = match.CanApprove ?? false;
            menu.CanDelete = match.CanDelete ?? false;
            menu.CanPrint = match.CanPrint ?? false;

            // Also copy lowercase flags for checkbox binding
            menu.canAdd = match.CanAdd ?? false;
            menu.canView = match.CanView ?? true;
            menu.canEdit = match.CanEdit ?? false;
            menu.canApprove = match.CanApprove ?? false;
            menu.canDelete = match.CanDelete ?? false;
            menu.canPrint = match.CanPrint ?? false;

            menu.Selected = true;

            this.selectedRows[tabIndex].push(menu.MenuId);
          } else {
            // Clear permissions if not matched
            menu.CanAdd = false;
            menu.CanView = true;
            menu.CanEdit = false;
            menu.CanApprove = false;
            menu.CanDelete = false;
            menu.CanPrint = false;

            menu.canAdd = false;
            menu.canView = true;
            menu.canEdit = false;
            menu.canApprove = false;
            menu.canDelete = false;
            menu.canPrint = false;

            menu.Selected = false;
          }
        });
      });

      this.selectedTabData = this.MenuDatasource[this.selectedTab]?.Menus || [];
      this.combineSelectedRows();

      console.log('✅ Copied user menu permissions into form:', this.selectedRows);
    }
  } else {
    // Reset if selection is cleared
    this.selectedRows = {};
    this.selectedTabData = [];
  }
}


   combineSelectedRows(): void {
  this.allSelectedRows = [];

  // ✅ Step 1: Collect all selected MenuIds 
const selectedMenuIds = new Set<number>();
Object.values(this.selectedRows).forEach((menuList: any[]) => {
  menuList.forEach(menu => selectedMenuIds.add(menu.MenuId));
});

// ✅ Step 2: Collect ONLY selected and enriched menus
const enrichedMenus: any[] = [];

(this.MenuDatasource || []).forEach((group: any) => {
  (group.Menus || []).forEach((menu: any) => {
    if (selectedMenuIds.has(menu.MenuId)) {
      enrichedMenus.push({
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

  // Step 3: Store userLevelname and real enriched menus
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
  ],
  providers: [],
  declarations: [UserLevelNewFormComponent],
  exports: [UserLevelNewFormComponent],
})
export class UserLevelNewFormModule {}