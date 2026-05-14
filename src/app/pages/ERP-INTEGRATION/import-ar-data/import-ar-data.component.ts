import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxPopupModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { DepartmentFormModule } from 'src/app/components/library/department-form/department-form.component';
import { DataService } from 'src/app/services/data.service';
import * as XLSX from 'xlsx';
import notify from 'devextreme/ui/notify';
import { alert } from 'devextreme/ui/dialog';
@Component({
  selector: 'app-import-ar-data',
  templateUrl: './import-ar-data.component.html',
  styleUrls: ['./import-ar-data.component.scss'],
})
export class ImportArDataComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;

  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef;

  isFilterOpened: boolean = true;
  showFilterRow: boolean = true;
  currentFilter: string = 'auto';
  isPopupVisible: boolean = false;

  uploadedFileName: string = '';

  importLogs: any[] = [];
  Imported_Ar_DataSource: any[] = [];
  gridColumns: any[] = [];

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },

    onClick: () => this.toggleFilters(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },

    text: '',
  };

  importButtonOptions = {
    text: 'Import',
    icon: 'upload',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Import AR Data',

    onClick: () => {
      this.fileInput.nativeElement.click();
    },

    elementAttr: { class: 'add-button' },
  };

  ImportColumnData: any;
  importDetailViewData: any;
  detailViewColumns: any[] = [];
  isDetailsPopupVisible: boolean = false;

  constructor(
    private ngZone: NgZone,
    private srvce: DataService,
  ) {}

  ngOnInit(): void {
    this.fetchImportColumns();
    this.fetch_import_logs();
  }

  // === fetch import columns list =====
  fetchImportColumns() {
    this.srvce.import_AR_Columns().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.ImportColumnData = response.data;
        } else {
          console.error('Invalid response format:', response);
        }
      },
      error: (error) => {},
    });
  }

  // === fetch import logs list =====
  fetch_import_logs() {
    this.srvce.import_AR_LookUp_List().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.importLogs = response.data;
        } else {
          console.error('Invalid response format:', response);
        }
      },
      error: (error) => {},
    });
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      this.isPopupVisible = false;
      this.fetch_import_logs();
    }
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  OnFileChanged(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;

    if (target.files.length !== 1) {
      notify('Please select one file', 'warning', 3000);
      return;
    }

    const file = target.files[0];
    // Store uploaded file name
    this.uploadedFileName = file.name;
    const reader: FileReader = new FileReader();

    reader.onload = async (e: any) => {
      try {
        const binaryString: string = e.target.result;
        const workbook: XLSX.WorkBook = XLSX.read(binaryString, {
          type: 'binary',
          cellDates: false,
        });

        const sheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
        // Raw Excel Data
        const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: null,
          raw: true,
        });

        // Empty File Validation
        if (excelData.length === 0) {
          notify('Excel file is empty', 'warning', 3000);
          return;
        }

        // Excel Column Names
        const excelColumns: string[] = Object.keys(excelData[0]);

        // Import Column Titles
        const importCaptions: string[] = this.ImportColumnData.map((x: any) =>
          x.ColumnTitle?.trim().toLowerCase(),
        );

        const excelColumnNames: string[] = excelColumns.map((x: any) =>
          x.trim().toLowerCase(),
        );

        // ================= Column Count Validation =================
        if (importCaptions.length !== excelColumnNames.length) {
          await alert(
            `Column count mismatch.<br><br>
          Expected : ${importCaptions.length} Columns<br>
          Found : ${excelColumnNames.length} Columns`,
            'Validation',
          );

          return;
        }

        // ================= Missing Columns =================
        const invalidColumns: string[] = importCaptions.filter(
          (caption: string) => !excelColumnNames.includes(caption),
        );

        // ================= Extra Columns =================
        const extraColumns: string[] = excelColumnNames.filter(
          (col: string) => !importCaptions.includes(col),
        );

        // ================= Validation Error =================
        if (invalidColumns.length > 0 || extraColumns.length > 0) {
          let errorMessage = '';

          if (invalidColumns.length > 0) {
            errorMessage +=
              `<b>Missing Columns :</b><br>` +
              invalidColumns.join(', ') +
              '<br><br>';
          }

          if (extraColumns.length > 0) {
            errorMessage +=
              `<b>Extra Columns :</b><br>` + extraColumns.join(', ');
          }
          await alert(errorMessage, 'Column Validation');
          return;
        }

        // ================= Create Column Type Map =================
        const columnTypeMap: any = {};

        this.ImportColumnData.forEach((col: any) => {
          columnTypeMap[col.ColumnTitle.trim().toLowerCase()] =
            col.ColumnType.toLowerCase();
        });

        // ================= Convert Values Based On Column Type =================
        excelData.forEach((row: any, rowIndex: number) => {
          Object.keys(row).forEach((key: string) => {
            const originalKey = key;
            const lowerKey = key.trim().toLowerCase();

            const columnType = columnTypeMap[lowerKey];

            let value = row[originalKey];

            // ================= Empty Value Handling =================
            if (
              value === '' ||
              value === undefined ||
              value === null ||
              value === ' '
            ) {
              row[originalKey] = null;
              return;
            }

            // ================= STRING =================
            if (columnType === 'string') {
              row[originalKey] = String(value).trim();
            }

            // ================= INT =================
            else if (columnType === 'int') {
              const intValue = parseInt(value, 10);

              row[originalKey] = isNaN(intValue) ? null : intValue;
            }

            // ================= DECIMAL =================
            else if (columnType === 'decimal') {
              const decimalValue = parseFloat(value);

              row[originalKey] = isNaN(decimalValue)
                ? null
                : Number(decimalValue);
            }

            // ================= BOOLEAN =================
            else if (columnType === 'boolean') {
              if (
                value === true ||
                value === 'true' ||
                value === 'TRUE' ||
                value === 1 ||
                value === '1' ||
                value === 'yes' ||
                value === 'YES'
              ) {
                row[originalKey] = 1;
              } else if (
                value === false ||
                value === 'false' ||
                value === 'FALSE' ||
                value === 0 ||
                value === '0' ||
                value === 'no' ||
                value === 'NO'
              ) {
                row[originalKey] = 0;
              } else {
                row[originalKey] = null;
              }
            }

            // ================= DATETIME =================
            else if (columnType === 'datetime') {
              // Excel Date Number
              if (typeof value === 'number') {
                const excelDate = XLSX.SSF.parse_date_code(value);

                if (excelDate) {
                  const day = String(excelDate.d).padStart(2, '0');
                  const month = String(excelDate.m).padStart(2, '0');
                  const year = excelDate.y;

                  row[originalKey] = `${year}-${month}-${day}`;
                } else {
                  row[originalKey] = null;
                }
              }

              // JS Date Object
              else if (value instanceof Date) {
                const day = String(value.getDate()).padStart(2, '0');
                const month = String(value.getMonth() + 1).padStart(2, '0');
                const year = value.getFullYear();

                row[originalKey] = `${year}-${month}-${day}`;
              }

              // String Date
              else {
                const date = new Date(value);

                if (!isNaN(date.getTime())) {
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const year = date.getFullYear();

                  row[originalKey] = `${year}-${month}-${day}`;
                } else {
                  row[originalKey] = null;
                }
              }
            }
          });
        });

        // ================= Bind Grid Data =================
        this.Imported_Ar_DataSource = excelData;

        // ================= Dynamic Columns =================
        if (excelData.length > 0) {
          this.gridColumns = Object.keys(excelData[0]).map((key) => ({
            dataField: key,
            caption: key,
            width: '150',
          }));
        }

        // ================= Open Popup =================
        this.isPopupVisible = true;

        notify('Excel loaded successfully', 'success', 3000);
      } catch (error) {
        notify('Error while reading excel file', 'error', 4000);
      }
    };

    reader.readAsBinaryString(file);

    // Reset File Input
    event.target.value = '';
  }

  // ================= Save import excel fetched data to database API ==========
  saveImportedData() {
    if (
      !this.Imported_Ar_DataSource ||
      this.Imported_Ar_DataSource.length === 0
    ) {
      notify('No data available to save', 'warning', 3000);
      return;
    }

    // ================= Convert Verified Field =================
    this.Imported_Ar_DataSource.forEach((row: any) => {
      if (row.Verified === 1 || row.Verified === '1') {
        row.Verified = true;
      } else if (row.Verified === 0 || row.Verified === '0') {
        row.Verified = false;
      } else if (
        row.Verified === null ||
        row.Verified === undefined ||
        row.Verified === ''
      ) {
        row.Verified = null;
      }
    });
    const chunkSize = 100;

    // Same Batch Number for all chunks
    const batchNo = 'BATCH_' + new Date().getTime();
    // Create Chunks
    const chunks: any[] = [];
    for (let i = 0; i < this.Imported_Ar_DataSource.length; i += chunkSize) {
      chunks.push(this.Imported_Ar_DataSource.slice(i, i + chunkSize));
    }
    // Start Upload
    this.uploadChunkData(chunks, batchNo, this.uploadedFileName, 0);
  }

  // ================= Upload Chunks Sequentially =================
  uploadChunkData(
    chunks: any[],
    batchNo: string,
    fileName: string,
    index: number,
  ) {
    // All chunks completed
    if (index >= chunks.length) {
      notify('Data imported successfully', 'success', 3000);
      // Close popup
      this.isPopupVisible = false;
      return;
    }
    const currentChunk = chunks[index];
    this.srvce.import_AR_Data(batchNo, fileName, currentChunk).subscribe({
      next: (response: any) => {
        // API Success
        if (response?.flag === '1') {
          // Upload next chunk
          this.uploadChunkData(chunks, batchNo, fileName, index + 1);
        }
        // Stop Complete Process If Any Chunk Failed
        else {
          notify(response?.message || 'Data import failed', 'error', 4000);
          return;
        }
      },
      error: (error: any) => {
        notify('Error while importing data', 'error', 4000);
        return;
      },
    });
  }

  showImportDetails(rowData: any) {
    const logId = rowData.ID;

    this.srvce.import_AR_Details_View(logId).subscribe({
      next: (response: any) => {
        // API Success
        if (response?.flag === 1) {
          if (response?.data) {
            // ================= Convert Verified Field To String =================
            this.importDetailViewData = (response.data || []).map(
              (item: any) => ({
                ...item,
                Verified:
                  item.Verified === true
                    ? 1
                    : item.Verified === false
                      ? ''
                      : item.Verified === null || item.Verified === undefined
                        ? null
                        : String(item.Verified),
              }),
            );

            // ================= Dynamic Columns =================
            if (this.importDetailViewData.length > 0) {
              this.detailViewColumns = Object.keys(
                this.importDetailViewData[0],
              );
            }

            // ================= Open Popup =================
            this.isDetailsPopupVisible = true;
            // notify('Detail data loaded successfully', 'success', 2000);
          } else {
            notify('No detail data available', 'warning', 3000);
          }
        }

        // API Failed
        else {
          notify(
            response?.message || 'Failed to load detail data',
            'error',
            4000,
          );
        }
      },

      error: (error: any) => {
        notify('Error while loading detail data', 'error', 4000);
      },
    });
  }
}
@NgModule({
  imports: [
    BrowserModule,
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DepartmentFormModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxValidatorModule,
  ],
  providers: [],
  declarations: [ImportArDataComponent],
  exports: [ImportArDataComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ImportArDataModule {}
