import { io } from 'socket.io-client';
import { setInterval } from 'timers';

enum LocationType {
  MobileApp = 'MobileApp',
  Web = 'Web',
  DesktopApp = 'DesktopApp',
}

enum BetType {
  LineBet = 'LineBet',
  TotalBet = 'TotalBet',
  MaxBet = 'MaxBet',
  FreeSpins = 'FreeSpins',
  BonusBet = 'BonusBet',
  ProgressiveBet = 'ProgressiveBet',
  FeatureBet = 'FeatureBet',
}

interface Bet {
  user_id: number;
  game_id: number;
  bet_amount: number;
  odds: number;
  event_time: number;
  location: string;
  city: string;
  device_type: string;
  bet_type: string;
}

const generateBet = (): Bet => {
  const userId = Math.floor(Math.random() * 1000) + 1;
  const gameId = Math.floor(Math.random() * 100) + 1;
  const betAmount = parseFloat((Math.random() * 100 + 10).toFixed(2));
  const odds = parseFloat((Math.random() * 5 + 1.1).toFixed(2));
  const locations = Object.values(LocationType);
  const location = locations[Math.floor(Math.random() * locations.length)];
  const eventTime = Date.now();
  const cities = ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Nizhny Novgorod', 'Chelyabinsk', 'Samara', 'Omsk', 'Rostov-on-Don'];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const deviceTypes = ['iOS', 'Android', 'Windows', 'MacOS'];
  const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
  const betTypes = Object.values(BetType);
  const betType = betTypes[Math.floor(Math.random() * betTypes.length)];

  return {
    user_id: userId,
    game_id: gameId,
    bet_amount: betAmount,
    odds: odds,
    event_time: eventTime,
    location: location,
    city: city,
    device_type: deviceType,
    bet_type: betType,
  };
};

const sendBet = (socket: any) => {
  const bet = generateBet();
  socket.emit('placeBet', bet);
  console.log('Sent bet:', bet);
};

const numberOfUsers = 1; // Number of simulated users

// Create a separate connection for each user
for (let i = 0; i < numberOfUsers; i++) {
  const socket = io('http://localhost:3000/betting', {
    transports: ['websocket'], // Using WebSocket transport for real-time interaction
  });

  socket.on('connect', () => console.log(`User ${i} connected`));
  socket.on('betOutcome', (response) => console.log(`Outcome for user ${i}:`, response));
  socket.on('disconnect', () => console.log(`User ${i} disconnected`));

  // Send bets at intervals
  setInterval(() => sendBet(socket), 5000);
}

