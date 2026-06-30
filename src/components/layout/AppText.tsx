import { ReactNode } from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { colors } from '../../constants/theme';

type AppTextProps = {
    children: ReactNode;
    style?: TextStyle;
};

// Wiederverwendbarer Text mit Standard-Schrift / Farbe
export function AppText({ children, style }: AppTextProps) {
    return <Text style={[styles.text, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
    text: {
        color: colors.text,
        fontFamily: "nunito-regular",
        fontSize: 16,
    },
});