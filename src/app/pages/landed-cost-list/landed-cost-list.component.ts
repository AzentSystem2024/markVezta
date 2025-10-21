import { Component, OnInit, NgModule, ViewChild } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { DxCheckBoxModule } from 'devextreme-angular';
import { DxRadioGroupModule } from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import {
  LandedCostFormComponent,
  LandedCostFormModule,
} from 'src/app/components/library/landed-cost-form/landed-cost-form.component';
import { ItemProperty1FormComponent } from 'src/app/components/library/item-property1-form/item-property1-form.component';
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-landed-cost-list',
  templateUrl: './landed-cost-list.component.html',
  styleUrls: ['./landed-cost-list.component.scss'],
})
export class LandedCostListComponent implements OnInit {
  @ViewChild(LandedCostFormComponent) landedcostComponent: LandedCostFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  currencyOptions= [{ text: 'Local', value: true }, { text: 'Supplier', value: false }];
  amountOptions:any[]=[{ text: 'Fixed Amount', value: true }, { text: 'Percentage', value: false }];
  isLocalCurrency:boolean=true;
  isFixedAmount:boolean=true;
  landedcost:any;
  isAddLandedcostPopupOpened=false;
  showFilterRow=true;
  showHeaderFilter=true;
  constructor(private dataservice:DataService,private exportService: ExportService
    ){}
    onExporting(event: any) {
      this.exportService.onExporting(event,'Landed_cost-list');
    }
  addLandedcost(){
    this.isAddLandedcostPopupOpened=true;
  }
  IS_INACTIVE: boolean = false;

  getStatus(): string {
    return this.IS_INACTIVE ? 'Inactive' : 'Active';
  }

  private loadDropdownData(): void {
    this.dataservice.getDropdownData('LANDED_COST').subscribe((data) => {
      this.landedcost = data;
      console.log(this.landedcost,"LANDEDCOST")
    });
  }

  showLandedcost() {
    this.dataservice.getLandedcostData().subscribe((response) => {
      // this.landedcost = response;
      // console.log(response,"LANDEDCOST");
    });
  }
  onClickSaveLandedcost() {
    const {
      DESCRIPTION,
      IS_LOCAL_CURRENCY,
      IS_FIXED_AMOUNT,
      VALUE,
      COMPANY_ID,
      IS_INACTIVE,
    } = this.landedcostComponent.getNewLandedcost();
    console.log(
      'inserted data',
      DESCRIPTION,
      IS_LOCAL_CURRENCY,
      IS_FIXED_AMOUNT,
      VALUE,
      COMPANY_ID,
      IS_INACTIVE
    );
    this.dataservice
      .postLandedcostData(
        DESCRIPTION,
        IS_LOCAL_CURRENCY,
        IS_FIXED_AMOUNT,
        VALUE,
        COMPANY_ID,
        IS_INACTIVE
      )
      .subscribe((response) => {
        if (response) {
          this.showLandedcost();
        }
      });
  }
  onRowUpdating(event) {
    const updatedData = { ...event.oldData, ...event.newData };

    const {
      ID,
      DESCRIPTION,
      IS_LOCAL_CURRENCY,
      IS_FIXED_AMOUNT,
      VALUE,
      COMPANY_ID,
      IS_INACTIVE,
    } = updatedData;
    console.log(
      'inserted data',
      DESCRIPTION,
      IS_LOCAL_CURRENCY,
      IS_FIXED_AMOUNT,
      VALUE,
      COMPANY_ID,
      IS_INACTIVE
    );
    this.dataservice
      .updateLandedcostData(
        ID,
        DESCRIPTION,
        IS_LOCAL_CURRENCY,
        IS_FIXED_AMOUNT,
        VALUE,
        COMPANY_ID,
        IS_INACTIVE
      )
      .subscribe((response) => {
        if (response) {
          this.showLandedcost();
        }
      });
  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const {
      ID,
      DESCRIPTION,
      IS_LOCAL_CURRENCY,
      IS_FIXED_AMOUNT,
      VALUE,
      COMPANY_ID,
      IS_INACTIVE,
    } = selectedRow;

    this.dataservice
      .removeLandedcost(
        ID,
        DESCRIPTION,
        IS_LOCAL_CURRENCY,
        IS_FIXED_AMOUNT,
        VALUE,
        COMPANY_ID,
        IS_INACTIVE
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
          this.showLandedcost();
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

  selectLandedCostData(id:any){
    this.dataservice.selectLandedCost(id).subscribe((response:any) => {
      console.log(response)
    })
  }
  ngOnInit(): void {
    this.loadDropdownData();
    this.showLandedcost();
  }
  calculateStatus(rowData) {
    return rowData.IS_INACTIVE ? 'Inactive' : 'Active';
  }
  calculateCurrency(rowData) {
    return rowData.IS_LOCAL_CURRENCY ? 'Local' : 'Supplier';
  }
  calculateAmount(rowData) {
    return rowData.IS_FIXED_AMOUNT ? 'Fixed Amount' : 'Percentage';
  }
}


@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    LandedCostFormModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
  ],
  providers: [],
  exports: [],
  declarations: [LandedCostListComponent],
})
export class LandedCostListModule {}
