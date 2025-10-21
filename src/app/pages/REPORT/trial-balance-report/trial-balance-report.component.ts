import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxLoadIndicatorModule, DxLoadPanelModule, DxNumberBoxModule, DxSelectBoxModule, DxTextBoxModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';


import { DataService } from 'src/app/services';

@Component({
  selector: 'app-trial-balance-report',
  templateUrl: './trial-balance-report.component.html',
  styleUrls: ['./trial-balance-report.component.scss']
})
export class TrialBalanceReportComponent {

  isFilterRowVisible:boolean=false
  
  TrialBalanceReport : any =[]
  auto:string='auto'
   isEmptyDatagrid: boolean = true;
    readonly allowedPageSizes: any = [ 5,10, 'all'];
    displayMode: any = 'full';
    company_list:any=[]
  savedUserData: any;
  fin_id: any;
  company_id: any;
  from_Date: any;
  To_Date: any;
  TrialBalance_datasource: any;
  finID: any;
  fromDate: any;
  ToDate: any;
   formatted_from_date: any;
  formatted_To_date: string;
  HeadId: any;
   selected_Company_id : any;
   selected_fin_id : any;


   constructor(private dataservice: DataService, private fb: FormBuilder,private cdr: ChangeDetectorRef, private router : Router) {
    this.get_sessionstorage_data()
    this.get_fin_id()
    this.sesstion_Details()

   }

   sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')

    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')


    this.selected_fin_id=sessionData.FINANCIAL_YEARS[0].FIN_ID

    console.log(this.selected_fin_id,'===========selected fin id===================')
    
  }

    toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
     this.cdr.detectChanges();
  };

   summaryColumnsData = {
      totalItems: [
        {
          column: 'OpeningBalanceDebit',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'OpeningBalanceDebit',
          alignment: 'right',
        },
        {
          column: 'OpeningBalanceCredit',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'OpeningBalanceCredit',
          alignment: 'right',
        },
        {
          column: 'DuringThePeriodDebit',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'DuringThePeriodDebit',
          alignment: 'left',
        },
        {
          column: 'DuringThePeriodCredit',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'DuringThePeriodCredit',
          alignment: 'right',
        },
        {
          column: 'ClosingBalanceDebit',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'ClosingBalanceDebit',
          alignment: 'left',
        },
        {
          column: 'ClosingBalanceCredit',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'ClosingBalanceCredit',
          alignment: 'right',
        },
       
      ],
      groupItems: [
    {
      column: 'OpeningBalanceDebit',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'OpeningBalanceCredit',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'DuringThePeriodDebit',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'DuringThePeriodCredit',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'ClosingBalanceDebit',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'ClosingBalanceCredit',
      summaryType: 'sum',
      displayFormat: ' {0}',
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


     onExporting(event: any) {
      const fileName = 'TrialBalanceReport';
      this.dataservice.exportDataGridReport(event, fileName);
    }

    get_sessionstorage_data(){
this.savedUserData = JSON.parse(sessionStorage.getItem('savedUserData'));
 console.log(this.savedUserData)
this.company_list=this.savedUserData.Companies

}

get_fin_id(){
  this.fin_id=this.savedUserData.FINANCIAL_YEARS
   if (this.fin_id.length) {
      this.finID = this.fin_id[0].FIN_ID;
    }
console.log(this.fin_id,'========financial year')
}

onCompanyChange(event:any){
  console.log(event);
  this.company_id=event.value
  console.log( this.company_id,'=====company id');
}


onFromDateChange(event: any) {
  const rawDate: Date = new Date(event.value);
  this.formatted_from_date = this.formatDate(rawDate);
  console.log('Formatted Date:', this.formatted_from_date); // example: "2025-04-01"
}
 
 
onToDateChange(event: any) {
  const rawDate: Date = new Date(event.value);
  this.formatted_To_date = this.formatDate(rawDate);
  console.log('Formatted Date:', this.formatted_To_date); // example: "2025-04-01"
}

formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

get_DataSource(){

  const payload={

  companyId: this.selected_Company_id,
  finId:this.selected_fin_id,
  dateFrom: this.formatted_from_date,
  dateTo: this.formatted_To_date
  }

  sessionStorage.setItem('viewclickvalue', JSON.stringify(payload));
  
  console.log(JSON.parse(sessionStorage.getItem('viewclickvalue')));
  
console.log(payload,'==========payload================');

this.dataservice.Trial_Balance_Api(payload).subscribe((res:any)=>{
   this.isEmptyDatagrid = false;
  console.log(res,'----------list --------------------------');
  
this.TrialBalanceReport=res.data
console.log(this.TrialBalanceReport)

})

}

 onViewClick(e: any) {
  console.log(e,'event');
  this.HeadId = e.row.data.HeadID
  console.log(this.HeadId);

  sessionStorage.setItem('HEADID',(this.HeadId));
  console.log(sessionStorage.getItem('HEADID'));
  
  // Navigate to ledger-statement route
  this.router.navigate(['/ledger-statement']);
 }
}


@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    CommonModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxSelectBoxModule,
    DxLoadPanelModule,
    DxLoadIndicatorModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    DxSelectBoxModule,
    DxButtonModule
  ],
  providers: [],
  exports: [],
  declarations: [TrialBalanceReportComponent],
})
export class TrialBalanceReportModule {}