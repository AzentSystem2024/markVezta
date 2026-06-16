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
import JsBarcode from 'jsbarcode';
import notify from 'devextreme/ui/notify';

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
  showBarcodePreview = false;
  barcodeHtml = '';
  selectedGRNKeys: any[] = [];
  grnDropdownOpened = false;

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
    const grid = this.dataGrid?.instance;

    grid?.beginCustomLoading('Loading...');

    this.dataService.getItemsforBarcode().subscribe({
      next: (response: any) => {
        this.itemsList = response;

        console.log(response, 'ITEMSLISTTTTTTTTTTTT');
      },

      error: () => {
        notify(
          {
            message: 'Failed to load items',
            position: {
              at: 'top center',
              my: 'top center',
            },
          },
          'error',
        );
      },

      complete: () => {
        grid?.endCustomLoading();
      },
    });
  }

  displayGRN = (item: any) => {
    if (!item) return '';

    return `${item.GRN_NO} - ${item.SUPP_NAME}`;
  };

  getGRNDropdown() {
    this.dataService.getGRNforBarcode().subscribe((response: any) => {
      this.grnList = response;
      console.log(response, 'GRN');
    });
  }

  onTypeChange(e: any) {
    this.selectedGRN = null;
    this.selectedItems = [];

    if (e.value === 'Items') {
      this.getItems();
    }

    if (e.value === 'GRN') {
      this.itemsList = [];
    }
  }

  onGRNChanged(e: any) {
    if (!e.value) return;

    const grid = this.dataGrid?.instance;

    grid?.beginCustomLoading('Loading...');

    const payload = {
      GRN_ID: e.value,
    };

    this.dataService.getItemsOfGRN(payload).subscribe({
      next: (response: any) => {
        this.itemsList = response;

        this.selectedItems = [];

        if (this.dataGrid?.instance) {
          this.dataGrid.instance.clearSelection();
        }

        console.log(response, 'GRN ITEMS');
      },

      error: () => {
        notify(
          {
            message: 'Failed to load GRN items',
            position: {
              at: 'top center',
              my: 'top center',
            },
          },
          'error',
        );
      },

      complete: () => {
        grid?.endCustomLoading();
      },
    });
  }
  onSelectionChanged(e: any) {
    this.selectedItems = e.component.getSelectedRowsData();
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

  printPreview() {
    const content = document.getElementById('barcodePreview');

    if (!content) return;

    const printWindow = window.open('', '_blank');

    if (!printWindow) return;

    printWindow.document.write(`
    <html>
      <head>
        <title>Barcode Print</title>

        <style>
          body{
            margin:0;
            padding:20px;
          }

          #barcodeContainer{
            display:flex;
            flex-wrap:wrap;
            gap:10px;
          }

          @media print{
            body{
              margin:0;
            }
          }
        </style>

      </head>

      <body>

        <div id="barcodeContainer">
          ${content.innerHTML}
        </div>

      </body>

    </html>
  `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  }
  onPrint() {
    const grid = this.dataGrid.instance;

    // save latest edited BARCODE_QTY
    grid.saveEditData();

    // use CURRENT selected rows directly
    const selectedRows = grid.getSelectedRowsData();

    if (!selectedRows?.length) {
      notify(
        {
          message: 'Please select items',
          position: {
            at: 'top center',
            my: 'top center',
          },
        },
        'warning',
      );

      return;
    }

    // IMPORTANT FIX:
    // do NOT remap from itemsList / datasource
    this.selectedItems = selectedRows
      .map((row: any) => ({
        ...row,
        BARCODE_QTY: Number(row.BARCODE_QTY || 0),
      }))
      .filter((row: any) => row.BARCODE_QTY > 0);

    if (!this.selectedItems.length) {
      notify(
        {
          message: 'Enter Barcode Count',
          position: {
            at: 'top center',
            my: 'top center',
          },
        },
        'warning',
      );

      return;
    }

    this.showBarcodePreview = true;

    setTimeout(() => {
      const container = document.getElementById('barcodePreview');

      if (!container) return;

      container.innerHTML = '';

      this.selectedItems.forEach((item: any) => {
        const qty = Number(item.BARCODE_QTY);

        const itemGroup = document.createElement('div');

        itemGroup.style.width = '100%';
        itemGroup.style.display = 'flex';
        itemGroup.style.flexDirection = 'column';
        itemGroup.style.marginBottom = '40px';

        for (let i = 0; i < qty; i++) {
          const wrapper = document.createElement('div');

          const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
          );

          if (this.selectedBarcodeFormat === 'Standard') {
            wrapper.style.width = '260px';
            wrapper.style.marginBottom = '10px';

            wrapper.innerHTML = `
            <div style="font-size:14px;font-weight:600">
              ${item.ITEM_CODE}
            </div>

            <div style="font-size:11px">
              ${item.DESCRIPTION}
            </div>

            <div style="font-weight:bold">
              Price : ${item.PRICE}
            </div>
          `;

            wrapper.appendChild(svg);

            JsBarcode(svg, item.BARCODE, {
              format: 'CODE128',
              width: 2,
              height: 70,
              displayValue: true,
            });
          } else {
            wrapper.style.width = '220px';
            wrapper.style.marginBottom = '8px';

            wrapper.innerHTML = `
            <div
              style="
                display:flex;
                justify-content:space-between;
                font-size:11px;
                font-weight:bold;
              "
            >
              <span>${item.ITEM_CODE}</span>
              <span>${item.PRICE}</span>
            </div>

            <div style="font-size:10px">
              ${item.DESCRIPTION}
            </div>
          `;

            wrapper.appendChild(svg);

            JsBarcode(svg, item.BARCODE, {
              format: 'CODE128',
              width: 1.6,
              height: 42,
              displayValue: true,
            });
          }

          itemGroup.appendChild(wrapper);
        }

        container.appendChild(itemGroup);
      });
    }, 200);
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
