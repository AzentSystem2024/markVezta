import { Component, OnInit, NgModule, ViewChild } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import {
  ItmBrandFormModule,
  ItmBrandFormComponent,
} from 'src/app/components/library/itm-brand-form/itm-brand-form.component';
import notify from 'devextreme/ui/notify';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-item-brand-list',
  templateUrl: './item-brand-list.component.html',
  styleUrls: ['./item-brand-list.component.scss'],
})
export class ItemBrandListComponent implements OnInit {
  @ViewChild(ItmBrandFormComponent) itembrandComponent: ItmBrandFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  
  brand:any;
  isAddBrandPopupOpened=false;
  showFilterRow=true;
  showHeaderFilter=true;
  constructor(private dataservice:DataService,private exportService: ExportService){}
  onExporting(event: any) {
    this.exportService.onExporting(event,'Brand-list');
  }
  addBrand(){
    this.isAddBrandPopupOpened=true;
  }

  showBrand() {
    this.dataservice.getBrandData().subscribe((response) => {
      this.brand = response;
      console.log(response);
    });
  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE, BRAND_NAME, COMPANY_ID } = selectedRow;

    this.dataservice
      .removeBrand(ID, CODE, BRAND_NAME, COMPANY_ID)
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
          this.showBrand();
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

  onClickSaveBrand() {
    const { CODE, BRAND_NAME, COMPANY_ID } =
      this.itembrandComponent.getNewBrandData();
    console.log('inserted data', CODE, BRAND_NAME, COMPANY_ID);
    this.dataservice
      .postBrandData(CODE, BRAND_NAME, COMPANY_ID)
      .subscribe((response) => {
        if (response) {
          this.showBrand();
        }
      });
  }
  onRowUpdating(event) {
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };
    let id = combinedData.ID;
    let code = combinedData.CODE;
    let brand_name = combinedData.BRAND_NAME;
    let company_id = combinedData.COMPANY_ID;

    this.dataservice
      .updateBrand(id, code, brand_name, company_id)
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: 'Item Brand updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
          this.showBrand();
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

  ngOnInit(): void {
    this.showBrand();
  }
  refresh = () => {
    this.dataGrid.instance.refresh();
  };
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    ItmBrandFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [ItemBrandListComponent],
})
export class ItemBrandListModule {}
