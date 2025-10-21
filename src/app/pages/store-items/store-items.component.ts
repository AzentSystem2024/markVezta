import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  NgModule,
  Output,
  SimpleChanges,
  EventEmitter,
} from '@angular/core';
import { DxButtonModule, DxDataGridModule } from 'devextreme-angular';
import { FormPopupModule, FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import {
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDateBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTabsModule,
  DxTemplateModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
} from 'devextreme-angular/ui/nested';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
@Component({
  selector: 'app-store-items',
  templateUrl: './store-items.component.html',
  styleUrls: ['./store-items.component.scss'],
})
export class StoreItemsComponent {
  @Input() storeData: any;

  @Output() formClosed: EventEmitter<void> = new EventEmitter<void>();

  countries: any[];
  isParentItemSelected: boolean = false;
  parentitem: any;
  selectedRowKeys: number[] = [];
  allowedFileExtensions: string[] = ['.jpg', '.jpeg', '.gif', '.png'];
  imageSource: string = '';
  isDropZoneActive: boolean = false;
  packing: any[] = [];
  uom: any;
  subcatagory: any;
  vat: any;
  catagory: any;
  brand: any;
  department: any;
  itemtype: any;
  popupVisible: boolean = true;
  imageUploaded: boolean = false;
  textVisible: boolean = true;
  store: any;
  storeName: any;
  itemlabel1: any;
  itemlabel2: any;
  itemlabel3: any;
  itemlabel4: any;
  itemlabel5: any;
  itemprop1: any;
  itemprop2: any;
  itemprop3: any;
  itemprop4: any;
  itemprop5: any;

  constructor(private dataservice: DataService) {
    dataservice.getCountryWithFlags().subscribe((data) => {
      this.countries = data;
    });
    dataservice.getDropdownData('PARENTITEM').subscribe((data) => {
      this.parentitem = data;
    });
    dataservice.getDropdownData('PACKING').subscribe((data) => {
      this.packing = data;
      // console.log(this.packing,"packing")
    });
    dataservice.getDropdownData('UOM').subscribe((data) => {
      this.uom = data;
    });
    dataservice.getSubCategoryData().subscribe((data) => {
      this.subcatagory = data;
    });
    dataservice.getVatclassData().subscribe((data) => {
      this.vat = data;
    });
    dataservice.getDropdownData('ITEMCATEGORY').subscribe((data) => {
      this.catagory = data;
    });
    dataservice.getDropdownData('BRAND').subscribe((data) => {
      this.brand = data;
      // console.log(this.brand, 'BRAND');
    });
    dataservice.getDepartmentData().subscribe((data) => {
      this.department = data;
    });
    dataservice.getDropdownData('ITEMTYPE').subscribe((data) => {
      this.itemtype = data;
    });
    dataservice.getDropdownData('STORE').subscribe((data) => {
      this.store = data;
    });
    dataservice.getItemProperty1Data().subscribe((data) => {
      this.itemprop1 = data;
    });
    dataservice.getItemProperty2Data().subscribe((data) => {
      this.itemprop2 = data;
    });
    dataservice.getItemProperty3Data().subscribe((data) => {
      this.itemprop3 = data;
    });
  }

  copyStoreData: any;

  ngOnInit() {
    if (this.storeData == undefined) {
      this.storeData = new StoreData();
    }
    console.log(this.storeData, 'STOREDATA');
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.storeData.item_stores, 'Stores1');
    const validStore = this.storeData.item_stores.find(
      (store: any) => store.ID > 0
    );

    if (validStore) {
      console.log(validStore.STORE_NAME);
      this.storeName = validStore.STORE_NAME;
      console.log(this.storeName, '-------');
    } else {
      console.log('No store with a valid ID found');
    }
  }
  closeForm(): void {
    this.formClosed.emit();
    this.popupVisible = false;
  }

  onSelectionChanged(event: any) {}

  calculateProfitMargin(): any {
    if (this.storeData.SALE_PRICE > 0 && this.storeData.COST > 0) {
      return (this.storeData.PROFIT_MARGIN =
        ((this.storeData.SALE_PRICE - this.storeData.COST) /
          this.storeData.COST) *
        100);
    } else {
      return 0;
    }
  }
  closeModal() {}
  clearImage() {}
  onFileInputChange($event) {}
  onFileChanged($event) {}
  onUploadStarted($event) {}
  onProgress($event) {}
  onUploaded($event) {}
  onDropZoneLeave($event) {}
  onDropZoneEnter($event) {}
  openModal($event) {}
  onDropZoneClick() {}
}
@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    ItemsFormModule,
    DxTabsModule,
    DxFileUploaderModule,
    DxCheckBoxModule,
    DxValidatorModule,
    DxTextBoxModule,
    DxTemplateModule,
    CommonModule,
    DxoFormItemModule,
    DxDataGridModule,
    DxToolbarModule,
  ],
  providers: [],
  exports: [StoreItemsComponent],
  declarations: [StoreItemsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StoreItemsModule {}

export class StoreData {
  SALE_PRICE: number;
  COST: number;
  PURCH_PRICE: number;
  SALE_PRICE1: number;
  SALE_PRICE2: number;
  SALE_PRICE3: number;
  SALE_PRICE4: number;
  SALE_PRICE5: number;
}
