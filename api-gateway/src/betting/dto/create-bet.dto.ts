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

export class CreateBetDto {
  user_id: number;

  game_id: number;

  bet_amount: number;

  odds: number;

  event_time: number;

  location: LocationType;

  city: string;

  device_type: string;

  bet_type: BetType;
}
