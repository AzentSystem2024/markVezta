import { Component, NgModule, OnInit } from '@angular/core';
import {
  DxButtonModule,
  DxDataGridModule,
  DxFormModule,
  DxSelectBoxModule,
  DxTagBoxModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DataService } from 'src/app/services';
import { DxoRowDraggingModule } from 'devextreme-angular/ui/nested';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';

@Component({
  selector: 'app-import-item-template-form',
  templateUrl: './import-item-template-form.component.html',
  styleUrls: ['./import-item-template-form.component.scss'],
})
export class ImportItemTemplateFormComponent implements OnInit {
  TemplateColumnsData: any;
  selectedRows: any[] = [];
  itemTemplate:any;

  constructor(private service: DataService) {
    service.getTemplateColumnData().subscribe((res) => {
      service.getTemplateColumnData().subscribe((res) => {
        this.TemplateColumnsData = res.data;

        // Initialize selectedRows based on IS_MANDATORY property
        this.selectedRows = this.TemplateColumnsData.filter(
          (column) => column.IS_MANDATORY,
        ).map((column) => column.ID);

        // Update formModel with initial import_entry values
        this.formModel.import_entry = this.selectedRows.map((id) => ({
          COLUMN_ID: id,
        }));
      });
    });
  }
  formModel: any = {
    TEMPLATE_NAME: '',
    REMARKS: '',
    UserID: 1,
    import_entry: [],
  };
  newItemTemplate = this.formModel;

  getNewItemTemplateData = () => ({ ...this.newItemTemplate });

  ngOnInit(): void {
    this.getItemsTemplateData();
  }

  getItemsTemplateData() { 
    this.service.getImportTemplateData().subscribe((res) => { 
      this.itemTemplate = res.data; 
    }); 
  }

  onTemplateColumnsValueChanged(e: any) {
    this.formModel.import_entry = e.value.map((columnTitle: string) => ({
      COLUMN_TITLE: columnTitle,
    }));
  }

  onReorder = (e: Parameters<DxDataGridTypes.RowDragging['onReorder']>[0]) => {
    const visibleRows = e.component.getVisibleRows();
    const toIndex = this.TemplateColumnsData.findIndex(
      (item) => item.ID === visibleRows[e.toIndex].data.ID,
    );
    const fromIndex = this.TemplateColumnsData.findIndex(
      (item) => item.ID === e.itemData.ID,
    );

    this.TemplateColumnsData.splice(fromIndex, 1);
    this.TemplateColumnsData.splice(toIndex, 0, e.itemData);

    e.component.refresh();
  };

  // onSelectionChanged(e: any) {
  //   this.formModel.import_entry=e.selectedRowsData;
  // }
  onSelectionChanged(e: any) {
    const selectedKeys = e.selectedRowKeys;
    const newlySelectedKeys = selectedKeys.filter(
      (key) => !this.selectedRows.includes(key),
    );
    const newlyUnselectedKeys = this.selectedRows.filter(
      (key) => !selectedKeys.includes(key),
    );

    // Update selected keys to include newly selected and remove unselected
    this.selectedRows = [
      ...this.selectedRows.filter((key) => !newlyUnselectedKeys.includes(key)),
      ...newlySelectedKeys,
    ];

    // Reorder TemplateColumnsData based on selected keys
    const selectedColumnsSet = new Set(this.selectedRows);
    const remainingColumns = this.TemplateColumnsData.filter(
      (col) => !selectedColumnsSet.has(col.ID),
    );
    this.TemplateColumnsData = [
      ...this.TemplateColumnsData.filter((col) =>
        selectedColumnsSet.has(col.ID),
      ),
      ...remainingColumns,
    ];

    this.formModel.import_entry = this.selectedRows.map((id) => ({
      COLUMN_ID: id,
    }));
  }


  validateTemplateNameExists = (e: any) => {
    if (!e.value) return true;

    const inputName = e.value.toString().trim().toLowerCase();

    const exists = this.itemTemplate?.some(
      (item: any) =>
        item.TEMPLATE_NAME?.toLowerCase().trim() === inputName
    );

    return !exists; // false → show error
  };
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
    DxoRowDraggingModule,
  ],
  declarations: [ImportItemTemplateFormComponent],
  exports: [ImportItemTemplateFormComponent],
})
export class ImportItemTemplateFormModule {}
