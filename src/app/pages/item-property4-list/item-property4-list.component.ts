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
import { ItemProperty4EditModule } from 'src/app/components/library/item-property4-edit/item-property4-edit.component';
import {
  ItemProperty4FormComponent,
  ItemProperty4FormModule,
} from 'src/app/components/library/item-property4-form/item-property4-form.component';
import { AuthService, DataService } from 'src/app/services';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-item-property4-list',
  templateUrl: './item-property4-list.component.html',
  styleUrls: ['./item-property4-list.component.scss'],
})
export class ItemProperty4ListComponent {
  @ViewChild(ItemProperty4FormComponent)
  ItemProperty4FormComponent: ItemProperty4FormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  ItemProperty4DataSource: DataSource;
  itemProperty4Array: any[] = [];
  itemProperty4Count = 0;
  isItemProperty4PopupOpened = false;
  itemlabel: any;
  isFilterRowVisible: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  isEditItemProperty4PopupOpened: boolean = false;
  showPageSizeSelector = true;
  selected_data: any = [];
  HSN_CODE: any;
  companyID: any;
  companyStateID: any;
  GST_PERC: any;
  selected_Company_id: any;
  poData: any;
  constructor(
    private dataservice: DataService,
    authservice: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
    this.itemlabel = authservice.getsettingsData().ITEM_PROPERTY4;
  }

  ngOnInit() {
    this.sessionDetails();
    this.listItemProperty4();
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
      this.ngZone.run(() => this.addItemProperty4());
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
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    // onClick: () => this.toggleFilters(),
  };

  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;
    this.companyID = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.companyStateID = sessionData.SELECTED_COMPANY.STATE_ID;
    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    // THIS IS THE MISSING LINK
    this.poData.COMPANY_ID = this.companyID;
    this.poData.USER_ID = sessionData.USER_ID;
  }
  listItemProperty4() {
    const payload = {
      COMPANY_ID: this.companyID,
    };

    this.ItemProperty4DataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getItemProperty4Data(payload).subscribe({
            next: (response: any[]) => {
              const list = response || [];

              this.itemProperty4Array = list; // ✅ ARRAY
              this.itemProperty4Count = list.length;

              resolve(list); // ✅ GRID DATA
            },
            error: () => {
              this.itemProperty4Array = [];
              this.itemProperty4Count = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  onClickSaveItemProperty4() {
    const { CODE, DESCRIPTION, COMPANY_ID } =
      this.ItemProperty4FormComponent.getNewItemProperty4Data();

    const isCodeDuplicate = this.itemProperty4Array.some(
      // (item: any) => item.CODE === commonDetails.code
      (item: any) => item.CODE.toLowerCase() === CODE.toLowerCase(),
    );

    const isDescriptionDuplicate = this.itemProperty4Array.some(
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
      .insertItemProperty4Data(CODE, DESCRIPTION, COMPANY_ID)
      .subscribe((response) => {
        if (response) {
          notify(
            {
              message: 'Data added Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.dataGrid.instance.refresh();
          this.listItemProperty4();
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
  }

  addItemProperty4() {
    this.isItemProperty4PopupOpened = true;
  }

  handleClose() {
    this.isEditItemProperty4PopupOpened = false;
    this.listItemProperty4();
  }
  refresh() {
    this.dataGrid.instance.refresh();
    this.listItemProperty4();
  }
  OnEditingStartItem(e: any) {
    e.cancel = true;
    this.isEditItemProperty4PopupOpened = true;
    const id = e.data.ID;
    this.dataservice.select_item_property4(id).subscribe((response: any) => {
      this.selected_data = response;
    });
  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE, DESCRIPTION, COMPANY_ID } = selectedRow;

    this.dataservice
      .removeItemProperty4(ID, CODE, DESCRIPTION, COMPANY_ID)
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
          this.listItemProperty4();
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
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    ItemProperty4FormModule,
    ItemProperty4EditModule,
  ],
  providers: [],
  exports: [],
  declarations: [ItemProperty4ListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemProperty4ListModule {}
