import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';

@Component({
  selector: 'app-tooltip-cell',
  template: `
  <div [title]="isLongValue ? 'Value exceeds max length of ' + maxLength : ''">
    {{ value }}
  </div>
`,
})
export class TooltipCellComponent {
  @Input() value: string | null = null;
  @Input() maxLength: number = 0;
  
  get isLongValue(): boolean {
    console.log(this.value,"valueeeee")
    return this.value && this.value.length > this.maxLength;
  }
}
@NgModule({
  imports: [
    CommonModule
  ],
  providers: [],
  exports: [TooltipCellComponent],
  declarations: [TooltipCellComponent],
})
export class TooltipCellModule{}
