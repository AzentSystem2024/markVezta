import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
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
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { SaleReturnFormComponent } from 'src/app/sale-return-form/sale-return-form.component';
import { DataService } from 'src/app/services';
import { confirm } from 'devextreme/ui/dialog';
import dxSelectBox from 'devextreme/ui/select_box';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-add-invoice-retail',
  templateUrl: './add-invoice-retail.component.html',
  styleUrls: ['./add-invoice-retail.component.scss'],
})
export class AddInvoiceRetailComponent {
  @ViewChild('popupGridRef', { static: false }) popupGridRef: any;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() canApprove: boolean = false;
  @Input() isVerifyMode: boolean = false;
  @Input() isApproveMode: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  customerList: any;
  mainGridData: any;
  salesReturnFormData: any;
  invoiceFormData: any = {
    COMPANY_ID: 0,
    STORE_ID: 0,
    TRANS_DATE: new Date(),
    CUSTOMER_ID: 0,
    PARTY_NAME: '',
    SALE_ID: 0,
    SALE_NO: '',
    IS_CREDIT: true,
    GROSS_AMOUNT: 0,
    TAX_AMOUNT: 0,
    NET_AMOUNT: 0,
    USER_ID: 0,
    NARRATION: '',
    CURRENCY_SYMBOL: '',
    IS_APPROVED: false,
    RET_NO: '',
    VEHICLE_NO: '',
    ROUND_OFF: false,
    DISCOUNT_AMOUNT: 0,
    Details: [
      {
        ITEM_ID: 0,
        QUANTITY: 0,
        PRICE: 0,
        AMOUNT: 0,
        TAX_PERC: 0,
        TAX_AMOUNT: 0,
        TOTAL_AMOUNT: 0,
        DISC_PERC: 0,
        DISC_AMT: 0,
        CUSTOMER_ID: 0,
      },
    ],
  };
  selectedCompanyId: any;
  userID: any;
  finID: any;
  vatTitle: any;
  retNo: any;
  sessionData: any;
  selected_vat_id: any;
  itemsList: any;
  itemsDescriptionList: any;
  isSaving: boolean = false;
  storeID: any;
  invalidQtyRowIndex: number | null = null;
  totalDiscAmount: number = 0;
  isHQApp: any;
  filteredStoreList: { ID: any; DESCRIPTION: any }[];
  storeList: { ID: any; DESCRIPTION: any }[];
  inclVAT: any;
  constructor(private dataService: DataService) {}
  ngOnChanges() {
    console.log(this.EditingResponseData, 'EditingResponseData');
    if (this.isEditing && this.EditingResponseData) {
      this.isEditDataAvailable();
    }
  }
  ngOnInit() {
    console.log(this.EditingResponseData, 'EditingResponseData');
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;

    const userData = JSON.parse(userDataString);
    this.isHQApp = userData.GeneralSettings.IS_HQ_APP;
    const configStore = userData.Configuration?.[0];
    this.storeID = userData.Configuration[0].STORE_ID;
    this.inclVAT = userData.GeneralSettings.INCL_VAT;
    // this.inclVAT = false;
    console.log(this.inclVAT, 'USERDATA');
    const selectedCompany = userData.SELECTED_COMPANY;
    this.vatTitle = userData.GeneralSettings.VAT_TITLE;
    // SINGLE SOURCE OF TRUTH
    this.selectedCompanyId = selectedCompany.COMPANY_ID;
    this.userID = userData.USER_ID;
    this.finID = userData.FINANCIAL_YEARS[0].FIN_ID;
    this.invoiceFormData.COMPANY_ID = selectedCompany.COMPANY_ID;
    // this.HSNCODE = userData.GeneralSettings.HSN_CODE;
    // this.GST = userData.GeneralSettings.GST_PERC;

    if (userData.USER_ID) {
      this.invoiceFormData.USER_ID = userData.USER_ID;
    }

    const firstFinYear = userData.FINANCIAL_YEARS?.[0];
    if (firstFinYear?.FIN_ID) {
      this.invoiceFormData.FIN_ID = firstFinYear.FIN_ID;
    }
    this.getStoreData();
    if (this.isHQApp && configStore) {
      this.filteredStoreList = [
        {
          ID: configStore.STORE_ID,
          DESCRIPTION: configStore.STORE_NAME,
        },
      ];

      // Auto select store
      this.invoiceFormData.STORE_ID = configStore.STORE_ID;
    } else {
      this.filteredStoreList = this.storeList;
    }
    this.getItems();
    this.getItemsDescription();
    if (!this.isEditing) {
      this.getDocNo();
    }
    this.getCustomerOrUnitLst();
    this.sessionData_tax();
    // setTimeout(() => {
    //   this.isEditDataAvailable();
    // }, 300);
    this.mainGridData = [
      {
        ITEM_ID: null,
        TRANSFER_NO: '',
      },
    ];
    // const imagePath = 'assets/markLogo.jpg';
    // this.convertToBase64(imagePath).then((base64) => {
    //   this.logoBase64 = base64;
    // });
  }

  getDocNo() {
    const payload = {
      TRANS_TYPE: 25,
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.retNo = response.DOC_NO;
      this.invoiceFormData.DOC_NO = response.DOC_NO;
    });
  }

  getStoreData() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDropdownData(payload).subscribe((res) => {
      this.storeList = res;
      console.log(this.storeID, 'STORELISTTTTTTTTTTT');
      if (!this.isHQApp) {
        this.filteredStoreList = this.storeList; //update here
      }
    });
  }

  getItems() {
    const payload = {
      name: 'ITEMS',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      // this.itemsList = response;
      this.itemsList = {
        store: {
          type: 'array',
          data: response,
          key: 'ID',
        },
        paginate: true,
        pageSize: 50,
      };
    });
  }
  getItemsDescription() {
    const payload = {
      name: 'ITEMSDESC',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.itemsDescriptionList = {
        store: {
          type: 'array',
          data: response,
          key: 'ID',
        },
        paginate: true,
        pageSize: 50,
      };
    });
  }
  getItemsData(itemId: any, rowData: any) {
    const payload = {
      ITEM_ID: itemId,
      CUSTOMER_ID: this.invoiceFormData.CUSTOMER_ID,
    };

    this.dataService.getItemsDetails(payload).subscribe((response: any) => {
      const data = response?.Data?.[0];
      if (!data) return;

      const grid = this.itemsGridRef.instance;

      const visibleRows = grid.getVisibleRows();
      const rowIndex = visibleRows.findIndex((r: any) => r.data === rowData);

      if (rowIndex === -1) return;

      //  UPDATE VALUES
      grid.cellValue(rowIndex, 'ITEM_ID', data.ID);
      grid.cellValue(rowIndex, 'ITEM_CODE', data.ID);
      grid.cellValue(rowIndex, 'DESCRIPTION', data.ID);

      grid.cellValue(rowIndex, 'HSN_CODE', data.HSN_CODE);
      grid.cellValue(rowIndex, 'UOM', data.UOM);
      grid.cellValue(rowIndex, 'PRICE', data.PRICE);
      grid.cellValue(rowIndex, 'TAX_PERC', data.TAX_PERC);

      //  FORCE UI UPDATE
      setTimeout(() => {
        grid.repaintRows([rowIndex]);

        // NOW MOVE TO QUANTITY (AFTER DATA IS READY)
        setTimeout(() => {
          grid.editCell(rowIndex, 'QUANTITY');

          //  focus input
          setTimeout(() => {
            const cell = grid.getCellElement(rowIndex, 'QUANTITY');
            const input = cell?.querySelector('input');

            if (input) {
              input.focus();
              input.select();
            }
          }, 50);
        }, 50);
      }, 50);
    });
  }
  // onCellValueChanged(e: any) {
  //   // // 🔹 existing calculation logic can stay
  //   // //  Trigger when quantity is entered (or TOTAL if you prefer)
  //   if (e.dataField === 'DISC_PERC') {
  //     const grid = this.itemsGridRef.instance;
  //     const visibleRows = grid.getVisibleRows();
  //     const rowIndex = grid.getRowIndexByKey(e.key);
  //     const isLastRow = rowIndex === visibleRows.length - 1;
  //     if (isLastRow) {
  //       // 🔥 Add new empty row
  //       const newRow = {
  //         ITEM_ID: null,
  //         ITEM_CODE: null,
  //         DESCRIPTION: null,
  //         HSN_CODE: '',
  //         UOM: '',
  //         PRICE: 0,
  //         QUANTITY: 0,
  //         AMOUNT: 0,
  //         TAX_PERC: 0,
  //         DISC_PERC: 0,
  //         DISC_AMT: 0,
  //         TAX_AMOUNT: 0,
  //         TOTAL_AMOUNT: 0,
  //       };
  //       this.invoiceFormData.Details.push(newRow);
  //       // Refresh grid
  //       setTimeout(() => {
  //         grid.refresh();
  //         //  Move focus to new row first column
  //         const newRowIndex = this.invoiceFormData.Details.length - 1;
  //         grid.editCell(newRowIndex, 'ITEM_CODE');
  //       }, 50);
  //     }
  //   }
  // }
  onRowRemoved(e: any) {
    const removedData = e.data;

    this.invoiceFormData.Details = (this.invoiceFormData.Details || []).filter(
      (item: any) => item !== removedData,
    );
  }

  calculateAmount = (rowData: any) => {
    const qty = rowData?.QUANTITY || 0;
    const cost = rowData?.PRICE || 0;

    return qty * cost;
  };

  calculateDiscAmt = (rowData: any) => {
    const qty = Number(rowData?.QUANTITY) || 0;
    const price = Number(rowData?.PRICE) || 0;

    const amount = qty * price; //  recompute instead of using rowData.AMOUNT
    const discPerc = Number(rowData?.DISC_PERC) || 0;

    return (amount * discPerc) / 100;
  };

  calculateTax = (rowData: any) => {
    const amount = (rowData?.QUANTITY || 0) * (rowData?.PRICE || 0);

    const discPerc = Number(rowData?.DISC_PERC) || 0;
    const discount = (amount * discPerc) / 100;

    const totalAfterDiscount = amount - discount;

    const vat = Number(rowData?.TAX_PERC) || 0;

    // VAT already included in price
    if (this.inclVAT) {
      const amountWithoutVAT = totalAfterDiscount / (1 + vat / 100);

      return totalAfterDiscount - amountWithoutVAT;
    }

    // Existing logic
    return (totalAfterDiscount * vat) / 100;
  };

  // calculateTax = (rowData: any) => {
  //   // View mode → bind backend response
  //   // if (this.isReadOnlyMode) {
  //   //   return rowData?.TAX_AMOUNT ?? 0;
  //   // }

  //   // Add/Edit → calculate in frontend
  //   const amount = (rowData?.QUANTITY || 0) * (rowData?.PRICE || 0);

  //   const discPerc = Number(rowData?.DISC_PERC) || 0;

  //   const discount = (amount * discPerc) / 100;

  //   const taxableAmount = amount - discount;

  //   const vat = Number(rowData?.TAX_PERC) || 0;

  //   return (taxableAmount * vat) / 100;
  // };

  calculateTotal = (rowData: any) => {
    const amount = this.calculateAmount(rowData);

    const discPerc = Number(rowData?.DISC_PERC) || 0;
    const discount = (amount * discPerc) / 100;

    const totalAfterDiscount = amount - discount;

    // If price already includes VAT → don't add VAT again
    if (this.inclVAT) {
      return totalAfterDiscount;
    }

    // Existing logic for Excl. VAT
    const tax = (totalAfterDiscount * (Number(rowData?.TAX_PERC) || 0)) / 100;

    return totalAfterDiscount + tax;
  };

  get totalQty(): number {
    return (this.invoiceFormData.Details || []).reduce(
      (sum: number, row: any) => sum + (Number(row.QUANTITY) || 0),
      0,
    );
  }

  get totalExclVAT(): number {
    const total = (this.invoiceFormData.Details || []).reduce(
      (sum: number, row: any) => {
        const amount = (Number(row?.PRICE) || 0) * (Number(row?.QUANTITY) || 0);

        const disc = (amount * (Number(row?.DISC_PERC) || 0)) / 100;

        const totalAfterDiscount = amount - disc;

        const vat = Number(row?.TAX_PERC) || 0;

        const taxableAmount =
          vat > 0 ? totalAfterDiscount / (1 + vat / 100) : totalAfterDiscount;

        return sum + taxableAmount;
      },
      0,
    );

    return Number(total.toFixed(2));
  }

  get totalVAT(): number {
    const total = (this.invoiceFormData.Details || []).reduce(
      (sum: number, row: any) => sum + this.calculateTax(row),
      0,
    );

    return Number(total.toFixed(2));
  }

  get totalInclVAT(): number {
    const total = (this.invoiceFormData.Details || []).reduce(
      (sum: number, row: any) => sum + this.calculateTotal(row),
      0,
    );

    return Number(total.toFixed(2));
  }
  // calculateTotal = (rowData: any) => {
  //   // if (this.isReadOnlyMode) {
  //   //   return rowData?.TOTAL_AMOUNT ?? 0;
  //   // }
  //   const amount = this.calculateAmount(rowData);

  //   const discPerc = Number(rowData?.DISC_PERC) || 0;
  //   const discount = (amount * discPerc) / 100;

  //   const taxableAmount = amount - discount;

  //   const tax = (taxableAmount * (rowData?.TAX_PERC || 0)) / 100;

  //   return taxableAmount + tax;
  // };

  getCustomerOrUnitLst() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService
      .getOutsideCustomerWithState(payload)
      .subscribe((response: any) => {
        this.customerList = response;
      });
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = this.EditingResponseData; //  full object
    const Details = data.Details || [];

    //  PATCH HEADER
    this.invoiceFormData = {
      ...this.invoiceFormData,
      ...data,
      TRANS_DATE: this.convertToDate(data.TRANS_DATE),
      CUSTOMER_ID: data.CUSTOMER_ID,
      REF_NO: data.REF_NO,
      DOC_NO: data.SALE_NO,
    };

    // PATCH GRID
    this.invoiceFormData.Details = Details.map((item: any) => ({
      ITEM_ID: item.ITEM_ID,
      ITEM_CODE: item.ITEM_ID, // lookup uses ID
      DESCRIPTION: item.ITEM_ID,
      HSN_CODE: item.HSN_CODE,
      UOM: item.UOM,
      PRICE: item.PRICE, // IMPORTANT FIX
      QUANTITY: item.QUANTITY,
      AMOUNT: item.AMOUNT,
      TAX_PERC: item.TAX_PERC,
      DISC_PERC: item.DISC_PERC,
      DISC_AMT: item.DISC_AMT,
      TAX_AMOUNT: item.TAX_AMOUNT,
      TOTAL_AMOUNT: item.TOTAL_AMOUNT,
      CUSTOMER_ID: data.CUSTOMER_ID,
    }));

    // refresh grid
    setTimeout(() => {
      this.itemsGridRef?.instance?.option(
        'dataSource',
        this.invoiceFormData.Details,
      );
      this.itemsGridRef?.instance?.refresh();
    }, 50);
  }
  convertToDate(dateStr: string): Date {
    if (!dateStr) return new Date();

    const [day, month, year] = dateStr.split('-');
    return new Date(+year, +month - 1, +day);
  }
  onEditorPreparing(e: any) {
    if (
      e.dataField === 'ITEM_CODE' ||
      e.dataField === 'DESCRIPTION' ||
      e.dataField === 'QUANTITY' ||
      e.dataField === 'PRICE' ||
      e.dataField === 'DISC_PERC'
    ) {
      e.editorOptions = e.editorOptions || {};

      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }

      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data,
          );

          setTimeout(() => {
            // existing logic untouched
          }, 50);
        }
      };
    }

    if (
      e.dataField === 'ITEM_CODE' ||
      e.dataField === 'DESCRIPTION' ||
      e.dataField === 'QUANTITY' ||
      e.dataField === 'DISC_PERC'
    ) {
      e.editorOptions = e.editorOptions || {};

      const grid = this.itemsGridRef?.instance;

      // ============================
      // DROPDOWN
      // ============================
      if (e.dataField === 'ITEM_CODE' || e.dataField === 'DESCRIPTION') {
        e.editorName = 'dxSelectBox';

        e.editorOptions = {
          ...e.editorOptions,
          dataSource:
            e.dataField === 'ITEM_CODE'
              ? this.itemsList
              : this.itemsDescriptionList,
          valueExpr: 'ID',
          displayExpr: 'DESCRIPTION',
          searchEnabled: true,

          onValueChanged: (args: any) => {
            const selectedId = args.value;
            if (!selectedId) return;

            this.getItemsData(selectedId, e.row.data);
          },
        };
      }

      // ============================
      // MAIN KEY HANDLING
      // ============================
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key !== 'Enter') return;

        const visibleRows = grid.getVisibleRows();
        const rowIndex = visibleRows.findIndex(
          (r: any) => r.data === e.row.data,
        );

        const editor = event.component;

        // DROPDOWN
        if (e.editorName === 'dxSelectBox') {
          event.event.preventDefault();

          if (!editor.option('opened')) {
            editor.open();
          } else {
            const selectedItem = editor.option('selectedItem');

            if (selectedItem) {
              editor.option('value', selectedItem.ID);
            }

            setTimeout(() => {
              editor.close();

              if (e.dataField === 'ITEM_CODE') {
                grid.editCell(rowIndex, 'DESCRIPTION');
              } else if (e.dataField === 'DESCRIPTION') {
                grid.editCell(rowIndex, 'QUANTITY');
              }
            }, 100);
          }

          return;
        }

        // ============================
        // QUANTITY (UNCHANGED - YOUR WORKING CODE)
        // ============================
        if (e.dataField === 'QUANTITY') {
          const input = event.event.target as HTMLInputElement;
          const value = Number(input.value);

          e.setValue(value);

          event.event.preventDefault();

          const grid = this.itemsGridRef.instance;
          const rowIndex = e.row.rowIndex;

          setTimeout(() => {
            grid.editCell(rowIndex, 'DISC_PERC');
          }, 0);

          return;
        }

        // ============================
        // ✅ DISC_PERC (ONLY NEW ADDITION)
        // ============================
        if (e.dataField === 'DISC_PERC') {
          event.event.preventDefault();

          const grid = this.itemsGridRef.instance;
          const rowIndex = e.row.rowIndex;

          const input = event.event.target as HTMLInputElement;
          const value = Number(input.value);

          e.setValue(value);

          grid.saveEditData();

          setTimeout(() => {
            const visibleRows = grid.getVisibleRows();
            const isLastRow = rowIndex === visibleRows.length - 1;

            if (isLastRow) {
              // ✅ call your function
              this.onAddRow();

              // 🔥 FORCE FOCUS (IMPORTANT)
              setTimeout(() => {
                const newRowIndex = this.invoiceFormData.Details.length - 1;

                grid.editCell(newRowIndex, 'ITEM_CODE');

                // optional: focus input
                setTimeout(() => {
                  const cell = grid.getCellElement(newRowIndex, 'ITEM_CODE');
                  const input = cell?.querySelector('input');
                  input?.focus();
                  input?.select();
                }, 50);
              }, 100); // ⬅️ must be slightly higher
            } else {
              grid.editCell(rowIndex + 1, 'ITEM_CODE');
            }
          }, 50);

          return;
        }
      };
    }
  }

  onCellValueChanged(e: any) {
    if (e.dataField === 'DISC_PERC') {
      const grid = this.itemsGridRef.instance;

      const visibleRows = grid.getVisibleRows();
      const rowIndex = e.row.rowIndex;
      const isLastRow = rowIndex === visibleRows.length - 1;

      if (isLastRow) {
        setTimeout(() => {
          grid.addRow(); // ✅ ONLY HERE

          setTimeout(() => {
            const newRowIndex = grid.getVisibleRows().length - 1;
            grid.editCell(newRowIndex, 'ITEM_CODE');
          }, 50);
        }, 0);
      }
    }
  }

  isRowEmpty = (row: any) => {
    return (
      !row.ITEM_CODE &&
      !row.DESCRIPTION &&
      (!row.QUANTITY || row.QUANTITY === 0)
    );
  };

  onAddRow() {
    if (this.isReadOnlyMode) return;

    const grid = this.itemsGridRef?.instance;
    if (!grid) return;

    const rows = this.invoiceFormData.Details || [];

    const hasEmptyRow = rows.some((row: any) => this.isRowEmpty(row));

    if (hasEmptyRow) {
      notify(
        'Please complete the current row before adding a new one',
        'warning',
        2000,
      );

      const emptyIndex = rows.findIndex((row: any) => this.isRowEmpty(row));

      setTimeout(() => {
        grid.editCell(emptyIndex, 'ITEM_CODE');
      }, 100);

      return;
    }

    const newRow = {
      ITEM_ID: null,
      ITEM_CODE: null,
      DESCRIPTION: null,
      HSN_CODE: null,
      UOM: null,
      PRICE: 0,
      QUANTITY: 0,
      AMOUNT: 0,
      TAX_PERC: 0,
      TAX_AMOUNT: 0,
      TOTAL_AMOUNT: 0,
      DISC_PERC: 0,
      DISC_AMT: 0,
      CUSTOMER_ID: this.invoiceFormData.CUSTOMER_ID,
    };

    this.invoiceFormData.Details = [...rows, newRow];

    // 🔥 IMPORTANT FIX
    setTimeout(() => {
      grid.option('dataSource', this.invoiceFormData.Details);

      // 🔥 Wait for rendering properly
      setTimeout(() => {
        const rowIndex = this.invoiceFormData.Details.length - 1;

        grid.option('focusedRowIndex', rowIndex); // ✅ ensure row focus
        grid.editCell(rowIndex, 'ITEM_CODE');

        // 🔥 OPEN DROPDOWN (optional but better UX)
        setTimeout(() => {
          const cellElement = grid.getCellElement(rowIndex, 'ITEM_CODE');
          const selectBoxElement = cellElement?.querySelector('.dx-selectbox');

          if (selectBoxElement) {
            const selectBox = dxSelectBox.getInstance(
              selectBoxElement,
            ) as dxSelectBox;
            selectBox?.focus();
            selectBox?.open();
          }
        }, 100);
      }, 150); // ⬅️ THIS is the real fix
    }, 0);
  }
  moveNextCell(field: string, rowIndex: number, grid: any) {
    if (field === 'ITEM_CODE') {
      grid.editCell(rowIndex, 'DESCRIPTION');
    } else if (field === 'DESCRIPTION') {
      grid.editCell(rowIndex, 'QUANTITY');
    } else if (field === 'QUANTITY') {
      grid.editCell(rowIndex, 'DISC_PERC');
    } else if (field === 'DISC_PERC') {
      const visibleRows = grid.getVisibleRows();
      const isLastRow = rowIndex === visibleRows.length - 1;

      if (isLastRow) {
        // 🔥 ADD NEW ROW
        grid.addRow();

        setTimeout(() => {
          const newRowIndex = grid.getVisibleRows().length - 1;
          grid.editCell(newRowIndex, 'ITEM_CODE');
        }, 50);
      } else {
        grid.editCell(rowIndex + 1, 'ITEM_CODE');
      }
    } else if (field === 'TAX_PERC') {
      const visibleRows = grid.getVisibleRows();
      const isLastRow = rowIndex === visibleRows.length - 1;

      if (isLastRow) {
        //  ADD NEW ROW USING GRID API
        grid.addRow();

        setTimeout(() => {
          const newRowIndex = grid.getVisibleRows().length - 1;
          grid.editCell(newRowIndex, 'ITEM_CODE');
        }, 50);
      } else {
        grid.editCell(rowIndex + 1, 'ITEM_CODE');
      }
    }
  }

  onRowPrepared(e: any) {
    if (e.rowType === 'data' && e.data?.isInvalid) {
      e.rowElement.classList.add('invalid-row');
    }
  }

  saveInvoice() {
    if (this.isSaving) return;

    if (!this.invoiceFormData.CUSTOMER_ID) {
      notify({
        message: 'Please Select Customer',
        type: 'warning',
        displayTime: 3000,
        position: { my: 'center top', at: 'center top', of: window },
      });
      return;
    }

    //  HANDLE APPROVE CASE
    if (this.invoiceFormData.IS_APPROVED === true || this.isApproveMode) {
      confirm(
        'Are you sure you want to approve and commit this invoice?',
        'Confirmation',
      ).then((result: boolean) => {
        if (result) {
          this.proceedSave();
        }
      });

      return;
    }
    if (this.isVerifyMode) {
      confirm(
        'Are you sure you want to verify this invoice?',
        'Confirm Verification',
      ).then((result: boolean) => {
        if (result) {
          this.proceedSave();
        }
      });

      return;
    }
    //  NORMAL SAVE
    this.proceedSave();
  }

  proceedSave() {
    const grid = this.itemsGridRef?.instance;

    if (grid) {
      grid.closeEditCell();
      grid.saveEditData();
    }
    (this.invoiceFormData.Details || []).forEach((item: any) => {
      item.isInvalid = false; // reset

      if (item.ITEM_CODE && (!item.QUANTITY || item.QUANTITY <= 0)) {
        item.isInvalid = true; // ✅ mark row
      }
    });
    //  VALIDATION
    const invalidIndex = (this.invoiceFormData.Details || []).findIndex(
      (item: any) => item.ITEM_CODE && (!item.QUANTITY || item.QUANTITY <= 0),
    );
    this.itemsGridRef.instance.repaint();
    if (invalidIndex !== -1) {
      notify({
        message: 'Quantity must be greater than 0',
        type: 'warning',
        displayTime: 3000,
        position: { my: 'center top', at: 'center top', of: window },
      });

      if (grid) {
        setTimeout(() => {
          grid.editCell(invalidIndex, 'QUANTITY');

          setTimeout(() => {
            const cell = grid.getCellElement(invalidIndex, 'QUANTITY');
            const input = cell?.querySelector('input');
            input?.focus();
            input?.select();
          }, 50);
        }, 50);
      }

      return; // STOP SAVE
    }

    this.isSaving = true;

    // const grid = this.itemsGridRef.instance;

    const allRows = grid.getVisibleRows().map((r: any) => r.data);

    const validDetails = allRows.filter(
      (item: any) => item.ITEM_CODE && item.QUANTITY > 0,
    );

    if (validDetails.length === 0) {
      this.isSaving = false;
      notify({
        message: 'Please add at least one valid item',
        type: 'warning',
        displayTime: 3000,
        position: { my: 'center top', at: 'center top', of: window },
      });
      return;
    }

    let gross = 0;
    let tax = 0;
    let net = 0;
    let discamt = 0;
    const customerId = this.invoiceFormData.CUSTOMER_ID;
    validDetails.forEach((item: any) => {
      const amount = this.calculateAmount(item);
      const taxAmt = this.calculateTax(item);
      const total = this.calculateTotal(item);
      const discAmount = this.calculateDiscAmt(item);

      item.AMOUNT = amount;
      item.TAX_AMOUNT = taxAmt;
      item.TOTAL_AMOUNT = total;
      item.DISC_AMT = discAmount;
      item.CUSTOMER_ID = customerId;
      gross += amount;
      tax += taxAmt;
      net += total;
      discamt += discAmount;
    });

    // Assign back
    this.invoiceFormData.STORE_ID = this.invoiceFormData.STORE_ID;
    this.invoiceFormData.GROSS_AMOUNT = gross;
    this.invoiceFormData.TAX_AMOUNT = tax;
    this.invoiceFormData.NET_AMOUNT = net;
    this.invoiceFormData.DISCOUNT_AMOUNT = discamt;
    this.invoiceFormData.Details = validDetails;
    this.invoiceFormData.PARTY_NAME = String(this.invoiceFormData.CUSTOMER_ID);

    this.invoiceFormData.TRANS_DATE = this.formatDateOnly(
      this.invoiceFormData.TRANS_DATE,
    );
    //  Ensure TRANS_ID in edit
    if (this.isEditing) {
      this.invoiceFormData.TRANS_ID = this.EditingResponseData?.TRANS_ID;
    }

    // Final payload
    const payload = {
      ...this.invoiceFormData,
    };

    console.log('SAVE/UPDATE/APPROVE PAYLOAD', payload);

    //API DECISION LOGIC
    let apiCall;
    if (this.isApproveMode) {
      apiCall = this.dataService.approveRetailInvoice(payload);
    } else if (this.isVerifyMode) {
      apiCall = this.dataService.verifyRetailInvoice(payload);
    } else if (this.isEditing) {
      apiCall = this.dataService.updateRetailInvoice(payload);
    } else {
      apiCall = this.dataService.saveRetailInvoice(payload);
    }
    //  API CALL
    apiCall.subscribe({
      next: () => {
        this.isSaving = false;
        this.popupClosed.emit();

        notify({
          message: this.isApproveMode
            ? 'Invoice Approved Successfully'
            : this.isVerifyMode
              ? 'Invoice Verified Successfully'
              : this.isEditing
                ? 'Invoice Updated Successfully'
                : 'Invoice Saved Successfully',
          type: 'success',
          displayTime: 3000,
          position: { my: 'center top', at: 'center top', of: window },
        });

        this.resetForm();
      },
      error: (err: any) => {
        this.isSaving = false;
        console.error(err);

        notify({
          message: 'Error while saving',
          type: 'error',
          displayTime: 3000,
          position: { my: 'center top', at: 'center top', of: window },
        });
      },
    });
  }
  formatDateOnly(date: Date): string {
    if (!date) return '';

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${year}-${month}-${day}`; // format you are using
  }
  resetForm() {
    this.invoiceFormData = {
      COMPANY_ID: this.selectedCompanyId,
      STORE_ID: 0,
      TRANS_DATE: new Date(),
      CUSTOMER_ID: 0,
      PARTY_NAME: '',
      SALE_ID: 0,
      SALE_NO: '',
      IS_CREDIT: true,
      GROSS_AMOUNT: 0,
      TAX_AMOUNT: 0,
      NET_AMOUNT: 0,
      USER_ID: this.userID,
      NARRATION: '',
      CURRENCY_SYMBOL: '',
      IS_APPROVED: false,
      RET_NO: '',
      VEHICLE_NO: '',
      ROUND_OFF: false,
      Details: [
        {
          ITEM_ID: 0,
          QUANTITY: 0,
          PRICE: 0,
          AMOUNT: 0,
          TAX_PERC: 0,
          TAX_AMOUNT: 0,
          TOTAL_AMOUNT: 0,
        },
      ],
    };

    this.getDocNo();
  }

  openPDF() {
    console.log('Open PDF clicked');
    const returnId = this.EditingResponseData.TRANS_ID;
    // Example:
    this.dataService.selectInvoiceRetail(returnId).subscribe((res: any) => {
      this.generatePDF(res);
    });
  }

  getBase64ImageFromURL(url: string): Promise<string> {
    return fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      });
  }

  async generatePDF(data: any) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // ============================================================
    // 1) HEADER (LOGO + TITLE + RIGHT DETAILS)
    // ============================================================

    const headerY = 10;

    // --- Logo placeholder (replace with addImage if needed)
    const logoBase64 = await this.getBase64ImageFromURL(
      'assets/images/image16.png',
    );

    doc.addImage(logoBase64, 'PNG', 15, headerY, 30, 40);

    // --- Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SALES INVOICE', pageWidth / 2, headerY + 25, {
      align: 'center',
    });

    // ======================================================
    // RIGHT HEADER DETAILS
    // ======================================================

    doc.setFontSize(10);

    doc.setFont('helvetica', 'normal');

    doc.text('Invoice No :', 135, 15);

    doc.text(`${data.Data.SALE_NO}`, 195, 15, { align: 'right' });

    doc.text('Reference No :', 135, 22);

    doc.text(`${data.Data.REF_NO}`, 195, 22, { align: 'right' });

    doc.text('Date :', 135, 29);

    doc.text(`${data.Data.TRANS_DATE}`, 195, 29, { align: 'right' });

    // ======================================================
    // SELLER DETAILS
    // ======================================================

    doc.setFont('helvetica', 'bold');
    doc.text('Seller Details', 12, 60);

    doc.setFont('helvetica', 'normal');

    doc.text('Address', 12, 67);

    doc.text(`${data.Data.ADDRESS1}`, 38, 67);

    doc.text('Tel', 12, 74);
    doc.text(`${data.Data.PHONE}`, 38, 74);

    doc.text('TRN', 12, 83);
    doc.text(`${data.Data.GST_NO}`, 38, 83);

    // ======================================================
    // BUYER DETAILS
    // ======================================================

    doc.setFont('helvetica', 'bold');
    doc.text('Buyer Details', 140, 60);

    doc.setFont('helvetica', 'normal');

    doc.text('Address', 140, 67);

    doc.text(`${data.Data.CUST_ADDRESS1} ${data.Data.CITY}`, 165, 67);

    doc.text('Tel', 140, 74);
    doc.text(`${data.Data.CUST_PHONE}`, 165, 74);

    doc.text('TRN', 140, 83);
    doc.text(`${data.Data.ZIP}`, 165, 83);

    // ======================================================
    // TABLE
    // ======================================================

    const details = data?.Data?.Details || [];

    const tableData = details.map((item: any) => [
      item.ITEM_CODE || '',
      item.DESCRIPTION || '',
      item.UOM || '',
      item.COST || 0,
      item.QUANTITY || 0,
      item.AMOUNT || 0,
      item.DISC_AMT || 0,
      item.TAX_AMOUNT || 0,
      item.TOTAL_AMOUNT || 0,
    ]);

    autoTable(doc, {
      startY: 110,

      head: [
        [
          'Item Code',
          'Description',
          'UOM',
          'Cost',
          'Qty',
          'Amount',
          'Dis(amt)',
          'VAT(amt)',
          'Total Price',
        ],
      ],

      body: tableData,

      styles: {
        fontSize: 8,
        cellPadding: 3,
      },

      headStyles: {
        fillColor: [220, 230, 242],
        textColor: 0,
        fontStyle: 'bold',
      },

      theme: 'plain',

      didDrawCell: (data1) => {
        if (data1.section === 'head') {
          doc.setDrawColor(220);
          doc.rect(
            data1.cell.x,
            data1.cell.y,
            data1.cell.width,
            data1.cell.height,
          );
        }
      },
    });

    // ======================================================
    // TOTAL SECTION
    // ======================================================

    const totalQty = details.reduce(
      (sum: number, item: any) => sum + Number(item.QUANTITY || 0),
      0,
    );

    const totalAmount = details.reduce(
      (sum: number, item: any) => sum + Number(item.AMOUNT || 0),
      0,
    );

    const totalDiscount = details.reduce(
      (sum: number, item: any) => sum + Number(item.DISC_AMT || 0),
      0,
    );

    const totalVat = details.reduce(
      (sum: number, item: any) => sum + Number(item.TAX_AMOUNT || 0),
      0,
    );

    const totalPrice = details.reduce(
      (sum: number, item: any) => sum + Number(item.TOTAL_AMOUNT || 0),
      0,
    );

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setDrawColor(200);
    doc.line(12, finalY - 5, 198, finalY - 5);

    doc.setFont('helvetica', 'bold');

    doc.text('TOTAL', 45, finalY + 5);

    doc.text(`${totalQty}`, 112, finalY + 5);

    doc.text(`${totalAmount.toFixed(2)}`, 132, finalY + 5);

    doc.text(`${totalDiscount.toFixed(2)}`, 152, finalY + 5);

    doc.text(`${totalVat.toFixed(2)}`, 172, finalY + 5);

    doc.text(`${totalPrice.toFixed(2)}`, 198, finalY + 5, {
      align: 'right',
    });

    // ======================================================
    // AMOUNT IN WORDS
    // ======================================================

    doc.setFont('helvetica', 'normal');

    doc.text(`Amount Chargeable (in words):`, 55, finalY + 20);

    doc.setTextColor(0, 102, 204);

    doc.setFont('helvetica', 'bold');

    doc.text(`AED ${this.convertNumberToWords(totalPrice)}`, 108, finalY + 20);

    // ======================================================
    // PAYMENT INSTRUCTIONS
    // ======================================================

    const paymentY = 230;

    doc.setTextColor(0, 0, 0);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    doc.text('Payment Instructions', 12, paymentY);

    // LEFT LABELS
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    doc.text('Bank Name:', 12, paymentY + 12);
    doc.text('Account Name:', 12, paymentY + 20);
    doc.text('Account #:', 12, paymentY + 28);
    doc.text('SWIFT/BIC:', 12, paymentY + 36);

    // VALUES
    doc.text('Global Commercial Bank', 55, paymentY + 12);

    doc.text('Vezta V1.0 Enterprises', 55, paymentY + 20);

    doc.text('1234 5678 9012', 55, paymentY + 28);

    doc.text('GCBKUS33XXX', 55, paymentY + 36);

    // CONTACT
    doc.text('Tel:8908765432   |   Mob:8908765432', 12, paymentY + 48);

    doc.text('Email: info@gmail.com   |   www.company.com', 12, paymentY + 56);

    // THANK YOU MESSAGE
    doc.setFont('helvetica', 'italic');

    doc.text('Thank you for your business!', 145, paymentY + 56);

    // ============================================================
    // 3) OPEN PDF
    // ============================================================

    doc.output('dataurlnewwindow');
  }

  convertNumberToWords(num: number): string {
    if (num === 0) return 'Zero';

    const a = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];

    const b = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];

    const inWords = (n: number, suffix: string): string => {
      if (n === 0) return '';
      if (n < 20) return a[n] + ' ' + suffix + ' ';
      return b[Math.floor(n / 10)] + ' ' + a[n % 10] + ' ' + suffix + ' ';
    };

    let str = '';

    str += inWords(Math.floor(num / 10000000), 'Crore');
    str += inWords(Math.floor((num / 100000) % 100), 'Lakh');
    str += inWords(Math.floor((num / 1000) % 100), 'Thousand');
    str += inWords(Math.floor((num / 100) % 10), 'Hundred');

    if (num > 100 && num % 100 > 0) str += 'and ';

    str += inWords(num % 100, '');

    return str.trim();
  }

  cancel() {
    this.popupClosed.emit();
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
  ],
  providers: [],
  declarations: [AddInvoiceRetailComponent],
  exports: [AddInvoiceRetailComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddInvoiceRetailModule {}
