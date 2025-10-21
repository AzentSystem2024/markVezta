// import { Component } from '@angular/core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
  Output,
  SimpleChanges,
  ViewChild,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import notify from 'devextreme/ui/notify';

// Later in your code:

import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import { confirm } from 'devextreme/ui/dialog';
@Component({
  selector: 'app-depreciation-edit',
  templateUrl: './depreciation-edit.component.html',
  styleUrls: ['./depreciation-edit.component.scss'],
})
export class DepreciationEditComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() SelectDepreciationData: any = {};
  depreciationDate: any;
  approveValue: boolean = false;
  DepreciationPayload: any = {
    DEPR_DATE: new Date(), // format: YYYY-MM-DD
    NARRATION: '',
    AMOUNT: 0,
    COMPANY_ID: 1,
    FIN_ID: 1,
    ASSET_IDS: this.formattedAssets,
  };
  // Sets today's date as default
  selectedData_in_Fixed_asset: any;
  selectedRowsInGrid: any;
  Active_fixed_asset_list: any;
  processd_Date: any;
  recordsCount: any;
  Date: any;
  grandTotal: number = 0;
  deafultASSET_IDs: any;
  readOnly: boolean = false;
  isEdit: boolean = true;
  current_Data: any;
  current_date: any;
  process_button: boolean = false;
  isProcessClicked: boolean = false;
  Depreciation_List: any;

  constructor(private dataService: DataService) {
    this.Active_fixedasset_List();
  }
  ngOnInit() {
    // If API returns a string date:
    // example
    // this.Date = new Date(); // convert string → Date

    this.Date = this.DepreciationPayload.DEPR_DATE;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['SelectDepreciationData'] &&
      changes['SelectDepreciationData'].currentValue
    ) {
      this.DepreciationPayload = this.SelectDepreciationData;

      console.log('SelectDepreciationData :', this.SelectDepreciationData);
      console.log('DepreciationPayload :', this.DepreciationPayload);

      this.current_Data = this.DepreciationPayload;

      this.deafultASSET_IDs = this.DepreciationPayload.ASSET_IDS;
      console.log(
        this.deafultASSET_IDs,
        '===========deafultASSET_IDs============='
      );
      this.approveValue = this.SelectDepreciationData.TRANS_STATUS == '5';

      this.current_date = this.DepreciationPayload.DEPR_DATE;
    }
    this.bindDepreciationData(this.SelectDepreciationData);
    this.selectedRowsInGrid = this.Active_fixed_asset_list.filter(
      (row) => row.Depreciation_amount > 0
    ).map((row) => row.ID);

    // this.Process_function()

    if (this.SelectDepreciationData.TRANS_STATUS == '5') {
      this.readOnly = true;
      this.isEdit = false;
      console.log(this.readOnly);
    } else {
      this.isEdit = true;
      this.readOnly = false;
    }
  }

  //===============================Active_fixedasset_List======================
  Active_fixedasset_List() {
    this.dataService.Active_list_Fixed_Asset_api().subscribe((res: any) => {
      console.log(res);

      this.Active_fixed_asset_list = res.Data;
    });
  }
  bindDepreciationData(payload: any) {
    if (!payload || !payload.ASSET_IDS) return;

    // Update Days & Depreciation_amount in grid source
    this.Active_fixed_asset_list = this.Active_fixed_asset_list.map((asset) => {
      const match = payload.ASSET_IDS.find((d) => d.Asset_ID === asset.ID);
      if (match) {
        return {
          ...asset,
          Days: match.Days,
          Depreciation_amount: match.Depr_Amount,
        };
      }
      return asset;
    });

    // Force change detection for DevExtreme grid
    this.Active_fixed_asset_list = [...this.Active_fixed_asset_list];

    // Also bind top-level fields
    this.DepreciationPayload.DOC_NO = payload.DOC_NO;
    this.DepreciationPayload.DEPR_DATE = payload.DEPR_DATE;
    this.DepreciationPayload.NARRATION = payload.NARRATION;
    this.grandTotal = payload.AMOUNT;
  }

  // onSelectionChanged(event:any){
  //   console.log(event,'======selectd data============')
  //   this.selectedData_in_Fixed_asset=event.selectedRowsData
  //   console.log(this.selectedData_in_Fixed_asset,'========selectedData_in_Fixed_asset===========')
  //    this.recordsCount = this.selectedData_in_Fixed_asset.length;
  //     this.calculateDepreciationDays();
  //     this.DepreciationPayload.ASSET_IDS = this.selectedData_in_Fixed_asset.map((row: any) => ({
  //     Asset_ID: row.ID, // from keyExpr
  //     Days: row.Days || 0, // from grid column
  //     Depr_Amount: row.Depreciation_amount || 0
  //   }));
  //   console.log( this.DepreciationPayload.ASSET_IDS)
  //   //======================Date calculation============================
  // }

  onSelectionChanged(event: any) {
    // Get the selected rows
    this.selectedData_in_Fixed_asset = event.selectedRowsData;
    this.recordsCount = this.selectedData_in_Fixed_asset.length;

    // Map selected IDs
    const selectedIds = this.selectedData_in_Fixed_asset.map(
      (row: any) => row.ID
    );

    // Reset depreciation fields for ALL assets first
    this.Active_fixed_asset_list = this.Active_fixed_asset_list.map((asset) => {
      if (selectedIds.includes(asset.ID)) {
        // Keep data for selected rows (if already processed)
        return asset;
      } else {
        // Reset unselected rows
        return {
          ...asset,
          Days: null,
          Depreciation_amount: null,
        };
      }
    });

    // Prepare payload ASSET_IDS only from current selection
    this.DepreciationPayload.ASSET_IDS = this.selectedData_in_Fixed_asset.map(
      (row: any) => ({
        Asset_ID: row.ID,
        Days: row.Days || 0,
        Depr_Amount: row.Depreciation_amount || 0,
      })
    );

    // Trigger UI refresh
    this.Active_fixed_asset_list = [...this.Active_fixed_asset_list];
  }

  // onSelectionChanged(event: any) {
  //   if (this.readOnly) {
  //     // Deselect all that were just selected
  //     const newlySelectedIds = event.currentSelectedRowKeys;
  //     if (newlySelectedIds.length) {
  //       event.component.deselectRows(newlySelectedIds);
  //     }
  //     return;
  //   }

  //   // Normal selection logic
  //   this.selectedData_in_Fixed_asset = event.selectedRowsData;
  //   this.recordsCount = this.selectedData_in_Fixed_asset.length;

  //   const selectedIds = this.selectedData_in_Fixed_asset.map((row: any) => row.ID);

  //   // Reset depreciation fields for unselected rows
  //   this.Active_fixed_asset_list = this.Active_fixed_asset_list.map(asset => {
  //     if (selectedIds.includes(asset.ID)) {
  //       return asset;
  //     } else {
  //       return {
  //         ...asset,
  //         Days: null,
  //         Depreciation_amount: null
  //       };
  //     }
  //   });

  //   // Prepare payload
  //   this.DepreciationPayload.ASSET_IDS = this.selectedData_in_Fixed_asset.map((row: any) => ({
  //     Asset_ID: row.ID,
  //     Days: row.Days || 0,
  //     Depr_Amount: row.Depreciation_amount || 0
  //   }));

  //   // Refresh grid
  //   this.Active_fixed_asset_list = [...this.Active_fixed_asset_list];
  // }

  onSelectAllChange(event: any) {}
  // formatDateToDMY(date: Date): string {
  //   const day = date.getDate(); // no leading zero
  //   const month = date.getMonth() + 1; // January is 0
  //   const year = date.getFullYear();
  //   return `${year}/${month}/${day}`;
  // }
  formatDateToDMY(date: any): string {
    // Ensure we always have a Date object
    const d = date instanceof Date ? date : new Date(date);

    const day = d.getDate();
    const month = d.getMonth() + 1; // January is 0
    const year = d.getFullYear();

    return `${year}/${month}/${day}`;
  }

  onDateValueChanged(event: any) {
    console.log(event);
    const date = event.value;
    this.depreciationDate = date;
    console.log(this.depreciationDate);
  }
  onEditorPreparing(event: any) {}
  calculateDepreciationDays() {
    const currentDate = this.depreciationDate;

    console.log(currentDate, '===============curent code============');
    const lastDeprDateStr = this.selectedData_in_Fixed_asset.LAST_DEPR_DATE;
    const purchaseDateStr = this.selectedData_in_Fixed_asset.PURCH_DATE;

    console.log(lastDeprDateStr, '========last depreciation date');
    console.log(purchaseDateStr, '======== purchaseDate date');
  }
  parseDateString(dateStr: string): Date | null {
    if (!dateStr) return null;

    const parts = dateStr.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-based in JS
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
  }

  onCellValueChanged(event: any) {
    console.log(event, '=========on cell value changed================');
  }
  onDepreciationDateChange(newDate: Date) {
    this.depreciationDate = newDate;
    this.calculateDepreciationDays();
  }

  Process_function() {
    this.isProcessClicked = true;
    this.process_button = true;
    // ✅ Ensure "today" is always a Date object
    const today = this.depreciationDate
      ? new Date(this.depreciationDate)
      : new Date();

    // ✅ Clear only currently selected rows' old values
    this.Active_fixed_asset_list = this.Active_fixed_asset_list.map((asset) => {
      if (this.selectedRowsInGrid.includes(asset.ID)) {
        return { ...asset, Days: null, Depreciation_amount: null };
      }
      return asset;
    });

    this.grandTotal = 0;

    // ✅ Process only selected rows
    this.selectedRowsInGrid.forEach((id: number) => {
      const asset = this.Active_fixed_asset_list.find((item) => item.ID === id);
      console.log(asset);
      if (!asset) return;

      const baseDateStr = asset.LAST_DEPR_DATE || asset.PURCH_DATE;
      if (!baseDateStr) return;

      // ✅ Support both "DD/MM/YYYY" and "YYYY-MM-DD" formats
      let baseDate: Date;
      if (baseDateStr.includes('/')) {
        const [day, month, year] = baseDateStr.split('/').map(Number);
        baseDate = new Date(year, month - 1, day);
      } else if (baseDateStr.includes('-')) {
        baseDate = new Date(baseDateStr); // ISO format
      } else {
        return; // Skip invalid date format
      }

      // ✅ Skip negative days
      const diffDays = Math.floor(
        (today.getTime() - baseDate.getTime()) / (1000 * 3600 * 24)
      );
      if (diffDays <= 0) return;

      const deprAmount =
        ((asset.ASSET_VALUE * asset.DEPR_PERCENT) / 100 / 365) * diffDays;

      // ✅ Create new object for grid update
      asset.Days = diffDays;
      asset.Depreciation_amount = +deprAmount.toFixed(2);

      this.grandTotal += asset.Depreciation_amount;
      if (this.SelectDepreciationData.TRANS_STATUS === '5') {
        asset.CURRENT_VALUE = +(
          asset.CURRENT_VALUE - asset.Depreciation_amount
        ).toFixed(2);
      }
    });

    this.grandTotal = +this.grandTotal.toFixed(2);

    this.DepreciationPayload.AMOUNT = this.grandTotal;

    // ✅ Prepare formatted assets for API
    this.formattedAssets = this.Active_fixed_asset_list.filter(
      (item) => item.Days > 0 && item.Depreciation_amount > 0
    ).map((item) => ({
      Asset_ID: item.ID,
      Days: item.Days,
      Depr_Amount: item.Depreciation_amount,
    }));

    console.log('Updated Asset List:', this.Active_fixed_asset_list);
    console.log('Formatted Assets:', this.formattedAssets);

    // ✅ Refresh grid
    this.Active_fixed_asset_list = [...this.Active_fixed_asset_list];
    this.processd_Date = this.depreciationDate;
  }

  formattedAssets(formattedAssets: any) {
    throw new Error('Method not implemented.');
  }


  get_Depreciation_list() {
  this.dataService.list_Depreciation_api().subscribe((res: any) => {
    const allData = res.Data;
    const dateField = 'DEPR_DATE';
  this.Depreciation_List = allData;
  //   // If 'all' is selected, skip filtering
  //   if (this.selectedDateRange === 'all') {
  //     this.Depreciation_List = allData;
  //   } else {
  //     const start = new Date(this.startDate);
  //     const end = new Date(this.EndDate);
  //     end.setHours(23, 59, 59, 999);

  //     this.Depreciation_List = allData.filter((item: any) => {
  //       const itemDate = new Date(item[dateField]);
  //       return itemDate >= start && itemDate <= end;
  //     });
  //   }

  //   console.log(this.Depreciation_List, 'Filtered Depreciation List');
  });
}

  UpdateData() {
    const date = this.DepreciationPayload.DEPR_DATE;
    const formattedDate = this.formatDateToDMY(date);
    console.log('Processed Date:', this.processd_Date);
    console.log('Depreciation Date:', this.depreciationDate);
    console.log('Payload Date:', date);
    console.log('Formatted Date:', formattedDate);

    console.log(
      this.DepreciationPayload,
      '===================================without change'
    );
    const payload = {
      ...this.DepreciationPayload,
      DEPR_DATE: formattedDate,
      // ASSET_IDS: this.formattedAssets ||this.deafultASSET_IDs
      ASSET_IDS: this.isProcessClicked
        ? this.formattedAssets
        : this.deafultASSET_IDs,
    };

    if ((this.processd_Date || this.current_date) !== this.depreciationDate) {
      // show notify
      {
        notify(
          {
            message:
              'You changed the Depreciation Date. Please click the process button before saving.',
            position: { at: 'top right', my: 'top right' },
            displayTime: 2000,
          },
          'error'
        );
        return;
      }
    }

    if (this.approveValue === true) {
      confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit'
      ).then((result) => {
        if (result) {
          this.dataService
            .Approve_Depreciation_api(payload)
            .subscribe((res: any) => {
              console.log('Approved & Committed:', res);
               this.Active_fixedasset_List();
             this.popupClosed.emit();
             this.get_Depreciation_list()
             
              notify(
                {
                  message: 'Depreciation approved and committed successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success'
              );
              // this.resetFormAfterUpdate();
                 
          

            });
        } else {
          notify('Approval cancelled.', 'info', 2000);
        }
      });
    } else {
      this.dataService
        .Update_Depreciation_api(payload)
        .subscribe((res: any) => {
          console.log(res);
          this.popupClosed.emit();
           notify(
                {
                  message: 'Depreciation Update  successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success'
              );
          this.get_Depreciation_list()
          this.grandTotal = 0;
          this.selectedRowsInGrid = [];
        });
    }
  }

  onApprovedChanged(event: any) {}
  SetDefaultRest() {
    this.grandTotal = 0;
    this.selectedRowsInGrid = [];
  }
  closePopup() {
    
    this.popupClosed.emit();
    this.selectedRowsInGrid = [];
    this.grandTotal = 0;
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    DxFormModule,
    DxRadioGroupModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxValidatorModule,
    ReactiveFormsModule,
    DxDateBoxModule,
    DxValidationGroupModule,
  ],
  providers: [],
  exports: [DepreciationEditComponent],
  declarations: [DepreciationEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DepreciationEditModule {}
