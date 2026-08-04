import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-analytics-dashboard-vezta-medical',
  templateUrl: './analytics-dashboard-vezta-medical.component.html',
  styleUrls: ['./analytics-dashboard-vezta-medical.component.scss']
})
export class AnalyticsDashboardVeztaMedicalComponent implements OnInit {

  dateRanges = [
    { label: 'All', value: 'all' },
    { label: 'Current Year', value: 'currentYear' },
    { label: 'Current Month', value: 'currentMonth' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
  ];
  selectedDateRange: string = 'last30';

  // Dummy Data for Dashboards

  // a) Facility Wise: Pie Chart
  facilityWiseData = [
    { facility: 'Facility A', revenue: 450000 },
    { facility: 'Facility B', revenue: 300000 },
    { facility: 'Facility C', revenue: 250000 },
    { facility: 'Facility D', revenue: 150000 },
  ];

  // b) Income Group wise: Column Wise (Top 10)
  incomeGroupData = [
    { group: 'Group 1', revenue: 120000 },
    { group: 'Group 2', revenue: 110000 },
    { group: 'Group 3', revenue: 95000 },
    { group: 'Group 4', revenue: 85000 },
    { group: 'Group 5', revenue: 75000 },
    { group: 'Group 6', revenue: 65000 },
    { group: 'Group 7', revenue: 60000 },
    { group: 'Group 8', revenue: 55000 },
    { group: 'Group 9', revenue: 45000 },
    { group: 'Group 10', revenue: 40000 },
  ];

  // c) Department Wise: Column wise (Top 10)
  departmentWiseData = [
    { department: 'Cardiology', revenue: 250000 },
    { department: 'Neurology', revenue: 210000 },
    { department: 'Orthopedics', revenue: 180000 },
    { department: 'Pediatrics', revenue: 150000 },
    { department: 'Oncology', revenue: 120000 },
    { department: 'Radiology', revenue: 90000 },
    { department: 'Emergency', revenue: 85000 },
    { department: 'Pharmacy', revenue: 80000 },
    { department: 'Laboratory', revenue: 75000 },
    { department: 'Dental', revenue: 60000 },
  ];

  // d) Category wise: Column wise (Top 10)
  categoryWiseData = [
    { category: 'Consultation', revenue: 300000 },
    { category: 'Surgery', revenue: 250000 },
    { category: 'Medicines', revenue: 200000 },
    { category: 'Scans', revenue: 150000 },
    { category: 'Tests', revenue: 120000 },
    { category: 'Room Rent', revenue: 100000 },
    { category: 'Nursing', revenue: 90000 },
    { category: 'Consumables', revenue: 85000 },
    { category: 'Physiotherapy', revenue: 75000 },
    { category: 'Other', revenue: 50000 },
  ];

  // e) Month wise: Line chart (multiple lines for facilities)
  monthWiseData = [
    { month: 'Jan', 'Facility A': 50000, 'Facility B': 30000, 'Facility C': 20000 },
    { month: 'Feb', 'Facility A': 55000, 'Facility B': 32000, 'Facility C': 22000 },
    { month: 'Mar', 'Facility A': 60000, 'Facility B': 35000, 'Facility C': 25000 },
    { month: 'Apr', 'Facility A': 58000, 'Facility B': 33000, 'Facility C': 24000 },
    { month: 'May', 'Facility A': 65000, 'Facility B': 38000, 'Facility C': 28000 },
    { month: 'Jun', 'Facility A': 70000, 'Facility B': 42000, 'Facility C': 30000 },
  ];

  monthWiseSeries = [
    { valueField: 'Facility A', name: 'Facility A' },
    { valueField: 'Facility B', name: 'Facility B' },
    { valueField: 'Facility C', name: 'Facility C' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  onDateRangeChange(e: any): void {
    // Handle date range change logic here
    console.log('Date range changed:', e.value);
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
  }

  customizePieLabel = (arg: any) => {
    return `${arg.argumentText}: ${this.formatAmount(arg.value)}`;
  }

  customizeTooltip = (arg: any) => {
    return {
      text: `${arg.argumentText}: ${this.formatAmount(arg.value)}`
    };
  }
  
  customizeLineTooltip = (arg: any) => {
    return {
      text: `${arg.seriesName}: ${this.formatAmount(arg.value)}`
    };
  }

  customizeAxisLabel = (arg: any) => {
    return arg.value;
  }
  
  customizeValueAxisLabel = (arg: any) => {
    return this.formatAmount(arg.value);
  }
}
