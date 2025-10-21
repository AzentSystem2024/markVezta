import { Component, NgModule, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxCheckBoxModule, DxDataGridModule, DxFormModule, DxTabsModule, DxTextBoxModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-user-levels-form',
  templateUrl: './user-levels-form.component.html',
  styleUrls: ['./user-levels-form.component.scss']
})
export class UserLevelsFormComponent implements OnInit{

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
 

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;

  formUserLevelData:any = {
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
    this.selectedTab=0;
    this.menuLoad(this.selectedTab);
  }

  clearData(){
    this.selectedRows={};
    this.selectedTab=0;
    this.formUserLevelData.IS_INACTIVE=false;
    const newTabData = this.MenuDatasource.filter(
      (item: any) => item.MAIN_MODULE_ID === this.selectedTab+2
  ).map((item: any) => ({
      MODULE_NAME: item.MODULE_NAME,
      canAdd: false,
      canView:false,
      canModify:false,
      canDelete: false,
      canVerify: false,
      canApprove: false,
      canPrint:false,
      canExport:false,
      ...item // Include other properties such as permissions if needed
  }));
   this.selectedTabData=newTabData
  }

  menuLoad(selectedTab: any) {
    console.log(this.MenuDatasource, "MenuDatasource inside menuLoad");
  
    // Check if MenuDatasource is available
    if (!this.MenuDatasource || this.MenuDatasource.length === 0) {
      console.error("MenuDatasource is empty or not defined");
      return;
    }
  
    const newTabData = this.MenuDatasource.filter(
      (item: any) => item.MAIN_MODULE_ID === this.selectedTab + 2
    ).map((item: any) => ({
      MODULE_NAME: item.MODULE_NAME,
      canAdd: item.canAdd || false,
      canView: item.canView || false,
      canModify: item.canModify || false,
      canDelete: item.canDelete || false,
      canVerify: item.canVerify || false,
      canApprove: item.canApprove || false,
      canPrint: item.canPrint || false,
      canExport: item.canExport || false,
      ...item // Include other properties
    }));

    // If there are already selected rows for the current tab, merge them with the new data
    if (this.selectedRows[this.selectedTab]) {
        const selectedRowIds = this.selectedRows[this.selectedTab].map((row: any) => row.ID);

        newTabData.forEach((item: any) => {
            if (selectedRowIds.includes(item.ID)) {
                // If the item is already selected, retain its selected state
                const selectedItem = this.selectedRows[this.selectedTab].find(row => row.ID === item.ID);
                if (selectedItem) {
                    item.canAdd = selectedItem.canAdd;
                    item.canView = selectedItem.canView;
                    item.canModify = selectedItem.canModify;
                    item.canDelete = selectedItem.canDelete;
                    item.canVerify = selectedItem.canVerify;
                    item.canApprove = selectedItem.canApprove;
                    item.canPrint = selectedItem.canPrint;
                    item.canExport = selectedItem.canExport;
                }
            }
        });
    }
  
    console.log(newTabData, "Filtered data for the selected tab");
    this.selectedTabData = newTabData;
  }

  onTabClick(event: any): void {
    this.selectedTab = event.itemIndex+2;
    console.log(this.selectedTab, "selected tab");

    // Retrieve the data for the newly selected tab
    const newTabData = this.MenuDatasource.filter(
        (item: any) => item.MAIN_MODULE_ID === this.selectedTab
    ).map((item: any) => ({
        MODULE_NAME: item.MODULE_NAME,
        canAdd: item.CanAdd || false,
        canView: item.CanView || false,
        canModify: item.CanEdit || false,
        canDelete: item.CanDelete || false,
        canVerify: item.canVerify || false,
        canApprove: item.canApprove || false,
        canPrint: item.CanPrint || false,
        canExport: item.canExport || false,
        ...item // Include other properties such as permissions if needed
    }));

    // If there are already selected rows for the current tab, merge them with the new data
    if (this.selectedRows[this.selectedTab]) {
        const selectedRowIds = this.selectedRows[this.selectedTab].map((row: any) => row.ID);

        newTabData.forEach((item: any) => {
            if (selectedRowIds.includes(item.ID)) {
                // If the item is already selected, retain its selected state
                const selectedItem = this.selectedRows[this.selectedTab].find(row => row.ID === item.ID);
                if (selectedItem) {
                    item.canAdd = selectedItem.canAdd;
                    item.canView = selectedItem.canView;
                    item.canModify = selectedItem.canModify;
                    item.canDelete = selectedItem.canDelete;
                    item.canVerify = selectedItem.canVerify;
                    item.canApprove = selectedItem.canApprove;
                    item.canPrint = selectedItem.canPrint;
                    item.canExport = selectedItem.canExport;
                }
            }
        });
    }

    // Update the selected tab data with the new data, preserving the selected states
    this.selectedTabData = newTabData;

    console.log(this.selectedTabData, "selected tab data");
}

  get_All_MenuList() {
    this.service.get_userLevel_menuList().subscribe((response: any) => {
      // Filtering and mapping the response data
      this.MenuDatasource = response.menu;
      this.MainMenu=response.menu
        .filter((item: any) => item.MAIN_MODULE_ID === 0) // Filter based on condition
        .map((item: any) => ({
          text: item.MODULE_NAME, // Mapping MODULE_NAME as text
          icon: item.MENU_ICON    // Mapping MENU_ICON as icon
        }));
        this.menuLoad(this.selectedTab);
  
      console.log(this.MenuDatasource, "MenuDatasource");
    });
  }

  onSelectionChanged(event: any): void {
    console.log(event,"event");
    // Update selected items for the current tab
    this.selectedRows[this.selectedTab] = event.selectedRowsData; // Assuming event.selectedRowKeys holds the keys of selected rows
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
  providers :[UserLevelsFormComponent],
  declarations: [UserLevelsFormComponent],
  exports: [UserLevelsFormComponent]

})
export class UserLevelsFormModule { }
