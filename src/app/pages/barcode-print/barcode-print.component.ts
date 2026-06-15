import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
import { AddInvoiceRetailModule } from '../INVOICE/add-invoice-retail/add-invoice-retail.component';
import { InvoiceRetailComponent } from '../OPERATIONS/invoice-retail/invoice-retail.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-barcode-print',
  templateUrl: './barcode-print.component.html',
  styleUrls: ['./barcode-print.component.scss'],
})
export class BarcodePrintComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: any = DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  radioOptions = ['Items', 'GRN'];
  itemsList: any;
  selectedType = 'Items';
  selectedGRN: any = null;
  grnList: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canVerify: boolean = false;
  canPrint = false;
  companyID: any;
  vatTitle: any;
  isHQApp: any;
  selectedItems: any;
  barcodeFormats = ['Standard', 'Jewellery Tag'];

  selectedBarcodeFormat = 'Standard';

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
  ) {}
  ngOnInit() {
    const currentUrl = this.router.url;
    console.log(currentUrl, 'CURRENTURL');
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    this.vatTitle = userData.GeneralSettings.VAT_TITLE;
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    this.isHQApp = userData.GeneralSettings.IS_HQ_APP;
    const configStore = userData.Configuration?.[0];
    const menuGroups = menuResponse.MenuGroups || [];
    console.log(menuGroups, 'MENUGROUPSSSSSSSSSSS');
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === 'barcode');
    console.log(packingRights, 'PACKINGRIGHTSSSSSSSS');
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
    }
    console.log(this.canEdit, 'CANEDIT');
    this.getItems();
    this.getGRNDropdown();
  }

  getItems() {
    this.dataService.getItemsforBarcode().subscribe((response: any) => {
      this.itemsList = response;
      console.log(response, 'ITEMSLISTTTTTTTTTTTT');
    });
  }

  getGRNDropdown() {
    this.dataService.getGRNforBarcode().subscribe((response: any) => {
      console.log(response, 'GRN');
    });
  }
  onSelectionChanged(e: any) {
    this.selectedItems = e.selectedRowsData;

    // this.dataGrid.instance.refresh();
  }

  isBarcodeQtyEditable = (rowInfo: any) => {
    const selectedKeys = this.dataGrid.instance.getSelectedRowKeys();

    return selectedKeys.includes(rowInfo.row.data.ITEM_ID);
  };

  onEditingStart(e: any) {
    if (e.column?.dataField === 'BARCODE_QTY') {
      const selectedKeys = this.dataGrid.instance.getSelectedRowKeys();

      const currentRowKey = e.key;

      // Allow edit only for selected row
      e.cancel = !selectedKeys.includes(currentRowKey);
    }
  }

  onEditorPreparing(e: any) {
    if (e.dataField === 'BARCODE_QTY') {
      e.editorOptions = e.editorOptions || {};

      // Added only this block
      if (e.parentType === 'dataRow') {
        const selectedRows = this.dataGrid.instance.getSelectedRowsData();

        const isSelected = selectedRows.some(
          (x: any) => x.ITEM_ID === e.row.data.ITEM_ID,
        );

        if (!isSelected) {
          e.cancel = true;
        }
      }

      // Existing code unchanged
      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };
    }
  }
  onPrint() {}
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
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
    CustomDatePopupModule,
  ],
  providers: [],
  declarations: [BarcodePrintComponent],
  exports: [BarcodePrintComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BarcodePrintModule {}
