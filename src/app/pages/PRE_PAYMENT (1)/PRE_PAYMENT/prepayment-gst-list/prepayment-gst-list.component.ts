import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
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
  DxTextAreaModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { DxoItemModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import { PrePaymentAddModule } from '../pre-payment-add/pre-payment-add.component';
import { PrePaymentEditModule } from '../pre-payment-edit/pre-payment-edit.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import { PrePaymentGstAddModule } from '../prepayment-gst-add/prepayment-gst-add.component';
import { PrePaymentGstEditModule } from '../prepayment-gst-edit/prepayment-gst-edit.component';

@Component({
  selector: 'app-prepayment-gst-list',
  templateUrl: './prepayment-gst-list.component.html',
  styleUrls: ['./prepayment-gst-list.component.scss'],
})
export class PrepaymentGstListComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  PrePaymentListDataSource: any[] = [];
  readonly allowedPageSizes: any = [10, 20, 'all'];
  displayMode: any = 'full';
  isEditReadOnly: boolean = false;
  showPageSizeSelector = true;
  selectedPrePayment: any;
  showFilterRow = true;
  showHeaderFilter = true;
  addPrepaymentPopupOpened: boolean = false;
  editPrePaymentPopupOpened: boolean = false;
  isFilterRowVisible: boolean = false;
  isFilterOpened = false;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  selected_Company_id: any;

  constructor(
    private dataservice: DataService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.get_PrePaymentList();
  }

  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addPrepayment());
    },
    elementAttr: { class: 'add-button' },
  };

  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'PrePaymentInvoice';
    this.dataservice.exportDataGrid(event, fileName);
  }

  //=================================refresh=============================
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
      this.get_PrePaymentList();
    }
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  addPrepayment() {
    this.addPrepaymentPopupOpened = true;
  }

  handleClose() {
    this.addPrepaymentPopupOpened = false;
    this.editPrePaymentPopupOpened = false;
    this.get_PrePaymentList();
  }

  ngOnInit(): void {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/pre-payment');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.sesstion_Details();
    this.get_PrePaymentList();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  get_PrePaymentList() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.get_PrePayment_List(payload).subscribe((res: any) => {
      console.log(
        'PrePaymentListDataSource=============================:',
        res.Data,
      );
      this.PrePaymentListDataSource = res.Data;
    });
  }

  gridButtons = [
    'edit',
    {
      name: 'delete',
      visible: (e: any) => e.row?.data?.TRANS_STATUS?.trim() === 'Open',
    },
  ];

  onEditingStart(event: any) {
    event.cancel = true;
    const status = event.data?.TRANS_STATUS?.trim();
    this.isEditReadOnly = status === 'Approved';
    this.editPrePaymentPopupOpened = true;
    this.selectPrePayment(event);
  }

  // selectPrePayment(event:any){
  //   ;
  // const id = event.data.TRANS_ID;
  //    this.dataservice.Select_PrePayment(id).subscribe((res: any) => {
  //
  //     this.selectedPrePayment = res.Data

  //    })
  // }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = (cellInfo.data.TRANS_STATUS || '').trim();

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

  selectPrePayment(event: any) {
    const id = event.data.TRANS_ID;

    this.dataservice.Select_PrePayment(id).subscribe((res: any) => {
      // Store original string if needed
      this.selectedPrePayment = {
        ...res.Data,
        TRANS_STATUS: res.Data.TRANS_STATUS === 'Approved', // ✅ boolean for checkbox
      };
    });
  }

  DeletePrePayment(event: any) {
    const id = event.data.TRANS_ID;
    this.dataservice.Delete_PrePayment(id).subscribe((res: any) => {
      console.log('response from delete api:', res);
      if (res.Message === 'Success') {
        notify(
          {
            message: 'Deleted successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
      }
    });
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
    DxDataGridModule,
    DxoItemModule,
    DxValidatorModule,
    DxPopupModule,
    DxButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DxNumberBoxModule,
    PrePaymentGstAddModule,
    PrePaymentGstEditModule,
  ],
  providers: [],
  declarations: [PrepaymentGstListComponent],
  exports: [PrepaymentGstListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrePaymentGstListModule { }
