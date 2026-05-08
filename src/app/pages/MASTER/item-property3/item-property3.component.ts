import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import {
  DxButtonModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxPopupModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { ItemProperty3EditModule } from 'src/app/components/library/item-property3-edit/item-property3-edit.component';
import {
  ItemProperty3FormComponent,
  ItemProperty3FormModule,
} from 'src/app/components/library/item-property3-form/item-property3-form.component';
import { AuthService, DataService } from 'src/app/services';
import DataSource from 'devextreme/data/data_source';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-property3',
  templateUrl: './item-property3.component.html',
  styleUrls: ['./item-property3.component.scss'],
})
export class ItemProperty3Component {
  @ViewChild(ItemProperty3FormComponent)
  ItemProperty3FormComponent: ItemProperty3FormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  ItemProperty3DataSource: DataSource;
  itemProperty3Array: any[] = [];
  itemProperty3Count = 0;
  isItemProperty3PopupOpened = false;
  itemlabel: any;
  isFilterRowVisible: boolean = false;
  sessionData: any;
  ITEM_PROPERTY1: any;
  ITEM_PROPERTY2: any;
  ITEM_PROPERTY3: any;
  ITEM_PROPERTY4: any;
  ITEM_PROPERTY5: any;
  isEditItemProperty3PopupOpened: boolean = false;
  selected_data: any;
  HSN_CODE: any;
  companyID: any;
  companyStateID: any;
  GST_PERC: any;
  selected_Company_id: any;
  poData: any;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  constructor(
    private dataservice: DataService,
    authservice: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.itemlabel = authservice.getsettingsData().ITEM_PROPERTY3;

    this.sesstion_Details();
  }

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilterRow(),
  };

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.ITEM_PROPERTY1 = this.sessionData.GeneralSettings.ITEM_PROPERTY1;

    this.ITEM_PROPERTY2 = this.sessionData.GeneralSettings.ITEM_PROPERTY2;

    this.ITEM_PROPERTY3 = this.sessionData.GeneralSettings.ITEM_PROPERTY3;

    this.ITEM_PROPERTY4 = this.sessionData.GeneralSettings.ITEM_PROPERTY4;

    this.ITEM_PROPERTY5 = this.sessionData.GeneralSettings.ITEM_PROPERTY5;
  }
  OnEditingStartItem(e: any) {
    e.cancel = true;
    this.isEditItemProperty3PopupOpened = true;
    const id = e.data.ID;
    this.dataservice.select_item_property3(id).subscribe((res: any) => {
      this.selected_data = res;
    });
  }
  handleClose() {
    this.isItemProperty3PopupOpened = false;
    this.isEditItemProperty3PopupOpened = false;
    this.listItemProperty3();
  }
  ngOnInit() {

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
    this.listItemProperty3();
  }

  addItemProperty3() {
    this.isItemProperty3PopupOpened = true;
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
      // Run inside Angular's zone
      this.ngZone.run(() => this.addItemProperty3());
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
      this.ngZone.run(() => this.refresh());
    },
    text: '',
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

  listItemProperty3() {
    const payload = {
      COMPANY_ID: this.companyID,
    };

    this.ItemProperty3DataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getItemProperty3Data(payload).subscribe({
            next: (response: any[]) => {
              const list = response || [];

              this.itemProperty3Array = list; // 🔑 cache for logic
              this.itemProperty3Count = list.length;

              resolve(list); // 🔑 stops grid loader
            },
            error: () => {
              this.itemProperty3Array = [];
              this.itemProperty3Count = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  onClickSaveItemProperty3() {
    const { CODE, DESCRIPTION, COMPANY_ID } =
      this.ItemProperty3FormComponent.getNewItemProperty3Data();

    // 🔐 Safety guards
    const list = this.itemProperty3Array || [];
    const code = (CODE || '').trim().toLowerCase();
    const description = (DESCRIPTION || '').trim().toLowerCase();

    const isCodeDuplicate = list.some(
      (item: any) => item.CODE?.toLowerCase() === code,
    );

    const isDescriptionDuplicate = list.some(
      (item: any) => item.DESCRIPTION?.toLowerCase() === description,
    );

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and Description already exist',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    }

    if (isCodeDuplicate) {
      notify(
        {
          message: 'This Code already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    }

    if (isDescriptionDuplicate) {
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

    // ✅ API CALL (NOW IT WILL EXECUTE)
    this.dataservice
      .insertItemProperty3Data(CODE, DESCRIPTION, COMPANY_ID)
      .subscribe({
        next: (response) => {
          this.listItemProperty3();
          notify(
            {
              message: 'Insert operation successful',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.isItemProperty3PopupOpened = false;
        },
        error: (err) => {
          console.error('Insert failed:', err);
        },
      });
  }

  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE, DESCRIPTION, COMPANY_ID } = selectedRow;

    this.dataservice
      .removeItemProperty3(ID, CODE, DESCRIPTION, COMPANY_ID)
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
          this.listItemProperty3();
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
    this.listItemProperty3();
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    ItemProperty3FormModule,
    ItemProperty3EditModule,
  ],
  providers: [],
  exports: [],
  declarations: [ItemProperty3Component],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemProperty3Module { }
