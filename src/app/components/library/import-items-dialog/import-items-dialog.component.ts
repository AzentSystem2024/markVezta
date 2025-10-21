import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, NgModule, OnInit, Output, ViewChild } from '@angular/core';
import { DxSelectBoxModule, DxTagBoxModule, DxToolbarModule, DxTooltipModule } from 'devextreme-angular';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { eventNames } from 'process';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import * as XLSX from 'xlsx';  // Import xlsx library
import { kMaxLength } from 'buffer';
import { CommonModule } from '@angular/common';
import Validator from 'devextreme/ui/validator';
import { TooltipCellModule,TooltipCellComponent } from 'src/app/components/utils/tooltip-cell/tooltip-cell.component';
import { NonNullableFormBuilder } from '@angular/forms';
import { ImportItemsComponent } from 'src/app/operations/import-items/import-items.component';

@Component({
  selector: 'app-import-items-dialog',
  templateUrl: './import-items-dialog.component.html',
  styleUrls: ['./import-items-dialog.component.scss']
})
export class ImportItemsDialogComponent implements AfterViewInit {
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  datasource: any[] = [];  
  itemTemplateData:any;
  selectedData:any;
  columns: any[];
  isDatasourceLoaded:boolean=false;
  errorCells: Set<string> = new Set(); // To track cells with validation errors
  flag=0;
  stores:any;
  selectedStoreIds: number[] = []; // Array to store selected store IDs
  storeid: string | null = null;   // Comma-separated string of store IDs
  remarks: string | null = null; 
  userid:number=0;
  templateid:number=0;
  @Output() closeForm = new EventEmitter();
  @ViewChild(ImportItemsComponent) importitem: ImportItemsComponent;
  constructor(private service:DataService,private cd: ChangeDetectorRef){
    service.getDropdownData('STORE').subscribe((data) => {
      this.stores = data;
      console.log(this.stores,"stores")
    });
    
  }

  ngAfterViewInit() {
    // This will ensure that importitem is available after the view has initialized
    console.log(this.importitem.getItemImportLog(),"import item");
}

  importButtonOptions = {
    icon: 'download',
    hint:'Import',
    onClick: () => this.triggerFileInput()
  };
  saveButtonOptions = {
    text:'Save',
    hint: 'Save',
    elementAttr: {
      class: 'custom-button'
    },
    onClick: () => {
      this.saveData()
    }
  };
  saveData() {
    // Reset the validation flag before checking
    let hasErrors = false;
  
    // Clear previous error messages
    this.columns.forEach(col => {
      this.dataGrid.instance.columnOption(col.dataField, 'cssClass', null);
    });
  
    // Check each item for validation errors
    this.datasource.forEach(item => {
      this.columns.forEach(col => {
        const value = item[col.dataField];
        // Check for mandatory fields
        if (col.isMandatory && !value) {
          hasErrors = true; // Set flag to indicate error
          console.log(`Error: ${col.dataField} is mandatory but empty`);
          this.dataGrid.instance.columnOption(col.dataField, 'cssClass', 'highlight-column'); // Highlight column
        }
        // Check for max length
        if (value && value.length > col.maxLength) {
          hasErrors = true; // Set flag to indicate error
          console.log(`Error: Value for ${col.dataField} exceeds max length of ${col.maxLength}`);
          this.dataGrid.instance.columnOption(col.dataField, 'cssClass', 'highlight-column'); // Highlight column
        }
      });
    });
  
    if (hasErrors) {
      notify({
        message: 'Please fix the validation errors before saving.',
        position: { at: 'top right', my: 'top right' }
      }, 'error');
      return; // Stop the save operation
    }
  
    // Proceed with data transformation if no errors
    const transformedData = this.datasource.map(item => ({
      ITEM_CODE: item.ItemCode?.toString().substring(0, 50) || "",
      BARCODE: item.Barcode?.toString().substring(0, 50) || "",
      DESCRIPTION: item.Description?.toString().substring(0, 100) || "",
      POS_DESCRIPTION: item["POS Description"]?.toString().substring(0, 100) || "",
      ARABIC_DESCRIPTION: item["Arabic Description"]?.toString().substring(0, 100) || "",
      DEPT_CODE: item["Department Code"]?.toString().substring(0, 10) || "",
      DEPT_NAME: item.Department?.toString().substring(0, 50) || "",
      CAT_CODE: item["Category Code"]?.toString().substring(0, 10) || "",
      CAT_NAME: item.Category?.trim().toString().substring(0, 50) || "",
      SUBCAT_CODE: item["Subcategory Code"]?.toString().substring(0, 10) || "",
      SUBCAT_NAME: item["Subcateory"]?.toString().substring(0, 50) || "",
      BRAND_CODE: item["Brand Code"]?.toString().substring(0, 10) || "",
      BRAND_NAME: item.Brand?.toString().substring(0, 50) || "",
      SUPP_CODE: item["Supplier Code"]?.toString().substring(0, 10) || "",
      SUPP_NAME: item["Supplier Name"]?.toString().substring(0, 50) || "",
      SUPP_PRICE: item["Supplier Price"]?.toString().substring(0, 15) || "0",
      COST: item["Item Cost"]?.toString().substring(0, 15) || "0",
      VAT_PERCENT: item["VAT Percent"]?.toString().substring(0, 15) || "0",
      PRICE: item.Price?.toString().substring(0, 15) || "0",
      ITEM_TYPE: item["Item Type"]?.toString().substring(0, 10) || "",
      IS_DISCOUNTABLE: item.Discountable?.toString().substring(0, 10) || "",
      COSTING_METHOD: item["Costing Method"]?.toString().substring(0, 10) || "",
      IS_SELLABLE: item["Sellable"]?.toString().substring(0, 10) || "",
      SHELF_LIFE: item["Shelf Life"]?.toString().substring(0, 15) || "0",
    }));
    const dataToSave = {
      TEMPLATE_ID:this.templateid, // Replace with actual template ID
      STORE_ID: this.storeid,    // Replace with actual store ID
      USER_ID: 1,     // Replace with actual user ID
      REMARKS: this.remarks,
      importitem_logentry: transformedData
    };
  
    // Now you can send transformedData to your API or wherever needed
    console.log(dataToSave);
  
    this.service.saveImportedData(dataToSave).subscribe(response => {
      if (response.message=='Success') {
        notify({
          message: 'Data saved successfully!',
          position: { at: 'top right', my: 'top right' }
        }, 'success');
        
        // Insert logic here if needed after successful save
        // this.clearDataGrid();
        this.close();
      } else {
        notify({
          message: 'Unexpected error occurred!',
          position: { at: 'top right', my: 'top right' }
        }, 'error');
      }
    }, error => {
      notify({
        message: 'Error saving data! ',
        position: { at: 'top right', my: 'top right' }
      }, 'error');
    });
  }

  close(){
    this.closeForm.emit();
  }
  
  onCellPrepared(e) {
    console.log(e)
    const column = this.columns.find(col => col.dataField === e.column.dataField);
    
    if (column) {
        const value = e.data[column.dataField];

        // Reset styles for all cells first
        e.cellElement.style.color = ""; 
        e.cellElement.style.border = ""; 
        e.cellElement.setAttribute("title",""); // Clear the title attribute

        // Check for mandatory field first
        if (column.isMandatory && !value) {
            this.flag = 1; // Set flag to indicate error
            e.cellElement.style.border = "2px solid #FFC1C3"; // Style for mandatory error
            e.cellElement.style.color = "red"; // Color for mandatory error

            // Create a tooltip for mandatory fields
            this.createTooltip(e.cellElement, `Error: This field is required`);
        }

        // Check if the value exceeds the maximum length
        if (value && value.length > column.maxLength) {
            this.flag = 1; // Set flag to indicate error
            e.cellElement.style.border = "2px solid #FFC1C3"; // Style for max length error

            // Create a tooltip for max length
            this.createTooltip(e.cellElement, `Error: Value exceeds maximum length of ${column.maxLength}`);
        }
    }
}

// Helper method to create and show tooltips
private createTooltip(cellElement: HTMLElement, message: string) {
    const tooltip = document.createElement("div");
    tooltip.innerText = message;
    tooltip.classList.add("error-tooltip");
    tooltip.style.display = "none"; // Hide by default
    cellElement.appendChild(tooltip);

    // Show the tooltip on hover
    cellElement.addEventListener("mouseenter", () => {
        tooltip.style.display = "block"; // Show tooltip
    });
    cellElement.addEventListener("mouseleave", () => {
        tooltip.style.display = "none"; // Hide tooltip
    });
}

  

  
  
  triggerFileInput() {
    document.getElementById('fileInput')!.click();
  }
  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      notify(
        {
          message: 'Cannot use multiple files',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        5000
      ); 
      this.resetFileInput();
      return;
  }
  
    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
  
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  
        // Process the header and row data once
        const headerData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const rowData: any[] = XLSX.utils.sheet_to_json(ws);
  
        console.log('Row Data Length:', rowData.length);

        
        if (!Array.isArray(headerData[0])) {
          notify(
            {
              message: 'The imported Excel file format is incorrect.',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
            5000
          );
          this.resetFileInput();
          return;
        }
  
        const excelColumnCount = headerData[0].length;
        console.log('Excel Column Count:', excelColumnCount);
  
        const gridColumnCount = this.columns.length;
        console.log('DataGrid Column Count:', gridColumnCount);

        const excelHeaders = headerData[0];
        console.log('Excel Headers:', excelHeaders);

        const gridColumnHeaders = this.columns.map(col => col.dataField);
        console.log('DataGrid Headers:', gridColumnHeaders);
        if (excelColumnCount == gridColumnCount && this.arraysMatch(excelHeaders, gridColumnHeaders)) {

          if (rowData.length == 0) {
            notify(
              {
                message: 'The imported Excel file is empty.',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
              5000
            );
            this.resetFileInput();
            return;
          }
        }

       if (excelColumnCount == gridColumnCount && !this.arraysMatch(excelHeaders, gridColumnHeaders)) {

        notify(
          {
            message: 'The column headers in the imported Excel file does not match the DataGrid column header.',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
          5000
        );
        this.resetFileInput();
        return;
      }
  
        if (gridColumnCount === 0) {
          notify(
            {
              message: 'Please choose a template name to proceed with the import.',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
            5000
          );
          this.resetFileInput();
          return;
        }
  
        if (excelColumnCount !== gridColumnCount) {
          console.log('Column counts do not match.');
          notify(
            {
              message: 'The number of columns in the imported Excel file does not match the table columns.',
              position: { at: 'top right', my: 'top right' },
              closeOnClick: true,
            },
            'error',
            5000
          );
          this.resetFileInput();
          return;
        }
  
        // Set the parsed data as the DataGrid's data source
        this.dataGrid.instance.refresh();
        this.datasource = rowData;
        this.loadData();
       
        console.log('Datasource loaded:', this.datasource);
      } catch (error) {
        notify(
          {
            message: 'An error occurred while processing the Excel file.',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
          5000
        );
        this.resetFileInput();
        return;
        console.error('Error processing file:', error);
      }
    };
    reader.readAsBinaryString(target.files[0]);
  }
  loadData(){
    this.isDatasourceLoaded = true;
    console.log(this.isDatasourceLoaded,"boolean value")
    this.cd.detectChanges();
  }
  arraysMatch(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
  resetFileInput() {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
}

  onTemplateValueChanged(event){
    console.log('event',event)
    // Clear the current data grid data
    this.clearDataGrid();
    this.resetFileInput();

    const value=event.value
    this.templateid=event.value;

    console.log(value,"id value");

    this.service.selectImportTemplateData(value).subscribe(res=>{
      this.selectedData=res.data[0];
      console.log(this.selectedData,"selected data in update columns")
      this.columns = this.selectedData.import_entry.filter(entry=>entry.SELECTED).map(entry => ({
      dataField: entry.COLUMN_TITLE,
      maxLength: entry.MAX_LENGTH,
      isMandatory: entry.IS_MANDATORY
    }));
    console.log(this.columns,"COLUMNSSSSS")
    })  
  }
  

  clearDataGrid() {
    this.datasource = [];
    this.isDatasourceLoaded = false;
    this.cd.detectChanges();
  }

  
  getItemTemplateName(){
    this.service.getImportTemplateData().subscribe(res=>{
      this.itemTemplateData=res.data;
    })
  }
  onStoreSelectionChanged(event:any){
    this.selectedStoreIds = event.value; 
    this.storeid = this.selectedStoreIds.join(','); // Join them into a comma-separated string
    console.log('Selected Store IDs:', this.storeid); // Output: "1,2,3"

    this.remarks = this.stores
    .filter(store => this.selectedStoreIds.includes(store.ID))
    .map(store => store.DESCRIPTION)
    .join(', ');

    console.log('Remarks:', this.remarks);  
  }

  ngOnInit(): void {
    this.getItemTemplateName();
  }

}

@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,DxToolbarModule,DxSelectBoxModule,CommonModule,TooltipCellModule,DxTooltipModule,DxTagBoxModule
  ],
  providers: [],
  exports: [ImportItemsDialogComponent],
  declarations: [ImportItemsDialogComponent],
})

export class ImportItemsDialogModule{}
