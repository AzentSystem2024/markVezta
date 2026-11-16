import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NgModule, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxLoadIndicatorModule,
  DxPopupModule,
  DxScrollViewModule
} from 'devextreme-angular';

import { DataService } from 'src/app/services/data.service';

interface PendingActivity {
  ID: number;
  DESCRIPTION: string;
  CREATE_COUNT: number;
  VERIFY_COUNT: number;
  APPROVE_COUNT: number;
  MENU_PATH: string;
}

@Component({
  selector: 'app-pending-activity',
  templateUrl: './pending-activity.component.html',
  styleUrls: ['./pending-activity.component.scss']
})
export class PendingActivityComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  isPanelVisible = true;
  isClosing = false;
  showAll = false;

  taskBarData: PendingActivity[] = [];
  userId: any;
  userID: any;
  selected_Company_id: any;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private dataservice: DataService
  ) { }

  ngOnInit(): void {
    this.sessionDetails();
    this.getPendingActivities();
  }

  sessionDetails(): void {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );

    this.selected_Company_id = sessionData?.SELECTED_COMPANY?.COMPANY_ID;
    this.userID = sessionData?.USER_ID;
  }

  getPendingActivities(): void {
    this.isLoading = true;

    const payload = {
      USER_ID: this.userID,
      COMPANY_ID: this.selected_Company_id
    };

    this.dataservice.TaskBarApi(payload).subscribe({
      next: (res: any) => {
        this.taskBarData = res.TASK_LIST || [];
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('TaskBar API Error:', err);
        this.isLoading = false;
      }
    });
  }

  // Total pending count
  get totalPending(): number {
    if (!this.taskBarData || this.taskBarData.length === 0) return 0;
    return this.taskBarData.reduce(
      (total, item) => total + (Number(item.VERIFY_COUNT) || 0), 0
    );
  }

  // Normal view shows first 2, View All shows all
  get displayedActivities(): PendingActivity[] {
    if (!this.taskBarData) return [];
    return this.showAll
      ? this.taskBarData
      : this.taskBarData.slice(0, 2);
  }

  toggleShowMore(): void {
    this.showAll = !this.showAll;
  }

  closeWithAnimation(): void {
    if (this.isClosing) return;
    this.isClosing = true;
    setTimeout(() => {
      this.isPanelVisible = false;
      this.isClosing = false;
      this.close.emit();
    }, 240);
  }

  togglePanel(): void {
    this.closeWithAnimation();
  }

  navigateToModule(activity: PendingActivity): void {
    if (!activity.MENU_PATH) {
      return;
    }

    this.closeWithAnimation();
    this.router.navigateByUrl(activity.MENU_PATH);
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    DxPopupModule,
    DxScrollViewModule,
    DxLoadIndicatorModule
  ],
  declarations: [PendingActivityComponent],
  exports: [PendingActivityComponent]
})
export class PendingActivityModule { }
