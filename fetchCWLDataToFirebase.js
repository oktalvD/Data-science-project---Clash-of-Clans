// Import the required packages
const admin = require('firebase-admin');
const axios = require('axios');

// Import your Firebase service account key
const serviceAccount = require('./firebaseKey.json'); 

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'Hidden URL' 
});

// Your Clash of Clans API Key
const COC_API_TOKEN = 'Hidden API KEY'; 

// Function to get Clan War League data for a clan (CWL War)
const getClanWarLeagueData = async (clanTag) => {
  try {
    const url = `https://api.clashofclans.com/v1/clans/${encodeURIComponent(clanTag)}/currentwar/leaguegroup`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${COC_API_TOKEN}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching CWL data:', error.message);
    return null;
  }
};

// Function to fetch player performance data for a specific war tag
const getPlayerPerformanceByWarTag = async (warTag) => {
  try {
    const url = `https://api.clashofclans.com/v1/clanwarleagues/wars/${encodeURIComponent(warTag)}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${COC_API_TOKEN}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching player performance data:', error.message);
    return null;
  }
};

// Define your clan tag
const clanTag = '#2PG9CGRP2';
// Fetch and save current CWL data
getClanWarLeagueData(clanTag)
  .then(async (cwlData) => {
    if (cwlData && cwlData.rounds) {
      const relevantWarTags = [];

      // Collect relevant war tags
      for (const round of cwlData.rounds) {
        for (const warTag of round.warTags) {
          const warData = await getPlayerPerformanceByWarTag(warTag);
          if (
            (warData && warData.clan && warData.clan.tag === clanTag) ||
            (warData && warData.opponent && warData.opponent.tag === clanTag)
          ) {
            relevantWarTags.push(warTag);
          }
        }
      }

      if (relevantWarTags.length === 7) {
        console.log('All 7 Relevant War Tags:', relevantWarTags);

        // Get the current month and year, and format it for the path
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed, so add 1
        const currentYear = now.getFullYear();
        const monthPath = `${currentMonth}_${currentYear}_CWL`;

        for (const warTag of relevantWarTags) {
          const warData = await getPlayerPerformanceByWarTag(warTag);

          if (warData) {
            // Determine if my clan is under "clan" or "opponent"
            let myClanData, opponentData;
            if (warData.clan.tag === clanTag) {
              myClanData = warData.clan;
              opponentData = warData.opponent;
            } else {
              myClanData = warData.opponent;
              opponentData = warData.clan;
            }

            const branchName = `${myClanData.name} vs ${opponentData.name}`;

            // Initialize the attack_stats and def_stats
            const attackStats = {};
            const defStats = {};

            // Process attack and defense stats for each member of my clan
            for (const member of myClanData.members) {
              const playerName = member.name;
              const playerTag = member.tag;

              // Check for attack stats in "attacks"
              if (member.attacks && member.attacks.length > 0) {
                const attack = member.attacks[0]; // Assuming one attack per player
                attackStats[playerName] = {
                  player_tag: playerTag,
                  attack_stars: attack.stars,
                  attack_destruction: attack.destructionPercentage
                };
              }

              // Check for defense stats in "bestOpponentAttack"
              if (member.bestOpponentAttack) {
                const bestOpponentAttack = member.bestOpponentAttack;
                defStats[playerName] = {
                  player_tag: playerTag,
                  def_stars: bestOpponentAttack.stars,
                  def_destruction: bestOpponentAttack.destructionPercentage
                };
              }
            }

            // Save attack_stats and def_stats into Firebase with the modified path
            await admin.database().ref(`CWL Performance/${monthPath}/${branchName}/attack_stats`).set(attackStats);
            await admin.database().ref(`CWL Performance/${monthPath}/${branchName}/def_stats`).set(defStats);

            console.log(`Data for ${branchName} saved successfully.`);
          }
        }
        console.log('All war data has been saved.');
      } else {
        console.log(`Found ${relevantWarTags.length} out of 7 Relevant War Tags.`);
      }
    } else {
      console.log('No CWL data available.');
    }
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
