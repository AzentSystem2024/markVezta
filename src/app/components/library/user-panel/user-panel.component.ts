import { Component, NgModule, Input, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DxDropDownButtonModule } from 'devextreme-angular/ui/drop-down-button';
import { UserMenuSectionModule, UserMenuSectionComponent } from '../user-menu-section/user-menu-section.component';
import { IUser } from '../../../services/auth.service';
import { DataService } from 'src/app/services';
import { DxDataGridModule, DxPopupModule } from 'devextreme-angular';
import { timer } from 'rxjs';
@Component({
  selector: 'user-panel',
  templateUrl: 'user-panel.component.html',
  styleUrls: ['./user-panel.component.scss'],
})

export class UserPanelComponent {
  @Input()
  menuItems: any;

  @Input()
  menuMode!: string;

  @Input()
  user!: IUser | null;

  @ViewChild(UserMenuSectionComponent) userMenuSection: UserMenuSectionComponent;
  notificationCount: any
  popupVisible: boolean = false
  listSyncData: any

  synch_pending_intervel: any
  constructor(private dataservice: DataService,
  ) {


    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '')
    console.log(sessionData)
    this.synch_pending_intervel = sessionData.GeneralSettings.SYNCH_PENDING_INTERVAL

    // this.Get_SyncData()


  }

  ngOnInit() {
    timer(0, 60000).subscribe(() => {
      this.Get_SyncData()
    })
  }
  handleDropDownButtonContentReady({ component }) {
    component.registerKeyHandler('downArrow', () => {
      this.userMenuSection.userInfoList.nativeElement.focus();
    });
  }
  showPopup() {
    this.popupVisible = true
    this.Get_SyncData()
  }
  hidePopup() {
    this.popupVisible = false
  }


  Get_SyncData() {
    this.dataservice.get_sync_Data_api().subscribe({
      next: (res: any) => {
        console.log(res)
        this.listSyncData = res.map((item: any, index: number) => ({
          ...item,
          SL_NO: index + 1

        }))
        this.notificationCount = this.listSyncData.filter((item: any) => {

          const lastSyncTime = new Date(item.LAST_SYNCH_TIME);
          const currentTime = new Date();

          const diffMinutes =
            (currentTime.getTime() - lastSyncTime.getTime()) / (1000 * 60);

          return diffMinutes > this.synch_pending_intervel;

        }).length;

      },
      error: (err) => {
        console.log(err)
      }
    })
  }
  onRowPrepared(e: any) {
    if (e.rowType !== 'data') return;

    const lastSyncTime = new Date(e.data.LAST_SYNCH_TIME);
    console.log(lastSyncTime, "============last sync time============")
    const currentTime = new Date();
    console.log(currentTime, "============current time============")
    const diffMinutes =
      (currentTime.getTime() - lastSyncTime.getTime()) / (1000 * 60);
    console.log(diffMinutes, '====differen mintus')
    console.log("synch time", this.synch_pending_intervel)
    if (diffMinutes > this.synch_pending_intervel) {
      e.rowElement.style.color = 'red';
      // e.rowElement.style.fontWeight = 'bold';
    }
  }
  formatTime(rowData: any) {
    if (!rowData.LAST_SYNCH_TIME) return '';

    const date = new Date(rowData.LAST_SYNCH_TIME);

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}

@NgModule({
  imports: [
    DxDropDownButtonModule,
    UserMenuSectionModule,
    CommonModule,
    DxPopupModule,
    DxDataGridModule
  ],
  declarations: [UserPanelComponent],
  exports: [UserPanelComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class UserPanelModule { }
