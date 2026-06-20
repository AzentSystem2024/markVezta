import {
  Component,
  OnInit,
  NgModule,
  ViewChild,
  ChangeDetectorRef,
  NgZone,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  DxButtonModule,
  DxPopupModule,
  DxValidationGroupModule,
} from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { VatClassFormModule } from 'src/app/components/library/vat-class-form/vat-class-form.component';
import { VatClassFormComponent } from 'src/app/components/library/vat-class-form/vat-class-form.component';
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';
import { VatClassEditModule } from '../../vat-class-edit/vat-class-edit.component';
import { CommonModule } from '@angular/common';
import DataSource from 'devextreme/data/data_source';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vat-class-list',
  templateUrl: './vat-class-list.component.html',
  styleUrls: ['./vat-class-list.component.scss'],
})
export class VatClassListComponent {
  @ViewChild(VatClassFormComponent) vatclassComponent:
    | VatClassFormComponent
    | undefined;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent | undefined;
  @Output() formClosed = new EventEmitter<void>();

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  VatClassDataSource: DataSource | undefined;
  vatClassArray: any[] = [];
  vatClassCount = 0;
  isAddVatclassPopupOpened = false;
  isFilterRowVisible: boolean = false;
  showFilterRow = true;
  showHeaderFilter = true;
  select_Data!: Object;
  isEditVatclassPopupOpened!: boolean;
  selected_data!: Object;
  selected_vat_id: any;
  sessionData: any;
  selected_Company_id: any;
  HSN_CODE: any;
  companyID: any;
  companyStateID: any;
  GST_PERC: any;
  poData: any;
  isFilterOpened = false;
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addVatclass());
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
    // onClick: () => this.refreshGrid(),
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },
    text: '',
  };
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };
  // router: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  subType: any;
  companyState: any;
  HSNCODE: any;
  GST: any;
  selectedCompanyId: any;
  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}
  onExporting(event: any) {
    this.exportService.onExporting(event, 'VAT_class-list');
  }
  // addVatclass() {
  //   this.isAddVatclassPopupOpened = true;
  // }

  addVatclass() {
    if (this.vatclassComponent) {
      this.vatclassComponent.resetForm();
    }

    this.isAddVatclassPopupOpened = true;
  }

  ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

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

    this.subType = userData?.Configuration?.[0]?.SUB_TYPE_ID || 0;
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      this.companyState = selectedCompany.STATE_NAME;
      this.companyStateID = selectedCompany.STATE_ID;
      this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;

        // this.companyList = [selectedCompany]; // Show only selected company
      }
      this.showVatclass();
    }
  }
  sessionData_tax() {
    throw new Error('Method not implemented.');
  }
  getCreditNotes() {
    throw new Error('Method not implemented.');
  }
  // ngOnInit(): void {
  //   this.sessionDetails();
  //   this.showVatclass();
  // }

  sessionDetails() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;
    this.companyID = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.companyStateID = sessionData.SELECTED_COMPANY.STATE_ID;
    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;

    this.selected_Company_id = this.companyID;

    this.poData = {
      COMPANY_ID: this.companyID,
      USER_ID: sessionData.USER_ID,
    };
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.showVatclass();
  }
  showVatclass() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
    };

    this.VatClassDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getVatclassData(payload).subscribe({
            next: (response: any[]) => {
              const list = response || [];

              this.vatClassArray = list; // 🔑 cache for logic
              this.vatClassCount = list.length;

              resolve(list); //  stops grid loader
            },
            error: () => {
              this.vatClassArray = [];
              this.vatClassCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };
  onClickSaveVatclass() {
    const result = this.vatclassComponent?.validationGroup.instance.validate();

    if (!result?.isValid) {
      return;
    }

    const payload = this.vatclassComponent?.getNewVatclassData();
    payload.COMPANY_ID = this.selectedCompanyId;
    this.dataservice.postVatclassData(payload).subscribe((response) => {
      if (response) {
        this.formClosed.emit();
        this.isAddVatclassPopupOpened = false;
        this.showVatclass();
      }
    });
  }

  onRowRemoving(event: any) {
    event.cancel = true;
    const selectedRow = event.data;
    const { ID } = selectedRow;

    this.dataservice.removeVatclass(ID).subscribe(() => {
      try {
        // Your delete logic here
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        this.showVatclass();
        this.dataGrid?.instance.refresh();
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

  OnEditingStartVatReturn(event: any) {
    event.cancel = true; // Prevent the default editing behavior
    const id = event.data.ID;
    this.dataservice.select_Vatclass_Data(id).subscribe((response) => {
      this.selected_data = response;
      this.isEditVatclassPopupOpened = true;
    });
  }
  refresh() {
    this.dataGrid?.instance.refresh();
    this.showVatclass();
  }

  onPopupShown() {
    if (this.vatclassComponent) {
      this.vatclassComponent.resetForm();
    }
  }

  handleClose() {
    this.isAddVatclassPopupOpened = false;
    this.isEditVatclassPopupOpened = false;

    if (this.vatclassComponent) {
      this.vatclassComponent.resetForm(); // 🔑 clear form
    }

    this.showVatclass();
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    VatClassFormModule,
    VatClassEditModule,
    CommonModule,
    DxPopupModule,
    DxValidationGroupModule,
  ],
  providers: [],
  exports: [],
  declarations: [VatClassListComponent],
})
export class VatClassListModule {}
