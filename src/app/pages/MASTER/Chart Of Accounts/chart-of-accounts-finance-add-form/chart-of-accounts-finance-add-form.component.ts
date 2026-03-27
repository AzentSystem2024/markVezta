import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxFileUploaderModule,
  DxDataGridModule,
  DxButtonModule,
  DxValidatorModule,
  DxProgressBarModule,
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxDataGridComponent,
  DxBoxModule,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-chart-of-accounts-finance-add-form',
  templateUrl: './chart-of-accounts-finance-add-form.component.html',
  styleUrls: ['./chart-of-accounts-finance-add-form.component.scss'],
})
export class ChartOfAccountsFinanceAddFormComponent implements OnInit {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() payroll: any;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  popupVisible = false;
  subGroupPopup = false;
  categoryPopup = false;
  // In your component.ts
  formData = {
    mainGroup: '',
    subField: '',
  };
  groupingList: any;
  mainGroupList: any[] = [];
  selectedMainGroup: number | null = null;
  selectedMainGroupId: any;
  selectedSubGroup: number | null = null;
  selectedSubGroupId: any;
  subGroupList: any;
  categoryList: any;
  selectedCategory: number | null = null;
  selectedCategoryId: any;
  accountHeadData: any = {
    HEAD_NAME: '',
    GROUP_ID: '',
    IS_DIRECT: true,
    IS_SYS_HEAD: true,
    ARABIC_NAME: '',
    IS_ACTIVE: true,
    SERIAL_NO: 0,
  };

  accountGroupData: any = {
    GROUP_ID: '',
    GROUP_NAME: '',
    GROUP_SUPER_ID: '',
    GROUP_TYPE: '',
    IS_SYSTEM_GROUP: true,
    ARABIC_NAME: '',
    GROUP_ORDER: '',
    GROUP_LEVEL: '',
  };
  accountsGroupList: any;
  ledgerList: any;
  isSaving = false;

  selectedCostTypeId: number | null = null;

  costTypeList: any;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getGroupingList();
    this.getAccountHeadList();
    this.getCostType_DropDown();
  }

  getGroupingList() {
    this.dataService.getGroupingList().subscribe((response: any) => {
      if (response?.flag === 1 && Array.isArray(response.Data)) {
        this.groupingList = response.Data;
        this.mainGroupList = this.groupingList.filter(
          (item) => item.GROUP_SUPER_ID === 0,
        );
      }
    });
  }

  onMainGroupChange(event: any) {
    this.selectedMainGroupId = event.value;
    this.subGroupList = this.groupingList.filter(
      (item) => item.GROUP_SUPER_ID === this.selectedMainGroupId,
    );
  }

  get selectedMainGroupName(): string {
    const selectedGroup = this.mainGroupList.find(
      (item) => item.GROUP_ID === this.selectedMainGroupId,
    );
    return selectedGroup ? selectedGroup.GROUP_NAME : '';
  }

  get selectedSubGroupName(): string {
    const selected = this.subGroupList?.find(
      (item) => item.GROUP_ID === this.selectedSubGroupId,
    );
    return selected ? selected.GROUP_NAME : '';
  }

  onSubGroupChange(event: any) {
    this.selectedSubGroupId = event.value;
    this.categoryList = this.groupingList.filter(
      (item) => item.GROUP_SUPER_ID === this.selectedSubGroupId,
    );
  }

  onCategoryChange(event: any) {
    this.selectedCategoryId = event.value;
  }

  getAccountHeadList() {
    this.dataService.getAccountHeadList().subscribe((response: any) => {
      this.ledgerList = response.Data;
    });
  }

  getCostType_DropDown() {
    this.dataService
      .getCostBucketDropdownData('COST_TYPE')
      .subscribe((data: any) => {
        this.costTypeList = data;
      });
  }

  saveAccountHead() {
    if (
      !this.accountHeadData.HEAD_NAME ||
      !this.accountHeadData.HEAD_NAME.trim()
    ) {
      notify(
        {
          message: 'Please enter Account Head Name',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return;
    }

    if (!this.selectedCategoryId) {
      notify(
        {
          message: 'Please select a Category before adding Account Head',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return;
    }

    if (
      this.accountHeadData.SERIAL_NO == null ||
      this.accountHeadData.SERIAL_NO === ''
    ) {
      notify(
        {
          message: 'Please enter Serial Number',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return;
    }

    // (Optional) Duplicate check
    const duplicate = this.ledgerList?.some(
      (h) =>
        h.HEAD_NAME?.toLowerCase() ===
        this.accountHeadData.HEAD_NAME?.trim().toLowerCase(),
    );
    if (duplicate) {
      notify(
        {
          message: 'Account Head already exists',
          position: { at: 'top center', my: 'top center' },
        },
        'warning',
      );
      return;
    }
    const payload = {
      HEAD_NAME: this.accountHeadData.HEAD_NAME,
      GROUP_ID: this.selectedCategoryId,
      IS_DIRECT: this.accountHeadData.IS_DIRECT,
      IS_SYS_HEAD: this.accountHeadData.IS_SYS_HEAD,
      ARABIC_NAME: this.accountHeadData.ARABIC_NAME,
      IS_ACTIVE: this.accountHeadData.IS_ACTIVE,
      SERIAL_NO: this.accountHeadData.SERIAL_NO,
      CostTypeID: this.selectedCostTypeId || 0, // ✅ optional
    };
    this.isSaving = true;
    this.dataService.insertAccountHead(payload).subscribe({
      next: (response) => {
        this.isSaving = false;
        notify(
          {
            message: 'Account Head Saved Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        this.popupVisible = false;
        this.popupClosed.emit(); // notify parent to refresh & close
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Insert failed:', error);
        notify('Failed to add Account Head', 'error', 3000);
      },
    });
  }

  saveAccountGroup() {
    const isSubGroup = this.subGroupPopup;
    const isCategory = this.categoryPopup;

    if (
      !this.accountGroupData.GROUP_NAME ||
      !this.accountGroupData.GROUP_NAME.trim()
    ) {
      notify(
        {
          message: 'Please enter Group Name',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return;
    }

    if (isCategory && !this.selectedSubGroupId) {
      notify(
        {
          message: 'Please select a Sub Group before adding Category',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return;
    }

    if (isSubGroup && !this.selectedMainGroupId) {
      notify(
        {
          message: 'Please select a Main Group before adding Sub Group',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return;
    }

    const groupLevel = isSubGroup ? 2 : isCategory ? 3 : 1;
    const groupSuperId = isSubGroup
      ? this.selectedMainGroupId
      : isCategory
        ? this.selectedSubGroupId
        : 0;

    const payload = {
      GROUP_ID: 0,
      GROUP_NAME: this.accountGroupData.GROUP_NAME,
      GROUP_SUPER_ID: groupSuperId,
      GROUP_TYPE: 0,
      IS_SYSTEM_GROUP: this.accountGroupData.IS_SYSTEM_GROUP,
      ARABIC_NAME: this.accountHeadData.ARABIC_NAME,
      GROUP_ORDER: 0,
      GROUP_LEVEL: groupLevel,
    };

    this.dataService.insertAccountGroup(payload).subscribe((response: any) => {
      const newGroupId = response?.Data?.GROUP_ID;
      if (!newGroupId) return;

      notify(
        {
          message: 'Account Group Added Successfully',
          position: { at: 'top center', my: 'top center' },
        },
        'success',
      );

      // Reset input
      this.accountGroupData.GROUP_NAME = '';

      // Refresh data and update UI
      this.dataService.getGroupingList().subscribe((res: any) => {
        if (res?.flag === 1 && Array.isArray(res.Data)) {
          this.groupingList = res.Data;

          if (isSubGroup) {
            this.subGroupList = this.groupingList.filter(
              (item) => item.GROUP_SUPER_ID === this.selectedMainGroupId,
            );
            setTimeout(() => {
              this.selectedSubGroup = newGroupId;
              this.selectedSubGroupId = newGroupId;
              this.accountHeadData.SubGroupId = newGroupId;
            });
            // this.selectedSubGroup = newGroupId;
            // this.selectedSubGroupId = newGroupId;
            // this.accountHeadData.SubGroupId = newGroupId;
          }

          if (isCategory) {
            this.categoryList = this.groupingList.filter(
              (item) => item.GROUP_SUPER_ID === this.selectedSubGroupId,
            );
            this.selectedCategoryId = newGroupId;
          }

          // Close popups AFTER updating
          this.subGroupPopup = false;
          this.categoryPopup = false;
        }
      });
    });
  }

  openPopup() {
    this.popupVisible = true;
  }

  onAddSubField() {
    this.subGroupPopup = true;
  }

  onAddCategory() {
    this.categoryPopup = true;
  }

  handleClose() {
    this.popupVisible = false;
    this.popupClosed.emit(); // notify parent if needed
  }

  closePopup() {
    this.popupClosed.emit();
  }
}

@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
    DxBoxModule,
  ],
  providers: [],
  declarations: [ChartOfAccountsFinanceAddFormComponent],
  exports: [ChartOfAccountsFinanceAddFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChartOfAccountsFinanceAddFormModule {}
