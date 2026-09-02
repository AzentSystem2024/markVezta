import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DxReportDesignerModule, DxReportDesignerComponent } from 'devexpress-reporting-angular';
import { DxDataGridModule, DxPopupModule, DxSelectBoxModule, DxButtonModule, DxTextBoxModule, DxDropDownButtonModule } from 'devextreme-angular';
import { environment } from 'src/environments/environment';

export enum ReportType {
    SaleQuotation = 10,
    SalesOrder = 11,
    PurchaseOrder = 17,
    GoodsReceiptNote = 18,
    PurchaseInvoice = 19,
    PurchaseReturn = 20,
    DeliveryNote = 23,
    SalesReturn = 26,
    CustomerReceipts = 27,
    SalaryPayment = 30
}

@Component({
  selector: 'app-report-designer',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    HttpClientModule,
    DxReportDesignerModule,
    DxDataGridModule,
    DxPopupModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxTextBoxModule,
    DxDropDownButtonModule
  ],
  template: `
    <div class="dashboard-container">
        <div class="header-row">
            <h2>Report Templates</h2>
            <dx-button text="New Report" icon="plus" type="default" (onClick)="showNewPopup()"></dx-button>
        </div>

        <dx-data-grid
            [dataSource]="reportTemplates"
            [showBorders]="true"
            [columnAutoWidth]="true">
            <dxi-column dataField="name" caption="Template Name"></dxi-column>
            <dxi-column dataField="categoryName" caption="Category"></dxi-column>
            <dxi-column caption="Actions" [width]="120" cellTemplate="actionTemplate"></dxi-column>
            
            <div *dxTemplate="let data of 'actionTemplate'">
                <dx-drop-down-button
                    icon="overflow"
                    [showArrowIcon]="false"
                    [items]="actionItems"
                    [dropDownOptions]="{ width: 150 }"
                    (onItemClick)="onActionClick($event, data.row.data)">
                </dx-drop-down-button>
            </div>
        </dx-data-grid>
    </div>

    <!-- New Report Popup -->
    <dx-popup
        [width]="450"
        [height]="'auto'"
        [showTitle]="true"
        title="Create New Report"
        [dragEnabled]="false"
        [hideOnOutsideClick]="true"
        [(visible)]="isNewPopupVisible">
        <div *dxTemplate="let data of 'content'">
            <div class="dx-field">
                <div class="dx-field-label">Report Name</div>
                <div class="dx-field-value">
                    <dx-text-box [(value)]="newReportName" placeholder="Enter Report Name"></dx-text-box>
                </div>
            </div>
            <div class="dx-field">
                <div class="dx-field-label">Category</div>
                <div class="dx-field-value">
                    <dx-select-box
                        [dataSource]="reportTypeOptions"
                        displayExpr="name"
                        valueExpr="value"
                        placeholder="Select Category"
                        [(value)]="selectedReportType">
                    </dx-select-box>
                </div>
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <dx-button text="Cancel" (onClick)="isNewPopupVisible = false"></dx-button>
                <dx-button text="Create" type="default" (onClick)="createNewReport()" style="margin-left: 10px;" [disabled]="!newReportName || !selectedReportType"></dx-button>
            </div>
        </div>
    </dx-popup>

    <!-- Rename Report Popup -->
    <dx-popup
        [width]="400"
        [height]="220"
        [showTitle]="true"
        title="Rename Report"
        [dragEnabled]="false"
        [hideOnOutsideClick]="true"
        [(visible)]="isRenamePopupVisible">
        <div *dxTemplate="let data of 'content'">
            <div class="dx-field">
                <div class="dx-field-label">New Name</div>
                <div class="dx-field-value">
                    <dx-text-box [(value)]="renameNewName" placeholder="Enter New Name"></dx-text-box>
                </div>
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <dx-button text="Cancel" (onClick)="isRenamePopupVisible = false"></dx-button>
                <dx-button text="Save" type="default" (onClick)="confirmRename()" style="margin-left: 10px;" [disabled]="!renameNewName"></dx-button>
            </div>
        </div>
    </dx-popup>

    <!-- Fullscreen Designer Popup -->
    <dx-popup
        [fullScreen]="true"
        [showTitle]="true"
        title="Report Designer"
        [visible]="isDesignerVisible"
        (onHiding)="onDesignerHiding($event)">
        <div *dxTemplate="let data of 'content'" class="designer-popup-content">
            <div class="shell dx-viewport">
              <dx-report-designer 
                #reportDesigner
                [reportUrl]="currentReportUrl"
                height="calc(100vh - 120px)">
                <dxrd-request-options
                  [host]="apiHost"
                  invokeAction="/api/CustomReportDesigner/Invoke"
                  getDesignerModelAction="/api/CustomReportDesigner/GetReportDesignerModel">
                </dxrd-request-options>
              </dx-report-designer>
            </div>
        </div>
    </dx-popup>

    <!-- Unsaved Changes Confirmation Popup -->
    <dx-popup
        [width]="450"
        [height]="200"
        [showTitle]="true"
        title="Close Designer"
        [(visible)]="isConfirmPopupVisible">
        <div *dxTemplate="let data of 'content'">
            <p>Are you sure you want to close? Ensure you have clicked Save inside the designer.</p>
            <div style="text-align: right; margin-top: 20px;">
                <dx-button text="Go Back To Designer" (onClick)="cancelCloseDesigner()"></dx-button>
                <dx-button text="Close Designer" type="danger" (onClick)="forceCloseDesigner()" style="margin-left: 10px;"></dx-button>
            </div>
        </div>
    </dx-popup>

    <!-- Custom Delete Confirmation Popup -->
    <dx-popup
        [width]="400"
        [height]="180"
        [showTitle]="true"
        title="Confirm Delete"
        [(visible)]="isDeletePopupVisible">
        <div *dxTemplate="let data of 'content'">
            <p>Are you sure you want to delete '{{ reportToDelete }}'?</p>
            <div style="text-align: right; margin-top: 20px;">
                <dx-button text="Cancel" (onClick)="isDeletePopupVisible = false"></dx-button>
                <dx-button text="Delete" type="danger" (onClick)="confirmDelete()" style="margin-left: 10px;"></dx-button>
            </div>
        </div>
    </dx-popup>
  `,
  styles: [`
    .dashboard-container {
        padding: 20px;
    }
    .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .designer-popup-content {
        padding: 0;
        height: 100%;
        overflow: hidden;
    }

    .shell {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .shell * {
        box-sizing: content-box;
    }

    .shell .dx-texteditor, .shell .dx-texteditor *,
    .shell .dx-checkbox, .shell .dx-checkbox *,
    .shell .dx-button, .shell .dx-button *,
    .shell .dx-popup, .shell .dx-popup *,
    .shell .dxrd-right-panel,
    .shell .dxrd-right-panel * {
        box-sizing: border-box;
    }

    .shell label {
        margin-bottom: 0 !important;
    }

    .shell .dxrd-right-panel,
    .shell .dxrd-right-panel * {
        pointer-events: auto !important;
    }
    ::ng-deep .dx-overlay-wrapper {
        z-index: 9999 !important;
    }

    .shell .dx-field-item {
        margin-top: 0 !important;
        padding-top: 0 !important;
    }
  `]
})
export class ReportDesignerComponent implements OnInit {
  @ViewChild('reportDesigner', { static: false }) designer!: DxReportDesignerComponent;
  
  apiHost = environment.apiUrl.replace(/\/api\/?$/i, '');
  reportTemplates: any[] = [];
  
  isNewPopupVisible = false;
  isRenamePopupVisible = false;
  isDesignerVisible = false;
  isConfirmPopupVisible = false;
  isDeletePopupVisible = false;
  forceClosingDesigner = false;
  
  currentReportUrl = '';
  newReportName = '';
  renameOldName = '';
  renameNewName = '';
  reportToDelete = '';
  selectedReportType: number | null = null;
  
  actionItems = ['Edit', 'Rename', 'Delete'];

  reportTypeOptions = [
    { name: 'Sale Quotation', value: ReportType.SaleQuotation },
    { name: 'Sales Order', value: ReportType.SalesOrder },
    { name: 'Purchase Order', value: ReportType.PurchaseOrder },
    { name: 'Goods Receipt Note (GRN)', value: ReportType.GoodsReceiptNote },
    { name: 'Purchase Invoice', value: ReportType.PurchaseInvoice },
    { name: 'Purchase Return', value: ReportType.PurchaseReturn },
    { name: 'Delivery Note', value: ReportType.DeliveryNote },
    { name: 'Sales Return', value: ReportType.SalesReturn },
    { name: 'Customer Receipts', value: ReportType.CustomerReceipts },
    { name: 'Salary Payment', value: ReportType.SalaryPayment }
  ];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.http.get<any[]>(`${this.apiHost}/api/Reports`).subscribe({
      next: (reports) => {
        this.reportTemplates = reports.map(r => {
            const typeOption = this.reportTypeOptions.find(o => o.value === r.categoryId);
            return {
                name: r.name,
                categoryId: r.categoryId,
                categoryName: typeOption ? typeOption.name : (r.categoryId ? `Category ${r.categoryId}` : 'None')
            };
        });
      },
      error: (err) => console.error('Failed to load templates', err)
    });
  }

  onActionClick(e: any, rowData: any) {
      if (e.itemData === 'Edit') {
          this.currentReportUrl = rowData.name;
          this.isDesignerVisible = true;
      } else if (e.itemData === 'Rename') {
          this.renameOldName = rowData.name;
          this.renameNewName = rowData.name;
          this.isRenamePopupVisible = true;
      } else if (e.itemData === 'Delete') {
          this.reportToDelete = rowData.name;
          this.isDeletePopupVisible = true;
      }
  }

  showNewPopup() {
    this.newReportName = '';
    this.selectedReportType = null;
    this.isNewPopupVisible = true;
  }

  createNewReport() {
    if (!this.selectedReportType || !this.newReportName) return;
    
    const payload = {
        name: this.newReportName,
        categoryId: this.selectedReportType
    };

    this.http.post(`${this.apiHost}/api/Reports/blank`, payload).subscribe({
        next: () => {
            this.currentReportUrl = this.newReportName;
            this.isNewPopupVisible = false;
            this.isDesignerVisible = true;
            this.loadTemplates();
        },
        error: (err) => {
            console.error('Failed to create report', err);
            alert('Failed to create report. That name may already exist.');
        }
    });
  }

  confirmRename() {
      if (!this.renameNewName || this.renameNewName === this.renameOldName) {
          this.isRenamePopupVisible = false;
          return;
      }

      this.http.put(`${this.apiHost}/api/Reports/${this.renameOldName}/rename`, { newName: this.renameNewName }).subscribe({
          next: () => {
              this.isRenamePopupVisible = false;
              this.loadTemplates();
          },
          error: (err) => {
              console.error('Failed to rename', err);
              alert('Failed to rename report. That name may already exist.');
          }
      });
  }

  confirmDelete() {
    if (!this.reportToDelete) return;
    this.http.delete(`${this.apiHost}/api/Reports/${this.reportToDelete}`).subscribe({
      next: () => {
        this.isDeletePopupVisible = false;
        this.loadTemplates();
      },
      error: (err) => console.error('Failed to delete template', err)
    });
  }

  onDesignerHiding(e: any) {
    if (!this.forceClosingDesigner) {
        e.cancel = true; // Stop it from closing natively
        this.isConfirmPopupVisible = true;
    }
  }

  cancelCloseDesigner() {
    this.isConfirmPopupVisible = false;
    // ensure designer stays visible
    this.isDesignerVisible = true;
  }

  forceCloseDesigner() {
    this.forceClosingDesigner = true;
    this.isConfirmPopupVisible = false;
    this.isDesignerVisible = false;
    this.currentReportUrl = '';
    
    // Reset the flag after it successfully closes
    setTimeout(() => {
        this.forceClosingDesigner = false;
        this.loadTemplates();
    }, 100);
  }
}
