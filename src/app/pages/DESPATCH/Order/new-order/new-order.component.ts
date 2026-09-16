import { Component, OnInit, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DxSelectBoxModule,
  DxCheckBoxModule,
  DxDateBoxModule,
  DxDataGridModule,
  DxTextAreaModule,
  DxButtonModule
} from 'devextreme-angular';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss']
})
export class NewOrderComponent implements OnInit {
  currentDate: any = new Date();
  
  // Checkboxes
  hasSubdealer: boolean = false;

  // Selected values
  selectedDealerId: number | null = null;
  selectedSubdealerId: number | null = null;
  selectedDeliveryAddressId: number | null = null;
  selectedWarehouseId: number | null = null;
  remarks: string = '';
  
  fullAddressText: string = '';

  // Dummy Data
  dealers = [
    { id: 1, name: 'K.S TRADERS' },
    { id: 2, name: 'ABC ENTERPRISES' }
  ];

  allSubdealers = [
    { id: 101, dealerId: 1, name: 'METRO SHOE PARK' },
    { id: 102, dealerId: 1, name: 'CITY FOOTWEAR' },
    { id: 103, dealerId: 2, name: 'ALPHA RETAIL' }
  ];
  filteredSubdealers: any[] = [];

  allDeliveryAddresses = [
    { id: 201, dealerId: 1, name: 'ARANTHANGI', fullAddress: 'SARAPOJI VANIGA VAZGAGAM , ARANTHANGI' },
    { id: 202, dealerId: 1, name: 'CHENNAI MAIN', fullAddress: '123 MAIN ST, CHENNAI' },
    { id: 203, dealerId: 2, name: 'MADURAI BRANCH', fullAddress: '456 SOUTH ST, MADURAI' }
  ];
  filteredDeliveryAddresses: any[] = [];

  allWarehouses = [
    { id: 301, dealerId: 1, name: 'BOYZONE POLYMERS INDIA PVT LTD., TAMILNADU' },
    { id: 302, dealerId: 2, name: 'MAIN WAREHOUSE, KERALA' }
  ];
  filteredWarehouses: any[] = [];

  // Grid Data
  orderItems: any[] = [];

  // Grid Dropdown Data
  items = [
    { id: 1, name: 'Item A' },
    { id: 2, name: 'Item B' }
  ];

  types = [
    { id: 1, itemId: 1, name: 'Type 1A' },
    { id: 2, itemId: 1, name: 'Type 1B' },
    { id: 3, itemId: 2, name: 'Type 2A' }
  ];

  categories = [
    { id: 1, typeId: 1, name: 'Cat 1A-1' },
    { id: 2, typeId: 2, name: 'Cat 1B-1' }
  ];

  artNos = [
    { id: 1, categoryId: 1, name: 'Art-001' },
    { id: 2, categoryId: 1, name: 'Art-002' }
  ];

  colors = [
    { id: 1, artNoId: 1, name: 'Red' },
    { id: 2, artNoId: 1, name: 'Blue' }
  ];

  packingMasterList = [
    { id: 1, name: 'Box (10 pcs)' },
    { id: 2, name: 'Carton (50 pcs)' },
    { id: 3, name: 'Pallet (500 pcs)' }
  ];

  constructor() {
    this.addEmptyRow();
    
    // Update the time every second
    setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }

  ngOnInit(): void {
  }

  onDealerChanged(e: any) {
    this.selectedDealerId = e.value;
    
    // Cascade Subdealers
    this.filteredSubdealers = this.allSubdealers.filter(s => s.dealerId === this.selectedDealerId);
    this.selectedSubdealerId = null; // Reset
    
    // Cascade Delivery Addresses
    this.filteredDeliveryAddresses = this.allDeliveryAddresses.filter(d => d.dealerId === this.selectedDealerId);
    if (this.filteredDeliveryAddresses.length > 0) {
      this.selectedDeliveryAddressId = this.filteredDeliveryAddresses[0].id;
      this.updateFullAddress();
    } else {
      this.selectedDeliveryAddressId = null;
      this.fullAddressText = '';
    }

    // Cascade Warehouses
    this.filteredWarehouses = this.allWarehouses.filter(w => w.dealerId === this.selectedDealerId);
    if (this.filteredWarehouses.length > 0) {
      this.selectedWarehouseId = this.filteredWarehouses[0].id;
    } else {
      this.selectedWarehouseId = null;
    }
  }

  onDeliveryAddressChanged(e: any) {
    this.selectedDeliveryAddressId = e.value;
    this.updateFullAddress();
  }

  updateFullAddress() {
    const addr = this.allDeliveryAddresses.find(a => a.id === this.selectedDeliveryAddressId);
    this.fullAddressText = addr ? addr.fullAddress : '';
  }

  hasSubdealerChanged(e: any) {
    if (!this.hasSubdealer) {
      this.selectedSubdealerId = null;
    }
  }

  addEmptyRow() {
    this.orderItems.push({
      id: Date.now(),
      itemId: null,
      typeId: null,
      categoryId: null,
      artNoId: null,
      colorId: null,
      packingId: null,
      content: '',
      qty: 0
    });
  }

  onRowInserted(e: any) {
    // Add a new empty row after one is inserted if needed, 
    // or just rely on a custom add button.
  }

  // Helper functions for cascading dropdowns in the grid
  getFilteredTypes = (options: any) => {
    return {
      store: this.types,
      filter: options.data ? ['itemId', '=', options.data.itemId] : null
    };
  }

  getFilteredCategories = (options: any) => {
    return {
      store: this.categories,
      filter: options.data ? ['typeId', '=', options.data.typeId] : null
    };
  }

  getFilteredArtNos = (options: any) => {
    return {
      store: this.artNos,
      filter: options.data ? ['categoryId', '=', options.data.categoryId] : null
    };
  }

  getFilteredColors = (options: any) => {
    return {
      store: this.colors,
      filter: options.data ? ['artNoId', '=', options.data.artNoId] : null
    };
  }

  setItemValue = (newData: any, value: any, currentRowData: any) => {
    newData.itemId = value;
    newData.typeId = null;
    newData.categoryId = null;
    newData.artNoId = null;
    newData.colorId = null;
  }

  setTypeValue = (newData: any, value: any, currentRowData: any) => {
    newData.typeId = value;
    newData.categoryId = null;
    newData.artNoId = null;
    newData.colorId = null;
  }
  
  setCategoryValue = (newData: any, value: any, currentRowData: any) => {
    newData.categoryId = value;
    newData.artNoId = null;
    newData.colorId = null;
  }

  setArtNoValue = (newData: any, value: any, currentRowData: any) => {
    newData.artNoId = value;
    newData.colorId = null;
  }

  calculateTotalQty() {
     return this.orderItems.reduce((acc, curr) => acc + (curr.qty || 0), 0);
  }

  onSave() {
    console.log("Save clicked");
  }

  onSubmit() {
    console.log("Submit clicked");
  }
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxDataGridModule,
    DxTextAreaModule,
    DxButtonModule
  ],
  declarations: [NewOrderComponent],
  exports: [NewOrderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NewOrderModule { }
