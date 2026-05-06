import { CommonModule } from '@angular/common';
import { Component, NgModule, NgZone, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxPopupModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import { ExportService } from 'src/app/services/export.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eos',
  templateUrl: './eos.component.html',
  styleUrls: ['./eos.component.scss'],
})
export class EOSComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  EOS: any[];
  EosComponent: any;
  formData = { IS_INACTIVE: false };
  formsource: FormGroup;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showFilterRow = true;
  showHeaderFilter = true;
  isFilterRowVisible: boolean = false;
  sessionData: any;
  COMPANY_ID: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  constructor(
    private fb: FormBuilder,
    private dataservice: DataService,
    private ngZone: NgZone,
    private exportService: ExportService,
    private router: Router,

  ) {
    this.formsource = this.fb.group({
      CODE: ['', Validators.required],
      DESCRIPTION: ['', Validators.required],
      IS_INACTIVE: [false],
    });
    this.sesstion_Details();
    this.get_EOS_List();
  }

  selectedData: any;
  currentFilter: string = 'auto';
  AddEOSPopup = false;
  UpdateEOSPopup = false;
  editingRowData: any = {}; // To store the selected row's data
  Status: boolean = false;
  Eos: any;
  isFilterOpened = false;

  ngOnInit() {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
  }

  addEOS() {
    this.AddEOSPopup = true;
  }

  UpdateEOS() {
    this.UpdateEOSPopup = true;
  }

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
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
    this.get_EOS_List();
  }

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addEOS());
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

  onEditingStart(event: any) {
    event.cancel = true;
    this.editingRowData = { ...event.data }; // Store the selected row data
    this.UpdateEOSPopup = true;
  }

  onExporting(event: any) {
    this.exportService.onExporting(event, 'Department-list');
  }

  refresh = () => {
    this.dataGrid.instance.refresh();
  };

  formatStatus(data: any) {
    return data.IS_INACTIVE ? 'Inactive' : 'Active';
  }

  getSerialNumber = (rowIndex: number) => {
    return rowIndex + 1;
  };

  statusCellTemplate = (cellElement: any, cellInfo: any) => {
    const status = cellInfo.value; // Get the value from `calculateCellValue`
    const text = status; // Use the calculated value ("Inactive" or "Active")

    // Apply the dynamic styles and content
    cellElement.innerHTML = `
<span style="
  color: white;
  padding: 2px 3px;
  border-radius: 5px;
  display: inline-block;
  text-align: center;
  min-width: 60px;"
>
  ${text}
</span>`;
  };

  getStatusFlagClass(IS_INACTIVE: boolean): string {
    return IS_INACTIVE ? 'flag-red' : 'flag-green';
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.COMPANY_ID = String(this.sessionData.SELECTED_COMPANY.COMPANY_ID);
  }

  //===================get data list========================
  get_EOS_List() {
    this.dataservice.get_EOS_List().subscribe((res: any) => {
      if (res) {
        this.EOS = res.datas.map((item: any, index: any) => ({
          ...item,
          SlNo: index + 1, // Assign serial number
        }));
      }
    });
  }

  //====================Add data=================

  Add_EOS() {
    const CODE = this.formsource.value.CODE?.trim();
    const DESCRIPTION = this.formsource.value.DESCRIPTION;
    const IS_INACTIVE = this.formsource.value.IS_INACTIVE;
    const COMPANY_ID = this.COMPANY_ID;

    this.formsource.reset();
    const isDuplicate = this.EOS.some((data: any) => {
      return (
        data.DESCRIPTION?.toLowerCase().trim() ===
        DESCRIPTION?.toLowerCase().trim() ||
        data.CODE?.toLowerCase().trim() === CODE?.toLowerCase().trim()
      );
    });
    this.formsource.reset();
    if (isDuplicate) {
      notify(
        {
          message: 'Data already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );

      return;
    }
    this.formsource.reset();

    if (CODE && DESCRIPTION) {
      this.dataservice
        .Insert_EOS_Api(CODE, DESCRIPTION, IS_INACTIVE, COMPANY_ID)
        .subscribe((response) => {
          notify(
            {
              message: 'Data succesfully added',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.AddEOSPopup = false;
          this.formsource.reset();
          this.get_EOS_List();
        });
    } else {
      notify(
        {
          message: 'Please fill the fields',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );
    }
    this.get_EOS_List();
  }

  //==============Edit data===================

  Edit_EOS() {
    const CODE = this.editingRowData.CODE;
    const DESCRIPTION = this.editingRowData.DESCRIPTION;
    const IS_INACTIVE = this.editingRowData.IS_INACTIVE;
    const ID = this.editingRowData.ID;
    const COMPANY_ID = 1;

    this.dataservice.get_Designation_List().subscribe((response: any) => {
      this.list_for_duplication = response.datas;
    });
    this.formsource.reset();
    const isDuplicate = this.EOS?.some((item: any) => {
      if (item.ID === ID) return false; // Skip current item (being edited)

      return (
        (item.CODE?.trim().toLowerCase() || '') ===
        (CODE?.trim().toLowerCase() || '') ||
        (item.DESCRIPTION?.trim().toLowerCase() || '') ===
        (DESCRIPTION?.trim().toLowerCase() || '')
      );
    });
    this.formsource.reset();
    if (isDuplicate) {
      this.get_EOS_List();

      notify(
        {
          message: 'Data already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );
      return;
    }

    if (CODE && DESCRIPTION) {
      this.dataservice
        .Update_EOS_Api(CODE, DESCRIPTION, IS_INACTIVE, ID, COMPANY_ID)
        .subscribe((response) => {
          notify(
            {
              message: 'Data succesfully added',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.get_EOS_List();
        });
      this.UpdateEOSPopup = false;
      this.get_EOS_List();
    } else {
      notify(
        {
          message: 'Please fill the fields',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );
      this.AddEOSPopup = false;
      this.get_EOS_List();
    }
  }
  list_for_duplication(list_for_duplication: any, arg1: string) {
    throw new Error('Method not implemented.');
  }

  //============select data========================
  Select_EOS(event: any) {
    const ID = event.data.ID;

    this.dataservice.Select_EOS_Api(ID).subscribe((response: any) => {
      this.selectedData = response;
    });
  }

  //==========Delete data==============

  delete_EOS(event: any) {
    const ID = event.data.ID;
    this.dataservice.Delete_EOS_Api(ID).subscribe((response: any) => { });
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    FormPopupModule,
    DxFormModule,
    DxPopupModule,
    CommonModule,
    DxTextBoxModule,
  ],
  providers: [],
  exports: [],
  declarations: [EOSComponent],
})
export class EOSModule { }
