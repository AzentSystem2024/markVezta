import {
  Component,
  OnInit,
  NgModule,
  ViewChild,
  NgZone,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxPopupModule,
  DxTextAreaModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import {
  UomAddFormModule,
  UomAddFormComponent,
} from 'src/app/components/library/uom-add-form/uom-add-form.component';
import { DataService } from 'src/app/services';
import { UomEditModule } from '../../uom-edit/uom-edit.component';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-uom-list',
  templateUrl: './uom-list.component.html',
  styleUrls: ['./uom-list.component.scss'],
})
export class UomListComponent implements OnInit {
  @ViewChild(UomAddFormComponent) UomAddFormComponent: UomAddFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @Output() formClosed = new EventEmitter<void>();
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  uom: any;
  UomDataSource: DataSource;
  uomArray: any[] = [];
  uomCount = 0;
  isAddUomPopupOpened = false;
  isEditUomPopupOpened = false;
  showHeaderFilter = true;
  selectedData: any;
  selected_Company_id: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  constructor(
    private dataservice: DataService,
    private ngZone: NgZone,
    private router: Router,
  ) {}

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addUom());
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
    onClick: () => this.toggleFilters(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  addUom() {
    this.isAddUomPopupOpened = true;
  }

  onEditingRow(event: any) {
    event.cancel = true;
    this.isEditUomPopupOpened = true;
    this.selectedData = event.data;
    this.selectUom(event);
  }

  selectUom(event: any) {
    const id = event.data.ID;
    this.dataservice.SelectUom(id).subscribe((res: any) => {
      this.selectedData = res;
    });
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

    this.sesstion_Details();
    this.listUom();
  }

  CloseEditForm() {
    //  this.isEditPopupOpened = false;
    this.isAddUomPopupOpened = false;
    this.isEditUomPopupOpened = false;
    this.sesstion_Details();
    this.listUom();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
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
      this.listUom();
    }
  }

  listUom() {
    const payload = {
      // COMPANY_ID: this.selected_Company_id,
    };

    this.UomDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getUomList(payload).subscribe({
            next: (data: any[]) => {
              const list = data || [];

              this.uomArray = list; // local cache
              this.uomCount = list.length;

              resolve(list); // 🔑 stops grid loader
            },
            error: () => {
              this.uomArray = [];
              this.uomCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  onRowRemoving(event: any) {
    const { ID, UOM } = event.data;

    event.cancel = new Promise((resolve, reject) => {
      this.dataservice.removeUom(ID, UOM).subscribe({
        next: () => {
          notify(
            {
              message: 'Delete operation successful',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );

          this.listUom(); // reload data

          resolve(true); // ✅ closes popup + syncs grid
        },
        error: () => {
          notify(
            {
              message: 'Delete operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );

          reject(); // prevents deletion
        },
      });
    });
  }

  // onRowUpdating(event){
  //   const updatedData = {...event.oldData,...event.newData};
  //   const{ID,UOM COMPANY_ID}=updatedData;
  //   this.dataservice.updateUom(ID,UOM,COMPANY_ID).subscribe((data) => {
  //     try{
  //       notify({
  //         message : "UOM updated successfully",
  //         position: { at: 'top right', my: 'top right' },
  //       },
  //       'success'
  //     )
  //     this.dataGrid.instance.refresh();
  //     this.listUom();
  //     }
  //     catch(error){
  //       notify({
  //         message: "Edit operation failed",
  //         position: { at: 'top right', my: 'top right' },
  //       },
  //       'error'
  //     )
  //     }
  //   })
  // }

  onClickSaveUom() {
    const { UOM } = this.UomAddFormComponent.getNewUomData();
    const payload = {
      UOM: UOM, // ✅ lowercase
      COMPANY_ID: this.selected_Company_id,
    };
    //  DUPLICATION CHECK (case-insensitive)
    const isDuplicate = this.uomArray?.some(
      (item: any) =>
        item.UOM?.trim().toLowerCase() === UOM?.trim().toLowerCase(),
    );

    if (isDuplicate) {
      notify(
        {
          message: 'UOM already exists',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
      );
      return; //  STOP INSERT
    }

    this.dataservice.postUOM(payload).subscribe((data) => {
      if (data) {
        try {
          notify(
            {
              message: 'UOM inserted successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.formClosed.emit();
          this.isAddUomPopupOpened = false;
          this.listUom();
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

  onExporting(event: any) {
    const fileName = 'uom-list';
    this.dataservice.exportDataGrid(event, fileName);
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    UomAddFormModule,
    DxCheckBoxModule,
    DxTextAreaModule,
    DxTextBoxModule,
    UomEditModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [UomListComponent],
})
export class UomListModule {}
