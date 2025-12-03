import { Component, OnInit, NgModule, ViewChild, NgZone } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
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

@Component({
  selector: 'app-state-list',
  templateUrl: './state-list.component.html',
  styleUrls: ['./state-list.component.scss'],
})
export class StateListComponent {
  @ViewChild(StateFormComponent) stateComponent: StateFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  state: any;
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
  auto: string = 'auto';
  debitList: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    // icon: 'add',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.zone.run(() => {
        this.addState();
      });
    },
    elementAttr: { class: 'add-button' },
  };
  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private zone: NgZone
  ) {}
  onExporting(event: any) {
    this.exportService.onExporting(event, 'state-list');
  }
  addState() {
    this.isAddStatePopupOpened = true;
  }

  

  showState() {
    this.dataservice.getStateData().subscribe((response) => {
      this.state = response;
      console.log(response);
    });
  }

  onToolbarPreparing(e: any) {
    const toolbarItems = e.toolbarOptions.items;

    // Avoid adding the button more than once
    const alreadyAdded = toolbarItems.some(
      (item: any) => item.name === 'toggleFilterButton'
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
              'success'
            );
            this.dataGrid.instance.refresh();
            this.showState();
          } catch (error) {
            notify(
              {
                message: 'Add operation failed',
                position: { at: 'top right', my: 'top right' },
              },
              'error'
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
            'success'
          );
          this.dataGrid.instance.refresh();
          this.showState();
        } catch (error) {
          notify(
            {
              message: 'Delete operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      });
  }
  onRowUpdating(event) {
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };
    let id = combinedData.ID;
    let stateCode = combinedData.STATE_CODE;
    let statename = combinedData.STATE_NAME;
    let country_id = combinedData.COUNTRY_ID;

    this.dataservice
      .updateState(id, stateCode, statename, country_id)
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: 'State updated Successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
          this.showState();
        } else {
          notify(
            {
              message: 'Your Data Not Saved',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      });
    console.log('old data:', oldData);
    console.log('new data:', updataDate);
    console.log('modified data:', combinedData);

    event.cancel = true; // Prevent the default update operation
  }
  ngOnInit(): void {
    this.showState();
    this.getCountryDropDown();
  }
  getCountryDropDown() {
    this.dataservice.getCountryData().subscribe((data: any) => {
      this.CountryDropdownData = data;
      console.log('dropdown', this.CountryDropdownData);
    });
  }
}
@NgModule({
  imports: [DxDataGridModule, DxButtonModule, FormPopupModule, StateFormModule],
  providers: [],
  exports: [],
  declarations: [StateListComponent],
})
export class StateListModule {}
