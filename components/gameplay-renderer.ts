import { normalizeGameplayBackgroundId, type GameplayBackgroundId } from "@/lib/gameplay-backgrounds";

type Point = { x: number; y: number };

function fract(value: number) {
  return value - Math.floor(value);
}

function polygon(context: CanvasRenderingContext2D, points: Point[], fill: string) {
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) context.lineTo(points[index].x, points[index].y);
  context.closePath();
  context.fillStyle = fill;
  context.fill();
}

function drawStars(context: CanvasRenderingContext2D, elapsed: number, width: number, height: number, color: string) {
  context.fillStyle = color;
  for (let index = 0; index < 42; index += 1) {
    const x = fract(index * 0.618033 + 0.13) * width;
    const drift = fract(index * 0.371 + elapsed * (0.012 + (index % 5) * 0.002));
    const y = drift * height * 0.42;
    const size = 1 + (index % 3);
    context.globalAlpha = 0.28 + (index % 5) * 0.11;
    context.fillRect(x, y, size, size);
  }
  context.globalAlpha = 1;
}

function drawVoxelRush(context: CanvasRenderingContext2D, elapsed: number, width: number, height: number) {
  context.fillStyle = "#0b0e12";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#151b22";
  context.fillRect(0, 0, width, height * 0.34);
  drawStars(context, elapsed, width, height, "#d8f3ff");

  const horizon = height * 0.28;
  const jumpPhase = fract(elapsed / 2.65);
  const jump = jumpPhase < 0.46 ? Math.sin((jumpPhase / 0.46) * Math.PI) * height * 0.035 : 0;
  const sway = Math.sin(elapsed * 0.78) * width * 0.025;
  context.save();
  context.translate(sway, jump);

  const platforms = Array.from({ length: 16 }, (_, index) => {
    const z = fract(index / 16 + elapsed * 0.22);
    return { index, z };
  }).sort((left, right) => left.z - right.z);

  for (const platform of platforms) {
    const zNear = Math.min(1, platform.z + 0.095);
    const depth = platform.z * platform.z;
    const nearDepth = zNear * zNear;
    const lane = Math.sin(platform.index * 2.17) * 0.42;
    const nextLane = Math.sin((platform.index + 1) * 2.17) * 0.42;
    const farY = horizon + depth * (height - horizon);
    const nearY = horizon + nearDepth * (height - horizon);
    const farHalf = width * (0.035 + depth * 0.28);
    const nearHalf = width * (0.045 + nearDepth * 0.32);
    const farX = width / 2 + lane * width * depth;
    const nearX = width / 2 + nextLane * width * nearDepth;
    const top = platform.index % 4 === 0 ? "#b9ef2d" : platform.index % 3 === 0 ? "#e5edf4" : "#83909d";
    polygon(context, [
      { x: farX - farHalf, y: farY },
      { x: farX + farHalf, y: farY },
      { x: nearX + nearHalf, y: nearY },
      { x: nearX - nearHalf, y: nearY },
    ], top);
    const sideHeight = Math.max(3, nearDepth * height * 0.055);
    polygon(context, [
      { x: nearX - nearHalf, y: nearY },
      { x: nearX + nearHalf, y: nearY },
      { x: nearX + nearHalf, y: nearY + sideHeight },
      { x: nearX - nearHalf, y: nearY + sideHeight },
    ], platform.index % 4 === 0 ? "#637f18" : "#3b444d");
  }

  for (let index = 0; index < 5; index += 1) {
    const z = fract(index / 5 + elapsed * 0.31 + 0.18);
    const depth = z * z;
    const y = horizon + depth * (height - horizon);
    const x = width / 2 + Math.sin(index * 4.7) * width * depth * 0.3;
    const size = 10 + depth * width * 0.12;
    context.fillStyle = index % 2 ? "#d1fe17" : "#f0a35c";
    context.fillRect(x - size / 2, y - size, size, size);
    context.fillStyle = "rgba(0,0,0,.28)";
    context.fillRect(x - size / 2, y - size * 0.34, size, size * 0.34);
  }

  context.restore();
  context.fillStyle = "rgba(9,12,15,.34)";
  context.fillRect(0, height * 0.88, width, height * 0.12);
}

function drawNightDrive(context: CanvasRenderingContext2D, elapsed: number, width: number, height: number) {
  context.fillStyle = "#0a0d10";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#15191e";
  context.fillRect(0, 0, width, height * 0.38);
  drawStars(context, elapsed * 0.45, width, height, "#b7c7d8");

  const horizon = height * 0.31;
  for (let index = 0; index < 18; index += 1) {
    const buildingWidth = width * (0.025 + (index % 4) * 0.012);
    const buildingHeight = height * (0.06 + (index % 7) * 0.018);
    const x = (index / 17) * width - buildingWidth / 2;
    context.fillStyle = index % 3 === 0 ? "#222a31" : "#1b2228";
    context.fillRect(x, horizon - buildingHeight, buildingWidth, buildingHeight);
    context.fillStyle = index % 4 === 0 ? "#d1fe17" : "#e7b36a";
    context.globalAlpha = 0.42;
    for (let row = 0; row < 4; row += 1) {
      context.fillRect(x + buildingWidth * 0.24, horizon - buildingHeight + 8 + row * 13, 3, 5);
    }
    context.globalAlpha = 1;
  }

  polygon(context, [
    { x: width * 0.43, y: horizon },
    { x: width * 0.57, y: horizon },
    { x: width * 0.96, y: height },
    { x: width * 0.04, y: height },
  ], "#1d2329");

  for (let index = 0; index < 15; index += 1) {
    const z = fract(index / 15 + elapsed * 0.32);
    const depth = z * z;
    const y = horizon + depth * (height - horizon);
    const next = Math.min(1, z + 0.035);
    const nextDepth = next * next;
    const nextY = horizon + nextDepth * (height - horizon);
    const lineHalf = 1 + depth * 8;
    context.fillStyle = index % 3 === 0 ? "#d1fe17" : "#f1f3f5";
    context.globalAlpha = 0.58 + depth * 0.42;
    context.fillRect(width / 2 - lineHalf, y, lineHalf * 2, Math.max(3, nextY - y));
  }
  context.globalAlpha = 1;

  for (let index = 0; index < 8; index += 1) {
    const z = fract(index / 8 + elapsed * 0.2 + 0.08);
    const depth = z * z;
    const y = horizon + depth * (height - horizon);
    const half = width * (0.07 + depth * 0.38);
    const gateHeight = 8 + depth * height * 0.19;
    context.strokeStyle = index % 2 === 0 ? "#d1fe17" : "#6ec5ff";
    context.globalAlpha = 0.35 + depth * 0.65;
    context.lineWidth = 2 + depth * 7;
    context.beginPath();
    context.moveTo(width / 2 - half, y);
    context.lineTo(width / 2 - half, y - gateHeight);
    context.lineTo(width / 2 + half, y - gateHeight);
    context.lineTo(width / 2 + half, y);
    context.stroke();
  }
  context.globalAlpha = 1;

  const steering = Math.sin(elapsed * 0.92) * width * 0.018;
  context.fillStyle = "#0b0d10";
  context.beginPath();
  context.arc(width / 2 + steering, height * 0.96, width * 0.17, Math.PI, 0);
  context.fill();
  context.strokeStyle = "#424d57";
  context.lineWidth = 7;
  context.beginPath();
  context.arc(width / 2 + steering, height * 0.96, width * 0.12, Math.PI * 1.08, Math.PI * 1.92);
  context.stroke();
}

function drawMarbleFlow(context: CanvasRenderingContext2D, elapsed: number, width: number, height: number) {
  context.fillStyle = "#101315";
  context.fillRect(0, 0, width, height);
  const columns = 5;
  const railWidth = width * 0.13;
  for (let column = 0; column < columns; column += 1) {
    const x = width * (0.14 + column * 0.18);
    context.strokeStyle = column % 2 === 0 ? "#4b555d" : "#343c43";
    context.lineWidth = railWidth * 0.12;
    context.beginPath();
    context.moveTo(x, 0);
    for (let step = 0; step <= 12; step += 1) {
      const y = (step / 12) * height;
      const wave = Math.sin(step * 0.95 + column * 1.4) * railWidth * 0.32;
      context.lineTo(x + wave, y);
    }
    context.stroke();
  }

  for (let index = 0; index < 24; index += 1) {
    const column = index % columns;
    const phase = fract(index * 0.173 + elapsed * (0.17 + (index % 4) * 0.012));
    const y = phase * height;
    const baseX = width * (0.14 + column * 0.18);
    const x = baseX + Math.sin((y / height) * 11.4 + column * 1.4) * railWidth * 0.32;
    const radius = width * (0.018 + (index % 3) * 0.004);
    context.fillStyle = index % 3 === 0 ? "#d1fe17" : index % 3 === 1 ? "#f0a35c" : "#eef2f5";
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "rgba(255,255,255,.32)";
    context.beginPath();
    context.arc(x - radius * 0.28, y - radius * 0.3, radius * 0.28, 0, Math.PI * 2);
    context.fill();
  }

  const plateY = height * (0.22 + fract(elapsed * 0.09) * 0.62);
  context.fillStyle = "#242b30";
  context.fillRect(width * 0.08, plateY, width * 0.84, height * 0.018);
  context.fillStyle = "#d1fe17";
  context.fillRect(width * 0.08, plateY, width * (0.12 + fract(elapsed * 0.22) * 0.36), height * 0.018);
}

export function drawGameplayFrame(
  context: CanvasRenderingContext2D,
  backgroundId: GameplayBackgroundId | string,
  elapsed: number,
  width: number,
  height: number,
) {
  const normalized = normalizeGameplayBackgroundId(backgroundId);
  context.save();
  if (["arena-fps", "arena-fps-extended", "containment-lab"].includes(normalized)) drawNightDrive(context, elapsed, width, height);
  else if (normalized === "physics-lab") drawMarbleFlow(context, elapsed, width, height);
  else drawVoxelRush(context, elapsed, width, height);
  context.restore();
}
