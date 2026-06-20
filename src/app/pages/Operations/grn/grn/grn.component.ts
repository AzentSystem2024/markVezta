import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  DevexpressReportingModule,
  DxReportViewerComponent,
  DxReportViewerModule,
} from 'devexpress-reporting-angular';
import {
  DxDataGridModule,
  DxButtonModule,
  DxTabsModule,
  DxPopupModule,
  DxTextBoxModule,
  DxDraggableModule,
  DxSortableModule,
  DxSelectBoxModule,
  DxDataGridComponent,
  DxCheckBoxModule,
  DxDateBoxModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import {
  GrnNewFormComponent,
  GrnNewFormModule,
} from 'src/app/pop-up/operations/grn-new-form/grn-new-form.component';
import {
  GrnEditFormComponent,
  GrnEditFormModule,
} from 'src/app/pop-up/operations/grn-edit-form/grn-edit-form.component';
import {
  GrnVerifyFormComponent,
  GrnVerifyFormModule,
} from 'src/app/pop-up/operations/grn-verify-form/grn-verify-form.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import {
  GrnApproveFormComponent,
  GrnApproveFormModule,
} from 'src/app/pop-up/operations/grn-approve-form/grn-approve-form.component';
import {
  GrnViewFormComponent,
  GrnViewFormModule,
} from 'src/app/pop-up/operations/grn-view-form/grn-view-form.component';
import { Router } from '@angular/router';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
import { finalize } from 'rxjs/operators';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-grn',
  templateUrl: './grn.component.html',
  styleUrls: ['./grn.component.scss'],
})
export class GrnComponent implements OnInit {
  // list.component.ts
  @ViewChild(GrnNewFormComponent) GrnNewFormComponent: GrnNewFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  width: any = '90vw';
  height: any = '100vh';
  grnDataSource: any;
  isEditPopupOpened: boolean = false;
  isVerifyPopupOpened: boolean = false;
  isApprovePopupOpened: boolean = false;
  isGRNPopupVisible: boolean = false;
  isViewPopupOpened: boolean = false;
  showTemplatePopup: boolean = false;
  showReportDesigner: boolean = false;
  isFilterRowVisible: boolean = false;
  isFilterOpened = false;
  selectedTemplate: any;
  selectedRowData: any;
  reportName = 'Report';
  doc = 18;
  templateList: any;
  getDesignerModelAction: any = `WebDocumentViewer/Invoke/`;
  host = 'http://localhost:49834/';
  grnId: any;
  flag: boolean = false;
  @ViewChild(DxReportViewerComponent, { static: false })
  viewer!: DxReportViewerComponent;

  @ViewChild(GrnNewFormComponent, { static: false })
  grnNewForm: GrnNewFormComponent;
  @ViewChild(GrnEditFormComponent, { static: false })
  grnEditForm: GrnEditFormComponent;
  @ViewChild(GrnVerifyFormComponent, { static: false })
  grnVerifyForm: GrnVerifyFormComponent;
  @ViewChild(GrnApproveFormComponent, { static: false })
  grnApproveForm: GrnApproveFormComponent;
  selectedGrnId: any;
  isApproved: boolean = false;
  selectedCompanyId: any;
  sessionData: any;
  docNo: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  companyID: any;
  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'All', value: 'all' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
  ];

  selectedDateRange: string = 'today';
  customStartDate: any = null;
  customEndDate: any = null;
  showCustomDatePopup = false;
  isSaving: boolean = false;
  canVerify: any;
  isVerifyMode: boolean;
  isViewOpened: boolean;
  isApproveOpened: boolean;
  isVerifyOpened: boolean;
  finID: any;

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = (cellInfo.data.STATUS || '').trim();

    // Clean up existing content to avoid duplicates
    while (cellElement.firstChild) {
      cellElement.removeChild(cellElement.firstChild);
    }

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag';
    icon.style.fontSize = '18px';

    // icon.style.color = status === 'Approved' ? 'green' : 'orange';
    icon.style.color =
      status === 'Approved'
        ? '#10B981' // Approved
        : status === 'Closed'
          ? '#10B981'
          : status === 'Verified'
            ? '#0073D8' // Verified
            : '#FFA500'; // Open
    icon.title =
      status === 'Approved'
        ? 'Approved'
        : status === 'Closed'
          ? 'Closed'
          : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
  }

  // customButtons = [
  //   // {
  //   //   hint: 'Verify',
  //   //   icon: 'check',
  //   //   text: 'Verify',
  //   //   onClick: (e) => this.onVerifyClick(e),
  //   //   visible: (e) => e.row.data.STATUS!=='Verified' && e.row.data.STATUS!=='Approved',
  //   // },
  //   {
  //     hint: 'Approve',
  //     icon: 'check',
  //     text: 'Approve',
  //     onClick: (e) => this.onApproveClick(e),
  //     visible: (e) => e.row.data.STATUS !== 'Approved',
  //   },
  //   {
  //     hint: 'View',
  //     icon: 'detailslayout', // You can change this to an appropriate icon
  //     text: 'View',
  //     onClick: (e) => this.onViewClick(e),
  //     visible: (e) => e.row.data.STATUS === 'Approved',
  //   },
  // ];

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilterRow(),
  };
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.openGRNForm());
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

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.getGrnLogData();
    }
  }
  // allButtonsEditDelete = [
  //   {
  //     name: 'edit',
  //     visible: (e: any) =>
  //       e.row.data.STATUS === 'Approved'
  //         ? true // show icon for approved → opens view popup
  //         : this.canEdit && e.row.data.STATUS == 'Open',
  //   },
  //   {
  //     name: 'delete',
  //     visible: (e: any) =>
  //       this.canDelete &&
  //       e.row.data.STATUS !== 'Approved' &&
  //       e.row.data.STATUS !== 'Verified',
  //   },
  // ];
  allButtonsEditDelete = [
    {
      name: 'edit',
      visible: (e: any) =>
        e.row.data.STATUS === 'Approved'
          ? true // show icon for approved → opens view popup
          : this.canEdit && e.row.data.STATUS == 'Open',
    },
    {
      name: 'delete',
      visible: (e: any) =>
        this.canDelete &&
        e.row.data.STATUS !== 'Approved' &&
        e.row.data.STATUS !== 'Verified',
    },
  ];

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  constructor(
    private service: DataService,
    private change: ChangeDetectorRef,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  openGRNForm() {
    this.isGRNPopupVisible = true;
    this.getDocNo();
  }

  getDocNo() {
    const payload = {
      TRANS_TYPE: 18,
      COMPANY_ID: this.selectedCompanyId,
    };
    this.service.getDocNo(payload).subscribe((response: any) => {
      this.docNo = response.DOC_NO;
    });
  }

  closeEdit() {
    this.isEditPopupOpened = false;
    this.ClearFormData();
  }

  async onClickSaveNewData() {
    if (this.isSaving) {
      return;
    }

    const data = this.grnNewForm.getNewGrnData();
    data.IS_APPROVED = this.isApproved;
    data.FIN_ID = this.finID;
    // ✅ Confirmation for Verify / Approve
    const actionMessage = this.isVerifyMode
      ? 'Are you sure you want to verify this GRN?'
      : data.IS_APPROVED
        ? 'Are you sure you want to approve this GRN?'
        : '';

    if (actionMessage) {
      const confirmed = await confirm(actionMessage, 'Confirmation');

      if (!confirmed) {
        return;
      }
    }

    this.isSaving = true;

    this.service
      .saveGrnData(data)
      .pipe(
        finalize(() => {
          this.isSaving = false; // 🔥 ALWAYS executes (success/error/cancel)
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.Message === 'Success' && res.Flag === 1) {
            notify(
              {
                message: this.isVerifyMode
                  ? 'Data Verified Successfully'
                  : data.IS_APPROVED
                    ? 'Data Saved & Approved Successfully'
                    : 'Data Saved Successfully',

                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );

            this.ClearFormData();
            this.GrnNewFormComponent?.clearDemoArray();
            this.isGRNPopupVisible = false;
            this.GrnNewFormComponent?.getDocNo();
            this.getGrnLogData();
          } else {
            notify(
              {
                message: 'Your Data Not Saved',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
        },

        error: () => {
          notify(
            {
              message: 'Something went wrong',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        },
      });
  }
  // updateGrnData() {
  //   const data = this.grnEditForm.getNewGrnData();
  //   console.log(data, 'grn upated data');

  //   this.service.updateGrnData(data).subscribe((res) => {
  //     console.log('data updated', res);
  //     if (res.Message === 'Success' && res.Flag === 1) {
  //       notify(
  //         {
  //           message: 'Data Updated Successfully',
  //           position: { at: 'top center', my: 'top center' },
  //         },
  //         'success',
  //       );

  //       this.isEditPopupOpened = false;
  //       this.getGrnLogData();
  //     } else {
  //       notify(
  //         {
  //           message: 'Your Data Not Updated',
  //           position: { at: 'top right', my: 'top right' },
  //         },
  //         'error',
  //       );
  //     }
  //   });
  // }

  async editGrnData() {
    const data = this.grnVerifyForm.getNewGrnData();
    console.log(data, 'grn verified data');
    data.FIN_ID = this.finID;
    //  Confirmation only for Approve
    if (this.isApproved === true) {
      const confirmed = await confirm(
        'Are you sure you want to approve this GRN?',
        'Confirmation',
      );

      if (!confirmed) {
        return;
      }
    }

    this.service.updateGrnData(data).subscribe((res) => {
      console.log('data verified', res);

      //  Step 1: Update success
      if (res.Message === 'Success') {
        //  Step 2: If approved → call approve API
        if (this.isApproved === true) {
          this.service.approveGrnData(data).subscribe((approveRes) => {
            console.log('data approved', approveRes);

            if (approveRes.Message === 'Success') {
              notify(
                {
                  message: 'Data Updated & Approved Successfully',
                  position: { at: 'top center', my: 'top center' },
                },
                'success',
              );

              this.getGrnLogData();
              this.isVerifyPopupOpened = false;
              this.isApprovePopupOpened = false;
            } else {
              notify(
                {
                  message: 'Verification done, but Approval failed',
                  position: { at: 'top right', my: 'top right' },
                },
                'error',
              );
            }
          });
        }
        //  Step 3: Only verification
        else {
          notify(
            {
              message: 'Data Updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );

          this.getGrnLogData();
          this.isVerifyPopupOpened = false;
        }
      }
      //  Update failed
      else {
        notify(
          {
            message: 'Your Data Not Verified',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      }
    });
  }

  async verifyGrnData() {
    confirm(
      this.isApproved
        ? 'Are you sure you want to approve this GRN?'
        : 'Are you sure you want to verify this GRN?',
      this.isApproved ? 'Confirm Approval' : 'Confirm Verify',
    ).then((dialogResult) => {
      if (!dialogResult) return;

      const data = this.grnVerifyForm.getNewGrnData();
      console.log(data, 'grn verified data');
      data.FIN_ID = this.finID;
      this.service.verifyGrnData(data).subscribe((res) => {
        console.log('data verified', res);

        // Step 1: Update success
        if (res.Message === 'Success') {
          // Step 2: If approved → call approve API
          if (this.isApproved === true) {
          }

          // Step 3: Only verification
          else {
            notify(
              {
                message: 'Data Updated Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );

            this.getGrnLogData();
            this.isVerifyOpened = false;
          }
        }

        // Update failed
        else {
          notify(
            {
              message: 'Your Data Not Verified',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      });
    });
  }

  approveGrnData() {
    const result = confirm(
      'Are you sure you want to approve this GRN?',
      'Confirm Approval',
    );
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        const data = this.grnVerifyForm.getNewGrnData();
        this.service.approveGrnData(data).subscribe((res) => {
          console.log('data approved', res);
          if ((res.Message = 'Success')) {
            notify(
              {
                message: 'Data Approved Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );
            this.getGrnLogData();
            this.isApprovePopupOpened = false;
          } else {
            notify(
              {
                message: 'Your Data Not Approved',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
        });
      }
    });
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    // this.selected_vat_id = this.sessionData.VAT_ID;
    this.selectedCompanyId = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getGrnLogData() {
    const grid = this.dataGrid?.instance;
    grid?.beginCustomLoading('Loading...'); // ✅ START LOADING

    const datePayload = this.getDateRangePayload();

    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      DATE_FROM: datePayload.DATE_FROM,
      DATE_TO: datePayload.DATE_TO,
    };

    this.service
      .getGrnLogData(payload)
      .pipe(
        finalize(() => {
          grid?.endCustomLoading(); // ✅ ALWAYS STOP LOADING
        }),
      )
      .subscribe((res: any) => {
        this.grnDataSource = res.grnheader;
      });
  }

  // getGrnLogData() {
  //   const datePayload = this.getDateRangePayload();

  //   const payload = {
  //     COMPANY_ID: this.selectedCompanyId,
  //     DATE_FROM: datePayload.DATE_FROM,
  //     DATE_TO: datePayload.DATE_TO,
  //   };

  //   this.service.getGrnLogData(payload).subscribe((res: any) => {
  //     this.grnDataSource = res.grnheader;
  //   });
  // }

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    // reset custom dates
    this.customStartDate = null;
    this.customEndDate = null;

    // reset label back to "Custom"
    this.dateRanges = this.dateRanges.map((opt) =>
      opt.value === 'custom' ? { ...opt, label: 'Custom' } : opt,
    );

    this.getGrnLogData();
  }

  applyCustomDateFilter() {
    if (!this.customStartDate || !this.customEndDate) return;

    if (this.customStartDate > this.customEndDate) {
      alert('From date cannot be greater than To date');
      return;
    }

    const fromLabel = this.formatAsDDMMYYYY(new Date(this.customStartDate));
    const toLabel = this.formatAsDDMMYYYY(new Date(this.customEndDate));

    // 🔑 EXACT SAME LOGIC AS CREDIT NOTE
    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    // reload grid
    this.getGrnLogData();
  }

  private getDateRangePayload(): {
    DATE_FROM: string | null;
    DATE_TO: string | null;
  } {
    const today = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    switch (this.selectedDateRange) {
      case 'today':
        fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last7':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 6);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last15':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 14);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last30':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 29);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          fromDate = new Date(this.customStartDate);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(this.customEndDate);
          toDate.setHours(23, 59, 59, 999);
        }
        break;

      case 'all':
        return { DATE_FROM: null, DATE_TO: null };
    }

    return {
      DATE_FROM: fromDate ? this.formatDate(fromDate) : null,
      DATE_TO: toDate ? this.formatDate(toDate) : null,
    };
  }
  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  attachItemClickHandler(e: any) {
    setTimeout(() => {
      const popup = e.component?._popup;
      const innerList =
        popup && popup.$content().find('.dx-list').dxList('instance');

      if (innerList) {
        innerList.off('itemClick'); // avoid duplicate handlers
        innerList.on('itemClick', (clickEvent: any) => {
          const clickedValue = clickEvent.itemData.value;

          if (clickedValue === 'custom') {
            this.openCustomDatePopup(); // same behavior as Credit Note
            e.component.close();
          }
        });
      }
    }, 0);
  }

  openCustomDatePopup() {
    this.customStartDate = null;
    this.customEndDate = null;
    this.showCustomDatePopup = true;
  }

  displayExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const from = this.formatAsDDMMYYYY(new Date(this.customStartDate));
      const to = this.formatAsDDMMYYYY(new Date(this.customEndDate));
      return `${from} - ${to}`;
    }

    return item.label;
  };

  ngOnInit(): void {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    console.log(menuResponse.FINANCIAL_YEARS[0].FIN_ID, 'MENURESPONSEINGRN');
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);
    console.log(packingRights, 'PACKINGRIGHTSSSS');
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
    }

    this.sessionData_tax();
    this.getGrnLogData();
    this.getTemplateList();
    this.getDocNo();
  }

  onEditingRow(event: any): void {
    event.cancel = true; // stop default grid edit

    const rowData = event.data;
    const grnId = rowData.ID;
    const status = rowData.STATUS;

    this.grnId = grnId;
    this.selectedGrnId = grnId;

    // Fetch full GRN data first
    this.service.selectGrnData(grnId).subscribe((res) => {
      this.selectedRowData = res;
      this.cdr.detectChanges();

      // If Approved → View only
      if (status === 'Approved') {
        this.isViewPopupOpened = true;
      }
      // Else → Verify
      else {
        this.isVerifyPopupOpened = true;
      }
    });
  }

  onVerifyClick(event: any) {
    console.log(event, 'EVENTTTTTT');
    const rowData = event.row.data;
    console.log(event.row.data.ID, '=================');
    const invoiceId = rowData.ID;
    const transStatus = rowData.STATUS;

    // this.isReadOnlyInvoice = transStatus === 5;

    this.service.selectGrnData(invoiceId).subscribe((response: any) => {
      this.selectedRowData = response;

      // APPROVED -> OPEN VIEW PAGE
      if (transStatus === 'Approved' || transStatus === 'Closed') {
        this.isViewPopupOpened = true;
      }

      // VERIFIED -> OPEN APPROVE PAGE
      else if (transStatus === 'Verified') {
        this.isApprovePopupOpened = true;
      }

      // OPEN VERIFY PAGE
      else {
        this.isVerifyOpened = true;
      }
    });
  }

  onApproveClick = (e: any) => {
    e.cancel = true;
    const id = e.row.data.ID;
    this.isApprovePopupOpened = true;
    this.change.detectChanges();
    this.service.selectGrnData(id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData, 'select row data');
    });
  };

  onViewClick = (e: any) => {
    e.cancel = true;
    const id = e.row.data.ID;
    this.selectedGrnId = id;
    this.isViewPopupOpened = true;
    this.change.detectChanges();
    this.service.selectGrnData(id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData, 'select row data');
    });
  };

  // deleteGrnData(event: any) {
  //   const ID = event.data.ID;
  //   this.service.deleteGrnData(ID).subscribe((response: any) => {});
  // }
  async deleteGrnData(event: any) {
    const confirmed = await confirm(
      'Are you sure you want to delete this GRN?',
      'Confirmation',
    );

    if (!confirmed) {
      return;
    }

    const ID = event.data.ID;

    this.service.deleteGrnData(ID).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'GRN Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.getGrnLogData();
          // this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
        // or whatever method you use to refresh `employeeList`
      },
      (error) => {
        console.error('Error deleting GRN :', error);
      },
    );
  }

  formatGrnDate(rowData: any): string {
    const celldate = rowData.GRN_DATE;
    if (!celldate) return '';

    const date = new Date(celldate);

    // Format the date using the user's system locale
    const formattedDate = date.toLocaleDateString(); // Formats according to the user's system date format

    return formattedDate; // Return only the date part
  }

  ClearFormData() {
    this.isSaving = false;
    if (this.grnNewForm) {
      this.grnNewForm.clearForm(); // call ONCE
    }

    this.isGRNPopupVisible = false;

    // Reset arrays only
    this.grnNewForm.newGrnData.GRNDetails = [];
    this.grnNewForm.newGrnData.GRN_Item_Cost = [];
    this.grnNewForm.newGrnData.GRN_Cost = [];

    // Reset totals only
    this.grnNewForm.newGrnData.NET_AMOUNT = 0;
    this.grnNewForm.newGrnData.SUPP_NET_AMOUNT = 0;
    this.grnNewForm.newGrnData.TOTAL_COST = 0;

    // Reset helpers
    this.grnNewForm.poDetails = [];
    this.grnNewForm.formattedNetAmount = '';
    this.grnNewForm.formattedLocalNetAmount = '';
  }

  PrintGrn() {
    this.showTemplatePopup = true;
  }

  getTemplateList() {
    this.service.getTemplateList(this.doc).subscribe((res: any) => {
      this.templateList = res.data;
      const defaultTemplate = this.templateList.find(
        (item: any) => item.IS_DEFAULT === true,
      );
      if (defaultTemplate) {
        this.selectedTemplate = defaultTemplate.TEMPLATE_NAME;
      } else {
        // Handle the case where no default template is found
        this.selectedTemplate = null;
      }
    });
  }

  applyTemplate() {
    this.flag = false;
    if (this.selectedTemplate) {
      this.flag = true;
      console.log('Selected Template:', this.selectedTemplate);

      this.reportName = this.selectedTemplate;
      this.viewer.bindingSender.OpenReport(
        this.reportName + '&parameter1=' + this.grnId,
      );
      this.showTemplatePopup = false; // Close the popup after applying
      this.showReportDesigner = true;
    } else {
      alert('Please select a template before applying');
    }
  }

  OnParametersInitialized(event: any) {
    var invisibleIntParamValue = 42;
    var intParam = event.args.ActualParametersInfo.filter(
      (x: any) => x.parameterDescriptor.name == 'intParam',
    )[0];
    intParam.value = invisibleIntParamValue;
    console.log(intParam, 'intparam');
  }
}
@NgModule({
  imports: [
    BrowserModule,
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    ItemsFormModule,
    DxTabsModule,
    CommonModule,
    DxPopupModule,
    DxTextBoxModule,
    DxDraggableModule,
    DxSortableModule,
    DevexpressReportingModule,
    DxReportViewerModule,
    DxSelectBoxModule,
    GrnNewFormModule,
    GrnEditFormModule,
    GrnVerifyFormModule,
    GrnApproveFormModule,
    DxCheckBoxModule,
    GrnViewFormModule,
    DxDateBoxModule,
    CustomDatePopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [GrnComponent],
})
export class GrnModule {}
