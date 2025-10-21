import { Component,OnInit,NgModule,ViewChild } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { CountryFormComponent,CountryFormModule } from 'src/app/components/library/country-form/country-form.component';
import notify from 'devextreme/ui/notify';
import DataSource from 'devextreme/data/data_source';
import { DxPopupModule } from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { FormTextboxModule } from 'src/app/components';
import { DxFormModule } from 'devextreme-angular';
import { ExportService } from 'src/app/services/export.service';


@Component({
  selector: 'app-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.scss']
})
export class CountryListComponent implements OnInit {

  @ViewChild(CountryFormComponent) countryComponent: CountryFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;

   readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  country:any;
  showFilterRow=true;
  showHeaderFilter=true;
  isAddCountryPopupOpened=false;
  constructor(private dataservice:DataService,private exportService: ExportService){}
  onExporting(event: any) {
    this.exportService.onExporting(event,'Country-list');
  }
  addCountry(){
    this.isAddCountryPopupOpened=true;
  }

  onClickSaveCountry(){
    const { CODE, COUNTRY_NAME ,COMPANY_ID} =this.countryComponent.getNewCountryData();
    console.log('inserted data',CODE,COUNTRY_NAME,COMPANY_ID);

    // const codeExists = this.country.some(country => country.CODE === CODE);
    // if (codeExists) {
    //     console.log('Country code already exists!');
    //     return; // Don't proceed further
    // }

    this.dataservice.postCountryData(CODE,COUNTRY_NAME,COMPANY_ID).subscribe(
      (response)=>{
        if(response){
          this.showCountry();
        }
      }
    )

  }
  onRowRemoving(event: any) {
    var SelectedRow = event.key;
    console.log('selected row',SelectedRow);
    this.dataservice.removeCountry(SelectedRow.ID).subscribe(() => {
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
        this.showCountry();
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
  onRowUpdating(event) {
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };
    let id = combinedData.ID;
    let code = combinedData.CODE;
    let country_name = combinedData.COUNTRY_NAME;
    
   

    this.dataservice
      .updateCountry(id, code, country_name)
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: 'Country updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
          this.showCountry();
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
  
  showCountry(){
     this.dataservice.getCountryData().subscribe(
      (response)=>{
            this.country=response;
            console.log(response);
      }
     )
  }
  ngOnInit(): void {
    this.showCountry();
  }
  refresh = () => {
    this.dataGrid.instance.refresh();
  };
  keyPressCountry(event: any) {
    console.log('key pressed');
    var charCode = (event.which) ? event.which : event.keyCode;
    var inputValue = event.target.value;

  // Disallow white space at the start
    if (inputValue.length === 0 && charCode === 32) {
    event.preventDefault();
    return false;
    }
    // Disallow Numbers 0-9 and Special Characters
    if ((charCode >= 48 && charCode <= 57) || (charCode >= 33 && charCode <= 47) || (charCode >= 58 && charCode <= 64) || (charCode >= 91 && charCode <= 96) || (charCode >= 123 && charCode <= 126)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }
}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,CountryFormModule,DxPopupModule,DxTextBoxModule,FormTextboxModule,DxFormModule
  ],
  providers: [],
  exports: [],
  declarations: [CountryListComponent],
})
export class CountryListModule{}

