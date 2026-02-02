import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
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
// import { ArticleAddModule } from '../article-add/article-add.component';
// import { ArticleEditModule } from '../article-edit/article-edit.component';
import { ArticleListComponent } from '../article-list/article-list.component';
import { DataService } from 'src/app/services';
import {
  PackingAddComponent,
  PackingAddModule,
} from '../packing-add/packing-add.component';
import { PackingEditModule } from '../packing-edit/packing-edit.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
@Component({
  selector: 'app-packing',
  templateUrl: './packing.component.html',
  styleUrls: ['./packing.component.scss'],
})
export class PackingComponent {

  @ViewChild(PackingAddComponent)
  PackingAddComponent!: PackingAddComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';

  PackingDataSource: DataSource;
  packingArray: any[] = [];
  packingCount = 0;


  addPackingPopupVisible: boolean = false;
  editPackPopupOpened: boolean = false;
  selectedPacking: any;
  userData: any;
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
      this.ngZone.run(() => this.addPacking());
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
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

 
  selected_Company_id: any;

  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
    private router: Router,
  ) {
    this.sesstion_Details();
    this.getPackingList();

    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
  }

   refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },
    text: '',
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
      .find((menu) => menu.Path === '/packing');

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

    //  this.userData=sessionStorage.getItem('savedUserData')
    //  console.log(this.userData,'-------------user details');
    //  let menuGroups: any[] = [];

    //  console.log(this.userData.MenuGroups);

    //  menuGroups = this.userData.MenuGroups || [];
    // console.log(menuGroups)

    // let matchedMenu = null;
    // for (const group of menuGroups) {
    //   matchedMenu = group.Menus.find((menu: any) => menu.Path === currentUrl);
    //   if (matchedMenu) break;
    // }

    // if (matchedMenu) {
    //   this.canAdd = matchedMenu.CanAdd;
    //   this.canEdit = matchedMenu.CanEdit;
    //   this.canView = matchedMenu.CanView;
    //   this.canDelete = matchedMenu.CanDelete;
    //   this.canApprove = matchedMenu.CanApprove;
    //   this.canPrint = matchedMenu.CanPrint;
    // }
    // console.log(matchedMenu,'====================Matched Menu======================')
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
      this.getPackingList();
    }
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  onToolbarPreparing(e: any) {
    // const toolbarItems = e.toolbarOptions.items;
    // // Avoid adding the button more than once
    // const alreadyAdded = toolbarItems.some(
    //   (item: any) => item.name === 'toggleFilterButton',
    // );
    // if (!alreadyAdded) {
    //   toolbarItems.splice(toolbarItems.length - 1, 0, {
    //     widget: 'dxButton',
    //     name: 'toggleFilterButton', // custom name to avoid duplicates
    //     location: 'after',
    //     options: {
    //       icon: 'search',
    //       hint: 'Search Column',
    //       onClick: () => this.toggleFilters(),
    //     },
    //   });
    // }
  }

  getStatusFlagClass(Status: string): string {
    // console.log('Status:', Status);

    return Status === 'Active' ? 'flag-green' : 'flag-red';
  }

  addPacking() {
    this.addPackingPopupVisible = true;
  }

  onEditPacking(event: any) {
    event.cancel = true;

    this.editPackPopupOpened = true;
    this.selected_data(event);
  }

  handleClose() {
    this.editPackPopupOpened = false;
    this.addPackingPopupVisible = false;
    if (this.PackingAddComponent) {
      this.PackingAddComponent.resetForm();
    }
    this.getPackingList();

    console.log('close packing popup called');
  }

  //=============================get api for packing list========================================
  // getPackingList() {
  //   this.dataService.get_packages_list_api().subscribe((res:any)=>{
  //     console.log('response from get packing list api:', res);

  //     this.packingList=res.Data

  //   })
  // }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(sessionData, '=================session data==========');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id==============',
    );
  }
  
  getPackingList() {
  this.PackingDataSource = new DataSource({
    load: () =>
      new Promise((resolve) => {
        this.dataService.get_packages_list_api().subscribe({
          next: (res: any) => {
            const list = (res?.Data || []).map(
              (item: any, index: number) => ({
                ...item,
                SNO: index + 1,
              }),
            );

            // 🔑 cache for logic
            this.packingArray = list;
            this.packingCount = list.length;

            resolve(list); // 🔑 grid receives data
          },
          error: () => {
            this.packingArray = [];
            this.packingCount = 0;
            resolve([]);
          },
        });
      }),
  });
}


  delete_Packing_Data(event: any) {
    console.log(event)
    const id = event.data.ID;
     event.cancel = true;
    console.log(id)
    this.dataService.Delete_Package_Api(id).subscribe((res: any) => {
      console.log('response from delete packing api:', res);
      
      // this.dataGrid.instance.refresh();
      notify(
        {
          message: 'Data succesfully added',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success',
      );
      this.getPackingList();
    });
  }

  //=============================get api for packing list========================================

  selected_data(event: any) {
    const id = event.data.ID;
    this.dataService.select_api_packing(id).subscribe((res: any) => {
      console.log('response from select packing api:', res);
      this.selectedPacking = res.Data;
    });
  }

  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'packing';
    this.dataService.exportDataGrid(event, fileName);
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
    PackingAddModule,
    PackingEditModule,
  ],
  providers: [],
  declarations: [PackingComponent],
  exports: [PackingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PackingModule {}
