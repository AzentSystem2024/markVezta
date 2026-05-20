import { Component, OnInit, NgModule, ViewChild, NgZone } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { DxCheckBoxModule } from 'devextreme-angular';
import { DxRadioGroupModule } from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import {
  LandedCostFormComponent,
  LandedCostFormModule,
} from 'src/app/components/library/landed-cost-form/landed-cost-form.component';
import { ItemProperty1FormComponent } from 'src/app/components/library/item-property1-form/item-property1-form.component';
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';
import DataSource from 'devextreme/data/data_source';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landed-cost-list',
  templateUrl: './landed-cost-list.component.html',
  styleUrls: ['./landed-cost-list.component.scss'],
})
export class LandedCostListComponent implements OnInit {
  // @ViewChild(LandedCostFormComponent)
  // landedcostComponent!: LandedCostFormComponent;
  @ViewChild('addForm') addFormComponent!: LandedCostFormComponent;
  @ViewChild('editForm') editFormComponent!: LandedCostFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  currencyOptions = [
    { text: 'Local', value: true },
    { text: 'Supplier', value: false },
  ];
  amountOptions: any[] = [
    { text: 'Fixed Amount', value: true },
    { text: 'Percentage', value: false },
  ];
  isLocalCurrency: boolean = true;
  isFixedAmount: boolean = true;
  landedcost: any;
  isAddLandedcostPopupOpened = false;
  showFilterRow = true;
  showHeaderFilter = true;
  IS_INACTIVE: boolean = false;
  isFilterOpened = false;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;

  landedCostDataSource: any;

  editingRowData: any;

  isEditLandedcostPopupOpened: boolean = false;

  isEditMode: boolean = false;

  currentEditId: number | null = null;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;


  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new Landed Cost',
    onClick: () => this.addLandedcost(),
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
    onClick: () => {
      this.zone.run(() => this.refreshGrid());
    },
  };

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private zone: NgZone,
    private router: Router
  ) { }

  onEditingStart(e: any) {
    e.cancel = true;
    const id = e.data.ID;

    this.dataservice.selectLandedCost(id).subscribe((res: any) => {
      this.editingRowData = res;

      this.isEditMode = true;         // ✅ set edit mode
      this.currentEditId = id;

      console.log(this.editingRowData, "this.editingRowData")
      this.isEditLandedcostPopupOpened = true;
    });
  }

  onExporting(event: any) {
    this.exportService.onExporting(event, 'Landed_cost-list');
  }
  addLandedcost() {
    this.isEditMode = false;
    this.currentEditId = null;

    this.isAddLandedcostPopupOpened = true;
  }

  getStatus(): string {
    return this.IS_INACTIVE ? 'Inactive' : 'Active';
  }

  private loadDropdownData(): void {
    this.dataservice.getDropdownData('LANDED_COST').subscribe((data) => {
      this.landedcost = data;
      console.log(this.landedcost, 'LANDEDCOST');
    });
  }

  showLandedcost() {
    this.landedCostDataSource = new DataSource({
      load: () => {
        return new Promise((resolve) => {
          this.dataservice.getLandedcostData().subscribe((response: any) => {
            const data = response || []; // adjust if response.data

            resolve({
              data: data,
              totalCount: data.length
            });
          });
        });
      }
    });
  }

  // onClickSaveLandedcost() {
  //   // const {
  //   //   DESCRIPTION,
  //   //   IS_LOCAL_CURRENCY,
  //   //   IS_FIXED_AMOUNT,
  //   //   VALUE,
  //   //   COMPANY_ID,
  //   //   IS_INACTIVE,
  //   // } = this.landedcostComponent.getNewLandedcost();
  //   // console.log(
  //   //   'inserted data',
  //   //   DESCRIPTION,
  //   //   IS_LOCAL_CURRENCY,
  //   //   IS_FIXED_AMOUNT,
  //   //   VALUE,
  //   //   COMPANY_ID,
  //   //   IS_INACTIVE,
  //   // );

  //   const component = this.isEditMode
  //     ? this.editFormComponent
  //     : this.addFormComponent;

  //   const data = component.getNewLandedcost();

  //   console.log('FINAL DATA', data);

  //   const {
  //     DESCRIPTION,
  //     IS_LOCAL_CURRENCY,
  //     IS_FIXED_AMOUNT,
  //     VALUE,
  //     COMPANY_ID,
  //     IS_INACTIVE,
  //   } = data;

  //   if (this.isEditMode && this.currentEditId) {
  //     this.dataservice
  //       .updateLandedcostData(
  //         this.currentEditId,
  //         DESCRIPTION,
  //         IS_LOCAL_CURRENCY,
  //         IS_FIXED_AMOUNT,
  //         VALUE,
  //         COMPANY_ID,
  //         IS_INACTIVE
  //       )
  //       .subscribe((response: any) => {
  //         if (response?.flag === '1') {
  //           notify(
  //             {
  //               message: 'Landed Cost updated successfully',
  //               position: { at: 'top right', my: 'top right' },
  //             },
  //             'success'
  //           );

  //           this.isEditLandedcostPopupOpened = false;
  //           this.showLandedcost();
  //         }
  //       });

  //     return;
  //   }

  //   this.dataservice
  //     .postLandedcostData(
  //       DESCRIPTION,
  //       IS_LOCAL_CURRENCY,
  //       IS_FIXED_AMOUNT,
  //       VALUE,
  //       COMPANY_ID,
  //       IS_INACTIVE
  //     )
  //     .subscribe({
  //       next: (response: any) => {
  //         if (response?.flag === '1') {
  //           notify(
  //             {
  //               message: 'Landed Cost saved successfully',
  //               position: { at: 'top right', my: 'top right' },
  //             },
  //             'success'
  //           );

  //           this.showLandedcost();
  //           this.isAddLandedcostPopupOpened = false;
  //         } else {
  //           notify(
  //             {
  //               message: response?.message || 'Save failed',
  //               position: { at: 'top right', my: 'top right' },
  //             },
  //             'error'
  //           );
  //         }
  //       },
  //       error: () => {
  //         notify(
  //           {
  //             message: 'Server error while saving',
  //             position: { at: 'top right', my: 'top right' },
  //           },
  //           'error'
  //         );
  //       },
  //     });
  // }
  onClickSaveLandedcost() {
    const component = this.isEditMode
      ? this.editFormComponent
      : this.addFormComponent;

    const data = component.getNewLandedcost();

    console.log('FINAL DATA', data);

    const {
      DESCRIPTION,
      IS_LOCAL_CURRENCY,
      IS_FIXED_AMOUNT,
      VALUE,
      COMPANY_ID,
      IS_INACTIVE,
    } = data;

    // Get current grid data
    const list =
      this.landedCostDataSource?._items || [];

    // Duplicate check
    const duplicateItem = list.find((item: any) => {
      const sameDescription =
        item.DESCRIPTION?.trim().toLowerCase() ===
        DESCRIPTION?.trim().toLowerCase();

      // ADD MODE
      if (!this.isEditMode) {
        return sameDescription;
      }

      // EDIT MODE
      return (
        sameDescription &&
        item.ID !== this.currentEditId
      );
    });

    if (duplicateItem) {
      notify(
        {
          message: 'This Description already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );

      return;
    }

    // EDIT
    if (this.isEditMode && this.currentEditId) {
      this.dataservice
        .updateLandedcostData(
          this.currentEditId,
          DESCRIPTION,
          IS_LOCAL_CURRENCY,
          IS_FIXED_AMOUNT,
          VALUE,
          COMPANY_ID,
          IS_INACTIVE
        )
        .subscribe((response: any) => {
          if (response?.flag === '1') {
            notify(
              {
                message: 'Landed Cost updated successfully',
                position: { at: 'top right', my: 'top right' },
              },
              'success'
            );

            this.isEditLandedcostPopupOpened = false;
            this.showLandedcost();
          }
        });

      return;
    }

    // ADD
    this.dataservice
      .postLandedcostData(
        DESCRIPTION,
        IS_LOCAL_CURRENCY,
        IS_FIXED_AMOUNT,
        VALUE,
        COMPANY_ID,
        IS_INACTIVE
      )
      .subscribe({
        next: (response: any) => {
          if (response?.flag === '1') {
            notify(
              {
                message: 'Landed Cost saved successfully',
                position: { at: 'top right', my: 'top right' },
              },
              'success'
            );

            this.showLandedcost();
            this.isAddLandedcostPopupOpened = false;
          } else {
            notify(
              {
                message: response?.message || 'Save failed',
                position: { at: 'top right', my: 'top right' },
              },
              'error'
            );
          }
        },
        error: () => {
          notify(
            {
              message: 'Server error while saving',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        },
      });
  }

  onRowUpdating(event: any) {
    const updatedData = { ...event.oldData, ...event.newData };

    const {
      ID,
      DESCRIPTION,
      IS_LOCAL_CURRENCY,
      IS_FIXED_AMOUNT,
      VALUE,
      COMPANY_ID,
      IS_INACTIVE,
    } = updatedData;
    console.log(
      'inserted data',
      DESCRIPTION,
      IS_LOCAL_CURRENCY,
      IS_FIXED_AMOUNT,
      VALUE,
      COMPANY_ID,
      IS_INACTIVE,
    );
    this.dataservice
      .updateLandedcostData(
        ID,
        DESCRIPTION,
        IS_LOCAL_CURRENCY,
        IS_FIXED_AMOUNT,
        VALUE,
        COMPANY_ID,
        IS_INACTIVE,
      )
      .subscribe((response) => {
        if (response) {
          this.showLandedcost();
        }
      });
  }
  onRowRemoving(event: any) {
    const selectedRow = event.data;

    const {
      ID,
      DESCRIPTION,
      IS_LOCAL_CURRENCY,
      IS_FIXED_AMOUNT,
      VALUE,
      COMPANY_ID,
      IS_INACTIVE,
    } = selectedRow;

    event.cancel = new Promise((resolve, reject) => {
      this.dataservice
        .removeLandedcost(
          ID,
          DESCRIPTION,
          IS_LOCAL_CURRENCY,
          IS_FIXED_AMOUNT,
          VALUE,
          COMPANY_ID,
          IS_INACTIVE,
        )
        .subscribe({
          next: () => {
            notify(
              {
                message: 'Delete operation successful',
                position: { at: 'top right', my: 'top right' },
              },
              'success',
            );

            this.showLandedcost();

            resolve(false); // close delete popup
          },

          error: () => {
            notify(
              {
                message: 'Delete operation failed',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );

            reject(); // keep popup open
          },
        });
    });
  }

  selectLandedCostData(id: any) {
    this.dataservice.selectLandedCost(id).subscribe((response: any) => { });
  }
  ngOnInit(): void {

    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((child: any) => child.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.loadDropdownData();
    this.showLandedcost();
  }
  calculateStatus(rowData: any) {
    return rowData.IS_INACTIVE ? 'Inactive' : 'Active';
  }
  calculateCurrency(rowData: any) {
    return rowData.IS_LOCAL_CURRENCY ? 'Local' : 'Supplier';
  }
  calculateAmount(rowData: any) {
    return rowData.IS_FIXED_AMOUNT ? 'Fixed Amount' : 'Percentage';
  }

  refresh() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.showLandedcost();
  }
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.showLandedcost();
  }
  getStatusFlagClass(IS_INACTIVE: boolean): string {
    return IS_INACTIVE ? 'flag-red' : 'flag-green';
  }

}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    LandedCostFormModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    CommonModule
  ],
  providers: [],
  exports: [],
  declarations: [LandedCostListComponent],
})
export class LandedCostListModule { }
