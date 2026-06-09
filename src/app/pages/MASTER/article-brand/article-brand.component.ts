import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxPopupModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { DepartmentFormModule } from 'src/app/components/library/department-form/department-form.component';
import { DataService } from 'src/app/services';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-article-brand',
  templateUrl: './article-brand.component.html',
  styleUrls: ['./article-brand.component.scss'],
})
export class ArticleBrandComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('formValidationGroup')
  formValidationGroup: DxValidationGroupComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  Datasource: DataSource; // for grid + loader
  articleBrandList: any[] = []; // for forEach / validation
  articleBrandRowCount = 0; // for UI conditions
  isFilterRowVisible: boolean = false;
  isFilterOpened = false;
  showFilterRow: boolean = true;
  currentFilter: string = 'auto';
  AddArticleBrandPopup = false;
  IS_INACTIVE: boolean = false;
  UpdateArticleBrandPopup = false;
  editingRowData: any = {};
  formsource: any;
  selectedData: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  selected_Company_id: any;

  constructor(
    private fb: FormBuilder,
    private dataservice: DataService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
    this.formsource = this.fb.group({
      Code: ['', Validators.required],
      Description: ['', Validators.required],
      Inactive: [false],
    });
    this.sesstion_Details();
    this.get_ArticleBrand_List();
  }

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addArticleBrand());
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
  //=================================refresh=============================
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.get_ArticleBrand_List();
    }
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/article-brand');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
  }

  statusCellTemplate = (cellElement: any, cellInfo: any) => {
    const status = cellInfo.value; // Get the value from `calculateCellValue`

    // Determine background color and display text based on the status
    const color = status === 'Inactive' ? 'red' : 'green';
    const text = status; // Use the calculated value ("Inactive" or "Active")

    // Apply the dynamic styles and content
    cellElement.innerHTML = `
      <span style="
        background-color: ${color};
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

  onEditingStart(event: any) {
    event.cancel = true;
    this.editingRowData = { ...event.data }; // Store the selected row data
    this.UpdateArticleBrandPopup = true;

    this.Select_ArticleBrand(event);
  }

  addArticleBrand() {
    this.AddArticleBrandPopup = true;
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
  }
  editArticleBrand() {
    this.UpdateArticleBrandPopup = true;
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }
  //===================get data list========================
  get_ArticleBrand_List() {
    this.Datasource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.get_ArticleBrand_Api().subscribe({
            next: (res: any) => {
              const data = (res?.Data || []).map(
                (item: any, index: number) => ({
                  ...item,
                  SlNo: index + 1,
                }),
              );

              this.articleBrandList = data; // ✅ array logic
              this.articleBrandRowCount = data.length;

              resolve(data); // 🔑 grid loader stops
            },
            error: () => {
              this.articleBrandList = [];
              this.articleBrandRowCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  addData() {
    const validationResult = this.formValidationGroup?.instance?.validate();
    const Code = this.formsource.get('Code')?.value;
    const Description = this.formsource.get('Description')?.value;
    // const Is_Inactive = this.formsource.get('Inactive')?.value;
    const Is_Inactive = false;

    const payload = {
      CODE: Code,
      DESCRIPTION: Description,
      IS_INACTIVE: Is_Inactive,
    };

    // Optional: Check for duplicate login name
    const trimmedCode = Code.trim().toLowerCase();
    const trimmedDescription = Description.trim().toLowerCase();

    let isCodeDuplicate = false;
    let isDescriptionDuplicate = false;

    this.articleBrandList?.forEach((data: any) => {
      const dataCode = data.CODE?.trim().toLowerCase();
      const dataDescription = data.DESCRIPTION?.trim().toLowerCase();

      if (dataCode === trimmedCode) {
        isCodeDuplicate = true;
      }

      if (dataDescription === trimmedDescription) {
        isDescriptionDuplicate = true;
      }
    });

    // Show appropriate message
    if (isCodeDuplicate || isDescriptionDuplicate) {
      let message = '';

      if (isCodeDuplicate && isDescriptionDuplicate) {
        message = 'Code and Article Brand already exist';
      } else if (isCodeDuplicate) {
        message = 'Code already exists';
      } else if (isDescriptionDuplicate) {
        message = 'Article Brand already exists';
      }

      notify(
        {
          message,
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );

      return;
    }

    if (Code && Description) {
      this.dataservice
        .Insert_ArticleBrand_Api(payload)
        .subscribe((res: any) => {
          notify(
            {
              message: 'Data succesfully added',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.AddArticleBrandPopup = false;
          this.formsource.reset();
          this.get_ArticleBrand_List();
          this.UpdateArticleBrandPopup = false;
        });
    }
  }

  //============select data========================
  Select_ArticleBrand(event: any) {
    const ID = event.data.ID;

    this.dataservice.Select_ArticleBrand_Api(ID).subscribe((response: any) => {
      this.selectedData = response;
    });
  }
  editData() {
    const validationResult = this.formValidationGroup?.instance?.validate();
    const Id = this.editingRowData.ID;
    const Code = this.editingRowData.CODE;
    const Description = this.editingRowData.DESCRIPTION;
    const Is_Inactive = this.editingRowData.IS_INACTIVE;

    // Optional: Check for duplicate code or description (excluding current ID)
    const trimmedCode = Code.trim().toLowerCase();
    const trimmedDescription = Description.trim().toLowerCase();

    let isCodeDuplicate = false;
    let isDescriptionDuplicate = false;

    this.articleBrandList?.forEach((data: any) => {
      const dataId = data.ID;
      const dataCode = data.CODE?.trim().toLowerCase();
      const dataDescription = data.DESCRIPTION?.trim().toLowerCase();

      // Skip checking against the same ID (useful in edit mode)
      if (dataId === Id) {
        return;
      }

      if (dataCode === trimmedCode) {
        isCodeDuplicate = true;
      }

      if (dataDescription === trimmedDescription) {
        isDescriptionDuplicate = true;
      }
    });

    // Show appropriate message
    if (isCodeDuplicate || isDescriptionDuplicate) {
      let message = '';

      if (isCodeDuplicate && isDescriptionDuplicate) {
        message = 'Code and Article Brand already exist';
      } else if (isCodeDuplicate) {
        message = 'Code already exists';
      } else if (isDescriptionDuplicate) {
        message = 'Article Brand already exists';
      }

      notify(
        {
          message,
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );

      return;
    }

    if (Code && Description) {
      this.dataservice
        .Update_ArticleBrand_Api(Id, Code, Description, Is_Inactive)
        .subscribe((res: any) => {
          notify(
            {
              message: 'Data succesfully updated',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );

          this.formsource.reset();
          this.get_ArticleBrand_List();
          this.UpdateArticleBrandPopup = false;
        });
    }
  }
  delete_Data(event: any) {
    event.cancel = true;

    const Id = event.data.ID;

    this.dataservice.Delete_ArticleBrand_Api(Id).subscribe(
      (response: any) => {
        notify(
          {
            message: 'Data succesfully deleted',
            position: {
              at: 'top right',
              my: 'top right',
            },
            displayTime: 500,
          },
          'success',
        );

        this.get_ArticleBrand_List();

        this.dataGrid?.instance?.refresh();
      },
      (error) => {
        notify(
          {
            message: 'Delete failed',
            position: {
              at: 'top right',
              my: 'top right',
            },
            displayTime: 500,
          },
          'error',
        );
      },
    );
  }

  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'article_brand';
    this.dataservice.exportDataGrid(event, fileName);
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DepartmentFormModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxValidatorModule,
    DxValidationGroupModule,
  ],
  providers: [],
  exports: [],
  declarations: [ArticleBrandComponent],
})
export class ArticleBrandModule {}
