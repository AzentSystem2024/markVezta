import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTabsModule,
  DxTagBoxModule,
  DxTemplateModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';
import { WorksheetService } from 'src/app/services/worksheet.service';
import { ItemStorePropertiesEditModule } from '../item-store-properties-edit/item-store-properties-edit.component';
import { EditItemStorePropertyModule } from 'src/app/pop-up/operations/edit-item-store-property/edit-item-store-property.component';

@Component({
  selector: 'app-item-store-properties-log',
  templateUrl: './item-store-properties-log.component.html',
  styleUrls: ['./item-store-properties-log.component.scss'],
})
export class ItemStorePropertiesLogComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  showHeaderFilter = true;
  logList: any;
  userId: any;
  selectedWorksheetData: any;
  isPopupVisible: boolean = false;
  selectedRowData: any;
  isEditPopupOpened: boolean = false;
  editPackPopupOpened: boolean = false;
  selectedData:any
  customButtons = [
    {
      hint: 'Verify',
      icon: 'check',
      text: 'Verify',
      onClick: (e: any) => this.onVerifyClick(e),
    },
    {
      hint: 'Approve',
      icon: 'taskcomplete',
      text: 'Approve',
      onClick: (e: any) => this.onApproveClick(e),
    },
  ];
  allButtons = ['edit', 'delete', ...this.customButtons];
  totalRecords: any;

  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    // icon: 'add',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    // onClick: () => this.addCreditNote(),
    onClick: () => {
      this.zone.run(() => {
        this.onAddClick();
      });
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
  constructor(
    private dataservice: DataService,
    private router: Router,
    private zone: NgZone,
  ) {}

  ngOnInit() {
    this.listWorkisheetItemProperty();
    this.userId = sessionStorage.getItem('UserId');
  }

  openEditingStart(event: any) {
    event.cancel = true; // Prevent the default editing action
    const selectedId = event.data.ID; // Get the selected row ID
    this.dataservice.selectWorksheet(selectedId).subscribe((res: any) => {
      console.log(res, '============selected data for edit===========');
      this.selectedData=res

      this.editPackPopupOpened = true;
    });
  }
  listWorkisheetItemProperty() {
    this.dataservice
      .getWorksheetItemPropertyLog()
      .subscribe((response: any) => {
        this.logList = response.dataworksheet;
        this.dataGrid.instance.getDataSource = this.logList;
        this.totalRecords = this.logList.length;
      });
  }

  updateWorksheet() {
    if (!this.selectedWorksheetData || !this.selectedWorksheetData.ID) {
      console.error('No worksheet data selected.');
      return;
    }
    const payload = {
      ID: this.selectedWorksheetData.ID, // Worksheet ID
      COMPANY_ID: this.selectedWorksheetData.COMPANY_ID || 1, // Default COMPANY_ID if null
      USER_ID: this.selectedWorksheetData.USER_ID || this.userId, // User ID from session or response
      STORE_ID:
        this.selectedWorksheetData.worksheet_item_store?.[0]?.STORE_ID || null, // STORE_ID if available
      NARRATION: this.selectedWorksheetData.NARRATION || '',
      worksheet_item_property:
        this.selectedWorksheetData.worksheet_item_property.map((item: any) => ({
          ITEM_ID: item.ITEM_ID, // Extracted from response
          IS_PRICE_REQUIRED: item.IS_PRICE_REQUIRED, // Old price required value
          IS_PRICE_REQUIRED_NEW: item.IS_PRICE_REQUIRED_NEW, // New price required value
          IS_NOT_DISCOUNTABLE: item.IS_NOT_DISCOUNTABLE, // Old discountable value
          IS_NOT_DISCOUNTABLE_NEW: item.IS_NOT_DISCOUNTABLE_NEW, // New discountable value
          IS_NOT_SALE_ITEM: item.IS_NOT_SALE_ITEM, // Old sale item value
          IS_NOT_SALE_ITEM_NEW: item.IS_NOT_SALE_ITEM_NEW, // New sale item value
          IS_NOT_SALE_RETURN: item.IS_NOT_SALE_RETURN, // Old sale return value
          IS_NOT_SALE_RETURN_NEW: item.IS_NOT_SALE_RETURN_NEW, // New sale return value
          IS_INACTIVE: item.IS_INACTIVE, // Old inactive status
          IS_INACTIVE_NEW: item.IS_INACTIVE_NEW, // New inactive status
        })),
    };
    this.dataservice.updateworksheetItemProperty(payload).subscribe(
      (response: any) => {},
      (error) => {
        console.error('Error updating worksheet:', error);
      },
    );
  }

  onRowSelected(event: any) {
    if (event.selectedRowsData.length > 0) {
      this.selectedWorksheetData = event.selectedRowsData[0];
    } else {
      this.selectedWorksheetData = null;
    }
  }

  handleClose() {}

  onSelectionChanged(event: any) {
    if (event.selectedRowsData.length > 0) {
      this.selectedRowData = event.selectedRowsData[0]; // Store the selected row data
    } else {
      this.selectedRowData = null; // No row selected
    }
  }

  onApproveClick(e: any) {
    const rowData = e.row.data; // Access the row data
    const worksheetId = rowData?.ID;
    if (worksheetId) {
      this.approveWorksheetById(worksheetId);
    } else {
      console.warn('Worksheet ID is invalid.');
    }
  }

  approveItemStore(selectedWorksheetData: any) {
    const payload = {
      COMPANY_ID: selectedWorksheetData.COMPANY_ID || 1,
      USER_ID: selectedWorksheetData.USER_ID || 1,
      STORE_ID: selectedWorksheetData.STORE_ID,
      ID: selectedWorksheetData.ID,
      worksheet_item_property: [
        {
          ITEM_ID: selectedWorksheetData.ITEM_ID,
          IS_PRICE_REQUIRED: selectedWorksheetData.IS_PRICE_REQUIRED,
          IS_PRICE_REQUIRED_NEW: selectedWorksheetData.IS_PRICE_REQUIRED_NEW,
          IS_NOT_DISCOUNTABLE: selectedWorksheetData.IS_NOT_DISCOUNTABLE,
          IS_NOT_DISCOUNTABLE_NEW:
            selectedWorksheetData.IS_NOT_DISCOUNTABLE_NEW,
          IS_NOT_SALE_ITEM: selectedWorksheetData.IS_NOT_SALE_ITEM,
          IS_NOT_SALE_ITEM_NEW: selectedWorksheetData.IS_NOT_SALE_ITEM_NEW,
          IS_NOT_SALE_RETURN: selectedWorksheetData.IS_NOT_SALE_RETURN,
          IS_NOT_SALE_RETURN_NEW: selectedWorksheetData.IS_NOT_SALE_RETURN_NEW,
          IS_INACTIVE: selectedWorksheetData.IS_INACTIVE,
          IS_INACTIVE_NEW: selectedWorksheetData.IS_INACTIVE_NEW,
        },
      ],
    };

    this.dataservice.approveworksheetItemProperty(payload).subscribe(
      (response) => {
        if (response) {
          notify(
            {
              message: 'Worksheet Approved Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not Approved',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      },
      (error) => {},
    );
  }

  approveWorksheetById(worksheetId: number) {
    if (!worksheetId) {
      console.warn('Invalid worksheet ID');
      return;
    }
    this.dataservice.selectWorksheet(worksheetId).subscribe(
      (response) => {
        const selectedWorksheetData = response;

        this.approveItemStore(selectedWorksheetData);
      },
      (error) => {
        console.error('Error fetching worksheet for verification:', error);
      },
    );
  }

  onVerifyClick(e: any) {
    const rowData = e.row.data; // Access the row data
    const worksheetId = rowData?.ID;
    if (worksheetId) {
      this.verifyWorksheetById(worksheetId);
    } else {
      console.warn('Worksheet ID is invalid.');
    }
  }

  verifyWorksheetById(worksheetId: number) {
    if (!worksheetId) {
      console.warn('Invalid worksheet ID');
      return;
    }

    this.dataservice.selectWorksheet(worksheetId).subscribe(
      (response) => {
        const selectedWorksheetData = response;

        this.verifyItemStore(selectedWorksheetData);
        this.dataGrid.instance.refresh();
      },
      (error) => {
        console.error('Error fetching worksheet for verification:', error);
      },
    );
  }

  verifyItemStore(selectedWorksheetData: any) {
    const payload = {
      COMPANY_ID: selectedWorksheetData.COMPANY_ID || 1,
      USER_ID: selectedWorksheetData.USER_ID || 1,
      STORE_ID: selectedWorksheetData.STORE_ID,
      ID: selectedWorksheetData.ID,
      worksheet_item_property: [
        {
          ITEM_ID: selectedWorksheetData.ITEM_ID,
          IS_PRICE_REQUIRED: selectedWorksheetData.IS_PRICE_REQUIRED,
          IS_PRICE_REQUIRED_NEW: selectedWorksheetData.IS_PRICE_REQUIRED_NEW,
          IS_NOT_DISCOUNTABLE: selectedWorksheetData.IS_NOT_DISCOUNTABLE,
          IS_NOT_DISCOUNTABLE_NEW:
            selectedWorksheetData.IS_NOT_DISCOUNTABLE_NEW,
          IS_NOT_SALE_ITEM: selectedWorksheetData.IS_NOT_SALE_ITEM,
          IS_NOT_SALE_ITEM_NEW: selectedWorksheetData.IS_NOT_SALE_ITEM_NEW,
          IS_NOT_SALE_RETURN: selectedWorksheetData.IS_NOT_SALE_RETURN,
          IS_NOT_SALE_RETURN_NEW: selectedWorksheetData.IS_NOT_SALE_RETURN_NEW,
          IS_INACTIVE: selectedWorksheetData.IS_INACTIVE,
          IS_INACTIVE_NEW: selectedWorksheetData.IS_INACTIVE_NEW,
        },
      ],
    };

    this.dataservice.verifyItemStoreProperties(payload).subscribe(
      (response) => {
        this.dataGrid.instance.refresh();
        if (response) {
          notify(
            {
              message: 'Worksheet Verified Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.dataGrid.instance.refresh();
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
      (error) => {},
    );
  }

  onRowRemoving(event: any) {
    const selectedRow = event.data; // Get the data of the selected row
    const id = selectedRow.ID;
    if (id) {
      this.dataservice.deleteWorksheet(id).subscribe(
        (response) => {
          const index = this.logList.findIndex((item: any) => item.ID === id);
          if (index !== -1) {
            this.logList.splice(index, 1); // Remove item from the array
            event.component.refresh(); // Refresh the DataGrid
          }
        },
        (error) => {
          console.error('Error deleting worksheet:', error);
          event.cancel = true; // Prevent row removal if there's an error
        },
      );
    } else {
      console.warn('No valid row data to delete');
      event.cancel = true; // Prevent row removal if there's no valid data
    }
  }

  onCellPrepared(e: any) {
    // Your logic to handle cell preparation
    if (e.rowType === 'data' && e.column.command === 'edit') {
    }
  }

  onAddClick() {
    this.router.navigate(['/item-change-property-add']);
  }
}
@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    ItemsFormModule,
    DxTabsModule,
    DxTemplateModule,
    DxoFormItemModule,
    DxToolbarModule,
    DxRadioGroupModule,
    DxPopupModule,
    DxTagBoxModule,
    ItemStorePropertiesEditModule,
    EditItemStorePropertyModule,
  ],
  providers: [],
  exports: [ItemStorePropertiesLogComponent],
  declarations: [ItemStorePropertiesLogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemStorePropertiesLogModule {}
