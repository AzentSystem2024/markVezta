import {
  Component,
  NgModule,
  ViewChild,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { AuthService, DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import notify from 'devextreme/ui/notify';
import { DxPopupModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import {
  ItemProperty1FormComponent,
  ItemProperty1FormModule,
} from 'src/app/components/library/item-property1-form/item-property1-form.component';
import { ExportService } from 'src/app/services/export.service';
import { ItemProperty1EditModule } from 'src/app/components/library/item-property1-edit/item-property1-edit.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-property1-list',
  templateUrl: './item-property1-list.component.html',
  styleUrls: ['./item-property1-list.component.scss'],
})
export class ItemProperty1ListComponent {
  @ViewChild(ItemProperty1FormComponent)
  itemproperty1Component: ItemProperty1FormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  ItemProperty1DataSource: DataSource;
  itemProperty1Array: any[] = [];
  itemProperty1Count = 0;
  isItemProperty1PopupOpened = false;
  itemlabel: any;
  showFilterRow = true;
  isReadOnly: boolean = false;
  showHeaderFilter = true;
  isFilterRowVisible: boolean = false;
  isEditItemProperty1PopupOpened: boolean = false;
  selected_data: any = [];
  sessionData: any;
  ITEM_PROPERTY1: any;
  ITEM_PROPERTY2: any;
  ITEM_PROPERTY3: any;
  ITEM_PROPERTY4: any;
  ITEM_PROPERTY5: any;
  HSN_CODE: any;
  companyID: any;
  companyStateID: any;
  GST_PERC: any;
  selected_Company_id: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  isFilterOpened = false;

  constructor(
    private dataservice: DataService,
    authservice: AuthService,
    private exportService: ExportService,
    private ngZone: NgZone,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.itemlabel = authservice.getsettingsData().ITEM_PROPERTY1;
    this.sesstion_Details();
  }

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, //  global style
    onClick: () => this.toggleFilters(),
  };

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },
    text: '',
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.showItemProperty1();
  }

  addItemProperty1() {
    this.isItemProperty1PopupOpened = true;
  }
  onExporting(event: any) {
    this.exportService.onExporting(event, `${this.itemlabel}-list`);
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.ITEM_PROPERTY1 = this.sessionData.GeneralSettings.ITEM_PROPERTY1;

    this.ITEM_PROPERTY2 = this.sessionData.GeneralSettings.ITEM_PROPERTY2;

    this.ITEM_PROPERTY3 = this.sessionData.GeneralSettings.ITEM_PROPERTY3;

    this.ITEM_PROPERTY4 = this.sessionData.GeneralSettings.ITEM_PROPERTY4;

    this.ITEM_PROPERTY5 = this.sessionData.GeneralSettings.ITEM_PROPERTY5;
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addItemProperty1());
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
  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;
    this.companyID = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.companyStateID = sessionData.SELECTED_COMPANY.STATE_ID;
    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    // THIS IS THE MISSING LINK
  }

  showItemProperty1() {
    const payload = {
      COMPANY_ID: this.companyID,
    };

    this.ItemProperty1DataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getItemProperty1Data(payload).subscribe({
            next: (response: any[]) => {
              const list = response || [];

              this.itemProperty1Array = list; // local cache
              this.itemProperty1Count = list.length;

              resolve(list); // 🔑 stops dx loader
            },
            error: () => {
              this.itemProperty1Array = [];
              this.itemProperty1Count = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  onClickSaveItemProperty1() {
    const { CODE, DESCRIPTION, COMPANY_ID } =
      this.itemproperty1Component.getNewItemProperty1Data();

    // Check for duplicates in CategoryList

    const isCodeDuplicate = this.itemProperty1Array.some(
      // (item: any) => item.CODE === commonDetails.code
      (item: any) => item.CODE.toLowerCase() === CODE.toLowerCase(),
    );

    const isDescriptionDuplicate = this.itemProperty1Array.some(
      // (item: any) => item.DESCRIPTION === commonDetails.category
      (item: any) =>
        item.DESCRIPTION.toLowerCase() === DESCRIPTION.toLowerCase(),
    );

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and category already exist',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    } else if (isCodeDuplicate) {
      notify(
        {
          message: 'This Code already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    } else if (isDescriptionDuplicate) {
      notify(
        {
          message: 'This Description already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    }
    this.dataservice
      .postItemProperty1Data(CODE, DESCRIPTION, COMPANY_ID)
      .subscribe((response) => {
        if (response) {
          this.showItemProperty1();
          this.isItemProperty1PopupOpened = false;
          notify(
            {
              message: 'Insert operation successful',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
        }
      });
  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE, DESCRIPTION, COMPANY_ID } = selectedRow;

    this.dataservice
      .removeItemProperty1(ID, CODE, DESCRIPTION, COMPANY_ID)
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
          this.showItemProperty1();
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
  refresh() {
    this.dataGrid.instance.refresh();
    this.showItemProperty1();
  }
  handleClose() {
    this.isEditItemProperty1PopupOpened = false;
    this.isItemProperty1PopupOpened = false;
    this.showItemProperty1();
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

    this.sessionDetails();
    this.showItemProperty1();
  }
  OnEditingStartItem1(event: any) {
    event.cancel = true;
    this.isEditItemProperty1PopupOpened = true;
    const id = event.data.ID;
    this.dataservice.select_item_property1(id).subscribe((res: any) => {
      this.selected_data = res;
    });
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    ItemProperty1FormModule,
    DxPopupModule,
    CommonModule,
    ItemProperty1EditModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [ItemProperty1ListComponent],
})
export class ItemProperty1ListModule { }
