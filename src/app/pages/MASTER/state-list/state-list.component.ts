import {
  Component,
  NgModule,
  ViewChild,
  NgZone,
  Output,
  EventEmitter,
} from '@angular/core';
import { DxButtonModule, DxPopupModule } from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import {
  StateFormComponent,
  StateFormModule,
} from 'src/app/components/library/state-form/state-form.component';
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';
import { StateEditModule } from 'src/app/state-edit/state-edit.component';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-state-list',
  templateUrl: './state-list.component.html',
  styleUrls: ['./state-list.component.scss'],
})
export class StateListComponent {
  @ViewChild(StateFormComponent) stateComponent: StateFormComponent | undefined;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent | undefined;

  @Output() formClosed = new EventEmitter<void>();

  StateDataSource: DataSource | undefined;
  stateArray: any[] = [];
  stateCount = 0;
  CountryDropdownData: any;
  isAddStatePopupOpened = false;
  showFilterRow = true;
  showHeaderFilter = true;
  isFilterOpened = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  isEditPopupOpened: boolean = false;
  auto: string = 'auto';
  debitList: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.zone.run(() => this.addState());
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
    elementAttr: { class: 'toolbar-icon-btn' }, // global style
    onClick: () => this.toggleFilters(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    // onClick: () => this.refreshGrid(),
    onClick: () => {
      this.zone.run(() => this.refreshGrid());
    },
    text: '',
  };
  selectedState: any;
  sessionData: any;
  selected_vat_id: any;
  selectedCompanyId: any;
  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private zone: NgZone,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.showState();
    this.getCountryDropDown();
  }

  addState() {
    this.isAddStatePopupOpened = true;
  }

CloseEditForm() {
  this.isEditPopupOpened = false;
  this.isAddStatePopupOpened = false;

  this.stateComponent?.resetStateForm();   // reset form

  this.showState();
}

  showState() {
    this.StateDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getStateData().subscribe({
            next: (response: any) => {
              const data = response || [];

              this.stateArray = data;
              this.stateCount = data.length;

              resolve(data);
            },
            error: () => {
              this.stateArray = [];
              this.stateCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.showState();
  }
  onToolbarPreparing(e: any) {
    const toolbarItems = e.toolbarOptions.items;

    // Avoid adding the button more than once
    const alreadyAdded = toolbarItems.some(
      (item: any) => item.name === 'toggleFilterButton',
    );
    if (!alreadyAdded) {
      toolbarItems.splice(toolbarItems.length - 1, 0, {
        widget: 'dxButton',
        name: 'toggleFilterButton', // custom name to avoid duplicates
        location: 'after',
        options: {
          icon: 'search',
          hint: 'Search Column',
          onClick: () => this.toggleFilters(),
        },
      });
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

  onClickSaveState() {
    const newStateData = this.stateComponent?.getNewStateData();

    if (!newStateData) {
      notify(
        {
          message: 'Unable to save state: form is not initialized',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
      );
      return;
    }

    const { STATE_CODE, STATE_NAME, COUNTRY_ID } = newStateData;

    // DUPLICATE CHECK
    const isDuplicateCode = this.stateArray.some(
      (x: any) =>
        x.STATE_CODE?.toLowerCase().trim() === STATE_CODE?.toLowerCase().trim(),
    );

    const isDuplicateName = this.stateArray.some(
      (x: any) =>
        x.STATE_NAME?.toLowerCase().trim() === STATE_NAME?.toLowerCase().trim(),
    );

    if (isDuplicateCode) {
      notify(
        {
          message: 'State Code already exists',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
      );
      return;
    }

    if (isDuplicateName) {
      notify(
        {
          message: 'State Name already exists',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
      );
      return;
    }

    // ✅ API CALL (only if no duplicates)
    this.dataservice
      .postStateData(STATE_CODE, STATE_NAME, COUNTRY_ID)
      .subscribe((response) => {
        if (response) {
          try {
            notify(
              {
                message: 'State is successfully added',
                position: { at: 'top right', my: 'top right' },
              },
              'success',
            );

           this.formClosed.emit();
this.stateComponent?.resetStateForm();
this.isAddStatePopupOpened = false;
this.showState();
          } catch (error) {
            notify(
              {
                message: 'Add operation failed',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
        }
      });
  }

onRowRemoving(event: any) {
  const selectedRow = event.data;
  const { ID, STATE_CODE, STATE_NAME, COUNTRY_ID } = selectedRow;

  event.cancel = true; // stop default delete

  this.dataservice
    .removeState(ID, STATE_CODE, STATE_NAME, COUNTRY_ID)
    .subscribe({
      next: () => {
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        );

        this.showState(); // reload datasource only
      },
      error: () => {
        notify(
          {
            message: 'Delete operation failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      },
    });
}

  getCountryDropDown() {
    this.dataservice.getCountryData().subscribe((data: any) => {
      this.CountryDropdownData = data;
      console.log('dropdown', this.CountryDropdownData);
    });
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_vat_id = this.sessionData.VAT_ID;
    this.selectedCompanyId = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  onEditingRow(event: any) {
    event.cancel = true;
    this.isEditPopupOpened = true;
    this.selectedState = event.data;
    this.selectState(event);
  }

  selectState(event: any) {
    const id = event.data.ID;
    this.dataservice.SelectState(id).subscribe((res: any) => {
      this.selectedState = res;
    });
  }

  onExporting(event: any) {
    const fileName = 'states-list';
    this.dataservice.exportDataGrid(event, fileName);
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    StateFormModule,
    DxPopupModule,
    StateEditModule,
  ],
  providers: [],
  exports: [],
  declarations: [StateListComponent],
})
export class StateListModule { }
