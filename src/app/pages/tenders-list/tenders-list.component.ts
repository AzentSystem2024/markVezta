import { Component, OnInit, NgModule, ViewChild } from '@angular/core';
import { DxButtonModule, DxTextAreaModule } from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import {
  TendersFormComponent,
  TendersFormModule,
} from 'src/app/components/library/tenders-form/tenders-form.component';
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';
import { DxCheckBoxModule } from 'devextreme-angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tenders-list',
  templateUrl: './tenders-list.component.html',
  styleUrls: ['./tenders-list.component.scss'],
})
export class TendersListComponent implements OnInit {
  @ViewChild(TendersFormComponent) tendersComponent!: TendersFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  @ViewChild('addForm') addFormComponent!: TendersFormComponent;
  @ViewChild('editForm') editFormComponent!: TendersFormComponent;
  supplier: any;
  tenders: any;
  currencyList: any;
  VATRuleDropdownData: any;
  TenderTypeDropdownData: any;
  showFilterRow = false;
  showHeaderFilter = true;
  isAddTendersPopupOpened = false;

  isEditTendersPopupOpened: boolean = false;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;

  isEditMode: boolean = false;

  currentEditId: number | null = null;

  editingRowData: any;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => this.addTenders(),
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

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private router: Router
  ) { }
  onExporting(event: any) {
    this.exportService.onExporting(event, 'Tenders-list');
  }
  addTenders() {
    this.isAddTendersPopupOpened = true;
    this.tendersComponent.ResetFuction()
    this.isEditMode = false;

  }

  showTenders() {
    this.dataservice.getTendersData().subscribe((response) => {
      this.tenders = response;
    });
  }

  onClickSaveTenders() {
    const component = this.isEditMode
      ? this.editFormComponent
      : this.addFormComponent;
    console.log(component, '=======================type of components===================')

    const data = component.getNewTenderData();

    console.log('FINAL DATA', data);

    const {
      CODE,
      IS_INACTIVE,
      DESCRIPTION,
      ARABIC_DESCRIPTION,
      TENDER_TYPE,
      DISPLAY_ORDER,
      CURRENCY_ID,
      ALLOW_OPENING,
      ALLOW_DECLARATION,
      ADDITIONAL_INFO_REQUIRED,
    } = data;

    if (this.isEditMode && this.currentEditId) {
      this.dataservice.updateTenders(data).subscribe((response: any) => {
        if (response?.flag === '1') {
          notify(
            {
              message: 'Tender updated successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );

          this.isEditTendersPopupOpened = false;
          this.showTenders();
        }
      });

      return;
    }

    this.dataservice
      .postTendersData(
        CODE,
        IS_INACTIVE,
        DESCRIPTION,
        ARABIC_DESCRIPTION,
        TENDER_TYPE,
        DISPLAY_ORDER,
        CURRENCY_ID,
        ALLOW_OPENING,
        ALLOW_DECLARATION,
        ADDITIONAL_INFO_REQUIRED,
      )
      .subscribe((response) => {
        if (response?.flag === '1') {
          notify(
            {
              message: 'Tender added successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );

          this.isAddTendersPopupOpened = false;
          this.showTenders();
        }
      });
  }
  onRowRemoving(event: any) {
    const selectedRow = event.data;
    const {
      ID,
      CODE,
      IS_INACTIVE,
      DESCRIPTION,
      ARABIC_DESCRIPTION,
      TENDER_TYPE,
      DISPLAY_ORDER,
      CURRENCY_ID,
      ALLOW_OPENING,
      ALLOW_DECLARATION,
      ADDITIONAL_INFO_REQUIRED,
    } = selectedRow;

    this.dataservice
      .removeTenders(
        ID,
        CODE,
        IS_INACTIVE,
        DESCRIPTION,
        ARABIC_DESCRIPTION,
        TENDER_TYPE,
        DISPLAY_ORDER,
        CURRENCY_ID,
        ALLOW_OPENING,
        ALLOW_DECLARATION,
        ADDITIONAL_INFO_REQUIRED,
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
          this.showTenders();
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

  getVATRuleDropDown() {
    this.dataservice.getCurrencyData().subscribe((data: any) => {
      this.VATRuleDropdownData = data;
      console.log('dropdownCurrency', this.VATRuleDropdownData);
    });
  }
  onRowUpdating(event) {
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };

    this.dataservice.updateTenders(combinedData).subscribe((data: any) => {
      if (data) {
        notify(
          {
            message: 'Tenders Updated Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success',
        );
        this.dataGrid.instance.refresh();
        this.showTenders();
      } else {
        notify(
          {
            message: 'Your Data Not Saved',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      }
    });

    event.cancel = true; // Prevent the default update operation
  }

  onEditingRow(e: any) {
    e.cancel = true;
    const id = e.data.ID;

    this.dataservice.selectTenders(id).subscribe((res: any) => {
      this.editingRowData = res;

      this.isEditMode = true;
      this.currentEditId = id;

      console.log(this.editingRowData, 'this.editingRowData');
      this.isEditTendersPopupOpened = true;
    });
  }

  getCurrencyData() {
    this.dataservice.getCurrencyData().subscribe((data: any) => {
      this.currencyList = data;
    });
  }
  getTenderTypeDropDown() {
    const dropdowntender = 'TENDERTYPE';
    this.dataservice.getDropdownData(dropdowntender).subscribe((data: any) => {
      this.TenderTypeDropdownData = data;
    });
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

    this.showTenders();
    this.getCurrencyData();
    this.getTenderTypeDropDown();
  }

  toggleFilters() {
    this.showFilterRow = !this.showFilterRow;
    this.showHeaderFilter = this.showFilterRow;

    const grid = this.dataGrid?.instance;

    if (grid) {
      grid.option('filterRow.visible', this.showFilterRow);
      grid.option('headerFilter.visible', this.showHeaderFilter);
    }
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
    }
    this.showTenders(); // reload API
  }
  getStatusFlagClass(status: string): string {
    return status === 'Inactive'
      ? 'flag-red'
      : 'flag-green';
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    TendersFormModule,
    DxCheckBoxModule,
    CommonModule
  ],
  providers: [],
  exports: [],
  declarations: [TendersListComponent],
})
export class TendersListModule { }
