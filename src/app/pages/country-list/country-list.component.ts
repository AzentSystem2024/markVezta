import { Component, OnInit, NgModule, ViewChild, NgZone } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import {
  CountryFormComponent,
  CountryFormModule,
} from 'src/app/components/library/country-form/country-form.component';
import notify from 'devextreme/ui/notify';
import DataSource from 'devextreme/data/data_source';
import { DxPopupModule } from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { FormTextboxModule } from 'src/app/components';
import { DxFormModule } from 'devextreme-angular';
import { ExportService } from 'src/app/services/export.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.scss'],
})
export class CountryListComponent implements OnInit {
  @ViewChild(CountryFormComponent) countryComponent!: CountryFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  country: any;
  showFilterRow: boolean = false;
  showHeaderFilter = true;
  isAddCountryPopupOpened = false;
  isFilterOpened = false;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  countryDataSource: DataSource;
  countryArray: any[] = [];



  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
  };

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.isAddCountryPopupOpened = true;
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

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private ngZone: NgZone,
    private router: Router
  ) { }

  onExporting(event: any) {
    this.exportService.onExporting(event, 'Country-list');
  }
  addCountry() {
    this.isAddCountryPopupOpened = true;
  }

  onClickSaveCountry() {
    const { CODE, COUNTRY_NAME, COMPANY_ID } =
      this.countryComponent.getNewCountryData();

    // const codeExists = this.country.some(country => country.CODE === CODE);
    // if (codeExists) {
    //     return; // Don't proceed further
    // }

    this.dataservice
      .postCountryData(CODE, COUNTRY_NAME, COMPANY_ID)
      .subscribe((response) => {
        if (response) {
          this.showCountry();
          this.isAddCountryPopupOpened = false;
        }
      });
  }
  onRowRemoving(e: any) {
    const id = e.key.ID;

    //  Stop default delete
    e.cancel = true;

    //  Assign promise to grid
    e.promise = this.dataservice.removeCountry(id).toPromise()
      .then(() => {
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        );

        this.showCountry(); // reload data
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

  onRowUpdating(event: any) {
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };
    let id = combinedData.ID;
    let code = combinedData.CODE;
    let country_name = combinedData.COUNTRY_NAME;

    this.dataservice
      .updateCountry(id, code, country_name)
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: 'Country updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.dataGrid.instance.refresh();
          this.showCountry();
        } else {
          notify(
            {
              message: 'Your Data Not Saved',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      });

    event.cancel = true; // Prevent the default update operation
  }

  showCountry() {
    this.countryDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getCountryData().subscribe({
            next: (response: any) => {
              const data = response || [];

              this.countryArray = data; // store locally (for validation etc.)

              resolve(data);
            },
            error: () => {
              this.countryArray = [];
              resolve([]);
            },
          });
        }),
    });
  }

  ngOnInit(): void {

    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.showCountry();
  }
  refresh = () => {
    this.dataGrid.instance.refresh();
  };
  keyPressCountry(event: any) {
    var charCode = event.which ? event.which : event.keyCode;
    var inputValue = event.target.value;

    // Disallow white space at the start
    if (inputValue.length === 0 && charCode === 32) {
      event.preventDefault();
      return false;
    }
    // Disallow Numbers 0-9 and Special Characters
    if (
      (charCode >= 48 && charCode <= 57) ||
      (charCode >= 33 && charCode <= 47) ||
      (charCode >= 58 && charCode <= 64) ||
      (charCode >= 91 && charCode <= 96) ||
      (charCode >= 123 && charCode <= 126)
    ) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.showCountry();
  }

validateGridCountryCode = (e: any): boolean => {
  const value = (e.value || '').trim();

  if (!value || !this.countryArray?.length) return true;

  const currentId = e.data?.ID;

  return !this.countryArray.some((item: any) => {
    const sameCode = (item.CODE || '').trim() === value;
    const isSameId = Number(item.ID) === Number(currentId);

    return sameCode && !isSameId;
  });
};

validateGridCountryName = (e: any): boolean => {
  const value = (e.value || '').trim().toLowerCase();

  if (!value || !this.countryArray?.length) return true;

  const currentId = e.data?.ID;

  return !this.countryArray.some((item: any) => {
    const sameName =
      (item.COUNTRY_NAME || '').trim().toLowerCase() === value;

    const isSameId = Number(item.ID) === Number(currentId);

    return sameName && !isSameId;
  });
};

onCodeChange = (e: any) => {
  let value = e.value || '';

  if (value && !value.startsWith('+')) {
    value = '+' + value;
  }

  value = value.replace(/[^0-9+]/g, '');

  e.component.option('value', value);
};
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    CountryFormModule,
    DxPopupModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [CountryListComponent],
})
export class CountryListModule { }
