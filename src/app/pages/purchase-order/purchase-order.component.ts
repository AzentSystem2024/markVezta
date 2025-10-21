import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
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
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import {
  PurchaseOrderApproveFormComponent,
  PurchaseOrderApproveFormModule,
} from 'src/app/pop-up/operations/purchase-order-approve-form/purchase-order-approve-form.component';
import {
  PurchaseOrderEditFormComponent,
  PurchaseOrderEditFormModule,
} from 'src/app/pop-up/operations/purchase-order-edit-form/purchase-order-edit-form.component';
import {
  PurchaseOrderNewFormComponent,
  PurchaseOrderNewFormModule,
} from 'src/app/pop-up/operations/purchase-order-new-form/purchase-order-new-form.component';
import {
  PurchaseOrderVerifyFormComponent,
  PurchaseOrderVerifyFormModule,
} from 'src/app/pop-up/operations/purchase-order-verify-form/purchase-order-verify-form.component';
import {
  PurchaseOrderViewFormComponent,
  PurchaseOrderViewFormModule,
} from 'src/app/pop-up/operations/purchase-order-view-form/purchase-order-view-form.component';
import { DataService } from 'src/app/services';
import { EditPurchaseInvoiceModule } from '../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import { confirm } from 'devextreme/ui/dialog';
@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss'],
})
export class PurchaseOrderComponent {
  @ViewChild('PurchaseOrderNewFormComponent')
  PurchaseOrderNewFormComponent!: PurchaseOrderNewFormComponent;
  isAddPopupOpened: boolean = false;
  isEditPopupOpened: boolean = false;
  isVerifyPopupOpened: boolean = false;
  isApprovePopupOpened: boolean = false;
  isViewPopupOpened: boolean = false;
  isPrintPopupOpened: boolean = false;
  width: any = '90vw';
  height: any = '100vh';
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons: boolean = true;
  orientations: any = 'horizontal';
  stylingMode: any = 'primary';
  netAmount: any;
  netSupplierAmount: any;
  netQuantity: any;
  netEditAmount: any;
  netEditSupplierAmount: any;
  netEditQuantity: any;
  netVerifyAmount: any;
  netVerifySupplierAmount: any;
  netVerifyQuantity: any;
  netApproveAmount: any;
  netApproveSupplierAmount: any;
  netApproveQuantity: any;
  netViewAmount: any;
  netViewSupplierAmount: any;
  netViewQuantity: any;
  showSupplierAmount: any;
  dataSource: any;
  selectedRowData: any;
  formdata: any;
  userRights: any;
  docType: any;
  showTemplatePopup: boolean = false;
  printTemplateData: any[] = [];
  templateOptions = ['po', 'po1', 'po2'];
  selectedTemplate: any;
  doc = 17;
  flag: boolean = false;
  templateList: any;
  refreshPo = false;
  title = 'DXReportDesignerSample';
  id = 1;

  // getDesignerModelAction: any = `WebDocumentViewer/Invoke/`;
  getViewModelAction: any;
  poId: any;

  poDetails: any;

  // reportName = 'Report';

  // The backend application URL.
  // host = 'http://localhost:49834/';
  showReportDesigner: boolean = false;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild(PurchaseOrderNewFormComponent, { static: false })
  poNewForm: PurchaseOrderNewFormComponent;
  @ViewChild(PurchaseOrderEditFormComponent, { static: false })
  poEditForm: PurchaseOrderEditFormComponent;
  @ViewChild(PurchaseOrderVerifyFormComponent, { static: false })
  poVerifyForm: PurchaseOrderVerifyFormComponent;
  @ViewChild(PurchaseOrderApproveFormComponent, { static: false })
  poApproveForm: PurchaseOrderApproveFormComponent;
  @ViewChild(PurchaseOrderViewFormComponent, { static: false })
  poViewForm: PurchaseOrderViewFormComponent;
  // @ViewChild(DxReportViewerComponent, { static: false })
  // viewer!: DxReportViewerComponent;
  @ViewChild('paramValue', { static: false })
  public paramValue!: ElementRef;

  showHeaderFilter: true;
  showFilterRow = true;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  isApproved: boolean = false;

  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    // onClick: () => this.addCreditNote(),
    onClick: () => {
      this.zone.run(() => {
        this.openPurchaseOrderForm();
      });
    },
    elementAttr: { class: 'add-button' },
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };
  sessionData: any;
  selected_vat_id: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  isFilterOpened: boolean;

  constructor(
    private service: DataService,
    private zone: NgZone,
    private router: Router
  ) {
    // const userRights = sessionStorage.getItem('menuUserRightsResponse');
    // this.userRights = JSON.parse(userRights);
    // console.log(this.userRights, 'userRights');
    // const docType = this.userRights[0].DOC_TYPE;
    // console.log(docType, 'doctype');
  }

  ngOnInit(): void {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);
    this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/credit-note');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }

    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    console.log('PURCHASEORDER');
    this.getPurchaseOrderList();
    this.initializePrintTemplateData();
    this.getTemplateList();
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
      this.getPurchaseOrderList()
    }
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  onToolbarPreparing(e: any) {
    const toolbarItems = e.toolbarOptions.items;

    // Avoid adding the button more than once
    const alreadyAdded = toolbarItems.some(
      (item: any) => item.name === 'toggleFilterButton'
    );
    if (!alreadyAdded) {
      toolbarItems.splice(toolbarItems.length - 1, 0, {
        widget: 'dxButton',
        name: 'toggleFilterButton', // custom name to avoid duplicates
        location: 'after',
        options: {
          icon: 'filter',
          hint: 'Search Column',
          onClick: () => this.toggleFilters(),
        },
      });
    }
  }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color = status === 'Approved' ? '#5cac6fff' : '#d87f7fff';
    icon.title = status === 'Approved' ? 'Approved' : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  getStatusFilterData = [
    {
      text: 'Approved',
      value: 'Approved',
    },
    {
      text: 'Open',
      value: 'Open',
    },
  ];

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

  customButtons = [
    {
      hint: 'Verify',
      icon: 'check',
      text: 'Verify',
      // onClick: (e) => this.onVerifyClick(e),
      visible: (e) =>
        e.row.data.STATUS !== 'Verified' && e.row.data.STATUS !== 'Approved',
    },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e) => this.onApproveClick(e),
      visible: (e) =>
        e.row.data.STATUS == 'Verified' && e.row.data.STATUS !== 'Approved',
    },
    {
      hint: 'View',
      icon: 'detailslayout', // You can change this to an appropriate icon
      text: 'View',
      // onClick: (e) => this.onViewClick(e),
      visible: (e) => e.row.data.STATUS === 'Approved',
    },
  ];

  allButtonsEditDelete = [
    {
      name: 'edit',
      visible: (e) =>
        e.row.data.STATUS === 'Approved' || e.row.data.STATUS === 'Open',
    },
    {
      name: 'delete',
      visible: (e) =>
        e.row.data.STATUS !== 'Approved' && e.row.data.STATUS !== 'Verified',
    },
  ];

  initializePrintTemplateData() {
    this.printTemplateData = [
      { type: 'main-header', data: 'Purchase Order' },
      { type: 'header', data: [] }, // Example header
      { type: 'grid', data: [] }, // Ensure the 'grid' type exists
      { type: 'footer', data: 'Thank you for your business!' }, // Example footer
    ];
  }

  // onEditClick = (e: any) => {
  //   console.log(e);
  //   const id = e.row.data.ID;
  //   const status = e.row.data.STATUS;
  //   console.log(status, 'STATUSSSSSSSSSSSSSSS');

  //   this.service.selectPoData(id).subscribe((res) => {
  //     this.selectedRowData = res;
  //     console.log(this.selectedRowData, 'select row data');

  //     if (status === 'Approved') {
  //       // Open view popup
  //       this.isViewPopupOpened = true;
  //     } else {
  //       // Open edit popup
  //       this.isEditPopupOpened = true;
  //     }
  //   });
  // };

  // onViewClick = (e) => {
  //   console.log(e);
  //   const id = e.row.data.ID;
  //   this.isViewPopupOpened = true;
  //   this.service.selectPoData(id).subscribe((res) => {
  //     this.selectedRowData = res;
  //     console.log(this.selectedRowData, 'select row data');
  //   });
  // };

  onApproveClick = (e) => {
    console.log(e, 'EDITCLICKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK');
    const id = e.row.data.ID;
    const status = e.row.data.STATUS;
    console.log(id, 'STATUSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS');
    this.isApprovePopupOpened = true;
    this.service.selectPoData(id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData, 'select row data');
    });
  };

  onEditingRow(event): void {
    console.log(event, 'event');
    event.cancel = true;
    this.poId = event.data.ID;
    const Id = event.data.ID;
    const status = event.data.STATUS;
    console.log(Id, 'id');
    // this.isEditPopupOpened = true;
    this.service.selectPoData(Id).subscribe((res) => {
      this.selectedRowData = res;
      if (status === 'Approved') {
        // Open view popup
        this.isViewPopupOpened = true;
      } else {
        // Open edit popup
        this.isEditPopupOpened = true;
      }
    });
  }

  getPurchaseOrderList() {
    this.service.getPurchaseOrderList().subscribe((res) => {
      this.dataSource = res.data;
    });
  }

  openPurchaseOrderForm() {
    this.isAddPopupOpened = true;
  }

  onTemplateReorder(event: any): void {
    const movedItem = this.printTemplateData[event.fromIndex];
    this.printTemplateData.splice(event.fromIndex, 1); // Remove item from original position
    this.printTemplateData.splice(event.toIndex, 0, movedItem); // Insert item at new position
  }

  ClosePrintPopup() {
    this.isPrintPopupOpened = false;
  }

  onCancelNewData() {
    console.log('RESET CALLED');
    if (this.poNewForm) {
      this.poNewForm.resetForm();
    } else {
      console.warn('poNewForm reference not found!');
    }
  }

  onClickSaveNewData() {
    // debugger;
    const data = this.poNewForm.getNewPoData();
    console.log(data);
    if (!data.STORE_ID) {
      notify(
        {
          message: 'Please select Store',
          position: { at: 'top center', my: 'top center' },
        },
        'error'
      );
      return false;
    }
    if (!data.SUPP_ID) {
      notify(
        {
          message: 'Please select Supplier',
          position: { at: 'top center', my: 'top center' },
        },
        'error'
      );
      return false;
    }
    if (!data.PO_DATE) {
      notify(
        {
          message: 'Please select PO Date',
          position: { at: 'top center', my: 'top center' },
        },
        'error'
      );
      return false;
    }
    if (!data.DELIVERY_DATE) {
      notify(
        {
          message: 'Please select Delivery Date',
          position: { at: 'top center', my: 'top center' },
        },
        'error'
      );
      return false;
    }
    if (!data.PoDetails || data.PoDetails.length === 0) {
      notify(
        {
          message: 'Please add at least one item',
          position: { at: 'top center', my: 'top center' },
        },
        'error'
      );
      return false;
    }
    // return true;
    this.service.savePoData(data).subscribe((res) => {
      console.log('saved data');
      if (res) {
        notify(
          {
            message: 'Data Saved Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.refreshPo = true;
        setTimeout(() => (this.refreshPo = false), 0);
        this.dataGrid.instance.refresh();
        this.isAddPopupOpened = false;
        if (this.PurchaseOrderNewFormComponent?.resetForm) {
          console.log(
            'FORMRESETTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
          );
          this.PurchaseOrderNewFormComponent?.resetForm();
        }
        this.getPurchaseOrderList();
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

  UpdatePurchaseOrder() {
    console.log('UPDATEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
    const data = this.poEditForm.getNewPoData();
    console.log(data);

    if (this.isApproved) {
      // 🔹 Show confirmation dialog before approving
      confirm(
        'Are you sure you want to approve this Purchase Order?',
        'Confirm Approval'
      ).then((dialogResult) => {
        if (dialogResult) {
          // User confirmed → call approve API
          this.service.ApprovePoData(data).subscribe((res) => {
            if (res && res.flag === 1) {
              notify(
                {
                  message: 'Purchase Order Approved',
                  position: { at: 'top center', my: 'top center' },
                },
                'success'
              );
              this.CloseEditForm();
              this.getPurchaseOrderList();
            } else {
              notify(
                {
                  message: res?.Message || 'Approval Failed',
                  position: { at: 'top center', my: 'top center' },
                },
                'error'
              );
            }
          });
        } else {
          console.log('Approval cancelled');
        }
      });
    } else {
      // Call update API
      this.service.updatePoData(data).subscribe((res) => {
        if (res) {
          notify(
            {
              message: 'Data Updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.CloseEditForm();
          this.getPurchaseOrderList();
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
  }

  VerifyPurchaseOrder() {
    const data = this.poVerifyForm.getNewPoData();
    console.log(data);

    this.service.verifyPoData(data).subscribe((res) => {
      console.log('saved data');
      if (res) {
        notify(
          {
            message: 'Data Verified Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.CloseEditForm();
        this.getPurchaseOrderList();
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

  ApprovePurchaseOrder() {
    const data = this.poApproveForm.getNewPoData();
    console.log(data);

    this.service.ApprovePoData(data).subscribe((res) => {
      console.log('saved data');
      if (res) {
        notify(
          {
            message: 'Data Approved Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.CloseEditForm();
        this.getPurchaseOrderList();
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

  deletePOData(event: any) {
    const ID = event.data.ID;
    this.service.DeletePoData(ID).subscribe((response: any) => {
      console.log(response, 'deleted');
    });
  }

  CloseEditForm() {
    this.isEditPopupOpened = false;
    this.isVerifyPopupOpened = false;
    this.isApprovePopupOpened = false;
    this.dataGrid.instance.refresh();
  }

  ClearFormData() {
    this.isAddPopupOpened = false;
    this.dataGrid.instance.refresh();
  }

  formatPoDate(rowData: any): string {
    const celldate = rowData.PO_DATE;
    if (!celldate) return '';

    const date = new Date(celldate);

    // Format the date using the user's system locale
    const formattedDate = date.toLocaleDateString(); // Formats according to the user's system date format

    return formattedDate; // Return only the date part
  }

  applyTemplate() {
    this.flag = false;
    if (this.selectedTemplate) {
      this.flag = true;
      console.log('Selected Template:', this.selectedTemplate);

      // this.reportName = this.selectedTemplate;
      // this.viewer.bindingSender.OpenReport(
      //   this.reportName + '&parameter1=' + this.poId
      // );
      this.showTemplatePopup = false; // Close the popup after applying
      this.showReportDesigner = true;
    } else {
      alert('Please select a template before applying');
    }
  }

  //   OnParametersInitialized(event: any) {
  //     var parameterValue = 12345;
  //     event.args.Parameters.filter(function (p: any) { return p.Key == "parameter4"; })[0].Value = parameterValue;
  //     console.log(parameterValue,"parameter value")
  // }
  clearData() {
    this.poNewForm.close();
    console.log('form closed');
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
    PurchaseOrderNewFormModule,
    PurchaseOrderEditFormModule,
    DxTextBoxModule,
    PurchaseOrderVerifyFormModule,
    PurchaseOrderApproveFormModule,
    PurchaseOrderViewFormModule,
    DxDraggableModule,
    DxSortableModule,
    // DevexpressReportingModule,
    // DxReportViewerModule,
    DxSelectBoxModule,
    DxDataGridModule,
    PurchaseOrderEditFormModule,
    DxCheckBoxModule,
  ],
  providers: [],
  exports: [],
  declarations: [PurchaseOrderComponent],
})
export class PurchaseOrderModule {}
