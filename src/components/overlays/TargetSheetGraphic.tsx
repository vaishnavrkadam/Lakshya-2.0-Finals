import React from 'react';

interface TargetSheetGraphicProps {
    score?: number;
    size?: number;
}

/**
 * ISSF 10M Target graphic displaying only the black center (8, 9, 10 rings).
 * Plots an amber/orange bullet hit dot based on the decimal score:
 * - 10.9: Dead center
 * - 10.0 - 10.8: Inside ring 10
 * - 9.0 - 9.9: Inside ring 9
 * - 8.0 - 8.9: Inside ring 8
 * - < 8.0: Near edge
 */
export default function TargetSheetGraphic({ score = 10.0, size = 64 }: TargetSheetGraphicProps) {
    // Generate deterministic angle from score for visual realistic placement
    const angle = ((Math.round((score * 7.3) * 10) % 360) * Math.PI) / 180;

    // Radius from center (0 to 1 normalized)
    // 10.9 -> r = 0.05
    // 10.0 -> r = 0.28
    // 9.0  -> r = 0.60
    // 8.0  -> r = 0.88
    // <8.0 -> r = 0.95
    let radiusFactor = 0.1;
    if (score >= 10.9) {
        radiusFactor = 0.05;
    } else if (score >= 10.0) {
        // 10.0 to 10.8
        radiusFactor = 0.08 + (10.9 - score) * 0.22;
    } else if (score >= 9.0) {
        // 9.0 to 9.9
        radiusFactor = 0.32 + (9.9 - score) * 0.28;
    } else if (score >= 8.0) {
        // 8.0 to 8.9
        radiusFactor = 0.62 + (8.9 - score) * 0.26;
    } else {
        radiusFactor = 0.92;
    }

    const center = size / 2;
    const maxRadius = (size / 2) * 0.92;

    const hitX = center + Math.cos(angle) * (maxRadius * radiusFactor);
    const hitY = center + Math.sin(angle) * (maxRadius * radiusFactor);

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="shrink-0 select-none overflow-visible"
        >
            {/* Outer Target Background (Black ISSF Center) */}
            <circle cx={center} cy={center} r={center - 1} fill="#050505" stroke="#FFFFFF" strokeWidth="1.5" />

            {/* Ring 8 */}
            <circle cx={center} cy={center} r={center * 0.88} fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.8" />

            {/* Ring 9 */}
            <circle cx={center} cy={center} r={center * 0.58} fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.8" />

            {/* Ring 10 */}
            <circle cx={center} cy={center} r={center * 0.28} fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.9" />

            {/* Inner Ten Crosshair (+) */}
            <line x1={center - 2.5} y1={center} x2={center + 2.5} y2={center} stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.8" />
            <line x1={center} y1={center - 2.5} x2={center} y2={center + 2.5} stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.8" />

            {/* Ring 8 Labels (Top, Bottom, Left, Right) */}
            <text x={center} y={center * 0.22} fill="#FFFFFF" fontSize={size * 0.12} fontWeight="bold" textAnchor="middle" dominantBaseline="middle">8</text>
            <text x={center} y={center * 1.82} fill="#FFFFFF" fontSize={size * 0.12} fontWeight="bold" textAnchor="middle" dominantBaseline="middle">8</text>
            <text x={center * 0.2} y={center} fill="#FFFFFF" fontSize={size * 0.12} fontWeight="bold" textAnchor="middle" dominantBaseline="middle">8</text>
            <text x={center * 1.82} y={center} fill="#FFFFFF" fontSize={size * 0.12} fontWeight="bold" textAnchor="middle" dominantBaseline="middle">8</text>

            {/* Bullet Hit Mark (Amber/Orange Dot as shown in reference) */}
            {score !== undefined && score > 0 && (
                <g>
                    {/* Shadow / glow */}
                    <circle cx={hitX} cy={hitY} r={size * 0.08} fill="#EA580C" opacity="0.4" />
                    {/* Hit Dot */}
                    <circle cx={hitX} cy={hitY} r={size * 0.065} fill="#F97316" stroke="#FFFFFF" strokeWidth="0.8" />
                </g>
            )}
        </svg>
    );
}
