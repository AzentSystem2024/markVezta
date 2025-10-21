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
  height: any = '90vh';
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

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = (cellInfo.data.STATUS || '').trim();

    // Clean up existing content to avoid duplicates
    while (cellElement.firstChild) {
      cellElement.removeChild(cellElement.firstChild);
    }

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag';
    icon.style.fontSize = '18px';

    icon.style.color = status === 'Approved' ? 'green' : 'orange';
    icon.title = status === 'Approved' ? 'Approved' : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  customButtons = [
    // {
    //   hint: 'Verify',
    //   icon: 'check',
    //   text: 'Verify',
    //   onClick: (e) => this.onVerifyClick(e),
    //   visible: (e) => e.row.data.STATUS!=='Verified' && e.row.data.STATUS!=='Approved',
    // },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e) => this.onApproveClick(e),
      visible: (e) => e.row.data.STATUS !== 'Approved',
    },
    {
      hint: 'View',
      icon: 'detailslayout', // You can change this to an appropriate icon
      text: 'View',
      onClick: (e) => this.onViewClick(e),
      visible: (e) => e.row.data.STATUS === 'Approved',
    },
  ];

  refreshButtonOptions = {
    icon: 'refresh', 
    hint: 'Refresh',
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

  allButtonsEditDelete = [
    {
      name: 'edit',
      visible: (e) => e.row.data.STATUS !== 'Approved',
    }, 
    {
      name: 'delete',
      visible: (e) => e.row.data.STATUS !== 'Approved',
    },
  ];

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',

    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.openGRNForm());
    },

    elementAttr: { class: 'add-button' },
  };

  constructor(
    private service: DataService,
    private change: ChangeDetectorRef,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  openGRNForm() {
    this.isGRNPopupVisible = true;
  }

  closeEdit() {
    this.isEditPopupOpened = false;
    this.ClearFormData();
  }

  onClickSaveNewData() {
    const data = this.grnNewForm.getNewGrnData();
    console.log(data, 'grn new data');

    this.service.saveGrnData(data).subscribe((res) => {
      console.log('data saved', res);
      if ((res.Message = 'Success')) {
        notify(
          {
            message: 'Data Saved Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.ClearFormData();
        this.GrnNewFormComponent?.clearDemoArray(); // custom grid array clear
        this.isGRNPopupVisible = false;

        this.getGrnLogData();
      } else {
        notify(
          {
            message: 'Your Data Not Saved',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    });
  }

  updateGrnData() {
    const data = this.grnEditForm.getNewGrnData();
    console.log(data, 'grn upated data');

    this.service.updateGrnData(data).subscribe((res) => {
      console.log('data updated', res);
      if (res.Message === 'Success') {
        notify(
          {
            message: 'Data Updated Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );

        this.isEditPopupOpened = false;
        this.getGrnLogData();
      } else {
        notify(
          {
            message: 'Your Data Not Updated',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    });
  }
  verifyGrnData() {
    const data = this.grnVerifyForm.getNewGrnData();
    console.log(data, 'grn verified data===============================');
    this.service.verifyGrnData(data).subscribe((res) => {
      console.log('data verified', res);
      if ((res.Message === 'Success')) {
        notify(
          {
            message: 'Data Verified Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.getGrnLogData();
        this.isVerifyPopupOpened = false;
      } else {
        notify(
          {
            message: 'Your Data Not Verified',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    });
  }
  approveGrnData() {
    const data = this.grnApproveForm.getNewGrnData();
    console.log(data, 'grn approved data');

    this.service.approveGrnData(data).subscribe((res) => {
      console.log('data approved', res);
      if ((res.Message = 'Success')) {
        notify(
          {
            message: 'Data Approved Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.getGrnLogData();
        this.isApprovePopupOpened = false;
      } else {
        notify(
          {
            message: 'Your Data Not Approved',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    });
  }
  getGrnLogData() {
    this.service.getGrnLogData().subscribe((res: any) => {
      this.grnDataSource = res.grnheader;
    });
  }

  ngOnInit(): void {
    this.getGrnLogData();
    this.getTemplateList();
  }
  onEditingRow(event): void {
    console.log(event, 'event');
    event.cancel = true;
    this.grnId = event.data.ID;
    const Id = event.data.ID;
    console.log(Id, 'id');
    this.isVerifyPopupOpened = true;
    this.service.selectGrnData(Id).subscribe((res) => {
      this.selectedRowData = res;
      this.cdr.detectChanges();
      console.log(this.selectedRowData, 'select row data');
    });
  }

  // onVerifyClick = (e: any) => {
  //   console.log(e);
  //   e.cancel = true;
  //   const id = e.row.data.ID;
  //   this.isVerifyPopupOpened = true;
  //   this.change.detectChanges();
  //   this.service.selectGrnData(id).subscribe((res) => {
  //     this.selectedRowData = res;
  //     console.log(this.selectedRowData, 'select row data');
  //   });
  // };

  onApproveClick = (e) => {
    console.log(e);
    e.cancel = true;
    const id = e.row.data.ID;
    this.isApprovePopupOpened = true;
    this.change.detectChanges();
    this.service.selectGrnData(id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData, 'select row data');
    });
  };

  onViewClick = (e) => {
    console.log(e);
    e.cancel = true;
    const id = e.row.data.ID;
    this.isViewPopupOpened = true;
    this.change.detectChanges();
    this.service.selectGrnData(id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData, 'select row data');
    });
  };

  deleteGrnData(event: any) {
    const ID = event.data.ID;
    this.service.deleteGrnData(ID).subscribe((response: any) => {
      console.log(response, 'deleted');
    });
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
    // this.grnNewForm.clearForm();
    if (this.grnNewForm) {
      this.grnNewForm.clearForm();
    }

    this.isGRNPopupVisible = false;

    // Optional: clear form reference if using ViewChild
    this.grnNewForm?.clearForm?.();

    // Reset local data
    this.grnNewForm.newGrnData = {
      NET_AMOUNT: 0,
      SUPP_NET_AMOUNT: 0,
      TOTAL_COST: 0,
      GRNDetails: [],
      GRN_Item_Cost: [],
      GRN_Cost: [],
      // ... other fields you want to reset
    };

    // Optional: reset poDetails
    this.grnNewForm.poDetails = [];

    // Optional: reset formatting
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
        (item: any) => item.IS_DEFAULT === true
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
        this.reportName + '&parameter1=' + this.grnId
      );
      this.showTemplatePopup = false; // Close the popup after applying
      this.showReportDesigner = true;
    } else {
      alert('Please select a template before applying');
    }
  }

  OnParametersInitialized(event: any) {
    console.log(event, 'event');
    var invisibleIntParamValue = 42;
    var intParam = event.args.ActualParametersInfo.filter(
      (x: any) => x.parameterDescriptor.name == 'intParam'
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
    GrnViewFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [GrnComponent],
})
export class GrnModule {}
