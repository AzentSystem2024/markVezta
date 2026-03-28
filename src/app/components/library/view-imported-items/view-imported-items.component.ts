import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  NgModule,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DxFormModule,
  DxSelectBoxModule,
  DxTagBoxModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { FormTextboxModule } from '../..';
import { DataService } from 'src/app/services';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-view-imported-items',
  templateUrl: './view-imported-items.component.html',
  styleUrls: ['./view-imported-items.component.scss'],
})
export class ViewImportedItemsComponent implements OnChanges {
  @Input() formdata: any;
  @ViewChild('dataGrid', { static: false })
  dataGrid!: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  datasource!: DataSource;
  batchNo: string = '';
  storesImported: string = '';
  date: string = '';
  user: string = '';
  private lastLoadedId: number | null = null;
  
  constructor(private service: DataService) {}

  ngOnChanges(changes: SimpleChanges): void { 
    if (!changes['formdata']) return;

    const currentId = changes['formdata'].currentValue;
    if (!currentId) return;

    // STOP duplicate API calls
    if (this.lastLoadedId === currentId) return;

    this.lastLoadedId = currentId;
    this.loadImportData(currentId);
  }

  private loadImportData(id: number): void {
    this.datasource = new DataSource({
      load: () =>
        new Promise((resolve, reject) => {
          const requestData = { ID: id };

          this.service.viewImportedData(requestData).subscribe({
            next: (data) => {
              resolve(data || []);
            },
            error: (err) => {
              reject(err);
            },
          });
        }),
    });

    // 🔹 Load header data separately (no grid loader needed)
    this.service.getImportLogData().subscribe({
      next: (data) => {
        const log = data?.find((l) => l.ID === id);
        if (!log) return;

        this.batchNo = log.BATCH_NO;
        this.storesImported = log.STORE_NAME;

        this.date = new Date(log.IMPORT_DATE)
          .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })
          .toUpperCase();

        this.user = log.USER_NAME;
      },
    });
  }
}

@NgModule({
  imports: [
    DxTextBoxModule,
    DxFormModule,
    FormTextboxModule,
    CommonModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxTagBoxModule,
    DxButtonModule,
    DxDataGridModule,
  ],
  declarations: [ViewImportedItemsComponent],
  exports: [ViewImportedItemsComponent],
})
export class ViewImportedItemsModule {}
