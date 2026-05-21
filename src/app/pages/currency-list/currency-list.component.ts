import { Component, OnInit, NgModule, ViewChild, NgZone } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import notify from 'devextreme/ui/notify';
import {
  CurrencyFormComponent,
  CurrencyFormModule,
} from 'src/app/components/library/currency-form/currency-form.component';
import { ExportService } from 'src/app/services/export.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.component.html',
  styleUrls: ['./currency-list.component.scss'],
})
export class CurrencyListComponent implements OnInit {
  @ViewChild(CurrencyFormComponent) currencyComponent!: CurrencyFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  showFilterRow = false;
  currency: any;
  showHeaderFilter = true;
  isAddCurrencyPopupOpened = false;
  companyId: any;
  currentEditId: number | null = null;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.showFilterRow = !this.showFilterRow;
      this.showHeaderFilter = !this.showHeaderFilter;
    },
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.ngZone.run(() => this.refresh());
    },
  };


  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',

    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addCurrency());
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

  onEditingStart(e: any) {
    this.currentEditId = e.data.ID;
  }



  addCurrency() {
    this.isAddCurrencyPopupOpened = true;
  }

  onClickSaveCurrency() {
    // const exchangeValue = this.currencyComponent.newCurrency.EXCHANGE;
    // this.currencyComponent.validateExchange(exchangeValue);

    // // Mark all controls as touched to show validation errors
    // this.currencyComponent.stateForm.markAllAsTouched();

    // // If the form is invalid or there are errors, keep the popup open
    // if (
    //   this.currencyComponent.stateForm.invalid ||
    //   this.currencyComponent.exchangeError
    // ) {
    //   return;
    // } else {
    const data = this.currencyComponent.getNewCurrencyData();

    const payload = {
      ...data,
      EXCHANGE: data.EXCHANGE != null ? data.EXCHANGE.toString() : null
    };

    this.dataservice
      .postCurrencyData(
        payload.CODE,
        payload.SYMBOL,
        payload.DESCRIPTION,
        payload.FRACTION_UNIT,
        payload.EXCHANGE,
        this.companyId,
      )
      .subscribe(
        (response) => {
          if (response) {
            this.showCurrency();
            this.isAddCurrencyPopupOpened = false; // Close the popup on successful submission
          } else {
            notify('Failed to save currency data', 'error', 3000);
          }
        },
        (error) => {
          notify(
            'An error occurred while saving currency data',
            'error',
            3000,
          );
        },
      );
    // }
  }

  onRowRemoving(event: any) {
    const selectedRow = event.data;
    const {
      ID,
      CODE,
      SYMBOL,
      DESCRIPTION,
      FRACTION_UNIT,
      EXCHANGE,
      COMPANY_ID,
    } = selectedRow;

    this.dataservice
      .removeCurrency(
        ID,
        CODE,
        SYMBOL,
        DESCRIPTION,
        FRACTION_UNIT,
        EXCHANGE,
        COMPANY_ID,
      )
      .subscribe(() => {
        try {
          notify(
            {
              message: 'Delete operation successful',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.dataGrid.instance.refresh();
          this.showCurrency();
        } catch (error) {
          notify(
            {
              message: 'Delete operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      });
  }

  onRowUpdating(event: any) {
    const grid = this.dataGrid.instance;
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };
    let id = combinedData.ID;
    let code = combinedData.CODE;
    let symbol = combinedData.SYMBOL;
    let description = combinedData.DESCRIPTION;
    let fraction_unit = combinedData.FRACTION_UNIT;
    let exchange = combinedData.EXCHANGE;
    let company_id = combinedData.COMPANY_ID;

    this.dataservice
      .updateCurrency(
        id,
        code,
        symbol,
        description,
        fraction_unit,
        exchange,
        company_id,
      )
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: 'Currency updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          grid.cancelEditData();
          this.dataGrid.instance.refresh();
          this.showCurrency();
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

  validateFractionUnit(params: any): boolean {
    const value = params.value;

    // Regular expression to check if value consists only of digits
    const regex = /^[0-9]+$/;

    // Perform the validation
    if (!regex.test(value)) {
      params.rule.message = 'Only digits are allowed';
      return false;
    }

    return true;
  }

  showCurrency() {
    this.dataservice.getCurrencyData().subscribe((response) => {
      this.currency = response;
    });
  }
  onExporting(event: any) {
    this.exportService.onExporting(event, 'Currency-list');
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


    this.showCurrency();

    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.companyId = userData?.SELECTED_COMPANY?.COMPANY_ID;
    }
  }

  refresh = () => {
    this.dataGrid.instance.refresh();
  };

  validateCodeExistsGrid = (e: any) => {
    if (!e.value) return true;

    const inputCode = e.value.toString().trim().toUpperCase();

    const exists = this.currency?.some(
      (item: any) =>
        item.CODE?.toUpperCase() === inputCode &&
        item.ID !== this.currentEditId // ✅ skip current row
    );

    return !exists;
  };

  validateSymbolExistsGrid = (e: any) => {
    if (!e.value) return true;

    const inputCode = e.value.toString().trim().toUpperCase();

    const exists = this.currency?.some(
      (item: any) =>
        item.SYMBOL?.toUpperCase() === inputCode &&
        item.ID !== this.currentEditId // ✅ skip current row
    );

    return !exists;
  };
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    CurrencyFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [CurrencyListComponent],
})
export class CurrencyListModule { }
