import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

type Props = {
  score: number;
};

export default function RiskGauge({ score }: Props) {
  const radius = 100;
  const strokeWidth = 20;
  const cx = 150;
  const cy = 150;

  let color = COLORS.primary;
  if (score > 70) color = COLORS.danger;
  else if (score > 30) color = COLORS.warning;

  // Simple half circle logic for gauge (stubbed simple representation)
  return (
    <View style={styles.container}>
      <Svg height="200" width="300" viewBox="0 0 300 200">
        <Path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
        />
        {/* Fill path would be dynamic based on score, this is just a placeholder */}
        <Path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx} ${cy - radius}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <SvgText
          x={cx}
          y={cy - 20}
          fontSize="40"
          fontWeight="bold"
          fill={color}
          textAnchor="middle"
        >
          {score}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  }
});
