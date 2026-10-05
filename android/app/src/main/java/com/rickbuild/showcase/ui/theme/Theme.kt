package com.rickbuild.showcase.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/* The website's palette (tailwind.config.ts). The app is dark-only, like the site. */
object Palette {
    val Ink = Color(0xFF0B0D12)
    val Surface = Color(0xFF141821)
    val Surface2 = Color(0xFF1B202B)
    val Line = Color(0xFF262B38)
    val Text = Color(0xFFECEEF3)
    val Muted = Color(0xFF8991A3)
    val Live = Color(0xFF4CE8B0)
    val Signal = Color(0xFFFF7A45)
}

val Mono = FontFamily.Monospace

/* Small uppercase mono labels — the site's "eyebrow" style. */
val EyebrowStyle = TextStyle(fontFamily = Mono, fontSize = 11.sp, letterSpacing = 2.2.sp, color = Palette.Muted)
val ButtonLabelStyle = TextStyle(fontFamily = Mono, fontSize = 12.sp, letterSpacing = 1.2.sp, fontWeight = FontWeight.Medium)

private val colors = darkColorScheme(
    primary = Palette.Live,
    onPrimary = Palette.Ink,
    secondary = Palette.Live,
    onSecondary = Palette.Ink,
    background = Palette.Ink,
    onBackground = Palette.Text,
    surface = Palette.Ink,
    onSurface = Palette.Text,
    surfaceVariant = Palette.Surface,
    onSurfaceVariant = Palette.Muted,
    surfaceContainer = Palette.Surface,
    surfaceContainerHigh = Palette.Surface2,
    outline = Palette.Line,
    outlineVariant = Palette.Line,
    error = Palette.Signal,
    onError = Palette.Ink,
)

private val type = Typography(
    displaySmall = TextStyle(fontSize = 34.sp, lineHeight = 38.sp, fontWeight = FontWeight.SemiBold, letterSpacing = (-0.5).sp),
    headlineMedium = TextStyle(fontSize = 28.sp, lineHeight = 32.sp, fontWeight = FontWeight.SemiBold, letterSpacing = (-0.3).sp),
    titleLarge = TextStyle(fontSize = 20.sp, lineHeight = 24.sp, fontWeight = FontWeight.SemiBold),
    titleMedium = TextStyle(fontSize = 17.sp, lineHeight = 22.sp, fontWeight = FontWeight.SemiBold),
    bodyLarge = TextStyle(fontSize = 16.sp, lineHeight = 25.sp),
    bodyMedium = TextStyle(fontSize = 14.sp, lineHeight = 21.sp),
    labelSmall = TextStyle(fontFamily = Mono, fontSize = 11.sp, letterSpacing = 1.sp),
)

@Composable
fun RickTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = colors, typography = type, content = content)
}
