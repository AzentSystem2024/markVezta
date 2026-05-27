import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  BrowserModule,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-grn-view-form',
  templateUrl: './grn-view-form.component.html',
  styleUrls: ['./grn-view-form.component.scss'],
})
export class GrnViewFormComponent {
  @Input() formdata: any;
  @Input() grnId: any;
  @Output() closePopup = new EventEmitter<void>();
  financialYeaDate: string = '';
  selected_vat_id: any;
  sessionData: any;
  formatted_from_date: string = '';
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
  pdfSrc: SafeResourceUrl | null = null;
  isPdfPopupVisible: boolean = false;
  logoBase64: string;

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
  currency: any;

  constructor(
    private service: DataService,
    private ref: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {
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
    this.service
      .getGrnPoDetails(poId, this.selected_Company_id)
      .subscribe((res: any) => {
        console.log(res, 'res');
        this.poDetails = res.Podetails.map((item: any, index: number) => ({
          ...item,
          SL_NO: index + 1, // Add SL_NO property dynamically
          // QTY_TO_RECEIVE: item.PO_QUANTITY - item.RETURN_QTY_QTY,
          QTY_TO_RECEIVE: item.PO_QUANTITY,
          SUPP_PRICE: item.SUPP_PRICE.toFixed(2),
        }));
        console.log(this.poDetails, 'Updated poDetails with SL_NO');
      });
    this.newGrnData.SUPP_GROSS_AMOUNT = this.poDetails[0].SUPP_GROSS_AMOUNT;
    this.newGrnData.SUPP_NET_AMOUNT = this.poDetails[0].SUPP_NET_AMOUNT;
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = this.sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = this.sessionData.FINANCIAL_YEARS[0].FIN_ID;

    const sessionYear = this.sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;

    this.formatted_from_date = this.financialYeaDate;

    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  onStoreValueChanged(e: any) {
    const storeid = e.value;
    this.service
      .getPendingPo(storeid, this.supplierId, this.selected_Company_id)
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

      // ✅ Force rebind AFTER datasource is ready
      if (this.newGrnData?.SUPP_ID) {
        const suppId = this.newGrnData.SUPP_ID;
        this.newGrnData.SUPP_ID = null;

        setTimeout(() => {
          this.newGrnData.SUPP_ID = suppId;
          this.ref.detectChanges();
        });
      }
    });
  }

  // getSupplierData() {
  //   this.service.getDropdownData('SUPPLIER').subscribe((res) => {
  //     this.supplierList = res;
  //   });
  // }

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
        (cost: any) => cost.COST_ID,
      );

      console.log(existingCostIds, 'existingCostIds');

      // Filter the data from formdata.GRN_Cost excluding the COST_IDs already present in newGrnData.GRN_Cost
      const filteredGRNCost = landedCostDropDown.filter(
        (cost: any) => !existingCostIds.includes(cost.ID),
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
        (cost: any) => cost.DESCRIPTION === this.costData.DESCRIPTION,
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
          2000,
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
        (col: any) => col.dataField,
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
        'Invalid costData. Ensure all required fields are populated.',
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
        (cost: any) => cost.COST_ID === newCost.COST_ID,
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
        (poDetail: any) => poDetail.ITEM_ID === detail.ITEM_ID,
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
          Object.keys(poRow).some((key) => key.toUpperCase() === description),
        );

        console.log(matchingRows, 'Matching Rows');

        if (matchingRows.length > 0) {
          matchingRows.forEach((matchingRow: any) => {
            // Find the existing entry in GRN_Item_Cost using the description heading
            const existingEntry = this.newGrnData.GRN_Item_Cost.find(
              (item: any) =>
                item.DESCRIPTION.toUpperCase() === description &&
                item.ITEM_ID === matchingRow.ITEM_ID, // Match with the description heading
            );

            if (existingEntry) {
              // Update the existing entry with new data
              existingEntry.STORE_ID = this.newGrnData.STORE_ID;
              existingEntry.COST_ID = costingRow.COST_ID; // Use COST_ID from costingMethodDataGrid
              existingEntry.ITEM_ID = matchingRow.ITEM_ID; // Update ITEM_ID
              existingEntry.AMOUNT = matchingRow[description]; // Update AMOUNT using the description key
            } else {
              console.warn(
                `No existing entry found in GRN_Item_Cost for DESCRIPTION: ${description}`,
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
            `No matching rows found in poDetails for description: ${description}`,
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
      0,
    );
  }

  ngOnInit(): void {
    console.log('GRNVIEWWWWWWWWWWWWWWWWWWW');
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.currency = userData.GeneralSettings.SYMBOL;
    console.log(this.currency, 'CURRENCYYYYYYYYYYYYYYYYYY');
    this.getSupplierData();
    this.getStoreData();
    this.sesstion_Details();
    const imagePath = 'assets/markLogo.jpg';
    this.convertToBase64(imagePath).then((base64) => {
      this.logoBase64 = base64;
    });
    // this.getPurchaseOrderList();
  }

  private async convertToBase64(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['grnId'] && changes['grnId'].currentValue) {
      console.log('Received GRN ID:', this.grnId);
    }
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

      // this.formattedLocalNetAmount = `${this.newGrnData.NET_AMOUNT}`;
      this.formattedLocalNetAmount = Number(
        this.newGrnData.NET_AMOUNT,
      ).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

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
        SUPP_AMOUNT: Number(item.SUPP_AMOUNT),
        QTY_BASE_UNIT:
          item.UOM_MULTIPLE > 0
            ? `${item.QUANTITY / item.UOM_MULTIPLE} ${item.UOM}`
            : `0`, // or 'N/A',
        DESCRIPTION: item.ITEM_NAME,
      }));

      console.log(this.poDetails, 'podetails');

      this.poDetails = this.processPoDetails(
        this.poDetails,
        this.newGrnData.GRN_Item_Cost,
      );

      this.totalQuantity = this.poDetails.reduce((sum, item) => {
        return sum + Number(item.QUANTITY || 0);
      }, 0);

      this.newGrnData.NET_AMOUNT = this.poDetails
        .reduce((sum, item) => {
          return sum + Number(item.AMOUNT || 0);
        }, 0)
        .toFixed(2);

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
        // QTY_BASE_UNIT: Number(item.QTY_BASE_UNIT),
        QTY_BASE_UNIT: item.QTY_BASE_UNIT,

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
            cost.DESCRIPTION.toUpperCase(),
          ),
        ),
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
      (cost) => cost.ITEM_ID === itemId,
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
        (cost) => cost.ITEM_ID === poDetail.ITEM_ID,
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

  onEditorPreparing(e: any) {
    if (e.dataField === 'RECEIVED_QTY') {
      e.editorOptions.readOnly = true;
      e.cancel = true;
    }
  }
  cancel() {
    this.closePopup.emit();
  }
  viewPdf(): void {
    console.log(this.grnId, 'ID received in viewPdf()');

    // this.isPdfPopupVisible = true;

    this.service.selectGrnData(this.grnId).subscribe((res) => {
      console.log(res, 'Selected response');

      // if (res) {
      //   this.pdfSrc = this.get_pdf(res);
      // }
      this.get_pdf(res);
    });
  }

  get_pdf(data: any) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let y = 10;

    // ======================================================
    // LOGO LEFT TOP
    // ======================================================
    const logoX = 18,
      logoY = 12,
      logoW = 30,
      logoH = 30;
    doc.setFillColor(225, 225, 225);
    doc.rect(logoX, logoY, logoW, logoH, 'F');
    doc.addImage(this.logoBase64, 'jpg', logoX, logoY, logoW, logoH);

    // ===============================================
    // SALES INVOICE HEADING (Centered between logo & reference block)
    // ===============================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);

    // compute a centered X between left logo and right reference area
    const leftEdge = 10 + logoW; // end of logo box
    const rightEdge = pageWidth - 80; // start of reference block
    const centerX = (leftEdge + rightEdge) / 2;

    doc.text('GRN', centerX, y + 25, { align: 'center' });

    // ======================================================
    // RIGHT-TOP HEADER (Debit Note Info)
    // ======================================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    const refX = pageWidth - 65; // moved 15mm right

    doc.text(`Invoice No : ${data.DISTRIBUTOR_ID || ''}`, refX, y + 5);
    doc.text(`Reference No : ${data.REF_NO || ''}`, refX, y + 11);
    doc.text(`Date: ${data.GRN_DATE || ''}`, refX, y + 17);

    // doc.text(`Dated : ${data[0].SALE_DATE || ""}`, pageWidth - 80, y + 23);

    y += 33;

    // ===============================================
    // HORIZONTAL LINE ABOVE SELLER + CUSTOMER BLOCKS
    // ===============================================
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y); // full width line

    y += 5; // small spacing

    // ======================================================
    // BLUE SELLER BOX (LEFT)
    // ======================================================
    const blueX = 10;
    const blueY = y;
    const blueW = 100;
    const blueH = 38;

    doc.setFillColor(204, 229, 255);
    doc.rect(blueX, blueY, blueW, blueH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(data.COMPANY_NAME || '', blueX + 3, blueY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(data.ADDRESS1 || '', blueX + 3, blueY + 13);
    doc.text(data.ADDRESS2 || '', blueX + 3, blueY + 18);
    doc.text(data.ADDRESS3 || '', blueX + 3, blueY + 23);
    doc.text(`GSTIN/UIN: ${data.GSTIN || ''}`, blueX + 3, blueY + 28);
    doc.text(
      `State : ${data.STATE || ''}, Code : ${data.STATE_CODE || ''}`,
      blueX + 3,
      blueY + 33,
    );
    doc.text(`E-Mail : ${data.EMAIL || ''}`, blueX + 3, blueY + 38);

    // ======================================================
    // CONSIGNEE (RIGHT SIDE)
    // ======================================================
    const shipX = 115;
    const shipY = y;

    doc.setFont('helvetica', 'bold');
    doc.text('Consignee (Ship to)', shipX, shipY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(data.SUPPPLIER_NAME || '', shipX, shipY + 11);
    doc.text(data.SUPP_ADDRESS1 || '', shipX, shipY + 16);
    doc.text(data.SUPP_ADDRESS2 || '', shipX, shipY + 21);
    doc.text(data.SUPP_ADDRESS3 || '', shipX, shipY + 26);
    doc.text(`GSTIN/UIN : ${data.CUST_GSTIN || ''}`, shipX, shipY + 31);
    doc.text(
      `State : ${data.SUPP_STATE_NAME || ''}, Code : ${data.STATE_CODE || ''}`,
      shipX,
      shipY + 36,
    );

    y += 48;

    // ======================================================
    // BUYER (BILL TO)
    // ======================================================
    const billX = 115;
    const billY = y;

    doc.setFont('helvetica', 'bold');
    doc.text('Buyer (Bill to)', billX, billY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(data.SUPPPLIER_NAME || '', billX, billY + 11);
    doc.text(data.SUPP_ADDRESS1 || '', billX, billY + 16);
    doc.text(data.SUPP_ADDRESS2 || '', billX, billY + 21);
    doc.text(data.SUPP_ADDRESS3 || '', billX, billY + 26);
    doc.text(`GSTIN/UIN : ${data.CUST_GSTIN || ''}`, billX, billY + 31);
    doc.text(
      `State : ${data.SUPP_STATE_NAME || ''}, Code : ${data.STATE_CODE || ''}`,
      billX,
      billY + 36,
    );

    y += 50;

    // ======================================================
    // TABLE — SAME FORMAT AS IMAGE
    // ======================================================
    const tableColumns = [
      'Item Code',
      'Description',
      'Price',
      'Qty in PO',
      'Purch UOM',
      'Received to Date',
      'Qty to Recieve',
      'Qty Received',
      'Amount',
      'Unit Code',
    ];

    const tableRows: any[] = [];
    const footerRow = [
      '',
      '',
      '',
      '',
      '',
      '',
      '', // 6–7
      '',
      '',
      '₹ ' + Number(data.NET_AMOUNT).toFixed(2), // 8  (Tax Amount?) WRONG
    ];

    data.GRNDetails.forEach((item: any, index: number) => {
      tableRows.push([
        // index + 1,
        item.ITEM_CODE || '',
        item.ITEM_NAME || '',
        item.SUPP_PRICE?.toFixed(2) || '',
        item.PO_QUANTITY || '',
        item.UOM || '',
        item.QUANTITY || '',
        item.INVOICE_QTY || '',
        item.RECEIVED_QTY || '',
        item.SUPP_AMOUNT?.toFixed(2) || '',
        item.PRICE?.toFixed(2) || '',
      ]);
    });
    // Move y to bottom of Bill-to block
    y = y + 2;

    // ===============================
    // HORIZONTAL LINE LIKE THE FIGURE
    // ===============================
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y); // Full width horizontal line

    y += 5; // small gap before table
    (doc as any).autoTable({
      startY: y,
      head: [tableColumns],
      body: tableRows,
      foot: [footerRow],
      theme: 'grid',
      margin: { left: 10, right: 10 },
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: 0,
        halign: 'center',
      },
      footStyles: {
        fillColor: [230, 230, 230], // same color as header
        textColor: 0,
        fontStyle: 'bold',
        halign: 'right',
      },
      columnStyles: {
        5: { halign: 'right' }, // Amount column
        9: { halign: 'right' }, // Total column
      },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // ============================================================
    // FOOTER – GST SUMMARY + TOTALS (LIKE generatePDF)
    // ============================================================

    const footStartY = y + 3;

    // ---------------- LEFT GST SUMMARY ----------------
    let lx = 15;
    let ly = footStartY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    // Header
    doc.text('GST %', lx, ly);
    doc.text('Taxable Value', lx + 22, ly);
    doc.text('Integrated Tax', lx + 55, ly);
    doc.text('Total Tax Amount', lx + 95, ly);

    // Sub headers
    doc.setFontSize(8);
    doc.text('Rate', lx + 55, ly + 5);
    doc.text('Amount', lx + 72, ly + 5);

    // Values
    ly += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const taxable = Number(data.SUPP_GROSS_AMOUNT || 0);
    const gstAmount = Number(data.TAX_AMOUNT || 0);
    const gstPerc =
      Number(data.GRNDetails?.CGST || 0) + Number(data.GRNDetails?.SGST || 0);

    doc.text(gstPerc.toFixed(2) + '%', lx, ly);
    doc.text(taxable.toFixed(2), lx + 22, ly);
    doc.text(gstPerc.toFixed(2) + '%', lx + 55, ly);
    doc.text(gstAmount.toFixed(2), lx + 72, ly);
    doc.text(gstAmount.toFixed(2), lx + 95, ly);

    // Total row
    ly += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(taxable.toFixed(2), lx + 22, ly);
    doc.text(gstAmount.toFixed(2), lx + 72, ly);
    doc.text(gstAmount.toFixed(2), lx + 95, ly);

    // ---------------- RIGHT TOTAL SUMMARY ----------------
    let rx = pageWidth - 65;
    let ry = footStartY;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const labelX = rx;
    const colonX = rx + 30;
    const valueX = rx + 40;

    doc.text('Taxable Value', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(taxable.toFixed(2), valueX, ry);

    ry += 6;
    doc.text('Total Tax', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(gstAmount.toFixed(2), valueX, ry);

    ry += 6;
    doc.text('Round Off', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text('0.00', valueX, ry);

    ry += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Total', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(Number(data.NET_AMOUNT).toFixed(2), valueX, ry);

    // ---------------- REVERSE CHARGE ----------------
    let wordsY = ry + 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Whether the tax is payable on Reverse charge basis:', 15, wordsY);

    doc.setFont('helvetica', 'normal');
    doc.text('No', 150, wordsY);

    // ---------------- AMOUNT IN WORDS ----------------
    wordsY += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Amount in words :', 15, wordsY);

    doc.setFont('helvetica', 'normal');
    doc.text(
      `INR ${numberToWordsIndianNumber(Math.floor(data.NET_AMOUNT))} Rupees Only`,
      60,
      wordsY,
    );

    // ---------------- DECLARATION & REMARK ----------------
    let blockY = wordsY + 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Declaration :', 15, blockY);

    blockY += 10;
    doc.text('Remark :', 15, blockY);

    doc.setFont('helvetica', 'normal');
    doc.text(data.REF_NO || '', 40, blockY);
    // -------------------- EXPORT --------------------
    doc.output('dataurlnewwindow');
  }
  getAmountValue = (rowData: any) => {
    const suppAmount = Number(rowData.SUPP_AMOUNT || 0);

    // ✅ If SUPP_AMOUNT has value, show it
    if (suppAmount > 0) {
      return suppAmount;
    }

    // ✅ Otherwise show AMOUNT
    return Number(rowData.AMOUNT || 0);
  };
}

function numberToWordsIndianNumber(num: number) {
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

  if (num === 0) return 'Zero';

  let str = '';

  if (num >= 10000000) {
    str += numberToWordsIndianNumber(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    str += numberToWordsIndianNumber(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    str += numberToWordsIndianNumber(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  if (num >= 100) {
    str += numberToWordsIndianNumber(Math.floor(num / 100)) + ' Hundred ';
    num %= 100;
  }
  if (num > 0) {
    if (num < 20) str += a[num];
    else str += b[Math.floor(num / 10)] + ' ' + a[num % 10];
  }

  return str.trim();
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
