import React, { useState } from 'react';
import { Game, GlobalGameStats } from '../types';
import { 
  Gamepad2, 
  Clock, 
  Target, 
  Award, 
  Trash2, 
  Flame, 
  TrendingUp,
  HelpCircle,
  Network,
  Users,
  ShieldAlert,
  Edit2,
  Check
} from 'lucide-react';
import { audio } from '../services/audioService';

interface StatsDashboardProps {
  games: Game[];
  stats: GlobalGameStats;
  onResetStats: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ games, stats, onResetStats }) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [hoveredGameId, setHoveredGameId] = useState<string | null>(null);

  // Developer handle management
  const [devHandle, setDevHandle] = useState<string>(() => {
    return localStorage.getItem('phonk_developer_handle') || 'ASHLEY_022';
  });
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [newHandleText, setNewHandleText] = useState('');

  // Leaderboard filter
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<string>('overall');

  // Helper to format play time
  const formatTime = (totalSeconds: number) => {
    if (!totalSeconds || isNaN(totalSeconds)) return '0s';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    return parts.join(' ');
  };

  // Compute aggregate stats
  let totalPlayTime = 0;
  let totalSessions = 0;
  let totalSuccessCount = 0;
  let totalFailureCount = 0;
  let dominantGame: Game | null = null;
  let maxPlayTime = 0;

  const gameStatsList = games.map(game => {
    const gameStat = stats[game.id] || {
      playCount: 0,
      playTimeSeconds: 0,
      successCount: 0,
      failureCount: 0,
      highScore: 0
    };

    totalPlayTime += gameStat.playTimeSeconds;
    totalSessions += gameStat.playCount;
    totalSuccessCount += gameStat.successCount;
    totalFailureCount += gameStat.failureCount;

    if (gameStat.playTimeSeconds > maxPlayTime) {
      maxPlayTime = gameStat.playTimeSeconds;
      dominantGame = game;
    }

    const totalActions = gameStat.successCount + gameStat.failureCount;
    const successRate = totalActions > 0 
      ? Math.round((gameStat.successCount / totalActions) * 100) 
      : 0;

    return {
      ...game,
      stats: gameStat,
      successRate,
      totalActions
    };
  });

  // Calculate global average success rate
  const globalTotalActions = totalSuccessCount + totalFailureCount;
  const globalSuccessRate = globalTotalActions > 0 
    ? Math.round((totalSuccessCount / globalTotalActions) * 100) 
    : 0;

  // Sort games by play time for the top chart
  const topPlayedGames = [...gameStatsList]
    .filter(g => g.stats.playTimeSeconds > 0 || g.stats.playCount > 0)
    .sort((a, b) => b.stats.playTimeSeconds - a.stats.playTimeSeconds || b.stats.playCount - a.stats.playCount);

  // Competitors preset scores
  const COMPETITORS = [
    { handle: 'K0D3_W1ZARD', status: 'LIVE' as const, scores: { 'tiny-fishing': 120, 'phonk-rivals': 1250, 'neon-breaker': 280, 'cyber-bowl': 140, 'phonk-mines': 95, 'phonk-runner': 2100, 'synthwave-invaders': 3800, 'cyber-escape': 1100 } },
    { handle: 'MATRIX_REAPER', status: 'IDLE' as const, scores: { 'tiny-fishing': 95, 'phonk-rivals': 1180, 'neon-breaker': 240, 'cyber-bowl': 110, 'phonk-mines': 80, 'phonk-runner': 1850, 'synthwave-invaders': 3120, 'cyber-escape': 950 } },
    { handle: 'NEON_SAMURAI', status: 'LIVE' as const, scores: { 'tiny-fishing': 85, 'phonk-rivals': 980, 'neon-breaker': 210, 'cyber-bowl': 95, 'phonk-mines': 75, 'phonk-runner': 1550, 'synthwave-invaders': 2850, 'cyber-escape': 820 } },
    { handle: 'PHONK_KNIGHT', status: 'OFFLINE' as const, scores: { 'tiny-fishing': 70, 'phonk-rivals': 850, 'neon-breaker': 190, 'cyber-bowl': 80, 'phonk-mines': 60, 'phonk-runner': 1320, 'synthwave-invaders': 2400, 'cyber-escape': 710 } },
    { handle: 'GL1TCH_L0RD', status: 'LIVE' as const, scores: { 'tiny-fishing': 55, 'phonk-rivals': 620, 'neon-breaker': 140, 'cyber-bowl': 70, 'phonk-mines': 50, 'phonk-runner': 1100, 'synthwave-invaders': 1950, 'cyber-escape': 580 } },
    { handle: 'ZERO_COOL', status: 'IDLE' as const, scores: { 'tiny-fishing': 40, 'phonk-rivals': 450, 'neon-breaker': 110, 'cyber-bowl': 55, 'phonk-mines': 40, 'phonk-runner': 850, 'synthwave-invaders': 1400, 'cyber-escape': 410 } },
    { handle: 'D3V_R00T', status: 'OFFLINE' as const, scores: { 'tiny-fishing': 25, 'phonk-rivals': 310, 'neon-breaker': 75, 'cyber-bowl': 40, 'phonk-mines': 30, 'phonk-runner': 600, 'synthwave-invaders': 950, 'cyber-escape': 310 } }
  ];

  // User high scores for each game
  const playerScores: Record<string, number> = {};
  games.forEach(g => {
    playerScores[g.id] = stats[g.id]?.highScore || 0;
  });

  // Construct Leaderboard Entries based on filter
  let leaderboardEntries: Array<{
    handle: string;
    status: 'LIVE' | 'IDLE' | 'OFFLINE';
    score: number;
    gameTitle: string;
    isPlayer?: boolean;
  }> = [];

  if (selectedLeaderboard === 'overall') {
    // Rank by the highest single score in any game
    COMPETITORS.forEach(c => {
      let maxScore = 0;
      let maxGameId = '';
      Object.entries(c.scores).forEach(([gid, s]) => {
        if (s > maxScore) {
          maxScore = s;
          maxGameId = gid;
        }
      });
      const gameTitle = games.find(g => g.id === maxGameId)?.title || 'UNKNOWN';
      leaderboardEntries.push({
        handle: c.handle,
        status: c.status,
        score: maxScore,
        gameTitle
      });
    });

    // Add player overall best single score
    let playerMaxScore = 0;
    let playerMaxGameId = '';
    Object.entries(playerScores).forEach(([gid, s]) => {
      if (s > playerMaxScore) {
        playerMaxScore = s;
        playerMaxGameId = gid;
      }
    });
    const playerGameTitle = games.find(g => g.id === playerMaxGameId)?.title || (playerMaxScore > 0 ? 'UNKNOWN' : 'AWAITING RUNS');
    leaderboardEntries.push({
      handle: devHandle,
      status: 'LIVE',
      score: playerMaxScore,
      gameTitle: playerGameTitle,
      isPlayer: true
    });
  } else {
    // Rank by the selected game score
    const gameId = selectedLeaderboard;
    const gameTitle = games.find(g => g.id === gameId)?.title || 'UNKNOWN';
    COMPETITORS.forEach(c => {
      leaderboardEntries.push({
        handle: c.handle,
        status: c.status,
        score: (c.scores as any)[gameId] || 0,
        gameTitle
      });
    });

    // Add player score for that game
    leaderboardEntries.push({
      handle: devHandle,
      status: 'LIVE',
      score: playerScores[gameId] || 0,
      gameTitle,
      isPlayer: true
    });
  }

  // Sort descending by score
  leaderboardEntries.sort((a, b) => b.score - a.score);

  const handleResetClick = () => {
    audio.playClick();
    setShowConfirmReset(true);
  };

  const handleConfirmReset = () => {
    audio.playSuccess();
    onResetStats();
    setShowConfirmReset(false);
  };

  const handleCancelReset = () => {
    audio.playClick();
    setShowConfirmReset(false);
  };

  const handleSaveHandle = () => {
    const trimmed = newHandleText.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 15);
    if (trimmed) {
      localStorage.setItem('phonk_developer_handle', trimmed);
      setDevHandle(trimmed);
      audio.playSuccess();
    } else {
      audio.playError();
    }
    setIsEditingHandle(false);
  };

  return (
    <div id="stats-dashboard" className="glass border-2 border-green-500/20 bg-slate-950/85 p-6 md:p-8 rounded-sm relative overflow-hidden shadow-[0_0_40px_rgba(34,197,94,0.05)] w-full mb-12">
      {/* Laser horizontal bar line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-500/10 via-green-500 to-green-500/10"></div>
      
      {/* Decorative Matrix Background Accent */}
      <div className="absolute -top-12 -right-12 text-green-500/5 select-none pointer-events-none font-mono text-[100px] font-black tracking-tighter uppercase italic">
        TELEMETRY
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500 animate-pulse" />
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-green-400">
              OPERATIONAL_CORE_METRICS
            </h2>
          </div>
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mt-1">
            Analyzing offline-first terminal game stats & global developer leaderboard rankings
          </span>
        </div>

        {/* Action Button */}
        {totalSessions > 0 ? (
          <div>
            {!showConfirmReset ? (
              <button
                onClick={handleResetClick}
                className="px-4 py-2 bg-red-950/20 border border-red-500/30 hover:border-red-500 text-red-500 text-[9px] font-black italic uppercase skew-x-[-10deg] transition-all flex items-center gap-2 animate-scaleIn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>WIPE_METRIC_DB</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-scaleIn">
                <span className="text-[8px] font-mono text-red-500 font-bold uppercase tracking-widest">
                  CONFIRM METRICS WIPE?
                </span>
                <button
                  onClick={handleConfirmReset}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-black text-[9px] font-black uppercase transition-all"
                >
                  [YES]
                </button>
                <button
                  onClick={handleCancelReset}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase transition-all"
                >
                  [NO]
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest bg-black/40 border border-white/5 px-3 py-1.5 rounded-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/60"></span>
            <span>UPLINK_STANDBY_NO_DATA</span>
          </div>
        )}
      </div>

      {/* Grid: Bento-style counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Play Time */}
        <div className="p-4 border border-white/5 bg-black/40 hover:border-green-500/20 transition-all rounded-sm relative group">
          <div className="absolute top-3 right-3 text-green-500/10 group-hover:text-green-500/20 transition-colors">
            <Clock className="w-8 h-8" />
          </div>
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1">
            AGGREGATE_PLAY_TIME
          </span>
          <div className="text-2xl font-black italic text-white tracking-tight leading-none font-mono">
            {formatTime(totalPlayTime)}
          </div>
          <div className="mt-2 text-[8px] font-mono text-green-500/70 uppercase">
            {totalPlayTime > 0 ? 'REALTIME_CHRONO_UP' : 'CHRONO_CLOCK_IDLE'}
          </div>
        </div>

        {/* Plays count */}
        <div className="p-4 border border-white/5 bg-black/40 hover:border-green-500/20 transition-all rounded-sm relative group">
          <div className="absolute top-3 right-3 text-cyan-500/10 group-hover:text-cyan-500/20 transition-colors">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1">
            SESSIONS_BOOTED
          </span>
          <div className="text-2xl font-black italic text-cyan-400 tracking-tight leading-none font-mono">
            {totalSessions} <span className="text-xs font-normal text-cyan-600">RUNS</span>
          </div>
          <div className="mt-2 text-[8px] font-mono text-cyan-500/70 uppercase">
            {totalSessions > 0 ? 'COGNITIVE_INSTANCES_ENGAGED' : 'AWAITING_LAUNCH_SIGNAL'}
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-4 border border-white/5 bg-black/40 hover:border-green-500/20 transition-all rounded-sm relative group">
          <div className="absolute top-3 right-3 text-yellow-500/10 group-hover:text-yellow-500/20 transition-colors">
            <Target className="w-8 h-8" />
          </div>
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1">
            MEAN_SUCCESS_RATE
          </span>
          <div className="text-2xl font-black italic text-yellow-400 tracking-tight leading-none font-mono">
            {globalSuccessRate}%
          </div>
          <div className="mt-2 text-[8px] font-mono text-yellow-500/70 uppercase">
            {globalSuccessRate > 75 ? 'OPTIMAL_OPERATOR_STATUS' : globalSuccessRate > 40 ? 'AVERAGE_DESK_SKILL' : totalSessions > 0 ? 'HIGH_HEAT_ALERT' : 'NO_OPERATOR_RUNS'}
          </div>
        </div>

        {/* Favorite Game */}
        <div className="p-4 border border-white/5 bg-black/40 hover:border-green-500/20 transition-all rounded-sm relative group">
          <div className="absolute top-3 right-3 text-purple-500/10 group-hover:text-purple-500/20 transition-colors">
            <Flame className="w-8 h-8" />
          </div>
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1">
            DOMINANT_PROTOCOL
          </span>
          <div className="text-lg font-black italic text-purple-400 tracking-tight leading-none truncate pr-6">
            {dominantGame ? (dominantGame as Game).title : 'NONE'}
          </div>
          <div className="mt-3 text-[8px] font-mono text-purple-500/70 uppercase truncate">
            {dominantGame ? `MAX_LOGGED: ${formatTime((stats[(dominantGame as Game).id] || {}).playTimeSeconds)}` : 'AWAITING_TRAFFIC_DATA'}
          </div>
        </div>
      </div>

      {/* Main Stats Layout Split: Analytics (Left) vs Leaderboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        
        {/* Left Side: Game metrics and charts */}
        <div className="lg:col-span-7 space-y-8">
          {totalSessions === 0 ? (
            <div className="p-12 border-2 border-dashed border-white/5 bg-black/25 text-center rounded-sm h-full flex flex-col justify-center items-center">
              <Gamepad2 className="w-12 h-12 text-gray-700 mb-3 animate-pulse" />
              <h4 className="text-xs font-black uppercase text-gray-400 italic tracking-wider">
                NO LOCAL TELEMETRY LOGS IN SYSTEM
              </h4>
              <p className="text-[10px] text-gray-600 uppercase max-w-sm mx-auto mt-1 font-mono leading-relaxed">
                Fire up the games in the arcade deck below! The central unit will automatically feed session time, score updates, and system pings into the histogram logs.
              </p>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              {/* Histogram Charts */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-black italic uppercase text-green-400 tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                    TIME_ENGAGEMENT_HISTOGRAM
                  </h3>
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mt-0.5">
                    Relative proportion of hardware cycles allocated per protocol
                  </span>
                </div>

                <div className="p-4 border border-white/5 bg-black/60 rounded-sm space-y-4">
                  {topPlayedGames.slice(0, 5).map(game => {
                    const percent = maxPlayTime > 0 
                      ? Math.max(8, Math.round((game.stats.playTimeSeconds / maxPlayTime) * 100)) 
                      : 10;
                    
                    return (
                      <div 
                        key={game.id}
                        className="space-y-1.5 cursor-pointer relative"
                        onMouseEnter={() => setHoveredGameId(game.id)}
                        onMouseLeave={() => setHoveredGameId(null)}
                      >
                        <div className="flex justify-between items-center text-[10px] font-black italic uppercase">
                          <span className="text-gray-300 tracking-tight hover:text-white transition-colors">
                            {game.title}
                          </span>
                          <span className="text-green-500 font-mono">
                            {formatTime(game.stats.playTimeSeconds)}
                          </span>
                        </div>

                        {/* Neon Bar */}
                        <div className="h-4 bg-slate-900 border border-white/5 rounded-none relative overflow-hidden">
                          <div 
                            style={{ width: `${percent}%` }}
                            className="h-full bg-gradient-to-r from-green-600/60 to-green-400 shadow-[0_0_12px_rgba(34,197,94,0.4)] transition-all duration-500 ease-out flex items-center justify-end px-2"
                          >
                            {percent > 20 && (
                              <span className="text-[7px] font-black text-black uppercase font-mono italic">
                                {percent}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pop-out tooltip if hovered */}
                        {hoveredGameId === game.id && (
                          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-950 border-2 border-green-500 p-2 text-[8px] font-mono text-gray-400 uppercase tracking-wider space-y-1 shadow-2xl animate-scaleIn">
                            <div className="font-black text-green-400 italic text-[9px] border-b border-white/10 pb-1 flex justify-between">
                              <span>{game.title} SPEC SHEET</span>
                              <span className="text-gray-400">ID: {game.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>SESSIONS RUNNING:</span>
                              <span className="text-white font-bold">{game.stats.playCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>TIME IN-ENGINE:</span>
                              <span className="text-white font-bold">{formatTime(game.stats.playTimeSeconds)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>SUCCESS SIGNALS:</span>
                              <span className="text-green-500 font-bold">{game.stats.successCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>ERROR TELEMETRY:</span>
                              <span className="text-red-500 font-bold">{game.stats.failureCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>SUCCESS RATIO:</span>
                              <span className="text-yellow-400 font-bold">{game.successRate}%</span>
                            </div>
                            <div className="flex justify-between pt-0.5 border-t border-white/10">
                              <span>RECORD SCORE:</span>
                              <span className="text-white font-bold font-mono">{game.stats.highScore || 'N/A'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Matrix list table */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-black italic uppercase text-cyan-400 tracking-wider">
                    MAIN_CORE_PLAYBACK_MATRIX
                  </h3>
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mt-0.5">
                    Telemetry readouts for each local app module
                  </span>
                </div>

                <div className="border border-white/5 bg-black/60 rounded-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[450px]">
                    <thead>
                      <tr className="border-b border-white/10 text-[8px] font-black text-gray-500 uppercase tracking-widest">
                        <th className="p-3">GAME_NODE</th>
                        <th className="p-3 text-center">RUNS</th>
                        <th className="p-3 text-center">TIME</th>
                        <th className="p-3 text-center">SUCCESS_RATE</th>
                        <th className="p-3 text-right">RECORD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {gameStatsList.map(game => {
                        const hasStats = game.stats.playCount > 0 || game.stats.playTimeSeconds > 0;
                        
                        return (
                          <tr 
                            key={game.id} 
                            className={`text-[10px] uppercase font-mono transition-colors ${
                              hasStats ? 'hover:bg-green-500/5 text-gray-200' : 'text-gray-600 bg-black/20'
                            }`}
                          >
                            <td className="p-3 font-bold italic font-sans flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${hasStats ? 'bg-green-500' : 'bg-gray-800'}`}></span>
                              <span>{game.title}</span>
                            </td>
                            <td className="p-3 text-center font-bold text-white">
                              {game.stats.playCount}
                            </td>
                            <td className="p-3 text-center">
                              {formatTime(game.stats.playTimeSeconds)}
                            </td>
                            <td className="p-3 text-center">
                              {game.totalActions > 0 ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span className={`px-1.5 py-0.5 text-[8px] font-black leading-none rounded-none border ${
                                    game.successRate > 75 
                                      ? 'bg-green-950/20 border-green-500 text-green-400' 
                                      : game.successRate > 40 
                                        ? 'bg-yellow-950/20 border-yellow-500 text-yellow-400' 
                                        : 'bg-red-950/20 border-red-500 text-red-400'
                                  }`}>
                                    {game.successRate}%
                                  </span>
                                  <span className="text-[7px] text-gray-500">
                                    ({game.stats.successCount}/{game.totalActions})
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-600 font-bold">-</span>
                              )}
                            </td>
                            <td className="p-3 text-right text-yellow-500 font-black">
                              {game.stats.highScore || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Global Developer Leaderboard */}
        <div className="lg:col-span-5 space-y-6 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400 animate-pulse" />
              <h3 className="text-xs font-black italic uppercase text-yellow-400 tracking-wider">
                NET_OPERATOR_LEADERBOARD
              </h3>
            </div>
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">
              Global ranking matrix of active terminal compiler nodes & score telemetry
            </span>
          </div>

          {/* User Handle Editor card */}
          <div className="border border-white/5 bg-slate-900/60 p-3 rounded-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">
                DEVELOPER_NODE_IDENT
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
            </div>
            
            {isEditingHandle ? (
              <div className="flex items-center gap-1.5 animate-scaleIn">
                <input
                  type="text"
                  value={newHandleText}
                  onChange={(e) => {
                    audio.playType();
                    setNewHandleText(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 15));
                  }}
                  className="bg-slate-950 border-2 border-green-500 text-green-400 text-[11px] font-mono p-1 focus:outline-none rounded-none w-full"
                  placeholder="ENTER NEW ID..."
                  autoFocus
                />
                <button
                  onClick={handleSaveHandle}
                  className="px-3 py-1.5 bg-green-500 hover:bg-green-400 text-black text-[9px] font-black uppercase transition-all flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3 h-3" />
                  <span>SET</span>
                </button>
                <button
                  onClick={() => {
                    audio.playClick();
                    setIsEditingHandle(false);
                  }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase transition-all shrink-0"
                >
                  X
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-green-400 tracking-wider">
                    {devHandle}
                  </span>
                  <span className="text-[7px] font-mono text-green-500/50 uppercase bg-green-950/20 border border-green-500/20 px-1 py-0.2">
                    YOU
                  </span>
                </div>
                <button
                  onClick={() => {
                    audio.playClick();
                    setNewHandleText(devHandle);
                    setIsEditingHandle(true);
                  }}
                  className="text-[9px] font-mono text-gray-500 hover:text-green-400 transition-colors uppercase flex items-center gap-1"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                  <span>[EDIT_ID]</span>
                </button>
              </div>
            )}
          </div>

          {/* Leaderboard Scope Selector */}
          <div className="space-y-1.5">
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">
              FILTER_NETWORK_SCOPE
            </span>
            <select
              value={selectedLeaderboard}
              onChange={(e) => {
                audio.playClick();
                setSelectedLeaderboard(e.target.value);
              }}
              className="bg-slate-900 border border-green-500/30 text-green-400 font-mono text-[10px] uppercase p-2 focus:border-green-400 focus:outline-none rounded-none w-full cursor-pointer hover:border-green-500/60 transition-colors"
            >
              <option value="overall">GLOBAL RECORD OVERALL (ANY PROTOCOL)</option>
              {games.map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>

          {/* Leaderboard entries stack */}
          <div className="space-y-2 border border-white/5 bg-black/40 p-2 rounded-sm max-h-[360px] overflow-y-auto divide-y divide-white/5">
            {leaderboardEntries.map((player, idx) => {
              const isCurrentUser = player.isPlayer;
              const rank = idx + 1;
              const hasScore = player.score > 0;

              return (
                <div 
                  key={`${player.handle}-${idx}`}
                  className={`flex items-center justify-between p-2.5 transition-all ${
                    isCurrentUser 
                      ? 'bg-green-500/10 border-l-4 border-green-500 pl-1.5' 
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Left: Rank & Handle */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Rank Badge */}
                    <span className={`w-5 h-5 flex items-center justify-center font-mono text-[9px] font-black rounded-sm border ${
                      rank === 1 
                        ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.3)]' 
                        : rank === 2 
                          ? 'bg-slate-400/20 border-slate-400 text-slate-300' 
                          : rank === 3 
                            ? 'bg-amber-700/20 border-amber-600 text-amber-500' 
                            : 'bg-black/40 border-white/10 text-gray-400'
                    }`}>
                      {rank}
                    </span>

                    {/* Handle & Online status */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* Status Light */}
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          player.status === 'LIVE' 
                            ? 'bg-green-500 shadow-[0_0_4px_#22c55e]' 
                            : player.status === 'IDLE' 
                              ? 'bg-yellow-500 shadow-[0_0_4px_#eab308]' 
                              : 'bg-gray-700'
                        }`} title={player.status}></span>
                        <span className={`font-mono text-[10px] font-black truncate tracking-tight ${
                          isCurrentUser ? 'text-green-400' : 'text-gray-200'
                        }`}>
                          {player.handle}
                        </span>
                      </div>
                      
                      {/* Game target */}
                      <span className="text-[7.5px] font-mono text-gray-500 uppercase tracking-tighter truncate mt-0.5 max-w-[150px]">
                        {hasScore ? `ON ${player.gameTitle}` : 'NO REGISTERED HIGH SCORE'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Score */}
                  <div className="text-right flex flex-col justify-center">
                    <span className={`font-mono text-xs font-black tracking-tight ${
                      hasScore 
                        ? isCurrentUser 
                          ? 'text-green-400 shadow-green-500/20' 
                          : 'text-yellow-400' 
                        : 'text-gray-600 font-bold'
                    }`}>
                      {hasScore ? player.score.toLocaleString() : '---'}
                    </span>
                    <span className="text-[6.5px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">
                      POINTS
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Operational tip / help line */}
          <div className="text-[8px] font-mono text-gray-500 bg-slate-950 p-2.5 border border-white/5 rounded-none flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
            <p className="uppercase leading-normal">
              SECURE_TELEMETRY_LINK ACTIVE. TO IMPROVE YOUR RANKING, LAUNCH HIGH-SCORE SESSIONS AND DEPLOY RETRO PROTOCOLS IN THE LIBRARY CARDS.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
