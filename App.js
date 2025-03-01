import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const WordSearch = () => {
  const puzzleGrid = [
    ['P', 'Y', 'T', 'H', 'O', 'N', 'X', 'Q'],
    ['R', 'U', 'B', 'Y', 'L', 'M', 'J', 'S'],
    ['O', 'J', 'A', 'V', 'A', 'K', 'L', 'W'],
    ['G', 'H', 'S', 'W', 'I', 'F', 'T', 'P'],
    ['R', 'U', 'I', 'C', 'P', 'L', 'U', 'R'],
    ['A', 'B', 'C', 'P', 'H', 'P', 'X', 'O'],
    ['M', 'N', 'O', 'Q', 'R', 'S', 'T', 'G'],
    ['Z', 'R', 'U', 'S', 'T', 'Y', 'W', 'X']
  ];

  const dictionary = new Set([
    'PYTHON', 'JAVA', 'RUBY', 'SWIFT', 'RUST', 'PHP',
    'RUN', 'USE', 'TRY', 'PRO', 'ROW', 'SUN', 'CAT',
    'DOG', 'RAT', 'HAT', 'SAT', 'FAT', 'PAT', 'BAT',
    'THE', 'AND', 'FOR', 'BUT', 'NOT', 'ALL', 'ANY',
  ]);

  // Store word locations along with the words
  const [foundWordsLocations, setFoundWordsLocations] = useState(new Map());
  const [selection, setSelection] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [score, setScore] = useState(0);
  const [cursor, setCursor] = useState({ row: 0, col: 0 });
  const [selectionStart, setSelectionStart] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const gridRef = useRef(null);
  const cellRefs = useRef({});

  // Find all found words that start with the given letter
  const findMatchingFoundWords = (startLetter) => {
    const matchingCells = [];
    foundWordsLocations.forEach((locations, word) => {
      if (word.startsWith(startLetter)) {
        locations.forEach(location => {
          matchingCells.push(location);
        });
      }
    });
    setHighlightedCells(matchingCells);
  };

  // Store word location when found
  const storeWordLocation = (word, locations) => {
    setFoundWordsLocations(prev => new Map(prev).set(word, locations));
  };

  const startSelection = (row, col) => {
    setIsSelecting(true);
    setSelectionStart({ row, col });
    setSelection([{ row, col }]);
    setCurrentWord(puzzleGrid[row][col]);
    findMatchingFoundWords(puzzleGrid[row][col]);
  };

  const endSelection = () => {
    setIsSelecting(false);
    const forwardWord = currentWord;
    const backwardWord = currentWord.split('').reverse().join('');
    
    if (forwardWord.length >= 3) {
      if (dictionary.has(forwardWord) && !foundWordsLocations.has(forwardWord)) {
        storeWordLocation(forwardWord, selection);
        setScore(prev => prev + (forwardWord.length * 10));
      } else if (dictionary.has(backwardWord) && !foundWordsLocations.has(backwardWord)) {
        storeWordLocation(backwardWord, selection);
        setScore(prev => prev + (backwardWord.length * 10));
      }
    }
    
    setSelection([]);
    setCurrentWord('');
    setSelectionStart(null);
    setHighlightedCells([]);
  };

  const cancelSelection = () => {
    setIsSelecting(false);
    setSelection([]);
    setCurrentWord('');
    setSelectionStart(null);
    setHighlightedCells([]);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    e.preventDefault();
    const { row, col } = cursor;

    switch (e.key) {
      case 'ArrowUp':
        if (row > 0) setCursor({ row: row - 1, col });
        break;
      case 'ArrowDown':
        if (row < puzzleGrid.length - 1) setCursor({ row: row + 1, col });
        break;
      case 'ArrowLeft':
        if (col > 0) setCursor({ row, col: col - 1 });
        break;
      case 'ArrowRight':
        if (col < puzzleGrid[0].length - 1) setCursor({ row, col: col + 1 });
        break;
      case 'Space':
      case 'Enter':
        if (!isSelecting) {
          startSelection(row, col);
        } else {
          endSelection();
        }
        break;
      case 'Escape':
        cancelSelection();
        break;
    }
  };

  // Update selection when cursor moves
  useEffect(() => {
    if (isSelecting && selectionStart) {
      const { row, col } = cursor;
      const start = selectionStart;
      const newSelection = [];
      const newWord = [];

      if (row === start.row) { // Horizontal
        const startCol = Math.min(start.col, col);
        const endCol = Math.max(start.col, col);
        for (let c = startCol; c <= endCol; c++) {
          newSelection.push({ row, col: c });
          newWord.push(puzzleGrid[row][c]);
        }
      } else if (col === start.col) { // Vertical
        const startRow = Math.min(start.row, row);
        const endRow = Math.max(start.row, row);
        for (let r = startRow; r <= endRow; r++) {
          newSelection.push({ row: r, col });
          newWord.push(puzzleGrid[r][col]);
        }
      } else if (Math.abs(row - start.row) === Math.abs(col - start.col)) { // Diagonal
        const rowDir = row > start.row ? 1 : -1;
        const colDir = col > start.col ? 1 : -1;
        const length = Math.abs(row - start.row) + 1;
        for (let i = 0; i < length; i++) {
          const r = start.row + (i * rowDir);
          const c = start.col + (i * colDir);
          newSelection.push({ row: r, col: c });
          newWord.push(puzzleGrid[r][c]);
        }
      }

      if (newSelection.length > 0) {
        setSelection(newSelection);
        setCurrentWord(newWord.join(''));
      }
    }
  }, [cursor, isSelecting, selectionStart]);

  // Mouse controls
  const handleMouseDown = (row, col) => {
    startSelection(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (isSelecting) {
      setCursor({ row, col });
    }
  };

  const handleMouseUp = () => {
    endSelection();
  };

  // Focus management
  useEffect(() => {
    const key = `${cursor.row}-${cursor.col}`;
    cellRefs.current[key]?.focus();
  }, [cursor]);

  const isCellSelected = (row, col) => {
    return selection.some(pos => pos.row === row && pos.col === col);
  };

  const isCellCursor = (row, col) => {
    return cursor.row === row && cursor.col === col;
  };

  const isCellHighlighted = (row, col) => {
    return highlightedCells.some(pos => pos.row === row && pos.col === col);
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Word Search</span>
          <span className="text-lg">Score: {score}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-sm text-gray-600">
          <p>Keyboard controls:</p>
          <ul className="list-disc pl-5">
            <li>Arrow keys to move cursor</li>
            <li>Space/Enter to start/end selection</li>
            <li>Escape to cancel selection</li>
          </ul>
        </div>
        <div className="flex gap-8">
          <div 
            ref={gridRef}
            className="select-none"
            onMouseLeave={cancelSelection}
          >
            {puzzleGrid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((letter, colIndex) => (
                  <div
                    key={colIndex}
                    ref={el => cellRefs.current[`${rowIndex}-${colIndex}`] = el}
                    data-pos={`${rowIndex}-${colIndex}`}
                    tabIndex={0}
                    className={`w-12 h-12 flex items-center justify-center text-lg font-bold
                      cursor-pointer select-none border border-gray-200 outline-none
                      ${isCellSelected(rowIndex, colIndex) ? 'bg-blue-200' : ''}
                      ${isCellHighlighted(rowIndex, colIndex) ? 'bg-green-100' : ''}
                      ${isCellCursor(rowIndex, colIndex) ? 'ring-2 ring-blue-500' : ''}
                      focus:ring-2 focus:ring-blue-500
                    `}
                    onKeyDown={handleKeyDown}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    onMouseUp={handleMouseUp}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-bold mb-2">Found Words:</h3>
            <div className="max-h-96 overflow-y-auto">
              <ul className="space-y-1">
                {Array.from(foundWordsLocations.keys()).sort().map(word => (
                  <li key={word} className="font-mono">
                    {word} (+{word.length * 10})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordSearch;
