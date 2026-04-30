'use client';
import React from 'react';

/**
 * Visual representation of paper layout showing how ups fit on a sheet.
 * Renders: sheet → left/right/bottom gripper stripes → bleed area (item cell)
 * → content area (item minus bleed margins) → index number.
 */
const PaperLayoutVisualizer = ({ 
  sheetWidth, 
  sheetHeight, 
  gridLayout, 
  itemWidth, 
  itemHeight,
  ups,
  wastePercent 
}) => {
  if (!gridLayout || !gridLayout.cells?.length) {
    return null;
  }

  // Scale to fit container. Cap display height at 280px to keep tall sheets manageable.
  const maxDisplayWidth = 220;
  const maxDisplayHeight = 280;
  const scaleByWidth  = maxDisplayWidth  / sheetWidth;
  const scaleByHeight = maxDisplayHeight / sheetHeight;
  const scale = Math.min(scaleByWidth, scaleByHeight);
  const displayWidth  = sheetWidth  * scale;
  const displayHeight = sheetHeight * scale;

  const gripperLeft   = (gridLayout.gripperLeft   ?? gridLayout.printAreaX ?? 10);
  const gripperRight  = (gridLayout.gripperRight  ?? 10);
  const gripperTop    = (gridLayout.gripperTop    ?? gridLayout.printAreaY ?? 0);
  const gripperBottom = (gridLayout.gripperBottom ?? 10);

  const GRIPPER_STRIPE = 'repeating-linear-gradient(45deg,#e8e8e8,#e8e8e8 2px,transparent 2px,transparent 6px)';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 text-center">
        Sheet: {sheetWidth} × {sheetHeight} mm
      </p>

      {/* Paper sheet */}
      <div style={{
        width: displayWidth,
        height: displayHeight,
        background: '#fafafa',
        border: '2px solid hsl(var(--border))',
        position: 'relative',
        boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
        borderRadius: 3,
        overflow: 'hidden',
        flexShrink: 0,
      }}>

        {/* ── Left gripper ── */}
        {gripperLeft > 0 && (
          <div style={{
            position: 'absolute', left: 0, top: 0,
            width: gripperLeft * scale, height: '100%',
            background: GRIPPER_STRIPE,
            borderRight: '1.5px dashed #bbb',
            zIndex: 2,
          }} />
        )}

        {/* ── Right gripper ── */}
        {gripperRight > 0 && (
          <div style={{
            position: 'absolute', right: 0, top: 0,
            width: gripperRight * scale, height: '100%',
            background: GRIPPER_STRIPE,
            borderLeft: '1.5px dashed #bbb',
            zIndex: 2,
          }} />
        )}

        {/* ── Bottom gripper ── */}
        {gripperBottom > 0 && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            width: '100%', height: gripperBottom * scale,
            background: GRIPPER_STRIPE,
            borderTop: '1.5px dashed #bbb',
            zIndex: 2,
          }} />
        )}

        {/* ── Top gripper (if any) ── */}
        {gripperTop > 0 && (
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: gripperTop * scale,
            background: GRIPPER_STRIPE,
            borderBottom: '1.5px dashed #bbb',
            zIndex: 2,
          }} />
        )}

        {/* ── Item cells (bleed + content layers) ── */}
        {gridLayout.cells.map((cell, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: cell.x * scale,
              top: cell.y * scale,
              width: cell.width * scale,
              height: cell.height * scale,
              // Bleed area: slightly tinted background
              background: 'hsl(var(--primary) / 0.08)',
              border: '1px dashed hsl(var(--primary) / 0.35)',
              borderRadius: 2,
              zIndex: 1,
            }}
          >
            {/* Content area (item without bleed) */}
            {cell.contentWidth != null && (
              <div style={{
                position: 'absolute',
                left: (cell.contentX - cell.x) * scale,
                top: (cell.contentY - cell.y) * scale,
                width: cell.contentWidth * scale,
                height: cell.contentHeight * scale,
                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.22) 0%, hsl(var(--primary) / 0.14) 100%)',
                border: '1.5px solid hsl(var(--primary) / 0.55)',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: Math.max(8, Math.min(13, cell.contentWidth * scale * 0.35)),
                color: 'hsl(var(--primary))',
                fontWeight: 700,
              }}>
                {index + 1}
              </div>
            )}
            {/* Fallback number when no contentWidth */}
            {cell.contentWidth == null && (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: 'hsl(var(--primary))', fontWeight: 700,
              }}>
                {index + 1}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ 
        marginTop: 10, 
        display: 'flex', 
        gap: 12, 
        fontSize: 10,
        flexWrap: 'wrap',
        justifyContent: 'center',
        lineHeight: 1.4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ 
            width: 10, height: 10,
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.22) 0%, hsl(var(--primary) / 0.14) 100%)',
            border: '1.5px solid hsl(var(--primary) / 0.55)',
            borderRadius: 1, flexShrink: 0,
          }} />
          <span className="text-xs text-muted-foreground">Content ({ups} up{ups !== 1 ? 's' : ''})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ 
            width: 10, height: 10,
            background: 'hsl(var(--primary) / 0.08)',
            border: '1px dashed hsl(var(--primary) / 0.35)',
            borderRadius: 1, flexShrink: 0,
          }} />
          <span className="text-xs text-muted-foreground">Bleed (3mm)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ 
            width: 10, height: 10,
            background: GRIPPER_STRIPE,
            border: '1px dashed #bbb',
            borderRadius: 1, flexShrink: 0,
          }} />
          <span className="text-xs text-muted-foreground">Gripper / waste ({wastePercent}%)</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        Item: {Math.round(itemWidth * 10) / 10} × {Math.round(itemHeight * 10) / 10} mm
        {' · '}Bleed: {gridLayout.bleed ?? 3}mm each side
      </p>
    </div>
  );
};

export default PaperLayoutVisualizer;

