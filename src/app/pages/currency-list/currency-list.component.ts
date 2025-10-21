// import { Component, OnInit, NgModule, ViewChild } from '@angular/core';
// import { DxButtonModule } from 'devextreme-angular';
// import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
// import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
// import { DataService } from 'src/app/services';
// import { FormPopupModule } from 'src/app/components';
// import notify from 'devextreme/ui/notify';
// import {
//   CurrencyFormComponent,
//   CurrencyFormModule,
// } from 'src/app/components/library/currency-form/currency-form.component';

// @Component({
//   selector: 'app-currency-list',
//   templateUrl: './currency-list.component.html',
//   styleUrls: ['./currency-list.component.scss'],
// })
// export class CurrencyListComponent implements OnInit {
//   @ViewChild(CurrencyFormComponent) currencyComponent: CurrencyFormComponent;
//   @ViewChild(DxDataGridComponent, { static: true })
//   dataGrid: DxDataGridComponent;

//   currency: any;
//   isAddCurrencyPopupOpened = false;
//   constructor(private dataservice: DataService) {}
//   addCurrency() {
//     this.isAddCurrencyPopupOpened = true;
//   }
//   onClickSaveCurrency() {
//     this.currencyComponent.validateExchange(this.currencyComponent.newCurrency.EXCHANGE);
//     if (this.currencyComponent.stateForm.invalid || this.currencyComponent.exchangeError) {
//       // If the form is invalid or there are errors, do not proceed
//       console.log('Form has validation errors');
//       this.currencyComponent.stateForm.markAllAsTouched();
//       this.isAddCurrencyPopupOpened = false;
//       return;
//     }else {
//       const { CODE, SYMBOL, DESCRIPTION, FRACTION_UNIT, EXCHANGE, COMPANY_ID } =
//       this.currencyComponent.getNewCurrencyData();
//     console.log(
//       'inserted data',
//       CODE,
//       SYMBOL,
//       DESCRIPTION,
//       FRACTION_UNIT,
//       EXCHANGE,
//       COMPANY_ID
//     );
//     this.dataservice
//       .postCurrencyData(
//         CODE,
//         SYMBOL,
//         DESCRIPTION,
//         FRACTION_UNIT,
//         EXCHANGE,
//         COMPANY_ID
//       )
//       .subscribe((response) => {
//         if (response) {
//           this.showCurrency();
//         }
//       });
//     }

//   }
//   onRowRemoving(event) {
//     const selectedRow = event.data;
//     const {
//       ID,
//       CODE,
//       SYMBOL,
//       DESCRIPTION,
//       FRACTION_UNIT,
//       EXCHANGE,
//       COMPANY_ID,
//     } = selectedRow;

//     this.dataservice
//       .removeCurrency(
//         ID,
//         CODE,
//         SYMBOL,
//         DESCRIPTION,
//         FRACTION_UNIT,
//         EXCHANGE,
//         COMPANY_ID
//       )
//       .subscribe(() => {
//         try {
//           // Your delete logic here
//           notify(
//             {
//               message: 'Delete operation successful',
//               position: { at: 'top right', my: 'top right' },
//             },
//             'success'
//           );
//           this.dataGrid.instance.refresh();
//           this.showCurrency();
//         } catch (error) {
//           notify(
//             {
//               message: 'Delete operation failed',
//               position: { at: 'top right', my: 'top right' },
//             },
//             'error'
//           );
//         }
//       });
//   }
//   onRowUpdating(event) {
//     const updataDate = event.newData;
//     const oldData = event.oldData;
//     const combinedData = { ...oldData, ...updataDate };
//     let id = combinedData.ID;
//     let code = combinedData.CODE;
//     let symbol = combinedData.SYMBOL;
//     let description = combinedData.DESCRIPTION;
//     let fraction_unit = combinedData.FRACTION_UNIT;
//     let exchange = combinedData.EXCHANGE;
//     let company_id = combinedData.COMPANY_ID;

//     this.dataservice
//       .updateCurrency(
//         id,
//         code,
//         symbol,
//         description,
//         fraction_unit,
//         exchange,
//         company_id
//       )
//       .subscribe((data: any) => {
//         if (data) {
//           notify(
//             {
//               message: 'Currency updated Successfully',
//               position: { at: 'top center', my: 'top center' },
//             },
//             'success'
//           );
//           this.dataGrid.instance.refresh();
//           this.showCurrency();
//         } else {
//           notify(
//             {
//               message: 'Your Data Not Saved',
//               position: { at: 'top right', my: 'top right' },
//             },
//             'error'
//           );
//         }
//       });
//     console.log('old data:', oldData);
//     console.log('new data:', updataDate);
//     console.log('modified data:', combinedData);

//     event.cancel = true; // Prevent the default update operation
//   }

//   validateFractionUnit(params): boolean {
//     const value = params.value;

//     // Regular expression to check if value consists only of digits
//     const regex = /^[0-9]+$/;

//     // Perform the validation
//     if (!regex.test(value)) {
//       params.rule.message = 'Only digits are allowed';
//       return false;
//     }

//     return true;
//   }

//   showCurrency() {
//     this.dataservice.getCurrencyData().subscribe((response) => {
//       this.currency = response;
//       console.log(response);
//     });
//   }
//   ngOnInit(): void {
//     this.showCurrency();
//   }
//   refresh = () => {
//     this.dataGrid.instance.refresh();
//   };
// }
// @NgModule({
//   imports: [
//     DxDataGridModule,
//     DxButtonModule,
//     FormPopupModule,
//     CurrencyFormModule,
//   ],
//   providers: [],
//   exports: [],
//   declarations: [CurrencyListComponent],
// })
// export class CurrencyListModule {}



import { Component, OnInit, NgModule, ViewChild } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import notify from 'devextreme/ui/notify';
import { CurrencyFormComponent,CurrencyFormModule } from 'src/app/components/library/currency-form/currency-form.component';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.component.html',
  styleUrls: ['./currency-list.component.scss'],
})
export class CurrencyListComponent implements OnInit {
  @ViewChild(CurrencyFormComponent) currencyComponent: CurrencyFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  showFilterRow=true;
  currency: any;
  showHeaderFilter=true;
  isAddCurrencyPopupOpened = false;

  constructor(private dataservice: DataService,
    private exportService: ExportService
  ) {}

  addCurrency() {
    this.isAddCurrencyPopupOpened = true;
  }

  onClickSaveCurrency() {
    const exchangeValue = this.currencyComponent.newCurrency.EXCHANGE;
    this.currencyComponent.validateExchange(exchangeValue);

    // Mark all controls as touched to show validation errors
    this.currencyComponent.stateForm.markAllAsTouched();

    // If the form is invalid or there are errors, keep the popup open
    if (this.currencyComponent.stateForm.invalid || this.currencyComponent.exchangeError) {
      console.log('Form has validation errors');
      return;
    } else {
      const { CODE, SYMBOL, DESCRIPTION, FRACTION_UNIT, EXCHANGE, COMPANY_ID } =
        this.currencyComponent.getNewCurrencyData();
      console.log(
        'inserted data',
        CODE,
        SYMBOL,
        DESCRIPTION,
        FRACTION_UNIT,
        EXCHANGE,
        COMPANY_ID
      );
      this.dataservice
        .postCurrencyData(
          CODE,
          SYMBOL,
          DESCRIPTION,
          FRACTION_UNIT,
          EXCHANGE,
          COMPANY_ID
        )
        .subscribe((response) => {
          if (response) {
            this.showCurrency();
            this.isAddCurrencyPopupOpened = false; // Close the popup on successful submission
          } else {
            notify('Failed to save currency data', 'error', 3000);
          }
        }, (error) => {
          notify('An error occurred while saving currency data', 'error', 3000);
        });
    }
  }

  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE, SYMBOL, DESCRIPTION, FRACTION_UNIT, EXCHANGE, COMPANY_ID } = selectedRow;

    this.dataservice
      .removeCurrency(ID, CODE, SYMBOL, DESCRIPTION, FRACTION_UNIT, EXCHANGE, COMPANY_ID)
      .subscribe(() => {
        try {
          notify(
            {
              message: 'Delete operation successful',
              position: { at: 'top right', my: 'top right' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
          this.showCurrency();
        } catch (error) {
          notify(
            {
              message: 'Delete operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      });
  }

  onRowUpdating(event) {
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
      .updateCurrency(id, code, symbol, description, fraction_unit, exchange, company_id)
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: 'Currency updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
          this.showCurrency();
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
    console.log('old data:', oldData);
    console.log('new data:', updataDate);
    console.log('modified data:', combinedData);

    event.cancel = true; // Prevent the default update operation
  }

  validateFractionUnit(params): boolean {
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
      console.log(response);
    });
  }
  onExporting(event: any) {
    this.exportService.onExporting(event,'Currency-list');
  }

  ngOnInit(): void {
    this.showCurrency();
  }

  refresh = () => {
    this.dataGrid.instance.refresh();
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
export class CurrencyListModule {}
