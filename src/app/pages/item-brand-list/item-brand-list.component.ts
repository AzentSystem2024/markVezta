import { Component, OnInit, NgModule, ViewChild, NgZone } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import {
  ItmBrandFormModule,
  ItmBrandFormComponent,
} from 'src/app/components/library/itm-brand-form/itm-brand-form.component';
import notify from 'devextreme/ui/notify';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { ExportService } from 'src/app/services/export.service';
import DataSource from 'devextreme/data/data_source';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-brand-list',
  templateUrl: './item-brand-list.component.html',
  styleUrls: ['./item-brand-list.component.scss'],
})
export class ItemBrandListComponent implements OnInit {
  @ViewChild(ItmBrandFormComponent) itembrandComponent:
    | ItmBrandFormComponent
    | undefined;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent | undefined;

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new Brand',
    onClick: () => this.addBrand(),
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
    onClick: () => this.toggleFilters(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.zone.run(() => this.refresh());
    },
  };

  brand: any;
  isAddBrandPopupOpened = false;
  showFilterRow = true;
  showHeaderFilter = true;
  isFilterOpened = false;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;

  brandDataSource: any;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private zone: NgZone,
    private router: Router
  ) { }

  onExporting(event: any) {
    this.exportService.onExporting(event, 'Brand-list');
  }

  addBrand() {
    this.isAddBrandPopupOpened = true;
  }

  showBrand() {
    this.brandDataSource = new DataSource({
      load: () => {
        return new Promise((resolve) => {
          this.dataservice.getBrandData().subscribe((response: any) => {
            const data = response?.data || [];
            resolve({
              data: data,
              totalCount: data.length,
            });
          });
        });
      },
    });
  }
  onRowRemoving(event: any) {
    const { ID, CODE, BRAND_NAME, COMPANY_ID } = event.data;

    event.cancel = new Promise((resolve, reject) => {
      this.dataservice.removeBrand(ID, CODE, BRAND_NAME, COMPANY_ID).subscribe({
        next: () => {
          notify(
            {
              message: 'Delete operation successful',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );

          this.showBrand(); // reload data

          resolve(true); // ✅ tells grid: deletion done → update UI properly
        },
        error: () => {
          notify(
            {
              message: 'Delete operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );

          reject(); //  cancel deletion
        },
      });
    });
  }

  onClickSaveBrand() {
    const brandData = this.itembrandComponent?.getNewBrandData();

    if (brandData) {
      const { CODE, BRAND_NAME, COMPANY_ID, COMPANY_NAME } = brandData;

      this.dataservice
        .postBrandData(CODE, BRAND_NAME, COMPANY_ID, COMPANY_NAME)
        .subscribe({
          next: (response) => {
            if (response) {
              notify(
                {
                  message: 'Brand saved successfully',
                  position: { at: 'top right', my: 'top right' },
                },
                'success',
              );

              this.showBrand();
              this.isAddBrandPopupOpened = false;
            }
          },
          error: () => {
            notify(
              {
                message: 'Failed to save brand',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          },
        });
    }
  }
  validateBrandCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();
    if (!value || !this.brandDataSource?.length) {
      return true;
    }
    const currentId =
      e?.data?.ID ||
      0;

    return !this.brandDataSource.some((item: any) => {
      return (
        item.ID !== currentId &&
        (item.CODE || '').trim().toLowerCase() === value
      );
    });
  };
  onRowUpdating(event: any) {
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };
    let id = combinedData.ID;
    let code = combinedData.CODE;
    let brand_name = combinedData.BRAND_NAME;
    let company_id = combinedData.COMPANY_ID;

    this.dataservice
      .updateBrand(id, code, brand_name, company_id)
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: 'Item Brand updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.dataGrid?.instance.refresh();
          this.showBrand();
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

    this.showBrand();
  }

  refresh() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.showBrand();
  }
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  validateGridBrandCode = (e: any): boolean => {
    const value = (e.value || '').trim();
    const currentId = e?.data?.ID; // editing row id

    if (!value || !this.brandDataSource) return true;

    const items = this.brandDataSource?.items?.() || [];

    return !items.some((item: any) => {
      return (
        (item.CODE || '').trim() === value &&
        item.ID !== currentId   // ignore current row while editing
      );
    });
  };
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    ItmBrandFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [ItemBrandListComponent],
})
export class ItemBrandListModule { }
