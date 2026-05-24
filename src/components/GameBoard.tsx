import { useEffect, useRef } from 'react';
import { GameEngine, GameState } from '../game/GameEngine';
import { LEVELS } from '../game/levels';

interface GameBoardProps {
    gameState: GameState;
    onStateChange: (state: GameState) => void;
}

export const GameBoard = ({ gameState, onStateChange }: GameBoardProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<GameEngine | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Load Level
        const levelData = LEVELS.find(l => l.id === gameState.currentLevelIdx);
        if (!levelData) {
            console.error("Level not found");
            return;
        }

        // Initialize Engine
        engineRef.current = new GameEngine(
            canvasRef.current,
            levelData,
            gameState,
            onStateChange
        );

        return () => {
            engineRef.current?.dispose();
        };
    }, [gameState.currentLevelIdx, gameState.status]); // Re-init on level change

    return (
        <div className="game-board-container" style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#1a1a1a',
            overflow: 'hidden',
            // No asymmetric padding — keep canvas perfectly centered so
            // getBoundingClientRect() matches where the user sees the canvas
            padding: '8px',
            boxSizing: 'border-box',
        }}>
            <canvas
                ref={canvasRef}
                width={1000}
                height={1000}
                style={{
                    // Let the canvas fill as much of the container as possible
                    // while staying square (aspect-ratio enforces 1:1)
                    maxWidth: '100%',
                    maxHeight: '100%',
                    aspectRatio: '1 / 1',
                    display: 'block',
                    boxShadow: '0 0 30px rgba(0,0,0,0.6)',
                    // Cursor hint: pointer when hovering to show it's interactive
                    cursor: 'grab',
                }}
            />
        </div>
    );
};
