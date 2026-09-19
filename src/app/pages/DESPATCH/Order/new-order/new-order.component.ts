import {
  Component,
  OnInit,
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from 'src/app/services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DxSelectBoxModule,
  DxCheckBoxModule,
  DxDateBoxModule,
  DxDataGridModule,
  DxTextAreaModule,
  DxButtonModule,
  DxPopupModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';

export interface SizeConfig {
  id: string;
  name: string;
  packQty: number; // the (30) in red
  description: string;
}
export interface CartItem {
  id: number;
  categoryId: number | null;
  artNoId: any;
  colorId: string | null;
  imageUrl?: string;
  packingType: string;
  sizes: any[];
}
@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss'],
})
export class NewOrderComponent implements OnInit {
  // Navigation tabs
  activeTab: 'dealer' | 'subdealer' = 'dealer';
  searchQuery: string = '';

  // Form State
  isEditMode = false;

  isLoadingDealers = false;
  isLoadingSubDealers = false;
  isLoadingCategories = false;
  isLoadingArtNos = false;
  isLoadingSizes = false;

  allArtNos: string[] = [];
  cartItems: CartItem[] = [];

  // Current Editing Item (for modal)
  currentEditingItem!: CartItem;

  // Cut Size Popup State
  isCutSizePopupVisible = false;
  currentCutSize: any = null;
  currentCutSizeQuantities: { [key: string]: number } = {};

  colors: any[] = [];
  categories: any[] = [];
  artNos: any[] = [];
  artNosDataSource: any = null;
  sizeConfigurations: SizeConfig[] = [];

  warehouses: any[] = [];
  selectedWarehouseId: any = null;
  distributorsCache: { [key: string]: any[] } = {};
  currentDistributors: any[] = [];
  itemsList: any[] = [];

  selectedDealerId: any = null;

  constructor(
    private dataService: DataService,
    private http: HttpClient,
  ) {
    this.currentEditingItem = this.getEmptyCartItem();
  }

  ngOnInit(): void {
    this.loadDealers();
    this.loadCategories();
    this.loadWarehouses();
  }

  loadCategories() {
    this.dataService.Get_GropDown('ARTICLECATEGORY').subscribe(
      (res: any) => {
        this.categories = (Array.isArray(res) ? res : res || []).map(
          (item: any) => ({
            id: item.ID || item.id,
            name: item.DESCRIPTION || item.description,
          }),
        );
      },
      (error) => console.error('Error fetching ARTICLECATEGORY', error),
    );
  }

  loadWarehouses() {
    this.dataService.Get_GropDown('WAREHOUSE').subscribe(
      (res: any) => {
        this.warehouses = (Array.isArray(res) ? res : res || []).map(
          (item: any) => ({
            id: item.ID || item.id,
            name: item.DESCRIPTION || item.description,
          }),
        );
        if (this.warehouses.length > 0) {
          this.selectedWarehouseId = this.warehouses[0].id;
        }
      },
      (error) => console.error('Error fetching WAREHOUSE', error),
    );
  }

  loadDealers() {
    this.loadDealerDataForTab(this.activeTab);
  }

  loadDealerDataForTab(tab: 'dealer' | 'subdealer') {
    if (this.distributorsCache[tab]) {
      this.currentDistributors = this.distributorsCache[tab];
      return;
    }

    this.isLoadingDealers = true;
    this.currentDistributors = [];
    const apiName = tab === 'dealer' ? 'DEALER' : 'SUB_DEALER';

    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const companyId = sessionData.SELECTED_COMPANY?.COMPANY_ID || 15;

    const payload = {
      NAME: apiName,
    };

    this.dataService.Item_Dropdown(payload).subscribe(
      (res: any) => {
        const data = (Array.isArray(res) ? res : res || []).map(
          (item: any) => ({
            ...item,
            NAME: item.DESCRIPTION || item.description,
            TYPE: apiName,
          }),
        );

        this.distributorsCache[tab] = data;
        this.currentDistributors = data;
        this.isLoadingDealers = false;
      },
      (error) => {
        console.error(`Error fetching ${apiName}`, error);
        this.isLoadingDealers = false;
      },
    );
  }

  processItemsList() {
    // Extract unique artNos, colors, and size configurations from itemsList
    const uniqueArtNos = new Map();
    const uniqueColors = new Map();
    const uniqueSizes = new Map();

    this.itemsList.forEach((item) => {
      // ArtNo
      if (item.ART_NO) {
        uniqueArtNos.set(item.ART_NO, {
          id: item.ART_NO,
          categoryId: item.TYPE_ID,
          name: item.ART_NO,
          image: item.IMAGE,
        });
      }
      // Color
      if (item.COLOR_ID) {
        uniqueColors.set(item.COLOR_ID, {
          id: item.COLOR_ID,
          name: item.COLOR_NAME,
          hex: item.COLOR_CODE,
        });
      }
      // SizeRun
      if (item.SIZERUN_ID) {
        uniqueSizes.set(item.SIZERUN_ID, {
          id: item.SIZERUN_ID.toString(),
          name: item.SIZERUN_NAME,
          packQty: item.QTY || 30, // Fallback to 30 if QTY not present
          description: '',
        });
      }
    });

    this.artNos = Array.from(uniqueArtNos.values());
    this.colors = Array.from(uniqueColors.values());

    // If API provided sizes, replace the dummy ones
    if (uniqueSizes.size > 0) {
      this.sizeConfigurations = Array.from(uniqueSizes.values());
    }
  }

  getEmptyCartItem(): CartItem {
    return {
      id: 0,
      categoryId: null,
      artNoId: null,
      colorId: null,
      packingType: 'Case',
      sizes: [],
      imageUrl: '',
    };
  }

  // --- Left Side Actions ---
  setActiveTab(tab: 'dealer' | 'subdealer') {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.selectedDealerId = null;
      this.currentEditingItem = this.getEmptyCartItem();
      this.artNos = [];
      this.colors = [];
      this.loadDealerDataForTab(tab);
    }
  }

  onDealerChange(e: any) {
    // Only reset dependent fields if this is an actual user change (not initial binding)
    if (e.previousValue !== undefined && e.previousValue !== e.value) {
      this.currentEditingItem = this.getEmptyCartItem();
      this.artNos = [];
      this.colors = [];
    }
  }

  onCategoryChange(e: any) {
    // Only reset dependent fields if this is an actual user change (not initial binding)
    if (e.previousValue !== undefined && e.previousValue !== e.value) {
      if (this.currentEditingItem) {
        this.currentEditingItem.artNoId = null;
        this.currentEditingItem.colorId = null;
      }
    }

    if (e.value) {
      this.loadArtNos(e.value);
    } else {
      this.artNos = [];
    }
  }

  loadArtNos(categoryId: any) {
    this.isLoadingArtNos = true;
    this.allArtNos = [];
    this.artNos = [];
    this.dataService
      .getNewOrderArtNo({ CategoryID: categoryId.toString() })
      .subscribe(
        (res: any) => {
          this.isLoadingArtNos = false;
          if (Array.isArray(res)) {
            this.allArtNos = res.map(String);
          } else if (typeof res === 'string') {
            try {
              const parsed = JSON.parse(res);
              this.allArtNos = Array.isArray(parsed) ? parsed.map(String) : [];
            } catch (e) {
              this.allArtNos = res.split(',').filter((s) => s.trim() !== '');
            }
          }
          // Use DevExtreme DataSource for native searching and pagination
          this.artNosDataSource = new DataSource({
            store: this.allArtNos,
            paginate: true,
            pageSize: 50,
          });
        },
        (error) => {
          this.isLoadingArtNos = false;
          console.error('Error fetching Art Nos', error);
        },
      );
  }

  // onArtNoInput removed because DevExtreme DataSource handles searching natively

  onArtNoChange(e: any) {
    if (e.previousValue !== undefined && e.previousValue !== e.value) {
      if (this.currentEditingItem) {
        this.currentEditingItem.colorId = null;
        this.currentEditingItem.sizes = [];
        this.currentEditingItem.imageUrl = '';
      }
    }

    if (e.value && this.currentEditingItem?.categoryId) {
      this.fetchColors(e.value, this.currentEditingItem.categoryId);
    } else {
      this.colors = [];
    }
  }

  fetchColors(artNo: string, categoryId: any) {
    const payload = { ArtNo: artNo, CategoryID: categoryId.toString() };
    this.dataService.getNewOrderArtColor(payload).subscribe(
      (res: any) => {
        if (res && res.flag === '1' && Array.isArray(res.Colors)) {
          this.colors = res.Colors.map((c: any) => ({
            id: c.Color,
            name: c.Color,
            hex: this.getHexForColor(c.Color),
          }));

          if (this.colors.length > 0) {
            // Auto select the first one if none is selected
            if (!this.currentEditingItem.colorId) {
              this.selectColor(this.colors[0].id);
            }
          }
        } else {
          this.colors = [];
        }
      },
      (err) => console.error('Error fetching colors', err),
    );
  }

  getHexForColor(colorName: string): string {
    const name = colorName ? colorName.toUpperCase().trim() : '';
    const map: any = {
      // Base Colors
      BLACK: '#000000',
      BLUE: '#0000FF',
      RED: '#FF0000',
      WHITE: '#FFFFFF',
      GREEN: '#008000',
      GREY: '#808080',
      BROWN: '#A52A2A',
      NAVY: '#000080',
      TAN: '#D2B48C',
      YELLOW: '#FFFF00',
      ORANGE: '#FFA500',
      PURPLE: '#800080',
      PINK: '#FFC0CB',
      MAROON: '#800000',
      OLIVE: '#808000',
      CYAN: '#00FFFF',
      MAGENTA: '#FF00FF',
      TEAL: '#008080',
      SILVER: '#C0C0C0',
      GOLD: '#FFD700',

      // Extended/Compound Colors
      'SKY BLUE': '#87CEEB',
      'LIGHT BLUE': '#ADD8E6',
      'DARK BLUE': '#00008B',
      MOUSE: '#8c543c',
      BEIGE: '#F5F5DC',
      KHAKI: '#C3B091',
      CAMEL: '#C19A6B',
      MUSTARD: '#FFDB58',
      'OLIVE GREEN': '#556B2F',
      CHARCOAL: '#36454F',
      RUST: '#B7410E',
      BURGUNDY: '#800020',
      PEACH: '#FFE5B4',
      LILAC: '#C8A2C8',
      MINT: '#98FF98',
      CORAL: '#FF7F50',
      CHERRY: '#D2042D',
    };

    // Check exact match
    if (map[name]) return map[name];

    const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
      if (name.includes(key)) {
        return map[key];
      }
    }

    return '#cccccc'; // Default fallback color
  }

  cancelForm() {
    this.isEditMode = false;
    this.onColorChange(this.currentEditingItem.colorId);
    // this.currentEditingItem = this.getEmptyCartItem();
    // this.artNos = [];
    // this.colors = [];
  }

  selectColor(colorId: string) {
    if (this.currentEditingItem.colorId === colorId) return;
    this.currentEditingItem.colorId = colorId;
    this.onColorChange(colorId);
  }

  onColorChange(color: string) {
    if (
      !this.currentEditingItem?.artNoId ||
      !this.currentEditingItem?.categoryId
    )
      return;

    this.isLoadingSizes = true;
    const payload = {
      ArtNo: this.currentEditingItem.artNoId,
      CategoryID: this.currentEditingItem.categoryId.toString(),
      Color: color,
    };

    this.dataService.getNewOrderArtNoDetails(payload).subscribe(
      (res: any) => {
        this.isLoadingSizes = false;
        if (res && res.flag === '1') {
          this.currentEditingItem.imageUrl = res.IMAGE_NAME
            ? `https://mmarkonline.com/artimages/${res.IMAGE_NAME}`
            : '';

          if (Array.isArray(res.Case)) {
            this.currentEditingItem.sizes = res.Case.map((c: any) => ({
              sizeId: c.PackingID,
              description: c.Description,
              isCutSize: c.IsCutSize,
              availableSizes:
                c.IsCutSize && c.Sizes
                  ? c.Sizes.replace(/"/g, '')
                      .split(',')
                      .map((s: string) => s.trim())
                  : [],
              cutSizeQuantities: {},
              combination: c.IsCutSize
                ? ''
                : (c.Combination || '').replace(/,\s*/g, ', '),
              pairQty: c.PairQty,
              qty: 0,
            }));
          } else {
            this.currentEditingItem.sizes = [];
          }
        }
      },
      (err) => {
        this.isLoadingSizes = false;
        console.error('Error fetching details', err);
      },
    );
  }

  incrementSize(sizeId: any) {
    const size = this.currentEditingItem.sizes.find((s) => s.sizeId === sizeId);
    if (size) {
      if (size.isCutSize && size.qty === 0) {
        this.openCutSizePopup(size);
      } else {
        size.qty++;
      }
    }
  }

  decrementSize(sizeId: any) {
    const size = this.currentEditingItem.sizes.find((s) => s.sizeId === sizeId);
    if (size && size.qty > 0) {
      size.qty--;
      if (size.isCutSize && size.qty === 0) {
        size.cutSizeQuantities = {};
        size.combination = '';
      }
    }
  }

  onMainQtyInput(size: any, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');

    if (value === '') {
      size.qty = 0;
      return;
    }

    let parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) {
      parsed = 0;
      inputElement.value = '0';
    } else {
      inputElement.value = parsed.toString();
    }

    size.qty = parsed;

    if (size.isCutSize) {
      if (size.qty === 0) {
        size.cutSizeQuantities = {};
        size.combination = '';
      } else if (Object.keys(size.cutSizeQuantities || {}).length === 0) {
        this.openCutSizePopup(size);
      }
    }
  }

  onMainQtyBlur(size: any, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value === '') {
      inputElement.value = '0';
    }
  }

  // --- Cut Size Popup Methods ---
  openCutSizePopup(size: any) {
    this.currentCutSize = size;
    // Clone to allow cancelling
    this.currentCutSizeQuantities = { ...(size.cutSizeQuantities || {}) };
    this.isCutSizePopupVisible = true;
  }

  closeCutSizePopup() {
    if (this.currentCutSize) {
      if (
        Object.keys(this.currentCutSize.cutSizeQuantities || {}).length === 0
      ) {
        this.currentCutSize.qty = 0;
      }
    }
    this.isCutSizePopupVisible = false;
    this.currentCutSize = null;
  }

  getCutSizeTotal(): number {
    if (!this.currentCutSizeQuantities) return 0;
    return Object.values(this.currentCutSizeQuantities).reduce(
      (a, b) => a + b,
      0,
    );
  }

  incrementCutSizeQty(s: string) {
    if (this.getCutSizeTotal() >= this.currentCutSize.pairQty) return;
    if (!this.currentCutSizeQuantities[s]) {
      this.currentCutSizeQuantities[s] = 0;
    }
    this.currentCutSizeQuantities[s]++;
  }

  decrementCutSizeQty(s: string) {
    if (this.currentCutSizeQuantities[s] > 0) {
      this.currentCutSizeQuantities[s]--;
    }
  }

  onCutSizeQtyInput(s: string, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');

    if (value === '') {
      this.currentCutSizeQuantities[s] = 0;
      return;
    }

    let parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) {
      parsed = 0;
    }

    // Ensure they can't type a value that exceeds the total allowed
    const currentTotalWithoutThis =
      this.getCutSizeTotal() - (this.currentCutSizeQuantities[s] || 0);
    if (currentTotalWithoutThis + parsed > this.currentCutSize.pairQty) {
      parsed = this.currentCutSize.pairQty - currentTotalWithoutThis;
    }

    inputElement.value = parsed.toString();
    this.currentCutSizeQuantities[s] = parsed;
  }

  onCutSizeQtyBlur(s: string, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value === '') {
      inputElement.value = '0';
    }
  }

  saveCutSize() {
    const total = this.getCutSizeTotal();
    if (total !== this.currentCutSize.pairQty) {
      alert(
        `Total quantity must be exactly ${this.currentCutSize.pairQty}. Currently it is ${total}.`,
      );
      return;
    }

    // Save configurations back to the size object
    this.currentCutSize.cutSizeQuantities = {
      ...this.currentCutSizeQuantities,
    };

    // Generate combination string for display
    const comboParts = [];
    for (const size of this.currentCutSize.availableSizes) {
      const q = this.currentCutSize.cutSizeQuantities[size];
      if (q > 0) {
        comboParts.push(`${size}x${q}`);
      }
    }
    this.currentCutSize.combination = comboParts.join(', ');

    if (this.currentCutSize.qty === 0) {
      this.currentCutSize.qty = 1;
    }
    this.closeCutSizePopup();
  }

  getCurrentItemTotalQty(): number {
    return this.currentEditingItem.sizes.reduce(
      (sum, size) => sum + size.qty,
      0,
    );
  }

  saveToCart() {
    if (this.getCurrentItemTotalQty() === 0) {
      // Might want a warning in real app
    }

    if (this.isEditMode) {
      const index = this.cartItems.findIndex(
        (item) => item.id === this.currentEditingItem.id,
      );
      if (index !== -1) {
        const updatedItem = JSON.parse(JSON.stringify(this.currentEditingItem));
        updatedItem.sizes.forEach(
          (size: any) => (size.cartId = updatedItem.id),
        );
        this.cartItems[index] = updatedItem;
      }
    } else {
      const newItem = JSON.parse(JSON.stringify(this.currentEditingItem));
      newItem.id = Date.now();
      newItem.sizes.forEach((size: any) => (size.cartId = newItem.id));
      this.cartItems.push(newItem);
    }

    console.log('Cart Data: ', this.cartItems);
    this.cancelForm();
  }

  editCartItem(item: CartItem) {
    this.isEditMode = true;
    this.currentEditingItem = JSON.parse(JSON.stringify(item));
    if (this.currentEditingItem.categoryId) {
      this.loadArtNos(this.currentEditingItem.categoryId);
    }
    if (this.currentEditingItem.categoryId && this.currentEditingItem.artNoId) {
      this.fetchColors(
        this.currentEditingItem.artNoId,
        this.currentEditingItem.categoryId,
      );
    }
  }

  removeCartItem(id: number) {
    this.cartItems = this.cartItems.filter((item) => item.id !== id);
  }

  getItemTotalPairs(item: CartItem): number {
    let total = 0;
    for (const size of item.sizes) {
      if (size.qty > 0) {
        total += size.qty * (size.pairQty || 1);
      }
    }
    return total;
  }

  getCartTotalPairs(): number {
    let total = 0;
    for (const item of this.cartItems) {
      total += this.getItemTotalPairs(item);
    }
    return total;
  }

  getCartActiveSizes(item: CartItem) {
    return item.sizes.filter((s) => s.qty > 0);
  }

  // Helpers for display
  getCategoryName(id: number | null): string {
    return this.categories.find((c) => c.id === id)?.name || '';
  }

  getArtNoName(id: any): string {
    return id || '';
  }

  getArtNoImage(id: any): string {
    return this.currentEditingItem?.imageUrl || '';
  }

  getColor(id: string | null): any {
    return this.colors.find((c) => c.id === id);
  }

  getSizeName(sizeId: string): string {
    return this.sizeConfigurations.find((c) => c.id === sizeId)?.name || '';
  }

  getSizePackQty(sizeId: string): number | null {
    return (
      this.sizeConfigurations.find((c) => c.id === sizeId)?.packQty || null
    );
  }

  getSizeDescription(sizeId: string): string {
    return (
      this.sizeConfigurations.find((c) => c.id === sizeId)?.description || ''
    );
  }

  submitOrder() {
    console.log('Order Submitted', this.cartItems);
    alert('Order Submitted!');
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
    DxButtonModule,
    DxPopupModule,
    DxTextBoxModule,
  ],
  declarations: [NewOrderComponent],
  exports: [NewOrderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NewOrderModule {}
