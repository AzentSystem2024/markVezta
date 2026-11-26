import {
  Component,
  EventEmitter,
  NgZone,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { StateFormComponent } from 'src/app/components/library/state-form/state-form.component';
import { DataService, notify } from 'src/app/services';
import { ExportService } from 'src/app/services/export.service';



@Component({
  selector: 'app-zone',
  templateUrl: './zone.component.html',
  styleUrls: ['./zone.component.scss']
})
export class ZoneComponent {
  @ViewChild(StateFormComponent) stateComponent: StateFormComponent | undefined;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent | undefined;

  @Output() formClosed = new EventEmitter<void>();


  ZoneDataSource: DataSource | undefined;
  zoneArray: any[] = [];
  zoneCount = 0;
  CountryDropdownData: any;
  isAddZonePopupOpened = false;
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
      this.zone.run(() => this.addZone());
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
  selectedZone: any;
  sessionData: any;
  selected_vat_id: any;
  selectedCompanyId: any;
  appType: any;
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

    this.showZone();
  }

  addZone() {
    this.isAddZonePopupOpened = true;
  }

  CloseEditForm() {
    this.isEditPopupOpened = false;
    this.isAddZonePopupOpened = false;

    this.stateComponent?.resetStateForm();   // reset form

    this.showZone();
  }

  showZone() {
    this.ZoneDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getZoneData().subscribe({
            next: (response: any) => {
              const data = response.Data || [];

              // Generate Serial Number
              this.zoneArray = data.map((item: any, index: number) => ({
                ...item,
                SL_NO: index + 1
              }));

              this.zoneCount = this.zoneArray.length;

              resolve(this.zoneArray);
            },
            error: () => {
              this.zoneArray = [];
              this.zoneCount = 0;
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
    this.showZone();
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



  onRowRemoving(event: any) {
    const id = event.data.ID;

    event.cancel = true; // Prevent DevExtreme from deleting automatically

    this.dataservice.removeZone(id).subscribe({
      next: (res: any) => {
        if (res.Flag === 1) {
          notify('Zone deleted successfully', 'success', 2000);

          this.showZone();

          // Refresh the grid
          this.dataGrid?.instance.refresh();
        } else {
          notify(res.Message || 'Unable to delete zone', 'error', 2000);
        }
      },
      error: (err: any) => {
        console.error('Delete Zone Error:', err);
        notify('Unable to delete zone', 'error', 2000);
      }
    });
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_vat_id = this.sessionData.VAT_ID;
    this.selectedCompanyId = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.appType = this.sessionData.Configuration[0].APP_TYPE;
  }

  onClickSaveZone(event: any) {
    if (event?.Flag === 1) {
      this.CloseEditForm();
      notify('Zone added successfully', 'success', 2000);
    }
  }

  onClickUpdateZone(event: any) {
    if (event?.Flag === 1) {
      this.CloseEditForm();
      notify('Zone updated successfully', 'success', 2000);
    }
  }

  onEditingRow(event: any) {
    event.cancel = true;
    this.isEditPopupOpened = true;
    this.selectedZone = event.data;
    this.selectZone(event);
  }

  selectZone(id: any) {
    this.dataservice.SelectZone(id).subscribe({
      next: (res: any) => {
        if (res.Flag === 1 && res.Data?.length > 0) {
          this.selectedZone = res;
        }
      },
      error: (err: any) => {
        console.error('Select Zone Error:', err);
      }
    });
  }

  onExporting(event: any) {
    const fileName = 'zone';
    this.dataservice.exportDataGrid(event, fileName);
  }


}