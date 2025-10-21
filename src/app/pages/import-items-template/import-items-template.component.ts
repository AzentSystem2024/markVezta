import { ChangeDetectorRef, Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { DxButtonModule, DxDataGridComponent, DxDataGridModule, DxPopupModule, DxTextBoxModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { ImportItemTemplateFormComponent,ImportItemTemplateFormModule } from 'src/app/components/library/import-item-template-form/import-item-template-form.component';
import { ImportItemTemplateEditFormModule,ImportItemTemplateEditFormComponent } from 'src/app/components/library/import-item-template-edit-form/import-item-template-edit-form.component';
import { DxoRowDraggingModule } from 'devextreme-angular/ui/nested';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { Column } from 'jspdf-autotable';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-import-items-template',
  templateUrl: './import-items-template.component.html',
  styleUrls: ['./import-items-template.component.scss']
})
export class ImportItemsTemplateComponent implements OnInit{

  @ViewChild(ImportItemTemplateFormComponent) itemComponent: ImportItemTemplateFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;

  itemTemplate:any[]=[];
  isPopupOpened:boolean=false;
  isEditPopupOpened:boolean=false;
  TemplateColumnsData:any;
  seletedData:any;
  selectedTemplateColumnKeys: any[] = [];
  selectedRowData:any;
  

  constructor(private service:DataService,private cdr: ChangeDetectorRef){
    
  }

  onEditingRow(event): void {
    event.cancel = true;
    const itemId = event.data.ID;
    this.isEditPopupOpened = true;
    this.service.selectImportTemplateData(itemId).subscribe(res=>{
      this.selectedRowData = res.data[0];
      this.cdr.detectChanges(); // Ensure Angular picks up the change
      console.log(this.selectedRowData)
    })
}

// onSelectionChanged(e: any) {
//   const selectedKeys = e.selectedRowKeys;
//   const newlySelectedKeys = selectedKeys.filter(key => !this.selectedTemplateColumnKeys.includes(key));
//   const newlyUnselectedKeys = this.selectedTemplateColumnKeys.filter(key => !selectedKeys.includes(key));

//   // Update selected keys to include newly selected and remove unselected
//   this.selectedTemplateColumnKeys = [
//     ...this.selectedTemplateColumnKeys.filter(key => !newlyUnselectedKeys.includes(key)), 
//     ...newlySelectedKeys
//   ];

//   // Reorder TemplateColumnsData based on selected keys
//   const selectedColumnsSet = new Set(this.selectedTemplateColumnKeys);
//   const remainingColumns = this.TemplateColumnsData.filter(col => !selectedColumnsSet.has(col.ID));
//   this.TemplateColumnsData = [
//     ...this.TemplateColumnsData.filter(col => selectedColumnsSet.has(col.ID)), 
//     ...remainingColumns
//   ];
// }

  getItemsTemplateData(){
    this.service.getImportTemplateData().subscribe(res=>{
      this.itemTemplate=res.data;
    })
  }
  onReorder = (e: Parameters<DxDataGridTypes.RowDragging['onReorder']>[0]) => {
    const visibleRows = e.component.getVisibleRows();
    const toIndex = this.TemplateColumnsData.findIndex(item => item.ID === visibleRows[e.toIndex].data.ID);
    const fromIndex = this.TemplateColumnsData.findIndex(item => item.ID === e.itemData.ID);

    this.TemplateColumnsData.splice(fromIndex, 1);
    this.TemplateColumnsData.splice(toIndex, 0, e.itemData);

    e.component.refresh();
  }

  ngOnInit(): void {
    this.getItemsTemplateData();
  }

  openForm(){
    this.isPopupOpened=true;
  }
  onClickSave(){
    const data =this.itemComponent.getNewItemTemplateData();
    console.log('inserted data',data);
    this.service.postImportTemplate(data).subscribe(
      (response)=>{
        if(response){
          this.getItemsTemplateData();
        }
      }
    )
  }
  onRowRemoving(event: any) {
    var SelectedRow = event.key;
    console.log('selected row',SelectedRow);
    this.service.removeImportTemplateData(SelectedRow.ID,{}).subscribe(() => {
      try {
        // Your delete logic here
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        );
        this.dataGrid.instance.refresh();
        this.getItemsTemplateData();
      } catch (error) {
        notify(
          {
            message: 'Delete operation failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    });
  }
  onRowUpdating(data:any){
    console.log(data);
  }
  onExportClick() {
    const selectedColumns = this.TemplateColumnsData.filter(col => this.selectedTemplateColumnKeys.includes(col.COLUMN_TITLE));
    const columns = selectedColumns.map(col => col.COLUMN_TITLE);
  
    // Create a new worksheet and add the column titles
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([columns]);
  
    // Function to calculate the maximum width of a column
    const getMaxWidth = (data: string[]) => {
      const maxLength = Math.max(...data.map(item => item.length));
      return { wch: maxLength + 2 }; // Add some padding
    };
  
    // Calculate the maximum width for each column and apply it
    const colWidths = columns.map((column, index) => {
      // Collect all the data for the column
      const columnData = [column, ...this.TemplateColumnsData.map(item => item.COLUMN_TITLE)];
      return getMaxWidth(columnData);
    });
    ws['!cols'] = colWidths;
  
    // Apply wrapping to the header cells
    columns.forEach((col, index) => {
      const cellAddress = XLSX.utils.encode_cell({ c: index, r: 0 });
      if (!ws[cellAddress].s) {
        ws[cellAddress].s = {};
      }
      ws[cellAddress].s.alignment = { wrapText: true };
    });
  
    // Create a new workbook and append the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SelectedTemplateColumns');
  
    // Use the TEMPLATE_NAME from the formModel to name the file
    const fileName = `${this.seletedData.TEMPLATE_NAME}.xlsx`;
  
    // Write the file
    XLSX.writeFile(wb, fileName);
  }
  
  CloseEditForm(){
    this.isEditPopupOpened = false;
    this.dataGrid.instance.refresh();
    this.getItemsTemplateData();
    console.log("closeform");
  }
}


@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,DxTextBoxModule,FormPopupModule,ImportItemTemplateFormModule,DxoRowDraggingModule,DxPopupModule,ImportItemTemplateEditFormModule
  ],
  providers: [],
  exports: [],
  declarations: [ImportItemsTemplateComponent],
})
export class ImportItemsTemplateModule{}