import { Component, OnInit, NgModule, ViewChild, NgZone } from '@angular/core';
import { DxButtonModule, DxPopupModule } from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import {
  ReasonsFormComponent,
  ReasonsFormModule,
} from 'src/app/components/library/reasons-form/reasons-form.component';
import notify from 'devextreme/ui/notify';
import { LandedCostFormComponent } from 'src/app/components/library/landed-cost-form/landed-cost-form.component';
import { Console } from 'console';
import { ExportService } from 'src/app/services/export.service';
import { ReasonEditModule } from 'src/app/components/library/reason-edit/reason-edit/reason-edit.component';
import { RoutedConnectorViewModel } from '@devexpress/analytics-core/analytics-diagram';
import { Router } from '@angular/router';
@Component({
  selector: 'app-reasons-list',
  templateUrl: './reasons-list.component.html',
  styleUrls: ['./reasons-list.component.scss'],
})
export class ReasonsListComponent {
  @ViewChild(ReasonsFormComponent) reasonComponent: ReasonsFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('addForm') addFormComponent!: ReasonsFormComponent;
  @ViewChild('editForm') editFormComponent!: ReasonsFormComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  customer: any;
  reasons: any;
  stores: any;
  reasontype: any;
  discounttype: any;
  isAddReasonsPopupOpened = false;
  selectedRows: any[] = [];
  showFilterRow = false;
  showHeaderFilter = true;
  isEditReasonsPopupOpened: boolean = false;
  selected_Data: any;
  isFilterOpened = false;

  isEditMode: boolean = false;

  currentEditId: number | null = null;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;


  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private ngZone: NgZone,
    private router: Router
  ) {
    const payload = {
      NAME: 'REASONTYPES',
    };
    this.dataservice.getDropdownData(payload).subscribe((data) => {
      this.reasontype = data;
    });
    this.dataservice.getDropdownData('DISCOUNTTYPE').subscribe((data) => {
      this.discounttype = data;
    });
    const payloadstore = {
      NAME: 'STORE',
    };

    dataservice.getDropdownData(payloadstore).subscribe((data) => {
      this.stores = data;
    });
  }
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',

    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addReasons());
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
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.ngZone.run(() => this.refresh());
    },
    text: '',
  };
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
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
  onExporting(event: any) {
    this.exportService.onExporting(event, 'Reasons-list');
  }
  refresh() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      this.showReasons();
    }
  }
  addReasons() {
    this.isAddReasonsPopupOpened = true;
    this.reasonComponent.resetForm();
  }

  showReasons() {
    this.dataservice.getReasonsData().subscribe((response) => {
      this.reasons = response;

      console.log('type', this.reasontype);
    });
  }
  OnEditingStartReason(e: any) {
    e.cancel = true;
    const id = e.data.ID;
    this.isEditReasonsPopupOpened = true;
    this.dataservice.select_reason(id).subscribe((res: any) => {

      this.isEditMode = true;
      this.currentEditId = id;
      this.selected_Data = res;
    });
  }
  handleClose() {
    this.isEditReasonsPopupOpened = false;
    this.showReasons();
  }
  onSelectionChanged(e: any) {
    e.selectedRowKeys;
  }
  onClickSaveReasons() {

    const component = this.isEditMode
      ? this.editFormComponent
      : this.addFormComponent;

    const data = component.getNewReasonsData();

    console.log('FINAL DATA', data);

    const {
      CODE,
      DESCRIPTION,
      ARABIC_DESCRIPTION,
      START_DATE,
      END_DATE,
      REASON_TYPE,
      DISCOUNT_TYPE,
      AC_HEAD_ID,
      COMPANY_ID,
      DISCOUNT_PERCENT,
      REASON_STORES,
    } = data;

    const filteredReasons = this.isEditMode
      ? this.reasons.filter((x: any) => x.ID !== this.currentEditId)
      : this.reasons;

    const isCodeDuplicate = filteredReasons.some(
      (item: any) => item.CODE.toLowerCase() === CODE.toLowerCase()
    );

    const isDescriptionDuplicate = filteredReasons.some(
      (item: any) =>
        item.DESCRIPTION.toLowerCase() === DESCRIPTION.toLowerCase()
    );

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and Description already exist',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    } else if (isCodeDuplicate) {
      notify(
        {
          message: 'This Code already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    } else if (isDescriptionDuplicate) {
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
    console.log(data, '===========data============')
    console.log(data.REASON_STORES, '===========data============')

    // console.log(data.reason_stores,'===========data============')


    if (
      !data.REASON_STORES ||
      !REASON_STORES ||
      !Array.isArray(REASON_STORES) ||
      REASON_STORES.length === 0 ||
      REASON_STORES.every((x: any) => !x.STORE_ID || x.STORE_ID.toString().trim() === '')
    ) {
      notify(
        {
          message: 'At least one store should be selected',
          position: { at: 'top right', my: 'top right' },
          displayTime: 2000,
        },
        'error'
      );
      return;
    }

    if (this.isEditMode && this.currentEditId) {
      this.dataservice
        .Update_reason(
          data
        )
        .subscribe((response: any) => {
          if (response?.flag === '1') {
            notify(
              {
                message: 'Reason updated successfully',
                position: { at: 'top right', my: 'top right' },
              },
              'success'
            );

            this.isEditReasonsPopupOpened = false;
            this.showReasons();
          }
        });

      return;
    }


    this.dataservice
      .postReasonData(
        CODE,
        DESCRIPTION,
        ARABIC_DESCRIPTION,
        START_DATE,
        END_DATE,
        REASON_TYPE,
        DISCOUNT_TYPE,
        AC_HEAD_ID,
        DISCOUNT_PERCENT,
        REASON_STORES,
        COMPANY_ID,
      )
      .subscribe((response) => {
        if (response.flag === '1') {
          this.showReasons();
          this.isAddReasonsPopupOpened = false;

          notify(
            {
              message: 'Reason Saved Successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1000,
            },
            'success',
          );
        }
      });
  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const {
      ID,
      CODE,
      DESCRIPTION,
      ARABIC_DESCRIPTION,
      START_DATE,
      END_DATE,
      REASON_TYPE,
      DISCOUNT_TYPE,
      DISCOUNT_PERCENT,
      REASON_STORES,
    } = selectedRow;

    this.dataservice
      .removeReasons(
        ID,
        CODE,
        DESCRIPTION,
        ARABIC_DESCRIPTION,
        START_DATE,
        END_DATE,
        REASON_TYPE,
        DISCOUNT_TYPE,
        DISCOUNT_PERCENT,
        REASON_STORES,
      )
      .subscribe(() => {
        try {
          // Your delete logic here
          notify(
            {
              message: 'Delete operation successful',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.dataGrid.instance.refresh();
          this.showReasons();
        } catch (error) {
          notify(
            {
              message: 'Delete operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      });
  }
  ngOnInit(): void {

    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.showReasons();
  }
  onValueChangedReason(event: any) {
    console.log('customer', event);
    if (event.value === 1) {
      this.customer = true;
    } else {
      this.customer = false;
    }
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    ReasonsFormModule,
    ReasonEditModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [ReasonsListComponent],
})
export class ReasonsListModule { }
