import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
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

@Component({
  selector: 'app-item-store-properties-log',
  templateUrl: './item-store-properties-log.component.html',
  styleUrls: ['./item-store-properties-log.component.scss'],
})
export class ItemStorePropertiesLogComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  showHeaderFilter = true;
  logList: any;
  userId: any;
  selectedWorksheetData: any;
  isPopupVisible: boolean = false;
  selectedRowData: any;
  customButtons = [
    {
      hint: 'Verify',
      icon: 'check',
      text: 'Verify',
      onClick: (e) => this.onVerifyClick(e),
    },
    {
      hint: 'Approve',
      icon: 'taskcomplete',
      text: 'Approve',
      onClick: (e) => this.onApproveClick(e),
    },
  ];
  allButtons = [
    'edit',
    'delete',
    ...this.customButtons
  ];
  totalRecords: any;

  constructor(private dataservice: DataService, private router: Router) {}

  ngOnInit() {
    this.listWorkisheetItemProperty();
    this.userId = sessionStorage.getItem('UserId');
    console.log(this.userId, 'USERID');
  }

  listWorkisheetItemProperty() {
    this.dataservice
      .getWorksheetItemPropertyLog()
      .subscribe((response: any) => {
        this.logList = response.dataworksheet;
        this.dataGrid.instance.getDataSource = this.logList;
        console.log(this.logList, 'RESPONSE');
        this.totalRecords = this.logList.length;
        console.log('Total Records:', this.totalRecords);
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
      (response: any) => {
        console.log('Worksheet updated successfully:', response);
      },
      (error) => {
        console.error('Error updating worksheet:', error);
      }
    );
  }

  selectWorksheetById(worksheetId: number) {
    if (!worksheetId) {
      console.warn('Invalid worksheet ID');
      return;
    }
    this.dataservice.selectWorksheet(worksheetId).subscribe(
      (response) => {
        this.selectedWorksheetData = response;
        console.log(this.selectedWorksheetData,"SELECTED WORKSHEET DATA IN LOG LIST")
        this.dataservice.setWorksheetData(this.selectedWorksheetData);
        this.router.navigate(['/item-store-properties-edit'], {
          state: { worksheetData: this.selectedWorksheetData },
        });
        this.isPopupVisible = true;
      },
      (error) => {
        console.error('Error selecting worksheet:', error);
      }
    );
  }

  onRowSelected(event: any) {
    console.log('Row selection event:', event);
    if (event.selectedRowsData.length > 0) {
      this.selectedWorksheetData = event.selectedRowsData[0];
      console.log('Selected Worksheet Data:', this.selectedWorksheetData);
    } else {
      this.selectedWorksheetData = null;
      console.log('No row selected');
    }
  }

  openEditingStart(event: any) {
    event.cancel = true; // Prevent the default editing action
    const selectedId = event.data.ID; // Get the selected row ID
    console.log('Edit row triggered for ID:', selectedId);
    if (selectedId) {
      this.selectWorksheetById(selectedId);
      // this.router.navigate(['/item-store-properties']);
    } else {
      console.warn('No valid row ID selected');
    }
  }

  onSelectionChanged(event: any) {
    if (event.selectedRowsData.length > 0) {
      this.selectedRowData = event.selectedRowsData[0]; // Store the selected row data
      console.log('Row Selected:', this.selectedRowData); // Check row selection in the console
    } else {
      this.selectedRowData = null; // No row selected
    }
  }

  onApproveClick(e: any) {
    const rowData = e.row.data; // Access the row data
    const worksheetId = rowData?.ID;
    console.log(worksheetId, 'APPROVE');
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
      STORE_ID: selectedWorksheetData.STORE_ID  ,
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

    console.log('Approval payload:', payload); 
    this.dataservice.approveworksheetItemProperty(payload).subscribe(
      (response) => {
        console.log(response,"RESPONSE IN APPROVE FN.")
        if (response) {
          notify(
            {
              message: 'Worksheet Approved Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not Approved',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      },
      (error) => {}
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
        console.log(
          'Fetched Worksheet Data for Approval:',
          selectedWorksheetData
        );
        this.approveItemStore(selectedWorksheetData);
      },
      (error) => {
        console.error('Error fetching worksheet for verification:', error);
      }
    );
  }

  onVerifyClick(e: any) {
    console.log('Verify Button clicked');
    const rowData = e.row.data; // Access the row data
    const worksheetId = rowData?.ID;
    console.log('Row ID:', worksheetId); 
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
        console.log(
          'Fetched Worksheet Data for Verification:',
          selectedWorksheetData
        );
        this.verifyItemStore(selectedWorksheetData);
        this.dataGrid.instance.refresh();
      },
      (error) => {
        console.error('Error fetching worksheet for verification:', error);
      }
    );
  }

  verifyItemStore(selectedWorksheetData: any) {
    console.log(selectedWorksheetData,"INVERIFY+++++++++++++")
    const payload = {
      COMPANY_ID: selectedWorksheetData.COMPANY_ID || 1,
      USER_ID: selectedWorksheetData.USER_ID || 1,
      STORE_ID: selectedWorksheetData.STORE_ID  ,
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

    console.log('Verification payload:', payload.COMPANY_ID); 
    this.dataservice.verifyItemStoreProperties(payload).subscribe(
      (response) => {
        this.dataGrid.instance.refresh();
        if (response) {
          notify(
            {
              message: 'Worksheet Verified Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not Saved',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      },
      (error) => {}
    );
  }

  onRowRemoving(event: any) {
    const selectedRow = event.data; // Get the data of the selected row
    const id = selectedRow.ID;
    console.log('Delete button clicked for ID:', id);
    if (id) {
      this.dataservice.deleteWorksheet(id).subscribe(
        (response) => {
          console.log('Worksheet deleted successfully:', response);
          const index = this.logList.findIndex((item) => item.ID === id);
          if (index !== -1) {
            this.logList.splice(index, 1); // Remove item from the array
            event.component.refresh(); // Refresh the DataGrid
          }
        },
        (error) => {
          console.error('Error deleting worksheet:', error);
          event.cancel = true; // Prevent row removal if there's an error
        }
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
    this.router.navigate(['/change-item-property']);
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
  ],
  providers: [],
  exports: [ItemStorePropertiesLogComponent],
  declarations: [ItemStorePropertiesLogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemStorePropertiesLogModule {}
