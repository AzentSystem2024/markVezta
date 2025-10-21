import { Component, Input, NgModule, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxCheckBoxModule, DxDataGridModule, DxFormModule, DxTabsModule, DxTextBoxModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-user-levels-edit-form',
  templateUrl: './user-levels-edit-form.component.html',
  styleUrls: ['./user-levels-edit-form.component.scss']
})
export class UserLevelsEditFormComponent implements OnInit,OnChanges {

  @Input() formdata: any;

  width: any = '100%';
  rtlEnabled: boolean = false;
  scrollByContent: boolean = true;
  showNavButtons: boolean = true;
  orientations: any = 'horizontal';
  stylingMode: any = 'primary';
  iconPosition: any = 'left';
  selectedTabData = [];
  selectedRows: { [key: number]: any[] } = {};
  selectedTab: number = 0;
  allSelectedRows: any[] = [];
  MenuDatasource: any;
  UserLevelValue: any = '';
  isErrorVisible: boolean = false;
  UserListdataSource: any;
  userRoles: any;
  CopiedUserLevelValue: any;
  canAdd:boolean =false;
  MainMenu:any;
  selectedDataByTab = {}; // Store selected data per tab

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  menuData:any;

  formUserLevelData:any = {
    ID:'',
    LEVEL_NAME: '',
    CAN_VIEW_COST: 0,
    IS_INACTIVE: 0,
    COMPANY_ID: 1,
  }

  newUserLevel=this.formUserLevelData;

  getNewUserLevelData = () => ({ ...this.newUserLevel });

  constructor(private service:DataService){
    
  }

  ngOnInit(): void {
    this.get_All_MenuList();
  }

  onTabClick(event: any): void {
    // Step 1: Determine the new selected tab index
    const newTabIndex = event.itemIndex + 2; // Adjust index if necessary
    console.log(newTabIndex, "selected tab");

    // Step 2: Set the new selected tab
    this.selectedTab = newTabIndex;

    // Step 3: Initialize selectedTabData and unselectedTabData
    this.selectedTabData = [];
    let unselectedTabData = [];

    // Step 4: Load existing selected data for the current tab
    if (this.selectedRows[this.selectedTab]) {
        console.log(this.selectedRows[this.selectedTab], "+_+_+_+_+_+_+_+");
        
        // If data exists, populate the selectedTabData
        this.selectedTabData = this.selectedRows[this.selectedTab].map((item: any) => ({
            ID: item.ID,
            MODULE_NAME: item.MODULE_NAME,
            canAdd: item.canAdd  || false,
            canView: item.canView || false,
            canModify: item.canModify || false,
            canDelete: item.canDelete || false,
            canVerify: item.canVerify || false,
            canApprove: item.canApprove || false,
            canPrint: item.canPrint || false,
            canExport: item.canExport || false,
        }));

        console.log(this.selectedTabData, "Loaded existing selected data for the tab");
    }

    // Step 5: Load existing unselected data for the current tab
    unselectedTabData = this.MenuDatasource.filter((item: any) => item.MAIN_MODULE_ID === newTabIndex && !this.selectedTabData.some(selected => selected.ID === item.ID))
      .map((item: any) => ({
          ID: item.ID,
          MODULE_NAME: item.MODULE_NAME,
          canAdd: item.canAdd || false,
          canView: item.canView || false,
          canModify: item.canModify || false,
          canDelete: item.canDelete || false,
          canVerify: item.canVerify || false,
          canApprove: item.canApprove || false,
          canPrint: item.canPrint || false,
          canExport: item.canExport || false,
          ...item // Include other properties if necessary
      }));

    // Step 6: Combine selected and unselected data
    this.selectedTabData = [...this.selectedTabData, ...unselectedTabData];

    // Step 7: Only save the rows that were selected by the user (already in selectedTabData)
    this.selectedRows[this.selectedTab] = this.selectedTabData.filter(item => {
      // Check if the user has selected or modified this row
      return item.canAdd || item.canView || item.canModify || 
             item.canDelete || item.canVerify || item.canApprove || 
             item.canPrint || item.canExport;
  });

    // Log final selected tab data
    console.log(this.selectedTabData, "Final selected tab data after click");
}



  get_All_MenuList() {
    this.service.get_userLevel_menuList().subscribe((response: any) => {
      // Filtering and mapping the response data
      this.MenuDatasource = response.menu;
      console.log(this.MenuDatasource,"menudatasource")
      this.MainMenu = response.menu
      .filter((item: any) => item.MAIN_MODULE_ID === 0) // Filter based on condition
      .map(({ MODULE_NAME: text, MENU_ICON: icon, ...rest }) => ({
        text,    // Assigning MODULE_NAME to text
        icon,    // Assigning MENU_ICON to icon
        ...rest, // Spread operator to include all other properties, excluding MODULE_NAME and MENU_ICON
      }));


        console.log(this.MainMenu,"main menu")
    });
  }

  onSelectionChanged(event: any): void {
    console.log(event,"event");
    // Update selected items for the current tab
    this.selectedRows[this.selectedTab] = event.selectedRowKeys; // Assuming event.selectedRowKeys holds the keys of selected rows
    console.log(this.selectedRows[this.selectedTab],"selected items")
  }

  combineSelectedRows(): any[] {
    const combinedRights = [];

    Object.keys(this.selectedRows).forEach(tabKey => {
      this.selectedRows[tabKey].forEach(row => {
        combinedRights.push({
          MODULE_ID: row.ID, // Assuming ID is the unique identifier for MODULE_ID
          IS_ADD: row.canAdd ? true : false,
          IS_VIEW: row.canView ? true : false,
          IS_MODIFY: row.canModify ? true : false,
          IS_DELETE: row.canDelete ? true : false,
          IS_VERIFY: row.canVerify ? true : false,
          IS_APPROVE: row.canApprove ? true : false,
          IS_PRINT: row.canPrint ? true : false,
          IS_EXPORT: row.canExport ? true : false
        });
      });
    });

    return combinedRights;
    console.log(combinedRights,"combined rights");
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formdata'] && this.formdata) {
      this.newUserLevel = this.formdata;
      this.selectedTab = 0; // Default to the first tab
  
      // Map selected rights based on formdata
      const selectedMenuIds = this.formdata.rights.map((menu: any) => menu.MODULE_ID);
      console.log(selectedMenuIds,"selectedmenuid")
  
      const uniqueTabIds = [...new Set(
        this.MenuDatasource
          .filter((menu: any) => menu.MAIN_MODULE_ID !== 0) // Exclude 0
          .map((menu: any) => menu.MAIN_MODULE_ID)
      )];
      console.log(uniqueTabIds,"uniquetabid")

      this.selectedRows[this.selectedTab] = this.MenuDatasource
      .filter((menu: any) => selectedMenuIds.includes(menu.ID))
      .map((menu: any) => menu.ID);
  
      // Loop through all unique tabs and assign selected rows for each tab
      uniqueTabIds.forEach((tabId: number) => { // Cast tabId to number if applicable
        console.log(tabId,"tabid");
        this.selectedRows[tabId] = this.selectedRows[tabId] || [];
        this.selectedRows[tabId] = this.MenuDatasource
        .filter((menu: any) => menu.MAIN_MODULE_ID === tabId && selectedMenuIds.includes(menu.ID))
        .map((menu: any) => {
          // Find the corresponding rights for the menu ID
          const right = this.formdata.rights.find((r: any) => r.MODULE_ID === menu.ID);

          return {
            ID:menu.ID,
            MODULE_NAME: menu.MODULE_NAME,
            canAdd: right ? right.IS_ADD : false, // Default to false if no right found
            canView: right ? right.IS_VIEW : false, // Default to false if no right found
            canModify: right ? right.IS_MODIFY : false,
            canDelete: right ? right.IS_DELETE : false,
            canVerify: right ? right.IS_VERIFY : false,
            canApprove: right ? right.IS_APPROVE : false,
            canPrint: right ? right.IS_PRINT : false,
            canExport: right ? right.IS_EXPORT : false,
          };
        });
          console.log(this.selectedRows[tabId],"selectedRows[tabId]")
          this.updateTabData(tabId);
      });

      this.updateTabData(this.selectedTab+2);
  
      // Update selected tab data for the default tab (first tab)
      
    }
  }
  
  updateTabData(tabIndex: number): void {
    this.selectedTabData = this.MenuDatasource
      .filter((item: any) => item.MAIN_MODULE_ID === tabIndex)
      .map((item: any) => {
        const matchedRights = this.formdata.rights.find(
          (rights) => rights.MODULE_ID === item.ID
        );
  
        return {
          MODULE_NAME: item.MODULE_NAME,
          canAdd: matchedRights ? matchedRights.IS_ADD : false,
          canView: matchedRights ? matchedRights.IS_VIEW : false,
          canModify: matchedRights ? matchedRights.IS_MODIFY : false,
          canDelete: matchedRights ? matchedRights.IS_DELETE : false,
          canVerify: matchedRights ? matchedRights.IS_VERIFY : false,
          canApprove: matchedRights ? matchedRights.IS_APPROVE : false,
          canPrint: matchedRights ? matchedRights.IS_PRINT : false,
          canExport: matchedRights ? matchedRights.IS_EXPORT : false,
          ...item
        };
      });

      console.log(this.selectedTabData,"selectedTabData")
  }
}
@NgModule({
  imports: [
    BrowserModule,
    DxFormModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    DxValidationGroupModule,
    DxValidatorModule,
    DxDataGridModule,
    DxValidatorModule,
    DxTabsModule,
    DxCheckBoxModule
  ],
  providers :[UserLevelsEditFormComponent],
  declarations: [UserLevelsEditFormComponent],
  exports: [UserLevelsEditFormComponent]

})
export class UserLevelsEditFormModule { }
