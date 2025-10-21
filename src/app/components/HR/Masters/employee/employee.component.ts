import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxFileUploaderModule,
  DxDataGridModule,
  DxButtonModule,
  DxValidatorModule,
  DxProgressBarModule,
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import {
  EmployeeAddFormComponent,
  EmployeeAddFormModule,
} from '../employee-add-form/employee-add-form.component';
import { DataService } from 'src/app/services';
import { EmployeeEditFormFormModule } from '../employee-edit-form/employee-edit-form.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
})
export class EmployeeComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  addEmployeePopupOpened: boolean = false;
  showFilterRow = true;
  currency: any;
  isFilterOpened = false;
  GridSource: any;
  employeeList: any;
  selectedEmployee: any;
  editEmployeePopupOpened: boolean = false;
  isLoading: boolean = false;
 isFilterRowVisible: boolean = false;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
   //=================================refresh=============================
   refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };
      addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addEmployee());
    },
    elementAttr: { class: 'add-button' }
  };

  constructor(private dataservice: DataService,private ngZone: NgZone,private cdr:ChangeDetectorRef,private router: Router) {}


formatDates(cellData: any): string {
  if (!cellData) return '';

  const date = cellData instanceof Date ? cellData : new Date(cellData);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}


  getStatusFlagClass(IS_INACTIVE: string): string {
    // console.log('Status:', Status);
    
 return IS_INACTIVE ? 'flag-red' : 'flag-green';
}

  ngOnInit() {
      const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);

    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/employee');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }

    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    this.getEmployeeList();
  }

  getEmployeeList() {
    this.isLoading = true;
    const  SELECTED_COMPANY=JSON.parse(sessionStorage.getItem('savedUserData'))
    const companyid=SELECTED_COMPANY
    console.log(SELECTED_COMPANY)
    console.log(companyid);
    
   const company_id=1
      const payload={
      "CompanyId":company_id
    }
    this.dataservice.employeeList(payload).subscribe((response: any) => {
      this.employeeList = response.reverse();
      this.isLoading = false;
    });
  }
  applyFilter() {
    this.GridSource.filter();
  }
  onAddClick() {}

  addEmployee() {
    this.addEmployeePopupOpened = true;
  }

  onFormClosed(saved: boolean) {
    this.addEmployeePopupOpened = false;
    this.getEmployeeList(); // reload the data
  }

  getStatusText = (rowData: any): string => {
    return rowData.IS_INACTIVE ? 'Inactive' : 'Active';
  };

  onEditEmployee(e: any) {
    e.cancel = true;
  console.log(e,'=============event================================')
    const employeeId = e.data.ID;
    this.editEmployeePopupOpened = true;
    this.dataservice.selectEmployee(employeeId).subscribe((response: any) => {
      this.selectedEmployee = response;
      console.log(this.selectedEmployee,'selected response');
      
    });
  }

  onDeleteEmployee(e: any) {
    const employeeId = e.data.ID;

    // Optionally prevent the default delete behavior
    e.cancel = true;
     if (e.data.TRANS_STATUS === 5) {
          e.cancel = true;
          notify('This Employee cannot be deleted.', 'error', 2000);
          return;
        }

    // Call your delete API
    this.dataservice.deleteEmployee(employeeId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Employee deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.getEmployeeList();
          // this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
        // or whatever method you use to refresh `employeeList`
      },
      (error) => {
        console.error('Error deleting employee:', error);
      }
    );
  }
  
    refreshGrid(){
          if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
       // Or reload data from API if needed
       this.getEmployeeList()
      
    }
  }
           toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  handleEditClose() {
    this.editEmployeePopupOpened = false;
    this.getEmployeeList();
    this.selectedEmployee = null;
  }
}

@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    EmployeeAddFormModule,
    EmployeeEditFormFormModule,
  ],
  providers: [],
  declarations: [EmployeeComponent],
  exports: [EmployeeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeeModule {}