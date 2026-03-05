function getFinancialYearDates(financialYear) {
  // Input format: "2025-26"
  const [startYear, endYearSuffix] = financialYear.split("-");
  
  // Fix: Convert properly
  const start = new Date(parseInt(startYear), 3, 1); // April 1, 2025
  
  // Fix: endYearSuffix like "26" should become 2026, not 4026!
  const endYear = 2000 + parseInt(endYearSuffix); // "26" → 2026
  const end = new Date(endYear, 2, 31); // March 31, 2026
  
  console.log(`📅 FY Range: ${start.toISOString()} to ${end.toISOString()}`);
  return { start, end };
}

function buildSafeDate(year, monthIndex, day) {
  // Fix: Ensure year is a number
  const date = new Date(Number(year), monthIndex, day);
  if (date.getMonth() !== monthIndex) {
    return new Date(Number(year), monthIndex + 1, 0); // last day of month
  }
  return date;
}

function generateMonthlyDueDates(template, fyStart, fyEnd) {
  const dueDates = [];
  const { due_day, offset_months } = template.recurrence_config || { due_day: 7, offset_months: 1 };
  
  // Fix: Only generate for 12 months
  let current = new Date(fyStart);
  let monthCount = 0;
  
  while (current <= fyEnd && monthCount < 12) {
    // Calculate due date
    let dueYear = current.getFullYear();
    let dueMonth = current.getMonth() + offset_months;
    
    if (dueMonth > 11) {
      dueMonth = dueMonth - 12;
      dueYear = dueYear + 1;
    }
    
    const dueDate = buildSafeDate(dueYear, dueMonth, due_day);
    
    // Only add if within FY
    if (dueDate >= fyStart && dueDate <= fyEnd) {
      dueDates.push(dueDate);
    }
    
    // Move to next month
    current.setMonth(current.getMonth() + 1);
    monthCount++;
  }
  
  console.log(`📆 Monthly template ${template.name}: ${dueDates.length} dates`);
  return dueDates;
}

function generateQuarterlyDueDates(template, fyStart, fyEnd) {
  const dueDates = [];
  const { due_dates } = template.recurrence_config || { due_dates: ["31-07", "31-10", "31-01", "31-04"] };
  
  // Fix: Only generate 4 quarters per FY
  const quarters = [
    { month: 6, day: 31 }, // Q1: July 31
    { month: 9, day: 31 }, // Q2: Oct 31
    { month: 0, day: 31 }, // Q3: Jan 31 (next year)
    { month: 3, day: 30 }  // Q4: April 30 (next year)
  ];
  
  const startYear = fyStart.getFullYear();
  
  quarters.forEach((quarter, index) => {
    let year = startYear;
    if (quarter.month < 4) {
      year = startYear + 1; // Next year for Jan-Apr dates
    }
    
    const dueDate = buildSafeDate(year, quarter.month, quarter.day);
    
    if (dueDate >= fyStart && dueDate <= fyEnd) {
      dueDates.push(dueDate);
    }
  });
  
  console.log(`📆 Quarterly template ${template.name}: ${dueDates.length} dates`);
  return dueDates;
}

function generateAnnualDueDate(template, fyStart, fyEnd) {
  const { due_day, due_month } = template.recurrence_config || { due_day: 30, due_month: 9 };
  
  // Fix: Only generate ONE due date
  let year = fyStart.getFullYear();
  if (due_month < 4) {
    year = year + 1; // If due month is Jan-Mar, it's in next year
  }
  
  const dueDate = buildSafeDate(year, due_month - 1, due_day);
  
  console.log(`📆 Annual template ${template.name}: ${dueDate.toISOString()}`);
  
  if (dueDate >= fyStart && dueDate <= fyEnd) {
    return [dueDate];
  }
  
  return [];
}

export { 
  getFinancialYearDates, 
  buildSafeDate, 
  generateMonthlyDueDates, 
  generateQuarterlyDueDates, 
  generateAnnualDueDate 
};