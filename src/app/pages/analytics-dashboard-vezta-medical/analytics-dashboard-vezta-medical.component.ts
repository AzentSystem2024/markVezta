import { Component, OnInit } from '@angular/core';

import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-analytics-dashboard-vezta-medical',
  templateUrl: './analytics-dashboard-vezta-medical.component.html',
  styleUrls: ['./analytics-dashboard-vezta-medical.component.scss'],
})
export class AnalyticsDashboardVeztaMedicalComponent implements OnInit {
  selectedYear: number | null = null;
  selectedMonth: any = '';
  years: number[] = [];
  monthDataSource: { name: string; value: any }[] = [];

  fromDate: any = null;
  toDate: any = null;

  branchList: any[] = [];
  selectedBranches: any[] = [];

  // Dummy Data for Dashboards
  facilityWiseData: any[] = [];
  incomeGroupData: any[] = [];
  departmentWiseData: any[] = [];
  categoryWiseData: any[] = [];
  monthWiseData: any[] = [];
  monthWiseSeries: any[] = [];
  branchTotalData: any[] = [];
  branchTotalSeries: any[] = [];

  chartToggleOptions = [
    { id: 'month', text: 'Branch Chart (Month Wise)' },
    { id: 'total', text: 'Total Revenue' },
  ];
  selectedChartToggle: string = 'month';

  constructor(private srvce: DataService) {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2020; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;

    this.monthDataSource = this.srvce.getMonths();
    // const currentMonth = new Date().getMonth();
    this.selectedMonth = '';
  }

  ngOnInit(): void {
    const today = new Date();

    if (this.selectedYear) {
      if (this.selectedMonth === '') {
        this.fromDate = new Date(this.selectedYear, 0, 1);
        this.toDate =
          this.selectedYear === today.getFullYear()
            ? today
            : new Date(this.selectedYear, 11, 31);
      } else {
        this.fromDate = new Date(this.selectedYear, this.selectedMonth, 1);
        this.toDate = new Date(this.selectedYear, this.selectedMonth + 1, 0);
      }
    }

    this.getBranches();
    this.loadDashboardData();
  }

  getBranches(): void {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const companyId = sessionData.SELECTED_COMPANY?.COMPANY_ID || 1;

    this.srvce
      .getDropdownData({ NAME: 'STORE', COMPANY_ID: companyId })
      .subscribe({
        next: (response: any) => {
          this.branchList = response;
        },
        error: (err) => {
          console.error('Failed to load branches', err);
        },
      });
  }

  loadDashboardData(): void {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const companyId = sessionData.SELECTED_COMPANY?.COMPANY_ID || 1;

    const payload: any = {
      COMPANY_ID: companyId,
      DATE_FROM: this.formatAsYYYYMMDD(this.fromDate),
      DATE_TO: this.formatAsYYYYMMDD(this.toDate),
      BRANCH_ID:
        this.selectedBranches && this.selectedBranches.length > 0
          ? this.selectedBranches.join(',')
          : '',
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

          // Map Branch Total Revenue
          if (data.BranchTotalRevenue) {
            const transformedData: any[] = [];
            const facilitiesSet = new Set<string>();

            // Group by Month_Name
            const groupedByMonth = data.BranchTotalRevenue.reduce(
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

            this.branchTotalData = Object.values(groupedByMonth).sort(
              (a: any, b: any) => a._sortOrder - b._sortOrder,
            );

            // Build series based on distinct facilities
            this.branchTotalSeries = Array.from(facilitiesSet).map(
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

  onYearChanged(e: any): void {
    this.selectedYear = e.value;
    this.selectedMonth = '';
    const currentYear = new Date().getFullYear();
    const today = new Date();
    if (this.selectedYear === currentYear) {
      this.fromDate = new Date(this.selectedYear, 0, 1);
      this.toDate = today;
    } else {
      if (this.selectedYear) {
        this.fromDate = new Date(this.selectedYear, 0, 1);
        this.toDate = new Date(this.selectedYear, 11, 31);
      }
    }
  }

  onMonthValueChanged(e: any) {
    this.selectedMonth = e.value ?? '';
    if (this.selectedYear) {
      if (this.selectedMonth === '') {
        this.fromDate = new Date(this.selectedYear, 0, 1);
        this.toDate = new Date(this.selectedYear, 11, 31);
      } else {
        this.fromDate = new Date(this.selectedYear, this.selectedMonth, 1);
        this.toDate = new Date(this.selectedYear, this.selectedMonth + 1, 0);
      }
    }
  }

  private formatAsYYYYMMDD(d: any): string {
    if (!d) return '';
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return '';
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${year}-${month}-${day}`;
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

  customizeLineTooltipTotal = (arg: any) => {
    return {
      text: `${arg.argumentText}: ${this.formatAmount(arg.value)}`,
    };
  };

  customizeAxisLabel = (arg: any) => {
    return arg.value;
  };

  customizeValueAxisLabel = (arg: any) => {
    return this.formatAmount(arg.value);
  };
}
