// import { Component } from '@angular/core';
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
  DxValidationGroupComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import {
  SalaryHeadAddComponent,
  SalaryHeadAddModule,
} from 'src/app/components/HR/Masters/Salary Head/salary-head-add/salary-head-add.component';
import { SalaryHeadEditModule } from 'src/app/components/HR/Masters/Salary Head/salary-head-edit/salary-head-edit.component';

@Component({
  selector: 'app-salary-head-list',
  templateUrl: './salary-head-list.component.html',
  styleUrls: ['./salary-head-list.component.scss'],
})
export class SalaryHeadListComponent {
  @ViewChild(SalaryHeadAddComponent)
  SalaryHeadAddComponent!: SalaryHeadAddComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent | undefined;
  @ViewChild('SalaryHeadValidation', { static: false })
  SalaryHeadValidation: DxValidationGroupComponent | undefined;
  salaryHeadList: any = [];
  readonly allowedPageSizes: any = [10, 15, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
  addSalaryHeadPopupOpened: boolean = false;
  EditSalaryHeadPopupOpened: boolean = false;
  Selected_salaryHead_Data: any;
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
      this.ngZone.run(() => this.addSalaryHead());
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
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };
  isFilterOpened: boolean = false;

  onExporting(event: any) {
    const fileName = 'Credit_Note';
    this.dataservice.exportDataGrid(event, fileName);
  }

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
  ) {
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

    this.sesstion_Details();
    this.getSalaryHeadList();
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
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

  handleEditClose() {
    this.EditSalaryHeadPopupOpened = false;
    // this.getEmployeeList();
    this.addSalaryHeadPopupOpened = false;
    this.Selected_salaryHead_Data = null;
    if (this.SalaryHeadAddComponent) {
      this.SalaryHeadAddComponent.resetForm();
    }

    this.getSalaryHeadList();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getSalaryHeadList() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.get_salary_head_list(payload).subscribe((res: any) => {
      this.salaryHeadList = res.Data.map((item: any, index: number) => {
        return {
          ...item,
          serialNo: index + 1,
        };
      });
    });
  }

  addSalaryHead() {
    this.addSalaryHeadPopupOpened = true;
    if (this.SalaryHeadAddComponent) {
      this.SalaryHeadAddComponent.setDefaultValues();
      this.SalaryHeadAddComponent.setNextHeadOrder();
      // this.SalaryHeadAddComponent.resetForm()
    }
  }

  OnEditSalary_Head(event: any) {
    event.cancel = true;

    const id = event.data.ID;
    this.dataservice.select_salary_head(id).subscribe((res: any) => {
      this.Selected_salaryHead_Data = res;
    });
    this.EditSalaryHeadPopupOpened = true;
  }

  OnDeleteSalaryHead(event: any) {
    // Logic to handle deletion of salary head
    const id = event.data.ID;
    if (event.data.TRANS_STATUS === 5) {
      event.cancel = true;
      notify('This Salary head cannot be deleted.', 'error', 2000);
      return;
    }
    this.dataservice.delete_salary_Head(id).subscribe((res: any) => {
      notify(
        {
          message: 'Salary Head Deleted successfully ',
          position: { at: 'top center', my: 'top center' },
        },
        'success',
      );

      this.getSalaryHeadList();
    });
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      this.getSalaryHeadList();
    }
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };
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
    SalaryHeadAddModule,
    SalaryHeadEditModule,
  ],
  providers: [],
  declarations: [SalaryHeadListComponent],
  exports: [SalaryHeadListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalaryHeadListModule { }
