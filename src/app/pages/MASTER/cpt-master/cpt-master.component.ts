import { CommonModule } from '@angular/common';
import {
  Component,
  NgModule,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
// import { ReportService } from 'src/app/services/Report-data.service';
import notify from 'devextreme/ui/notify';

import DataSource from 'devextreme/data/data_source';
import { ActivatedRoute, Router } from '@angular/router';
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
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;

  @ViewChild(CptMasterNewFormComponent)
  CptNewFormComponent!: CptMasterNewFormComponent;

  @ViewChild(CptMasterEditFormComponent, { static: false })
  CptEditFormComponent!: CptMasterEditFormComponent;

  //========Variables for Pagination ====================
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  facilityGroupDatasource: any;
  isAddFormPopupOpened: boolean = false;
  isEditFormPopupOpened: boolean = false;
  selectedCptMaster: any;

  dataSource = new DataSource<any>({
    load: () =>
      new Promise((resolve, reject) => {
        this.dataService.get_CptMaster_List().subscribe({
          next: (response: any) => resolve(response.data), // Resolve with the data
          error: (error: any) => reject(error.message), // Reject with the error message
        });
      }),
  });

  addButtonOptions: any;

  isFilterRowVisible: boolean = false;
  currentPathName: string = '';
  initialized: boolean = false;

  constructor(private dataService: DataService) {
    this.addButtonOptions = {
      text: 'New',
      icon: 'bi bi-plus-circle',
      type: 'default',
      stylingMode: 'contained',
      hint: 'Add new entry',
      onClick: () => this.show_new_Form(), // use your actual method here
      elementAttr: { class: 'add-button' },
    };
  }

  //=========================show new popup=========================
  show_new_Form() {
    this.isAddFormPopupOpened = true;
  }
  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
  };

  openEditingStart(event: any) {
    event.cancel = true;
    const ID = event.data.ID;
    this.dataService.selectCptMaster(ID).subscribe((response: any) => {
      console.log(response, 'select!!!');
      this.selectedCptMaster = response.data[0];
      this.isEditFormPopupOpened = true;
    });
  }

  //======= Add data ==========
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
        CostDriveID,
        FixedQuantity,
        IsDifferentCPTDepartment,
        IsDifferentLedger,
        selectedLedgerID,
        CPTEncounterDepartments,
        data,
      )
      .subscribe((response: any) => {
        if (response) {
          this.dataGrid.instance.refresh();
          notify(
            {
              message: `New Cpt Master Saved Successfully`,
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.CptNewFormComponent.clearForm();
        } else {
          notify(
            {
              message: `Your Data Not Saved`,
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      });
  };

  //======= Update data ==========
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
        CostDriveID,
        FixedQuantity,
        IsDifferentCPTDepartment,
        IsDifferentLedger,
        selectedLedgerID,
        CPTEncounterDepartments,
        data,
      )
      .subscribe((response: any) => {
        if (response) {
          this.dataGrid.instance.refresh();
          notify(
            {
              message: `Cpt Master Updated Successfully`,
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.resetCptForm();
        } else {
          notify(
            {
              message: `Your Data Not Updated`,
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      });
  };

  //====================Row Data Deleting========================
  onRowRemoving(event: any) {
    event.cancel = true;
    let SelectedRow = event.key;
    this.dataService.Remove_CptMaster_Row_Data(SelectedRow.ID).subscribe(() => {
      try {
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
      } catch (error) {
        notify(
          {
            message: 'Delete operation failed',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'error',
        );
      }
      event.component.refresh();
      this.dataGrid.instance.refresh();
    });
  }

  fixedQtyFormat = (value: any) => {
    if (value === 0 || value === '0' || value == null) {
      return '';
    }
    return Number(value).toFixed(2);
  };

  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'Cpt_master';
    this.dataService.exportDataGrid(event, fileName);
  }

  //=================== Page refreshing==========================
  refresh = () => {
    this.dataGrid.instance.refresh();
  };
  resetCptForm() {
    this.CptNewFormComponent.clearForm();
  }

  clearEditForm() {
    this.CptEditFormComponent.clearForm();
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
    DxDataGridModule,
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
