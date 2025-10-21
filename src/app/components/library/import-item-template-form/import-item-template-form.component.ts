import { Component, NgModule } from '@angular/core';
import { DxButtonModule, DxDataGridModule, DxFormModule, DxSelectBoxModule, DxTagBoxModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DataService } from 'src/app/services';
import { DxoRowDraggingModule } from 'devextreme-angular/ui/nested';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';

@Component({
  selector: 'app-import-item-template-form',
  templateUrl: './import-item-template-form.component.html',
  styleUrls: ['./import-item-template-form.component.scss']
})
export class ImportItemTemplateFormComponent {
  TemplateColumnsData:any;
  selectedRows:any[]=[];

  constructor(private service:DataService){
    service.getTemplateColumnData().subscribe(res=>{
      service.getTemplateColumnData().subscribe(res => {
        this.TemplateColumnsData = res.data;
  
        // Initialize selectedRows based on IS_MANDATORY property
        this.selectedRows = this.TemplateColumnsData
          .filter(column => column.IS_MANDATORY)
          .map(column => column.ID);
  
        // Update formModel with initial import_entry values
        this.formModel.import_entry = this.selectedRows.map(id => ({ COLUMN_ID: id }));
        console.log(this.TemplateColumnsData, "Columns");
      });
    })
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
    const toIndex = this.TemplateColumnsData.findIndex(item => item.ID === visibleRows[e.toIndex].data.ID);
    const fromIndex = this.TemplateColumnsData.findIndex(item => item.ID === e.itemData.ID);

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
    const remainingColumns = this.TemplateColumnsData.filter(col => !selectedColumnsSet.has(col.ID));
    this.TemplateColumnsData = [
      ...this.TemplateColumnsData.filter(col => selectedColumnsSet.has(col.ID)), 
      ...remainingColumns
    ];

    console.log("event",e);
    console.log(this.selectedRows,"selected rows")
    this.formModel.import_entry = this.selectedRows.map(id => ({ COLUMN_ID: id }));
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
  declarations: [ImportItemTemplateFormComponent],
  exports: [ImportItemTemplateFormComponent],
})
export class ImportItemTemplateFormModule {}
