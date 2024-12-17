const admin = require('firebase-admin');
const xlsx = require('xlsx');

// Importing Firebase service account key
const serviceAccount = require('./firebaseKey.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'Hidden URL'
  });
}

// Function to fetch CWL performance data from Firebase
const fetchCWLData = async (monthPath) => {
  try {
    const snapshot = await admin.database().ref(`CWL Performance/${monthPath}`).once('value');
    const data = snapshot.val();
    if (data) {
      console.log(`Data found for path: CWL Performance/${monthPath}`);
    } else {
      console.log(`No data found for path: CWL Performance/${monthPath}`);
    }
    return data;
  } catch (error) {
    console.error('Error fetching data from Firebase:', error.message);
    return null;
  }
};

// Function to export data to Excel
const exportToExcel = (data, filePath) => {
  const workbook = xlsx.utils.book_new();
  
  // Create summary objects for attacks and defenses
  const attackSummary = {};
  const defSummary = {};

  // Loop through each war under current_month_CWL
  Object.keys(data).forEach(warName => {
    const warData = data[warName];

    // Process attack_stats
    Object.keys(warData.attack_stats || {}).forEach(playerName => {
      const attackStat = warData.attack_stats[playerName];

      if (!attackSummary[playerName]) {
        attackSummary[playerName] = {
          stars: 0,
          destruction: 0,
          attacksCompleted: 0,
          possibleAttacks: 0,
          player_tag: attackStat.player_tag
        };
      }
      attackSummary[playerName].stars += attackStat.attack_stars;
      attackSummary[playerName].destruction += attackStat.attack_destruction;
      attackSummary[playerName].attacksCompleted += attackStat.attack_count || 1; // Default 1 if attack_count is missing
      attackSummary[playerName].possibleAttacks += 1;
    });

    // Process def_stats
    Object.keys(warData.def_stats || {}).forEach(playerName => {
      const defStat = warData.def_stats[playerName];

      if (!defSummary[playerName]) {
        defSummary[playerName] = {
          totalStars: 0,
          totalDestruction: 0,
          count: 0,
          player_tag: defStat.player_tag
        };
      }
      defSummary[playerName].totalStars += defStat.def_stars;
      defSummary[playerName].totalDestruction += defStat.def_destruction;
      defSummary[playerName].count += 1;
    });
  });

  // Prepare attack summary data
  const attackSummaryData = Object.keys(attackSummary).map(player => {
    const playerData = attackSummary[player];
    const averageStars = (playerData.stars / playerData.possibleAttacks).toFixed(2);
    const averageDestruction = (playerData.destruction / playerData.possibleAttacks).toFixed(2);

    return {
      Name: player,
      Player_Tag: playerData.player_tag,
      Stars: playerData.stars,
      Average_Stars: averageStars,
      Average_Destruction: averageDestruction,
      Total_Destruction: playerData.destruction,
      Attacks_Completed: playerData.attacksCompleted,
      Possible_Attacks: playerData.possibleAttacks
    };
  });

  // Prepare defensive summary data
  const defSummaryData = Object.keys(defSummary).map(player => {
    const defData = defSummary[player];
    const averageStars = (defData.totalStars / defData.count).toFixed(2);
    const averageDestruction = (defData.totalDestruction / defData.count).toFixed(2);

    return {
      Name: player,
      Player_Tag: defData.player_tag,
      Average_Stars: averageStars,
      Average_Destruction: averageDestruction,
      Total_Stars: defData.totalStars,
      Total_Destruction: defData.totalDestruction,
      Defenses_Faced: defData.count
    };
  });

  // Create attack summary worksheet
  const attackSummarySheet = xlsx.utils.json_to_sheet(attackSummaryData);
  xlsx.utils.book_append_sheet(workbook, attackSummarySheet, 'Attack Summary');

  // Create defense summary worksheet
  const defSummarySheet = xlsx.utils.json_to_sheet(defSummaryData);
  xlsx.utils.book_append_sheet(workbook, defSummarySheet, 'Defense Summary');

  // Write the Excel file to the given file path
  xlsx.writeFile(workbook, filePath);
  console.log(`Excel file saved to ${filePath}`);
};

// Main function to fetch data and export to Excel
const exportCWLDataToExcel = async () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 0-indexed month
  const currentYear = now.getFullYear();
  const monthPath = `${currentMonth}_${currentYear}_CWL`; // Adjusted format for month path

  // Fetch data from Firebase
  const cwlData = await fetchCWLData(monthPath);
  
  if (cwlData) {
    // Define the Excel file path
    const filePath = `./CWL_Performance_${currentMonth}_${currentYear}.xlsx`;

    // Export data to Excel
    exportToExcel(cwlData, filePath);
  } else {
    console.log('No data available to export.');
  }
};

// Call the function to export data
exportCWLDataToExcel();
