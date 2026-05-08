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
import { DxButtonModule, DxPopupModule } from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';
import { CommonModule } from '@angular/common';
import DataSource from 'devextreme/data/data_source';
import {
  VatCalssFinanceFormComponent,
  VatCalssFinanceFormModule,
} from '../POPUP PAGES/vat-calss-finance-form/vat-calss-finance-form.component';
import { VatCalssFinanceEditModule } from '../POPUP PAGES/vat-calss-finance-edit/vat-calss-finance-edit.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vat-class-finance',
  templateUrl: './vat-class-finance.component.html',
  styleUrls: ['./vat-class-finance.component.scss'],
})
export class VatClassFinanceComponent implements OnInit {
  @ViewChild(VatCalssFinanceFormComponent) vatclassComponent:
    | VatCalssFinanceFormComponent
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
  select_Data: Object | undefined;
  isEditVatclassPopupOpened: boolean | undefined;
  selected_data: Object | undefined;
  selected_vat_id: any;
  sessionData: any;
  selected_Company_id: any;
  HSN_CODE: any;
  companyID: any;
  companyStateID: any;
  GST_PERC: any;
  poData: any;

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

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilterRow(),
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

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  onExporting(event: any) {
    this.exportService.onExporting(event, 'VAT_class-list');
  }
  addVatclass() {
    this.isAddVatclassPopupOpened = true;
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
    this.showVatclass();
  }

  sessionDetails() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;
    this.companyID = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.companyStateID = sessionData.SELECTED_COMPANY.STATE_ID;
    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;
    this.selected_Company_id = this.companyID;
    // this.selected_Company_id = 0;
    this.poData = {
      COMPANY_ID: this.companyID,
      USER_ID: sessionData.USER_ID,
    };
  }

  showVatclass() {
    const payload = {
      COMPANY_ID: this.companyID,
    };

    this.VatClassDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getVatclassData(payload).subscribe({
            next: (response: any[]) => {
              const list = response || [];

              this.vatClassArray = list; // 🔑 cache for logic
              this.vatClassCount = list.length;

              resolve(list); // 🔑 stops grid loader
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
    const data = this.vatclassComponent?.getNewVatclassData();
    if (data) {
      const {
        CODE,
        VAT_NAME,
        VAT_PERC,
        IGST_INPUT_HEAD_ID,
        IGST_OUTPUT_HEAD_ID,
      } = data;
      this.dataservice
        .postVatclassData_Finance(
          CODE,
          VAT_NAME,
          VAT_PERC,
          IGST_INPUT_HEAD_ID,
          IGST_OUTPUT_HEAD_ID,
          this.selected_Company_id,
        )
        .subscribe((response) => {
          if (response) {
            this.formClosed.emit();
            this.isAddVatclassPopupOpened = false;
            this.showVatclass();
          }
        });
    }
  }

  onRowRemoving(event: any) {
    const { ID } = event.data;

    event.cancel = new Promise((resolve, reject) => {
      this.dataservice.removeVatclass(ID).subscribe({
        next: () => {
          notify(
            {
              message: 'Delete operation successful',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );

          this.showVatclass(); // reload data

          resolve(true); // ✅ closes popup + keeps grid in sync
        },
        error: () => {
          notify(
            {
              message: 'Delete operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );

          reject(); // ❌ prevents deletion
        },
      });
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
    this.showVatclass();
  }

  handleClose() {
    this.isAddVatclassPopupOpened = false;
    this.isEditVatclassPopupOpened = false;
    if (this.vatclassComponent) {
      this.vatclassComponent.formVatclassData = {
        CODE: '',
        VAT_NAME: '',
        VAT_PERC: '',
        IGST_INPUT_HEAD_ID: '',
        IGST_OUTPUT_HEAD_ID: '',
      };
    }
    this.dataGrid?.instance.refresh();
    this.showVatclass();
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    VatCalssFinanceFormModule,
    VatCalssFinanceEditModule,
    CommonModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [VatClassFinanceComponent],
})
export class VatClassFinanceModule { }
