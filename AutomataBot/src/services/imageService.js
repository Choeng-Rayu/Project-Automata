// Image generation service for automata visualization
import { createCanvas } from 'canvas';
import fs from 'fs-extra';
import path from 'path';

/**
 * Generate visual diagram of finite automaton
 * @param {Object} fa - Finite automaton
 * @param {string} title - Title for the diagram
 * @param {string} type - Type of operation (nfa2dfa, minimize, etc.)
 * @param {string} simulationPath - Optional simulation path for highlighting
 * @returns {Promise<string>} Path to generated image
 */
export async function generateAutomatonImage(fa, title = 'Finite Automaton', type = 'general', simulationPath = null) {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 800, 600);
  
  // Set up drawing styles
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.font = '14px Arial';
  ctx.lineWidth = 2;
  
  // Draw title
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#2196F3';
  ctx.textAlign = 'center';
  ctx.fillText(title, 400, 30);
  
  // Reset styles for automaton
  ctx.fillStyle = 'black';
  ctx.font = '12px Arial';
  
  // Calculate state positions in a circle layout
  const { states, transitions, startState, finalStates } = fa;
  const centerX = 400;
  const centerY = 300;
  const radius = Math.min(200, 150 + states.length * 10);
  
  const statePositions = {};
  states.forEach((state, index) => {
    const angle = (2 * Math.PI * index) / states.length;
    statePositions[state] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  // Draw transitions (arrows)
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1.5;
  
  transitions.forEach(transition => {
    const from = statePositions[transition.from];
    const to = statePositions[transition.to];
    
    if (from && to) {
      if (transition.from === transition.to) {
        // Self-loop
        drawSelfLoop(ctx, from, transition.symbol);
      } else {
        // Regular transition
        drawArrow(ctx, from, to, transition.symbol);
      }
    }
  });
  
  // Draw states
  states.forEach(state => {
    const pos = statePositions[state];
    if (pos) {
      // Determine state style
      const isStart = state === startState;
      const isFinal = finalStates.includes(state);
      
      drawState(ctx, pos, state, isStart, isFinal);
    }
  });
  
  // Add legend
  drawLegend(ctx, type);
  
  // Add automaton info
  drawInfo(ctx, fa);
  
  // Save image to temporary file
  const timestamp = Date.now();
  const filename = `automaton_${timestamp}.png`;
  const filepath = path.join(process.cwd(), 'temp', filename);
  
  // Ensure temp directory exists
  await fs.ensureDir(path.dirname(filepath));
  
  // Save canvas to file
  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(filepath, buffer);
  
  return filepath;
}

/**
 * Draw a state circle
 */
function drawState(ctx, pos, label, isStart, isFinal) {
  const stateRadius = 25;
  
  // Draw outer circle for final states
  if (isFinal) {
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, stateRadius + 3, 0, 2 * Math.PI);
    ctx.stroke();
  }
  
  // Draw main state circle
  ctx.strokeStyle = isStart ? '#FF9800' : '#2196F3';
  ctx.fillStyle = isStart ? '#FFF3E0' : '#E3F2FD';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, stateRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  
  // Draw state label
  ctx.fillStyle = 'black';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, pos.x, pos.y);
  
  // Draw start arrow
  if (isStart) {
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos.x - stateRadius - 30, pos.y);
    ctx.lineTo(pos.x - stateRadius - 5, pos.y);
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(pos.x - stateRadius - 5, pos.y);
    ctx.lineTo(pos.x - stateRadius - 10, pos.y - 5);
    ctx.moveTo(pos.x - stateRadius - 5, pos.y);
    ctx.lineTo(pos.x - stateRadius - 10, pos.y + 5);
    ctx.stroke();
  }
}

/**
 * Draw transition arrow between states
 */
function drawArrow(ctx, from, to, symbol) {
  const stateRadius = 25;
  
  // Calculate arrow start and end points (on circle edges)
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  const startX = from.x + (dx / distance) * stateRadius;
  const startY = from.y + (dy / distance) * stateRadius;
  const endX = to.x - (dx / distance) * stateRadius;
  const endY = to.y - (dy / distance) * stateRadius;
  
  // Draw arrow line
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  
  // Draw arrow head
  const headLength = 10;
  const headAngle = Math.PI / 6;
  const angle = Math.atan2(dy, dx);
  
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLength * Math.cos(angle - headAngle),
    endY - headLength * Math.sin(angle - headAngle)
  );
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLength * Math.cos(angle + headAngle),
    endY - headLength * Math.sin(angle + headAngle)
  );
  ctx.stroke();
  
  // Draw symbol label
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  
  ctx.fillStyle = 'white';
  ctx.fillRect(midX - 8, midY - 8, 16, 16);
  ctx.fillStyle = '#333';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, midX, midY);
}

/**
 * Draw self-loop transition
 */
function drawSelfLoop(ctx, pos, symbol) {
  const loopRadius = 15;
  const offsetY = -35;
  
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y + offsetY, loopRadius, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Draw arrow head
  ctx.beginPath();
  ctx.moveTo(pos.x + loopRadius, pos.y + offsetY);
  ctx.lineTo(pos.x + loopRadius - 5, pos.y + offsetY - 3);
  ctx.moveTo(pos.x + loopRadius, pos.y + offsetY);
  ctx.lineTo(pos.x + loopRadius - 5, pos.y + offsetY + 3);
  ctx.stroke();
  
  // Draw symbol label
  ctx.fillStyle = 'white';
  ctx.fillRect(pos.x - 8, pos.y + offsetY - 8, 16, 16);
  ctx.fillStyle = '#333';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, pos.x, pos.y + offsetY);
}

/**
 * Draw legend
 */
function drawLegend(ctx, type) {
  const legendX = 20;
  const legendY = 500;
  
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(legendX, legendY, 200, 80);
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.strokeRect(legendX, legendY, 200, 80);
  
  ctx.fillStyle = 'black';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Legend:', legendX + 10, legendY + 15);
  
  ctx.font = '10px Arial';
  ctx.fillText('🟠 Start State', legendX + 10, legendY + 30);
  ctx.fillText('🟢 Final State', legendX + 10, legendY + 45);
  ctx.fillText('🔵 Regular State', legendX + 10, legendY + 60);
}

/**
 * Draw automaton information
 */
function drawInfo(ctx, fa) {
  const infoX = 600;
  const infoY = 500;
  
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(infoX, infoY, 180, 80);
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.strokeRect(infoX, infoY, 180, 80);
  
  ctx.fillStyle = 'black';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Automaton Info:', infoX + 10, infoY + 15);
  
  ctx.font = '10px Arial';
  ctx.fillText(`States: ${fa.states.length}`, infoX + 10, infoY + 30);
  ctx.fillText(`Alphabet: {${fa.alphabet.join(', ')}}`, infoX + 10, infoY + 45);
  ctx.fillText(`Transitions: ${fa.transitions.length}`, infoX + 10, infoY + 60);
}

/**
 * Generate comparison image for before/after operations
 */
export async function generateComparisonImage(beforeFA, afterFA, operation) {
  const canvas = createCanvas(1200, 600);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 1200, 600);
  
  // Draw title
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#2196F3';
  ctx.textAlign = 'center';
  ctx.fillText(`${operation} - Before and After`, 600, 30);
  
  // Draw "Before" section
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#FF5722';
  ctx.fillText('Before', 200, 60);
  
  // Draw "After" section
  ctx.fillStyle = '#4CAF50';
  ctx.fillText('After', 800, 60);
  
  // Draw vertical separator
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(600, 80);
  ctx.lineTo(600, 580);
  ctx.stroke();
  
  // Draw before automaton (left side)
  drawAutomatonOnCanvas(ctx, beforeFA, 0, 80, 600, 500);
  
  // Draw after automaton (right side)
  drawAutomatonOnCanvas(ctx, afterFA, 600, 80, 600, 500);
  
  // Save comparison image
  const timestamp = Date.now();
  const filename = `comparison_${timestamp}.png`;
  const filepath = path.join(process.cwd(), 'temp', filename);
  
  await fs.ensureDir(path.dirname(filepath));
  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(filepath, buffer);
  
  return filepath;
}

/**
 * Draw automaton within specified bounds
 */
function drawAutomatonOnCanvas(ctx, fa, offsetX, offsetY, width, height) {
  const { states, transitions, startState, finalStates } = fa;
  const centerX = offsetX + width / 2;
  const centerY = offsetY + height / 2;
  const radius = Math.min(width, height) / 4;
  
  // Calculate positions
  const statePositions = {};
  states.forEach((state, index) => {
    const angle = (2 * Math.PI * index) / states.length;
    statePositions[state] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  // Draw transitions
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  transitions.forEach(transition => {
    const from = statePositions[transition.from];
    const to = statePositions[transition.to];
    if (from && to) {
      if (transition.from === transition.to) {
        drawSelfLoop(ctx, from, transition.symbol);
      } else {
        drawArrow(ctx, from, to, transition.symbol);
      }
    }
  });
  
  // Draw states
  states.forEach(state => {
    const pos = statePositions[state];
    if (pos) {
      const isStart = state === startState;
      const isFinal = finalStates.includes(state);
      drawState(ctx, pos, state, isStart, isFinal);
    }
  });
}

/**
 * Generate simulation visualization showing path through automaton
 * @param {Object} fa - Finite automaton
 * @param {string} inputString - Input string being simulated
 * @param {boolean} accepted - Whether string was accepted
 * @returns {Promise<string>} Path to generated image
 */
export async function generateSimulationImage(fa, inputString, accepted) {
  const canvas = createCanvas(1000, 700);
  const ctx = canvas.getContext('2d');

  // Clear canvas
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 1000, 700);

  // Draw title
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#2196F3';
  ctx.textAlign = 'center';
  const resultEmoji = accepted ? '✅' : '❌';
  const resultText = accepted ? 'ACCEPTED' : 'REJECTED';
  ctx.fillText(`String Simulation: "${inputString}" - ${resultEmoji} ${resultText}`, 500, 30);

  // Simulate the string to get the path
  const simulationPath = simulateWithPath(fa, inputString);

  // Draw automaton with highlighted path
  drawAutomatonWithPath(ctx, fa, simulationPath, 50, 80, 900, 500);

  // Draw simulation steps
  drawSimulationSteps(ctx, simulationPath, inputString, 50, 600);

  // Save image
  const timestamp = Date.now();
  const filename = `simulation_${timestamp}.png`;
  const filepath = path.join(process.cwd(), 'temp', filename);

  await fs.ensureDir(path.dirname(filepath));
  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(filepath, buffer);

  return filepath;
}

/**
 * Simulate string and return the path taken
 */
function simulateWithPath(fa, input) {
  const { transitions, startState, finalStates } = fa;
  const path = [{ state: startState, symbol: '', step: 0 }];
  let currentStates = new Set([startState]);

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    const nextStates = new Set();

    for (const state of currentStates) {
      for (const t of transitions) {
        if (t.from === state && t.symbol === symbol) {
          nextStates.add(t.to);
          path.push({ state: t.to, symbol: symbol, step: i + 1, from: state });
        }
      }
    }

    currentStates = nextStates;
    if (currentStates.size === 0) break;
  }

  // Check if accepted
  const accepted = Array.from(currentStates).some(state => finalStates.includes(state));

  return { path, accepted, finalStates: Array.from(currentStates) };
}

/**
 * Draw automaton with highlighted simulation path
 */
function drawAutomatonWithPath(ctx, fa, simulationPath, offsetX, offsetY, width, height) {
  const { states, transitions, startState, finalStates } = fa;
  const centerX = offsetX + width / 2;
  const centerY = offsetY + height / 2;
  const radius = Math.min(width, height) / 4;

  // Calculate positions
  const statePositions = {};
  states.forEach((state, index) => {
    const angle = (2 * Math.PI * index) / states.length;
    statePositions[state] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  // Get states in simulation path
  const pathStates = new Set(simulationPath.path.map(p => p.state));

  // Draw transitions (highlight path transitions)
  transitions.forEach(transition => {
    const from = statePositions[transition.from];
    const to = statePositions[transition.to];
    if (from && to) {
      // Check if this transition is in the simulation path
      const isInPath = simulationPath.path.some(p =>
        p.from === transition.from &&
        p.state === transition.to &&
        p.symbol === transition.symbol
      );

      ctx.strokeStyle = isInPath ? '#FF5722' : '#666';
      ctx.lineWidth = isInPath ? 3 : 1.5;

      if (transition.from === transition.to) {
        drawSelfLoop(ctx, from, transition.symbol);
      } else {
        drawArrow(ctx, from, to, transition.symbol);
      }
    }
  });

  // Draw states (highlight path states)
  states.forEach(state => {
    const pos = statePositions[state];
    if (pos) {
      const isStart = state === startState;
      const isFinal = finalStates.includes(state);
      const isInPath = pathStates.has(state);

      drawStateWithHighlight(ctx, pos, state, isStart, isFinal, isInPath);
    }
  });
}

/**
 * Draw state with path highlighting
 */
function drawStateWithHighlight(ctx, pos, label, isStart, isFinal, isInPath) {
  const stateRadius = 25;

  // Draw outer circle for final states
  if (isFinal) {
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, stateRadius + 3, 0, 2 * Math.PI);
    ctx.stroke();
  }

  // Draw main state circle with path highlighting
  if (isInPath) {
    ctx.strokeStyle = '#FF5722';
    ctx.fillStyle = '#FFEBEE';
    ctx.lineWidth = 3;
  } else {
    ctx.strokeStyle = isStart ? '#FF9800' : '#2196F3';
    ctx.fillStyle = isStart ? '#FFF3E0' : '#E3F2FD';
    ctx.lineWidth = 2;
  }

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, stateRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // Draw state label
  ctx.fillStyle = 'black';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, pos.x, pos.y);

  // Draw start arrow
  if (isStart) {
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos.x - stateRadius - 30, pos.y);
    ctx.lineTo(pos.x - stateRadius - 5, pos.y);
    ctx.stroke();

    // Arrow head
    ctx.beginPath();
    ctx.moveTo(pos.x - stateRadius - 5, pos.y);
    ctx.lineTo(pos.x - stateRadius - 10, pos.y - 5);
    ctx.moveTo(pos.x - stateRadius - 5, pos.y);
    ctx.lineTo(pos.x - stateRadius - 10, pos.y + 5);
    ctx.stroke();
  }
}

/**
 * Draw simulation steps
 */
function drawSimulationSteps(ctx, simulationPath, inputString, x, y) {
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(x, y, 900, 80);
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, 900, 80);

  ctx.fillStyle = 'black';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Simulation Steps:', x + 10, y + 20);

  ctx.font = '12px Arial';
  let stepText = '';
  simulationPath.path.forEach((step, index) => {
    if (index === 0) {
      stepText += `Start: ${step.state}`;
    } else {
      stepText += ` → [${step.symbol}] → ${step.state}`;
    }
  });

  if (stepText.length > 100) {
    stepText = stepText.substring(0, 100) + '...';
  }

  ctx.fillText(stepText, x + 10, y + 40);

  const resultText = simulationPath.accepted ?
    `✅ ACCEPTED (ended in final state: ${simulationPath.finalStates.join(', ')})` :
    `❌ REJECTED (ended in non-final state: ${simulationPath.finalStates.join(', ') || 'no state'})`;

  ctx.fillStyle = simulationPath.accepted ? '#4CAF50' : '#F44336';
  ctx.fillText(resultText, x + 10, y + 60);
}

/**
 * Clean up temporary image files
 */
export async function cleanupTempImages() {
  try {
    const tempDir = path.join(process.cwd(), 'temp');
    const files = await fs.readdir(tempDir);

    // Remove files older than 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

    for (const file of files) {
      if (file.endsWith('.png')) {
        const filepath = path.join(tempDir, file);
        const stats = await fs.stat(filepath);

        if (stats.mtime.getTime() < fiveMinutesAgo) {
          await fs.remove(filepath);
          console.log(`🗑️ Cleaned up old image: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp images:', error);
  }
}
