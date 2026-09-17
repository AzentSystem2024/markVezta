import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BrowserModule, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
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
  DxTagBoxModule,
  DxTextAreaModule,
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
  @ViewChild(GrnNewFormComponent) GrnNewFormComponent: GrnNewFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  width: any = '90vw';
  height: any = 'auto';
  grnDataSource: any;
  isEditPopupOpened: boolean = false;
  isVerifyPopupOpened: boolean = false;
  isApprovePopupOpened: boolean = false;
  isGRNPopupVisible: boolean = false;
  isViewPopupOpened: boolean = false;
  showTemplatePopup: boolean = false;
  showReportDesigner: boolean = false;
  isPreviewPopupVisible: boolean = false;
  isLoadingPdf: boolean = false;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  pdfBlobUrl: string = '';
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

  isEmailPopupVisible: boolean = false;
  emailReceivers: string[] = [];
  selectedEmails: string[] = [];
  emailSubject: string = '';
  emailBody: string = '';
  emailSettingsData: any = null;
  isSendingEmail: boolean = false;
  currentPdfBlob: Blob | null = null;
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



  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter();
  }


  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
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
      this.getGrnLogData();
    }
  }
  allButtonsEditDelete = [
    {
      name: 'edit',
      visible: (e: any) =>
        e.row.data.STATUS === 'Approved'
          ? true
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
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) { }

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
          this.isSaving = false;
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



  async editGrnData() {
    const data = this.grnVerifyForm.getNewGrnData();
    console.log(data, 'grn verified data');
    data.FIN_ID = this.finID;
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

      if (res.Message === 'Success') {
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

        if (res.Message === 'Success') {
          if (this.isApproved === true) {
          }

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
        data.FIN_ID = this.finID;
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
    this.selectedCompanyId = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getGrnLogData() {
    const grid = this.dataGrid?.instance;
    grid?.beginCustomLoading('Loading...');

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
          grid?.endCustomLoading();
        }),
      )
      .subscribe((res: any) => {
        this.grnDataSource = res.grnheader;
      });
  }




  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    this.customStartDate = null;
    this.customEndDate = null;

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

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

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
        innerList.off('itemClick');
        innerList.on('itemClick', (clickEvent: any) => {
          const clickedValue = clickEvent.itemData.value;

          if (clickedValue === 'custom') {
            this.openCustomDatePopup();
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
    event.cancel = true;

    const rowData = event.data;
    const grnId = rowData.ID;
    const status = rowData.STATUS;

    this.selectedGrnId = grnId;

    this.service.selectGrnData(grnId).subscribe((res) => {
      this.selectedRowData = res;

      if (
        status === 'Verified' ||
        status === 'Approved' ||
        status === 'Closed' ||
        status === 'Partial'
      ) {
        this.isViewPopupOpened = true;
      } else {
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


    this.service.selectGrnData(invoiceId).subscribe((response: any) => {
      this.selectedRowData = response;

      if (transStatus === 'Approved' || transStatus === 'Closed') {
        this.isViewPopupOpened = true;
      }

      else if (transStatus === 'Verified') {
        this.isApprovePopupOpened = true;
      }

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
        } else {
          notify(
            {
              message: 'Your Data Not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
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

    const formattedDate = date.toLocaleDateString();

    return formattedDate;
  }

  ClearFormData() {
    this.isSaving = false;
    if (this.grnNewForm) {
      this.grnNewForm.clearForm();
    }

    this.isGRNPopupVisible = false;
    this.isApproved = false;

    this.grnNewForm.newGrnData.GRNDetails = [];
    this.grnNewForm.newGrnData.GRN_Item_Cost = [];
    this.grnNewForm.newGrnData.GRN_Cost = [];

    this.grnNewForm.newGrnData.NET_AMOUNT = 0;
    this.grnNewForm.newGrnData.SUPP_NET_AMOUNT = 0;
    this.grnNewForm.newGrnData.TOTAL_COST = 0;

    this.grnNewForm.poDetails = [];
    this.grnNewForm.formattedNetAmount = '';
    this.grnNewForm.formattedLocalNetAmount = '';
  }

  PrintGrn() {
    this.getTemplateList();
    this.showTemplatePopup = true;
  }

  getTemplateList() {
    this.http.get<any[]>(environment.apiUrl + 'Reports').subscribe({
      next: (data) => {
        this.templateList = data.filter((t: any) => t.categoryId === 18);
        if (this.templateList.length > 0) {
          this.selectedTemplate = this.templateList[0].name;
        } else {
          this.selectedTemplate = null;
        }
      },
      error: (err) => console.error('Error fetching templates:', err)
    });
  }

  previewSelectedTemplate(): void {
    if (!this.selectedTemplate) return;
    this.showTemplatePopup = false;
    this.isPreviewPopupVisible = true;
    this.isLoadingPdf = true;

    const grnNo = this.selectedRowData?.DOC_NO || this.selectedRowData?.GRN_NO || '';
    const grnId = this.selectedRowData?.ID || this.selectedGrnId || this.grnId || 0;

    const url = `${environment.apiUrl}Reports/${encodeURIComponent(this.selectedTemplate)}/export?grnId=${grnId}&poNo=${encodeURIComponent(grnNo)}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        this.currentPdfBlob = blob;
        const objectUrl = URL.createObjectURL(blob);
        this.pdfBlobUrl = objectUrl;
        this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        this.isLoadingPdf = false;
      },
      error: (err) => {
        console.error('Error fetching PDF:', err);
        this.isLoadingPdf = false;
      }
    });
  }

  printPdf(): void {
    if (!this.pdfBlobUrl) return;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = this.pdfBlobUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  }

  downloadPdf(): void {
    if (!this.pdfBlobUrl) return;
    const a = document.createElement('a');
    a.href = this.pdfBlobUrl;
    a.download = `${this.selectedTemplate || 'GoodsReceiptNote'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  sendPdf(): void {
    this.isEmailPopupVisible = true;
    this.emailReceivers = [];
    this.selectedEmails = [];
    this.emailSubject = '';
    this.emailBody = '';
    this.emailSettingsData = null;
    this.service.selectEmailSettings(18).subscribe((res: any) => {
      if (res && res.Data) {
        this.emailSettingsData = res.Data;
        this.emailSubject = res.Data.EMAIL_SUBJECT || '';
        this.emailBody = res.Data.EMAIL_CONTENT || '';
        if (res.Data.RECEIVER_ID) {
          const emails = res.Data.RECEIVER_ID.split(/[,\s]+/).filter((e: string) => e.trim().length > 0);
          this.emailReceivers = emails;
        }
      }
    });
  }

  sendEmailConfirm(): void {
    if (this.selectedEmails.length === 0) {
      notify('Please select at least one recipient.', 'warning', 3000);
      return;
    }
    if (!this.currentPdfBlob) {
      notify('No PDF generated to attach.', 'warning', 3000);
      return;
    }
    this.isSendingEmail = true;
    const toEmail = this.selectedEmails[0];
    const bccEmails = this.selectedEmails.slice(1).join(',');
    const formData = new FormData();
    formData.append('To', toEmail);
    formData.append('Bcc', bccEmails);
    formData.append('Subject', this.emailSubject || ' ');
    formData.append('Body', this.emailBody || ' ');
    formData.append('EmailType', '18');
    const fileName = `${this.selectedTemplate || 'GoodsReceiptNote'}.pdf`;
    formData.append('Attachment', this.currentPdfBlob, fileName);
    this.service.sendEmailWithAttachment(formData).subscribe({
      next: () => {
        this.isSendingEmail = false;
        notify('Email sent successfully!', 'success', 3000);
        this.isEmailPopupVisible = false;
      },
      error: (error) => {
        this.isSendingEmail = false;
        console.error('Email send error', error);
        notify('Error sending email.', 'error', 3000);
      }
    });
  }

  closePdfPreview(): void {
    this.isPreviewPopupVisible = false;
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = '';
      this.pdfPreviewUrl = null;
      this.currentPdfBlob = null;
    }
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
    DxTagBoxModule,
    DxTextAreaModule,
  ],
  providers: [],
  exports: [],
  declarations: [GrnComponent],
})
export class GrnModule { }
