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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import jsPDF from 'jspdf';
@Component({
  selector: 'app-depreciation-edit',
  templateUrl: './depreciation-edit.component.html',
  styleUrls: ['./depreciation-edit.component.scss'],
})
export class DepreciationEditComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() SelectDepreciationData: any = {};
  @Input() DepreciationId: any;
  @Input() status: any;
  @Input() statusId: any;
  @Input() canApprove: boolean = false;
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

  pdfSrc: SafeResourceUrl | null = null;
  isPdfPopupVisible: boolean = false;
  selected_Company_id: any;
  isSaving = false;
  selectedStatus: any;

  constructor(
    private dataService: DataService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['SelectDepreciationData'] &&
      changes['SelectDepreciationData'].currentValue
    ) {
      this.DepreciationPayload = this.SelectDepreciationData;

      this.current_Data = this.DepreciationPayload;

      this.deafultASSET_IDs = this.DepreciationPayload.ASSET_IDS;

      this.approveValue = this.SelectDepreciationData.TRANS_STATUS == '5';

      this.current_date = this.DepreciationPayload.DEPR_DATE;
    }
    this.bindDepreciationData(this.SelectDepreciationData);
    this.selectedRowsInGrid = this.Active_fixed_asset_list.filter(
      (row: any) => row.Depreciation_amount > 0,
    ).map((row: any) => row.ID);

    // this.Process_function()
    this.selectedStatus = this.SelectDepreciationData.TRANS_STATUS;


    if (this.SelectDepreciationData.TRANS_STATUS == '5') {
      this.readOnly = true;
      this.isEdit = false;
    } else {
      this.isEdit = true;
      this.readOnly = false;
    }
  }

  //===============================Active_fixedasset_List======================
  Active_fixedasset_List() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService
      .Active_list_Fixed_Asset_api(payload)
      .subscribe((res: any) => {
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

  onSelectionChanged(event: any) {
    // Get the selected rows
    this.selectedData_in_Fixed_asset = event.selectedRowsData;
    this.recordsCount = this.selectedData_in_Fixed_asset.length;

    // Map selected IDs
    const selectedIds = this.selectedData_in_Fixed_asset.map(
      (row: any) => row.ID,
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
      }),
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

  onSelectAllChange(event: any) { }
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
    const date = event.value;
    this.depreciationDate = date;
  }
  onEditorPreparing(event: any) { }
  calculateDepreciationDays() {
    const currentDate = this.depreciationDate;

    const lastDeprDateStr = this.selectedData_in_Fixed_asset.LAST_DEPR_DATE;
    const purchaseDateStr = this.selectedData_in_Fixed_asset.PURCH_DATE;
  }
  parseDateString(dateStr: string): Date | null {
    if (!dateStr) return null;

    const parts = dateStr.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-based in JS
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
  }

  onCellValueChanged(event: any) { }
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
        (today.getTime() - baseDate.getTime()) / (1000 * 3600 * 24),
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
      (item) => item.Days > 0 && item.Depreciation_amount > 0,
    ).map((item) => ({
      Asset_ID: item.ID,
      Days: item.Days,
      Depr_Amount: item.Depreciation_amount,
    }));

    // ✅ Refresh grid
    this.Active_fixed_asset_list = [...this.Active_fixed_asset_list];
    this.processd_Date = this.depreciationDate;
  }

  formattedAssets(formattedAssets: any) {
    throw new Error('Method not implemented.');
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '',
    );

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  ngOnInit() {
    this.sesstion_Details();
    this.Active_fixedasset_List();
  }

  get_Depreciation_list() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.list_Depreciation_api(payload).subscribe((res: any) => {
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
    });
  }

  UpdateData() {
    const date = this.DepreciationPayload.DEPR_DATE;
    const formattedDate = this.formatDateToDMY(date);

    const today = new Date();
    const DeprDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    const payload = {
      ...this.DepreciationPayload,
      DEPR_DATE: date,
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
          'error',
        );
        return;
      }
    }
    this.isSaving = true;
    if (this.approveValue === true || this.statusId == '2') {

      console.log(payload, '=================pay===')
      confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit',
      ).then((result) => {
        if (result) {
          this.dataService.Approve_Depreciation_api(payload).subscribe(
            (res: any) => {
              this.isSaving = false;
              this.Active_fixedasset_List();
              this.popupClosed.emit();
              this.get_Depreciation_list();

              notify(
                {
                  message: 'Depreciation approved and committed successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success',
              );
              // this.resetFormAfterUpdate();
            },
            (error) => {
              this.isSaving = false; // ✅ STOP loading
              notify('Failed to approve depreciation.', 'error', 2000);
              console.error(error);
            },
          );
        } else {
          this.isSaving = false;
          notify('Approval cancelled.', 'info', 2000);
        }
      });
    }
    else if (this.status == 'verifyscreen' && this.statusId == '1') {
      this.dataService.Verify_Depreciation_api(payload).subscribe(
        (res: any) => {
          this.isSaving = false;

          this.popupClosed.emit();
          notify(
            {
              message: 'Depreciation Update  successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.get_Depreciation_list();
          this.grandTotal = 0;
          this.selectedRowsInGrid = [];
        },
        (error) => {
          this.isSaving = false; // ✅ STOP loading
          notify('Failed to update depreciation.', 'error', 2000);
          console.error(error);
        },
      );
    } else {
      this.dataService.Update_Depreciation_api(payload).subscribe(
        (res: any) => {
          this.isSaving = false;

          this.popupClosed.emit();
          notify(
            {
              message: 'Depreciation Update  successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.get_Depreciation_list();
          this.grandTotal = 0;
          this.selectedRowsInGrid = [];
        },
        (error) => {
          this.isSaving = false; // ✅ STOP loading
          notify('Failed to update depreciation.', 'error', 2000);
          console.error(error);
        },
      );
    }
  }

  onApprovedChanged(event: any) { }
  SetDefaultRest() {
    this.grandTotal = 0;
    this.selectedRowsInGrid = [];
  }
  closePopup() {
    this.popupClosed.emit();
    this.selectedRowsInGrid = [];
    this.grandTotal = 0;
  }

  viewPdf(): void {
    this.isPdfPopupVisible = true;
    this.dataService
      .select_Depreciation_Asset(this.DepreciationId)
      .subscribe((response: any) => {
        if (response) {
          this.pdfSrc = this.get_pdf(response);
        }
      });
  }

  get_pdf(data: any): SafeResourceUrl {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 12;
    let y = 12;

    // ===========================
    //  RETURN PDF
    // ===========================
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getButtonText(): string {
    if (this.status == 'Editscreen') {
      return 'Update';
    } else if (this.status == 'verifyscreen') {
      if (!this.approveValue && this.statusId == '1') {
        return 'Verify';

      } else {
        return 'Approve';

      }
    }
    else {
      return 'Approsve';
    }
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
    CommonModule,
  ],
  providers: [],
  exports: [DepreciationEditComponent],
  declarations: [DepreciationEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DepreciationEditModule { }
