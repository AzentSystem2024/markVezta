import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule } from '@angular/core';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxLoadIndicatorModule, DxLoadPanelModule, DxNumberBoxModule, DxPopupModule, DxSelectBoxModule, DxTextBoxModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { EditPurchaseInvoiceModule } from '../../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-aged-payables',
  templateUrl: './aged-payables.component.html',
  styleUrls: ['./aged-payables.component.scss']
})
export class AgedPayablesComponent {
      AgedPayableReport: any[]=[];
      isFilterRowVisible:boolean=false
       readonly allowedPageSizes: any = [ 5,10, 'all'];
        displayMode: any = 'full';
        formatted_from_date: any;
        defaultDate: Date = new Date();
      formatted_To_date: string;
      auto:string='auto'
       HeadId: any;
       SuppId: any
       PurchId: any;
        Supplier:any;
        company_list:any=[]
        savedUserData: any;
        selectedInvoice: any;
          isEditInvoice: boolean = false;
          selected_Company_id : any;
 selectedSupplierId: any;
  isEditInvoiceReadOnly: boolean = true;

          constructor(private dataservice: DataService, private fb: FormBuilder,private cdr: ChangeDetectorRef, private router : Router) {
                     this.get_sessionstorage_data()
                     this.sesstion_Details();
                     this.get_Supplier_dropdown()
                    }

ngOnInit() {
  // initialize with today's date
  this.onToDateChange({ value: this.defaultDate });
  this.get_DataSource() //get datasource======== function call==========
}                    

  onExporting(event: any) {
          const fileName = 'SupplierReport';
          this.dataservice.exportDataGridReport(event, fileName);
        }

         onFromDateChange(event: any) {
      const rawDate: Date = new Date(event.value);
      this.formatted_from_date = this.formatDate(rawDate);
      console.log('Formatted Date:', this.formatted_from_date); // example: "2025-04-01"
    }
     
      onSupplierChanged(event:any){
    console.log(event,'event')
    this.selectedSupplierId = event.value

      // Find and log the selected supplier's DESCRIPTION
    const selectedSupplier = this.Supplier.find((item: any) => item.ID === this.selectedSupplierId);
    if (selectedSupplier) {
      console.log('Selected ID:', selectedSupplier.ID);
      console.log('Selected Description:', selectedSupplier.DESCRIPTION);
    }

    // this.selectedBeneficiaryCommonName = selectedSupplier.DESCRIPTION;
    // console.log(this.selectedSupplierName,'======supplier name========')

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

           get_Supplier_dropdown(){
    this.dataservice.Supplier_Dropdown().subscribe((res: any) => {
      console.log('supplier dropdown', res);
      this.Supplier = res;
    });
  }

  //   onViewClick(e: any) {
  //   console.log(e, '=======event==========');
  //   //  const TRANS_TYPE_ID = e.row.data.TRANS_TYPE_ID;
  //   const trans_id = e.row.data.TRANS_ID;


  //     this.dataservice
  //       .selectPurchaseInvoice(trans_id)
  //       .subscribe((response: any) => {
  //         this.selectedInvoice = response.Data;

  //         this.isEditInvoice = true;
  //         this.cdr.detectChanges();
  //         console.log(
  //           this.selectedInvoice,
  //           'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
  //         );
  //       });
  // // this.isEditInvoiceReadOnly = transStatus === 'Approved';

    
  //   }

   onViewClick(e: any) {
      console.log(e,'event');
      this.PurchId = e.row.data.PURCH_ID
      this.SuppId = e.row.data.SUPP_ID
      console.log(this.PurchId);
    sessionStorage.removeItem('PURCHID')
    sessionStorage.removeItem('SUPPID')

      sessionStorage.setItem('PURCHID',(this.PurchId));
      console.log(sessionStorage.getItem('PURCHID'));
      
      sessionStorage.setItem('SUPPID',(this.SuppId));
      console.log(sessionStorage.getItem('SUPPID'));
      
      
      // Navigate to ledger-statement route
      this.router.navigate(['/aged-payable-details']);
     }

               sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')

    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')

    const sessionYear=sessionData.FINANCIAL_YEARS
            console.log(sessionYear,'==================session year==========')
const financialYeaDate=sessionYear[0].DATE_FROM
console.log(financialYeaDate,'=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[[')
this.formatted_from_date=financialYeaDate
    
  }

 get_sessionstorage_data(){
    this.savedUserData = JSON.parse(sessionStorage.getItem('savedUserData'));
     console.log(this.savedUserData)
    this.company_list=this.savedUserData.Companies
    
    }

    get_DataSource(){
       const payload = {
        COMPANY_ID: this.selected_Company_id,
        DATE_FROM: this.formatted_from_date,
         DATE_TO: this.formatted_To_date,
         SUPP_ID: this.selectedSupplierId || 0
      }

       sessionStorage.removeItem('supplierViewClick')
      sessionStorage.setItem('supplierViewClick', JSON.stringify(payload));
     
      console.log(JSON.parse(sessionStorage.getItem('supplierViewClick')));
      console.log(payload,'==========payload================');
      this.dataservice.AgedPayable_Report_Api(payload).subscribe((res: any) => {
        console.log(res, '----------list --------------------------');
        this.AgedPayableReport = res.data;
        
      })
    }

    handleClose(){
       this.isEditInvoice = false;
    }

          summaryColumnsData = {
      totalItems: [
        {
          column: 'AGE_0_30',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AGE_0_30',
          alignment: 'right',
        },
        {
          column: 'AGE_31_60',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AGE_31_60',
          alignment: 'right',
        },
        {
          column: 'AGE_61_90',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AGE_61_90',
          alignment: 'left',
        },
        {
          column: 'AGE_91_120',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AGE_91_120',
          alignment: 'right',
        },
        {
          column: 'AGE_121_150',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AGE_121_150',
          alignment: 'right',
        },
        {
          column: 'AGE_151_180',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AGE_151_180',
          alignment: 'right',
        },
        {
          column: 'AGE_ABOVE_180',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AGE_ABOVE_180',
          alignment: 'right',
        },
        {
          column: 'BALANCE',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'BALANCE',
          alignment: 'left',
        },
      ],
      groupItems: [
    {
      column: 'AGE_0_30',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'AGE_31_60',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'AGE_61_90',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'AGE_91_120',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'AGE_121_150',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'AGE_151_180',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'AGE_ABOVE_180',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'BALANCE',
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
    EditPurchaseInvoiceModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [AgedPayablesComponent,],
})
export class AgedPayablesModule {}