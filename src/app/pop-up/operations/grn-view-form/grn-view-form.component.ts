import {
  ChangeDetectorRef,
  Component,
  Input,
  NgModule,
  SimpleChanges,
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
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-grn-view-form',
  templateUrl: './grn-view-form.component.html',
  styleUrls: ['./grn-view-form.component.scss'],
})
export class GrnViewFormComponent {
  @Input() formdata: any;

  financialYeaDate: string;
  selected_vat_id: any;
  sessionData: any;
  formatted_from_date: string;
  selected_fin_id: any;
  selected_Company_id: any;
  costingMethodDataGrid: any;
  localCurrencyId: any;
  localCurrencySymbol: any;
  isCostPopUpOpened: boolean = false;
  formattedLocalNetAmount: any;
  LocalNetAmount: any;
  formattedNetAmount: any;
  updatedItems: any[] = [];
  supplierList: any;
  supplierId: number = 0;
  poDetails: any;
  storeList: any;
  poList: any;
  isGridBoxOpened = false;
  totalQuantity: any = 0;
  totalNetAmount: any = 0;
  cwidth: any = 'auto';
  today: Date;
  filteredPOList: any;
  currencySymbol: any;
  dynamicColumns: any;
  landedCostDropDown: any;
  landedCostList: any;
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
  getNewGrnData = () => ({ ...this.newGrnData });

  constructor(private service: DataService, private ref: ChangeDetectorRef) {
    this.today = new Date();
    const settingsData = sessionStorage.getItem('settings');
    const data = settingsData ? JSON.parse(settingsData) : null;
    // Access CURRENCY_ID
    this.localCurrencyId = data ? data.CURRENCY_ID : null;
    console.log(this.localCurrencyId, 'CURRENCY_ID');
    this.localCurrencySymbol = data ? data.CURRENCY_SYMBOL : null;
  }

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

  getPODetails(poId: any) {
    this.service.getGrnPoDetails(poId).subscribe((res: any) => {
      console.log(res, 'res');
      this.poDetails = res.Podetails.map((item: any, index: number) => ({
        ...item,
        SL_NO: index + 1, // Add SL_NO property dynamically
        QTY_TO_RECEIVE: item.PO_QUANTITY - item.RETURN_QTY_QTY,
        SUPP_PRICE: item.SUPP_PRICE.toFixed(2),
      }));
      console.log(this.poDetails, 'Updated poDetails with SL_NO');
    });
    this.newGrnData.SUPP_GROSS_AMOUNT = this.poDetails[0].SUPP_GROSS_AMOUNT;
    this.newGrnData.SUPP_NET_AMOUNT = this.poDetails[0].SUPP_NET_AMOUNT;
  }

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

  onStoreValueChanged(e: any) {
    const storeid = e.value;
    this.service
      .getPendingPo(storeid, this.supplierId)
      .subscribe((res: any) => {
        this.poList = res.data;
        this.filteredPOList = [...this.poList];
      });
  }
  // onSupplierValueChanged(e:any){
  //   console.log(e,"supplier event")
  //   const supplierid=e.value;
  //   this.supplierId=supplierid;
  //   if (!supplierid) {
  //     // If no supplier is selected, reset the list to all purchase orders
  //     this.filteredPOList = [...this.poList];
  //   } else {
  //     // Filter the purchase order list based on the selected supplier ID
  //     this.filteredPOList = this.poList.filter(po => po.SUPP_ID === supplierid);
  //   }
  // }
  getSupplierData() {
    this.service.getDropdownData('SUPPLIER').subscribe((res) => {
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

  getLandedCostDropDownData() {
    this.service.getDropdownData('LANDED_COST').subscribe((res: any[]) => {
      const landedCostDropDown = res;

      console.log(landedCostDropDown, 'landedCostDropDown');

      // Filter out COST_IDs that already exist in this.newGrnData.GRN_Cost
      const existingCostIds = this.newGrnData.GRN_Cost.map(
        (cost: any) => cost.COST_ID
      );

      console.log(existingCostIds, 'existingCostIds');

      // Filter the data from formdata.GRN_Cost excluding the COST_IDs already present in newGrnData.GRN_Cost
      const filteredGRNCost = landedCostDropDown.filter(
        (cost: any) => !existingCostIds.includes(cost.ID)
      );

      this.landedCostDropDown = filteredGRNCost;

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
        : ((this.newGrnData.NET_AMOUNT * this.costData.RATE) / 100) | 0;
    } else {
      console.log(`No matching cost found for ID: ${id}`);
    }
  }

  saveCost(popupId: string) {
    console.log(this.costData);

    // Check if costData is valid and contains necessary fields
    if (this.costData && this.costData.ID && this.costData.DESCRIPTION) {
      const popupElement = document.querySelector(`#${popupId}`) as HTMLElement;
      const popupRect = popupElement?.getBoundingClientRect();

      // Check if the costData already exists in costingMethodDataGrid
      const isExistingCost = this.costingMethodDataGrid.some(
        (cost: any) => cost.DESCRIPTION === this.costData.DESCRIPTION
      );

      if (isExistingCost) {
        // Show notification if the cost already exists
        // notify({
        //   message: `"${this.costData.DESCRIPTION}" already exists.`,
        //   type: "warning",
        //   position: {
        //     my: "top",
        //     at: "top",
        //     of: popupRect.top
        //   },
        // });
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

      // Add the costData to costingMethodDataGrid
      this.costingMethodDataGrid.push({
        COST_ID: this.costData.ID,
        DESCRIPTION: this.costData.DESCRIPTION,
        CURRENCY: this.costData.CURRENCY,
        RATE: this.costData.RATE,
        TOTAL: this.costData.TOTAL,
      });

      // Check if the description already exists in dynamicColumns
      const existingDescriptions = this.dynamicColumns.map(
        (col: any) => col.dataField
      );

      // Push only new descriptions to dynamicColumns
      if (!existingDescriptions.includes(this.costData.DESCRIPTION)) {
        this.dynamicColumns.push({
          dataField: this.costData.DESCRIPTION.toUpperCase(), // Use the unique description as the dataField
          caption: this.costData.DESCRIPTION.toUpperCase(), // Set the caption as the description
          allowEditing: false,
          width: 100,
          alignment: 'right',
        });
      }

      // Add only the last added cost to updatedItem
      const lastAddedCost =
        this.costingMethodDataGrid[this.costingMethodDataGrid.length - 1];
      if (lastAddedCost) {
        const key = lastAddedCost.DESCRIPTION.toUpperCase(); // Standardize key
        this.poDetails = this.poDetails.map((item: any) => {
          const updatedItem = { ...item };

          // Calculate the value dynamically for the last added cost
          updatedItem[key] =
            (updatedItem.AMOUNT / this.newGrnData.NET_AMOUNT) *
            lastAddedCost.RATE;

          return updatedItem;
        });
      }

      // Optionally, reset costData if needed
      this.costData = {};
      this.isCostPopUpOpened = false;
      console.log(this.costingMethodDataGrid, 'Updated costingMethodDataGrid');

      console.log(this.poDetails, 'Updated poDetails');

      this.ref.detectChanges();
    } else {
      console.error(
        'Invalid costData. Ensure all required fields are populated.'
      );
    }
  }

  onCostContentReady(e: any) {
    console.log(this.poDetails, 'poooooooooooo');

    // Create GRN_Cost based on the landedCost
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
        COST_ID: landedCost.COST_ID, // Assuming COST_ID is available in landedCost data
        PERCENT: PERCENT,
        AMOUNT_FC: AMOUNT_FC.toFixed(2), // Format AMOUNT_FC as needed
        AMOUNT: AMOUNT.toFixed(2), // Format AMOUNT as needed
      };
    });

    // Update this.newGrnData.GRN_Cost with grnCost
    grnCost.forEach((newCost: any) => {
      const existingIndex = this.newGrnData.GRN_Cost.findIndex(
        (cost: any) => cost.COST_ID === newCost.COST_ID
      );

      if (existingIndex > -1) {
        // Update the existing entry
        this.newGrnData.GRN_Cost[existingIndex] = {
          ...this.newGrnData.GRN_Cost[existingIndex],
          ...newCost, // Overwrite with new data
        };
      } else {
        // Add as a new entry
        this.newGrnData.GRN_Cost.push(newCost);
      }
    });

    this.newGrnData.GRNDetails.forEach((detail: any) => {
      // Find the matching entry in poDetails
      const matchingPoDetail = this.poDetails.find(
        (poDetail: any) => poDetail.ITEM_ID === detail.ITEM_ID
      );

      if (matchingPoDetail) {
        // Update COST in GRNDetails with the COST from poDetails
        detail.COST = matchingPoDetail.COST;
      }
    });

    // Log the final GRN_Cost array for debugging
    console.log(this.costingMethodDataGrid, 'costing method datagrid');
    console.log(grnCost, 'GRN_Cost');
    console.log(this.newGrnData.GRN_Cost, 'newGrnData.GRN_Cost');

    console.log(this.newGrnData.GRNDetails, 'newGrnData.grn details');
  }

  onGrnContentReady(e: any): void {
    console.log(e, 'Content Ready Event');
    console.log(this.poDetails, 'poDetails Data');

    if (this.costingMethodDataGrid && this.poDetails) {
      this.costingMethodDataGrid.forEach((costingRow: any) => {
        // Extract the description from costingMethodDataGrid
        const description = costingRow.DESCRIPTION.toUpperCase();

        // Filter all matching rows in poDetails using the description
        const matchingRows = this.poDetails.filter((poRow: any) =>
          Object.keys(poRow).some((key) => key.toUpperCase() === description)
        );

        console.log(matchingRows, 'Matching Rows');

        if (matchingRows.length > 0) {
          matchingRows.forEach((matchingRow: any) => {
            // Find the existing entry in GRN_Item_Cost using the description heading
            const existingEntry = this.newGrnData.GRN_Item_Cost.find(
              (item: any) =>
                item.DESCRIPTION.toUpperCase() === description &&
                item.ITEM_ID === matchingRow.ITEM_ID // Match with the description heading
            );

            if (existingEntry) {
              // Update the existing entry with new data
              existingEntry.STORE_ID = this.newGrnData.STORE_ID;
              existingEntry.COST_ID = costingRow.COST_ID; // Use COST_ID from costingMethodDataGrid
              existingEntry.ITEM_ID = matchingRow.ITEM_ID; // Update ITEM_ID
              existingEntry.AMOUNT = matchingRow[description]; // Update AMOUNT using the description key
            } else {
              console.warn(
                `No existing entry found in GRN_Item_Cost for DESCRIPTION: ${description}`
              );

              this.newGrnData.GRN_Item_Cost.push({
                DESCRIPTION: description,
                STORE_ID: this.newGrnData.STORE_ID,
                COST_ID: costingRow.COST_ID,
                ITEM_ID: matchingRow.ITEM_ID, // Add ITEM_ID from the matching row
                AMOUNT: matchingRow[description],
              });

              console.log(this.newGrnData.GRN_Item_Cost, 'ggg');
            }
          });
        } else {
          console.log(
            `No matching rows found in poDetails for description: ${description}`
          );
        }
      });

      console.log(this.newGrnData.GRN_Item_Cost, 'Updated GRN_Item_Cost Data');
    } else {
      console.warn('Data sources are not available.');
    }
  }

  getTotalQuantity(): any {
    return this.poDetails.reduce(
      (total, item) => total + (item.QUANTITY || 0),
      0
    );
  }

  ngOnInit(): void {
    this.getSupplierData();
    this.getStoreData();
    this.sesstion_Details();
    // this.getPurchaseOrderList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.formdata && changes.formdata.currentValue) {
      console.log(this.formdata, 'formdata');

      this.currencySymbol = this.formdata.CURRENCY_SYMBOL;

      this.cwidth = '100';

      this.newGrnData = { ...this.formdata };

      this.newGrnData.GRNDetails = this.formdata.GRNDetails;

      this.newGrnData.GRN_Item_Cost = this.formdata.GRN_Item_Cost;

      this.newGrnData.GRN_Cost = this.formdata.GRN_Cost;

      this.service.getLandedcostData().subscribe((res) => {
        this.landedCostList = res;
      });

      this.getLandedCostDropDownData();

      console.log(this.newGrnData.GRN_Cost, 'grn cost');

      console.log(this.newGrnData.GRN_Item_Cost, 'grn item cost');

      this.formattedNetAmount = `${this.newGrnData.SUPP_NET_AMOUNT}`;

      this.formattedLocalNetAmount = `${this.newGrnData.NET_AMOUNT}`;

      this.costingMethodDataGrid = this.formdata.GRN_Cost.map((cost) => ({
        ...cost,
        TOTAL: cost.IS_FIXED_AMOUNT
          ? cost.VALUE
          : ((this.newGrnData.NET_AMOUNT * cost.VALUE) / 100).toFixed(2), // Calculate TOTAL
        CURRENCY: cost.IS_FIXED_AMOUNT
          ? cost.IS_LOCAL_CURRENCY
            ? this.localCurrencySymbol
            : this.currencySymbol
          : `${
              cost.IS_LOCAL_CURRENCY
                ? this.localCurrencySymbol
                : this.currencySymbol
            } %`,

        RATE: cost.VALUE,
      }));

      this.poDetails = this.newGrnData.GRNDetails.map((item, index) => ({
        ...item,
        SL_NO: index + 1, // Add SL_NO starting from 1
        QTY_TO_RECEIVE: item.PO_QUANTITY - item.GRN_QUANTITY,
        SUPP_PRICE: item.SUPP_PRICE.toFixed(2),
        QTY_BASE_UNIT: `${item.RECEIVED_QTY / item.UOM_MULTIPLE} ${item.UOM}`,
        DESCRIPTION: item.ITEM_NAME,
      }));

      console.log(this.poDetails, 'podetails');

      this.poDetails = this.processPoDetails(
        this.poDetails,
        this.newGrnData.GRN_Item_Cost
      );

      this.totalQuantity = this.poDetails.reduce((sum, item) => {
        return sum + Number(item.RECEIVED_QTY || 0);
      }, 0);

      this.newGrnData.NET_AMOUNT = this.poDetails
        .reduce((sum, item) => {
          return sum + Number(item.AMOUNT || 0);
        }, 0)
        .toFixed(2);

      this.selectedPONo = '2';
      console.log(this.selectedPONo, '+++++++');

      // this.newGrnData.GRNDetails= this.poDetails.map((item) => ({
      //   ID:item.ID,
      //   COMPANY_ID: 1, // Static value or dynamically set if needed
      //   STORE_ID: this.newGrnData.STORE_ID,
      //   PO_DETAIL_ID: item.PO_DETAIL_ID,
      //   ITEM_ID: item.ITEM_ID,
      //   QUANTITY: Number(item.QUANTITY),
      //   RATE: Number(item.RATE),
      //   AMOUNT: parseFloat(item.AMOUNT),

      //   DISC_PERCENT: Number(item.DISC_PERCENT),

      //   SUPP_PRICE: Number(item.SUPP_PRICE),
      //   SUPP_AMOUNT: Number(item.SUPP_AMOUNT),

      //   UOM_PURCH: item.UOM_PURCH,
      //   UOM: item.UOM,
      //   COST: item.COST

      // }));

      this.newGrnData.GRNDetails = this.poDetails.map((item) => ({
        ID: item.ID,
        COMPANY_ID: 1,
        STORE_ID: this.newGrnData.STORE_ID,
        PO_DETAIL_ID: item.PO_DETAIL_ID,
        ITEM_ID: item.ITEM_ID,
        RECEIVED_QTY: Number(item.RECEIVED_QTY),
        RATE: Number(item.RATE),
        AMOUNT: parseFloat(item.AMOUNT),
        PRICE: Number(item.PRICE),
        DISC_PERCENT: Number(item.DISC_PERCENT),
        QTY_BASE_UNIT: Number(item.QTY_BASE_UNIT),
        SUPP_PRICE: Number(item.SUPP_PRICE),
        SUPP_AMOUNT: Number(item.SUPP_AMOUNT),

        UOM_PURCH: item.UOM_PURCH,
        UOM: item.UOM,
        COST: item.COST,

        // ✅ Add these missing fields back
        ITEM_NAME: item.ITEM_NAME || item.DESCRIPTION || '',
        ITEM_CODE: item.ITEM_CODE || '',
        STORE_NAME: item.STORE_NAME || '',
        PO_QUANTITY: item.PO_QUANTITY || 0,
        GRN_QUANTITY: item.GRN_QUANTITY || 0,
        UOM_MULTIPLE: item.UOM_MULTIPLE || 1,
      }));

      console.log(this.newGrnData.GRNDetails, 'cccccccccc');

      const data = this.getNewGrnData();
      console.log('******************', data);

      // Step 1: Get unique DESCRIPTION values
      const uniqueDescriptions = Array.from(
        new Set(
          this.newGrnData.GRN_Item_Cost.map((cost) =>
            cost.DESCRIPTION.toUpperCase()
          )
        )
      );

      // Step 2: Generate dynamic columns based on unique DESCRIPTION values
      this.dynamicColumns = uniqueDescriptions.map((description) => ({
        dataField: description, // Use the unique description as the dataField
        caption: description, // Set the caption as the description
        allowEditing: false,
        width: 100,
        alignment: 'right',
      }));

      console.log('Dynamic Columns: ', this.dynamicColumns);
    }
  }

  getCostsForItem(itemId: string) {
    console.log(itemId, ':::::::::');
    const data = this.newGrnData.GRN_Item_Cost.filter(
      (cost) => cost.ITEM_ID === itemId
    );
    console.log(data, '11111111111111111111111111111111111111111');
    return data;
  }

  processPoDetails(poDetails: any[], grnItemCost: any[]) {
    console.log('helloooooooooooooooooooooooooooooooo');
    console.table(poDetails);
    console.table(grnItemCost);

    // Iterate through poDetails and add cost fields dynamically
    const updatedPoDetails = poDetails.map((poDetail) => {
      // Find matching costs for the ITEM_ID
      const itemCosts = grnItemCost.filter(
        (cost) => cost.ITEM_ID === poDetail.ITEM_ID
      );

      // Add cost fields dynamically
      itemCosts.forEach((cost) => {
        poDetail[cost.DESCRIPTION.toUpperCase()] = cost.AMOUNT;
      });

      return poDetail;
    });

    console.table(updatedPoDetails); // Log the updated poDetails here

    return updatedPoDetails; // Return the updated array
  }

  openCostPopup() {
    this.isCostPopUpOpened = true;
  }

  onCostingGridValueChanged(event: any): void {
    const updatedRow = event.data; // The row being edited
    const rate = Number(updatedRow.RATE); // New rate value

    // Check if the CURRENCY contains '%' and calculate TOTAL accordingly
    if (updatedRow.CURRENCY && updatedRow.CURRENCY.includes('%')) {
      updatedRow.TOTAL = (
        (Number(this.newGrnData.NET_AMOUNT || 1) * rate) /
        100
      ).toFixed(2);
    } else {
      updatedRow.TOTAL = rate;
    }

    // Update the poDetails data grid
    this.poDetails = this.poDetails.map((item: any) => {
      const updatedItem = { ...item };
      console.log(item, '&&&&');

      // Update the specific cost value for this row
      if (updatedRow.DESCRIPTION) {
        const key = updatedRow.DESCRIPTION.toUpperCase();
        console.log(key, 'key');
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

      console.log(sumCost, 'sumcost');

      updatedItem.TOTAL_COST = (Number(item.AMOUNT) + sumCost).toFixed(2);

      console.log(updatedItem.TOTAL_COST, 'totalcost');

      // Ensure QTY_RECEIVED is greater than zero to avoid division by zero
      if (Number(item.QUANTITY) > 0) {
        updatedItem.COST = (
          Number(updatedItem.TOTAL_COST) / Number(item.QUANTITY)
        ).toFixed(2);
      } else {
        updatedItem.COST = '0.00'; // Default value if QTY_RECEIVED is zero or undefined
      }

      console.log('Final Cost (COST):', item.COST);

      console.log(updatedItem, '+%+%+%+%+%+%');

      return updatedItem;
    });

    console.log(this.costingMethodDataGrid, 'Updated Costing Method Data Grid');
    console.log(this.poDetails, 'Updated PO Details');

    // Trigger UI update
    this.ref.detectChanges();
  }

  onCloseCostPOpup() {
    this.costData = [];
    this.isCostPopUpOpened = false;
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
  declarations: [GrnViewFormComponent],
  exports: [GrnViewFormComponent],
})
export class GrnViewFormModule {}
