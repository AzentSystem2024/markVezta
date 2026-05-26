import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgModule,
  OnInit,
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
  DxTabsModule,
  DxTabPanelModule,
  DxPopupModule,
  DxDropDownBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import { DxDropDownBoxTypes } from 'devextreme-angular/ui/drop-down-box';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-grn-new-form',
  templateUrl: './grn-new-form.component.html',
  styleUrls: ['./grn-new-form.component.scss'],
})
export class GrnNewFormComponent implements OnInit {
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  financialYeaDate: string;

  SUPP_AMOUNT: any;
  //  financialYeaDate: string
  selected_vat_id: any;
  sessionData: any;
  formatted_from_date: string;
  selected_fin_id: any;
  selected_Company_id: any;
  demoArray: any = [];
  updatedItems: any[] = [];
  landedCost: any;
  landedCostList: any;
  costCurrency: any;
  costRate: any;
  LocalNetAmount: any;
  currencySymbol: any;
  landedCostDropDown: any;
  formattedNetAmount: any;
  formattedLocalNetAmount: any;
  supplierList: any;
  supplierId: number = 0;
  poDetails: any;
  costingMethodDataGrid: any;
  storeList: any;
  poList: any;
  isGridBoxOpened = false;
  totalQuantity: any = 0;
  totalNetAmount: any = 0;
  today: Date;
  filteredPOList: any;
  localCurrencyId: any;
  localCurrencySymbol: any;
  cwidth: any = 'auto';
  isCostPopUpOpened: boolean = false;
  width: any;

  costData: any = {
    ID: '',
    DESCRIPTION: '',
    CURRENCY: '',
    RATE: '',
    TOTAL: '',
  };
  grnData: any = {
    GRN_DATE: '',
    COMPANY_ID: 0,
    DOC_NO: '',
    USER_ID: 1,
    STORE_ID: '',
    PO_ID: 0,
    SUPP_ID: '',
    NET_AMOUNT: 0,
    TOTAL_COST: 0,
    SUPP_GROSS_AMOUNT: 0,
    SUPP_NET_AMOUNT: '',
    EXCHANGE_RATE: 0,
    NARRATION: '',
    PO_NO: '',
    GRN_NO: 0,
    STORE_NAME: '',
    SUPPPLIER_NAME: '',
    STATUS: '',
    CURRENCY_ID: 0,
    CURRENCY_SYMBOL: '',
    IS_APPROVED: false,
    GRNDetails: [
      {
        ID: 0,
        COMPANY_ID: 0,
        STORE_ID: 0,
        PO_DETAIL_ID: 0,
        GRN_ID: 0,
        ITEM_ID: 0,
        QUANTITY: 0,
        RATE: 0,
        AMOUNT: 0,
        INVOICE_QTY: 0,
        DISC_PERCENT: 0,
        COST: 0,
        SUPP_PRICE: 0,
        SUPP_AMOUNT: 0,
        RETURN_QTY: 0,
        UOM_PURCH: '',
        UOM: '',
        UOM_MULTIPLE: 0,
        STORE_NAME: '',
        ITEM_NAME: '',
        ITEM_CODE: '',
        PO_QUANTITY: 0,
        GRN_QUANTITY: 0,
        RECEIVED_QTY: 0,
      },
    ],
    GRN_Item_Cost: [
      {
        ID: 0,
        GRN_ID: 0,
        STORE_ID: 0,
        ITEM_ID: 0,
        COST_ID: 0,
        AMOUNT: 0,
        DESCRIPTION: '',
        IS_LOCAL_CURRENCY: false,
        IS_FIXED_AMOUNT: false,
      },
    ],
    GRN_Cost: [
      {
        ID: 0,
        STORE_ID: 0,
        GRN_ID: 0,
        COST_ID: 0,
        PERCENT: 0,
        AMOUNT_FC: 0,
        AMOUNT: 0,
        VALUE: 0,
        DESCRIPTION: '',
        IS_LOCAL_CURRENCY: false,
        IS_FIXED_AMOUNT: false,
      },
    ],
  };

  newGrnData = this.grnData;
  getNewGrnData = () => {
    // Check if there are items
    if (!this.poDetails || this.poDetails.length === 0) {
      notify(
        {
          message: 'No items available to save.',
          position: { at: 'top center', my: 'top center' },
        },
        'warning',
        2000,
      );
      return null;
    }

    // Validate RECEIVED_QTY
    const invalidRow = this.poDetails.find(
      (item: any) =>
        item.RECEIVED_QTY === null ||
        item.RECEIVED_QTY === undefined ||
        item.RECEIVED_QTY === '' ||
        Number(item.RECEIVED_QTY) <= 0,
    );

    if (invalidRow) {
      notify(
        {
          message: 'Please enter Received Qty for all items before saving.',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
        2000,
      );
      return null;
    }

    return {
      ...this.newGrnData,
      // GRNDetails: this.demoArray,
      GRNDetails: this.mergeItems(this.demoArray),
      GRN_DATE: new Date(),
    };
  };
  docNo: any;
  isHQApp: boolean = false;
  filteredStoreList: any[] = [];
  isLocalCurrency: boolean = false;
  currency: any;

  // add.component.ts

  constructor(
    private service: DataService,
    private ref: ChangeDetectorRef,
  ) {
    this.today = new Date();
    const settingsData = sessionStorage.getItem('settings');
    const data = settingsData ? JSON.parse(settingsData) : null;
    // Access CURRENCY_ID
    this.localCurrencyId = data ? data.CURRENCY_ID : null;
    console.log(this.localCurrencyId, 'CURRENCY_ID');
    this.localCurrencySymbol = data ? data.CURRENCY_SYMBOL : null;
    console.log(this.grnData.GRN_DATE, 'grndate');
    console.log(this.grnData);
    this.sesstion_Details();
  }

  ngOnInit(): void {
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.currency = userData.GeneralSettings.SYMBOL;
    console.log(this.currency, 'GENERALSETTINGSSSSSSSSSSSSSSSS');
    this.isHQApp = userData.GeneralSettings.IS_HQ_APP;
    console.log(this.isHQApp, 'USERDATASTRINGGGGGGGGGGGG');
    const configStore = userData.Configuration?.[0];
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
    }
    // this.getSupplierData();
    this.get_Supplier_dropdown();
    this.getStoreData();
    this.sesstion_Details();
    this.getDocNo();
    this.getStoreData();
    if (this.isHQApp && configStore) {
      this.filteredStoreList = [
        {
          ID: configStore.STORE_ID,
          DESCRIPTION: configStore.STORE_NAME,
        },
      ];

      // Auto select store
      this.newGrnData.STORE_ID = configStore.STORE_ID;
    } else {
      this.filteredStoreList = this.storeList;
    }
    // this.getPurchaseOrderList();
  }

  getDocNo() {
    const payload = {
      TRANS_TYPE: 18,
      COMPANY_ID: this.selected_Company_id,
      SUB_TYPE_ID: 0,
    };
    this.service.getDocNo(payload).subscribe((response: any) => {
      this.docNo = response.DOC_NO;
    });
  }

  clearDemoArray() {
    this.demoArray = [];
    console.log(' demoArray cleared');
  }

  mergeItems(items: any[]) {
    const map = new Map();

    items.forEach((item) => {
      const key = item.ITEM_ID; // group by ITEM_ID

      if (map.has(key)) {
        const existing = map.get(key);

        existing.QUANTITY += Number(item.QUANTITY || 0);
        existing.AMOUNT += Number(item.AMOUNT || 0);
        existing.SUPP_AMOUNT += Number(item.SUPP_AMOUNT || 0);
      } else {
        map.set(key, { ...item });
      }
    });

    return Array.from(map.values());
  }

  highlightEditableColumns(event: any) {
    if (event.rowType === 'data' && event.column.allowEditing) {
      // Apply a custom style for editable cells
      event.cellElement.style.backgroundColor = '#ffffffff'; // Soft yellow background
      event.cellElement.style.color = '#000000'; // Dark yellow text
      event.cellElement.style.fontWeight = 'bold';
    }
  }
  onEditorPreparing(e: any) {
    if (e.dataField === 'RECEIVED_QTY') {
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
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data,
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'GST'));
          }, 50);
        }
      };
    }
  }

  selectedPONo: any;

  onGridBoxValueChanged(e: any): void {
    if (e.value) {
      this.isGridBoxOpened = false;
      this.ref.detectChanges();
      const selectedPo = e.value;
      console.log(selectedPo, '+');

      if (selectedPo) {
        const poId = selectedPo[0].PO_ID;
        this.newGrnData.PO_ID = poId;
        console.log(poId, 'poID');
        this.getPODetails(poId);
      }
    }
  }

  getPODetails(poId: any) {
    this.service
      .getGrnPoDetails(poId, this.selected_Company_id)
      .subscribe((res: any) => {
        console.log(res, 'res');

        // Populate poDetails with dynamic SL_NO and other calculations
        this.poDetails = res.Podetails.map((item: any, index: number) => ({
          ...item,
          PO_QUANTITY: item.PO_QUANTITY,
          SL_NO: index + 1, // Add SL_NO property dynamically
          QTY_TO_RECEIVE: item.PO_QUANTITY - item.GRN_QTY,
          SUPP_PRICE: item.SUPP_PRICE.toFixed(2),
          UNIT_COST: 0,
        }));

        this.cwidth = '100';
        this.currencySymbol =
          res.Podetails.length > 0 ? res.Podetails[0].CURRENCY_SYMBOL : ''; // Extract the first item's currency symbol
        console.log(this.poDetails, 'Updated poDetails with SL_NO');
        console.log(this.currencySymbol, '===========weqwewee');
        // Populate landedCost
        this.landedCost = res.LandedCost;
        console.log(this.landedCost, 'landedcost');

        // Populate costingMethodDataGrid
        this.costingMethodDataGrid = this.landedCost.map((landedCost: any) => ({
          ID: landedCost.ID,
          DESCRIPTION: landedCost.DESCRIPTION,
          CURRENCY: landedCost.IS_FIXED_AMOUNT
            ? landedCost.IS_LOCAL_CURRENCY
              ? this.localCurrencySymbol
              : this.currencySymbol
            : `${
                landedCost.IS_LOCAL_CURRENCY
                  ? this.localCurrencySymbol
                  : this.currencySymbol
              } %`,
          RATE: landedCost.VALUE,
          TOTAL: landedCost.IS_FIXED_AMOUNT
            ? landedCost.VALUE
            : (this.newGrnData.NET_AMOUNT * landedCost.VALUE) / 100,
        }));

        console.log(this.costingMethodDataGrid, 'costingMethod');

        // Now that poDetails and landedCost are populated, assign SUPP_GROSS_AMOUNT and SUPP_NET_AMOUNT
        this.newGrnData.SUPP_GROSS_AMOUNT = Number(
          this.poDetails[0].SUPP_GROSS_AMOUNT,
        );
        this.newGrnData.SUPP_NET_AMOUNT = this.poDetails[0].SUPP_NET_AMOUNT;

        // Create GRN_Cost based on the landedCost
        const grnCost = this.landedCost.map((landedCost: any) => {
          const COST_ID = landedCost.DESCRIPTION; // or use landedCost.COST_ID if available
          const STORE_ID = this.newGrnData.STORE_ID; // Assuming STORE_ID is available in newGrnData
          let PERCENT = 0;
          let AMOUNT = 0;
          let AMOUNT_FC = 0;

          // If IS_FIXED_AMOUNT is false, use VALUE as PERCENT
          if (!landedCost.IS_FIXED_AMOUNT) {
            PERCENT = landedCost.VALUE;
            if (landedCost.IS_LOCAL_CURRENCY) {
              AMOUNT = landedCost.VALUE; // Store in AMOUNT if IS_LOCAL_CURRENCY is true
              AMOUNT_FC = 0; // No foreign currency amount
            } else {
              AMOUNT_FC = landedCost.VALUE; // Store in AMOUNT_FC if IS_LOCAL_CURRENCY is false
              AMOUNT = 0; // No local currency amount
            }
          } else {
            // If IS_FIXED_AMOUNT is true, store VALUE in AMOUNT and AMOUNT_FC based on IS_LOCAL_CURRENCY
            if (landedCost.IS_LOCAL_CURRENCY) {
              AMOUNT = landedCost.VALUE; // Store in AMOUNT if IS_LOCAL_CURRENCY is true
              AMOUNT_FC = 0; // No foreign currency amount
            } else {
              AMOUNT_FC = landedCost.VALUE; // Store in AMOUNT_FC if IS_LOCAL_CURRENCY is false
              AMOUNT = 0; // No local currency amount
            }
          }

          return {
            STORE_ID: STORE_ID,
            COST_ID: landedCost.ID, // Assuming COST_ID is available in landedCost data
            PERCENT: landedCost.VALUE,
            AMOUNT_FC: AMOUNT_FC.toFixed(2), // Format AMOUNT_FC as needed
            AMOUNT: AMOUNT.toFixed(2), // Format AMOUNT as needed
          };
        });

        // Log the final GRN_Cost array for debugging
        console.log(grnCost, 'GRN_Cost');

        this.newGrnData.GRN_Cost = []; // Clear existing data
        this.newGrnData.GRN_Cost.push(...grnCost); // Push the new grnCost data

        // You can now save or use grnCost as needed
      });

    // // Handle dropdown data if necessary
    this.service.getDropdownData('LANDED_COST').subscribe((res: any[]) => {
      this.landedCostDropDown = res
        .filter(
          (item) =>
            !this.landedCost.some(
              (cost) => cost.DESCRIPTION === item.DESCRIPTION,
            ),
        )
        .map(({ ...rest }) => rest);

      console.log(this.landedCostDropDown, '_________');
    });

    this.service.getLandedcostData().subscribe((res) => {
      this.landedCostList = res;
    });
  }

  onStoreValueChanged(e: any) {
    const storeid = e.value;
    this.service
      .getPendingPo(storeid, this.supplierId, this.selected_Company_id)
      .subscribe((res: any) => {
        this.poList = res.data;
        this.isLocalCurrency = this.poList.IS_LOCAL_CURRENCY;
        console.log(this.poList, 'ISLOCALCURRENCYYYYYYYY');
        this.filteredPOList = [...this.poList];
      });
  }

  onSupplierValueChanged(e: any) {
    const supplierid = e.value;
    this.supplierId = supplierid;

    if (!this.newGrnData.STORE_ID) return;

    this.service
      .getPendingPo(
        this.newGrnData.STORE_ID,
        supplierid,
        this.selected_Company_id,
      )
      .subscribe((res: any) => {
        this.poList = res.data;
        this.filteredPOList = [...this.poList];
      });
  }

  get_Supplier_dropdown() {
    const payload = {
      NAME: 'SUPPLIER',
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getDropdownData(payload).subscribe((res: any) => {
      console.log('supplier dropdown', res);
      this.supplierList = res;
    });
  }

  getStoreData() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getDropdownData(payload).subscribe((res) => {
      this.storeList = res;
      if (!this.isHQApp) {
        this.filteredStoreList = this.storeList; //update here
      }
    });
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = this.sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.newGrnData.COMPANY_ID = this.selected_Company_id;
    this.selected_fin_id = this.sessionData.FINANCIAL_YEARS[0].FIN_ID;

    const sessionYear = this.sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;

    this.formatted_from_date = this.financialYeaDate;

    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  updateCell(event: any) {
    const updatedRow = { ...event.oldData, ...event.data };

    const updatedData = event.data;

    console.log(updatedRow, 'updatedRow');

    if (!Array.isArray(this.demoArray)) {
      this.demoArray = [];
    }

    // =====================================
    // BASIC VALUES
    // =====================================

    const qty = Number(updatedRow.RECEIVED_QTY || 0);

    const localPrice = Number(updatedRow.PRICE || 0);

    const suppPrice = Number(updatedRow.SUPP_PRICE || 0);

    const discPerc = Number(
      updatedRow.DISC_PERCENT || updatedRow.DISC_PERC || 0,
    );

    // =====================================
    // VALIDATION
    // =====================================

    const qtyToReceive = Number(updatedRow.QTY_TO_RECEIVE || 0);

    if (qty > qtyToReceive) {
      notify(
        {
          message: "Qty received can't be higher than qty pending",
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        2000,
      );

      updatedData.RECEIVED_QTY = 0;

      return;
    }

    // =====================================
    // AMOUNT CALCULATIONS
    // =====================================

    const grossLocalAmount = qty * localPrice;

    const grossSuppAmount = qty * suppPrice;

    const localDiscount = (grossLocalAmount * discPerc) / 100;

    const suppDiscount = (grossSuppAmount * discPerc) / 100;

    const localAmount = grossLocalAmount - localDiscount;

    const suppAmount = grossSuppAmount - suppDiscount;

    // =====================================
    // UNIT COST
    // =====================================

    const unitCost = qty > 0 ? Number((suppAmount / qty).toFixed(2)) : 0;

    // =====================================
    // UPDATE ROW VALUES
    // =====================================

    updatedRow.AMOUNT = Number(localAmount.toFixed(2));

    updatedRow.SUPP_AMOUNT = Number(suppAmount.toFixed(2));

    updatedRow.UNIT_COST = unitCost;

    updatedRow.COST = unitCost;

    // =====================================
    // BASE UNIT
    // =====================================

    const uomMultiple = Number(updatedRow.UOM_MULTIPLE || 1);

    const baseUnitValue = qty / uomMultiple;

    updatedRow.QTY_BASE_UNIT = `${baseUnitValue} ${updatedRow.UOM}`;

    // =====================================
    // DEMO ARRAY
    // =====================================

    const enrichedData = {
      ...updatedRow,

      QUANTITY: qty,

      RATE: localPrice,

      DISC_PERCENT: discPerc,

      AMOUNT: Number(localAmount.toFixed(2)),

      SUPP_PRICE: suppPrice,

      SUPP_AMOUNT: Number(suppAmount.toFixed(2)),

      COST: unitCost,

      ITEM_NAME: updatedRow.DESCRIPTION || '',

      STORE_NAME: updatedRow.STORE_NAME || '',
    };

    const demoIndex = this.demoArray.findIndex(
      (item) =>
        item.ITEM_ID === updatedRow.ITEM_ID &&
        item.PO_DETAIL_ID === updatedRow.PO_DETAIL_ID,
    );

    if (demoIndex > -1) {
      this.demoArray[demoIndex] = {
        ...this.demoArray[demoIndex],
        ...enrichedData,
      };
    } else {
      this.demoArray.push(enrichedData);
    }

    console.log(this.demoArray, 'demoArray');

    // =====================================
    // UPDATE PO DETAILS
    // =====================================

    const poIndex = this.poDetails.findIndex(
      (r: any) =>
        r.PO_DETAIL_ID === updatedRow.PO_DETAIL_ID &&
        r.ITEM_ID === updatedRow.ITEM_ID,
    );

    if (poIndex > -1) {
      this.poDetails[poIndex] = {
        ...this.poDetails[poIndex],
        ...updatedRow,
      };
    }

    this.poDetails = [...this.poDetails];

    // =====================================
    // TOTALS
    // =====================================

    this.totalQuantity = this.poDetails.reduce(
      (sum: number, item: any) => sum + Number(item.RECEIVED_QTY || 0),
      0,
    );

    this.newGrnData.NET_AMOUNT = this.poDetails
      .reduce((sum: number, item: any) => sum + Number(item.AMOUNT || 0), 0)
      .toFixed(2);

    this.LocalNetAmount = this.newGrnData.NET_AMOUNT;

    this.newGrnData.SUPP_NET_AMOUNT = this.poDetails
      .reduce(
        (sum: number, item: any) => sum + Number(item.SUPP_AMOUNT || 0),
        0,
      )
      .toFixed(2);

    this.formattedLocalNetAmount = `${this.newGrnData.NET_AMOUNT}`;

    this.formattedNetAmount = `${this.newGrnData.SUPP_NET_AMOUNT}`;

    // =====================================
    // COSTING GRID
    // =====================================

    this.costingMethodDataGrid = this.costingMethodDataGrid.map((row: any) => {
      if (row.CURRENCY.includes('%')) {
        row.TOTAL = (
          (Number(this.LocalNetAmount || 0) * Number(row.RATE || 0)) /
          100
        ).toFixed(2);
      }

      return row;
    });

    // =====================================
    // UPDATE ITEM COSTS
    // =====================================

    this.poDetails = this.poDetails.map((item: any) => {
      let sumCost = 0;

      this.costingMethodDataGrid.forEach((costItem: any) => {
        const proportionalValue =
          (Number(item.AMOUNT || 0) / Number(this.LocalNetAmount || 1)) *
          Number(costItem.TOTAL || 0);

        item[costItem.DESCRIPTION.toUpperCase()] = proportionalValue.toFixed(2);

        sumCost += proportionalValue;
      });

      item.TOTAL_COST = (Number(item.AMOUNT || 0) + sumCost).toFixed(2);

      const qty = Number(item.RECEIVED_QTY || 0);

      const suppAmount = Number(item.SUPP_AMOUNT || 0);

      item.UNIT_COST = qty > 0 ? (suppAmount / qty).toFixed(2) : '0.00';

      item.COST = item.UNIT_COST;

      return item;
    });

    // =====================================
    // UPDATED ITEMS
    // =====================================

    const updatedIndex = this.updatedItems.findIndex(
      (item) => item.SL_NO === updatedRow.SL_NO,
    );

    if (updatedIndex > -1) {
      this.updatedItems[updatedIndex] = {
        ...updatedRow,
      };
    } else {
      this.updatedItems.push({
        ...updatedRow,
      });
    }

    // =====================================
    // BINDED DATA
    // =====================================

    const bindedData = this.updatedItems.map((item) => {
      const qty = Number(item.RECEIVED_QTY || 0);

      const localPrice = Number(item.PRICE || 0);

      const suppPrice = Number(item.SUPP_PRICE || 0);

      const discPerc = Number(item.DISC_PERCENT || item.DISC_PERC || 0);

      const grossLocalAmount = qty * localPrice;

      const grossSuppAmount = qty * suppPrice;

      const localAmount =
        grossLocalAmount - (grossLocalAmount * discPerc) / 100;

      const suppAmount = grossSuppAmount - (grossSuppAmount * discPerc) / 100;

      return {
        COMPANY_ID: this.selected_Company_id,

        STORE_ID: this.newGrnData.STORE_ID,

        PO_DETAIL_ID: item.PO_DETAIL_ID,

        ITEM_ID: item.ITEM_ID,

        QUANTITY: qty,

        RATE: localPrice,

        AMOUNT: Number(localAmount.toFixed(2)),

        DISC_PERCENT: discPerc,

        SUPP_PRICE: suppPrice,

        SUPP_AMOUNT: Number(suppAmount.toFixed(2)),

        UOM_PURCH: item.UOM_PURCH,

        UOM: item.UOM,

        COST: qty > 0 ? Number((suppAmount / qty).toFixed(2)) : 0,
      };
    });

    // =====================================
    // GRN DETAILS
    // =====================================

    this.newGrnData.GRNDetails = [...bindedData];

    // =====================================
    // GRN ITEM COST
    // =====================================

    this.newGrnData.GRN_Item_Cost = [];

    this.poDetails.forEach((item: any) => {
      this.costingMethodDataGrid.forEach((costItem: any) => {
        const proportionalValue =
          (Number(item.AMOUNT || 0) / Number(this.LocalNetAmount || 1)) *
          Number(costItem.TOTAL || 0);

        this.newGrnData.GRN_Item_Cost.push({
          STORE_ID: this.newGrnData.STORE_ID,

          COST_ID: costItem.ID,

          ITEM_ID: item.ITEM_ID,

          SUPP_AMOUNT: proportionalValue.toFixed(2),
        });
      });
    });

    console.log(this.newGrnData.GRN_Item_Cost, 'GRN_Item_Cost');

    this.ref.detectChanges();
  }

  // onGrnContentReady(e: any) {
  //   console.log(e, 'content ready');
  //   console.log(this.poDetails, 'hhhh');

  //   this.newGrnData.GRN_Item_Cost = [];

  //   if (this.costingMethodDataGrid && this.poDetails) {
  //     this.costingMethodDataGrid.forEach((costingRow: any) => {
  //       // Extract the description from costingMethodDataGrid
  //       const description = costingRow.DESCRIPTION.toUpperCase();

  //       // Filter all matching rows in poDetails using the description
  //       const matchingRows = this.poDetails.filter((poRow: any) =>
  //         Object.keys(poRow).some((key) => key.toUpperCase() === description)
  //       );

  //       console.log(matchingRows, 'Matching Rows');

  //       if (matchingRows.length > 0) {
  //         matchingRows.forEach((matchingRow: any) => {
  //           // Find the existing entry in GRN_Item_Cost using the description heading

  //           this.newGrnData.GRN_Item_Cost.push({
  //             DESCRIPTION: description,
  //             STORE_ID: this.newGrnData.STORE_ID,
  //             COST_ID: costingRow.ID,
  //             ITEM_ID: matchingRow.ITEM_ID, // Add ITEM_ID from the matching row
  //             AMOUNT: matchingRow[description],
  //           });

  //           console.log(this.newGrnData.GRN_Item_Cost, 'ggg');
  //         });
  //       } else {
  //         console.log(
  //           `No matching rows found in poDetails for description: ${description}`
  //         );
  //       }
  //     });

  //     console.log(this.newGrnData.GRN_Item_Cost, 'Updated GRN_Item_Cost Data');
  //   } else {
  //     console.warn('Data sources are not available.');
  //   }

  //   this.newGrnData.GRNDetails.forEach((detail: any) => {
  //     // Find the matching entry in poDetails
  //     const matchingPoDetail = this.poDetails.find(
  //       (poDetail: any) => poDetail.ITEM_ID === detail.ITEM_ID
  //     );

  //     console.log(matchingPoDetail, '()()');

  //     if (matchingPoDetail) {
  //       // Update COST in GRNDetails with the COST from poDetails
  //       detail.COST = matchingPoDetail.UNIT_COST;
  //     }
  //   });

  //   console.log(this.newGrnData.GRNDetails, 'newGrnData.GRNDetails');
  // }

  getTotalQuantity(): any {
    return this.poDetails.reduce(
      (total: any, item: any) => total + (item.QUANTITY || 0),
      0,
    );
  }

  onPurchaseOrderSelected(event: any): void {
    const selectedRow = event.selectedRowsData[0];

    if (!selectedRow) return;

    console.log(selectedRow, 'Selected PO Row');

    // Update only PO-related fields
    this.newGrnData.PO_ID = selectedRow.PO_ID;
    this.newGrnData.PO_NO = selectedRow.PO_NO;

    // Only update supplier if it's coming from PO
    if (selectedRow.SUPP_ID) {
      this.newGrnData.SUPP_ID = selectedRow.SUPP_ID;
      this.newGrnData.SUPPPLIER_NAME = selectedRow.SUPP_NAME || '';
    }

    // Do NOT reset other existing fields like STORE_ID, CURRENCY_ID, etc.

    // Update PO details with costing methods
    this.poDetails = this.poDetails.map((item: any) => {
      const updatedItem = { ...item };

      this.costingMethodDataGrid.forEach((costItem: any) => {
        const key = costItem.DESCRIPTION.toUpperCase();
        updatedItem[key] = costItem.TOTAL;
      });

      return updatedItem;
    });

    console.log(this.poDetails, 'Updated poDetails');

    this.ref.detectChanges();
  }

  onCostingGridValueChanged(event: any): void {
    const updatedRow = event.data; // The row being edited
    const rate = Number(updatedRow.RATE); // New rate value

    // Check if the CURRENCY contains '%' and calculate TOTAL accordingly
    if (updatedRow.CURRENCY && updatedRow.CURRENCY.includes('%')) {
      updatedRow.TOTAL = (
        (Number(this.LocalNetAmount || 1) * rate) /
        100
      ).toFixed(2);
    } else {
      updatedRow.TOTAL = rate;
    }

    // Update the poDetails data grid
    this.poDetails = this.poDetails.map((item: any) => {
      const updatedItem = { ...item };

      // Update the specific cost value for this row
      if (updatedRow.DESCRIPTION) {
        const key = updatedRow.DESCRIPTION.toUpperCase();
        updatedItem[key] = (
          (Number(item.AMOUNT) / Number(this.newGrnData.NET_AMOUNT)) *
          Number(updatedRow.TOTAL)
        ).toFixed(2);
      }

      // Update the total cost for the item
      const sumCost = this.costingMethodDataGrid.reduce(
        (sum: any, costItem: any) => {
          const costKey = costItem.DESCRIPTION.toUpperCase();
          return sum + (Number(updatedItem[costKey]) || 0);
        },
        0,
      );

      updatedItem.TOTAL_COST = (Number(item.AMOUNT) + sumCost).toFixed(2);

      // Ensure RECEIVED_QTY is greater than zero to avoid division by zero
      if (Number(item.RECEIVED_QTY) > 0) {
        updatedItem.UNIT_COST = (
          Number(updatedItem.TOTAL_COST) / Number(item.RECEIVED_QTY)
        ).toFixed(2);
      } else {
        updatedItem.UNIT_COST = '0.00'; // Default value if RECEIVED_QTY is zero or undefined
      }

      return updatedItem;
    });

    console.log(this.costingMethodDataGrid, 'Updated Costing Method Data Grid');
    console.log(this.poDetails, 'Updated PO Details');

    // Trigger UI update
    this.ref.detectChanges();
  }

  openCostPopup() {
    this.isCostPopUpOpened = true;
  }

  onCostContentReady(e: any) {
    this.newGrnData.GRN_Cost = [];
    const grnCost = this.costingMethodDataGrid.map((landedCost: any) => {
      const COST_ID = landedCost.DESCRIPTION; // or use landedCost.COST_ID if available
      const STORE_ID = this.newGrnData.STORE_ID; // Assuming STORE_ID is available in newGrnData
      let PERCENT = 0;
      let AMOUNT = 0;
      let AMOUNT_FC = 0;

      // If IS_FIXED_AMOUNT is false, use VALUE as PERCENT
      if (!landedCost.IS_FIXED_AMOUNT) {
        PERCENT = landedCost.RATE;
        if (landedCost.IS_LOCAL_CURRENCY) {
          AMOUNT = landedCost.RATE; // Store in AMOUNT if IS_LOCAL_CURRENCY is true
          AMOUNT_FC = 0; // No foreign currency amount
        } else {
          AMOUNT_FC = landedCost.RATE; // Store in AMOUNT_FC if IS_LOCAL_CURRENCY is false
          AMOUNT = 0; // No local currency amount
        }
      } else {
        // If IS_FIXED_AMOUNT is true, store VALUE in AMOUNT and AMOUNT_FC based on IS_LOCAL_CURRENCY
        if (landedCost.IS_LOCAL_CURRENCY) {
          AMOUNT = landedCost.RATE; // Store in AMOUNT if IS_LOCAL_CURRENCY is true
          AMOUNT_FC = 0; // No foreign currency amount
        } else {
          AMOUNT_FC = landedCost.RATE; // Store in AMOUNT_FC if IS_LOCAL_CURRENCY is false
          AMOUNT = 0; // No local currency amount
        }
      }

      return {
        STORE_ID: STORE_ID,
        COST_ID: landedCost.ID, // Assuming COST_ID is available in landedCost data
        PERCENT: PERCENT,
        AMOUNT_FC: AMOUNT_FC.toFixed(2), // Format AMOUNT_FC as needed
        AMOUNT: AMOUNT.toFixed(2), // Format AMOUNT as needed
      };
    });

    this.newGrnData.GRNDetails.forEach((detail: any) => {
      // Find the matching entry in poDetails
      const matchingPoDetail = this.poDetails.find(
        (poDetail: any) => poDetail.ITEM_ID === detail.ITEM_ID,
      );

      console.log(matchingPoDetail, '()()');

      if (matchingPoDetail) {
        // Update COST in GRNDetails with the COST from poDetails
        detail.COST = matchingPoDetail.UNIT_COST;
      }
    });

    this.newGrnData.GRN_Cost.push(...grnCost);

    console.log(this.newGrnData.GRN_Cost, 'this.newGrnData.GRN_Cost');
    console.log(this.newGrnData.GRNDetails, 'this.newGrnData.GRNDetails');
  }

  getLandedCostDropDownData() {
    this.service.getDropdownData('LANDED_COST').subscribe((res: any[]) => {
      this.landedCostDropDown = res;

      console.log(this.landedCostDropDown, 'Filtered Landed Cost DropDown');
    });
  }

  onCostDropdownValueChanged(e: any) {
    console.log(e, 'evenyt');
    const id = e.value; // Get the selected ID
    const selectedCost = this.landedCostList.find(
      (cost: any) => cost.ID === id,
    ); // Find the cost by ID

    if (selectedCost) {
      console.log(selectedCost, '+++');

      this.costData.ID = id;

      this.costData.DESCRIPTION = selectedCost.DESCRIPTION;

      const baseCurrency = selectedCost.IS_LOCAL_CURRENCY
        ? this.localCurrencySymbol
        : this.currencySymbol;

      this.costData.CURRENCY = selectedCost.IS_FIXED_AMOUNT
        ? baseCurrency
        : `${baseCurrency} %`;

      // Bind the value to costRate based on IS_FIXED_AMOUNT
      this.costData.RATE = selectedCost.VALUE;

      this.costData.TOTAL = selectedCost.IS_FIXED_AMOUNT
        ? this.costData.RATE
        : ((this.LocalNetAmount * this.costData.RATE) / 100) | 0;
    } else {
      console.log(`No matching cost found for ID: ${id}`);
    }
  }

  saveCost() {
    console.log(this.costData);

    // Check if costData is valid and contains necessary fields
    if (this.costData && this.costData.ID && this.costData.DESCRIPTION) {
      const isExistingCost = this.costingMethodDataGrid.some(
        (cost: any) => cost.DESCRIPTION === this.costData.DESCRIPTION,
      );

      if (isExistingCost) {
        notify(
          {
            message: `${this.costData.DESCRIPTION} already exists.`,
            position: { at: 'top right', my: 'top right' },
          },
          'error',
          2000,
        );
        return; // Exit the function
      }

      // Add only the last added cost to updatedItem
      const lastAddedCost =
        this.costingMethodDataGrid[this.costingMethodDataGrid.length - 1];

      console.log(lastAddedCost, 'lastaddedcost');
      if (lastAddedCost) {
        const key = lastAddedCost.DESCRIPTION.toUpperCase(); // Standardize key
        this.poDetails = this.poDetails.map((item: any) => {
          const updatedItem = { ...item };

          console.log(updatedItem, '!!!!!!!!!');

          // Calculate the value dynamically for the last added cost
          updatedItem[key] =
            (updatedItem.AMOUNT / this.newGrnData.NET_AMOUNT) *
            lastAddedCost.RATE;

          // Update the total cost for the item
          const sumCost = this.costingMethodDataGrid.reduce(
            (sum: any, costItem: any) => {
              const costKey = costItem.DESCRIPTION.toUpperCase();
              return sum + (Number(updatedItem[costKey]) || 0);
            },
            0,
          );

          console.log(sumCost, 'sumcost');

          updatedItem.TOTAL_COST = (Number(item.AMOUNT) + sumCost).toFixed(2);

          console.log(updatedItem.TOTAL_COST, 'totalcost');

          // Ensure RECEIVED_QTY is greater than zero to avoid division by zero
          if (Number(item.RECEIVED_QTY) > 0) {
            const suppAmount =
              Number(item.SUPP_PRICE || 0) * Number(item.RECEIVED_QTY || 0);

            const discountAmount =
              (suppAmount * Number(item.DISC_PERCENT || 0)) / 100;

            const netAmount = suppAmount - discountAmount;

            updatedItem.UNIT_COST = (
              netAmount / Number(item.RECEIVED_QTY || 0)
            ).toFixed(2);

            updatedItem.COST = updatedItem.UNIT_COST;
          } else {
            updatedItem.UNIT_COST = '0.00'; // Default value if RECEIVED_QTY is zero or undefined
          }

          return updatedItem;
        });
      }

      // Add the costData to costingMethodDataGrid
      this.costingMethodDataGrid.push({
        ID: this.costData.ID,
        DESCRIPTION: this.costData.DESCRIPTION,
        CURRENCY: this.costData.CURRENCY,
        RATE: this.costData.RATE,
        TOTAL: this.costData.TOTAL,
      });

      // Optionally, reset costData if needed
      this.costData = {};
      this.isCostPopUpOpened = false;
      console.log(this.costingMethodDataGrid, 'Updated costingMethodDataGrid');
    } else {
      console.error(
        'Invalid costData. Ensure all required fields are populated.',
      );
    }
  }

  cancelCost() {
    this.isCostPopUpOpened = false;
  }

  clearForm() {
    console.log('formclosed');
    this.newGrnData.SUPP_ID = 0;
    // Reset other variables
    this.updatedItems = [];
    this.newGrnData.STORE_ID = 0;

    this.poDetails = [];

    this.currencySymbol = '';
    this.newGrnData.NARRATION = '';

    this.totalQuantity = 0;
    this.totalNetAmount = 0;

    // Close any opened grid boxes
    this.isGridBoxOpened = false;

    // Reset date to today's date
    this.today = new Date();

    // Clear selected PO number
    this.selectedPONo = '';

    this.newGrnData.IS_APPROVED = false;

    // Trigger change detection to update the UI
    this.ref.detectChanges();
  }

  onRowRemoved(e: any) {
    const removed = e.data;
    console.log('Removed row:', removed);

    // 1. Remove from poDetails
    this.poDetails = this.poDetails.filter(
      (item: any) =>
        !(
          item.ITEM_ID === removed.ITEM_ID &&
          item.PO_DETAIL_ID === removed.PO_DETAIL_ID
        ),
    );

    // 2. Remove from demoArray
    this.demoArray = this.demoArray.filter(
      (item: any) =>
        !(
          item.ITEM_ID === removed.ITEM_ID &&
          item.PO_DETAIL_ID === removed.PO_DETAIL_ID
        ),
    );

    // 3. Remove from updatedItems
    this.updatedItems = this.updatedItems.filter(
      (item) =>
        !(
          item.ITEM_ID === removed.ITEM_ID &&
          item.PO_DETAIL_ID === removed.PO_DETAIL_ID
        ),
    );

    // 4. Remove from GRNDetails
    if (Array.isArray(this.newGrnData.GRNDetails)) {
      this.newGrnData.GRNDetails = this.newGrnData.GRNDetails.filter(
        (item: any) =>
          !(
            item.ITEM_ID === removed.ITEM_ID &&
            item.PO_DETAIL_ID === removed.PO_DETAIL_ID
          ),
      );
    }

    // 5. Remove related GRN_Item_Cost
    if (Array.isArray(this.newGrnData.GRN_Item_Cost)) {
      this.newGrnData.GRN_Item_Cost = this.newGrnData.GRN_Item_Cost.filter(
        (cost: any) => cost.ITEM_ID !== removed.ITEM_ID,
      );
    }

    // 6. Recalculate totals
    this.totalQuantity = this.poDetails.reduce(
      (sum: any, item: any) => sum + Number(item.RECEIVED_QTY || 0),
      0,
    );

    this.newGrnData.NET_AMOUNT = this.poDetails
      .reduce((sum: any, item: any) => sum + Number(item.AMOUNT || 0), 0)
      .toFixed(2);

    this.newGrnData.SUPP_NET_AMOUNT = this.poDetails
      .reduce((sum: any, item: any) => sum + Number(item.SUPP_AMOUNT || 0), 0)
      .toFixed(2);

    this.LocalNetAmount = this.newGrnData.NET_AMOUNT;

    this.formattedLocalNetAmount = `${this.newGrnData.NET_AMOUNT}`;
    this.formattedNetAmount = `${this.newGrnData.SUPP_NET_AMOUNT}`;

    // 7. Recalculate costing (IMPORTANT)
    this.costingMethodDataGrid = this.costingMethodDataGrid.map((row: any) => {
      if (row.CURRENCY.includes('%')) {
        row.TOTAL = (
          (Number(this.LocalNetAmount || 0) * Number(row.RATE || 0)) /
          100
        ).toFixed(2);
      }
      return row;
    });

    // 8. Force UI refresh
    this.poDetails = [...this.poDetails];

    console.log('After delete → poDetails:', this.poDetails);
  }

  getSuppAmountValue = (rowData: any) => {
    const qty = Number(rowData.RECEIVED_QTY || 0);

    const suppPrice = Number(rowData.SUPP_PRICE || 0);

    const discPerc = Number(rowData.DISC_PERCENT || rowData.DISC_PERC || 0);

    const grossAmount = qty * suppPrice;

    const discount = (grossAmount * discPerc) / 100;

    return (grossAmount - discount).toFixed(2);
  };

  getAmountValue = (rowData: any) => {
    const qty = Number(rowData.RECEIVED_QTY || 0);

    const price = Number(rowData.PRICE || 0);

    const discPerc = Number(rowData.DISC_PERCENT || rowData.DISC_PERC || 0);

    const grossAmount = qty * price;

    const discount = (grossAmount * discPerc) / 100;

    return (grossAmount - discount).toFixed(2);
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
    DxValidatorModule,
    DxProgressBarModule,
    DxTabsModule,
    DxTabPanelModule,
    DxPopupModule,
    DxButtonModule,
    DxDropDownBoxModule,
  ],
  providers: [],
  declarations: [GrnNewFormComponent],
  exports: [GrnNewFormComponent],
})
export class GrnNewFormModule {}
