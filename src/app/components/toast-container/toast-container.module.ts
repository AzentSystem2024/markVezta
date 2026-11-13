import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastContainerComponent } from './toast-container.component';

@NgModule({
  declarations: [ToastContainerComponent],
  imports: [CommonModule],
  exports: [ToastContainerComponent],
})
export class ToastContainerModule {}

