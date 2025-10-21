// import { Component } from '@angular/core';


import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
  NgZone,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import notify from 'devextreme/ui/notify';

// Later in your code:

import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,

  
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import { DepreciationAddComponent, DepreciationAddModule } from '../depreciation-add/depreciation-add.component';
import { DepreciationEditModule } from '../depreciation-edit/depreciation-edit.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-depreciation-list',
  templateUrl: './depreciation-list.component.html',
  styleUrls: ['./depreciation-list.component.scss']
})
export class DepreciationListComponent {


    @ViewChild(DepreciationAddComponent)
    DepreciationAddComponent!: DepreciationAddComponent;
  Depreciation_List:any
    @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  
readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
isFilterRowVisible:boolean=false
AddDepreciationPopupVisible:boolean=false
EditDepreciationPopupVisible:boolean=false
 canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
//==============date filter===================
customLabel = 'Custom';
  customStartDate: any = null;
  customEndDate: any = null;
  startDate:Date
  EndDate:Date
    showCustomDatePopup = false;
   selectedDateRange: string = 'today';
   dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
     { label: 'All', value: 'all' },
    // { label: 'Custom', value: 'custom' },
      { label: this.customLabel, value: 'custom' }


  ];
  gridButtons = [
  'edit',
  {
    name: 'delete',
    visible: (e: any) => e.row?.data?.TRANS_STATUS=='1'
  }
];



refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };
     addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addDepreciation());
    },
    elementAttr: { class: 'add-button' }
  };
  allDepreciationLid: any;


  addDepreciation(){

    this.AddDepreciationPopupVisible=true
    this.DepreciationAddComponent.Active_fixedasset_List()
    this.DepreciationAddComponent.SetDefaultRest()


  }

      constructor(private dataService: DataService,private ngZone: NgZone,private cdr:ChangeDetectorRef,private router: Router){

  if(this.selectedDateRange==='today'){
   const today = new Date();
  today.setHours(0, 0, 0, 0);

   this.startDate=new Date(today)
   this.EndDate=new Date(today)
   console.log(this.startDate,'=======start date=====')
console.log(this.EndDate,'=======End date=====')


  //   this.dataService.list_Depreciation_api().subscribe((res:any)=>{
  //     this.allDepreciationLid=res.Data
  //   })
  //     const hasOpenData =this.allDepreciationLid?.some((item: any) => item.TRANS_STATUS === '1');

  // if (hasOpenData) {
  //   alert('Please approve or delete all open depreciation records before adding a new one.');
  //   return; 
  // }
} 

const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/depreciation');

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
  this.get_Depreciation_list();

      }
  
private formatAsDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}



 getStatusFlagClass(Status: string): string {
    // console.log('Status:', Status);
    
 return Status =='1' ? 'flag-oranged' : 'flag-green';
}
  //=========================Depreciation======================
onEditDepreciation(event:any){
  event.cancel=true
  this.EditDepreciationPopupVisible=true
      this.DepreciationAddComponent.Active_fixedasset_List()
const id=event.data.TRANS_ID
console.log(event.data)
  this.dataService.select_Depreciation_Asset(id).subscribe((res:any)=>{
    console.log(res)

    this.Selected_Depreciation_data=res.Data
  })
}
delete_Depreciation_Data(event:any){

const id=event.data.ID
  this.dataService.Delete_Depreciation_Asset(id).subscribe((res:any)=>{
    console.log(res)
       notify(
               {
                 message: ' Dpreciation Deleted succssfully         .',
                 position: { at: 'top right', my: 'top right' },
                 displayTime: 2000,
               },
               'success'
             );
    return;
  
// import notify from 'devextreme/ui/notify';
  })

}
handleClose(){
  this.AddDepreciationPopupVisible=false
  this.EditDepreciationPopupVisible=false
  this.get_Depreciation_list()

}
Selected_Depreciation_data(){

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
  this.get_Depreciation_list()
  

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



    this.get_Depreciation_list();
  }

get_Depreciation_list() {
  this.dataService.list_Depreciation_api().subscribe((res: any) => {
    const allData = res.Data;
    const dateField = 'DEPR_DATE';

    // If 'all' is selected, skip filtering
    if (this.selectedDateRange === 'all') {
      this.Depreciation_List = allData;
    } else {
      const start = new Date(this.startDate);
      const end = new Date(this.EndDate);
      end.setHours(23, 59, 59, 999);

      this.Depreciation_List = allData.filter((item: any) => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= start && itemDate <= end;
      });
    }

    console.log(this.Depreciation_List, 'Filtered Depreciation List');
  });
}
applyCustomDateFilter() {
  const start = new Date(this.customStartDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(this.customEndDate);
  end.setHours(23, 59, 59, 999);

  // ✅ Save to global variables
  this.startDate = start;
  this.EndDate = end;

  // Filter immediately
  this.dataService.list_Depreciation_api().subscribe((res: any) => {
    const allData = res.Data;
    this.Depreciation_List = allData.filter((item: any) => {
      const itemDate = new Date(item.DEPR_DATE);
      return itemDate >= start && itemDate <= end;
    });
  });

  // ✅ Update custom label
  const fromLabel = this.formatAsDDMMYYYY(start);
  const toLabel = this.formatAsDDMMYYYY(end);
  this.customLabel = `${fromLabel} to ${toLabel}`;

  // ✅ Reassign array to trigger change detection
  this.dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'All', value: 'all' },
    { label: this.customLabel, value: 'custom' }
  ];

  // ✅ Keep the selected value
  this.selectedDateRange = 'custom';

  this.showCustomDatePopup = false;
}


// applyCustomDateFilter() {
//   // if (!(this.customStartDate && this.customEndDate)) return;

//   const start = new Date(this.customStartDate);
//   start.setHours(0, 0, 0, 0);

//   const end = new Date(this.customEndDate);
//   end.setHours(23, 59, 59, 999);
// // 
//   // Filter data
//   this.dataService.list_Depreciation_api().subscribe((res: any) => {
//     const allData = res.Data;
//     this.Depreciation_List = allData.filter((item: any) => {
//       const itemDate = new Date(item.DEPR_DATE);
//       return itemDate >= start && itemDate <= end;
//     });
//   });

//   // ✅ Update custom label
//   const fromLabel = this.formatAsDDMMYYYY(start);
//   const toLabel = this.formatAsDDMMYYYY(end);
//   this.customLabel = `${fromLabel} to ${toLabel}`;

//   // ✅ Reassign array to trigger change detection
//   this.dateRanges = [
//     { label: 'Today', value: 'today' },
//     { label: 'Last 7 Days', value: 'last7' },
//     { label: 'Last 15 Days', value: 'last15' },
//     { label: 'Last 30 Days', value: 'last30' },
//         { label: 'All', value: 'all' },
//     { label: this.customLabel, value: 'custom' }
//   ];

//   // Keep the selected value
//   this.selectedDateRange = 'custom';

//   this.showCustomDatePopup = false;
// }

refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
       // Or reload data from API if needed
       this.get_Depreciation_list()
       
    }
  }
    toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };



}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    DxFormModule,
    DxRadioGroupModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxValidatorModule,
    ReactiveFormsModule,
    DxDateBoxModule,
    DxValidationGroupModule,
    DepreciationAddModule,
    DepreciationEditModule,
    CommonModule
    
  ],
  providers: [],
  exports: [DepreciationListComponent],
  declarations: [DepreciationListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DepreciationListModule {}


// DepreciationListComponent