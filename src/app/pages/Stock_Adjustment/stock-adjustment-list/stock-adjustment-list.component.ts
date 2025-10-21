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

import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { StockAdjustmentEditModule } from '../stock-adjustment-edit/stock-adjustment-edit.component';
import { StockAdjustmentAddModule } from '../stock-adjustment-add/stock-adjustment-add.component';
import notify from 'devextreme/ui/notify';
@Component({
  selector: 'app-stock-adjustment-list',
  templateUrl: './stock-adjustment-list.component.html',
  styleUrls: ['./stock-adjustment-list.component.scss']
})
export class StockAdjustmentListComponent {
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
  canAdd = false;
  canEdit = false;
  canView = false;
  customLabel = 'Custom';
  canDelete = false;
  canApprove = false;
  canPrint = false;
  sessionData: any;
  selected_vat_id: any;
  customStartDate: any = null;
  customEndDate: any = null;
  startDate:Date
  EndDate:Date
    showCustomDatePopup = false;
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };
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
        this.AddStock_adustment();
      });
    },
    elementAttr: { class: 'add-button' },
  };
  isAddStock_adj: boolean=false
  Stock_adjustment_list: any;
  selected_Data: any;
  is_Edit_popup: boolean;
  selectedTrOut: any;
  isReadOnlyMode:boolean=false

   dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'This Month', value: 'last30' },
     { label: 'All', value: 'all' },
    // { label: 'Custom', value: 'custom' },
      { label: this.customLabel, value: 'custom' }


  ];
    gridButtons = [
  'edit',
  {
    name: 'delete',
    visible: (e: any) => e.row?.data?.TRANS_STATUS==1
  }
];
  selectedDateRange: string = 'today';
 
  filteredInvoiceList: any;
  filteredStockList: any;
  constructor(
    private dataService: DataService,
    private router: Router,
    private zone: NgZone
  ) {
    if(this.selectedDateRange==='today'){
   const today = new Date();
  today.setHours(0, 0, 0, 0);

   this.startDate=new Date(today)
   this.EndDate=new Date(today)
   console.log(this.startDate,'=======start date=====')
console.log(this.EndDate,'=======End date=====')
    }

  }

  ngOnInit() {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);
    // this.sessionData_tax()
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);
    console.log(packingRights, 'PACKINGRIGHTSSSSSSSSSSSSSSSSSSSSSSS');
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      console.log('packingRights.CanAdd:', packingRights.CanAdd);
      console.log('this.canAdd after assign:', this.canAdd);
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
    }
    this.get_stock_adjustment_list();
  }
applyCustomDateFilter() {
  const start = new Date(this.customStartDate);  // keep as Date
  const end = new Date(this.customEndDate);      // keep as Date

  // ✅ Use Date objects for filtering
  this.dataService.List_Stock_Adjustment_Data().subscribe((res: any) => {
    const allData = res.Data;
    this.filteredStockList = allData.filter((item: any) => {
      const itemDate = new Date(item.ADJ_DATE);
      return itemDate >= start && itemDate <= end;
    });
  });

  // // ✅ Format dates for label only
  // const fromLabel = this.formatAsDDMMYYYY(start);
  // const toLabel = this.formatAsDDMMYYYY(end);
  // this.customLabel = `${fromLabel} to ${toLabel}`;
 // ✅ Update dateRanges array label
  const customOption = this.dateRanges.find(dr => dr.value === 'custom');
  if (customOption) {
    customOption.label = this.customLabel;
  }

  // ✅ Mark selected
  this.selectedDateRange = 'custom';

  // ✅ Close popup
  this.showCustomDatePopup = false;
}

// Example formatter (dd/MM/yyyy)
// formatAsDDMMYYYY(date: Date): string {
//   const day = date.getDate().toString().padStart(2, '0');
//   const month = (date.getMonth() + 1).toString().padStart(2, '0');
//   const year = date.getFullYear();
//   return `${day}/${month}/${year}`;
// }

get_stock_adjustment_list(){

  this.dataService.List_Stock_Adjustment_Data().subscribe((res:any)=>{
    console.log(res)
        const allData = res.Data;
    const dateField = 'ADJ_DATE';

    // If 'all' is selected, skip filtering
    if (this.selectedDateRange === 'all') {
      this.filteredStockList = allData;
    } else {
      const start = new Date(this.startDate);
      const end = new Date(this.EndDate);
      end.setHours(23, 59, 59, 999);

      this.filteredStockList = allData.filter((item: any) => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= start && itemDate <= end;
      });
    }

    // this.filteredStockList=res.Data
  })


}
 formatDate(date: Date): string {
  const month = date.getMonth() + 1; // Months are 0-based
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.TRANS_STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color = status === 5 ? '#5cac6fff' : '#d87f7fff';
    icon.title = status === 5 ? 'APPROVED' : 'OPEN';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

delete_Data(e:any){
  const id=e.data.ID
   this.dataService.Delete_Stock_Adjustment_Data(id).subscribe((res:any)=>{
    console.log(res)
        notify(
                                         {
                                    message: ' Stock Adjustment Deleted successfully',
                                    position: { at: 'top right', my: 'top right' },
                                    displayTime: 1000,
                                  },
                                  'success'
                                );

                                this.get_stock_adjustment_list()

   })
}
AddStock_adustment(){
  this.isAddStock_adj=true
}
    refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
      this.get_stock_adjustment_list()
    }
  }

  getStatusFilterData = [
    {
      text: 'Approved',
      value: 'Approved',
    },
    {
      text: 'Open',
      value: 'Open',
    },
  ];

//   onDateRangeChanged(e: any) {
//     this.selectedDateRange = e.value;
// console.log(e,'==========date=================')
//     if (e.value === 'custom') {
//       this.customStartDate = null;
//       this.customEndDate = null;
//       this.showCustomDatePopup = true;
//     } else {
//       // Reset the custom label
//       const customOpt = this.dateRanges.find((dr) => dr.value === 'custom');
//       if (customOpt) {
//         customOpt.label = 'Custom';
//       }
//       // this.applyDateFilter();
//     }
//   }
onEditStock(event:any){
  event.cancel=true
this.is_Edit_popup=true
const id=event.data.ID
this.dataService.select_Stock_Adjustment_Data(id).subscribe((res:any)=>{
  this.selected_Data=res.Data
})

}
 onToolbarPreparing(e: any) {
    const toolbarItems = e.toolbarOptions.items;

    // Avoid adding the button more than once
    const alreadyAdded = toolbarItems.some(
      (item: any) => item.name === 'toggleFilterButton'
    );
    if (!alreadyAdded) {
      toolbarItems.splice(toolbarItems.length - 1, 0, {
        widget: 'dxButton',
        name: 'toggleFilterButton', // custom name to avoid duplicates
        location: 'after',
        options: {
          icon: 'filter',
          hint: 'Search Column',
          onClick: () => this.toggleFilters(),
        },
      });
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

      onDateRangeChanged(e: any) {
        const today = new Date();
    this.selectedDateRange = e.value;
console.log('selected data=======',this.selectedDateRange)
if(this.selectedDateRange==='today'){
   const today = new Date();
  today.setHours(0, 0, 0, 0);

   this.startDate=new Date(today)
   this.EndDate=new Date(today)
   console.log(this.startDate,'=======start date=====')
console.log(this.EndDate,'=======End date=====')
} 
else if(this.selectedDateRange === 'all'){
  // this.get_stock_adjustment_list()
  
  

} else if (this.selectedDateRange === 'last7') {
    this.startDate = new Date(today);
    this.startDate.setDate(today.getDate() - 6);
    this.EndDate = new Date(today);
console.log(this.startDate,'=======start date=====')
console.log(this.EndDate,'=======End date=====')
  } else if (this.selectedDateRange === 'last15') {
    this.startDate = new Date(today);
    this.startDate.setDate(today.getDate() - 14);
    this.EndDate = new Date(today);
console.log(this.startDate,'=======start date=====')
console.log(this.EndDate,'=======End date=====')
  } else if (this.selectedDateRange === 'last30') {
    this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.EndDate = new Date(today);
console.log(this.startDate,'=======start date=====')
console.log(this.EndDate,'=======End date=====')
  } else if (this.selectedDateRange === 'lastMonth') {
    const lastMonth = today.getMonth() - 1;
    this.startDate = new Date(today.getFullYear(), lastMonth, 1);
    this.EndDate = new Date(today.getFullYear(), today.getMonth(), 0);
console.log(this.startDate,'=======start date=====')
console.log(this.EndDate,'=======End date=====')
  } else {
this.showCustomDatePopup=true


}



    this.get_stock_adjustment_list();
  }

 

  handleClose(){
    this.isAddStock_adj=false
    this.is_Edit_popup=false
    this.get_stock_adjustment_list()
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
    StockAdjustmentEditModule,
    StockAdjustmentAddModule

  ],
  providers: [],
  declarations: [StockAdjustmentListComponent],
  exports: [StockAdjustmentListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StockAdjustmentListModule {}
