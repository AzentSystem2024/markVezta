import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  Output,
  SimpleChanges,
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
  DxBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { AddAccountComponent } from '../add-account/add-account.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.scss'],
})
export class EditAccountComponent implements OnChanges {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() accountHeadData: any;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  popupVisible = false;
  groupingList: any;
  mainGroupList: any;
  selectedMainGroupId: any;
  subGroupList: any;
  selectedSubGroupId: any;
  categoryList: any;
  selectedCategoryId: any;
  subGroupPopup: boolean;
  categoryPopup: boolean;
  accountGroupData: any = {
    GROUP_ID: '',
    GROUP_NAME: '',
    GROUP_SUPER_ID: 1,
    GROUP_TYPE: '',
    IS_SYSTEM_GROUP: true,
    ARABIC_NAME: '',
    GROUP_ORDER: '',
    GROUP_LEVEL: 0,
  };
  mainGroupId: 1;
  subGroupId: 5;
  selectedSubGroup: number | null = null;
  category: any;
  selectedCategory: any;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getGroupingList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['accountHeadData'] && changes['accountHeadData'].currentValue) {
      console.log(
        'Received accountHeadData:',
        changes['accountHeadData'].currentValue
      );
      this.accountHeadData = {
        ...this.accountHeadData,
        ...changes['accountHeadData'].currentValue,
      };
    }
    console.log(this.accountHeadData.MainGroupId, 'MAINGROUPID');
  }

  getGroupingList() {
    this.dataService.getGroupingList().subscribe((response: any) => {
      if (response?.flag === 1 && Array.isArray(response.Data)) {
        this.groupingList = response.Data;

        this.selectedCategory = this.accountHeadData.GROUP_ID;

        // Find the Sub Group and Main Group
        const categoryItem = this.groupingList.find(
          (item) => item.GROUP_ID === this.selectedCategory
        );

        if (categoryItem) {
          this.subGroupId = categoryItem.GROUP_SUPER_ID;

          const subGroupItem = this.groupingList.find(
            (item) => item.GROUP_ID === this.subGroupId
          );

          if (subGroupItem) {
            this.mainGroupId = subGroupItem.GROUP_SUPER_ID;
            this.accountHeadData.MainGroupId = this.mainGroupId;
          }
        }

        // Populate all lists
        this.mainGroupList = this.groupingList.filter(
          (item) => item.GROUP_SUPER_ID === 0
        );

        this.subGroupList = this.groupingList.filter(
          (item) => item.GROUP_SUPER_ID === this.mainGroupId
        );
        this.accountHeadData.SubGroupId = this.subGroupId;
        this.categoryList = this.groupingList.filter(
          (item) => item.GROUP_SUPER_ID === this.subGroupId
        );
      }
    });
  }

  onMainGroupChange(event: any) {
    this.selectedMainGroupId = event.value;
    console.log('Selected Main Group ID:', event.value);
    this.subGroupList = this.groupingList.filter(
      (item) => item.GROUP_SUPER_ID === this.selectedMainGroupId
    );
    console.log(this.subGroupList, 'SUBGROUPLIST');
  }

  get selectedMainGroupName(): string {
    const selectedGroup = this.mainGroupList.find(
      (item) => item.GROUP_ID === this.selectedMainGroupId
    );
    return selectedGroup ? selectedGroup.GROUP_NAME : '';
  }

  get selectedSubGroupName(): string {
    const selected = this.subGroupList?.find(
      (item) => item.GROUP_ID === this.selectedSubGroupId
    );
    return selected ? selected.GROUP_NAME : '';
  }

  onSubGroupChange(event: any) {
    this.selectedSubGroupId = event.value;
    console.log('selected sub group', this.selectedSubGroupId);
    this.categoryList = this.groupingList.filter(
      (item) => item.GROUP_SUPER_ID === this.selectedSubGroupId
    );
    console.log(this.categoryList, 'CATEGORYLIST');
  }

  onCategoryChange(event: any) {
    this.selectedCategoryId = event.value;
    this.selectedCategory = event.value; // keep both in sync
  }

  updateAccountHead() {
    const payload = {
      HEAD_ID: this.accountHeadData.HEAD_ID,
      GROUP_ID: this.selectedCategory, // From the selected category field
      HEAD_NAME: this.accountHeadData.HEAD_NAME,
      GROUP_SUPER_ID: this.accountHeadData.SubGroupId, // Parent of category
      GROUP_TYPE: 0,
      IS_SYSTEM_GROUP: this.accountHeadData.IS_SYSTEM_GROUP,
      ARABIC_NAME: this.accountHeadData.ARABIC_NAME,
      GROUP_ORDER: this.accountHeadData.GROUP_ORDER || 0,
      GROUP_LEVEL: this.accountHeadData.GROUP_LEVEL || 0,
    };
    this.dataService.updateAccountHead(payload).subscribe((response: any) => {
      if (response?.flag === 1) {
        notify(
          {
            message: 'Account Group Updated Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.popupVisible = false;
        this.popupClosed.emit();
        // Close the category popup if open
        this.categoryPopup = false;

        // Refresh the list if needed
        this.getGroupingList();
      } else {
        notify(
          {
            message: response?.message || 'Update failed',
            position: { at: 'top center', my: 'top center' },
          },
          'error'
        );
      }
    });
  }

  editAccountGroup() {
    const isSubGroup = this.subGroupPopup;
    const isCategory = this.categoryPopup;

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
      console.log(response, 'NEW GROUP RESPONSE');

      const newGroupId = response?.Data?.GROUP_ID;
      if (!newGroupId) return;

      notify(
        {
          message: 'Account Group Added Successfully',
          position: { at: 'top center', my: 'top center' },
        },
        'success'
      );

      // Reset input
      this.accountGroupData.GROUP_NAME = '';

      // Refresh data and update UI
      this.dataService.getGroupingList().subscribe((res: any) => {
        if (res?.flag === 1 && Array.isArray(res.Data)) {
          this.groupingList = res.Data;


          if (isSubGroup) {
            this.subGroupList = this.groupingList.filter(
              (item) => item.GROUP_SUPER_ID === this.selectedMainGroupId
            );

            const newSubGroup = this.groupingList.find(
              (item) => item.GROUP_ID === newGroupId
            );

            if (
              newSubGroup &&
              !this.subGroupList.some((sg) => sg.GROUP_ID === newGroupId)
            ) {
              this.subGroupList.push(newSubGroup);
            }

            this.subGroupList = [...this.subGroupList]; // force change detection

            this.selectedSubGroup = newGroupId;
            this.selectedSubGroupId = newGroupId;
            this.accountHeadData.SubGroupId = newGroupId; // ✅ important for binding
          }

          if (isCategory) {
            this.categoryList = this.groupingList.filter(
              (item) => item.GROUP_SUPER_ID === this.selectedSubGroupId
            );

            const newCategory = this.groupingList.find(
              (item) => item.GROUP_ID === newGroupId
            );

            if (
              newCategory &&
              !this.categoryList.some((c) => c.GROUP_ID === newGroupId)
            ) {
              this.categoryList.push(newCategory);
            }

            this.categoryList = [...this.categoryList]; // force change detection

            this.selectedCategory = newGroupId;
            this.selectedCategoryId = newGroupId;
            this.accountHeadData.GROUP_ID = newGroupId;
          }

          // if (isCategory) {
          //   this.categoryList = this.groupingList.filter(
          //     (item) => item.GROUP_SUPER_ID === this.selectedSubGroupId
          //   );
          //   this.selectedCategoryId = newGroupId;
          // }

          // Close popups AFTER updating
          setTimeout(() => {
            this.selectedCategoryId = newGroupId;
            this.accountHeadData.GROUP_ID = newGroupId; // or CategoryId if that’s what you use
          });

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
    // Set selectedMainGroupId in case user hasn't changed it manually
    this.selectedMainGroupId = this.accountHeadData.MainGroupId;

    this.subGroupPopup = true;
  }

  onAddCategory() {
    this.selectedMainGroupId = this.accountHeadData.MainGroupId;
    this.selectedSubGroupId = this.accountHeadData.SubGroupId;

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
  declarations: [EditAccountComponent],
  exports: [EditAccountComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditAccountModule {}
