import {
  ChangeDetectorRef,
  Component,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  DxButtonModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxPopupModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import {
  ImportItemTemplateFormComponent,
  ImportItemTemplateFormModule,
} from 'src/app/components/library/import-item-template-form/import-item-template-form.component';
import {
  ImportItemTemplateEditFormModule,
  ImportItemTemplateEditFormComponent,
} from 'src/app/components/library/import-item-template-edit-form/import-item-template-edit-form.component';
import { DxoRowDraggingModule } from 'devextreme-angular/ui/nested';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { Column } from 'jspdf-autotable';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';
import notify from 'devextreme/ui/notify';
import DataSource from 'devextreme/data/data_source';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-import-items-template',
  templateUrl: './import-items-template.component.html',
  styleUrls: ['./import-items-template.component.scss'],
})
export class ImportItemsTemplateComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild(ImportItemTemplateFormComponent)
  itemComponent: ImportItemTemplateFormComponent;


  itemTemplate: any;
  itemTemplateArray: any[] = [];
  isPopupOpened: boolean = false;
  isEditPopupOpened: boolean = false;
  TemplateColumnsData: any;
  seletedData: any;
  selectedTemplateColumnKeys: any[] = [];
  selectedRowData: any;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;


  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new template',
    onClick: () => {
      this.openForm();
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


  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.toggleFilters();
    },
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },
  };



  constructor(
    private service: DataService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router
  ) { }

  onEditingRow(event): void {
    event.cancel = true;
    const itemId = event.data.ID;
    this.isEditPopupOpened = true;
    this.service.selectImportTemplateData(itemId).subscribe((res) => {
      this.selectedRowData = res.data[0];
      this.cdr.detectChanges(); // Ensure Angular picks up the change
    });
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

  getItemsTemplateData() {
    this.itemTemplate = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.service.getImportTemplateData().subscribe({
            next: (res: any) => {
              const data = res?.data || [];

              this.itemTemplateArray = data; // ✅ store locally (for validation / reuse)

              resolve(data);
            },
            error: () => {
              this.itemTemplateArray = [];
              resolve([]);
            },
          });
        }),
    });
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

  ngOnInit(): void {

    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .flatMap((menu: any) => menu.Children || [])
      .find((child: any) => child.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.getItemsTemplateData();
  }

  openForm() {
    this.isPopupOpened = true;
  }
  onClickSave() {
    const data = this.itemComponent.getNewItemTemplateData();
    this.service.postImportTemplate(data).subscribe({
      next: (response: any) => {
        if (response?.flag === '1') {
          notify(
            {
              message: 'Template saved successfully',
              position: { at: 'top right', my: 'top right' }
            },
            'success'
          );

          this.getItemsTemplateData(); // reload grid
          this.isPopupOpened = false;  // close popup
        } else {
          notify(
            {
              message: response?.message || 'Save failed',
              position: { at: 'top right', my: 'top right' }
            },
            'error'
          );
        }
      },
      error: () => {
        notify(
          {
            message: 'Error occurred while saving',
            position: { at: 'top right', my: 'top right' }
          },
          'error'
        );
      }
    });
  }
  onRowRemoving(e: any) {
    const id = e.key.ID;

    //  VERY IMPORTANT
    e.cancel = true;

    //  Tell grid to wait for this
    e.promise = lastValueFrom(this.service.removeImportTemplateData(id))
      .then(() => {
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        );

        this.getItemsTemplateData(); // reload
      })
      .catch(() => {
        notify(
          {
            message: 'Delete operation failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      });
  }

  onRowUpdating(data: any) { }
  onExportClick() {
    const selectedColumns = this.TemplateColumnsData.filter((col) =>
      this.selectedTemplateColumnKeys.includes(col.COLUMN_TITLE),
    );
    const columns = selectedColumns.map((col) => col.COLUMN_TITLE);

    // Create a new worksheet and add the column titles
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([columns]);

    // Function to calculate the maximum width of a column
    const getMaxWidth = (data: string[]) => {
      const maxLength = Math.max(...data.map((item) => item.length));
      return { wch: maxLength + 2 }; // Add some padding
    };

    // Calculate the maximum width for each column and apply it
    const colWidths = columns.map((column, index) => {
      // Collect all the data for the column
      const columnData = [
        column,
        ...this.TemplateColumnsData.map((item) => item.COLUMN_TITLE),
      ];
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

  CloseEditForm() {
    this.isEditPopupOpened = false;
    this.dataGrid.instance.refresh();
    this.getItemsTemplateData();
  }

  toggleFilters() {
    const grid = this.dataGrid?.instance;
    if (!grid) return;

    const current = grid.option('filterRow.visible');
    grid.option('filterRow.visible', !current);
    grid.option('headerFilter.visible', !current);
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
  }

}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    DxTextBoxModule,
    FormPopupModule,
    ImportItemTemplateFormModule,
    DxoRowDraggingModule,
    DxPopupModule,
    ImportItemTemplateEditFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [ImportItemsTemplateComponent],
})
export class ImportItemsTemplateModule { }
