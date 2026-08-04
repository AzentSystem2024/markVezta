import { Component, ViewChild, NgModule, NgZone } from '@angular/core';
import {
  DxButtonModule,
  DxDataGridModule,
  DxDataGridComponent,
  DxDropDownButtonModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxTextAreaModule,
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { CommonModule } from '@angular/common';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { DxLookupModule } from 'devextreme-angular';
import { Router, ActivatedRoute } from '@angular/router';
import {
  DenialNewFormComponent,
  DenialNewFormModule,
} from '../POPUP PAGES/denial-new-form/denial-new-form.component';

@Component({
  templateUrl: './denial-list.component.html',
  styleUrls: ['./denial-list.component.scss'],
  providers: [DataService],
})
export class DenialListComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;

  @ViewChild(DenialNewFormComponent, { static: false })
  denialComponent!: DenialNewFormComponent;

  isPanelOpened = false;

  isAddDenialPopupOpened = false;

  Denial_Type_DropDownData: any;
  Denial_Category_DropDownData: any;
  ID: any;
  isFilterOpened = true;
  //========Variables for Pagination ====================
  readonly allowedPageSizes: any = [20, 30, 40, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  //=================Fetchiong DataSource=====================
  dataSource = new DataSource<any>({
    load: () =>
      new Promise((resolve, reject) => {
        this.dataService.getDenialsData().subscribe({
          next: (res: any) => resolve(res.data),
          error: ({ message }) => reject(message),
        });
      }),
  });

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addDenial());
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
  isFilterRowVisible: boolean = false;

  GridSource: any;
  currentPathName: string = '';
  initialized: boolean = false;

  constructor(private dataService: DataService, private ngZone: NgZone,) {
    this.getDenial_DropDown();
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
  };

  //=====================Search on Each Column===========
  applyFilter() {
    this.GridSource.filter();
  }

  addDenial() {
    this.isAddDenialPopupOpened = true;
  }

  refresh = () => {
    this.dataGrid.instance.refresh();
  };

  checkDuplicateDenial = (e: any) => {
    return new Promise((resolve) => {
      const code = e.value;

      const exists = this.dataSource
        .items()
        .some(
          (item: any) => item.DenialCode === code && item.ID !== e.data?.ID,
        );

      resolve(!exists);
    });
  };

  //================Exporting Function=====================
  onExporting(event: any) {
    const fileName = 'Denial';
    this.dataService.exportDataGrid(event, fileName);
  }

  //=============Get Denial Type Drop dwn Data==============================
  getDenial_DropDown() {
    this.dataService.Get_GropDown('DENIALTYPE').subscribe((data: any) => {
      this.Denial_Type_DropDownData = data;
    });

    this.dataService.Get_GropDown('DENIALCATEGORY').subscribe((data: any) => {
      this.Denial_Category_DropDownData = data;
    });
  }
  //============ADD NEW DENIALS======================

  onClickSaveNewDenial = () => {
    const { DenialCode, Description, DenialTypeID, DenialCategoryID } =
      this.denialComponent.getNewDenialData();
    this.dataService
      .addDenial(DenialCode, Description, DenialTypeID, DenialCategoryID)
      .subscribe((result: any) => {
        if (result) {
          this.dataGrid.instance.refresh();
          notify(
            {
              message: `New Denial "${DenialCode} ${Description} ${DenialTypeID} ${DenialCategoryID}" saved Successfully`,
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.denialComponent.reset_NewDenialFormData();
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

  //====================Update Denial Row Data==============
  onRowUpdating(event: any) {
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };
    let id = combinedData.ID;
    let code = combinedData.DenialCode;
    let Description = combinedData.Description;
    let DenialTypeID = combinedData.DenialTypeID;
    let DenialCategoryID = combinedData.DenialCategoryID;

    this.dataService
      .updateDenial(id, code, Description, DenialTypeID, DenialCategoryID)
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: `New Denial updated Successfully`,
              position: { at: 'top center', my: 'top center' },
              displayTime: 500,
            },
            'success',
          );
        } else {
          notify(
            {
              message: `Your Data Not Saved`,
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'error',
          );
        }
        // event.component.refresh();
        event.component.cancelEditData(); // Close the popup
        this.dataGrid.instance.refresh();
      });

    event.cancel = true; // Prevent the default update operation
  }

  // =================Remove Denial=========================
  onRowRemoving(event: any) {
    event.cancel = true;
    var SelectedRow = event.key;
    this.dataService.removeDenial(SelectedRow.ID).subscribe(() => {
      try {
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );

        // window.location.reload();
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
}

@NgModule({
  imports: [
    DxButtonModule,
    DxDataGridModule,
    DxDropDownButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxLookupModule,
    DxTextAreaModule,
    DenialNewFormModule,
    FormPopupModule,
    CommonModule,
  ],
  providers: [],
  exports: [],
  declarations: [DenialListComponent],
})
export class DenialListModule { }
