import { Component, EventEmitter, Input, NgModule, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DxButtonModule, DxDataGridModule, DxFormModule, DxSelectBoxModule, DxTagBoxModule, DxTextBoxModule, DxValidationGroupComponent, DxValidatorModule } from 'devextreme-angular';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxoRowDraggingModule } from 'devextreme-angular/ui/nested';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { ImportItemsTemplateComponent } from 'src/app/pages/import-items-template/import-items-template.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-import-item-template-edit-form',
  templateUrl: './import-item-template-edit-form.component.html',
  styleUrls: ['./import-item-template-edit-form.component.scss']
})
export class ImportItemTemplateEditFormComponent implements OnChanges {

  @ViewChild('validationGroup', { static: true }) validationGroup: DxValidationGroupComponent;
  @ViewChild(ImportItemTemplateEditFormComponent) editform: ImportItemTemplateEditFormComponent;
  @ViewChild(ImportItemsTemplateComponent) list: ImportItemsTemplateComponent;

  @Input() formdata: any;
  @Output() closeForm = new EventEmitter();

  TemplateColumnsData:any;
  selectedRows:any[]=[];

  constructor(private service:DataService){
  }
  formModel:any = {
    TEMPLATE_NAME: '',
    REMARKS: '',
    UserID:1,
    import_entry: []
  };
  newItemTemplate=this.formModel;

  getNewItemTemplateData = () => ({ ...this.newItemTemplate });

  onTemplateColumnsValueChanged(e: any) {
    console.log(e,"event")
    this.formModel.import_entry = e.value.map((columnTitle: string) => ({ COLUMN_TITLE: columnTitle }));
  }

  onReorder = (e: Parameters<DxDataGridTypes.RowDragging['onReorder']>[0]) => {
    const visibleRows = e.component.getVisibleRows();
    const toIndex = this.TemplateColumnsData.findIndex(item => item.COLUMN_ID === visibleRows[e.toIndex].data.COLUMN_ID);
    const fromIndex = this.TemplateColumnsData.findIndex(item => item.COLUMN_ID === e.itemData.COLUMN_ID);

    this.TemplateColumnsData.splice(fromIndex, 1);
    this.TemplateColumnsData.splice(toIndex, 0, e.itemData);

    e.component.refresh();
  }

  // onSelectionChanged(e: any) {
  //   console.log("event",e);
  //   this.formModel.import_entry=e.selectedRowsData;
  // }
  onSelectionChanged(e: any) {
    const selectedKeys = e.selectedRowKeys;
    const newlySelectedKeys = selectedKeys.filter(key => !this.selectedRows.includes(key));
    const newlyUnselectedKeys = this.selectedRows.filter(key => !selectedKeys.includes(key));
  
    // Update selected keys to include newly selected and remove unselected
    this.selectedRows = [
      ...this.selectedRows.filter(key => !newlyUnselectedKeys.includes(key)), 
      ...newlySelectedKeys
    ];
  
    // Reorder TemplateColumnsData based on selected keys
    const selectedColumnsSet = new Set(this.selectedRows);
    const remainingColumns = this.TemplateColumnsData.filter(col => !selectedColumnsSet.has(col.COLUMN_TITLE));
    this.TemplateColumnsData = [
      ...this.TemplateColumnsData.filter(col => selectedColumnsSet.has(col.COLUMN_TITLE)), 
      ...remainingColumns
    ];

    console.log("event",e);
    this.formModel.import_entry=e.selectedRowsData.map(id => ({ COLUMN_ID: id.COLUMN_ID }));
    // this.formModel.import_entry = this.selectedRows.map(id => ({ COLUMN_ID: id }))
    console.log("selected columns",this.formModel.import_entry)
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.formdata && changes.formdata.currentValue) {
      console.log(this.formdata, "..............");
      this.formModel = { ...this.formdata };
      this.TemplateColumnsData=this.formdata.import_entry;
      this.selectedRows = this.TemplateColumnsData
      .filter(column => column.SELECTED)
      .map(column => column. COLUMN_TITLE);
    }
    console.log(this.selectedRows,"selected rows");

    // Reorder TemplateColumnsData based on selected keys
    const selectedColumnsSet = new Set(this.selectedRows);
    const remainingColumns = this.TemplateColumnsData.filter(col => !selectedColumnsSet.has(col.COLUMN_TITLE));
    this.TemplateColumnsData = [
      ...this.TemplateColumnsData.filter(col => selectedColumnsSet.has(col.COLUMN_TITLE)), 
      ...remainingColumns
    ];
  }

  close() {
    this.closeForm.emit();
  }
  isValid() {
    return this.validationGroup.instance.validate().isValid;
  }
  onExportClick() {
    const selectedColumns = this.TemplateColumnsData.filter(col => this.selectedRows.includes(col.COLUMN_TITLE));
    const columns = selectedColumns.map(col => col.COLUMN_TITLE);
  
    // Create a new workbook and worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([columns]);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SelectedTemplateColumns');
  
    // Set autowidth for columns
    const colWidths = columns.map(col => ({ wch: col.length + 2 })); // Add some padding to the width
    ws['!cols'] = colWidths;
  
    // Generate the Excel file as a binary string
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
    // Create a Blob object and generate an object URL
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
  
    // Create an anchor element and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.formModel.TEMPLATE_NAME}.xlsx`;
    document.body.appendChild(a);
    a.click();
  
    // Clean up the object URL
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  

  onSaveClick() {
    console.log("hai");
    console.log(this.formModel,"//////////");
    const id=this.formdata.ID;
    const payload={...id,...this.formModel}
    console.log(payload,"payload")
    this.service.updateImportTemplateData(payload).subscribe(data=>{
      if (data) {
        notify(
          {
            message: 'Import Item Template updated Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );

        this.close();

        
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
    
    this.onExportClick();
      
    
  }
  
}
@NgModule({
  imports: [
    DxTextBoxModule,
    DxFormModule,
    DxValidatorModule,
    FormTextboxModule,
    CommonModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxTagBoxModule,
    DxButtonModule,
    DxDataGridModule,
    DxoRowDraggingModule
  ],
  declarations: [ImportItemTemplateEditFormComponent],
  exports: [ImportItemTemplateEditFormComponent],
})
export class ImportItemTemplateEditFormModule {}

