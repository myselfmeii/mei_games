export const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getRandomLetter = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters[Math.floor(Math.random() * letters.length)];
};

export const calculateScores = (answers, playerNames) => {
  const categories = ['name', 'place', 'animal', 'thing'];
  const roundScores = {};
  const duplicates = {};

  playerNames.forEach(player => {
    roundScores[player] = 0;
  });

  categories.forEach(category => {
    const categoryAnswers = {};
    
    playerNames.forEach(player => {
      const answer = answers[player]?.[category]?.toLowerCase().trim();
      if (answer) {
        if (!categoryAnswers[answer]) {
          categoryAnswers[answer] = [];
        }
        categoryAnswers[answer].push(player);
      }
    });

    Object.entries(categoryAnswers).forEach(([answer, players]) => {
      if (players.length > 1) {
        if (!duplicates[category]) duplicates[category] = {};
        duplicates[category][answer] = players;
        
        players.forEach(player => {
          roundScores[player] -= 25;
        });
      } else if (players.length === 1) {
        roundScores[players[0]] += 25;
      }
    });
  });

  return { roundScores, duplicates };
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
