import { ReactNode } from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { colors } from '../../constants/theme';

type AppTextProps = {
    children: ReactNode;
    style?: TextStyle;
};

export function AppText({ children, style }: AppTextProps) {
    return <Text style={[styles.text, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
    text: {
        color: colors.text,
        fontSize: 16,
    },
});