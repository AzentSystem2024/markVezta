import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxFormModule, DxLoadIndicatorModule, DxLoadPanelModule, DxNumberBoxModule, DxPopupModule, DxSelectBoxModule, DxTabPanelModule, DxTagBoxModule, DxTextBoxModule, DxTreeListModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-box-production-view',
  templateUrl: './box-production-view.component.html',
  styleUrls: ['./box-production-view.component.scss']
})
export class BoxProductionViewComponent {
 ArticleProductionDatasource: any[];
  isFilterRowVisible: boolean;
   displayMode: any = 'full';
  showPageSizeSelector = true;
 auto: string = 'auto';
   selectedDateRange: any = 'today';
   CompanyDetails: any 
  customStartDate: any = null;
  customEndDate: any = null;
  startDate:Date
  EndDate:Date
    showCustomDatePopup:boolean = false;
    company_id:any
    listofArticlesView:any
   dateRanges = [
    {
      label: 'Today',
      value: 'today',
    },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    {
      label: 'Custom',
      value: 'custom',
    },


  ];
constructor(private dataservice:DataService,private cdr: ChangeDetectorRef){
  this.FilteringDetails()
}





  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
  };
    displayExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const from = this.formatAsDDMMYYYY(new Date(this.customStartDate));
      const to = this.formatAsDDMMYYYY(new Date(this.customEndDate));
      return `${from} to ${to}`;
    }

    return item.label;
  };
    private parseDateString(dateStr: string): Date {
    const [day, month, year] = dateStr
      .split('-')
      .map((part) => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }
  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
    onDateRangeChanged(e: any) {
        const today = new Date();
    this.selectedDateRange = e.value;
console.log('selected data=======',this.selectedDateRange)
if(this.selectedDateRange==='today'){
   this.startDate=new Date()
   this.EndDate=this.startDate
}  else if (this.selectedDateRange === 'last7') {
    this.startDate = new Date(today);
    this.startDate.setDate(today.getDate() - 6);
    this.EndDate = new Date(today);

  } else if (this.selectedDateRange === 'last15') {
    this.startDate = new Date(today);
    this.startDate.setDate(today.getDate() - 14);
    this.EndDate = new Date(today);

  } else if (this.selectedDateRange === 'last30') {
    this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.EndDate = new Date(today);

  }

   else if (this.selectedDateRange === 'custom') {
      console.log('Custom date range selected');
      this.showCustomDatePopup = true;
      return;
    }
  //  else if (this.selectedDateRange === 'custom') {
  //   const lastMonth = today.getMonth() - 1;
  //   this.startDate = new Date(today.getFullYear(), lastMonth, 1);
  //   this.EndDate = new Date(today.getFullYear(), today.getMonth(), 0);

  // }
   else {
this.showCustomDatePopup=true
this.startDate=this.customStartDate
this.EndDate=this.customEndDate
}


// if (e.value === 'custom') {
    //   this.customStartDate = null;
    //   this.customEndDate = null;
    //   this.showCustomDatePopup = true;
    // } else {
    //   // Reset the custom label
    //   // const customOpt = this.dateRanges.find((dr) => dr.value === 'custom');
    //   // if (customOpt) {
    //   //   customOpt.label = 'Custom';
    //   // }
    //   this.applyDateFilter();
    // }
  }

     applyDateFilter() {
      console.log('apply filter button called===========')
    if (!this.selectedDateRange || !this.listofArticlesView) {
      this.ArticleProductionDatasource = this.listofArticlesView;
      return;
    }

  
     this.startDate

    const endDate = new Date(); // today

    switch (this.selectedDateRange) {
      case 'today':
        this.startDate = new Date();
       this.EndDate=this.startDate
        break;
      // case 'last7':
      //   startDate = new Date();
      //   startDate.setDate(today.getDate() - 6);
      //   startDate.setHours(0, 0, 0, 0);
      //   break;
      // case 'last15':
      //   startDate = new Date();
      //   startDate.setDate(today.getDate() - 14);
      //   startDate.setHours(0, 0, 0, 0);
      //   break;
      // case 'last30':
      //   startDate = new Date();
      //   startDate.setDate(today.getDate() - 29);
      //   startDate.setHours(0, 0, 0, 0);
      //   break;
      default:
        this.ArticleProductionDatasource = this.listofArticlesView;
        return;
    }

    // this.ArticleProductionDatasource = this.listofArticlesView.filter((item: any) => {
    //   const invoiceDate = this.parseDateString(item.SALE_DATE);
    //   return invoiceDate >= startDate && invoiceDate <= endDate;
    // });
  }

    // Helper method to format dates consistently
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // applyCustomDateFilter() {
  //   if (!(this.customStartDate && this.customEndDate)) return;

  //   const start = new Date(this.customStartDate);
  //   start.setHours(0, 0, 0, 0);

  //   const end = new Date(this.customEndDate);
  //   end.setHours(23, 59, 59, 999);

  //   this.ArticleProductionDatasource = this.listofArticlesView.filter((item: any) => {
  //     const invoiceDate = this.parseDateString(item.SALE_DATE);
  //     return invoiceDate >= start && invoiceDate <= end;
  //   });

  //   const fromLabel = this.formatAsDDMMYYYY(start);
  //   const toLabel = this.formatAsDDMMYYYY(end);

  //   this.dateRanges = this.dateRanges.map((option) =>
  //     option.value === 'custom'
  //       ? { ...option, label: `${fromLabel} to ${toLabel}` }
  //       : option
  //   );

  //   this.showCustomDatePopup = false;
  // }


//    applyCustomDateFilter() {
//     if (!this.customStartDate || !this.customEndDate) {
//       alert('Please select both From and To dates.');
//       return;
//     }

//     const start = new Date(this.customStartDate);
//     start.setHours(0, 0, 0, 0);

//     const end = new Date(this.customEndDate);
//     end.setHours(23, 59, 59, 999);

//     if (start > end) {
//       alert('From Date cannot be after To Date.');
//       return;
//     }

//     this.startDate = start;
//     this.EndDate = end;

//     this.selectedDateRange = {
//       label: `${this.formatDate(this.startDate)} - ${this.formatDate(
//         this.EndDate
//       )}`,
//       value: 'custom',
//     };

//     console.log(this.selectedDateRange,'selected date ranges')
//     setTimeout(() => {
//   this.showCustomDatePopup = false;
// }, 100);

//     this.cdr.detectChanges(); // optional
//   }

applyCustomDateFilter() {
  if (!this.customStartDate || !this.customEndDate) {
    alert('Please select both From and To dates.');
    return;
  }

  const start = new Date(this.customStartDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(this.customEndDate);
  end.setHours(23, 59, 59, 999);

  if (start > end) {
    alert('From Date cannot be after To Date.');
    return;
  }

  this.startDate = start;
  this.EndDate = end;

  const fromLabel = this.formatAsDDMMYYYY(start);
  const toLabel = this.formatAsDDMMYYYY(end);

  // 🔁 Update label of custom option in dateRanges
  this.dateRanges = this.dateRanges.map((range) => {
    if (range.value === 'custom') {
      return {
        ...range,
        label: `${fromLabel} to ${toLabel}`
      };
    }
    return range;
  });

  // ✅ Set selectedDateRange to 'custom' to reflect it in the select box
  this.selectedDateRange = 'custom';

  this.showCustomDatePopup = false;
}



// FilteringDetails(){
//   // const CompanyDetails=sessionStorage.getItem('savedUserData');
// const LoginDetails = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');

//   console.log(LoginDetails,'========Company Details=========')

//   this.CompanyDetails = LoginDetails.Companies;
//   console.log(this.CompanyDetails,'Company Details')
// }

FilteringDetails() {
  const LoginDetails = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');
  this.CompanyDetails = LoginDetails.Companies;

  if (this.CompanyDetails && this.CompanyDetails.length > 0) {
    // Set all COMPANY_IDs as selected by default
    this.company_id = this.CompanyDetails.map((comp: any) => comp.COMPANY_ID);
  }

  console.log(this.CompanyDetails, 'Company Details');
  console.log(this.company_id, 'Selected company IDs');
}


get_DataSource(){
console.log(this.selectedDateRange,'=====selected date range=====')
 
console.log( this.startDate ,this.EndDate,'=========date----===---==')

// Format start date to 00:00:00
const from = new Date(this.startDate);
from.setHours(0, 0, 0, 0);

// Format end date to 23:59:59
const to = new Date(this.EndDate);
to.setHours(23, 59, 59, 999);

// If you want them as strings (ISO format)
const DATE_FROM = from.toISOString(); // "2025-07-28T00:00:00.000Z"
const DATE_TO = to.toISOString();     // "2025-07-28T23:59:59.999Z"

console.log('DATE_FROM:', DATE_FROM);
console.log('DATE_TO:', DATE_TO);

// Example payload
const companyIdsAsString = this.company_id.join(',');
console.log(companyIdsAsString, '======company id======');

const payload = {
  COMPANY_ID: companyIdsAsString,
  DATE_FROM: DATE_FROM,
  DATE_TO: DATE_TO
};

console.log(payload,'==== selected data========')
console.log(this.company_id,'======company id======')
  this.dataservice.get_BoxProduction_view(payload).subscribe((res:any)=>{
    console.log(res)
this.ArticleProductionDatasource=res.data

  })


}

    summaryColumnsData = {
    totalItems: [
      {
        column: 'QUANTITY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'QUANTITY',
        alignment: 'Right',
      },
    ],
    groupItems: [
    {
      column: 'QUANTITY',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
  ],
    calculateCustomSummary: (options) => {
      if (options.name === 'summaryRow') {
        // Custom logic if needed
      }
    },
  };


}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxTabPanelModule,
    DxSelectBoxModule,
    DxTreeListModule,
    DxLoadPanelModule,
    DxLoadIndicatorModule,
    DxNumberBoxModule,
    DxTagBoxModule,
    DxDateBoxModule 
  ],
  providers: [],
  exports: [],
  declarations: [BoxProductionViewComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BoxProductionViewModule{}