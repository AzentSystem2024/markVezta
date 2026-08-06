import { CommonModule } from '@angular/common';
import { Component, NgModule, NgZone, ViewChild } from '@angular/core';
import {
  DxDataGridModule,
  DxButtonModule,
  DxDropDownButtonModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxLookupModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import notify from 'devextreme/ui/notify';

import DataSource from 'devextreme/data/data_source';
import { DataService } from 'src/app/services';
import {
  CptMasterEditFormComponent,
  CptMasterEditFormModule,
} from '../POPUP PAGES/cpt-master-edit-form/cpt-master-edit-form.component';
import {
  CptMasterNewFormComponent,
  CptMasterNewFormModule,
} from '../POPUP PAGES/cpt-master-new-form/cpt-master-new-form.component';

@Component({
  selector: 'app-cpt-master',
  templateUrl: './cpt-master.component.html',
  styleUrls: ['./cpt-master.component.scss'],
  providers: [DataService],
})
export class CPTMasterComponent {
  // ================= ViewChild Declarations =================
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;

  @ViewChild(CptMasterNewFormComponent)
  CptNewFormComponent!: CptMasterNewFormComponent;

  @ViewChild(CptMasterEditFormComponent, { static: false })
  CptEditFormComponent!: CptMasterEditFormComponent;

  // ================= Pagination & Display Configurations =================
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector: boolean = true;
  showInfo: boolean = true;
  showNavButtons: boolean = true;

  // ================= State Variables =================
  initialized: boolean = false;
  isFilterOpened: boolean = false;
  isFilterRowVisible: boolean = false;
  isAddFormPopupOpened: boolean = false;
  isEditFormPopupOpened: boolean = false;

  // ================= Data & Selection =================
  currentPathName: string = '';
  selectedCptMaster: any;
  facilityGroupDatasource: any;

  // ================= Data Sources =================
  dataSource = new DataSource<any>({
    load: () =>
      new Promise((resolve, reject) => {
        this.dataService.get_CptMaster_List().subscribe({
          next: (response: any) => resolve(response.data),
          error: (error: any) => reject(error.message),
        });
      }),
  });

  // ================= Toolbar Configurations =================
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.show_new_Form());
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

  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
  ) {}

  // ================= Toolbar Action Methods =================
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;
    const grid = this.dataGrid?.instance;
    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
  };

  show_new_Form() {
    this.isAddFormPopupOpened = true;
  }

  refresh = () => {
    this.dataGrid?.instance?.refresh();
  };

  onExporting(event: any) {
    const fileName = 'Cpt_master';
    this.dataService.exportDataGrid(event, fileName);
  }

  // ================= Grid Action Methods =================
  openEditingStart(event: any) {
    event.cancel = true;
    const ID = event.data.ID;
    this.dataService.selectCptMaster(ID).subscribe((response: any) => {
      console.log(response, 'select!!!');
      this.selectedCptMaster = response.data[0];
      this.isEditFormPopupOpened = true;
    });
  }

  onRowRemoving(event: any) {
    event.cancel = true;
    const SelectedRow = event.key;

    this.dataService.Remove_CptMaster_Row_Data(SelectedRow.ID).subscribe({
      next: () => {
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
        event.component.refresh();
        this.dataGrid.instance.refresh();
      },
      error: () => {
        notify(
          {
            message: 'Delete operation failed',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'error',
        );
      },
    });
  }

  // ================= Form Save / Update Methods =================
  onClickSaveNewCptType = async () => {
    if (!this.CptNewFormComponent) {
      console.error('Child component not available');
      return;
    }

    this.CptNewFormComponent.newCptMasterData.selectedLedgerID =
      this.CptNewFormComponent.ledgerMode === 1
        ? this.CptNewFormComponent.selectedLedgerIds.join(',')
        : '';

    const {
      CPTTypeID,
      CPTCode,
      CPTName,
      Description,
      CPTGroup,
      DepartmentID,
      CPTDepartmentID,
      CostDepartmentID,
      ServiceCode,
      ServiceCategoryID,
      VATClassID,
      CostDriveID,
      FixedQuantity,
      IsDifferentCPTDepartment,
      IsDifferentLedger,
      selectedLedgerID,
      CPTEncounterDepartments,
      data,
    } = this.CptNewFormComponent.getNewCptMasterData();

    this.dataService
      .Insert_CptMaster_Data(
        CPTTypeID,
        CPTCode,
        CPTName,
        Description,
        CPTGroup,
        DepartmentID,
        CPTDepartmentID,
        CostDepartmentID,
        ServiceCode,
        ServiceCategoryID,
        VATClassID,
        CostDriveID,
        FixedQuantity,
        IsDifferentCPTDepartment,
        IsDifferentLedger,
        selectedLedgerID,
        CPTEncounterDepartments,
        data,
      )
      .subscribe((response: any) => {
        if (response && response.flag === '1') {
          this.dataGrid.instance.refresh();
          notify(
            {
              message: response.message || `New Cpt Master Saved Successfully`,
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.isAddFormPopupOpened = false;
          this.CptNewFormComponent.clearForm();
        } else {
          notify(
            {
              message: response?.message || `Your Data Not Saved`,
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      });
  };

  onClickUpdateNewCptType = () => {
    this.CptEditFormComponent.newCptMasterData.selectedLedgerID =
      this.CptEditFormComponent.ledgerMode === 1
        ? this.CptEditFormComponent.selectedLedgerIds.join(',')
        : '';

    const {
      ID,
      CPTTypeID,
      CPTCode,
      CPTName,
      Description,
      CPTGroup,
      DepartmentID,
      CPTDepartmentID,
      CostDepartmentID,
      ServiceCode,
      ServiceCategoryID,
      VATClassID,
      CostDriveID,
      FixedQuantity,
      IsDifferentCPTDepartment,
      IsDifferentLedger,
      selectedLedgerID,
      CPTEncounterDepartments,
      data,
    } = this.CptEditFormComponent.getUpdateCptMasterData();

    this.dataService
      .update_CptMaster_data(
        ID,
        CPTTypeID,
        CPTCode,
        CPTName,
        Description,
        CPTGroup,
        DepartmentID,
        CPTDepartmentID,
        CostDepartmentID,
        ServiceCode,
        ServiceCategoryID,
        VATClassID,
        CostDriveID,
        FixedQuantity,
        IsDifferentCPTDepartment,
        IsDifferentLedger,
        selectedLedgerID,
        CPTEncounterDepartments,
        data,
      )
      .subscribe((response: any) => {
        if (response && response.flag === '1') {
          this.dataGrid.instance.refresh();
          notify(
            {
              message: response.message || `Cpt Master Updated Successfully`,
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.isEditFormPopupOpened = false;
          this.resetCptForm();
        } else {
          notify(
            {
              message: response?.message || `Your Data Not Updated`,
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      });
  };

  // ================= Helper & Validation Methods =================
  fixedQtyFormat = (value: any) => {
    if (value === 0 || value === '0' || value == null) {
      return '';
    }
    return Number(value).toFixed(2);
  };

  resetCptForm() {
    this.CptNewFormComponent?.clearForm();
  }

  clearEditForm() {
    this.CptEditFormComponent?.clearForm();
  }

  validateCptForm = (): boolean => {
    return this.CptNewFormComponent?.validateForm();
  };

  validateCptEditForm = (): boolean => {
    return this.CptEditFormComponent?.validateForm();
  };
}

@NgModule({
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxDropDownButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxLookupModule,
    FormPopupModule,
    CptMasterNewFormModule,
    CptMasterEditFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [CPTMasterComponent],
})
export class CPTMasterModule {}
