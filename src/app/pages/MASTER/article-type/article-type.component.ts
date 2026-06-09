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
  DxFormModule,
  DxPopupModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { DepartmentFormModule } from 'src/app/components/library/department-form/department-form.component';
import { DataService } from 'src/app/services';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-article-type',
  templateUrl: './article-type.component.html',
  styleUrls: ['./article-type.component.scss'],
})
export class ArticleTypeComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('formValidationGroup')
  formValidationGroup: DxValidationGroupComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  Datasource: DataSource;
  articleTypeList: any[] = [];
  articleTypeRowCount = 0;
  showFilterRow: boolean = true;
  currentFilter: string = 'auto';
  AddArticleTypePopup = false;
  UpdateArticleTypePopup = false;
  isFilterRowVisible: boolean = false;
  isFilterOpened = false;
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
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {
    this.formsource = this.fb.group({
      Description: ['', Validators.required],
    });
    this.sesstion_Details();
    this.get_ArticleType_List();
  }
  refresh = () => {
    this.dataGrid.instance.refresh();
  };

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  //=================================refresh=============================
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilterRow(),
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.get_ArticleType_List();
    }
  }

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addArticleType());
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

  //         addButtonOptions = {
  //     text: 'New',
  //     icon: 'bi bi-file-earmark-plus',
  //     type: 'default',
  //     stylingMode: 'contained',
  //     hint: 'Add new entry',

  //     onClick: () => {
  //       // Run inside Angular's zone
  //       this.ngZone.run(() => this.addArticleType());
  //     },

  //     elementAttr: { class: 'add-button' },
  //   };

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/article-type');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
  }

  onEditingStart(event: any) {
    event.cancel = true;
    this.editingRowData = { ...event.data }; // Store the selected row data
    this.UpdateArticleTypePopup = true;

    this.Select_ArticleType(event);
  }

  closePop() {}

  addArticleType() {
    this.AddArticleTypePopup = true;
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
  }
  editArticleType() {
    this.UpdateArticleTypePopup = true;
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }
  //===================get data list========================
  get_ArticleType_List() {
    this.Datasource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.get_ArticleType_Api().subscribe({
            next: (res: any) => {
              const data = (res?.Data || []).map(
                (item: any, index: number) => ({
                  ...item,
                  SlNo: index + 1,
                }),
              );

              this.articleTypeList = data; // ✅ array logic
              this.articleTypeRowCount = data.length;

              resolve(data); // 🔑 grid loader stops
            },
            error: () => {
              this.articleTypeList = [];
              this.articleTypeRowCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  addData() {
    const validationResult = this.formValidationGroup?.instance?.validate();
    const Description = this.formsource.get('Description')?.value;

    const payload = {
      DESCRIPTION: Description,
      // COMPANY_ID : this.selected_Company_id
    };

    // Optional: Check for duplicate login name
    const isDuplicate = this.articleTypeList?.some((data: any) => {
      return (
        data.DESCRIPTION?.trim().toLowerCase() === Description.toLowerCase()
      );
    });

    if (isDuplicate) {
      notify(
        {
          message: 'Article Type already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    }

    if (Description) {
      this.dataservice.Insert_ArticleType_Api(payload).subscribe((res: any) => {
        notify(
          {
            message: 'Data succesfully added',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
        this.AddArticleTypePopup = false;
        this.formsource.reset();
        this.get_ArticleType_List();
        this.UpdateArticleTypePopup = false;
      });
    }
  }

  //============select data========================
  Select_ArticleType(event: any) {
    const ID = event.data.ID;

    this.dataservice.Select_ArticleType_Api(ID).subscribe((response: any) => {
      this.selectedData = response;
    });
  }

  editData() {
    const validationResult = this.formValidationGroup?.instance?.validate();
    const Id = this.editingRowData.ID;
    const Description = this.editingRowData.DESCRIPTION;
    // const COMPANY_ID = this.selected_Company_id;

    // Optional: Check for duplicate login name
    const isDuplicate = this.articleTypeList?.some((data: any) => {
      return (
        data.DESCRIPTION?.trim().toLowerCase() === Description.toLowerCase() &&
        data.ID !== Id
      );
    });

    if (isDuplicate) {
      notify(
        {
          message: 'Article Type already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    }

    if (Description) {
      this.dataservice
        .Update_ArticleType_Api(Id, Description)
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
          this.get_ArticleType_List();
          this.UpdateArticleTypePopup = false;
        });
    }
  }

  delete_Data(event: any) {
    event.cancel = true;

    const Id = event.data.ID;

    this.dataservice.Delete_ArticleType_Api(Id).subscribe(
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

        this.get_ArticleType_List();

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
    const fileName = 'article_type';
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
  declarations: [ArticleTypeComponent],
})
export class ArticleTypeModule {}
