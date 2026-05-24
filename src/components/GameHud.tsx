import { GameState } from '../game/GameEngine';

interface GameHudProps {
    gameState: GameState;
    onBackToLevels?: () => void;
}

export const GameHud = ({ gameState, onBackToLevels }: GameHudProps) => {
    const starThresholds = [60, 30]; // 3★: 60s+, 2★: 30s+, 1★: complete

    let currentStars = 1;
    if (gameState.timeLeft >= starThresholds[0]) currentStars = 3;
    else if (gameState.timeLeft >= starThresholds[1]) currentStars = 2;

    return (
        <div className="game-hud">
            {/* LEFT: Back button + Stage */}
            <div className="hud-left-group">
                {onBackToLevels && (
                    <button
                        onClick={onBackToLevels}
                        className="btn-back-to-levels hud-back-btn"
                    >
                        <span className="icon">←</span>
                        <span className="text">LEVEL</span>
                    </button>
                )}
                <span className="hud-stage">Stage {gameState.currentLevelIdx}</span>
            </div>

            {/* CENTER: Stars */}
            <div className="hud-stars">
                {'★'.repeat(currentStars) + '☆'.repeat(3 - currentStars)}
            </div>

            {/* RIGHT: Time + Score */}
            <div className="hud-right-group">
                <span className="hud-time">⏱ {Math.floor(gameState.timeLeft)}s</span>
                <span className="hud-score">🏆 {gameState.score}</span>
            </div>
        </div>
    );
};
