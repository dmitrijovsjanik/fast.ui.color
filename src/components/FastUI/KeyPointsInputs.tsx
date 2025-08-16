import React from 'react';
import { KeyPoint } from '../../types/curveEditor';

interface KeyPointsInputsProps {
  keyPoints: KeyPoint[];
  onKeyPointChange: (pointId: string, value: string) => void;
}

export function KeyPointsInputs({ keyPoints, onKeyPointChange }: KeyPointsInputsProps) {
  return (
    <div className="keypoints-inputs-row">
      <div className="keypoints-spacer"></div>
      <div className="keypoints-inputs-container">
        {keyPoints.map((point) => (
          <input
            key={point.id}
            type="number"
            min="0"
            max="100"
            step="1"
            value={Math.round(point.y * 100)}
            onChange={(e) => {
              const percentValue = parseInt(e.target.value);
              if (!isNaN(percentValue) && percentValue >= 0 && percentValue <= 100) {
                onKeyPointChange(point.id, (percentValue / 100).toString());
              }
            }}
            className="keypoint-input"
            placeholder="%"
          />
        ))}
      </div>
    </div>
  );
}
