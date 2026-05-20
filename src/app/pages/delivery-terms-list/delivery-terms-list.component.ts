import { Component, OnInit, NgModule, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import {
  DeliveryTermsFormComponent,
  DeliveryTermsFormModule,
} from 'src/app/components/library/delivery-terms-form/delivery-terms-form.component';
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delivery-terms-list',
  templateUrl: './delivery-terms-list.component.html',
  styleUrls: ['./delivery-terms-list.component.scss'],
})
export class DeliveryTermsListComponent {
  @ViewChild(DeliveryTermsFormComponent)
  deliverytermsComponent: DeliveryTermsFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  delivery_terms: any;
  showFilterRow = true;
  showHeaderFilter = true;
  isAddDeliveryTermsPopupOpened = false;
  isFilterRowVisible: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;

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
    this.exportService.onExporting(event, 'Delivery_terms-list');
  }
  addDeliveryTerms() {
    this.isAddDeliveryTermsPopupOpened = true;
  }

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
    this.showDeliveryTerms();
  }

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addDeliveryTerms());
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


  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  showDeliveryTerms() {
    this.dataservice.getDeliveryTermsData().subscribe((response) => {
      this.delivery_terms = response;
    });
  }
  onClickSaveDeliveryTerms() {
    const { CODE, DESCRIPTION } =
      this.deliverytermsComponent.getNewDeliveryTerms();
    this.dataservice
      .postDeliveryTermsData(CODE, DESCRIPTION)
      .subscribe((response) => {
        if (response) {
          this.isAddDeliveryTermsPopupOpened = false;
          this.showDeliveryTerms();
        }
      });
  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE, DESCRIPTION } = selectedRow;

    this.dataservice
      .removeDeliveryTerms(ID, CODE, DESCRIPTION)
      .subscribe(() => {
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
          this.showDeliveryTerms();
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
  onRowUpdating(event) {
    const grid = this.dataGrid.instance;
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };
    let id = combinedData.ID;
    let code = combinedData.CODE;
    let description = combinedData.DESCRIPTION;

    this.dataservice
      .updateDeliveryTerms(id, code, description)
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: 'Delivery Terms Updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          grid.cancelEditData();
          this.dataGrid.instance.refresh();
          this.showDeliveryTerms();
        } else {
          notify(
            {
              message: 'Your Data Not Updated',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      });

    event.cancel = true; // Prevent the default update operation
  }
  ngOnInit(): void {

    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((child: any) => child.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.showDeliveryTerms();
  }

  validateGridDeliveryCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.delivery_terms) return true;

    // get current row ID (works for edit & add)
    const currentId = e.data?.ID;

    return !this.delivery_terms.some((item: any) => {
      const sameCode = item.CODE?.toLowerCase() === value;
      const isSameId = Number(item.ID) === Number(currentId);

      return sameCode && !isSameId;
    });
  };

  validateGridDeliveryDescription = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.delivery_terms) return true;

    // get current row ID (works for edit & add)
    const currentId = e.data?.ID;

    return !this.delivery_terms.some((item: any) => {
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
    DeliveryTermsFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [DeliveryTermsListComponent],
})
export class DeliveryTermsListModule { }
