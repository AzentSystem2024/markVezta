import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  NgModule,
  NgZone,
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
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-import-ar-data',
  templateUrl: './import-ar-data.component.html',
  styleUrls: ['./import-ar-data.component.scss'],
})
export class ImportArDataComponent {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;

  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef;

  isFilterOpened: boolean = true;
  showFilterRow: boolean = true;
  currentFilter: string = 'auto';
  isPopupVisible: boolean = false;

  uploadedFileName: string = '';
  userID: any = 'Nithin';

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

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    console.log('ImportArDataComponent initialized');
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
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
      alert('Please select one file');
      return;
    }

    const file = target.files[0];

    // Store uploaded file name
    this.uploadedFileName = file.name;

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const binaryString: string = e.target.result;

      const workbook: XLSX.WorkBook = XLSX.read(binaryString, {
        type: 'binary',
        cellDates: false,
      });

      const sheetName: string = workbook.SheetNames[0];

      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

      // Raw Excel Data
      const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        raw: true,
      });

      // Excel Column Names
      const excelColumns: string[] =
        excelData.length > 0 ? Object.keys(excelData[0]) : [];

      // Import Column Captions
      const importCaptions: string[] = this.ImportColumnData.map((x: any) =>
        x.caption?.trim().toLowerCase(),
      );
      const excelColumnNames: string[] = excelColumns.map((x: any) =>
        x.trim().toLowerCase(),
      );

      // Column Count Validation
      if (importCaptions.length !== excelColumnNames.length) {
        alert(
          `Column count mismatch.\nExpected: ${importCaptions.length}\nFound: ${excelColumnNames.length}`,
        );
        return;
      }

      // Column Name Validation
      const invalidColumns: string[] = [];

      importCaptions.forEach((caption: string) => {
        if (!excelColumnNames.includes(caption)) {
          invalidColumns.push(caption);
        }
      });

      // Extra columns check
      const extraColumns = excelColumnNames.filter(
        (col) => !importCaptions.includes(col),
      );

      if (invalidColumns.length > 0 || extraColumns.length > 0) {
        let errorMessage = '';

        if (invalidColumns.length > 0) {
          errorMessage += `Missing Columns:\n${invalidColumns.join(', ')}\n\n`;
        }

        if (extraColumns.length > 0) {
          errorMessage += `Extra Columns:\n${extraColumns.join(', ')}`;
        }

        alert(errorMessage);

        return;
      }

      // Convert Date Columns
      excelData.forEach((row: any) => {
        Object.keys(row).forEach((key) => {
          if (key && key.toLowerCase().includes('date')) {
            const value = row[key];

            // Excel Date Number
            if (typeof value === 'number') {
              const excelDate = XLSX.SSF.parse_date_code(value);

              if (excelDate) {
                const day = String(excelDate.d).padStart(2, '0');

                const month = String(excelDate.m).padStart(2, '0');

                const year = excelDate.y;

                row[key] = `${day}/${month}/${year}`;
              }
            }

            // JS Date Object
            else if (value instanceof Date) {
              const day = String(value.getDate()).padStart(2, '0');

              const month = String(value.getMonth() + 1).padStart(2, '0');

              const year = value.getFullYear();

              row[key] = `${day}/${month}/${year}`;
            }
          }
        });
      });

      // Bind Grid Data
      this.Imported_Ar_DataSource = excelData;

      // Dynamic Columns
      if (excelData.length > 0) {
        this.gridColumns = Object.keys(excelData[0]).map((key) => ({
          dataField: key,
          caption: key,
        }));
      }

      // Open Popup
      this.isPopupVisible = true;

      this.refreshGrid();
    };
    reader.readAsBinaryString(file);

    // Reset File Input
    event.target.value = '';
  }
  // ================= Save import excel fetched data to database API ==========
  saveImportedData() {
    const logData = JSON.parse(localStorage.getItem('logData') || '{}');

    const payload = {
      userId: logData.UserID,
      fileName: this.uploadedFileName,
      data: this.Imported_Ar_DataSource,
    };

    console.log('Save Payload : ', payload);

    console.log('Save Payload : ', payload);

    /*
  this.http.post(
    'YOUR_API_URL',
    payload
  ).subscribe({
    next: (response: any) => {

      // Load API response to logs grid
      this.importLogs = response.data;

      // Close popup
      this.isPopupVisible = false;
    },

    error: (error) => {
      console.log(error);
    }
  });
  */
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
