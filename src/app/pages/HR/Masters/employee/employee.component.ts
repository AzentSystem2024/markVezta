import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
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
  DxLoadPanelModule,
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
} from '../../../../components/HR/Masters/employee-add-form/employee-add-form.component';
import { DataService } from 'src/app/services';
import { EmployeeEditFormFormModule } from '../../../../components/HR/Masters/employee-edit-form/employee-edit-form.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
})
export class EmployeeComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent | undefined;
  readonly allowedPageSizes: any = [10, 15, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
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

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addEmployee());
    },
    elementAttr: { class: 'add-button' },

    template: () => {
      return `
       <div class="add-btn-content">
         <span class="iconify"
               data-icon="formkit:add"
               data-width="20"
               data-height="20"></span>
         <span class="add-text">New</span>
       </div>
     `;
    },
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  selected_Company_id: any;

  constructor(
    private dataservice: DataService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) { }

  onExporting(event: any) {
    const fileName = 'Credit_Note';
    this.dataservice.exportDataGrid(event, fileName);
  }

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
    return IS_INACTIVE ? 'flag-red' : 'flag-green';
  }

  ngOnInit() {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
    // this.isLoading = true;
    this.sesstion_Details();
    this.getEmployeeList();
  }

  sesstion_Details() {
    const savedUserData = sessionStorage.getItem('savedUserData');
    if (!savedUserData) {
      this.selected_Company_id = null;
      return;
    }

    const sessionData = JSON.parse(savedUserData);
    this.selected_Company_id = sessionData?.SELECTED_COMPANY?.COMPANY_ID;
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  getEmployeeList() {
    this.isLoading = true;
    const payload = {
      CompanyId: this.selected_Company_id,
    };

    this.dataservice.employeeList(payload).subscribe({
      next: (response: any) => {
        this.employeeList = Array.isArray(response)
          ? [...response].reverse()
          : [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching employee list:', error);
        this.employeeList = [];
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  applyFilter() {
    this.GridSource.filter();
  }

  onAddClick() { }

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
    const employeeId = e.data.ID;
    this.editEmployeePopupOpened = true;
    this.dataservice.selectEmployee(employeeId).subscribe((response: any) => {
      this.selectedEmployee = response;
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
            'success',
          );
          this.getEmployeeList();
          // this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
        // or whatever method you use to refresh `employeeList`
      },
      (error) => {
        console.error('Error deleting employee:', error);
      },
    );
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.getEmployeeList();
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
    DxLoadPanelModule,
  ],
  providers: [],
  declarations: [EmployeeComponent],
  exports: [EmployeeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeeModule { }
