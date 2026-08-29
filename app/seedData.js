// Seed data extracted from PDF files
const sampleSignatures = require('../sample_signatures.json');

const INITIAL_BRANCHES = [
  {
    id: "br-agbledomi",
    name: "AGBLEDOMI",
    location: "Agbledomi, Anloga District",
    pastorName: "Rev. Reuben Afadzinu",
    secretaryName: "Emmanuel Apeke",
    contactPhone: "0240000001",
    status: "Active"
  },
  {
    id: "br-agorve",
    name: "AGORVE",
    location: "Agorve, Anloga District",
    pastorName: "Pastor Wisdom Amudzi",
    secretaryName: "Emmanuel M. C. Agbakpe",
    contactPhone: "0240000002",
    status: "Active"
  },
  {
    id: "br-biwater",
    name: "BIWATER – DOMINION CENTER",
    location: "Biwater, Anloga District",
    pastorName: "Rev. Dr. John Kugbadzor",
    secretaryName: "Pastor Hope Ahadzi",
    contactPhone: "0240000003",
    status: "Active"
  },
  {
    id: "br-genui",
    name: "GENUI – LOVE CHAPEL",
    location: "Genui, Anloga District",
    pastorName: "Pastor Victor C. Gbetodeme",
    secretaryName: "Doris Tetteh",
    contactPhone: "0243302919",
    status: "Active"
  },
  {
    id: "br-kportorgbe",
    name: "KPORTORGBE",
    location: "Kportorgbe, Anloga District",
    pastorName: "Rev. Wisdom Fiaador",
    secretaryName: "Moses Tettey",
    contactPhone: "0240000005",
    status: "Active"
  },
  {
    id: "br-whuti",
    name: "WHUTI – SALVATION CENTRE",
    location: "Whuti, Anloga District",
    pastorName: "Rev. Godwin Ayekple",
    secretaryName: "Rita Sitsofe Dzakah",
    contactPhone: "0240000006",
    status: "Active"
  }
];

const INITIAL_USERS = [
  // Admin
  {
    id: "user-admin",
    role: "admin",
    name: "District Administrator",
    username: "admin",
    password: "password123",
    branchId: null,
    branchName: "District Headquarters"
  },
  // Pastors (exact from LOGIN DETAILS.pdf)
  {
    id: "user-pastor-agbledomi",
    role: "pastor",
    name: "Rev. Reuben Afadzinu",
    branchId: "br-agbledomi",
    branchName: "AGBLEDOMI",
    username: "pastor.agbledomi.21",
    password: "Rf@69D60B22"
  },
  {
    id: "user-pastor-agorve",
    role: "pastor",
    name: "Pastor Wisdom Amudzi",
    branchId: "br-agorve",
    branchName: "AGORVE",
    username: "pastor.agorve.2",
    password: "Rf@808F7F91"
  },
  {
    id: "user-pastor-biwater",
    role: "pastor",
    name: "Rev. John Kugbadzor",
    branchId: "br-biwater",
    branchName: "BIWATER – DOMINION CENTER",
    username: "pastor.c.3",
    password: "Rf@C17CDD66"
  },
  {
    id: "user-pastor-genui",
    role: "pastor",
    name: "Pastor Victor C. Gbetodeme",
    branchId: "br-genui",
    branchName: "GENUI – LOVE CHAPEL",
    username: "pastor.chapel.4",
    password: "Rf@6AEDF221"
  },
  {
    id: "user-pastor-kportorgbe",
    role: "pastor",
    name: "Rev. Wisdom Fiaador",
    branchId: "br-kportorgbe",
    branchName: "KPORTORGBE",
    username: "pastor.kportorgbe.5",
    password: "Rf@00523606"
  },
  {
    id: "user-pastor-whuti",
    role: "pastor",
    name: "Rev. Godwin Ayekple",
    branchId: "br-whuti",
    branchName: "WHUTI – SALVATION CENTRE",
    username: "pastor.ce.6",
    password: "Rf@23AA24D4"
  },
  // Secretaries (exact from LOGIN DETAILS.pdf)
  {
    id: "user-sec-agbledomi",
    role: "secretary",
    name: "Emmanuel Apeke",
    branchId: "br-agbledomi",
    branchName: "AGBLEDOMI",
    username: "sec.agbledomi",
    password: "secretagb"
  },
  {
    id: "user-sec-agorve",
    role: "secretary",
    name: "Emmanuel M. C. Agbakpe",
    branchId: "br-agorve",
    branchName: "AGORVE",
    username: "secretary.agorve",
    password: "agorve@secreta#"
  },
  {
    id: "user-sec-biwater",
    role: "secretary",
    name: "Pastor Hope Ahadzi",
    branchId: "br-biwater",
    branchName: "BIWATER – DOMINION CENTER",
    username: "secretary.biw",
    password: "bi-wat@secretary"
  },
  {
    id: "user-sec-genui",
    role: "secretary",
    name: "Doris Tetteh",
    branchId: "br-genui",
    branchName: "GENUI – LOVE CHAPEL",
    username: "doris",
    password: "dorist"
  },
  {
    id: "user-sec-kportorgbe",
    role: "secretary",
    name: "Moses Tettey",
    branchId: "br-kportorgbe",
    branchName: "KPORTORGBE",
    username: "m.kportorgbe",
    password: "kport@sec.1"
  },
  {
    id: "user-sec-whuti",
    role: "secretary",
    name: "Rita Sitsofe Dzakah",
    branchId: "br-whuti",
    branchName: "WHUTI – SALVATION CENTRE",
    username: "sec.whuti.ce",
    password: "salva@whuti2"
  }
];

// Pre-load the authentic Genui sample report from the user's PDF
const INITIAL_REPORTS = [
  {
    id: "rep-genui-jan-2026",
    branchId: "br-genui",
    branchName: "Genui – Love Chapel",
    month: "January",
    year: "2026",
    pastorName: "Pastor Victor C. Gbetodeme",
    status: "endorsed", // Endorsed by pastor, visible to admin
    sundayAttendance: [
      {
        id: "sun-1",
        date: "2026-01-04",
        children: 2,
        youth: 2,
        women: 2,
        men: 2,
        total: 8
      }
    ],
    weekdayAttendance: [
      {
        id: "wk-1",
        day: "Tuesday",
        activity: "Prayer Service",
        customActivity: "",
        children: 2,
        youth: 2,
        women: 2,
        men: 2
      },
      {
        id: "wk-2",
        day: "Thursday",
        activity: "Fasting & Prayers",
        customActivity: "",
        children: 3,
        youth: 3,
        women: 3,
        men: 3
      },
      {
        id: "wk-3",
        day: "Friday",
        activity: "Bible Studies",
        customActivity: "",
        children: 4,
        youth: 4,
        women: 4,
        men: 4
      }
    ],
    finance: {
      tithes: 400.00,
      sundayOfferings: 40.00,
      weekdayOfferings: 20.00,
      evangelismOffering: 0.00,
      districtLevy: 0.00,
      exchangeOfPulpit: 0.00,
      total: 460.00
    },
    endorsement: {
      churchSecretary: {
        name: "Doris Tetteh",
        date: "2026-01-04",
        signatureData: sampleSignatures.doris_signature || ""
      },
      branchPastor: {
        name: "Pastor Victor C. Gbetodeme",
        date: "2026-01-04",
        signatureData: sampleSignatures.pastor_stamp || "",
        remarks: "Report endorsed and submitted to District Administration."
      }
    },
    createdBy: "user-sec-genui",
    createdAt: "2026-01-05T10:00:00.000Z",
    updatedAt: "2026-01-05T14:30:00.000Z",
    history: [
      {
        timestamp: "2026-01-05T10:00:00.000Z",
        action: "Report Created",
        actorName: "Doris Tetteh",
        actorRole: "Secretary"
      },
      {
        timestamp: "2026-01-05T10:15:00.000Z",
        action: "Submitted to Pastor for Review",
        actorName: "Doris Tetteh",
        actorRole: "Secretary"
      },
      {
        timestamp: "2026-01-05T14:30:00.000Z",
        action: "Report Endorsed and Submitted to District Admin",
        actorName: "Pastor Victor C. Gbetodeme",
        actorRole: "Pastor"
      }
    ]
  },
  // Sample pending report for Agorve to demonstrate pending review workflow!
  {
    id: "rep-agorve-jan-2026",
    branchId: "br-agorve",
    branchName: "AGORVE",
    month: "January",
    year: "2026",
    pastorName: "Pastor Wisdom Amudzi",
    status: "submitted_to_pastor", // Pending Pastor Review
    sundayAttendance: [
      {
        id: "sun-ag-1",
        date: "2026-01-04",
        children: 15,
        youth: 22,
        women: 34,
        men: 18,
        total: 89
      },
      {
        id: "sun-ag-2",
        date: "2026-01-11",
        children: 18,
        youth: 25,
        women: 38,
        men: 20,
        total: 101
      }
    ],
    weekdayAttendance: [
      {
        id: "wk-ag-1",
        day: "Tuesday",
        activity: "Prayer Service",
        customActivity: "",
        children: 8,
        youth: 14,
        women: 22,
        men: 10
      },
      {
        id: "wk-ag-2",
        day: "Friday",
        activity: "Bible Studies",
        customActivity: "",
        children: 12,
        youth: 18,
        women: 26,
        men: 15
      }
    ],
    finance: {
      tithes: 1850.00,
      sundayOfferings: 320.00,
      weekdayOfferings: 110.00,
      evangelismOffering: 75.00,
      districtLevy: 150.00,
      exchangeOfPulpit: 50.00,
      total: 2555.00
    },
    endorsement: {
      churchSecretary: {
        name: "Emmanuel M. C. Agbakpe",
        date: "2026-01-12",
        signatureData: ""
      },
      branchPastor: {
        name: "Pastor Wisdom Amudzi",
        date: "",
        signatureData: "",
        remarks: ""
      }
    },
    createdBy: "user-sec-agorve",
    createdAt: "2026-01-12T09:00:00.000Z",
    updatedAt: "2026-01-12T09:00:00.000Z",
    history: [
      {
        timestamp: "2026-01-12T09:00:00.000Z",
        action: "Submitted to Pastor for Review",
        actorName: "Emmanuel M. C. Agbakpe",
        actorRole: "Secretary"
      }
    ]
  },
  // Sample report for Agbledomi
  {
    id: "rep-agbledomi-jan-2026",
    branchId: "br-agbledomi",
    branchName: "AGBLEDOMI",
    month: "January",
    year: "2026",
    pastorName: "Rev. Reuben Afadzinu",
    status: "endorsed",
    sundayAttendance: [
      {
        id: "sun-ab-1",
        date: "2026-01-04",
        children: 12,
        youth: 19,
        women: 28,
        men: 14,
        total: 73
      },
      {
        id: "sun-ab-2",
        date: "2026-01-11",
        children: 14,
        youth: 21,
        women: 30,
        men: 16,
        total: 81
      }
    ],
    weekdayAttendance: [
      {
        id: "wk-ab-1",
        day: "Wednesday",
        activity: "Revival Service",
        customActivity: "",
        children: 10,
        youth: 15,
        women: 24,
        men: 12
      },
      {
        id: "wk-ab-2",
        day: "Friday",
        activity: "Bible Studies",
        customActivity: "",
        children: 11,
        youth: 17,
        women: 25,
        men: 13
      }
    ],
    finance: {
      tithes: 1420.00,
      sundayOfferings: 280.00,
      weekdayOfferings: 95.00,
      evangelismOffering: 60.00,
      districtLevy: 120.00,
      exchangeOfPulpit: 40.00,
      total: 2015.00
    },
    endorsement: {
      churchSecretary: {
        name: "Emmanuel Apeke",
        date: "2026-01-12",
        signatureData: ""
      },
      branchPastor: {
        name: "Rev. Reuben Afadzinu",
        date: "2026-01-13",
        signatureData: "",
        remarks: "Reviewed and endorsed. Praise God for steady church growth."
      }
    },
    createdBy: "user-sec-agbledomi",
    createdAt: "2026-01-12T11:00:00.000Z",
    updatedAt: "2026-01-13T08:30:00.000Z",
    history: [
      {
        timestamp: "2026-01-12T11:00:00.000Z",
        action: "Submitted to Pastor for Review",
        actorName: "Emmanuel Apeke",
        actorRole: "Secretary"
      },
      {
        timestamp: "2026-01-13T08:30:00.000Z",
        action: "Endorsed and Submitted to District Admin",
        actorName: "Rev. Reuben Afadzinu",
        actorRole: "Pastor"
      }
    ]
  }
];

module.exports = {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_REPORTS
};
