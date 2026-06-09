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
  selector: 'app-article-color',
  templateUrl: './article-color.component.html',
  styleUrls: ['./article-color.component.scss'],
})
export class ArticleColorComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('formValidationGroup')
  formValidationGroup: DxValidationGroupComponent;
  @ViewChild('updateValidationGroup')
  updateValidationGroup: DxValidationGroupComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  AddArticleColorPopup = false;
  UpdateArticleColorPopup = false;
  isFilterRowVisible: boolean = false;
  isFilterOpened = false;
  editingRowData: any = {};
  Datasource: DataSource;
  showFilterRow: boolean = true;
  currentFilter: string = 'auto';
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  formsource: any;
  selectedData: any;
  selected_Company_id: any;
  articleColorList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dataservice: DataService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
    this.formsource = this.fb.group({
      Code: ['', Validators.required],
      ColorEnglish: ['', Validators.required],
      ColorArabic: ['', Validators.required],
    });

    this.sesstion_Details();
    this.get_ArticleColor_List();
  }
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addArticleColor());
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

  //=================================refresh=============================
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };
  refreshGrid() {
    this.get_ArticleColor_List();
  }

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilterRow(),
  };

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };
  //   ngOnInit(){
  // const currentUrl = this.router.url;
  //
  //    const menuResponse = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');

  //   const menuGroups = menuResponse.MenuGroups || [];
  //
  // const packingRights = menuGroups
  //   .flatMap(group => group.Menus)
  //   .find(menu => menu.Path === '/packing');

  // if (packingRights) {
  //   this.canAdd = packingRights.CanAdd;
  //   this.canEdit = packingRights.CanEdit;
  //   this.canDelete = packingRights.CanDelete;
  //     this.canPrint = packingRights.CanPrint;
  //   this.canView = packingRights.canView;
  //    this.canApprove=packingRights.CanApprove;
  // }

  //   }

  addArticleColor() {
    this.AddArticleColorPopup = true;
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
  }
  editArticleColor() {
    this.UpdateArticleColorPopup = true;
  }

  getSerialNumber = (rowIndex: number) => {
    return rowIndex + 1;
  };

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === '/article-color');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  //===================get data list========================
  get_ArticleColor_List() {
    this.Datasource = new DataSource({
      load: () =>
        new Promise((resolve, reject) => {
          this.dataservice.get_ArticleColor_Api().subscribe({
            next: (res: any) => {
              const data = (res?.Data || []).map(
                (item: any, index: number) => ({
                  ...item,
                  SlNo: index + 1,
                }),
              );

              this.articleColorList = data;

              // this.articleColorRowCount = data.length; // ✅ store count
              resolve(data); // 🔑 grid loader stops here
            },
            error: (err) => {
              console.error(err);
              this.articleColorList = [];
              // this.articleColorRowCount = 0;
              resolve([]); // 🔑 always resolve
            },
          });
        }),
    });
  }

  onEditingStart(event: any) {
    event.cancel = true;
    this.editingRowData = { ...event.data }; // Store the selected row data
    this.UpdateArticleColorPopup = true;

    this.Select_ArticleColor(event);
  }

  addData() {
    const validationResult = this.formValidationGroup?.instance?.validate();
    const Code = this.formsource.get('Code')?.value;
    const Color_English = this.formsource.get('ColorEnglish')?.value;
    const Color_Arabic = this.formsource.get('ColorArabic')?.value;

    const payload = {
      CODE: Code,
      COLOR_ENGLISH: Color_English,
      COLOR_ARABIC: Color_Arabic,
      // COMPANY_ID : this.selected_Company_id
    };

    const trimmedCode = Code?.trim().toLowerCase();
    const trimmedColorEnglish = Color_English?.trim().toLowerCase();
    // const trimmedColorArabic = Color_Arabic?.trim().toLowerCase();

    let isCodeDuplicate = false;
    let isColorEnglishDuplicate = false;
    let isColorArabicDuplicate = false;

    this.articleColorList?.forEach((data: any) => {
      const dataCode = data.CODE?.trim().toLowerCase();
      const dataColorEnglish = data.COLOR_ENGLISH?.trim().toLowerCase();
      // const dataColorArabic = data.COLOR_ARABIC?.trim().toLowerCase();

      if (dataCode === trimmedCode) {
        isCodeDuplicate = true;
      }

      if (dataColorEnglish === trimmedColorEnglish) {
        isColorEnglishDuplicate = true;
      }

      // if (dataColorArabic === trimmedColorArabic) {
      //   isColorArabicDuplicate = true;
      // }
    });

    // Show appropriate message
    if (isCodeDuplicate || isColorEnglishDuplicate) {
      let message = '';

      if (isCodeDuplicate && isColorEnglishDuplicate) {
        message = 'Code, Color English, and Color Arabic already exist';
      } else if (isCodeDuplicate && isColorEnglishDuplicate) {
        message = 'Code and Color English already exist';
      }
      //  else if (isCodeDuplicate && isColorArabicDuplicate) {
      //   message = 'Code and Color Arabic already exist';
      // }
      else if (isColorEnglishDuplicate && isColorArabicDuplicate) {
        message = 'Color English and Color Arabic already exist';
      } else if (isCodeDuplicate) {
        message = 'Code already exists';
      } else if (isColorEnglishDuplicate) {
        message = 'Color English already exists';
      }
      //  else if (isColorArabicDuplicate) {
      //   message = 'Color Arabic already exists';
      // }

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

    if (Code && Color_English) {
      this.dataservice
        .Insert_ArticleColor_Api(payload)
        .subscribe((res: any) => {
          notify(
            {
              message: 'Data succesfully added',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.AddArticleColorPopup = false;
          this.formsource.reset();
          this.get_ArticleColor_List();
          this.UpdateArticleColorPopup = false;
        });
    }
  }

  //============select data========================
  Select_ArticleColor(event: any) {
    const ID = event.data.ID;

    this.dataservice.Select_ArticleColor_Api(ID).subscribe((response: any) => {
      this.selectedData = response.Data;
    });
  }

  editData() {
    const validationResult = this.updateValidationGroup?.instance?.validate();

    if (validationResult && !validationResult.isValid) {
      return;
    }

    const Id = this.editingRowData.ID;

    const Code = this.editingRowData.CODE?.trim();

    const Color_English = this.editingRowData.COLOR_ENGLISH?.trim();

    const Color_Arabic = '';
    console.log(Id, Code, Color_English, 'DATAAAAAAAAAAAAAAA');
    // Find original row
    const existingRow = this.articleColorList.find((x: any) => x.ID == Id);
    console.log(existingRow, 'existingrowwwwwwwww');
    // If values unchanged → update directly
    if (
      existingRow &&
      existingRow.CODE === Code &&
      existingRow.COLOR_ENGLISH === Color_English
    ) {
      this.dataservice
        .Update_ArticleColor_Api(Id, Code, Color_English, Color_Arabic)
        .subscribe(() => {
          notify(
            {
              message: 'Data succesfully updated',
              position: {
                at: 'top right',
                my: 'top right',
              },
              displayTime: 500,
            },
            'success',
          );

          this.UpdateArticleColorPopup = false;

          this.get_ArticleColor_List();
        });

      return;
    }

    const isCodeDuplicate = this.articleColorList.some(
      (x: any) =>
        x.ID != Id && x.CODE?.trim()?.toLowerCase() === Code?.toLowerCase(),
    );

    const isColorDuplicate = this.articleColorList.some(
      (x: any) =>
        x.ID != Id &&
        x.COLOR_ENGLISH?.trim()?.toLowerCase() === Color_English?.toLowerCase(),
    );

    if (isCodeDuplicate || isColorDuplicate) {
      notify(
        {
          message: isCodeDuplicate
            ? 'Code already exists'
            : 'Color English already exists',
          position: {
            at: 'top right',
            my: 'top right',
          },
          displayTime: 1000,
        },
        'error',
      );

      return;
    }

    this.dataservice
      .Update_ArticleColor_Api(Id, Code, Color_English, Color_Arabic)
      .subscribe(() => {
        notify(
          {
            message: 'Data succesfully updated',
            position: {
              at: 'top right',
              my: 'top right',
            },
            displayTime: 500,
          },
          'success',
        );

        this.UpdateArticleColorPopup = false;

        this.get_ArticleColor_List();
      });
  }

  delete_Data(event: any) {
    event.cancel = true;

    const Id = event.data.ID;

    this.dataservice.Delete_ArticleColor_Api(Id).subscribe(
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

        this.get_ArticleColor_List();

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
    const fileName = 'article_color';
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
  declarations: [ArticleColorComponent],
})
export class ArticleColorModule {}
