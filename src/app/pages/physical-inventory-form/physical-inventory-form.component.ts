import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxTagBoxModule,
  DxDataGridComponent,
  DxTagBoxComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { SalesOrderFormComponent } from '../sales-order-form/sales-order-form.component';
import { AddInvoiceComponent } from '../INVOICE/add-invoice/add-invoice.component';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-physical-inventory-form',
  templateUrl: './physical-inventory-form.component.html',
  styleUrls: ['./physical-inventory-form.component.scss'],
})
export class PhysicalInventoryFormComponent {
  @ViewChild('fileInput', { static: false }) fileInput: any;
  @ViewChild('supplierTagBox', { static: false })
  supplierTagBox!: DxTagBoxComponent;
  @ViewChild('departmentTagBox', { static: false })
  departmentTagBox!: DxTagBoxComponent;
  @ViewChild('brandTagBox', { static: false })
  brandTagBox!: DxTagBoxComponent;
  @ViewChild('categoryTagBox', { static: false })
  categoryTagBox!: DxTagBoxComponent;
  @Input() filterData: any;
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(AddInvoiceComponent) addInvoiceComp!: AddInvoiceComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  @ViewChild('quotationGrid', { static: false }) quotationGrid: any;
  isApproved: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  supplier: any;
  inventoryFormData: any = {
    ID: 0,
    COMPANY_ID: 0,
    FIN_ID: 0,
    STORE_ID: 0,
    PHYSICAL_NO: '',
    PHYSICAL_DATE: '',
    SUPP_ID: 0,
    DEPT_ID: 0,
    CAT_ID: 0,
    BRAND_ID: 0,
    REASON_ID: 0,
    REASON_NAME: '',
    REFERENCE_NO: '',
    TRANS_ID: 0,
    USER_ID: 0,
    NARRATION: '',
    STATUS: 0,
    Details: [
      {
        ID: 0,
        COMPANY_ID: 0,
        STORE_ID: 0,
        PHYSICAL_ID: 0,
        ITEM_ID: 0,
        ITEM_CODE: '',
        ITEM_NAME: '',
        QTY_OH: 0,
        COST: 0,
        QTY_COUNT: 0,
        ADJUSTED_QTY: 0,
        BATCH_NO: '',
        EXPIRY_DATE: new Date(),
      },
    ],
  };
  countryCode: any;
  salesOrderFormData: any;
  matrixCode: any;
  userID: any;
  finID: any;
  companyID: any;
  storeFromSession: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  department: any;
  brand: any;
  category: any;
  store: any;
  history: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.isEditDataAvailable();

    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    if (menuResponse.DEFAULT_COUNTRY_CODE) {
      this.countryCode = menuResponse.DEFAULT_COUNTRY_CODE.startsWith('+')
        ? menuResponse.DEFAULT_COUNTRY_CODE
        : '+' + menuResponse.DEFAULT_COUNTRY_CODE;
    }

    this.matrixCode = menuResponse.GeneralSettings.ENABLE_MATRIX_CODE;

    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
    console.log(this.storeFromSession, 'STOREFROMSESSION');
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/quotation');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
      // this.getItemsList();
    } else {
      // this.getItemsList();
    }

    if (this.filterData) {
      if (this.filterData.ALL_ITEMS) {
        // ✅ If "All Items" is checked
        this.loadAllItems();
      } else {
        // ✅ Otherwise, apply filters
        this.loadFilteredItems(this.filterData);
      }
    }
    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    this.getInventoryHistoryList();
    this.getVoucherNo();
  }

  loadAllItems() {
    const payload = {
      STORE_ID: this.storeFromSession,
    };
    this.dataService
      .getItemsForInventory(payload)
      .subscribe((response: any) => {
        console.log(response);
        if (response?.Data?.length) {
          this.inventoryFormData.Details = response.Data.map((item: any) => ({
            ITEM_ID: item.ITEM_ID,
            ITEM_CODE: item.ITEM_CODE,
            DESCRIPTION: item.DESCRIPTION,
            STOCK_QTY: item.STOCK_QTY,
            QTY_COUNTED: null,
            COUNT_TIME: null,
          }));
        } else {
          this.inventoryFormData.Details = [];
        }
      });
  }

  loadFilteredItems(filter: any) {
    const payload = { FilterIds: [] as any[] };

    // ✅ Build the FilterIds dynamically
    if (filter.DEPT_ID?.length) {
      filter.DEPT_ID.forEach((id: number) => {
        payload.FilterIds.push({ FilterType: 'Dept', Id: id });
      });
    }

    if (filter.BRAND_ID?.length) {
      filter.BRAND_ID.forEach((id: number) => {
        payload.FilterIds.push({ FilterType: 'Brand', Id: id });
      });
    }

    if (filter.CAT_ID?.length) {
      filter.CAT_ID.forEach((id: number) => {
        payload.FilterIds.push({ FilterType: 'Category', Id: id });
      });
    }

    if (filter.SUPPLIER_ID?.length) {
      filter.SUPPLIER_ID.forEach((id: number) => {
        payload.FilterIds.push({ FilterType: 'Supplier', Id: id });
      });
    }

    console.log('Payload for filter:', payload);

    // 🚫 If no filter selected → clear grid and stop here
    if (payload.FilterIds.length === 0) {
      this.inventoryFormData.Details = [];
      console.log('No filters selected → grid cleared.');
      return;
    }

    // ✅ Fetch items from API
    this.dataService.getFilteredItemsForInventory(payload).subscribe({
      next: (response: any) => {
        if (response?.Data?.length) {
          this.inventoryFormData.Details = response.Data.map((item: any) => ({
            ITEM_ID: item.ItemId,
            ITEM_CODE: item.ItemCode,
            DESCRIPTION: item.Description,
            STOCK_QTY: item.StockQty,
            QTY_COUNTED: null,
            COUNT_TIME: null,
          }));
        } else {
          this.inventoryFormData.Details = [];
        }

        console.log(
          'Mapped Inventory Details:',
          this.inventoryFormData.Details
        );
      },
      error: (err) => {
        console.error('Error fetching filtered items:', err);
        this.inventoryFormData.Details = [];
      },
    });
  }

  // component.ts
  onEditorPreparing(e: any) {
    if (e.dataField === 'QTY_COUNTED') {
      e.editorOptions = e.editorOptions || {};

      // Let the editor inherit row height naturally (no fixed height)
      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      // Make sure the input fits snugly inside
      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      // Remove spin buttons to prevent layout changes
      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }
    }
    if (e.parentType === 'dataRow' && e.dataField === 'QTY_COUNTED') {
      const prev = e.editorOptions?.onValueChanged;
      e.editorOptions = e.editorOptions || {};

      e.editorOptions.onValueChanged = (ev: any) => {
        if (typeof prev === 'function') prev(ev);

        const val = ev.value;
        if (val !== null && val !== undefined && val !== '') {
          const now = new Date();

          // Manual formatting
          const day = String(now.getDate()).padStart(2, '0');
          const month = String(now.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
          const year = now.getFullYear();

          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const seconds = String(now.getSeconds()).padStart(2, '0');

          const formatted = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

          // Update COUNT_TIME
          if (e.row && typeof e.row.rowIndex === 'number') {
            e.component.cellValue(e.row.rowIndex, 'COUNT_TIME', formatted);
          } else if (e.row && e.row.data) {
            e.row.data.COUNT_TIME = formatted;
            e.component.refresh(true);
          }
        } else {
          // Clear COUNT_TIME if Qty Counted is cleared
          if (e.row && typeof e.row.rowIndex === 'number') {
            e.component.cellValue(e.row.rowIndex, 'COUNT_TIME', null);
          } else if (e.row && e.row.data) {
            e.row.data.COUNT_TIME = null;
            e.component.refresh(true);
          }
        }
      };
    }
  }

  onRowRemoving(e: any) {
    // e.data contains the row being deleted
    const deletedItem = e.data;

    // Remove it from the Details array manually
    this.inventoryFormData.Details = this.inventoryFormData.Details.filter(
      (item: any) => item.ITEM_ID !== deletedItem.ITEM_ID
    );

    console.log('Row deleted:', deletedItem);
    console.log('Updated Details:', this.inventoryFormData.Details);

    // Refresh grid if needed
    this.itemsGridRef.instance.option('dataSource', [
      ...this.inventoryFormData.Details,
    ]);
  }

  calculateSerialNumber() {}
  isEditDataAvailable() {
    // 🔹 Check if edit mode is active and data is passed in
    if (this.isEditing && this.EditingResponseData) {
      console.log('Edit Mode Active:', this.EditingResponseData);

      const editData = this.EditingResponseData;

      // 🧩 Assign header-level data
      this.inventoryFormData = {
        ID: editData.ID || 0,
        COMPANY_ID: editData.COMPANY_ID || this.companyID,
        FIN_ID: editData.FIN_ID || this.finID,
        STORE_ID: editData.STORE_ID || this.storeFromSession,
        PHYSICAL_NO: editData.PHYSICAL_NO || '',
        PHYSICAL_DATE: editData.PHYSICAL_DATE || new Date(),
        SUPP_ID: editData.SUPP_ID || 0,
        DEPT_ID: editData.DEPT_ID || 0,
        CAT_ID: editData.CAT_ID || 0,
        BRAND_ID: editData.BRAND_ID || 0,
        REASON_ID: editData.REASON_ID || 0,
        REASON_NAME: editData.REASON_NAME || '',
        REFERENCE_NO: editData.REFERENCE_NO || '',
        TRANS_ID: editData.TRANS_ID || 0,
        USER_ID: editData.USER_ID || this.userID,
        NARRATION: editData.NARRATION || '',
        STATUS: editData.STATUS || 1,
        Details: [],
      };

      // 🧾 If the response already includes details (items list)
      if (editData.Details && Array.isArray(editData.Details)) {
        this.inventoryFormData.Details = editData.Details.map((d: any) => ({
          ID: d.ID || 0,
          COMPANY_ID: d.COMPANY_ID || this.companyID,
          STORE_ID: d.STORE_ID || this.storeFromSession,
          PHYSICAL_ID: d.PHYSICAL_ID || editData.ID || 0,
          ITEM_ID: d.ITEM_ID || 0,
          ITEM_CODE: d.ITEM_CODE || '',
          DESCRIPTION: d.ITEM_NAME || d.DESCRIPTION || '', // ✅ grid expects DESCRIPTION
          MATRIX_CODE: d.MATRIX_CODE || '',
          STOCK_QTY: d.QTY_OH || d.STOCK_QTY || 0, // ✅ grid expects STOCK_QTY
          QTY_COUNTED: d.QTY_COUNT || d.QTY_COUNTED || 0, // ✅ grid expects QTY_COUNTED
          COUNT_TIME: this.getCurrentDateTime(),
          COST: d.COST || 0,
          ADJUSTED_QTY:
            (d.QTY_COUNT || d.QTY_COUNTED || 0) -
            (d.QTY_OH || d.STOCK_QTY || 0),
          BATCH_NO: d.BATCH_NO || '',
          EXPIRY_DATE: d.EXPIRY_DATE ? new Date(d.EXPIRY_DATE) : null,
        }));
      }

      // 🧠 Force Angular to detect changes for bound controls
      this.cdr.detectChanges();

      console.log(
        '🟢 Inventory Form Data loaded for edit:',
        this.inventoryFormData
      );
    } else {
      // 🚀 Add Mode (initialize defaults)
      console.log('Add Mode - No edit data available');
      this.inventoryFormData = {
        ...this.inventoryFormData,
        COMPANY_ID: this.companyID,
        FIN_ID: this.finID,
        STORE_ID: this.storeFromSession,
        USER_ID: this.userID,
        PHYSICAL_DATE: new Date(),
        STATUS: 1,
        Details: [],
      };
    }
  }

  getCurrentDateTime(): string {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }

  formatCountTime(expiryDate: any): string {
    if (!expiryDate) return '';
    const date = new Date(expiryDate);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onImportExcel() {
    this.fileInput.nativeElement.click();
  }
  // onFileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onload = (e: any) => {
  //     const data = new Uint8Array(e.target.result);
  //     const workbook = XLSX.read(data, { type: 'array' });
  //     const firstSheetName = workbook.SheetNames[0];
  //     const worksheet = workbook.Sheets[firstSheetName];

  //     // Convert Excel to JSON
  //     const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, {
  //       defval: '',
  //     });

  //     const barcodes = excelData
  //       .map((row) => String(row['Barcode']).trim())
  //       .filter((b) => b && b !== 'undefined' && b !== 'null');

  //     if (barcodes.length === 0) {
  //       alert('No barcodes found in the Excel file.');
  //       return;
  //     }

  //     const payload = { BarCodes: barcodes };

  //     this.dataService.getItemsForInventoryExcelUpload(payload).subscribe(
  //       (response: any) => {
  //         if (response?.Data?.length) {
  //           // Existing barcode set
  //           const existingCodes = new Set(
  //             this.inventoryFormData.Details.filter(
  //               (d: any) => d.ITEM_CODE
  //             ).map((d: any) => d.ITEM_CODE.trim())
  //           );

  //           const duplicates: string[] = [];
  //           const newItems: any[] = [];

  //           response.Data.forEach((item: any) => {
  //             const match = excelData.find(
  //               (row) => String(row['Barcode']).trim() === item.Barcode
  //             );

  //             const itemCode = item.ItemCode || '';
  //             if (existingCodes.has(itemCode.trim())) {
  //               duplicates.push(itemCode);
  //             } else {
  //               newItems.push({
  //                 ITEM_ID: item.ItemId || 0,
  //                 ITEM_CODE: itemCode,
  //                 DESCRIPTION: item.ItemName || '',
  //                 MATRIX_CODE: item.MatrixCode || '',
  //                 STOCK_QTY: item.QtyStock || 0,
  //                 QTY_COUNTED: match ? match['Quantity'] || 0 : 0,
  //                 COUNT_TIME: this.getCurrentDateTime(),
  //               });
  //               existingCodes.add(itemCode.trim()); // mark as added
  //             }
  //           });

  //           // Notify if duplicates found
  //           if (duplicates.length) {
  //             notify(
  //               `Duplicate barcodes skipped: ${duplicates.join(', ')}`,
  //               'warning',
  //               5000
  //             );
  //           }

  //           // Add new items to grid
  //           this.inventoryFormData.Details.push(...newItems);

  //           // Refresh grid
  //           this.itemsGridRef.instance.option('dataSource', [
  //             ...this.inventoryFormData.Details,
  //           ]);
  //           this.itemsGridRef.instance.refresh();

  //           console.log(
  //             '✅ Final merged items:',
  //             this.inventoryFormData.Details
  //           );
  //         } else {
  //           notify(
  //             'No matching items found for given barcodes.',
  //             'warning',
  //             5000
  //           );
  //         }
  //       },
  //       (error) => {
  //         console.error('Error fetching items:', error);
  //         alert('Failed to fetch items from the server.');
  //       }
  //     );
  //   };

  //   reader.readAsArrayBuffer(file);
  //   event.target.value = ''; // reset file input
  // }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert Excel to JSON
      const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
      });

      const barcodes = excelData
        .map((row) => String(row['Barcode']).trim())
        .filter((b) => b && b !== 'undefined' && b !== 'null');

      if (barcodes.length === 0) {
        alert('No barcodes found in the Excel file.');
        return;
      }

      const payload = { BarCodes: barcodes };

      this.dataService.getItemsForInventoryExcelUpload(payload).subscribe(
        (response: any) => {
          if (response?.Data?.length) {
            // --- Prepare filter sets ---
            const deptSet = new Set(this.filterData?.DEPT_ID || []);
            const brandSet = new Set(this.filterData?.BRAND_ID || []);
            const catSet = new Set(this.filterData?.CAT_ID || []);
            const supplierSet = new Set(this.filterData?.SUPPLIER_ID || []);

            // --- Filter API response based on selected filters ---
            const filteredResponse = response.Data.filter((item: any) => {
              const deptMatch = !deptSet.size || deptSet.has(item.DeptId);
              const brandMatch = !brandSet.size || brandSet.has(item.Brand_Id);
              const catMatch = !catSet.size || catSet.has(item.CatId);
              const supplierMatch =
                !supplierSet.size || supplierSet.has(item.SuppId);

              return deptMatch && brandMatch && catMatch && supplierMatch;
            });

            if (!filteredResponse.length) {
              notify('No items matched the selected filters.', 'warning', 5000);
              return;
            }

            // --- Merge with existing grid items ---
            const existingCodes = new Set(
              this.inventoryFormData.Details.filter(
                (d: any) => d.ITEM_CODE
              ).map((d: any) => d.ITEM_CODE.trim())
            );

            const duplicates: string[] = [];
            const newItems: any[] = [];

            filteredResponse.forEach((item: any) => {
              const match = excelData.find(
                (row) => String(row['Barcode']).trim() === item.Barcode
              );

              const itemCode = item.ItemCode || '';
              if (existingCodes.has(itemCode.trim())) {
                duplicates.push(itemCode);
              } else {
                newItems.push({
                  ITEM_ID: item.ItemId || 0,
                  ITEM_CODE: itemCode,
                  DESCRIPTION: item.ItemName || '',
                  MATRIX_CODE: item.MatrixCode || '',
                  STOCK_QTY: item.QtyStock || 0,
                  QTY_COUNTED: match ? match['Quantity'] || 0 : 0,
                  COUNT_TIME: this.getCurrentDateTime(),
                });
                existingCodes.add(itemCode.trim());
              }
            });

            // Notify duplicates
            if (duplicates.length) {
              notify(
                `Duplicate barcodes skipped: ${duplicates.join(', ')}`,
                'warning',
                5000
              );
            }

            // Add new items to grid
            this.inventoryFormData.Details.push(...newItems);

            // Refresh DevExtreme grid
            this.itemsGridRef.instance.option('dataSource', [
              ...this.inventoryFormData.Details,
            ]);
            this.itemsGridRef.instance.refresh();

            console.log(
              '✅ Final merged items:',
              this.inventoryFormData.Details
            );
          } else {
            notify(
              'No matching items found for given barcodes.',
              'warning',
              5000
            );
          }
        },
        (error) => {
          console.error('Error fetching items:', error);
          alert('Failed to fetch items from the server.');
        }
      );
    };

    reader.readAsArrayBuffer(file);
    event.target.value = ''; // reset file input
  }

  onDownloadExcel() {
    // Define empty data with just headers
    const data = [
      { Barcode: '', Quantity: '' }, // Empty row (optional, or just header)
    ];

    // Convert to worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      header: ['Barcode', 'Quantity'],
    });

    // Create workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Write workbook and trigger download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      'EmptyTemplate.xlsx'
    );
  }

  calculateVariance = (rowData: any) => {
    const stock = Number(rowData.STOCK_QTY) || 0;
    const counted = Number(rowData.QTY_COUNTED) || 0;
    return counted - stock;
  };

  getInventoryHistoryList() {
    this.dataService
      .getPhysicalInventoryHistory()
      .subscribe((response: any) => {
        this.history = response.Data;
      });
  }
  saveInventory() {
    // 🧩 Basic validation
    if (!this.inventoryFormData.PHYSICAL_DATE) {
      notify(
        {
          message: 'Please select Physical Date',
          type: 'error',
          displayTime: 2000,
        },
        'error'
      );
      return;
    }

    if (!this.storeFromSession) {
      notify(
        {
          message: 'Store is missing from session',
          type: 'error',
          displayTime: 2000,
        },
        'error'
      );
      return;
    }

    if (
      !this.inventoryFormData.Details ||
      this.inventoryFormData.Details.length === 0
    ) {
      notify(
        {
          message: 'No inventory items found to save',
          type: 'error',
          displayTime: 2000,
        },
        'error'
      );
      return;
    }
    const dateOnly = this.inventoryFormData.PHYSICAL_DATE
      ? new Date(this.inventoryFormData.PHYSICAL_DATE)
          .toISOString()
          .split('T')[0]
      : null;
    // 🧾 Prepare payload
    const payload = {
      ID: this.inventoryFormData.ID || 0,
      COMPANY_ID: this.companyID,
      FIN_ID: this.finID,
      STORE_ID: this.storeFromSession,
      PHYSICAL_NO: this.inventoryFormData.PHYSICAL_NO || '',
      PHYSICAL_DATE: dateOnly,
      SUPP_ID: this.inventoryFormData.SUPP_ID || 0,
      DEPT_ID: this.inventoryFormData.DEPT_ID || 0,
      CAT_ID: this.inventoryFormData.CAT_ID || 0,
      BRAND_ID: this.inventoryFormData.BRAND_ID || 0,
      REASON_ID: this.inventoryFormData.REASON_ID || 0,
      REFERENCE_NO: this.inventoryFormData.REFERENCE_NO || '',
      TRANS_ID: this.inventoryFormData.TRANS_ID || 0,
      USER_ID: this.userID,
      NARRATION: this.inventoryFormData.NARRATION || '',
      STATUS: 1, // 1 = Active
      Details: this.inventoryFormData.Details.map((item: any) => ({
        ITEM_ID: item.ITEM_ID || 0,
        ITEM_CODE: item.ITEM_CODE || '',
        ITEM_NAME: item.DESCRIPTION || '',
        QTY_OH: item.STOCK_QTY || 0,
        COST: item.COST || 0,
        QTY_COUNT: item.QTY_COUNTED || 0,
        ADJUSTED_QTY: (item.QTY_COUNTED || 0) - (item.STOCK_QTY || 0),
        COUNT_TIME: item.COUNT_TIME || null,
        BATCH_NO: item.BATCH_NO || '',
        EXPIRY_DATE: item.EXPIRY_DATE || null,
      })),
    };

    console.log('🟢 Payload before save:', payload);
    if (this.isEditing && this.inventoryFormData.ID) {
      payload.ID = this.inventoryFormData.ID;
    }
    // 🔄 API call to save inventory
    const proceedWithSave = () => {
      const apiCall = this.isEditing
        ? this.isApproved
          ? this.dataService.approvePhysicalInventory(payload) // ✅ Approve API
          : this.dataService.updatePhysicalInventory(payload) // ✅ Update API
        : this.dataService.savePhysicalInventory(payload); // ✅ Insert API

      apiCall.subscribe({
        next: (response: any) => {
          if (response.Flag === '1') {
            const message =
              response.Message ||
              (this.isApproved
                ? 'Inventory approved successfully!'
                : this.isEditing
                ? 'Inventory updated successfully!'
                : 'Inventory saved successfully!');

            notify(message, 'success', 2000);

            // Emit popup close or navigate
            this.popupClosed?.emit?.();
            this.getVoucherNo();
            // if (!this.isEditing && !this.isApproved) {
            // ✅ call your voucher number API
            // }
          } else {
            notify(
              response.Message || 'Failed to save inventory',
              'error',
              2000
            );
          }
        },
        error: (err) => {
          console.error('Error saving inventory:', err);
          notify('An error occurred while saving inventory.', 'error', 3000);
        },
      });
    };

    // 5️⃣ Ask for confirmation before approving
    if (this.isEditing && this.isApproved) {
      confirm(
        'Are you sure you want to approve this inventory?',
        'Confirm Approval'
      ).then((dialogResult) => {
        if (dialogResult) {
          proceedWithSave();
        }
      });
    } else {
      proceedWithSave();
    }
  }

  onCancel() {
    this.popupClosed.emit();
  }

  formatDateTime(e: any) {
    if (!e.value) return '';
    const date = new Date(e.value);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }

  getVoucherNo() {
    this.dataService.getVoucherNoPhysicalInventry().subscribe({
      next: (response: any) => {
        if (response?.Flag === 1 && response.Data?.length > 0) {
          this.inventoryFormData.PHYSICAL_NO = response.Data[0].VOCHERNO;
          this.inventoryFormData.TRANS_ID = response.Data[0].TRANS_ID;
          console.log(
            'Voucher number updated:',
            this.inventoryFormData.PHYSICAL_NO
          );
        } else {
          console.warn('No voucher number received.');
        }
      },
      error: (err) => {
        console.error('Error fetching voucher number:', err);
      },
    });
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
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
    DxTabPanelModule,
    DxTabsModule,
    DxTagBoxModule,
  ],
  providers: [],
  declarations: [PhysicalInventoryFormComponent],
  exports: [PhysicalInventoryFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PhysicalInventoryFormModule {}
