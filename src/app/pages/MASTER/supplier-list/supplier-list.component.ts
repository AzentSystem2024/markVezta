import {
  Component,
  OnInit,
  NgModule,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
  Output,
  EventEmitter,
  NgZone,
} from '@angular/core';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxPopupModule,
} from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { DxTextBoxModule } from 'devextreme-angular';
import {
  SupplierFormComponent,
  SupplierFormModule,
} from 'src/app/components/library/supplier-form/supplier-form.component';
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { SupplierEditModule } from '../../supplier-edit/supplier-edit.component';
import DataSource from 'devextreme/data/data_source';
@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.scss'],
})
export class SupplierListComponent implements OnInit {
  @ViewChild(SupplierFormComponent) supplierComponent:
    | SupplierFormComponent
    | undefined;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent | undefined;
  @ViewChild(SupplierFormComponent) supplierForm!: SupplierFormComponent;
  @Output()
  editingStart = new EventEmitter<any>();
  @Output() formClosed = new EventEmitter<void>();
  selected_Company_id!: number;
  savedUserData: any;
  company_list: any = [];
  isFilterRowVisible: boolean = false;
  isFilterOpened = false;
  // dataGrid: DxDataGridComponent;
  width = '100vw';
  height = '100vh';
  SupplierDataSource: DataSource | undefined;
  supplierList: any[] = [];
  supplierRowCount = 0;
  isAddSupplierPopupOpened = false;
  currency: any;
  CountryDropdownData: any;
  StateDropdownData: any;
  PaymentTermsDropdownData: any;
  vatrule: any;
  showFilterRow = true;
  showHeaderFilter = true;
  isCurrencyAccepted: boolean = true;
  landedcost: any[] = [];
  costFactors: any[] = [];
  selectedLandedCosts: any;
  selectedSupplier: any;
  isEditSupplierPopupOpened: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  allButtonsEditDelete = [
    {
      name: 'edit',
      hint: 'Edit',
      icon: 'edit',
      visible: true,
      onClick: (e: any) => {
        this.selectSupplier(e.row.data.ID); // Pass the row's `id` to the function
      },
    },
    {
      name: 'delete',
      hint: 'Delete',
      icon: 'trash',
      visible: true,
    },
  ];

  //=================================refresh=============================
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  exportButtonOptions = {
    hint: 'Export',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn export-btn' },
    // onClick: () => this.exportToExcel(),
    template: () => `
    <div class="export-icon-wrap">
      <span class="iconify"
            data-icon="clarity:export-line"
            data-width="20"
            data-height="20"></span>

      <!-- DOWNWARD ARROW -->
      <span class="iconify"
            data-icon="grommet-icons:form-down"
            data-width="14"
            data-height="14"></span>
    </div>
  `,
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.showSupplier();
    }
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {
    this.sesstion_Details();
    dataservice.getCurrencyData().subscribe((data) => {
      this.currency = data;
    });
    const payload = {
      NAME: 'VATRULE',
      COMPANY_ID: this.selected_Company_id,
    };
    dataservice.getDropdownData(payload).subscribe((data) => {
      this.vatrule = data;
    });
  }
  // onExporting(event: any) {
  //   this.exportService.onExporting(event, 'Supplier-list');
  // }

  onExporting(event: any) {
    const fileName = 'supplier-list';
    this.dataservice.exportDataGrid(event, fileName);
  }

  private loadDropdownData(): void {
    this.dataservice.getDropdownData('LANDED_COST').subscribe((data) => {
      this.landedcost = data;
    });
  }

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addSupplier());
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

  addSupplier() {
    this.isAddSupplierPopupOpened = true;
  }

  showSupplier() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };

    this.SupplierDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getSupplierData(payload).subscribe({
            next: (response: any[]) => {
              const data = (response || []).map((item: any, index: number) => ({
                ...item,
                SNO: index + 1,
              }));

              this.supplierList = data; // cache array
              this.supplierRowCount = data.length;

              resolve(data); //  stop loader
            },
            error: () => {
              this.supplierList = [];
              this.supplierRowCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  onSelectionChanged(event: any): void {
    const selectedRows = event.selectedRowsData; // Get selected rows from grid
    this.selectedLandedCosts = selectedRows.map((row: any) => ({
      COST_ID: row.ID,
    })); // Format the selected costs
  }

  onClickSaveSupplier(): void {
    const newSupplierData = this.supplierComponent?.getNewSupplierData();

    if (!newSupplierData) {
      notify(
        {
          message: 'Supplier form not initialized',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
      );
      return;
    }

    const { STATE_ID, IS_INACTIVE, CURRENCY_ID } = newSupplierData;

    const isInactiveBoolean = IS_INACTIVE === 1 ? true : false;
    const currencyIdNumber = parseInt(CURRENCY_ID ?? '0'); // or use Number(CURRENCY_ID);
    const StateID = parseInt(STATE_ID ?? '0');

    const payload = {
      ...newSupplierData,
      COMPANY_ID: this.selected_Company_id,
      CURRENCY_ID: currencyIdNumber,
      STATE_ID: StateID,
      IS_INACTIVE: isInactiveBoolean,
    };
    this.dataservice.saveSupplierData(payload).subscribe((res: any) => {
      if (res.flag == 1) {
        notify(
          {
            message: 'Supplier added successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );

        this.dataGrid?.instance.refresh();
        this.isAddSupplierPopupOpened = false;
        this.formClosed.emit(); // tell parent to close
        this.showSupplier();

        //  Call child form reset
        this.supplierForm.resetPartialForm();
      } else {
        notify(
          {
            message: 'Insert functionality Faild',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      }
    });
  }

  onRowRemoving(event: any) {
    const id = event.data.ID;
    event.cancel = new Promise((resolve, reject) => {
      this.dataservice.removeSupplier(id).subscribe({
        next: () => {
          notify(
            {
              message: 'Delete operation successful',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.showSupplier();

          resolve(false); // allow delete → popup closes
        },
        error: () => {
          notify('Delete failed', 'error', 3000);
          reject(); // cancel delete
        },
      });
    });
  }

  onRowUpdating(event: any) {
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };

    this.dataservice.updateSupplier(combinedData).subscribe((data: any) => {
      if (data) {
        notify(
          {
            message: 'Supplier Updated Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success',
        );
        this.dataGrid?.instance.refresh();
        this.showSupplier();
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

  showCountry() {
    this.dataservice.getCountryData().subscribe((response) => {
      this.CountryDropdownData = response;
    });
  }

  showState() {
    this.dataservice.getStateData().subscribe((data: any) => {
      this.StateDropdownData = data;
    });
  }

  getPaymentTerms() {
    this.dataservice.getPaymentTermsData().subscribe((response) => {
      this.PaymentTermsDropdownData = response;
    });
  }

  openEditingStart(event: any) {
    event.cancel = true;
    this.editingStart.emit(event);

    const ID = event.data.ID;

    // Open the popup
    this.isEditSupplierPopupOpened = true;

    // Fetch the item data
    this.dataservice.selectSupplier(ID).subscribe((response: any) => {
      this.isEditSupplierPopupOpened = true;
      this.selectSupplier(response);
    });
  }

  selectSupplier(ID: number): void {
    if (!ID) {
      console.error('Invalid ID:', ID);
      return;
    }
    this.isEditSupplierPopupOpened = true;
    this.dataservice.selectSupplier(ID).subscribe((response: any) => {
      this.selectedSupplier = response;

      this.cdr.detectChanges();

      // Open the popup
    });
  }

  handleFormClosed() {
    this.isEditSupplierPopupOpened = false;
    this.isAddSupplierPopupOpened = false;
    this.dataGrid?.instance.refresh();
    this.showSupplier();
    if (this.supplierForm) {
      this.supplierForm.resetPartialForm(); // ✅ reset on close
    }
  }

  onCancelSupplier() {
    // reset first (child still alive)
    this.supplierForm?.resetPartialForm();
    // then close
    this.isAddSupplierPopupOpened = false;
  }

  ngOnInit(): void {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === '/supplier');
    console.log(packingRights, 'SUPPLIERPACKINGRIGHTSSSSSSSSSSSSSSSSSSSSSSS');
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.loadDropdownData();
    this.showSupplier();
    this.showCountry();
    this.showState();
    this.getPaymentTerms();
  }

  get_sessionstorage_data() {
    this.savedUserData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.company_list = this.savedUserData.Companies;
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    SupplierFormModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    SupplierEditModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [SupplierListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupplierListModule { }
