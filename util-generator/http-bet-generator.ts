import { request } from 'undici';

interface Bet {
  user_id: number;
  game_id: number;
  bet_amount: number;
  odds: number;
  event_time: number;
  location: LocationType;
  city: string;
  device_type: string;
}

enum LocationType {
  MobileApp = 'MobileApp',
  Web = 'Web',
  DesktopApp = 'DesktopApp',
}

const generateBet = (): Bet => {
  const userId = Math.floor(Math.random() * 1000) + 1;
  const gameId = Math.floor(Math.random() * 100) + 1;

  // Определяем, будет ли ставка аномальной
  const isAmountAnomaly = Math.random() < 0.01; // 1% ставок аномальные по сумме
  const normalBetAmount = parseFloat((Math.random() * 100 + 10).toFixed(2));
  const betAmount = isAmountAnomaly ? normalBetAmount * 10 : normalBetAmount;

  // Определяем, будет ли коэффициент аномальным
  const isOddsAnomaly = Math.random() < 0.01; // 5% ставок аномальные по коэффициенту
  const normalOdds = parseFloat((Math.random() * 5 + 1.1).toFixed(2));
  const odds = isOddsAnomaly ? normalOdds * 2 : normalOdds;

  const locations = Object.values(LocationType);
  const location = locations[Math.floor(Math.random() * locations.length)];
  const eventTime = Date.now();

  const cities = [
    'Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan',
    'Nizhny Novgorod', 'Chelyabinsk', 'Samara', 'Omsk', 'Rostov-on-Don'
  ];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const deviceTypes = ['iOS', 'Android', 'Windows', 'MacOS'];
  const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];

  return {
    user_id: userId,
    game_id: gameId,
    bet_amount: betAmount,
    odds: odds,
    event_time: eventTime,
    location: location,
    city: city,
    device_type: deviceType,
  };
};


const sendBet = async (bet: Bet) => {
  const url = new URL('http://localhost:3000/betting');
  try {
    const response = await request(url, {
      method: 'POST',
      body: JSON.stringify(bet),
      headers: {
        'content-type': 'application/json'
      }
    });
    // const data = await response.body.json();
    // return data;
  } catch (error) {
    console.error('Failed to send bet:', error);
  }
};

const sendBets = async () => {
  const bets = Array.from({ length: 3000 }, generateBet);
  await Promise.all(bets.map(sendBet));
  console.log('All bets sent successfully');
};

// Запуск отправки ставок каждые 5 секунд
setInterval(sendBets, 1000);
