import {
  Component,
  OnInit,
  NgModule,
  ViewChild,
  ChangeDetectorRef,
  NgZone,
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
  ItemProperty1FormModule,
  ItemProperty1FormComponent,
} from 'src/app/components/library/item-property1-form/item-property1-form.component';
import { ExportService } from 'src/app/services/export.service';
import { ItemProperty2EditModule } from 'src/app/components/library/item-property2-edit/item-property2-edit.component';
import {
  ItemProperty2FormComponent,
  ItemProperty2FormModule,
} from 'src/app/components/library/item-property2-form/item-property2-form.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-item-property2-list',
  templateUrl: './item-property2-list.component.html',
  styleUrls: ['./item-property2-list.component.scss'],
})
export class ItemProperty2ListComponent {
  @ViewChild(ItemProperty2FormComponent)
  itemProperty2Form!: ItemProperty2FormComponent;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  ItemProperty2DataSource: DataSource;
  itemProperty2Array: any[] = [];
  itemProperty2Count = 0;
  isItemProperty2PopupOpened = false;
  itemlabel: any;
  showFilterRow = true;
  showHeaderFilter = true;
  isEditItemProperty2PopupOpened: boolean = false;
  isFilterRowVisible: boolean = false;
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
  poData: any;
  isFilterOpened = false;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  constructor(
    private dataservice: DataService,
    authservice: AuthService,
    private exportService: ExportService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.itemlabel = authservice.getsettingsData().ITEM_PROPERTY2;

    this.sesstion_Details();
  }
  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.ITEM_PROPERTY1 = this.sessionData.GeneralSettings.ITEM_PROPERTY1;

    this.ITEM_PROPERTY2 = this.sessionData.GeneralSettings.ITEM_PROPERTY2;

    this.ITEM_PROPERTY3 = this.sessionData.GeneralSettings.ITEM_PROPERTY3;

    this.ITEM_PROPERTY4 = this.sessionData.GeneralSettings.ITEM_PROPERTY4;

    this.ITEM_PROPERTY5 = this.sessionData.GeneralSettings.ITEM_PROPERTY5;
  }

  onExporting(event: any) {
    this.exportService.onExporting(event, `${this.itemlabel}-list`);
  }

  addItemProperty2() {
    this.isItemProperty2PopupOpened = true;
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

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
    this.showItemProperty2();
  }

  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',

    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addItemProperty2());
    },

    elementAttr: { class: 'add-button' },
  };
  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;
    this.companyID = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.companyStateID = sessionData.SELECTED_COMPANY.STATE_ID;
    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    // THIS IS THE MISSING LINK
    // this.poData.COMPANY_ID = this.companyID;
    // this.poData.USER_ID = sessionData.USER_ID;
  }
  showItemProperty2() {
    const payload = {
      COMPANY_ID: this.companyID,
    };

    this.ItemProperty2DataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getItemProperty2Data(payload).subscribe({
            next: (response: any[]) => {
              const list = response || [];

              this.itemProperty2Array = list; // cache for logic
              this.itemProperty2Count = list.length;

              resolve(list); // 🔑 stops grid loader
            },
            error: () => {
              this.itemProperty2Array = [];
              this.itemProperty2Count = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  onClickSaveItemProperty2() {
    const { CODE, DESCRIPTION, COMPANY_ID } =
      this.itemProperty2Form.getNewItemProperty2Data();

    // Check for duplicates in CategoryList
    const isCodeDuplicate = this.itemProperty2Array.some(
      // (item: any) => item.CODE === commonDetails.code
      (item: any) => item.CODE.toLowerCase() === CODE.toLowerCase(),
    );

    const isDescriptionDuplicate = this.itemProperty2Array.some(
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
      .postItemProperty2Data(CODE, DESCRIPTION, COMPANY_ID)
      .subscribe((response) => {
        if (response) {
          this.showItemProperty2();
          this.isItemProperty2PopupOpened = false;
          notify(
            {
              message: ' Insert operation successfull',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1000,
            },
            'success',
          );
        }
      });
  }
  refresh() {
    this.dataGrid.instance.refresh();
    this.showItemProperty2();
  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE, DESCRIPTION, COMPANY_ID } = selectedRow;

    this.dataservice
      .removeItemProperty2(ID, CODE, DESCRIPTION, COMPANY_ID)
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
          this.showItemProperty2();
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
  onEditingStartproperty2(event: any) {
    event.cancel = true;
    this.isEditItemProperty2PopupOpened = true;
    const id = event.data.ID;
    this.dataservice.select_item_property2(id).subscribe((res: any) => {
      this.selected_data = res;
    });
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
    this.showItemProperty2();
  }
  handleClose() {
    this.isItemProperty2PopupOpened = false;
    this.isEditItemProperty2PopupOpened = false;
    this.showItemProperty2();
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
    ItemProperty2EditModule,
    ItemProperty2FormModule,
  ],
  providers: [],
  exports: [],
  declarations: [ItemProperty2ListComponent],
})
export class ItemProperty2ListModule { }
