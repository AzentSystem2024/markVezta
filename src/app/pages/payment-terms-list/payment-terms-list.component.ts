import { Component, OnInit, NgModule, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { PaymentTermsFormModule } from 'src/app/components/library/payment-terms-form/payment-terms-form.component';
import notify from 'devextreme/ui/notify';
import { PaymentTermsFormComponent } from 'src/app/components/library/payment-terms-form/payment-terms-form.component';
import { ExportService } from 'src/app/services/export.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-terms-list',
  templateUrl: './payment-terms-list.component.html',
  styleUrls: ['./payment-terms-list.component.scss'],
})
export class PaymentTermsListComponent {
  @ViewChild(PaymentTermsFormComponent)
  paymenttermsComponent: PaymentTermsFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  payment_terms: any;
  isAddPaymentTermsPopupOpened = false;
  isEditPaymentTermsPopupOpened = false;
  showFilterRow = true;
  showHeaderFilter = true;
  isFilterRowVisible: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  selectedPaymentTerms: any;
  selectedId: any;
  selectedpaymenttermId: any;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router

  ) { }
  onExporting(event: any) {
    this.exportService.onExporting(event, 'Payment_terms-list');
  }
  addPaymentTerms() {
    this.isAddPaymentTermsPopupOpened = true;
  }

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addPaymentTerms());
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
    onClick: () => this.toggleFilterRow(),
  };

  //=================================refresh=============================
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  refreshGrid() {
    this.showPaymentTerms();
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };



  showPaymentTerms() {
    this.dataservice.getPaymentTermsData().subscribe((response) => {
      this.payment_terms = response;
    });
  }
  onClickSavePaymentTerms() {
    const { CODE, DESCRIPTION } =
      this.paymenttermsComponent.getNewPaymentTerms();
    console.log('inserted data', CODE, DESCRIPTION);
    this.dataservice
      .postPaymentTermsData(CODE, DESCRIPTION)
      .subscribe((response) => {
        if (response) {
          this.isAddPaymentTermsPopupOpened = false;
          this.showPaymentTerms();
        }
      });
  }

  // selectPaymentTerms(e:any){
  //   console.log(e,'event  ')
  //    e.cancel = true;
  //   const paymenttermId = e.data.ID;
  //   this.selectedpaymenttermId = e.data.ID;
  //   this.selectedId = paymenttermId;

  //   this.dataservice.selectPaymentTerms(paymenttermId).subscribe({
  //     next: (response: any) => {
  //       console.log(response)
  //       this.selectedPaymentTerms = response;
  //       console.log(this.selectedPaymentTerms)
  //       this.isEditPaymentTermsPopupOpened = true;

  //       this.cdr.detectChanges();
  //     },
  //     error: (err) => {
  //       console.error('Failed to fetch salary revision:', err);
  //     },
  //   });
  // }
  onRowRemoving(event: any) {
    const id = event.data.ID;
    this.dataservice.removePaymentTerms(id).subscribe(() => {
      try {
        // Your delete logic here
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        this.dataGrid.instance.refresh();
        this.showPaymentTerms();
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

    console.log("🔥 UPDATE TRIGGERED");

    const oldData = event.oldData;
    const newData = event.newData;

    const combinedData = { ...oldData, ...newData };

    const id = combinedData.ID;
    const code = combinedData.CODE;
    const description = combinedData.DESCRIPTION;

    this.dataservice
      .updatePaymentTerms(id, code, description)
      .subscribe((data: any) => {

        if (data) {
          notify(
            {
              message: 'Payments Terms Updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
            2000
          );
          this.showPaymentTerms();
        } else {
          notify('Your Data Not Saved', 'error', 2000);
        }

        // 🔥 CRITICAL PART (from your reference)
        event.component.cancelEditData(); // ✅ CLOSE POPUP

        this.dataGrid.instance.refresh();
      });

    event.cancel = true; // keep this
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


    this.showPaymentTerms();
  }

  handleClose() {
    this.isAddPaymentTermsPopupOpened = false;
    this.isEditPaymentTermsPopupOpened = false;
    this.showPaymentTerms();
  }

  validateGridCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.payment_terms) return true;

    const currentId = e.data?.ID;

    return !this.payment_terms.some((item: any) => {
      const sameCode = item.CODE?.toLowerCase() === value;
      const isSameId = Number(item.ID) === Number(currentId);

      return sameCode && !isSameId;
    });
  };

  validateGridDescription = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.payment_terms) return true;

    const currentId = e.data?.ID;

    return !this.payment_terms.some((item: any) => {
      const sameCode = item.DESCRIPTION?.toLowerCase() === value;
      const isSameId = Number(item.ID) === Number(currentId);

      return sameCode && !isSameId;
    });
  };
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    PaymentTermsFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [PaymentTermsListComponent],
})
export class PaymentTermsListModule { }
