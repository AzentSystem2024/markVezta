import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, ViewChild, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DxButtonModule, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxDateBoxModule, DxFileUploaderModule, DxFormModule, DxPopupModule, DxProgressBarModule, DxRadioGroupModule, DxSelectBoxModule, DxSwitchModule, DxTabsModule, DxTagBoxModule, DxTemplateModule, DxTextAreaModule, DxTextBoxModule, DxToastModule, DxToolbarModule, DxValidatorModule } from 'devextreme-angular';
import { DxoFormItemModule, DxoItemModule, DxoLookupModule } from 'devextreme-angular/ui/nested';
import { DxiDataGridColumn } from 'devextreme-angular/ui/nested/base/data-grid-column-dxi';
// import { DxiDataGridColumn } from 'devextreme-angular/ui/nested/base/data-grid-column-dxi';
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';
import { debounce } from 'lodash';


@Component({
  selector: 'app-stock-view-list',
  templateUrl: './stock-view-list.component.html',
  styleUrls: ['./stock-view-list.component.scss'],

})
export class StockViewListComponent {
    @ViewChild(DxDataGridComponent, { static: true })
    dataGrid: DxDataGridComponent;
  isLoading: boolean = false;
  itemsList: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  
  userId: any;
  companyId: any;
  columns: any;
  stockData: any[] = [];
  stockView: any;
  selectedRows: any;
  selectedRowKeys: any;
  selectedRowIndex: number;
  editorOptions = { placeholder: 'Search column' };
  searchEnabled = true;
  allowSelectAll = true;
  selectByClick = true;
  recursive = true;
  columnChooserModes = [{
    key: 'dragAndDrop',
    name: 'Drag and drop',
  }, {
    key: 'select',
    name: 'Select',
  }];
  isFilterOpened = false;
  GridSource: any;
  isFilterInProgress = false;
  summaryVisible = false;
  ColumnNames: any;
  // highlightedColumnIndex: any;
  highlightedColumnIndex: number | null = null;
  highlightTimeout: any;
  constructor(private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ){}

  ngOnInit(){
    this.userId = sessionStorage.getItem('UserId');
    this.getStockColumns();
  }

  getStockColumns(){
    this.isLoading = true;
    const payload = {
      USER_ID: this.userId,
      COMPANY_ID: 1
    };

    this.dataservice.getStockView(payload).subscribe((response: any) => {
      this.stockView = response
      this.stockData = this.stockView.Data
      // console.log(this.stockData,"stockdata")
      console.log(this.stockView,"stockview")
      this.columns = this.stockView.Columns.map((col: any) => ({
        dataField: col.Name,
        caption: col.Title, 
        dataType: this.mapColumnType(col.Type), 
        visible: col.Visibility,
        // alignment: col.Name === 'TOTAL' ? 'right' : undefined,  
        // groupIndex: col.Group ? 0 : undefined,
      }));    
      this.isLoading = false;
      this.ColumnNames = this.columns.map((col: any) => ({
        text: col.caption, // Display name
        value: col.dataField, // Value used to identify the column
      }));
  
      console.log(this.columns, 'Mapped Column Names for Dropdown');

    })
    console.log(this.columns, "Mapped Columns");
  }

  mapColumnType(type: string): string {
    switch (type) {
      case 'Int':
        return 'number';
      case 'String':
        return 'string';
      case 'Decimal':
        return 'number';
      default:
        return 'string';
    }
  }

  onExporting(event: any) {
    const fileName = 'Stock-View';
    this.dataservice.exportDataGrid(event, fileName);
  }

  onSelectionChanged(event: any) {
    console.log('Selected Row Keys:', event.selectedRowKeys);  // Log selected row keys
    this.selectedRowKeys = event.selectedRowKeys;  // Bind selected row keys
  }

  onRowClick(event) {
    this.selectedRowIndex = event.rowIndex;
    // console.log('Selected Row:', event.data);
  }


  filterClick = () => {
    console.log('Filter Clicked');
    if (this.stockData) {
      this.isFilterOpened = !this.isFilterOpened;
  
      const gridInstance = this.dataGrid.instance; // Get the grid instance directly
      gridInstance.option('filterRow.visible', this.isFilterOpened);
      gridInstance.refresh(); // Refresh the grid after any changes
  
      // setTimeout(() => {
        const focusedCellElement = document.querySelector('.dx-focused input');
        if (focusedCellElement) {
          (focusedCellElement as HTMLInputElement).blur();
        }
      // }, 0);
    }
  };
  
  
  
  refresh = () => {
    this.dataGrid.instance.refresh();
  };
  
  
  

  applyFilter() {
    this.GridSource.filter();
  }

  // SummaryClick = () => {
  //   console.log("summary");
  //   this.summaryVisible = !this.summaryVisible;  // Toggle the visibility
  // };

  // Dynamically return the summary configuration
  getSummaryConfig() {
    return this.summaryVisible
      ? {
        totalItems: [
          {
            column: 'TOTAL',
            summaryType: 'sum',
            displayFormat: ' {0}',
          },
          {
            column: 'DUBAI',
            summaryType: 'sum',
            displayFormat: '{0}', 
          },
          {
            column: 'SHARJAH',
            summaryType: 'sum', 
            displayFormat: '{0}', 
          },
          {
            column: 'AJMAN',
            summaryType: 'sum', 
            displayFormat: '{0}',
          },
        ],
        }
      : null; // Return null if summary should be hidden
  }

  // Function to toggle summary visibility
  SummaryClick = () => {
    console.log('summary button clicked');
    this.summaryVisible = !this.summaryVisible; // Toggle visibility
    const dataGridInstance = this.dataGrid?.instance; // Get the data grid instance
    if (dataGridInstance) {
      dataGridInstance.option('summary', this.getSummaryConfig()); // Update the summary option
      dataGridInstance.refresh(); // Refresh the grid to apply the changes
    }
  };
  
  onContentReady = (e: any) => {
    const gridInstance = e.component;
  
    // Dynamically find and update the 'TOTAL' column alignment
    const totalColumn = gridInstance.columnOption('TOTAL');
    if (totalColumn) {
      gridInstance.columnOption('TOTAL', 'alignment', 'right');
    }
  };

// Method to handle column selection and find the column's location
// findColumnLocation = (e: any) => {
//   console.log('Selected column:', e.itemData);
//   const columnName = e.itemData.value; // The selected column's dataField value

//   // Find the column index using dataField
//   const columnIndex = this.columns.findIndex((col: any) => col.dataField === columnName);

//   if (columnIndex !== -1) {
//     console.log('Column found at index:', columnIndex);
//     this.highlightColumn(columnIndex);  // Call the method to highlight the column
//   } else {
//     console.log('Column not found');
//   }
// };

findColumnLocation = (e: any) => {
  console.log('Selected column:', e.itemData);

  const columnName = e.itemData.value; // The selected column's dataField value

  // Find the column index using dataField
  const columnIndex = this.columns.findIndex((col: any) => col.dataField === columnName);

  if (columnIndex !== -1) {
    console.log('Column found at index:', columnIndex);

    // Store the column index for highlighting
    this.highlightedColumnIndex = columnIndex;

    // Trigger a grid repaint to apply the highlight
    this.dataGrid?.instance.repaint();
    clearTimeout(this.highlightTimeout); // Clear any previous timeout
    this.highlightTimeout = setTimeout(() => {
      this.highlightedColumnIndex = null; // Clear the highlight index
      this.dataGrid?.instance.repaint(); // Repaint the grid to remove the highlight
    }, 3000); 
  } else {
    console.log('Column not found');
    this.highlightedColumnIndex = null; // Clear the highlight if column not found
  }
};

onCellPrepared = (e: any) => {
  if (e.rowType === 'header' || e.rowType === 'data') {
    // Check if the current cell belongs to the highlighted column
    if (e.columnIndex === this.highlightedColumnIndex) {
      e.cellElement.classList.add('highlight-column');
    }
  }
};



highlightColumn = (columnIndex: number) => {
  const dataGridInstance = this.dataGrid?.instance; // Get the grid instance

  if (dataGridInstance) {
    // Get the column header element
    const columnHeader = dataGridInstance.getCellElement(0, columnIndex); // Get the header cell at row index 0 (header row)
    
    if (columnHeader) {
      // Apply a class to highlight the column header
      columnHeader.classList.add('highlight-column');
    }

    // Get all the rows in the grid and highlight the cells in the selected column
    const rowCount = dataGridInstance.getVisibleRows().length;

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const cell = dataGridInstance.getCellElement(rowIndex, columnIndex); // Get the cell at the specific column and row
      if (cell) {
        
        cell.classList.add('highlight-column');
      }
    }

    // Optional: Remove the highlight after a certain duration
    setTimeout(() => {
      // Remove highlight from the header
      if (columnHeader) {
        columnHeader.classList.remove('highlight-column');
      }

      // Remove highlight from all cells in the column
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const cell = dataGridInstance.getCellElement(rowIndex, columnIndex);
        if (cell) {
          cell.classList.remove('highlight-column');
        }
      }
    }, 3000); // Remove the highlight after 3 seconds
  }
};



  


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
    DxTabsModule,
    DxTemplateModule,
    DxoFormItemModule,
    DxToolbarModule,
    DxRadioGroupModule,
    DxPopupModule,
    DxTagBoxModule,
    DxToastModule,
    DxSwitchModule,
    
  ],
  providers: [],
  exports: [],
  declarations: [StockViewListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StockViewListModule {}