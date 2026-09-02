import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, NgZone, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxPopupModule, DxDropDownBoxModule, DxToolbarModule, DxTabPanelModule, DxTabsModule, DxNumberBoxModule, DxDataGridComponent } from 'devextreme-angular';
import { DxoItemModule, DxoFormItemModule, DxoLookupModule, DxiItemModule, DxiGroupModule, DxoSummaryModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from '../components';
import { CustomDatePopupModule } from '../custom-date-popup/custom-date-popup.component';
import { BarcodePrintComponent } from '../pages/barcode-print/barcode-print.component';
import { DataService } from '../services';
import { Router } from '@angular/router';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import saveAs from 'file-saver';
import DataSource from 'devextreme/data/data_source';
import { EmailSettingFormModule } from '../email-setting-form/email-setting-form.component';

@Component({
  selector: 'app-email-setting',
  templateUrl: './email-setting.component.html',
  styleUrls: ['./email-setting.component.scss']
})
export class EmailSettingComponent {
    @ViewChild(DxDataGridComponent, { static: true })
    dataGrid: any = DxDataGridComponent;
   readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  isAddInvoice: boolean = false;
  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'All', value: 'all' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
  ];
  selectedDateRange: string = 'today';
  customStartDate: any = null;
  customEndDate: any = null;
  showCustomDatePopup = false;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canVerify: boolean = false;
  canPrint = false;
  companyID: any;
  filteredStoreList: { ID: any; DESCRIPTION: any }[];
  storeList: { ID: any; DESCRIPTION: any }[];
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addEmailSetting());
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

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },
    text: '',
  };
  selectedStoreId: any;
  vatTitle: any;
  isHQApp: any;
  filteredSettingsList: any;
  settingsArray: any;
  emailDataSource: any;
  isSettings: boolean;
  isAddSettings: boolean;
  isEditSettings: boolean = false;
  selectedEmailSetting: any;
  emailTypeList: any[] = [];

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    console.log('******************');
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(userDataString || '{}');
    this.vatTitle = userData?.GeneralSettings?.VAT_TITLE;
    this.companyID = menuResponse?.SELECTED_COMPANY?.COMPANY_ID;
    this.isHQApp = userData?.GeneralSettings?.IS_HQ_APP;
    const configStore = userData?.Configuration?.[0];
    const menuGroups = menuResponse?.MenuGroups || [];
    console.log(menuGroups, 'MENUGROUPSSSSSSSSSSS');
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);
    console.log(packingRights, 'PACKINGRIGHTSSSSSSSS');
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
    }
   
    this.selectedStoreId = userData?.Configuration?.[0]?.STORE_ID ?? 0;
    this.getEmailTypeDropdown();
    this.getEmailSettingsList();
  }

  getEmailTypeDropdown() {
    const payload = {
      NAME: 'Trans_Types',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.emailTypeList = response || [];
    });
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
    }
    this.getEmailSettingsList();
  }

  addEmailSetting(){
    this.isAddSettings = true;
    this.cdr.detectChanges();
  }

  onEditEmailSetting(event: any) {
    event.cancel = true;

    const emailTypeId = event.data.EMAIL_TYPE;

    this.dataService
      .selectEmailSettings(emailTypeId)
      .subscribe((response: any) => {
        this.selectedEmailSetting = response.Data;
        this.isEditSettings = true;
        this.cdr.detectChanges();
      });
  }
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  onExporting(e: any) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Invoice');

    exportDataGrid({
      component: e.component,
      worksheet: worksheet,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer: any) => {
        saveAs(
          new Blob([buffer], {
            type: 'application/octet-stream',
          }),
          'Invoice.xlsx',
        );
      });
    });

    e.cancel = true;
  }

  getEmailSettingsList() {
    this.emailDataSource = new DataSource({
      load: () => {
        return this.dataService
          .getEmailSettings()
          .toPromise()
          .then((response: any) => {
            console.log('Email settings list response:', response);
            const list = response?.DataList || response?.Data || response?.data || (Array.isArray(response) ? response : []);
            this.settingsArray = list;
            return list;
          })
          .catch((err) => {
            console.error('Error loading email settings:', err);
            this.settingsArray = [];
            return [];
          });
      },
    });
  }
      private getDateRangePayload(range: string) {
    const today = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    switch (range) {
      case 'today':
        fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last7':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 6);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last15':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 14);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last30':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 29);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          fromDate = new Date(this.customStartDate);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(this.customEndDate);
          toDate.setHours(23, 59, 59, 999);
        }
        break;

      case 'all':
        return { DATE_FROM: null, DATE_TO: null };
    }

    return {
      DATE_FROM: fromDate ? this.formatAsYYYYMMDD(fromDate) : null,
      DATE_TO: toDate ? this.formatAsYYYYMMDD(toDate) : null,
    };
  }
    private formatAsYYYYMMDD(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

    onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    // reset custom label when switching away
    this.customStartDate = null;
    this.customEndDate = null;

    this.dateRanges = this.dateRanges.map((opt) =>
      opt.value === 'custom' ? { ...opt, label: 'Custom' } : opt,
    );

    this.getEmailSettingsList();
  }

    applyDateFilter() {
    if (!this.selectedDateRange || !this.settingsArray) {
      this.filteredSettingsList = this.settingsArray;
      return;
    }
    if (this.selectedDateRange === 'all') {
      this.filteredSettingsList = this.settingsArray; // show full list
      return;
    }

    const today = new Date();
    let startDate: Date;
    const endDate = new Date(); // today

    switch (this.selectedDateRange) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last7':
        startDate = new Date();
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last15':
        startDate = new Date();
        startDate.setDate(today.getDate() - 14);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last30':
        startDate = new Date();
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        this.filteredSettingsList = this.settingsArray;
        return;
    }

    this.filteredSettingsList = this.settingsArray.filter((item: any) => {
      const invoiceDate = item.TRANS_DATE;
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
  }
    applyCustomDateFilter() {
    if (!this.customStartDate || !this.customEndDate) return;

    if (this.customStartDate > this.customEndDate) {
      alert('From date cannot be greater than To date');
      return;
    }

    const fromLabel = this.formatAsDDMMYYYY(new Date(this.customStartDate));
    const toLabel = this.formatAsDDMMYYYY(new Date(this.customEndDate));

    //  THIS IS THE MAGIC (same as Credit Note)
    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.getEmailSettingsList();
  }
    private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

    private parseDateString(dateStr: string): Date {
    const [day, month, year] = dateStr
      .split('-')
      .map((part) => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }

    displayExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const from = this.formatAsDDMMYYYY(new Date(this.customStartDate));
      const to = this.formatAsDDMMYYYY(new Date(this.customEndDate));
      return `${from} to ${to}`;
    }

    return item.label;
  };

    openCustomDatePopup() {
    this.customStartDate = null;
    this.customEndDate = null;
    this.showCustomDatePopup = true;
  }

    get customStartDateFormatted(): string {
    return this.customStartDate
      ? this.formatAsDDMMYYYY(new Date(this.customStartDate))
      : '';
  }

    get customEndDateFormatted(): string {
    return this.customEndDate
      ? this.formatAsDDMMYYYY(new Date(this.customEndDate))
      : '';
  }

    attachItemClickHandler(e: any) {
    setTimeout(() => {
      const popup = e.component._popup;
      const innerList =
        popup && popup.$content().find('.dx-list').dxList('instance');
      if (innerList) {
        innerList.off('itemClick'); // unsubscribe first (to avoid duplicates)
        innerList.on('itemClick', (clickEvent: any) => {
          const clickedValue = clickEvent.itemData.value;
          if (clickedValue === 'custom') {
            this.openCustomDatePopup();
            e.component.close();
          }
        });
      }
    }, 0);
  }

    onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
  }

  handleClose(){
    this.isAddSettings = false;
    this.isEditSettings = false;
    this.getEmailSettingsList();
    this.cdr.detectChanges();
  }
}
@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
    CustomDatePopupModule,
    EmailSettingFormModule
  ],
  providers: [],
  declarations: [EmailSettingComponent],
  exports: [EmailSettingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmailSettingModule {}