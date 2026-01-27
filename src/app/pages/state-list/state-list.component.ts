import {
  Component,
  OnInit,
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
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { jsPDF } from 'jspdf';
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
  @ViewChild(StateFormComponent) stateComponent: StateFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @Output() formClosed = new EventEmitter<void>();

  StateDataSource: DataSource;
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
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
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
  ) {}
  // onExporting(event: any) {
  //   this.exportService.onExporting(event, 'state-list');
  // }
  addState() {
    this.isAddStatePopupOpened = true;
  }

  CloseEditForm() {
    this.isEditPopupOpened = false;
    this.isAddStatePopupOpened = false;
    this.showState();
  }

  showState() {
  this.StateDataSource = new DataSource({
    load: () =>
      new Promise((resolve) => {
        this.dataservice.getStateData().subscribe({
          next: (response: any) => {
            const data = response || [];

            this.stateArray = data;     // local usage if needed
            this.stateCount = data.length;

            resolve(data);              // 🔑 stops grid loader
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
    const { STATE_CODE, STATE_NAME, COUNTRY_ID } =
      this.stateComponent.getNewStateData();
    console.log('inserted data', STATE_NAME, COUNTRY_ID);
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
            // this.dataGrid.instance.refresh();
            this.formClosed.emit();
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
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, STATE_CODE, STATE_NAME, COUNTRY_ID } = selectedRow;

    this.dataservice
      .removeState(ID, STATE_CODE, STATE_NAME, COUNTRY_ID)
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
          this.showState();
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
  //  onRowUpdating (event) {
  //     const updataDate = event.newData;
  //     const oldData = event.oldData;
  //     const combinedData = { ...oldData, ...updataDate };
  //     let id = combinedData.ID;
  //     let stateCode = combinedData.STATE_CODE;
  //     let statename = combinedData.STATE_NAME;
  //     let country_id = combinedData.COUNTRY_ID;

  //     this.dataservice
  //       .updateState(id, stateCode, statename, country_id)
  //       .subscribe((data: any) => {
  //         if (data) {
  //           notify(
  //             {
  //               message: 'State updated Successfully',
  //               position: { at: 'top right', my: 'top right' },
  //             },
  //             'success'
  //           );
  //           this.dataGrid.instance.refresh();
  //           this.showState();
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
  ngOnInit(): void {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    console.log('Parsed ObjectData:', menuResponse);
    this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/credit-note');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }

    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    this.showState();
    this.getCountryDropDown();
  }
  getCountryDropDown() {
    this.dataservice.getCountryData().subscribe((data: any) => {
      this.CountryDropdownData = data;
      console.log('dropdown', this.CountryDropdownData);
    });
  }
  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
    this.selectedCompanyId = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  onEditingRow(event: any) {
    event.cancel = true;
    this.isEditPopupOpened = true;
    console.log(event);
    this.selectedState = event.data;
    this.selectState(event);
  }

  selectState(event: any) {
    console.log(event);
    const id = event.data.ID;
    this.dataservice.SelectState(id).subscribe((res: any) => {
      console.log(res);
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
export class StateListModule {}
