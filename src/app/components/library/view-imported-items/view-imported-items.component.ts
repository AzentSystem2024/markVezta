import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, NgModule, OnChanges, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DxFormModule, DxSelectBoxModule, DxTagBoxModule, DxTextBoxModule } from 'devextreme-angular';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { FormTextboxModule } from '../..';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-view-imported-items',
  templateUrl: './view-imported-items.component.html',
  styleUrls: ['./view-imported-items.component.scss']
})
export class ViewImportedItemsComponent implements OnInit,OnChanges {
  @Input() formdata: any;
  datasource:any;
  batchNo: string = '';
  storesImported: string = '';
  date: string = '';
  user: string = '';

  constructor(private service:DataService){}

  
  ngOnChanges(): void {
    console.log(this.formdata,"id");
    console.log("haaoo")
    const requestData = { "ID": this.formdata };
    this.service.viewImportedData(requestData).subscribe(data=>{
      this.datasource=data;
    })
    this.service.getImportLogData().subscribe(data=>{
      console.log(data,"data");
      const filteredLogData = data.filter(log => log.ID === this.formdata);
      console.log(filteredLogData,"filtereddata")
      this.batchNo=filteredLogData[0].BATCH_NO;
      this.storesImported=filteredLogData[0].STORE_NAME;
      const date = new Date(filteredLogData[0].IMPORT_DATE);
            this.date = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }).toUpperCase(); // Convert the formatted date to uppercase
      this.user=filteredLogData[0].USER_NAME;



    })
  }
  ngOnInit(): void {
    
  }
}

@NgModule({
  imports: [
    DxTextBoxModule,
    DxFormModule,
    FormTextboxModule,
    CommonModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxTagBoxModule,
    DxButtonModule,
    DxDataGridModule,
  ],
  declarations: [ViewImportedItemsComponent],
  exports: [ViewImportedItemsComponent],
})
export class ViewImportedItemsModule {}