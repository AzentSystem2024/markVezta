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

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  AddArticleColorPopup = false;
  UpdateArticleColorPopup = false;
  isFilterRowVisible: boolean = false;
  isFilterOpened = false;
  editingRowData: any = {};
  Datasource: any[];
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
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.get_ArticleColor_List();
    }
  }

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilterRow(),
  };

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };
  //   ngOnInit(){
  // const currentUrl = this.router.url;
  //   console.log('Current URL:', currentUrl);
  //    const menuResponse = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');
  //   console.log('Parsed ObjectData:', menuResponse);

  //   const menuGroups = menuResponse.MenuGroups || [];
  //   console.log('MenuGroups:', menuGroups);
  // const packingRights = menuGroups
  //   .flatMap(group => group.Menus)
  //   .find(menu => menu.Path === '/packing');

  // if (packingRights) {
  //   this.canAdd = packingRights.CanAdd;
  //   this.canEdit = packingRights.CanEdit;
  //   this.canDelete = packingRights.CanDelete;
  //     this.canPrint = packingRights.CanEdit;
  //   this.canView = packingRights.canView;
  //    this.canApprove = packingRights.canApprove;
  // }

  // console.log('packingRights',packingRights);
  // console.log(  this.canAdd ,  this.canEdit ,  this.canDelete );

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
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    console.log('Parsed ObjectData:', menuResponse);

    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/article-color');

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
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(sessionData, '=================session data==========');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id==============',
    );
  }

  //===================get data list========================
  get_ArticleColor_List() {
    // this.isLoading = true;
    // const payload = { COMPANY_ID : this.selected_Company_id }; // Add any necessary payload data here
    this.dataservice.get_ArticleColor_Api().subscribe((res: any) => {
      if (res) {
        this.Datasource = res.Data.map((item: any, index: any) => ({
          ...item,
          SlNo: index + 1, // Assign serial number
        }));
      }
      console.log(res, 'response');
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
    console.log(Code, Color_English, Color_Arabic);

    const payload = {
      CODE: Code,
      COLOR_ENGLISH: Color_English,
      COLOR_ARABIC: Color_Arabic,
      // COMPANY_ID : this.selected_Company_id
    };

    const trimmedCode = Code?.trim().toLowerCase();
    const trimmedColorEnglish = Color_English?.trim().toLowerCase();
    const trimmedColorArabic = Color_Arabic?.trim().toLowerCase();

    let isCodeDuplicate = false;
    let isColorEnglishDuplicate = false;
    let isColorArabicDuplicate = false;

    this.Datasource?.forEach((data: any) => {
      const dataCode = data.CODE?.trim().toLowerCase();
      const dataColorEnglish = data.COLOR_ENGLISH?.trim().toLowerCase();
      const dataColorArabic = data.COLOR_ARABIC?.trim().toLowerCase();

      if (dataCode === trimmedCode) {
        isCodeDuplicate = true;
      }

      if (dataColorEnglish === trimmedColorEnglish) {
        isColorEnglishDuplicate = true;
      }

      if (dataColorArabic === trimmedColorArabic) {
        isColorArabicDuplicate = true;
      }
    });

    // Show appropriate message
    if (isCodeDuplicate || isColorEnglishDuplicate || isColorArabicDuplicate) {
      let message = '';

      if (
        isCodeDuplicate &&
        isColorEnglishDuplicate &&
        isColorArabicDuplicate
      ) {
        message = 'Code, Color English, and Color Arabic already exist';
      } else if (isCodeDuplicate && isColorEnglishDuplicate) {
        message = 'Code and Color English already exist';
      } else if (isCodeDuplicate && isColorArabicDuplicate) {
        message = 'Code and Color Arabic already exist';
      } else if (isColorEnglishDuplicate && isColorArabicDuplicate) {
        message = 'Color English and Color Arabic already exist';
      } else if (isCodeDuplicate) {
        message = 'Code already exists';
      } else if (isColorEnglishDuplicate) {
        message = 'Color English already exists';
      } else if (isColorArabicDuplicate) {
        message = 'Color Arabic already exists';
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

    if (Code && Color_English && Color_Arabic) {
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
      console.log(response, 'select Api');
      this.selectedData = response;
    });
  }
  editData() {
    const validationResult = this.formValidationGroup?.instance?.validate();
    const Id = this.editingRowData.ID;
    const Code = this.editingRowData.CODE;
    const Color_English = this.editingRowData.COLOR_ENGLISH;
    const Color_Arabic = this.editingRowData.COLOR_ARABIC;
    // const COMPANY_ID = this.selected_Company_id
    console.log(Code, Color_English, Color_Arabic);

    const trimmedCode = Code?.trim().toLowerCase();
    const trimmedColorEnglish = Color_English?.trim().toLowerCase();
    const trimmedColorArabic = Color_Arabic?.trim().toLowerCase();

    let isCodeDuplicate = false;
    let isColorEnglishDuplicate = false;
    let isColorArabicDuplicate = false;

    this.Datasource?.forEach((data: any) => {
      // Skip current record by ID
      if (data.ID === Id) return;

      const dataCode = data.CODE?.trim().toLowerCase();
      const dataColorEnglish = data.COLOR_ENGLISH?.trim().toLowerCase();
      const dataColorArabic = data.COLOR_ARABIC?.trim().toLowerCase();

      if (dataCode === trimmedCode) {
        isCodeDuplicate = true;
      }

      if (dataColorEnglish === trimmedColorEnglish) {
        isColorEnglishDuplicate = true;
      }

      if (dataColorArabic === trimmedColorArabic) {
        isColorArabicDuplicate = true;
      }
    });

    // Show appropriate message
    if (isCodeDuplicate || isColorEnglishDuplicate || isColorArabicDuplicate) {
      let message = '';

      if (
        isCodeDuplicate &&
        isColorEnglishDuplicate &&
        isColorArabicDuplicate
      ) {
        message = 'Code, Color English, and Color Arabic already exist';
      } else if (isCodeDuplicate && isColorEnglishDuplicate) {
        message = 'Code and Color English already exist';
      } else if (isCodeDuplicate && isColorArabicDuplicate) {
        message = 'Code and Color Arabic already exist';
      } else if (isColorEnglishDuplicate && isColorArabicDuplicate) {
        message = 'Color English and Color Arabic already exist';
      } else if (isCodeDuplicate) {
        message = 'Code already exists';
      } else if (isColorEnglishDuplicate) {
        message = 'Color English already exists';
      } else if (isColorArabicDuplicate) {
        message = 'Color Arabic already exists';
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

    if (Code && Color_English && Color_Arabic) {
      this.dataservice
        .Update_ArticleColor_Api(Id, Code, Color_English, Color_Arabic)
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
          this.get_ArticleColor_List();
          this.UpdateArticleColorPopup = false;
        });
    }
  }

  delete_Data(event: any) {
    const Id = event.data.ID;
    this.dataservice.Delete_ArticleColor_Api(Id).subscribe((response: any) => {
      notify(
        {
          message: 'Data succesfully deleted',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success',
      );
      console.log(response, 'deleted');
    });
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
