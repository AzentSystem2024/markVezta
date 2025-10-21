import { Component, OnInit, NgModule, ViewChild } from '@angular/core';
import { DxButtonModule, DxTextAreaModule } from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import {
  TendersFormComponent,
  TendersFormModule,
} from 'src/app/components/library/tenders-form/tenders-form.component';
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';
import { DxCheckBoxModule } from 'devextreme-angular';


@Component({
  selector: 'app-tenders-list',
  templateUrl: './tenders-list.component.html',
  styleUrls: ['./tenders-list.component.scss'],
})
export class TendersListComponent implements OnInit {
  @ViewChild(TendersFormComponent) tendersComponent: TendersFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  supplier:any;
  tenders:any;
  currencyList:any;
  VATRuleDropdownData:any;
  TenderTypeDropdownData:any;
  showFilterRow=true;
  showHeaderFilter=true;
  isAddTendersPopupOpened=false;
  constructor(private dataservice:DataService,private exportService: ExportService){}
  onExporting(event: any) {
    this.exportService.onExporting(event,'Tenders-list');
  }
  addTenders(){
    this.isAddTendersPopupOpened=true;
  }

  showTenders() {
    this.dataservice.getTendersData().subscribe((response) => {
      this.tenders = response;
      console.log(response);
    });
  }

  
  onClickSaveTenders() {
    const {
      CODE,
      IS_INACTIVE,
      DESCRIPTION,
      ARABIC_DESCRIPTION,
      TENDER_TYPE,
      DISPLAY_ORDER,
      CURRENCY_ID,
      ALLOW_OPENING,
      ALLOW_DECLARATION,
      ADDITIONAL_INFO_REQUIRED,
    } = this.tendersComponent.getNewTenderData();
    console.log(
      'inserted data',
      ALLOW_OPENING,
      ALLOW_DECLARATION,
      ADDITIONAL_INFO_REQUIRED
    );
    this.dataservice
      .postTendersData(
        CODE,
        IS_INACTIVE,
        DESCRIPTION,
        ARABIC_DESCRIPTION,
        TENDER_TYPE,
        DISPLAY_ORDER,
        CURRENCY_ID,
        ALLOW_OPENING,
        ALLOW_DECLARATION,
        ADDITIONAL_INFO_REQUIRED
      )
      .subscribe((response) => {
        if (response) {
          this.showTenders();
        }
      });
  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const {
      ID,
      CODE,
      IS_INACTIVE,
      DESCRIPTION,
      ARABIC_DESCRIPTION,
      TENDER_TYPE,
      DISPLAY_ORDER,
      CURRENCY_ID,
      ALLOW_OPENING,
      ALLOW_DECLARATION,
      ADDITIONAL_INFO_REQUIRED,
    } = selectedRow;

    this.dataservice
      .removeTenders(
        ID,
        CODE,
        IS_INACTIVE,
        DESCRIPTION,
        ARABIC_DESCRIPTION,
        TENDER_TYPE,
        DISPLAY_ORDER,
        CURRENCY_ID,
        ALLOW_OPENING,
        ALLOW_DECLARATION,
        ADDITIONAL_INFO_REQUIRED
      )
      .subscribe(() => {
        try {
          // Your delete logic here
          notify(
            {
              message: 'Delete operation successful',
              position: { at: 'top right', my: 'top right' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
          this.showTenders();
        } catch (error) {
          notify(
            {
              message: 'Delete operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      });
  }

 

  getVATRuleDropDown() {
    this.dataservice
      .getCurrencyData()
      .subscribe((data: any) => {
        this.VATRuleDropdownData = data;
        console.log('dropdownCurrency',this.VATRuleDropdownData);
      });
  }
  onRowUpdating(event) {
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };
    
   

    this.dataservice
      .updateTenders(combinedData)
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: 'Tenders Updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
          this.showTenders();
        } else {
          notify(
            {
              message: 'Your Data Not Saved',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      });
    console.log('old data:', oldData);
    console.log('new data:', updataDate);
    console.log('modified data:', combinedData);

    event.cancel = true; // Prevent the default update operation
  }
  getCurrencyData() {
    this.dataservice
      .getCurrencyData()
      .subscribe((data: any) => {
        this.currencyList = data;
      });
  }
  getTenderTypeDropDown() {
    const dropdowntender = 'TENDERTYPE';
    this.dataservice
      .getDropdownData(dropdowntender)
      .subscribe((data: any) => {
        this.TenderTypeDropdownData = data;
      });
  }
  ngOnInit(): void {
    this.showTenders();
    this.getCurrencyData();
    this. getTenderTypeDropDown();
  }
}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,TendersFormModule,DxCheckBoxModule
  ],
  providers: [],
  exports: [],
  declarations: [TendersListComponent],
})
export class TendersListModule {}
