// AI Analytics and Intelligence Engine for RFGC Anloga District

function analyzeBranchReports(branchId, branchName, reports) {
  const branchReports = reports.filter(r => (branchId && r.branchId === branchId) || r.branchName?.toLowerCase() === branchName?.toLowerCase());
  
  if (branchReports.length === 0) {
    return {
      status: "insufficient_data",
      message: "No report submissions found for this branch yet.",
      stats: { totalReports: 0, avgAttendance: 0, totalTithes: 0, totalFinance: 0 },
      insights: [
        "Please submit monthly reports to unlock AI-powered attendance trends, giving analysis, and pastoral recommendations."
      ]
    };
  }

  // Attendance metrics
  let totalSundayHeadcount = 0;
  let totalSundaysCount = 0;
  let totalChildren = 0;
  let totalYouth = 0;
  let totalWomen = 0;
  let totalMen = 0;

  let totalTithes = 0;
  let totalSundayOfferings = 0;
  let totalWeekdayOfferings = 0;
  let totalEvangelism = 0;
  let totalDistrictLevy = 0;
  let totalExchangeOfPulpit = 0;
  let grandTotalFinance = 0;

  const activityStats = {};
  const monthlyTrends = [];

  branchReports.forEach(rep => {
    let repSundayAttendance = 0;
    (rep.sundayAttendance || []).forEach(s => {
      const c = parseInt(s.children) || 0;
      const y = parseInt(s.youth) || 0;
      const w = parseInt(s.women) || 0;
      const m = parseInt(s.men) || 0;
      const tot = s.total || (c + y + w + m);

      totalChildren += c;
      totalYouth += y;
      totalWomen += w;
      totalMen += m;
      totalSundayHeadcount += tot;
      totalSundaysCount++;
      repSundayAttendance += tot;
    });

    (rep.weekdayAttendance || []).forEach(w => {
      const act = w.activity === 'Others' ? (w.customActivity || 'Other Activity') : (w.activity || 'Service');
      if (!activityStats[act]) {
        activityStats[act] = { count: 0, totalAttendees: 0, youth: 0, children: 0 };
      }
      activityStats[act].count++;
      const c = parseInt(w.children) || 0;
      const y = parseInt(w.youth) || 0;
      const wo = parseInt(w.women) || 0;
      const m = parseInt(w.men) || 0;
      const attendees = c + y + wo + m;
      activityStats[act].totalAttendees += attendees;
      activityStats[act].youth += y;
      activityStats[act].children += c;
    });

    const fin = rep.finance || {};
    const t = parseFloat(fin.tithes) || 0;
    const so = parseFloat(fin.sundayOfferings) || 0;
    const wo = parseFloat(fin.weekdayOfferings) || 0;
    const evo = parseFloat(fin.evangelismOffering) || 0;
    const dl = parseFloat(fin.districtLevy) || 0;
    const eop = parseFloat(fin.exchangeOfPulpit) || 0;
    const totFin = parseFloat(fin.total) || (t + so + wo + evo + dl + eop);

    totalTithes += t;
    totalSundayOfferings += so;
    totalWeekdayOfferings += wo;
    totalEvangelism += evo;
    totalDistrictLevy += dl;
    totalExchangeOfPulpit += eop;
    grandTotalFinance += totFin;

    monthlyTrends.push({
      month: rep.month,
      year: rep.year,
      sundayAttendance: repSundayAttendance,
      totalFinance: totFin,
      tithes: t,
      districtLevy: dl,
      status: rep.status
    });
  });

  const avgSundayAttendance = totalSundaysCount > 0 ? Math.round(totalSundayHeadcount / totalSundaysCount) : 0;
  const grandTotalDemographics = totalChildren + totalYouth + totalWomen + totalMen;
  
  const demographicBreakdown = {
    children: totalChildren,
    childrenPercent: grandTotalDemographics > 0 ? Math.round((totalChildren / grandTotalDemographics) * 100) : 0,
    youth: totalYouth,
    youthPercent: grandTotalDemographics > 0 ? Math.round((totalYouth / grandTotalDemographics) * 100) : 0,
    women: totalWomen,
    womenPercent: grandTotalDemographics > 0 ? Math.round((totalWomen / grandTotalDemographics) * 100) : 0,
    men: totalMen,
    menPercent: grandTotalDemographics > 0 ? Math.round((totalMen / grandTotalDemographics) * 100) : 0,
  };

  // AI Health Score Calculation
  let healthScore = 85;
  if (totalDistrictLevy > 0) healthScore += 5;
  if (totalEvangelism > 0) healthScore += 5;
  if (demographicBreakdown.youthPercent > 20) healthScore += 5;
  healthScore = Math.min(98, healthScore);

  let healthGrade = "A";
  if (healthScore >= 90) healthGrade = "A+ (Excellent Vitality)";
  else if (healthScore >= 80) healthGrade = "A (Healthy & Growing)";
  else if (healthScore >= 70) healthGrade = "B+ (Stable)";
  else healthGrade = "B (Developing)";

  // AI Insights Generation
  const aiInsights = [];
  const recommendations = [];

  if (demographicBreakdown.womenPercent > demographicBreakdown.menPercent * 1.5) {
    aiInsights.push(`Women represent ${demographicBreakdown.womenPercent}% of total congregation attendance, indicating a strong Women's Fellowship pillar.`);
    recommendations.push("Launch targeted Men's Ministry (Men of Rhema) breakfast meetings or specialized fellowship outreaches to balance demographic engagement.");
  }

  if (demographicBreakdown.youthPercent >= 20) {
    aiInsights.push(`Youth participation is vibrant at ${demographicBreakdown.youthPercent}%, showing strong long-term church revitalization potential.`);
    recommendations.push("Empower youth in worship leadership, digital media, and ushering to sustain active participation.");
  } else {
    aiInsights.push(`Youth demographic currently stands at ${demographicBreakdown.youthPercent}%. There is an opportunity to expand campus and teen outreaches.`);
    recommendations.push("Organize monthly youth-focused prayer jams and practical vocational / study seminars.");
  }

  if (totalTithes > 0) {
    const titheRatio = Math.round((totalTithes / (grandTotalFinance || 1)) * 100);
    aiInsights.push(`Tithes constitute ${titheRatio}% of branch financial inflows (GH¢ ${totalTithes.toFixed(2)}), reflecting faithful stewardship.`);
  }

  if (totalDistrictLevy === 0) {
    recommendations.push("Ensure District Levy (GH¢ District Quota) is allocated in upcoming financial cycles for district governance alignment.");
  } else {
    aiInsights.push(`District Levy contribution is active (GH¢ ${totalDistrictLevy.toFixed(2)}). Exemplary district compliance.`);
  }

  // Most active weekday program
  let topActivity = null;
  let maxAttendance = -1;
  Object.keys(activityStats).forEach(act => {
    if (activityStats[act].totalAttendees > maxAttendance) {
      maxAttendance = activityStats[act].totalAttendees;
      topActivity = act;
    }
  });

  if (topActivity) {
    aiInsights.push(`'${topActivity}' is the most highly attended weekday gathering with ${maxAttendance} total participants.`);
  }

  return {
    branchName: branchName || branchReports[0]?.branchName || "Branch",
    healthScore,
    healthGrade,
    summary: {
      totalReports: branchReports.length,
      totalSundayHeadcount,
      avgSundayAttendance,
      grandTotalFinance: grandTotalFinance.toFixed(2),
      totalTithes: totalTithes.toFixed(2),
      totalSundayOfferings: totalSundayOfferings.toFixed(2),
      totalWeekdayOfferings: totalWeekdayOfferings.toFixed(2),
      totalEvangelism: totalEvangelism.toFixed(2),
      totalDistrictLevy: totalDistrictLevy.toFixed(2),
      totalExchangeOfPulpit: totalExchangeOfPulpit.toFixed(2),
    },
    demographicBreakdown,
    activityStats,
    monthlyTrends,
    aiInsights,
    recommendations
  };
}

function analyzeDistrictWide(branches, reports) {
  let districtSundayHeadcount = 0;
  let districtSundaysCount = 0;
  let districtChildren = 0;
  let districtYouth = 0;
  let districtWomen = 0;
  let districtMen = 0;

  let districtTithes = 0;
  let districtSundayOfferings = 0;
  let districtWeekdayOfferings = 0;
  let districtEvangelism = 0;
  let districtLevyTotal = 0;
  let districtExchangeOfPulpit = 0;
  let grandDistrictFinance = 0;

  const branchRankings = [];

  branches.forEach(br => {
    const brAnalysis = analyzeBranchReports(br.id, br.name, reports);
    const hasData = brAnalysis.summary && brAnalysis.summary.totalReports > 0;
    
    if (hasData) {
      districtSundayHeadcount += brAnalysis.summary.totalSundayHeadcount;
      districtSundaysCount += (brAnalysis.summary.totalReports * 4);
      districtChildren += brAnalysis.demographicBreakdown.children;
      districtYouth += brAnalysis.demographicBreakdown.youth;
      districtWomen += brAnalysis.demographicBreakdown.women;
      districtMen += brAnalysis.demographicBreakdown.men;

      districtTithes += parseFloat(brAnalysis.summary.totalTithes);
      districtSundayOfferings += parseFloat(brAnalysis.summary.totalSundayOfferings);
      districtWeekdayOfferings += parseFloat(brAnalysis.summary.totalWeekdayOfferings);
      districtEvangelism += parseFloat(brAnalysis.summary.totalEvangelism);
      districtLevyTotal += parseFloat(brAnalysis.summary.totalDistrictLevy);
      districtExchangeOfPulpit += parseFloat(brAnalysis.summary.totalExchangeOfPulpit);
      grandDistrictFinance += parseFloat(brAnalysis.summary.grandTotalFinance);
    }

    branchRankings.push({
      branchId: br.id,
      branchName: br.name,
      pastorName: br.pastorName,
      location: br.location,
      reportsSubmitted: hasData ? brAnalysis.summary.totalReports : 0,
      avgSundayAttendance: hasData ? brAnalysis.summary.avgSundayAttendance : 0,
      totalFinance: hasData ? parseFloat(brAnalysis.summary.grandTotalFinance) : 0,
      totalTithes: hasData ? parseFloat(brAnalysis.summary.totalTithes) : 0,
      districtLevy: hasData ? parseFloat(brAnalysis.summary.totalDistrictLevy) : 0,
      healthGrade: hasData ? brAnalysis.healthGrade : "Pending Data",
      healthScore: hasData ? brAnalysis.healthScore : 0,
    });
  });

  // Sort rankings by total attendance / finance
  branchRankings.sort((a, b) => b.totalFinance - a.totalFinance || b.avgSundayAttendance - a.avgSundayAttendance);

  const grandDemographics = districtChildren + districtYouth + districtWomen + districtMen;
  const districtDemographics = {
    children: districtChildren,
    childrenPercent: grandDemographics > 0 ? Math.round((districtChildren / grandDemographics) * 100) : 0,
    youth: districtYouth,
    youthPercent: grandDemographics > 0 ? Math.round((districtYouth / grandDemographics) * 100) : 0,
    women: districtWomen,
    womenPercent: grandDemographics > 0 ? Math.round((districtWomen / grandDemographics) * 100) : 0,
    men: districtMen,
    menPercent: grandDemographics > 0 ? Math.round((districtMen / grandDemographics) * 100) : 0,
  };

  const executiveInsights = [
    `Anloga District encompasses ${branches.length} registered branches with a total recorded monthly finance of GH¢ ${grandDistrictFinance.toFixed(2)}.`,
    `District Tithes sum to GH¢ ${districtTithes.toFixed(2)}, forming ${grandDistrictFinance > 0 ? Math.round((districtTithes/grandDistrictFinance)*100) : 0}% of district financial inflows.`,
    `Total District Levy collected across participating assemblies is GH¢ ${districtLevyTotal.toFixed(2)}.`,
    `Demographic composition reflects ${districtDemographics.womenPercent}% Women, ${districtDemographics.youthPercent}% Youth, ${districtDemographics.menPercent}% Men, and ${districtDemographics.childrenPercent}% Children.`
  ];

  const executiveRecommendations = [
    "Convene a quarterly District Pastoral Synod to review church planting benchmarks and evangelistic expansion in Keta / Anloga coastal corridor.",
    "Implement a District Youth Empowerment Summit to accelerate youth conversion and leadership succession.",
    "Establish structured follow-up for District Levies and Pulpit Exchange offerings to strengthen district headquarters administrative fund."
  ];

  return {
    overview: {
      totalBranches: branches.length,
      activeReports: reports.length,
      totalDistrictAttendance: districtSundayHeadcount,
      grandDistrictFinance: grandDistrictFinance.toFixed(2),
      districtTithes: districtTithes.toFixed(2),
      districtSundayOfferings: districtSundayOfferings.toFixed(2),
      districtWeekdayOfferings: districtWeekdayOfferings.toFixed(2),
      districtEvangelism: districtEvangelism.toFixed(2),
      districtLevyTotal: districtLevyTotal.toFixed(2),
      districtExchangeOfPulpit: districtExchangeOfPulpit.toFixed(2),
    },
    districtDemographics,
    branchRankings,
    executiveInsights,
    executiveRecommendations
  };
}

module.exports = {
  analyzeBranchReports,
  analyzeDistrictWide
};
