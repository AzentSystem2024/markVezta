import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DxButtonModule, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxDateBoxModule, DxLoadIndicatorModule, DxLoadPanelModule, DxNumberBoxModule, DxSelectBoxModule, DxTextBoxModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';
import { LedgerStatementComponent, LedgerStatementModule } from '../../REPORT/ledger-statement/ledger-statement.component';

@Component({
  selector: 'app-profit-and-loss',
  templateUrl: './profit-and-loss.component.html',
  styleUrls: ['./profit-and-loss.component.scss']
})
export class ProfitAndLossComponent {
  @ViewChild('dataGrid', { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxDataGridComponent) grid!: DxDataGridComponent;

    
      isFilterRowVisible:boolean=false
      ProfitLossReport : any =[]
      auto:string='auto'
       isEmptyDatagrid: boolean = true;
       expandedOnce = false;
      revenueTotalForSummary = 0;
     expenseTotalForSummary = 0;

       
        readonly allowedPageSizes: any = [ 5,10, 'all'];
        displayMode: any = 'full';
        company_list:any=[]
      savedUserData: any;
      fin_id: any;
      company_id: any;
      from_Date: any;
      To_Date: any;
      selected_Company_id : any;
      finID: any;
      fromDate: any;
      ToDate: any;
       formatted_from_date: any;
      formatted_To_date: string;
      HeadId: any;

      netProfit: number = 0;
totalRevenue: number = 0;
totalExpense: number = 0;
    
    
       constructor(private dataservice: DataService, private fb: FormBuilder,private cdr: ChangeDetectorRef, private router : Router) {
        this.get_sessionstorage_data()
        this.get_fin_id()
        this.sesstion_Details();
       }

       sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')

    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')
    
  }
    
        toggleFilterRow = () => {
        this.isFilterRowVisible = !this.isFilterRowVisible;
         this.cdr.detectChanges();
      };
    
    
    
    
         onExporting(event: any) {
          const fileName = 'ProfitLossReport';
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
    
      let payload={
      COMPANY_ID: this.selected_Company_id,
      FIN_ID:this.finID,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date
      }
    
     const payloadData = {
  companyId: payload.COMPANY_ID,
  finId: payload.FIN_ID,
  dateFrom: payload.DATE_FROM,
  dateTo: payload.DATE_TO
};
      
      sessionStorage.removeItem('viewclickvalue')
      sessionStorage.setItem('viewclickvalue', JSON.stringify(payloadData));
      // sessionStorage.removeItem('HEADID')
      // sessionStorage.setItem('HEADID', JSON.stringify(this.HeadId));
      console.log(JSON.parse(sessionStorage.getItem('viewclickvalue')));
      
    console.log(payload,'==========payload================');
    this.dataservice.Profit_Loss_Api(payload).subscribe((res:any)=>{
       this.isEmptyDatagrid = false;
      console.log(res,'----------list --------------------------');
      
    this.ProfitLossReport=res.data
    
     
   
    this.calculateNetProfit(); 
    
 this.grid.instance.refresh(); // force grid to recalc summaries
     
    })
    
    }

     onViewClick(e: any) {
      console.log(e,'event');
      this.HeadId = e.row.data.HEAD_ID
      console.log(this.HeadId);
    sessionStorage.removeItem('HEADID')

      sessionStorage.setItem('HEADID',(this.HeadId));
      console.log(sessionStorage.getItem('HEADID'));
      
      
      // Navigate to ledger-statement route
      this.router.navigate(['/ledger-statement']);
     }


onRowPrepared(e) {
  if (e.rowType === 'data' && e.data.isSummary) {
    e.rowElement.style.fontWeight = 'bold';
    // e.rowElement.style.backgroundColor = '#f0f0f0';
  }
}

calculateNetProfit() {
  let revenue = 0, expense = 0;
  this.ProfitLossReport.forEach(row => {
    const type = (row.TYPE_NAME || '').trim().toUpperCase();
    const amount = Number(row.AMOUNT || 0);
    if (type === 'REVENUES') revenue += amount;
    else if (type === 'EXPENSES') expense += amount;
  });
  this.netProfit = revenue - expense;
}

onCellPrepared(e: any) {
  if (e.rowType === 'totalFooter' && e.column && e.column.dataField === 'AMOUNT') {
    const formatted = (Number(this.netProfit) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    e.cellElement.innerHTML = `
      <div style="text-align: right; font-weight: bold; margin-top: 5px; padding-right: 20px;">
        Net Profit: ${formatted}
      </div>
    `;
  }
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
    DxButtonModule,
    LedgerStatementModule
  ],
  providers: [],
  exports: [],
  declarations: [ProfitAndLossComponent,],
})
export class ProfitAndLossModule {}