import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-analytics-dashboard-vezta-medical',
  templateUrl: './analytics-dashboard-vezta-medical.component.html',
  styleUrls: ['./analytics-dashboard-vezta-medical.component.scss'],
})
export class AnalyticsDashboardVeztaMedicalComponent implements OnInit {
  dateRanges = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
  ];
  selectedDateRange: string = 'all';

  customStartDate: any = null;
  customEndDate: any = null;
  showCustomDatePopup = false;

  // Dummy Data for Dashboards
  facilityWiseData: any[] = [];
  incomeGroupData: any[] = [];
  departmentWiseData: any[] = [];
  categoryWiseData: any[] = [];
  monthWiseData: any[] = [];
  monthWiseSeries: any[] = [];

  constructor(private srvce: DataService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const companyId = sessionData.SELECTED_COMPANY?.COMPANY_ID || 1;

    const dates = this.getDateRangeValues(this.selectedDateRange);

    const payload = {
      COMPANY_ID: companyId,
      DATE_FROM: dates.fromDate,
      DATE_TO: dates.toDate,
    };

    this.srvce.getRevenueDashboardData(payload).subscribe({
      next: (response: any) => {
        if (response?.flag === 1 && response?.data) {
          const data = response.data;

          // Map Facility Revenue
          if (data.FacilityRevenue) {
            this.facilityWiseData = data.FacilityRevenue.map((item: any) => ({
              facility: item.FACILITY,
              revenue: item.REVENUE,
            }));
          }

          // Map Income Group Revenue
          if (data.IncomeGroupRevenue) {
            this.incomeGroupData = data.IncomeGroupRevenue.map((item: any) => ({
              group: item.INCOME_GROUP,
              revenue: item.REVENUE,
            }));
          }

          // Map Department Revenue
          if (data.DepartmentRevenue) {
            this.departmentWiseData = data.DepartmentRevenue.map(
              (item: any) => ({
                department: item.DEPARTMENT,
                revenue: item.REVENUE,
              }),
            );
          }

          // Map Category Revenue
          if (data.CategoryRevenue) {
            this.categoryWiseData = data.CategoryRevenue.map((item: any) => ({
              category: item.CATEGORY || 'Uncategorized',
              revenue: item.REVENUE,
            }));
          }

          // Map Monthly Revenue
          if (data.MonthlyRevenue) {
            const transformedData: any[] = [];
            const facilitiesSet = new Set<string>();

            // Group by Month_Name
            const groupedByMonth = data.MonthlyRevenue.reduce(
              (acc: any, curr: any) => {
                const monthKey = `${curr.MONTH_NAME} ${curr.YEAR}`;
                if (!acc[monthKey]) {
                  acc[monthKey] = {
                    month: monthKey,
                    _sortOrder: curr.YEAR * 100 + curr.MONTH_NO,
                  };
                }
                const facility = curr.FACILITY;
                facilitiesSet.add(facility);
                acc[monthKey][facility] = curr.REVENUE;
                return acc;
              },
              {},
            );

            this.monthWiseData = Object.values(groupedByMonth).sort(
              (a: any, b: any) => a._sortOrder - b._sortOrder,
            );

            // Build series based on distinct facilities
            this.monthWiseSeries = Array.from(facilitiesSet).map(
              (facility) => ({
                valueField: facility,
                name: facility,
              }),
            );
          }
        }
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
      },
    });
  }

  onDateRangeChange(e: any): void {
    this.selectedDateRange = e.value;
    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }
    this.loadDashboardData();
  }

  getDateRangeValues(range: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let to = new Date();
    to.setHours(23, 59, 59, 999);

    let from = new Date(today);

    switch (range) {
      case 'all':
        from = new Date(2000, 0, 1);
        break;

      case 'today':
        break; // already set
      case 'last7':
        from = new Date(today);
        from.setDate(today.getDate() - 6);
        break;
      case 'last15':
        from = new Date(today);
        from.setDate(today.getDate() - 14);
        break;
      case 'last30':
        from = new Date(today);
        from.setDate(today.getDate() - 29);
        break;
      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          from = new Date(this.customStartDate);
          from.setHours(0, 0, 0, 0);
          to = new Date(this.customEndDate);
          to.setHours(23, 59, 59, 999);
        }
        break;
    }

    return { fromDate: from.toISOString(), toDate: to.toISOString() };
  }

  displayExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const fromLabel = this.formatAsDDMMYYYY(new Date(this.customStartDate));
      const toLabel = this.formatAsDDMMYYYY(new Date(this.customEndDate));
      return `${fromLabel} to ${toLabel}`;
    }

    return item.label;
  };

  attachItemClickHandler(e: any) {
    setTimeout(() => {
      const popup = e.component._popup;
      const innerList =
        popup && popup.$content().find('.dx-list').dxList('instance');
      if (innerList) {
        innerList.off('itemClick'); // unsubscribe first (to avoid duplicates)
        innerList.on('itemClick', (clickEvent: any) => {
          const clickedValue = clickEvent.itemData.value;
          if (clickedValue === 'custom') {
            this.openCustomDatePopup();
            e.component.close();
          }
        });
      }
    }, 0);
  }

  openCustomDatePopup() {
    this.customStartDate = null;
    this.customEndDate = null;
    this.showCustomDatePopup = true;
  }

  applyCustomDateFilter(event?: any) {
    if (event) {
      this.customStartDate = event.start;
      this.customEndDate = event.end;
    }

    if (!this.customStartDate || !this.customEndDate) return;

    if (this.customStartDate > this.customEndDate) {
      alert('From date cannot be greater than To date');
      return;
    }

    const fromLabel = this.formatAsDDMMYYYY(new Date(this.customStartDate));
    const toLabel = this.formatAsDDMMYYYY(new Date(this.customEndDate));

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.loadDashboardData();
  }

  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  formatAmount(value: number): string {
    if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(2) + 'M';
    } else if (value >= 1_000) {
      return (value / 1_000).toFixed(2) + 'K';
    }
    return value.toString();
  }

  customizeLabel = (arg: any) => {
    return this.formatAmount(arg.value);
  };

  customizePieLabel = (arg: any) => {
    return `${arg.argumentText}: ${this.formatAmount(arg.value)}`;
  };

  customizeTooltip = (arg: any) => {
    return {
      text: `${arg.argumentText}: ${this.formatAmount(arg.value)}`,
    };
  };

  customizeLineTooltip = (arg: any) => {
    return {
      text: `${arg.seriesName}: ${this.formatAmount(arg.value)}`,
    };
  };

  customizeAxisLabel = (arg: any) => {
    return arg.value;
  };

  customizeValueAxisLabel = (arg: any) => {
    return this.formatAmount(arg.value);
  };
}
