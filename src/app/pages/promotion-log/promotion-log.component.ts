import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, NgZone, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTabsModule,
  DxTagBoxModule,
  DxTemplateModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidationGroupModule,
  DxValidatorModule,
  DxDataGridComponent
} from 'devextreme-angular';
import {
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';
import { workerData } from 'worker_threads';
import { PromotionEditModule } from '../promotion-edit/promotion-edit.component';
import { EditPromotionModule } from '../edit-promotion/edit-promotion.component';
import { ViewPromotionWizardModule } from '../view-promotion-wizard/view-promotion-wizard.component';
import { filter } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { PromotionComponent, PromotionModule } from '../promotion/promotion.component';

@Component({
  selector: 'app-promotion-log',
  templateUrl: './promotion-log.component.html',
  styleUrls: ['./promotion-log.component.scss'],
})
export class PromotionLogComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  @ViewChild(PromotionComponent)
  promotionComponent!: PromotionComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  isAddPopup: boolean = false
  auto: string = 'auto';
  customButtons = [
    {
      hint: 'Verify',
      icon: 'check',
      text: 'Verify',
      onClick: (e: any) => this.onVerifyClick(e),
      visible: (e: any) => !e.row.data.isVerified && !e.row.data.isApproved,
    },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e: any) => this.onApproveClick(e),
      visible: (e: any) => e.row.data.isVerified && !e.row.data.isApproved,
    },
  ];
  allButtonsEditDelete = [
    {
      name: 'edit',
      hint: 'Edit',
      icon: 'edit',
      // onClick: (e: any) => this.onEditClick(e),
      visible: true,
      // disabled: (e: any) => e.row.data.isVerified, // Disable when `isVerified` is true
    },
    // {
    //   name: 'edit',
    //   visible: true,
    //   disabled: (rowData: any) => rowData.isVerified,
    // },
    {
      name: 'delete',
      visible: (e: any) => !e.row.data.isVerified && !e.row.data.isApproved,
    },
  ];
  isVerified: boolean = false;
  isApproved: boolean = false;
  promotionLogList: any;
  selectedPromotion: any = {};
  AllowCommitWithSave: any;
  logStatusMap: { [key: number]: string } = {};
  status: any;
  approveValue: boolean = false
  ViewPopupOpened: boolean = false
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  canVerify = false;
  StatusType: any;
  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    // icon: 'add',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    // onClick: () => this.addCreditNote(),
    onClick: () => {
      this.zone.run(() => {
        this.onAddClick();
      });
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
  allButtons = [
    {
      name: 'edit',
      onClick: (e: any) => this.openEditingStart(e),
      visible: (e: any) => {

        return this.canEdit &&
          (
            e.row.data.Status === 'Open'
          )
      }

    },
    {
      name: 'delete',
      visible: (e: any) => {
        const status = e.row.data.Status;

        return this.canDelete &&
          (
            (e.row.data.Status == 'Open') || (status === 'Verified' && this.canApprove)

          )

      },
    },
    {
      hint: 'Verify',
      template: 'verifyTemplate',
      text: 'Verify',
      onClick: (e: any) => this.onVerifyClick(e),
      visible: (e: any) => {
        return this.canVerify && e.row.data.Status === 'Open';


      },
    },
    {
      hint: 'Approve',
      template: 'ApproveTemplate',
      text: 'Approve',
      onClick: (e: any) => this.onApproveClick(e),
      visible: (e: any) => {
        return this.canApprove &&
          (
            e.row.data.Status === 'Verified' || (this.canVerify ? false : e.row.data.Status === 'Open')
          )

      },
    },
    {
      hint: 'View',
      template: 'ViewTemplate',
      text: 'View',
      visible: (e: any) =>
        this.canView &&
        (
          e.row.data.Status === 'Approved' ||
          (e.row.data.Status === 'Verified' && !this.canApprove)
        )

    },
  ];
  getStatusFilterData = [
    {
      text: 'Approved',
      value: 'Approved',
    },
    {
      text: 'Open',
      value: 'Open',
    },
    {
      text: 'Verified',
      value: 'Verified',
    },
  ];
  statusCellRender(cellElement: any, cellInfo: any) {
    console.log(cellInfo, '==========cellInfo==============')
    const status = cellInfo.data.Status;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color =
      status === 'Approved'
        ? '#10B981' // Approved
        : status === 'Verified'
          ? '#0073D8' // Verified
          : '#FFA500'; // Open
    icon.title = status === 'Approved' ? 'Approved' : status === 'Verified' ? 'Verified' : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };
  editPackPopupOpened: boolean = false
  constructor(
    private dataservice: DataService,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef

  ) { }

  ngOnInit() {


    const currentUrl = this.router.url;


    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    // this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      console.log(packingRights, '====packing rights====');
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
      console.log(this.canVerify, 'VERIFY RIGHTS');
    }

    this.AllowCommitWithSave = sessionStorage.getItem('AllowCommitWithSave');
    console.log(this.AllowCommitWithSave, 'ALLOW');
    this.getPromotionLogList();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.getPromotionLogList(); //  reload every time you land here
      });
    this.handleClose()
  }

  getPromotionLogList() {
    this.dataservice.PromotionLogList().subscribe((response: any) => {
      this.promotionLogList = response.dataworksheet
        .map((item: any) => {
          this.logStatusMap[item.WS_NO] = item.Status;
          return {
            ...item,
            isVerified: item.Status === 'Verified',
            isApproved: item.Status === 'Approved',
          };
        })
        .sort((a: any, b: any) => b.WS_NO - a.WS_NO);
      console.log(this.promotionLogList, 'LOGLIST');
      this.promotionLogList.forEach((item: any) => {
        if (item.isVerified) {
        } else if (item.isApproved) {
          // console.log(`Record ${item.WS_NO} is Approved.`);
        } else {
          // console.log(`Record ${item.WS_NO} is Open.`);
        }
      });
      // console.log(this.logList, 'LOGLIST');
    });
  }

  dateCellTemplate(cellElement: any, cellInfo: any) {
    if (cellInfo.value) {
      const date = new Date(cellInfo.value);
      const dateFormat = sessionStorage.getItem('dateFormat') || 'MM/DD/YYYY';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear());
      let formattedDate = dateFormat
        .replace('dd', day)
        .replace('mm', month)
        .replace('yyyy', year)
        .replace('yy', year.slice(-2));
      cellElement.innerText = formattedDate;
    } else {
      cellElement.innerText = '';
    }
  }

  selectPromotionWorksheet(worksheetId: number) {
    this.dataservice
      .selectPromotionWorksheet(worksheetId)
      .subscribe((response: any) => {
        const ws = this.promotionLogList.find(
          (worksheet: any) => worksheet.ID == response.ID,
        );
        this.status = ws.Status;
        if (this.status == 'Approved') {
          this.goToView(worksheetId);
          return;
        }
        if (this.status == 'Verified') {
          if (this.AllowCommitWithSave) {
            console.log(this.status, 'SELECT RESPONSE');
            this.selectedPromotion = response;
            this.dataservice.setWorksheetData(response);
            // this.router.navigate(['/promotion-edit']);
          } else {
            this.goToView(worksheetId);
          }
        }
        console.log(this.status, 'SELECT RESPONSE');
        this.selectedPromotion = response;
        this.dataservice.setWorksheetData(response);
        this.router.navigate(['/promotion-edit']);
      });
  }

  goToView(worksheetId: number) {
    this.dataservice
      .selectPromotionWorksheet(worksheetId)
      .subscribe((response: any) => {
        const ws = this.promotionLogList.find(
          (worksheet: any) => worksheet.ID == response.ID,
        );
        this.status = ws.Status;
        this.selectedPromotion = { ...response, status: this.status };
        this.dataservice.setWorksheetData(this.selectedPromotion);
        console.log('Navigating to view page with:', {
          worksheetData: this.selectedPromotion,
        });
        this.router.navigate(['/promotion-view'], {
          state: {
            worksheetData: this.selectedPromotion,
          },
        });
      });
  }
  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.getPromotionLogList();
    }
  }

  openEditingStart(event: any) {
    console.log('Edit row triggered for ID:', event);

    event.cancel = true;
    const selectedId = event.data.ID;
    console.log('Edit row triggered for ID:', selectedId, event);
    this.StatusType = 'EditScreen'

    console.log(status, '=============ststus----------------')
    this.dataservice
      .selectPromotionWorksheet(selectedId)
      .subscribe((response: any) => {
        this.selectedPromotion = response;
        console.log(this.selectedPromotion, 'SELECTEDPROMOTION-verify');
        this.editPackPopupOpened = true
        this.cdr.detectChanges();

      })

  }

  onAddClick() {
    // this.router.navigate(['/promotion-add']);
    this.isAddPopup = true
  }

  onVerifyClick(e: any) {
    if (e.row.data.Status == 'Approved') {
      this.onViewClick(e.row.data.ID)
    }
    else {


      e.cancel = true;
      const selectedId = e.row.data.ID;
      console.log('Edit row triggered for ID:', selectedId, e);
      const status = e.row.data.Status
      this.StatusType = 'VerifyScreen'

      console.log(this.StatusType, '=============StatusType----------------')
      this.dataservice
        .selectPromotionWorksheet(selectedId)
        .subscribe((response: any) => {
          this.selectedPromotion = response;
          console.log(this.selectedPromotion, 'SELECTEDPROMOTION-verify');
          this.editPackPopupOpened = true;
          this.cdr.detectChanges();

        })
    }
  }

  verifyWorksheetById(worksheetId: number, e: any) {
    if (!worksheetId) {
      console.warn('Invalid worksheet ID');
      return;
    }
    this.dataservice
      .selectPromotionWorksheet(worksheetId)
      .subscribe((response: any) => {
        this.selectedPromotion = response;
        console.log(this.selectedPromotion, 'SELECTEDPROMOTION-verify');
        this.dataservice.setWorksheetData(response);
        this.router.navigate(['/promotion-verify'], {
          state: {
            worksheetData: this.selectedPromotion,
            status: status,
          },
        });
      });
  }

  onApproveClick(e: any) {
    e.cancel = true;
    const selectedId = e.row.data.ID;
    console.log('Edit row triggered for ID:', selectedId, e);
    const status = e.row.data.Status
    this.StatusType = 'ApprovalScreen'

    console.log(status, '=============ststus----------------')
    this.dataservice
      .selectPromotionWorksheet(selectedId)
      .subscribe((response: any) => {
        this.selectedPromotion = response;
        console.log(this.selectedPromotion, 'SELECTEDPROMOTION-verify');
        this.editPackPopupOpened = true;
        this.cdr.detectChanges();

      })

  }

  approveWorksheetById(worksheetId: number, e: any) {
    console.log(worksheetId, 'forapprove');
    if (!worksheetId) {
      console.warn('Invalid worksheet ID');
      return;
    }
    this.dataservice
      .selectPromotionWorksheet(worksheetId)
      .subscribe((response: any) => {
        this.selectedPromotion = response;
        console.log(this.selectedPromotion, 'SELECTEDPROMOTION');
        this.dataservice.setWorksheetData(response);
        this.router.navigate(['/promotion-approve'], {
          state: {
            worksheetData: this.selectedPromotion,
            status: status,
          },
        });
      });
  }

  onRowRemoving(event: any) {
    const selectedRow = event.data; // Get the data of the selected row
    const id = selectedRow.ID;
    this.dataservice.delete(id).subscribe((response) => {
      if (response) {
        notify(
          {
            message: 'Worksheet Deleted Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success',
        );
      } else {
        notify(
          {
            message: 'Worksheet is not deleted',
            position: { at: 'top center', my: 'top center' },
          },
          'error',
        );
      }
    });
  }
  handleClose() {

    this.editPackPopupOpened = false
    this.getPromotionLogList()
    this.isAddPopup = false
    if (this.promotionComponent) {
      this.promotionComponent.resetForm();
    }

  }
  isDeleteVisible = (e: any) => {
    console.log(e, '=========es===================');
    return e.row?.data.Status === 'Open';
  };

  getStatusFlagClass(status: string): string {
    return status === 'Open'
      ? 'flag-white'
      : status === 'Verified'
        ? 'flag-orange'
        : status === 'Approved'
          ? 'flag-green'
          : '';
  }
  onViewClick(id: any) {
    console.log('Edit row triggered for ID:', id);
    this.StatusType = 'viewScreen'

    this.dataservice
      .selectPromotionWorksheet(id)
      .subscribe((response: any) => {
        this.selectedPromotion = response;
        console.log(this.selectedPromotion, 'SELECTEDPROMOTION-verify');
        this.ViewPopupOpened = true;
        this.cdr.detectChanges();


      })
  }
}

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    ItemsFormModule,
    DxTabsModule,
    DxTemplateModule,
    DxoFormItemModule,
    DxToolbarModule,
    DxRadioGroupModule,
    DxPopupModule,
    DxTagBoxModule,
    DxNumberBoxModule,
    DxValidationGroupModule,
    DxValidatorModule,
    EditPromotionModule,
    ViewPromotionWizardModule,
    PromotionModule
  ],
  providers: [],
  exports: [],
  declarations: [PromotionLogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PromotionLogModule { }