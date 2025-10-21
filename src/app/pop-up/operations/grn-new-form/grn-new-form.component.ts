import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgModule,
  OnInit,
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
    GRN_DATE: new Date(),
    COMPANY_ID: 1,
    USER_ID: 1,
    STORE_ID: '',
    PO_ID: '',
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

    GRNDetails: [
      {
        ID: 0,
        COMPANY_ID: 1,
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
        PERCENT: '',
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
  getNewGrnData = () => ({
    ...this.newGrnData,
    GRNDetails: this.demoArray,
    GRN_DATE: new Date(),
  });

  // add.component.ts
  clearDemoArray() {
    this.demoArray = [];
    console.log('✅ demoArray cleared');
  }

  constructor(private service: DataService, private ref: ChangeDetectorRef) {
    this.today = new Date();
    const settingsData = sessionStorage.getItem('settings');
    const data = settingsData ? JSON.parse(settingsData) : null;
    // Access CURRENCY_ID
    this.localCurrencyId = data ? data.CURRENCY_ID : null;
    console.log(this.localCurrencyId, 'CURRENCY_ID');
    this.localCurrencySymbol = data ? data.CURRENCY_SYMBOL : null;
    console.log(this.grnData.GRN_DATE, 'grndate');
    console.log(this.grnData);
  }

  highlightEditableColumns(event: any) {
    if (event.rowType === 'data' && event.column.allowEditing) {
      // Apply a custom style for editable cells
      event.cellElement.style.backgroundColor = '#130452ff'; // Soft yellow background
      event.cellElement.style.color = '#dfddd9ff'; // Dark yellow text
      event.cellElement.style.fontWeight = 'bold';
    }
  }

  // purchaseOrderDataSource:any = [
  //   {
  //     PO_NO: 'PO12345',
  //     PO_DATE: '2025-01-01',
  //     SUPPLIER: 'Supplier 1'
  //   },
  //   {
  //     PO_NO: 'PO12346',
  //     PO_DATE: '2025-01-02',
  //     SUPPLIER: 'Supplier 2'
  //   },
  //   {
  //     PO_NO: 'PO12347',
  //     PO_DATE: '2025-01-03',
  //     SUPPLIER: 'Supplier 3'
  //   }
  // ];

  selectedPONo: any;

  // onSelectionChanged(event: any) {
  //   const selectedRow = event.selectedRowsData[0];
  //   console.log(selectedRow,"selectedRow")
  //   if (selectedRow) {
  //     this.selectedPONo = selectedRow.PO_NO;
  //     console.log(this.selectedPONo,"selectedpono")
  //   }
  // }
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
    this.service.getGrnPoDetails(poId).subscribe((res: any) => {
      console.log(res, 'res');

      // Populate poDetails with dynamic SL_NO and other calculations
      this.poDetails = res.Podetails.map((item: any, index: number) => ({
        ...item,
        SL_NO: index + 1, // Add SL_NO property dynamically
        QTY_TO_RECEIVE: item.QUANTITY - item.GRN_QTY,
        SUPP_PRICE: item.SUPP_PRICE.toFixed(2),
        UNIT_COST: 0,
      }));

      this.cwidth = '100';
      this.currencySymbol =
        res.Podetails.length > 0 ? res.Podetails[0].CURRENCY_SYMBOL : ''; // Extract the first item's currency symbol
      console.log(this.poDetails, 'Updated poDetails with SL_NO');

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
        this.poDetails[0].SUPP_GROSS_AMOUNT
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
          PERCENT,
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
              (cost) => cost.DESCRIPTION === item.DESCRIPTION
            )
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
      .getPendingPo(storeid, this.supplierId)
      .subscribe((res: any) => {
        this.poList = res.data;
        this.filteredPOList = [...this.poList];
      });
  }
  onSupplierValueChanged(e: any) {
    console.log(e, 'supplier event');
    const supplierid = e.value;
    this.supplierId = supplierid;
    if (!supplierid) {
      // If no supplier is selected, reset the list to all purchase orders
      this.filteredPOList = [...this.poList];
    } else {
      // Filter the purchase order list based on the selected supplier ID
      this.filteredPOList = this.poList.filter(
        (po) => po.SUPP_ID === supplierid
      );
    }
  }
  // getSupplierData() {
  //   this.service.getDropdownData('SUPPLIER').subscribe((res) => {
  //     this.supplierList = res;
  //   });
  // }

  get_Supplier_dropdown() {
    this.service.Supplier_Dropdown().subscribe((res: any) => {
      console.log('supplier dropdown', res);
      this.supplierList = res;
    });
  }

  getStoreData() {
    this.service.getDropdownData('STORE').subscribe((res) => {
      this.storeList = res;
    });
  }

  // getPurchaseOrderList(){
  //   this.service.getPurchaseOrderList().subscribe((res:any)=>{
  //     this.poList=res.data;
  //     this.filteredPOList=[...this.poList];
  //   })
  // }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');

    this.selected_Company_id = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id=============='
    );

    this.selected_fin_id = this.sessionData.FINANCIAL_YEARS[0].FIN_ID;

    console.log(
      this.selected_fin_id,
      '===========selected fin id==================='
    );
    const sessionYear = this.sessionData.FINANCIAL_YEARS;
    console.log(sessionYear, '==================session year==========');
    this.financialYeaDate = sessionYear[0].DATE_FROM;
    console.log(
      this.financialYeaDate,
      '=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[['
    );
    this.formatted_from_date = this.financialYeaDate;

    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  updateCell(event: any) {
    console.log(event, 'event');
    const updatedRow = { ...event.oldData, ...event.data };
    console.log(updatedRow, 'updatedRow');
    // const updatedRow = event.key; // Get the updated row
    const updatedData = event.data; // Get the updated data
    console.log(updatedData, 'updateddata');
    console.log(updatedRow, 'full updatedRow');

    // const demmoArray=push.updateData

    // Ensure demoArray is initialized
    if (!Array.isArray(this.demoArray)) {
      this.demoArray = [];
    }

    // Optionally match on ITEM_ID or PO_DETAIL_ID (adjust based on your key fields)
    const index = this.demoArray.findIndex(
      (item) =>
        item.ITEM_ID === updatedData.ITEM_ID &&
        item.PO_DETAIL_ID === updatedData.PO_DETAIL_ID
    );
    const enrichedData = {
      ...updatedData,
      ITEM_NAME: updatedRow.DESCRIPTION || updatedData.DESCRIPTION || '', // or whatever the field is
      STORE_NAME: updatedRow.STORE_NAME || updatedData.STORE_NAME || '',
      AMOUNT: (updatedRow.RECEIVED_QTY || 0) * (updatedRow.PRICE || 0),
      SUPP_AMOUNT:
        (updatedRow.RECEIVED_QTY || 0) * (updatedRow.SUPP_PRICE || 0),
    };
    console.log(enrichedData, 'enrichedData');

    // const enrichedData = {
    //   ...updatedRow, // full row data
    //   ITEM_NAME: updatedRow.DESCRIPTION ?? '',
    //   STORE_NAME: updatedRow.STORE_NAME ?? '',
    //   AMOUNT:
    //     (Number(updatedRow.RECEIVED_QTY) || 0) *
    //     (Number(updatedRow.PRICE) || 0),
    //   SUPP_AMOUNT:
    //     (Number(updatedRow.RECEIVED_QTY) || 0) *
    //     (Number(updatedRow.SUPP_PRICE) || 0),
    // };

    console.log(enrichedData, 'enrichedData ✅');
    if (index > -1) {
      // Update existing entry
      this.demoArray[index] = { ...this.demoArray[index], ...enrichedData };
    } else {
      // Push new entry
      this.demoArray.push({ ...enrichedData });
    }

    console.log(this.demoArray, '✅ demoArray (stored updated rows)');
    // this.GRNDetails

    if ('RECEIVED_QTY' in updatedData) {
      const receivedQty = Number(updatedData.RECEIVED_QTY);
      console.log(receivedQty, 'receivedQty');
      const uomMultiple = Number(updatedRow.UOM_MULTIPLE);
      const price = Number(updatedRow.SUPP_PRICE);
      console.log(price, 'price');
      const localprice = Number(updatedRow.PRICE);
      const qtyToReceive = Number(updatedRow.QTY_TO_RECEIVE);

      if (receivedQty > qtyToReceive) {
        // Show a notification if the condition is met

        notify(
          {
            message: "Qty received can't be higher than qty pending",
            position: { at: 'top right', my: 'top right' },
          },
          'error',
          2000
        );

        // Optionally reset the RECEIVED_QTY field or prevent further processing
        updatedRow.RECEIVED_QTY = ''; // Reset to QTY_TO_RECEIVE value

        return; // Exit the function to prevent further processing
      }

      const baseUnitValue = receivedQty / uomMultiple; // Convert to base unit
      console.log(baseUnitValue, 'baseUnitValue');
      // Format the QTY_BASE_UNIT as "<calculated value> <UOM>"
      updatedRow.QTY_BASE_UNIT = `${baseUnitValue} ${updatedRow.UOM}`;
      console.log(updatedRow.QTY_BASE_UNIT, 'updatedRow.QTY_BASE_UNIT');
      // Calculate the amount
      updatedRow.SUPP_AMOUNT = (receivedQty * price).toFixed(2); // Format to 2 decimal places
      console.log(updatedRow.SUPP_AMOUNT, 'updatedRow.SUPP_AMOUNT');

      updatedRow.AMOUNT = (receivedQty * localprice).toFixed(2); // Format to 2 decimal places

      // 🔑 Find and replace in poDetails
      const idx = this.poDetails.findIndex(
        (r) =>
          r.PO_DETAIL_ID === updatedRow.PO_DETAIL_ID &&
          r.ITEM_ID === updatedRow.ITEM_ID
      );

      if (idx > -1) {
        this.poDetails[idx] = { ...this.poDetails[idx], ...updatedRow };
        this.poDetails = [...this.poDetails]; // force Angular to detect change
      }

      console.log(this.poDetails[idx], '✅ Updated row now bound to grid');

      this.totalQuantity = this.poDetails.reduce((sum, item) => {
        return sum + Number(item.RECEIVED_QTY || 0);
      }, 0);
      console.log(this.poDetails, 'poDetails');

      this.newGrnData.NET_AMOUNT = this.poDetails
        .reduce((sum, item) => {
          return sum + Number(item.AMOUNT || 0);
        }, 0)
        .toFixed(2); // Ensure the total is also formatted with 2 decimal places
      console.log(this.newGrnData.NET_AMOUNT, 'net amount');
      this.LocalNetAmount = this.poDetails
        .reduce((sum, item) => {
          return sum + Number(item.AMOUNT || 0);
        }, 0)
        .toFixed(2); // Ensure the total is also formatted with 2 decimal places

      this.newGrnData.SUPP_NET_AMOUNT = this.poDetails
        .reduce((sum, item) => {
          return sum + Number(item.SUPP_AMOUNT || 0);
        }, 0)
        .toFixed(2); // Ensure the total is also formatted with 2 decimal places

      this.formattedLocalNetAmount = `${this.newGrnData.NET_AMOUNT}`;

      this.formattedNetAmount = `${this.newGrnData.SUPP_NET_AMOUNT}`;

      // Update costingMethodDataGrid for rows with CURRENCY as 'USD %'
      this.costingMethodDataGrid = this.costingMethodDataGrid.map((row) => {
        if (row.CURRENCY.includes('%')) {
          row.TOTAL = ((this.LocalNetAmount * row.RATE) / 100).toFixed(2);
        }
        return row;
      });

      let totalCost = Number(updatedRow.AMOUNT);

      // Reflect costingMethodDataGrid's Description data
      this.poDetails = this.poDetails.map((item) => {
        let sumCost = 0; // Initialize sumCost for the current row

        this.costingMethodDataGrid.forEach((costItem) => {
          const proportionalValue =
            (Number(item.AMOUNT) / Number(this.LocalNetAmount)) *
            Number(costItem.TOTAL);

          // Add the proportional value to the item's respective field
          item[costItem.DESCRIPTION.toUpperCase()] =
            proportionalValue.toFixed(2);

          // Accumulate the proportional value in sumCost
          sumCost += proportionalValue;

          console.log(sumCost, '%%%%');
        });

        // Add the total cost (sumCost + AMOUNT) to the item
        const totalCost = (Number(item.AMOUNT) + sumCost).toFixed(2);
        console.log(totalCost, 'totalCost');
        // Ensure RECEIVED_QTY is greater than zero to avoid division by zero
        if (Number(item.RECEIVED_QTY) > 0) {
          item.UNIT_COST = (
            Number(totalCost) / Number(item.RECEIVED_QTY)
          ).toFixed(2);
        } else {
          item.UNIT_COST = '0.00'; // Default value if RECEIVED_QTY is zero or undefined
        }

        return item;
      });

      console.log(this.poDetails, 'Updated poDetails with costing data');

      // Add the updated row to the array of updated items
      const existingIndex = this.updatedItems.findIndex(
        (item) => item.SL_NO === updatedRow.SL_NO
      );

      if (existingIndex > -1) {
        // Update the existing row in the array
        this.updatedItems[existingIndex] = { ...updatedRow };
      } else {
        // Add the new row to the array
        this.updatedItems.push({ ...updatedRow });
      }

      console.log(this.updatedItems, 'All Updated Rows');

      const bindedData = this.updatedItems.map((item) => ({
        COMPANY_ID: 1, // Static value or dynamically set if needed
        STORE_ID: this.newGrnData.STORE_ID,
        PO_DETAIL_ID: item.PO_DETAIL_ID,
        ITEM_ID: item.ITEM_ID,
        QUANTITY: Number(item.RECEIVED_QTY),
        RATE: Number(item.PRICE),
        // SUPP_AMOUNT: Number(item.LOCAL_AMOUNT),
        AMOUNT: Number(item.PRICE * item.RECEIVED_QTY),
        DISC_PERCENT: Number(item.DISC_PERCENT),

        SUPP_PRICE: Number(item.SUPP_PRICE),
        SUPP_AMOUNT: Number(item.RECEIVED_QTY * item.SUPP_PRICE),
        UOM_PURCH: item.UOM_PURCH,
        UOM: item.UOM,
        COST: item.UNIT_COST,
      }));

      console.log(bindedData, 'binded data');

      // Ensure GRNDetail is initialized as an array if not already
      // if (!Array.isArray(this.newGrnData.GRNDetails)) {
      //   this.newGrnData.GRNDetails = [];
      // }

      // Add only unique items to GRNDetail
      bindedData.forEach((item) => {
        const isDuplicate = this.newGrnData.GRNDetails.some(
          (existingItem) =>
            existingItem.PO_DETAIL_ID === item.PO_DETAIL_ID &&
            existingItem.ITEM_ID === item.ITEM_ID
        );

        if (!isDuplicate) {
          this.newGrnData.GRNDetails.push(item);
        }
      });

      //     // Check if the item already exists in PoDetails
      //   const detailItemIndex = this.grnData.GRNDetails.findIndex(
      //     (detailItem: any) => detailItem.ITEM_ID === bindedData.ITEM_ID
      // );

      // if (detailItemIndex !== -1) {
      //     // If item already exists in PoDetails, update it
      //     this.poData.PoDetails[detailItemIndex] = { ...detailItem };
      // } else {
      //     // If item does not exist, add it to PoDetails
      //     this.poData.PoDetails.push({ ...detailItem });
      // }

      // Add GRN_Item_Cost
      if (!Array.isArray(this.newGrnData.GRN_Item_Cost)) {
        this.newGrnData.GRN_Item_Cost = [];
      }

      this.costingMethodDataGrid.forEach((costItem) => {
        console.log(costItem, 'costitem');
        // Calculate the proportional value for the cost item
        const proportionalValue =
          (Number(updatedRow.AMOUNT) / Number(this.LocalNetAmount)) *
          Number(costItem.TOTAL);

        // Create the cost data object
        const costData = {
          STORE_ID: this.newGrnData.STORE_ID,
          COST_ID: costItem.ID, // Use the DESCRIPTION field for COST_ID
          ITEM_ID: updatedRow.ITEM_ID,
          SUPP_AMOUNT: proportionalValue.toFixed(2), // Use the calculated proportional value for AMOUNT
        };

        // Check for duplicates before adding to GRN_Item_Cost
        const isDuplicate = this.newGrnData.GRN_Item_Cost.some(
          (existingCost) =>
            existingCost.STORE_ID === costData.STORE_ID &&
            existingCost.COST_ID === costData.COST_ID &&
            existingCost.ITEM_ID === costData.ITEM_ID
        );

        if (!isDuplicate) {
          this.newGrnData.GRN_Item_Cost.push(costData);
        }
      });

      console.log(
        this.newGrnData.GRN_Item_Cost,
        'Updated GRN_Item_Cost with Proportional Values'
      );
    }

    this.newGrnData.GRNDetails = {
      ID: updatedData.ID,
      COMPANY_ID: updatedData.COMPANY_ID,
      STORE_ID: updatedData.STORE_ID || 0,
      PO_DETAIL_ID: updatedData.PO_DETAIL_ID || 0,
      GRN_ID: 0,
      ITEM_ID: updatedData.ITEM_ID || 0,
      QUANTITY: Number(updatedData.RECEIVED_QTY || 0),
      RATE: Number(updatedData.PRICE || 0),
      // LOCAL_AMOUNT: Number(updatedData.LOCAL_AMOUNT || 0),
      AMOUNT: Number(updatedData.AMOUNT || 0),
      INVOICE_QTY: 0,
      DISC_PERCENT: Number(updatedData.DISC_PERCENT || 0),
      COST: Number(updatedData.UNIT_COST || 0),
      SUPP_PRICE: Number(updatedData.SUPP_PRICE || 0),
      SUPP_AMOUNT: Number(updatedData.SUPP_AMOUNT || 0),
      RETURN_QTY: 0,
      UOM_PURCH: updatedData.UOM_PURCH || '',
      UOM: updatedData.UOM || '',
      UOM_MULTIPLE: Number(updatedData.UOM_MULTIPLE || 1),
      STORE_NAME: updatedData.STORE_NAME || '',
      ITEM_NAME: updatedData.DESCRIPTION || '',
      ITEM_CODE: updatedData.ITEM_CODE || '',
      PO_QUANTITY: Number(updatedData.QUANTITY || 0),
      GRN_QUANTITY: Number(updatedData.GRN_QTY || 0),
    };

    console.log(this.newGrnData.GRNDetails, '✅ Transformed GRNDetails');
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
      (total, item) => total + (item.QUANTITY || 0),
      0
    );
  }

  onPurchaseOrderSelected(event: any): void {
    const selectedRow = event.selectedRowsData[0];

    if (!selectedRow) return;

    console.log(selectedRow, 'Selected PO Row');

    // Update only PO-related fields
    this.newGrnData.PO_ID = selectedRow.ID;
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

  // onPurchaseOrderSelected(event: any): void {
  //   const selectedRow = event.selectedRowsData[0];

  //   console.log(selectedRow, 'selected row');

  //   //   // Bind the supplier ID from the selected row to the dx-select-box
  //   this.newGrnData.SUPP_ID = 132;
  //   //103

  //   this.poDetails = this.poDetails.map((item: any) => {
  //     const updatedItem = { ...item };

  //     // Dynamically add columns based on costingMethodDataGrid
  //     this.costingMethodDataGrid.forEach((costItem: any) => {
  //       const key = costItem.DESCRIPTION.toUpperCase(); // Standardize key
  //       updatedItem[key] = costItem.TOTAL; // Add TOTAL value
  //     });

  //     return updatedItem;
  //   });

  //   console.log(this.poDetails, 'Updated poDetails');

  //   this.ref.detectChanges();
  // }

  // calculateQuantity = (rowData: any) => {
  //   // Return static values based on some condition or row data
  //   console.log(rowData,"+++")
  //   if (rowData.id === 1) {
  //     return 100;
  //   } else if (rowData.id === 2) {
  //     return 50;
  //   }
  //   return 0; // Default value
  // };

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
      const sumCost = this.costingMethodDataGrid.reduce((sum, costItem) => {
        const costKey = costItem.DESCRIPTION.toUpperCase();
        return sum + (Number(updatedItem[costKey]) || 0);
      }, 0);

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
        (poDetail: any) => poDetail.ITEM_ID === detail.ITEM_ID
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

  ngOnInit(): void {
    // this.getSupplierData();
    this.get_Supplier_dropdown();
    this.getStoreData();
    this.sesstion_Details();
    // this.getPurchaseOrderList();
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
    const selectedCost = this.landedCostList.find((cost) => cost.ID === id); // Find the cost by ID

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
        (cost: any) => cost.DESCRIPTION === this.costData.DESCRIPTION
      );

      if (isExistingCost) {
        notify(
          {
            message: `${this.costData.DESCRIPTION} already exists.`,
            position: { at: 'top right', my: 'top right' },
          },
          'error',
          2000
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
          const sumCost = this.costingMethodDataGrid.reduce((sum, costItem) => {
            const costKey = costItem.DESCRIPTION.toUpperCase();
            return sum + (Number(updatedItem[costKey]) || 0);
          }, 0);

          console.log(sumCost, 'sumcost');

          updatedItem.TOTAL_COST = (Number(item.AMOUNT) + sumCost).toFixed(2);

          console.log(updatedItem.TOTAL_COST, 'totalcost');

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
        'Invalid costData. Ensure all required fields are populated.'
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

    // Trigger change detection to update the UI
    this.ref.detectChanges();
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
