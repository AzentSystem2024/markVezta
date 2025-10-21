import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxNumberBoxModule,
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
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { DxValidationGroupComponent } from 'devextreme-angular';
import {
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { Observable } from 'rxjs';
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';
import { DxNumberBoxTypes } from 'devextreme-angular/ui/number-box';

@Component({
  selector: 'app-promotion-schema-log',
  templateUrl: './promotion-schema-log.component.html',
  styleUrls: ['./promotion-schema-log.component.scss'],
})
export class PromotionSchemaLogComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  showHeaderFilter = true;
  logList: any;
  isPopupVisible: boolean = false;
  detailsPopup: boolean = false;
  types: string = '';
  isEditPopupVisible: boolean = false;
  promotionData: any = {};
  isConfirmationVisible: boolean = false;
  itemToDelete: any;
  popupWidth = 600;
  popupHeight = 400;
  selectedSchemaTypeID: number;
  promotionSchema: any[] = [];
  selectedPromotionSchema: any;
  isMultiple: boolean = false;
  regular: boolean = false;
  isMore: boolean = false;
  areRadioButtonsDisabled: boolean = true;
  isQtyGetDisabled: boolean = false;
  buyAndGetDisabled: boolean = false;
  tableData: { qtyToBuy: number; discount: number; description: string }[] = [];
  description: any;
  selectedPromotion: any;
  id: number;
  formFields: {
    DESCRIPTION: any;
    QTY_BUY: any;
    QTY_GET: any;
    DISC_PERCENT: any;
    IS_INACTIVE: any;
    SCHEMA_TYPE_ID: any;
    SCHEMA_ON_REGULAR_PRICE: any;
    SCHEMA_ON_QUANTITY_MULTIPLE: any;
  };
  dataReady: boolean = false;
  tableData$: Observable<any[]>;
  selectedSchemaCondition: string = 'multiple';
  currentSchemaValue: string;
  // selectedValueInEdit: string = 'regular'; 
  isSchemaOnQuantityMultiple: boolean;
  // selectedRadioValue: any = 'multiple';
  schemaCondition: string;
  SCHEMA_ON_QUANTITY_MULTIPLE: any;
  SCHEMA_ON_REGULAR_PRICE: any;
  selectedSchemaType: string = '';
  DISC_PERCENT: any;

  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef
  ) {
    this.dataservice.getDropdownData('PROMOTIONSCHEMA_TYPE').subscribe((data) => {
      this.promotionSchema = data;
      console.log(this.promotionSchema, 'dropdown');
    });
  }



  ngOnInit() {
    this.getLogList();
    this.setSchemaType();
  }

  setSchemaType() {
    this.selectedSchemaType = this.promotionData.SCHEMA_ON_QUANTITY_MULTIPLE ? 'multiple' : 'regular';
  }


  adjustPopupSize() {
    if (this.selectedPromotionSchema === 3) {
      this.popupWidth = 650;
      this.popupHeight = 500;
    } else {
      this.popupWidth = 650;
      this.popupHeight = 400;
    }
  }

  onPromotionSchemaChange(event: any) {
    this.selectedPromotionSchema = event.value;
    this.areRadioButtonsDisabled = this.selectedPromotionSchema !== 1;
    const selectedID = event.value;
    this.selectedPromotionSchema !== this.promotionSchema[0]?.DESCRIPTION;
    this.isQtyGetDisabled =
      this.selectedPromotionSchema === this.promotionSchema[0]?.ID;
    this.buyAndGetDisabled =
      this.selectedPromotionSchema === this.promotionSchema[2]?.ID;
    const selectedSchema = this.promotionSchema.find(
      (schema) => schema.ID === this.selectedPromotionSchema
    );
    if (this.selectedPromotionSchema === 3) {
      this.tableData = [];
    } else {
      this.tableData = [];
    }
    this.adjustPopupSize();
  }

  getLogList() {
    this.dataservice.getPromotionSchemaLog().subscribe((response: any) => {
      this.logList = response.promotion_data || [];
      this.logList.sort((a: any, b: any) => {
        const idA = a.ID || 0;
        const idB = b.ID || 0;
        return idB - idA; // Descending order by ID
      });
      console.log(this.logList, 'Sorted LOGLIST');
    });
  }
  

  openEditingStart(event: any) {
    const id = event.data.ID;
    if (id) {
      event.cancel = true; // Prevent default editing action
      this.dataservice.selectPromotionSchema(id).subscribe(
        (response: any) => {
          if (response) {

            this.promotionData = response; // Store the fetched data
            this.tableData = response.promotionschema_entry;
            console.log(this.promotionData,"PROMOTION")
            this.setSchemaType();
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 0);
            // this.dataReady = true;
            this.isEditPopupVisible = true; // Show the edit popup
            this.dataGrid.instance.refresh();
          } else {
            console.error('Error fetching promotion schema:', response.message);
          }
        },
        (error) => {
          console.error('API Error:', error);
        }
      );
    }
  }

  onSchemaTypeChange(event: any) {
    console.log(event.value, "inevent");
    if (event.value === 'multiple') {
      this.promotionData.SCHEMA_ON_QUANTITY_MULTIPLE = true;
      this.promotionData.SCHEMA_ON_REGULAR_PRICE = false;
    } else {
      this.promotionData.SCHEMA_ON_QUANTITY_MULTIPLE = false;
      this.promotionData.SCHEMA_ON_REGULAR_PRICE = true;
    }
  }

  

  handleSchemaConditionChange(event: any) {
    const selectedValue = event.value.value; // Get the selected value
    console.log(event.value, 'SCHEMA');
    if (!this.promotionData.SCHEMA_ON_QUANTITY_MULTIPLE) {
      this.promotionData.SCHEMA_ON_QUANTITY_MULTIPLE = false; // Default to false
    }
    if (!this.promotionData.SCHEMA_ON_REGULAR_PRICE) {
      this.promotionData.SCHEMA_ON_REGULAR_PRICE = false; // Default to false
    }
    if (selectedValue === 'multiple') {
      this.promotionData.SCHEMA_ON_QUANTITY_MULTIPLE = true;
      console.log(
        this.promotionData.SCHEMA_ON_QUANTITY_MULTIPLE,
        'PROMOTIONDATA'
      );
      this.promotionData.SCHEMA_ON_REGULAR_PRICE = false; // Ensure the other is set to false
    } else if (selectedValue === 'more') {
      this.promotionData.SCHEMA_ON_QUANTITY_MULTIPLE = false;
      this.promotionData.SCHEMA_ON_REGULAR_PRICE = true; // Ensure the other is set to false
    }
    console.log('Schema condition changed:', this.promotionData);
  }



  onAddClick() {
    this.id = null;
    this.isPopupVisible = true;

    this.resetPopup();
    this.selectedSchemaCondition = 'multiple';
  }

  onRowInserted(event: any) {
    const newRow = event.data; // Get the new row data from the event
    this.tableData.push(newRow); // Push the new row at the end of the array
    this.tableData = [...this.tableData];
    this.dataGrid.instance.refresh(); // Refresh the grid to reflect changes
  }
  

  savePromotionShema() {
    console.log(this.promotionData,"PROMOTIONDATA")
    console.log(this.DISC_PERCENT,"DISCOUNTTTT")
    const isDuplicate = this.logList.some((row) => row.DESCRIPTION === this.promotionData.DESCRIPTION);
  
    if (isDuplicate) {
      notify({
        message: "This promotion name already exists. Please use a different name.",
        position: { at: 'top right', my: 'top right' },
      }, 'error');
      return; // Exit the function if there's a duplicate
    }
    const payload = {
      DESCRIPTION: this.promotionData.DESCRIPTION, // Use promotionData
      QTY_BUY: this.promotionData.QTY_BUY ?? 1.0,
      QTY_GET: this.promotionData.QTY_GET ,
      DISC_PERCENT: this.DISC_PERCENT,
      IS_INACTIVE: this.promotionData.IS_INACTIVE || false,
      SCHEMA_TYPE_ID: this.promotionData.SCHEMA_TYPE_ID || 1, // Use promotionData
      SCHEMA_ON_QUANTITY_MULTIPLE:
        this.promotionData.SCHEMA_ON_QUANTITY_MULTIPLE,
      SCHEMA_ON_REGULAR_PRICE: this.promotionData.SCHEMA_ON_REGULAR_PRICE,
      promotionschema_entry:
        this.tableData.length > 0
          ? this.tableData.map((row) => ({
              QTY_BUY: row.qtyToBuy ?? 0,
              DISC_PERCENT: row.discount ?? 0,
              DESCRIPTION: row.description || '',
            }))
          : [{ QTY_BUY: 0, DISC_PERCENT: 0, DESCRIPTION: '' }],
    };
    this.dataservice.savePromotionSchema(payload).subscribe((response: any) => {
      if (response) {
        try{
          notify({
            message:"Promtion Schema added successfully",
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        )
        this.dataGrid.instance.refresh();
        this.isPopupVisible = false;
        this.getLogList();
        }
        catch(error){
          notify({
            message : "Add operation failed",
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        )
        }
      }
    });
  }

handleSchemaConditionChangeinEdit(event: any) {
  this.schemaCondition = event.value;
  // Map back to boolean
  this.promotionData.SCHEMA_ON_QUANTITY_MULTIPLE = event.value === 'multiple';
}


  openDetailsPopup() {
    this.detailsPopup = true;
    this.areRadioButtonsDisabled = true;
  }

  updatePromotionSchema() {
    const isDuplicate = this.logList.some((row) => row.DESCRIPTION === this.promotionData.DESCRIPTION &&
    row.ID !== this.promotionData.ID); // Exclude the current promotion being edited

  if (isDuplicate) {
    notify({
      message: "This promotion name already exists. Please use a different name.",
      position: { at: 'top right', my: 'top right' },
    }, 'error');
    return; // Exit the function if there's a duplicate
  }
    const payload = {
      ID: this.promotionData.ID,
      DESCRIPTION: this.promotionData.DESCRIPTION,
      QTY_BUY: this.promotionData.QTY_BUY || 1.0,
      QTY_GET: this.promotionData.QTY_GET || 1.0,
      DISC_PERCENT: this.promotionData.DISC_PERCENT,
      IS_INACTIVE: this.promotionData.IS_INACTIVE || false,
      SCHEMA_TYPE_ID: this.promotionData.SCHEMA_TYPE_ID || 1,
      SCHEMA_ON_QUANTITY_MULTIPLE:
        this.promotionData.SCHEMA_ON_QUANTITY_MULTIPLE,
      SCHEMA_ON_REGULAR_PRICE: this.promotionData.SCHEMA_ON_REGULAR_PRICE,
      promotionschema_entry: this.promotionData.promotionschema_entry ?? [],
    };

    this.dataservice.updatePromotionSchema(payload).subscribe(
      (response: any) => {
        if (response) {
          try{
            notify({
              message:"Promtion Schema updated successfully",
              position: { at: 'top right', my: 'top right' },
            },
            'success'
          )
          this.dataGrid.instance.refresh();
          this.isEditPopupVisible = false;
          this.getLogList();
          }
          catch(error){
            notify({
              message : "Edit operation failed",
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          )
          }
        } else {
          console.error('Update Failed:', response.message);
        }
      },
      (error) => {
        console.error('API Error:', error);
      }
    );
  }

  onRowRemoving(event) {
    const selectedRow = event.data; // Get the data of the selected row
    const id = selectedRow.ID;
  
    // Cancel the row removal until the delete operation is confirmed
    event.cancel = true;
  
    this.dataservice.deletePromotion(id).subscribe(
      (response: any) => {
        if (response.flag === "0") {
          // Promotion is in use, show a notification and prevent deletion
          notify(
            {
              message: response.message || 'Cannot delete.. Promotion is in use..',
              position: { at: 'top center', my: 'top center' },
            },
            'error'
          );
        } else {
          // Successful deletion
          notify(
            {
              message: 'Promotion Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
  
          // If the deletion is successful, refresh the data grid
          this.dataGrid.instance.refresh();
        }
      },
      (error) => {
        console.error('Error deleting promotion:', error);
        // Handle API error
        notify(
          {
            message: 'Delete Operation Failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    );
  }
  
  

  onSaved(event: any) {
    // Loop through the changes to find added rows
    event.changes.forEach((change) => {
      if (change.type === 'insert') {
        // Append each new row to the end of `tableData`
        this.tableData = [...this.tableData, change.data];
      }
    });
  }

  resetPopup() {
    this.promotionData = {}; // Clear the main data object
    this.tableData = []; // Reset table data
    this.selectedPromotionSchema = null;
  }

  onSchemaConditionChange(field: string, value: boolean) {
    // Update the respective field in promotionData based on the user's choice
    this.promotionData[field] = value;
  }

  keyDown(e: DxNumberBoxTypes.KeyDownEvent) {
    const event = e.event;
    const str = event.key;
    if (/^[.,e]$/.test(str)) {
      event.preventDefault();
    }
  }
  
  onPercentageChange(event: any) {
    let value = event.value;

    // If the value contains the '%' symbol, remove it
    if (typeof value === 'string' && value.includes('%')) {
      value = value.replace('%', '');
    }

    // Ensure the value is numeric
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      this.promotionData.DISC_PERCENT = numericValue;
    } else {
      this.promotionData.DISC_PERCENT = 0; // Default to 0 if invalid
    }
  }

  // Method to get the formatted percentage for display purposes
  getFormattedPercentage(): string {
    return `${this.promotionData.DISC_PERCENT}%`;
  }
  

  onSelectionChanged(event) {}
  onCellPrepared(event) {}
  SavePromotion() {}
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
    DxNumberBoxModule,
    DxValidationGroupModule,
    DxValidatorModule
  ],
  providers: [],
  exports: [PromotionSchemaLogComponent],
  declarations: [PromotionSchemaLogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PromotionSchemaLogModule {}
