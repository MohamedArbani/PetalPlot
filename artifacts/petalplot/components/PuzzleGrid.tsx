import React from 'react';
import { StyleSheet, View } from 'react-native';
import colors from '@/constants/colors';
import { CellState } from '@/lib/petalplot/types';
import { GridCell } from './GridCell';

interface PuzzleGridProps {
  n: number;
  zones: number[][];
  grid: CellState[][];
  violatingCells: Set<string>;
  boardSize: number;
  isLocked: boolean;
  onCellPress: (row: number, col: number) => void;
}

export function PuzzleGrid({
  n,
  zones,
  grid,
  violatingCells,
  boardSize,
  isLocked,
  onCellPress,
}: PuzzleGridProps) {
  const cellSize = boardSize / n;

  return (
    <View
      style={[
        styles.board,
        {
          width: boardSize,
          height: boardSize,
          borderColor: colors.light.zoneBorder,
        },
      ]}
    >
      {grid.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((cellState, colIndex) => {
            const zoneId = zones[rowIndex]?.[colIndex] ?? 0;
            const key = `${rowIndex},${colIndex}`;
            return (
              <GridCell
                key={key}
                testID={`grid-cell-${rowIndex}-${colIndex}`}
                state={cellState}
                zoneId={zoneId}
                size={cellSize}
                isLocked={isLocked}
                isViolating={violatingCells.has(key)}
                borderTop={
                  rowIndex === 0 || zones[rowIndex - 1]?.[colIndex] !== zoneId
                }
                borderLeft={
                  colIndex === 0 || zones[rowIndex]?.[colIndex - 1] !== zoneId
                }
                borderRight={
                  colIndex === n - 1 ||
                  zones[rowIndex]?.[colIndex + 1] !== zoneId
                }
                borderBottom={
                  rowIndex === n - 1 ||
                  zones[rowIndex + 1]?.[colIndex] !== zoneId
                }
                onPress={() => onCellPress(rowIndex, colIndex)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderWidth: 2.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
});
